// PPTX Parser — reads .pptx files and populates the SlideModel

const EMU_PER_INCH = 914400;

function emuToInches(emu) {
  return emu / EMU_PER_INCH;
}

// Namespace-safe element finder: matches by localName to avoid namespace issues
function qLocal(parent, localName) {
  return parent.querySelector(`*|${localName}`) ||
    Array.from(parent.children).find(c => c.localName === localName) || null;
}

function qLocalAll(parent, localName) {
  const results = parent.querySelectorAll(`*|${localName}`);
  if (results.length > 0) return results;
  return Array.from(parent.children).filter(c => c.localName === localName);
}

function parseColor(xmlColor) {
  if (!xmlColor) return null;

  // Direct srgbClr
  const srgb = xmlColor.querySelector('*|srgbClr') ||
    Array.from(xmlColor.getElementsByTagName('*')).find(e => e.localName === 'srgbClr');
  if (srgb) {
    let hex = '#' + srgb.getAttribute('val');
    return applyColorModifiers(hex, srgb);
  }

  // Scheme colors
  const scheme = xmlColor.querySelector('*|schemeClr') ||
    Array.from(xmlColor.getElementsByTagName('*')).find(e => e.localName === 'schemeClr');
  if (scheme) {
    const val = scheme.getAttribute('val');
    let hex = _themeColors[val] || _defaultSchemeMap[val] || '#333333';
    return applyColorModifiers(hex, scheme);
  }

  // Preset color
  const prstClr = xmlColor.querySelector('*|prstClr') ||
    Array.from(xmlColor.getElementsByTagName('*')).find(e => e.localName === 'prstClr');
  if (prstClr) {
    return prstClr.getAttribute('val') || '#000000';
  }

  return null;
}

// Static default scheme map (overridden by theme when available)
const _defaultSchemeMap = {
  'dk1': '#000000', 'dk2': '#44546A', 'lt1': '#FFFFFF', 'lt2': '#E7E6E6',
  'accent1': '#4472C4', 'accent2': '#ED7D31', 'accent3': '#A5A5A5',
  'accent4': '#FFC000', 'accent5': '#5B9BD5', 'accent6': '#70AD47',
  'hlink': '#0563C1', 'folHlink': '#954F72',
  'tx1': '#000000', 'tx2': '#44546A', 'bg1': '#FFFFFF', 'bg2': '#E7E6E6',
};

// Populated from theme XML at parse time
let _themeColors = {};
let _themeFonts = { major: 'Calibri', minor: 'Calibri' };

function hexToHsl(hex) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [h * 360, s * 100, l * 100];
}

function hslToHex(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p, q, t) => { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1/6) return p + (q - p) * 6 * t; if (t < 1/2) return q; if (t < 2/3) return p + (q - p) * (2/3 - t) * 6; return p; };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  const toHex = x => { const hex = Math.round(x * 255).toString(16); return hex.length === 1 ? '0' + hex : hex; };
  return '#' + toHex(r) + toHex(g) + toHex(b);
}

// Apply OOXML color modifiers (tint, shade, lumMod, lumOff, alpha)
function applyColorModifiers(hex, colorNode) {
  if (!colorNode || !hex) return hex;
  const mods = Array.from(colorNode.getElementsByTagName('*'));
  if (mods.length === 0) return hex;

  let [h, s, l] = hexToHsl(hex);

  for (const mod of mods) {
    const name = mod.localName;
    const val = parseInt(mod.getAttribute('val') || '0');
    const pct = val / 1000; // val is in thousandths of a percent

    if (name === 'tint') {
      // Tint: move luminance toward white
      l = l + (100 - l) * (pct / 100);
    } else if (name === 'shade') {
      // Shade: move luminance toward black
      l = l * (pct / 100);
    } else if (name === 'lumMod') {
      // Luminance modulation
      l = l * (pct / 100);
    } else if (name === 'lumOff') {
      // Luminance offset
      l = l + pct;
    } else if (name === 'satMod') {
      s = s * (pct / 100);
    } else if (name === 'satOff') {
      s = s + pct;
    }
  }

  l = Math.max(0, Math.min(100, l));
  s = Math.max(0, Math.min(100, s));
  return hslToHex(h, s, l);
}

// Parse gradient fill into a CSS gradient string
function parseGradientFill(gradFillEl) {
  if (!gradFillEl) return null;

  const allEls = Array.from(gradFillEl.getElementsByTagName('*'));
  const gsLst = allEls.find(e => e.localName === 'gsLst');
  if (!gsLst) return null;

  const stops = [];
  const gsEls = Array.from(gsLst.children).filter(e => e.localName === 'gs');
  for (const gs of gsEls) {
    const pos = parseInt(gs.getAttribute('pos') || '0') / 1000; // thousandths → percent
    const color = parseColor(gs);
    if (color) stops.push({ pos, color });
  }

  if (stops.length < 2) return stops.length === 1 ? stops[0].color : null;

  stops.sort((a, b) => a.pos - b.pos);

  // Determine direction from lin or path element
  let angle = 180; // default top-to-bottom
  let isRadial = false;
  const lin = allEls.find(e => e.localName === 'lin');
  const path = allEls.find(e => e.localName === 'path');
  if (lin) {
    const ang = parseInt(lin.getAttribute('ang') || '0');
    angle = Math.round(ang / 60000); // 60000ths of a degree → degrees
  } else if (path) {
    isRadial = true;
  }

  const cssStops = stops.map(s => `${s.color} ${s.pos}%`).join(', ');
  if (isRadial) {
    return `radial-gradient(ellipse at center, ${cssStops})`;
  }
  return `linear-gradient(${angle}deg, ${cssStops})`;
}

// Parse fill — returns { type: 'solid'|'gradient'|'none', color?, gradient? }
function parseFill(parentEl) {
  if (!parentEl) return { type: 'none' };

  // Only check DIRECT children for fill type — not deep descendants
  // This prevents finding noFill inside <ln> or nested elements
  const directChildren = Array.from(parentEl.children);

  if (directChildren.find(e => e.localName === 'noFill')) {
    return { type: 'none' };
  }

  const solidFill = directChildren.find(e => e.localName === 'solidFill');
  if (solidFill) return { type: 'solid', color: parseColor(solidFill) };

  const gradFill = directChildren.find(e => e.localName === 'gradFill');
  if (gradFill) {
    const gradient = parseGradientFill(gradFill);
    if (gradient && gradient.startsWith('linear-gradient')) {
      return { type: 'gradient', gradient };
    }
    return { type: 'solid', color: gradient }; // fallback single color
  }

  const blipFill = directChildren.find(e => e.localName === 'blipFill');
  if (blipFill) {
    // Image fill — we can't fully resolve here but mark it
    return { type: 'image' };
  }

  const pattFill = directChildren.find(e => e.localName === 'pattFill');
  if (pattFill) {
    // Pattern fill — use foreground color as approximation
    const fgClr = Array.from(pattFill.getElementsByTagName('*')).find(e => e.localName === 'fgClr');
    if (fgClr) return { type: 'solid', color: parseColor(fgClr) };
  }

  return { type: 'unset' }; // no explicit fill — may inherit
}

// Simple wrapper: returns color/gradient string or null
function parseFillColor(parentEl) {
  const fill = parseFill(parentEl);
  if (fill.type === 'solid') return fill.color;
  if (fill.type === 'gradient') return fill.gradient;
  return null;
}

// Read theme colors from theme XML
async function readThemeColors(zip) {
  const themeFile = zip.file('ppt/theme/theme1.xml');
  if (!themeFile) return;

  const xml = await themeFile.async('text');
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const allEls = Array.from(doc.getElementsByTagName('*'));

  // Find clrScheme
  const clrScheme = allEls.find(e => e.localName === 'clrScheme');
  if (!clrScheme) return;

  const colorNames = ['dk1', 'dk2', 'lt1', 'lt2', 'accent1', 'accent2', 'accent3', 'accent4', 'accent5', 'accent6', 'hlink', 'folHlink'];
  for (const name of colorNames) {
    const el = Array.from(clrScheme.children).find(e => e.localName === name);
    if (el) {
      const srgb = Array.from(el.getElementsByTagName('*')).find(e => e.localName === 'srgbClr');
      const sys = Array.from(el.getElementsByTagName('*')).find(e => e.localName === 'sysClr');
      if (srgb) _themeColors[name] = '#' + srgb.getAttribute('val');
      else if (sys) _themeColors[name] = '#' + (sys.getAttribute('lastClr') || sys.getAttribute('val') || '000000');
    }
  }
  // Map aliases
  _themeColors['tx1'] = _themeColors['dk1'] || '#000000';
  _themeColors['tx2'] = _themeColors['dk2'] || '#44546A';
  _themeColors['bg1'] = _themeColors['lt1'] || '#FFFFFF';
  _themeColors['bg2'] = _themeColors['lt2'] || '#E7E6E6';

  // Read theme fonts
  const fontScheme = allEls.find(e => e.localName === 'fontScheme');
  if (fontScheme) {
    const majorFont = Array.from(fontScheme.getElementsByTagName('*')).find(e => e.localName === 'majorFont');
    const minorFont = Array.from(fontScheme.getElementsByTagName('*')).find(e => e.localName === 'minorFont');
    if (majorFont) {
      const latin = Array.from(majorFont.getElementsByTagName('*')).find(e => e.localName === 'latin');
      if (latin) _themeFonts.major = latin.getAttribute('typeface') || 'Calibri';
    }
    if (minorFont) {
      const latin = Array.from(minorFont.getElementsByTagName('*')).find(e => e.localName === 'latin');
      if (latin) _themeFonts.minor = latin.getAttribute('typeface') || 'Calibri';
    }
  }
}

function getTextFromRuns(txBody) {
  if (!txBody) return { text: '', style: {} };

  const allEls = Array.from(txBody.getElementsByTagName('*'));
  const paragraphs = allEls.filter(e => e.localName === 'p' && e.parentNode === txBody);

  let fullText = '';
  // Default to 14pt — closer to PowerPoint's typical body text defaults
  let style = { fontSize: 14, fontFace: _themeFonts.minor || 'Calibri', color: _themeColors['tx1'] || '#000000', bold: false, italic: false, align: 'left' };
  let firstRun = true;

  // Check list style / default paragraph properties for font size
  const lstStyle = allEls.find(e => e.localName === 'lstStyle' && e.parentNode === txBody);
  if (lstStyle) {
    const lvl1pPr = Array.from(lstStyle.getElementsByTagName('*')).find(e => e.localName === 'lvl1pPr');
    if (lvl1pPr) {
      const defRPr = Array.from(lvl1pPr.getElementsByTagName('*')).find(e => e.localName === 'defRPr');
      if (defRPr) {
        const sz = defRPr.getAttribute('sz');
        if (sz) style.fontSize = parseInt(sz) / 100;
      }
    }
  }

  // Check bodyPr for text properties
  const bodyPr = allEls.find(e => e.localName === 'bodyPr' && e.parentNode === txBody);

  for (const p of paragraphs) {
    const pChildren = Array.from(p.getElementsByTagName('*'));

    // Paragraph alignment
    const pPr = pChildren.find(e => e.localName === 'pPr' && e.parentNode === p);
    if (pPr && firstRun) {
      const algn = pPr.getAttribute('algn');
      if (algn) {
        const alignMap = { 'l': 'left', 'ctr': 'center', 'r': 'right', 'just': 'justify' };
        style.align = alignMap[algn] || 'left';
      }
      // Default run properties
      const defRPr = pChildren.find(e => e.localName === 'defRPr');
      if (defRPr) {
        const sz = defRPr.getAttribute('sz');
        if (sz) style.fontSize = parseInt(sz) / 100;
      }
    }

    const runs = pChildren.filter(e => e.localName === 'r' && e.parentNode === p);
    for (const r of runs) {
      const rChildren = Array.from(r.getElementsByTagName('*'));
      const t = rChildren.find(e => e.localName === 't');
      if (t) fullText += t.textContent;

      if (firstRun) {
        const rPr = rChildren.find(e => e.localName === 'rPr' && e.parentNode === r);
        if (rPr) {
          const sz = rPr.getAttribute('sz');
          if (sz) style.fontSize = parseInt(sz) / 100;

          const b = rPr.getAttribute('b');
          if (b === '1' || b === 'true') style.bold = true;

          const i = rPr.getAttribute('i');
          if (i === '1' || i === 'true') style.italic = true;

          const rPrChildren = Array.from(rPr.getElementsByTagName('*'));
          const solidFill = rPrChildren.find(e => e.localName === 'solidFill');
          if (solidFill) {
            const c = parseColor(solidFill);
            if (c) style.color = c;
          }

          const latin = rPrChildren.find(e => e.localName === 'latin');
          if (latin) {
            const typeface = latin.getAttribute('typeface');
            if (typeface === '+mj-lt') style.fontFace = _themeFonts.major;
            else if (typeface === '+mn-lt') style.fontFace = _themeFonts.minor;
            else if (typeface) style.fontFace = typeface;
          }
        }
        firstRun = false;
      }
    }

    // Handle <a:fld> fields (e.g., slide numbers, dates)
    const fields = pChildren.filter(e => e.localName === 'fld' && e.parentNode === p);
    for (const fld of fields) {
      const t = Array.from(fld.getElementsByTagName('*')).find(e => e.localName === 't');
      if (t) fullText += t.textContent;
    }

    fullText += '\n';
  }

  return { text: fullText.trimEnd(), style };
}

// Read actual slide dimensions from presentation.xml
async function readSlideSize(zip) {
  const presFile = zip.file('ppt/presentation.xml');
  if (!presFile) return { widthInches: 10, heightInches: 5.625 };

  const xml = await presFile.async('text');
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const allEls = Array.from(doc.getElementsByTagName('*'));
  const sldSz = allEls.find(e => e.localName === 'sldSz');

  if (sldSz) {
    const cx = parseInt(sldSz.getAttribute('cx') || '0');
    const cy = parseInt(sldSz.getAttribute('cy') || '0');
    if (cx > 0 && cy > 0) {
      return { widthInches: emuToInches(cx), heightInches: emuToInches(cy) };
    }
  }
  return { widthInches: 10, heightInches: 5.625 };
}

// Try to resolve background from slide layout and slide master
async function resolveBackground(zip, slideNum, slideSize) {
  const relsPath = `ppt/slides/_rels/slide${slideNum}.xml.rels`;
  const relsFile = zip.file(relsPath);
  if (!relsFile) return { bg: null, bgElements: [] };

  const relsXml = await relsFile.async('text');
  const relsDoc = new DOMParser().parseFromString(relsXml, 'application/xml');
  const rels = Array.from(relsDoc.getElementsByTagName('*')).filter(e => e.localName === 'Relationship');

  let layoutPath = null;
  for (const rel of rels) {
    const type = rel.getAttribute('Type') || '';
    if (type.includes('slideLayout')) {
      let target = rel.getAttribute('Target');
      if (target.startsWith('../')) target = 'ppt/' + target.slice(3);
      layoutPath = target;
      break;
    }
  }

  if (!layoutPath) return { bg: null, bgElements: [] };

  const layoutFile = zip.file(layoutPath);
  if (!layoutFile) return { bg: null, bgElements: [] };

  const layoutXml = await layoutFile.async('text');
  const layoutDoc = new DOMParser().parseFromString(layoutXml, 'application/xml');

  // Check layout bg
  let bg = findBackgroundColor(layoutDoc);

  // Collect layout background shapes (large shapes that cover most of the slide)
  let bgElements = extractBackgroundShapes(layoutDoc, slideSize);

  if (!bg) {
    // Try slide master via layout rels
    const layoutName = layoutPath.split('/').pop();
    const layoutDir = layoutPath.substring(0, layoutPath.lastIndexOf('/'));
    const masterRelsPath = `${layoutDir}/_rels/${layoutName}.rels`;
    const masterRelsFile = zip.file(masterRelsPath);
    if (masterRelsFile) {
      const masterRelsXml = await masterRelsFile.async('text');
      const masterRelsDoc = new DOMParser().parseFromString(masterRelsXml, 'application/xml');
      const masterRels = Array.from(masterRelsDoc.getElementsByTagName('*')).filter(e => e.localName === 'Relationship');
      for (const rel of masterRels) {
        const type = rel.getAttribute('Type') || '';
        if (type.includes('slideMaster')) {
          let target = rel.getAttribute('Target');
          if (target.startsWith('../')) target = 'ppt/' + target.slice(3);
          const masterFile = zip.file(target);
          if (masterFile) {
            const masterXml = await masterFile.async('text');
            const masterDoc = new DOMParser().parseFromString(masterXml, 'application/xml');
            if (!bg) bg = findBackgroundColor(masterDoc);
            if (bgElements.length === 0) {
              bgElements = extractBackgroundShapes(masterDoc, slideSize);
            }
          }
          break;
        }
      }
    }
  }

  return { bg, bgElements };
}

// Extract large shapes from layout/master that act as visual backgrounds
function extractBackgroundShapes(doc, slideSize) {
  const elements = [];
  const allEls = Array.from(doc.getElementsByTagName('*'));
  const spTree = allEls.find(e => e.localName === 'spTree');
  if (!spTree) return elements;

  const slideW = slideSize.widthInches;
  const slideH = slideSize.heightInches;

  for (const child of spTree.children) {
    if (child.localName !== 'sp') continue;

    const el = parseShapeElement(child);
    if (!el) continue;

    // Include shapes that cover a significant portion of the slide (>50% area)
    const shapeArea = el.w * el.h;
    const slideArea = slideW * slideH;
    if (shapeArea > slideArea * 0.3 && el.shapeStyle.fill !== 'transparent') {
      elements.push(el);
    }
  }

  return elements;
}

function findBackgroundColor(doc) {
  const allEls = Array.from(doc.getElementsByTagName('*'));

  const bg = allEls.find(e => e.localName === 'bg');
  if (!bg) return null;

  const bgChildren = Array.from(bg.getElementsByTagName('*'));

  // bgPr — direct background properties
  const bgPr = bgChildren.find(e => e.localName === 'bgPr');
  if (bgPr) {
    const fill = parseFill(bgPr);
    if (fill.type === 'solid') return fill.color;
    if (fill.type === 'gradient') return fill.gradient;
    if (fill.type === 'none') return null;
  }

  // bgRef — style reference for background
  const bgRef = bgChildren.find(e => e.localName === 'bgRef');
  if (bgRef) {
    const idx = bgRef.getAttribute('idx');
    // idx > 1000 means use theme fill effect; try to extract color
    const c = parseColor(bgRef);
    if (c) return c;
  }

  return null;
}

async function parsePptx(file, model) {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  model.clear();

  // Read theme colors before parsing slides
  _themeColors = {};
  _themeFonts = { major: 'Calibri', minor: 'Calibri' };
  await readThemeColors(zip);

  // Read actual slide dimensions
  const slideSize = await readSlideSize(zip);
  model.slideWidth = slideSize.widthInches;
  model.slideHeight = slideSize.heightInches;

  // Find slide files and sort them
  const slideFiles = [];
  zip.forEach((path, entry) => {
    const match = path.match(/^ppt\/slides\/slide(\d+)\.xml$/);
    if (match) {
      slideFiles.push({ path, num: parseInt(match[1]), entry });
    }
  });
  slideFiles.sort((a, b) => a.num - b.num);

  // Extract media files for image references
  const mediaFiles = {};
  const mediaPromises = [];
  zip.forEach((path, entry) => {
    if (path.startsWith('ppt/media/')) {
      mediaPromises.push(
        entry.async('base64').then(data => {
          const ext = path.split('.').pop().toLowerCase();
          const mimeMap = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', svg: 'image/svg+xml', bmp: 'image/bmp', emf: 'image/emf', wmf: 'image/wmf', tiff: 'image/tiff', tif: 'image/tiff' };
          const mime = mimeMap[ext] || 'image/png';
          mediaFiles[path] = `data:${mime};base64,${data}`;
        })
      );
    }
  });
  await Promise.all(mediaPromises);

  // Parse each slide
  for (const sf of slideFiles) {
    const xmlStr = await sf.entry.async('text');
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlStr, 'application/xml');

    const slide = {
      background: { color: '#FFFFFF', image: null },
      elements: [],
      notes: '',
      layoutXml: null,
    };

    // Parse background — check slide first, then layout/master
    const bgColor = findBackgroundColor(doc);
    if (bgColor) {
      slide.background.color = bgColor;
    } else {
      const { bg, bgElements } = await resolveBackground(zip, sf.num, slideSize);
      if (bg) slide.background.color = bg;
      // Insert master/layout background shapes behind slide content
      if (bgElements.length > 0) {
        slide.elements.push(...bgElements);
      }
    }

    // Parse all elements from spTree in document order (preserves z-order)
    const allEls = Array.from(doc.getElementsByTagName('*'));
    const spTree = allEls.find(e => e.localName === 'spTree');
    if (spTree) {
      const elements = await parseSpTree(spTree, zip, mediaFiles, sf.num);
      slide.elements.push(...elements); // append after any background elements
    }

    // Parse speaker notes
    const notesRelsPath = `ppt/slides/_rels/slide${sf.num}.xml.rels`;
    const notesRelsFile = zip.file(notesRelsPath);
    if (notesRelsFile) {
      const relsXml = await notesRelsFile.async('text');
      const relsDoc = new DOMParser().parseFromString(relsXml, 'application/xml');
      const rels = Array.from(relsDoc.getElementsByTagName('*')).filter(e => e.localName === 'Relationship');
      for (const rel of rels) {
        const type = rel.getAttribute('Type') || '';
        if (type.includes('notesSlide')) {
          let target = rel.getAttribute('Target');
          if (target.startsWith('../')) target = 'ppt/' + target.slice(3);
          else if (!target.startsWith('ppt/')) target = 'ppt/slides/' + target;
          const notesFile = zip.file(target);
          if (notesFile) {
            const notesXml = await notesFile.async('text');
            const notesDoc = new DOMParser().parseFromString(notesXml, 'application/xml');
            // Extract text from the notes body (skip slide image placeholder)
            const spList = Array.from(notesDoc.getElementsByTagName('*')).filter(e => e.localName === 'sp');
            const textParts = [];
            for (const sp of spList) {
              const phEl = Array.from(sp.getElementsByTagName('*')).find(e => e.localName === 'ph');
              const phType = phEl ? (phEl.getAttribute('type') || '') : '';
              if (phType === 'sldImg') continue; // skip slide image placeholder
              const paragraphs = Array.from(sp.getElementsByTagName('*')).filter(e => e.localName === 'p');
              for (const p of paragraphs) {
                const runs = Array.from(p.getElementsByTagName('*')).filter(e => e.localName === 'r');
                const line = runs.map(r => {
                  const t = Array.from(r.getElementsByTagName('*')).find(e => e.localName === 't');
                  return t ? t.textContent : '';
                }).join('');
                if (line) textParts.push(line);
              }
            }
            slide.notes = textParts.join('\n');
          }
          break;
        }
      }
    }

    model.addSlide(slide);
  }

  return model;
}

// Parse the shape tree in document order to preserve z-ordering
async function parseSpTree(spTree, zip, mediaFiles, slideNum) {
  const elements = [];

  for (const child of spTree.children) {
    const tag = child.localName;
    if (tag === 'sp') {
      const el = parseShapeElement(child);
      if (el) elements.push(el);
    } else if (tag === 'pic') {
      const el = await parsePicElement(child, zip, mediaFiles, slideNum);
      if (el) elements.push(el);
    } else if (tag === 'grpSp') {
      // Recursively parse group shapes
      const groupEls = await parseGroupShape(child, zip, mediaFiles, slideNum);
      elements.push(...groupEls);
    } else if (tag === 'cxnSp') {
      // Connection shapes (lines/arrows) — parse as basic shapes
      const el = parseConnectorShape(child);
      if (el) elements.push(el);
    }
  }

  return elements;
}

function parseGroupShape(grpSp, zip, mediaFiles, slideNum) {
  // Get group transform for coordinate remapping
  const allEls = Array.from(grpSp.getElementsByTagName('*'));
  const grpSpPr = allEls.find(e => e.localName === 'grpSpPr' && e.parentNode === grpSp);

  let offsetX = 0, offsetY = 0, scaleX = 1, scaleY = 1;

  if (grpSpPr) {
    const xfrm = Array.from(grpSpPr.getElementsByTagName('*')).find(e => e.localName === 'xfrm');
    if (xfrm) {
      const xfrmEls = Array.from(xfrm.getElementsByTagName('*'));
      const off = xfrmEls.find(e => e.localName === 'off' && e.parentNode === xfrm);
      const ext = xfrmEls.find(e => e.localName === 'ext' && e.parentNode === xfrm);
      const chOff = xfrmEls.find(e => e.localName === 'chOff' && e.parentNode === xfrm);
      const chExt = xfrmEls.find(e => e.localName === 'chExt' && e.parentNode === xfrm);

      if (off && ext && chOff && chExt) {
        const groupX = parseInt(off.getAttribute('x') || '0');
        const groupY = parseInt(off.getAttribute('y') || '0');
        const groupW = parseInt(ext.getAttribute('cx') || '1');
        const groupH = parseInt(ext.getAttribute('cy') || '1');
        const childX = parseInt(chOff.getAttribute('x') || '0');
        const childY = parseInt(chOff.getAttribute('y') || '0');
        const childW = parseInt(chExt.getAttribute('cx') || '1');
        const childH = parseInt(chExt.getAttribute('cy') || '1');

        offsetX = groupX - childX;
        offsetY = groupY - childY;
        scaleX = groupW / childW;
        scaleY = groupH / childH;
      }
    }
  }

  // Parse children of the group
  const elements = [];
  for (const child of grpSp.children) {
    const tag = child.localName;
    if (tag === 'sp') {
      const el = parseShapeElement(child);
      if (el) {
        // Remap coordinates from group space to slide space
        el.x = emuToInches(offsetX) + el.x * scaleX;
        el.y = emuToInches(offsetY) + el.y * scaleY;
        el.w = el.w * scaleX;
        el.h = el.h * scaleY;
        elements.push(el);
      }
    } else if (tag === 'pic') {
      const el = parsePicElement(child, zip, mediaFiles, slideNum);
      if (el) {
        el.x = emuToInches(offsetX) + el.x * scaleX;
        el.y = emuToInches(offsetY) + el.y * scaleY;
        el.w = el.w * scaleX;
        el.h = el.h * scaleY;
        elements.push(el);
      }
    }
  }

  return elements;
}

function parseConnectorShape(cxnSp) {
  const allEls = Array.from(cxnSp.getElementsByTagName('*'));
  const spPr = allEls.find(e => e.localName === 'spPr' && e.parentNode === cxnSp);
  if (!spPr) return null;

  const spPrEls = Array.from(spPr.getElementsByTagName('*'));
  const xfrm = spPrEls.find(e => e.localName === 'xfrm' && e.parentNode === spPr);
  if (!xfrm) return null;
  const xfrmEls = Array.from(xfrm.getElementsByTagName('*'));
  const off = xfrmEls.find(e => e.localName === 'off');
  const ext = xfrmEls.find(e => e.localName === 'ext');
  if (!off || !ext) return null;

  const x = emuToInches(parseInt(off.getAttribute('x') || '0'));
  const y = emuToInches(parseInt(off.getAttribute('y') || '0'));
  const w = emuToInches(parseInt(ext.getAttribute('cx') || '0'));
  const h = emuToInches(parseInt(ext.getAttribute('cy') || '0'));

  if (w < 0.01 && h < 0.01) return null;

  // Get line color
  const ln = spPrEls.find(e => e.localName === 'ln');
  let borderColor = '#000000';
  let borderWidth = 1;
  if (ln) {
    const c = parseFillColor(ln);
    if (c) borderColor = c;
    const lnW = ln.getAttribute('w');
    if (lnW) borderWidth = Math.max(1, Math.round(emuToInches(parseInt(lnW)) * 96));
  }

  return {
    id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: 'shape',
    shape: 'rect',
    x, y,
    w: Math.max(w, 0.02),
    h: Math.max(h, 0.02),
    content: '',
    rotation: 0,
    style: { fontSize: 18, fontFace: 'Arial', color: '#000000', bold: false, italic: false, align: 'left' },
    shapeStyle: { fill: 'transparent', borderColor, borderWidth },
  };
}

function parseShapeElement(sp) {
  const allEls = Array.from(sp.getElementsByTagName('*'));
  const spPr = allEls.find(e => e.localName === 'spPr' && e.parentNode === sp);
  if (!spPr) return null;

  const spPrEls = Array.from(spPr.getElementsByTagName('*'));

  // Position and size — find xfrm first, then off/ext inside it
  const xfrm = spPrEls.find(e => e.localName === 'xfrm');
  let off, ext;
  if (xfrm) {
    const xfrmEls = Array.from(xfrm.getElementsByTagName('*'));
    off = xfrmEls.find(e => e.localName === 'off');
    ext = xfrmEls.find(e => e.localName === 'ext');
  } else {
    off = spPrEls.find(e => e.localName === 'off');
    ext = spPrEls.find(e => e.localName === 'ext');
  }
  if (!off || !ext) return null;

  const x = emuToInches(parseInt(off.getAttribute('x') || '0'));
  const y = emuToInches(parseInt(off.getAttribute('y') || '0'));
  const w = emuToInches(parseInt(ext.getAttribute('cx') || '0'));
  const h = emuToInches(parseInt(ext.getAttribute('cy') || '0'));

  if (w < 0.05 || h < 0.05) return null;

  // Get text content
  const txBody = allEls.find(e => e.localName === 'txBody' && e.parentNode === sp);
  const { text, style } = getTextFromRuns(txBody);

  // Determine shape geometry
  const prstGeom = spPrEls.find(e => e.localName === 'prstGeom');
  const geomType = prstGeom ? prstGeom.getAttribute('prst') : null;

  // Determine fill from spPr
  const spPrFill = parseFill(spPr);
  const hasExplicitNoFill = spPrFill.type === 'none';
  const fillColor = (spPrFill.type === 'solid') ? spPrFill.color :
                    (spPrFill.type === 'gradient') ? spPrFill.gradient : null;

  // Only check style-based fill if spPr didn't explicitly set noFill or a fill
  const styleEl = allEls.find(e => e.localName === 'style' && e.parentNode === sp);
  let styleFillColor = null;
  if (styleEl && !fillColor && !hasExplicitNoFill) {
    const fillRef = Array.from(styleEl.getElementsByTagName('*')).find(e => e.localName === 'fillRef');
    if (fillRef) {
      const idx = fillRef.getAttribute('idx');
      if (idx && idx !== '0') { // idx="0" means no fill
        styleFillColor = parseColor(fillRef);
      }
    }
  }

  const effectiveFill = fillColor || styleFillColor;

  let type = 'text';
  let shape = null;
  const shapeStyle = { fill: 'transparent', borderColor: 'transparent', borderWidth: 0 };

  // Classify: if it has a fill or is a non-rect geometry, it's a shape
  const shapeMap = { 'ellipse': 'ellipse', 'roundRect': 'roundRect', 'rect': 'rect',
    'triangle': 'rect', 'diamond': 'rect', 'pentagon': 'rect', 'hexagon': 'rect',
    'parallelogram': 'rect', 'trapezoid': 'rect', 'chevron': 'rect',
    'snip1Rect': 'rect', 'snip2SameRect': 'rect', 'round1Rect': 'roundRect',
    'round2SameRect': 'roundRect' };

  if (effectiveFill) {
    type = 'shape';
    shape = (geomType && shapeMap[geomType]) ? shapeMap[geomType] : 'rect';
    if (geomType === 'ellipse') shape = 'ellipse';
    shapeStyle.fill = effectiveFill;
  } else if (geomType && geomType !== 'rect') {
    type = 'shape';
    shape = shapeMap[geomType] || 'rect';
  }

  // Border/line
  const ln = spPrEls.find(e => e.localName === 'ln');
  if (ln) {
    const lnFill = parseFill(ln);
    if (lnFill.type === 'solid' && lnFill.color) {
      shapeStyle.borderColor = lnFill.color;
    } else if (lnFill.type === 'none') {
      shapeStyle.borderColor = 'transparent';
      shapeStyle.borderWidth = 0;
    } else if (lnFill.type === 'unset') {
      // ln exists with no explicit fill — line is visible with default/theme color
      shapeStyle.borderColor = _themeColors['dk1'] || '#000000';
    }
    const lnW = ln.getAttribute('w');
    if (lnW && shapeStyle.borderColor !== 'transparent') {
      shapeStyle.borderWidth = Math.max(1, Math.round(emuToInches(parseInt(lnW)) * 96));
    } else if (!lnW && shapeStyle.borderColor !== 'transparent') {
      shapeStyle.borderWidth = 1; // default 1px when ln exists but no width
    }
  }

  // Also check style-based line if no explicit line
  if (!ln && styleEl) {
    const lnRef = Array.from(styleEl.getElementsByTagName('*')).find(e => e.localName === 'lnRef');
    if (lnRef) {
      const idx = lnRef.getAttribute('idx');
      if (idx && idx !== '0') {
        const lnColor = parseColor(lnRef);
        if (lnColor) {
          shapeStyle.borderColor = lnColor;
          shapeStyle.borderWidth = Math.max(1, parseInt(idx));
        }
      }
    }
  }

  // Promote to shape if it has a visible border (even with no fill)
  // This ensures border-only rectangles over content are rendered
  if (type === 'text' && shapeStyle.borderWidth > 0 && shapeStyle.borderColor !== 'transparent') {
    type = 'shape';
    shape = (geomType && shapeMap[geomType]) ? shapeMap[geomType] : 'rect';
    if (geomType === 'ellipse') shape = 'ellipse';
  }

  return {
    id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    x, y, w, h,
    content: text,
    rotation: 0,
    style,
    shape,
    shapeStyle,
  };
}

async function parsePicElement(pic, zip, mediaFiles, slideNum) {
  const allEls = Array.from(pic.getElementsByTagName('*'));
  const spPr = allEls.find(e => e.localName === 'spPr' && e.parentNode === pic);
  if (!spPr) return null;

  const spPrEls = Array.from(spPr.getElementsByTagName('*'));
  const xfrm = spPrEls.find(e => e.localName === 'xfrm');
  let off, ext;
  if (xfrm) {
    const xfrmEls = Array.from(xfrm.getElementsByTagName('*'));
    off = xfrmEls.find(e => e.localName === 'off');
    ext = xfrmEls.find(e => e.localName === 'ext');
  } else {
    off = spPrEls.find(e => e.localName === 'off');
    ext = spPrEls.find(e => e.localName === 'ext');
  }
  if (!off || !ext) return null;

  const x = emuToInches(parseInt(off.getAttribute('x') || '0'));
  const y = emuToInches(parseInt(off.getAttribute('y') || '0'));
  const w = emuToInches(parseInt(ext.getAttribute('cx') || '0'));
  const h = emuToInches(parseInt(ext.getAttribute('cy') || '0'));

  // Get image reference via relationship
  const blipFill = allEls.find(e => e.localName === 'blipFill');
  if (!blipFill) return null;
  const blip = Array.from(blipFill.getElementsByTagName('*')).find(e => e.localName === 'blip');
  if (!blip) return null;

  const rEmbed = blip.getAttribute('r:embed') ||
    blip.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'embed');
  if (!rEmbed) return null;

  // Read the slide's rels file to resolve the image path
  const relsPath = `ppt/slides/_rels/slide${slideNum}.xml.rels`;
  const relsFile = zip.file(relsPath);
  let imageDataUrl = null;

  if (relsFile) {
    const relsXml = await relsFile.async('text');
    const relsDoc = new DOMParser().parseFromString(relsXml, 'application/xml');
    const rels = Array.from(relsDoc.getElementsByTagName('*')).filter(e => e.localName === 'Relationship');
    for (const rel of rels) {
      if (rel.getAttribute('Id') === rEmbed) {
        let target = rel.getAttribute('Target');
        if (target.startsWith('../')) target = 'ppt/' + target.slice(3);
        else if (!target.startsWith('ppt/')) target = 'ppt/slides/' + target;
        imageDataUrl = mediaFiles[target] || null;
        break;
      }
    }
  }

  return {
    id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: 'image',
    x, y, w, h,
    content: imageDataUrl || '',
    rotation: 0,
    style: { fontSize: 18, fontFace: 'Arial', color: '#000000', bold: false, italic: false, align: 'left' },
    shape: null,
    shapeStyle: { fill: 'transparent', borderColor: 'transparent', borderWidth: 0 },
  };
}

export { parsePptx };
