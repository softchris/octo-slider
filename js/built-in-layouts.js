// Built-in slide templates that ship with the app — organized by theme

function el(id, type, x, y, w, h, content, styleOverrides = {}, extras = {}) {
  return {
    id: `builtin-${id}`,
    type,
    x, y, w, h,
    content,
    rotation: 0,
    style: {
      fontSize: 24, fontFace: 'Arial', color: '#333333', backgroundColor: 'transparent',
      bold: false, italic: false, align: 'left', listType: 'none', lineSpacing: 1.2,
      ...styleOverrides,
    },
    shape: extras.shape || null,
    shapeStyle: { fill: '#4472C4', borderColor: '#2F5496', borderWidth: 1, ...(extras.shapeStyle || {}) },
    shadow: { type: 'none', color: '#000000', opacity: 0.4, blur: 8, offsetX: 4, offsetY: 4, ...(extras.shadow || {}) },
    groupId: null,
    ...extras,
  };
}

function slide(bg, elements) {
  return { background: { color: bg, image: null }, elements, notes: '', layoutXml: null };
}

function layout(id, theme, slideType, name, slideData) {
  return { id: `builtin-${id}`, theme, slideType, name, builtIn: true, slide: slideData };
}

function tableEl(id, x, y, w, h, cells, tableStyle) {
  return {
    id: `builtin-${id}`, type: 'table', x, y, w, h, content: '', rotation: 0,
    style: { fontSize: 24, fontFace: 'Arial', color: '#333333', backgroundColor: 'transparent', bold: false, italic: false, align: 'left', listType: 'none', lineSpacing: 1.2 },
    shape: null, shapeStyle: { fill: '#4472C4', borderColor: '#2F5496', borderWidth: 1 },
    shadow: { type: 'none', color: '#000000', opacity: 0.4, blur: 8, offsetX: 4, offsetY: 4 },
    groupId: null,
    tableData: { cells, headerRow: true },
    tableStyle,
  };
}

// Build an SVG data URL for an icon (inline, no external deps)
function svgDataUrl(path, color, stroke = true) {
  const attr = stroke
    ? `stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"`
    : `fill="${color}" stroke="none"`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="256" height="256" ${attr}><path d="${path}"/></svg>`;
  return 'data:image/svg+xml;base64,' + btoa(svg);
}

// Commonly used icon paths
const ICONS = {
  lightbulb:  { path: 'M9 21h6m-6-3h6a7 7 0 10-6 0zM10 17v-2.5a3.5 3.5 0 01.67-2.06L12 11l1.33 1.44A3.5 3.5 0 0114 14.5V17', stroke: true },
  target:     { path: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 18a6 6 0 100-12 6 6 0 000 12zM12 14a2 2 0 100-4 2 2 0 000 4z', stroke: true },
  trending:   { path: 'M23 6l-9.5 9.5-5-5L1 18m22-12h-6v6', stroke: true },
  users:      { path: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m22 0v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M12 7a4 4 0 11-8 0 4 4 0 018 0z', stroke: true },
  shield:     { path: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', stroke: true },
  globe:      { path: 'M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z', stroke: true },
  zap:        { path: 'M13 2L3 14h9l-1 10 10-12h-9l1-10z', stroke: false },
  chart:      { path: 'M18 20V10M12 20V4M6 20v-6', stroke: true },
  checkmark:  { path: 'M20 6L9 17l-5-5', stroke: true },
  star:       { path: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', stroke: false },
  heart:      { path: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z', stroke: false },
  code:       { path: 'M16 18l6-6-6-6M8 6l-6 6 6 6', stroke: true },
  play:       { path: 'M5 3l14 9-14 9V3z', stroke: false },
  terminal:   { path: 'M4 17l6-5-6-5M12 19h8', stroke: true },
};

function iconEl(id, x, y, size, icon, color) {
  const dataUrl = svgDataUrl(icon.path, color, icon.stroke);
  return el(id, 'image', x, y, size, size, dataUrl, {}, {
    cropShape: 'none',
    iconData: { name: id, path: icon.path, stroke: icon.stroke, color },
  });
}

function ovalEl(id, x, y, size, fill, borderColor) {
  return el(id, 'shape', x, y, size, size, '', {}, {
    shape: 'ellipse',
    shapeStyle: { fill, borderColor: borderColor || 'transparent', borderWidth: 0 },
  });
}

// ╔══════════════════════════════════════════════════════════════╗
// ║  MIDNIGHT — Dark navy with crimson accents                  ║
// ╚══════════════════════════════════════════════════════════════╝
const MN = { // Midnight palette
  bg: '#1a1a2e', card: '#16213e', border: '#0f3460',
  accent: '#e94560', accent2: '#4cc9f0', accent3: '#7bed9f',
  text: '#FFFFFF', sub: '#8b8fa3', muted: '#555577',
  font: 'Segoe UI', code: '#0d1117', codeBg: '#161b22',
};

const midnight = [
  layout('mn-title', 'Midnight', 'Title', 'Title Slide', slide(MN.bg, [
    el('mn-t-title', 'text', 1.5, 2.2, 10.3, 1.5, 'Your Presentation Title',
      { fontSize: 48, fontFace: MN.font, color: MN.text, bold: true, align: 'center' }),
    el('mn-t-sub', 'text', 2.5, 4.0, 8.3, 0.8, 'Subtitle goes here — click to edit',
      { fontSize: 22, fontFace: MN.font, color: MN.sub, align: 'center' }),
    el('mn-t-line', 'line', 4.0, 3.9, 5.3, 0, '', {}, { x1: 0, y1: 0, x2: 5.3, y2: 0, lineStyle: { color: MN.accent, width: 3 } }),
    el('mn-t-date', 'text', 4.5, 5.5, 4.3, 0.5, 'Your Name  |  Date',
      { fontSize: 14, fontFace: MN.font, color: MN.muted, align: 'center' }),
  ])),

  layout('mn-section', 'Midnight', 'Section', 'Section Divider', slide(MN.border, [
    el('mn-s-num', 'text', 1.0, 1.0, 2.0, 2.0, '01',
      { fontSize: 80, fontFace: MN.font, color: MN.accent, bold: true, align: 'left' }),
    el('mn-s-title', 'text', 1.0, 3.2, 8.0, 1.2, 'Section Title',
      { fontSize: 44, fontFace: MN.font, color: MN.text, bold: true, align: 'left' }),
    el('mn-s-line', 'line', 1.0, 4.6, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: MN.accent, width: 4 } }),
    el('mn-s-desc', 'text', 1.0, 5.0, 6.0, 0.8, 'Brief description of what this section covers',
      { fontSize: 18, fontFace: MN.font, color: MN.sub, align: 'left' }),
  ])),

  layout('mn-agenda', 'Midnight', 'Agenda', 'Agenda', slide(MN.bg, [
    el('mn-a-title', 'text', 0.8, 0.4, 5.0, 0.9, 'Agenda',
      { fontSize: 36, fontFace: MN.font, color: MN.text, bold: true, align: 'left' }),
    el('mn-a-bar', 'shape', 0.8, 1.3, 0.15, 5.5, '', {},
      { shape: 'rect', shapeStyle: { fill: MN.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('mn-a-list', 'text', 1.3, 1.5, 10.5, 5.0, 'Introduction & Context\nProblem Statement\nProposed Solution\nDemo / Walkthrough\nTimeline & Next Steps\nQ & A',
      { fontSize: 24, fontFace: MN.font, color: MN.text, align: 'left', listType: 'numbered', lineSpacing: 2.0 }),
  ])),

  layout('mn-bullets', 'Midnight', 'Bullets', 'Bullet Points', slide(MN.bg, [
    el('mn-b-title', 'text', 0.8, 0.4, 11.5, 0.9, 'Key Takeaways',
      { fontSize: 36, fontFace: MN.font, color: MN.text, bold: true, align: 'left' }),
    el('mn-b-line', 'line', 0.8, 1.4, 11.5, 0, '', {}, { x1: 0, y1: 0, x2: 11.5, y2: 0, lineStyle: { color: MN.accent, width: 2 } }),
    el('mn-b-list', 'text', 1.0, 1.8, 10.5, 4.5, 'First important point goes here\nSecond point with more detail\nThird point to round things out\nAdd more as needed',
      { fontSize: 22, fontFace: MN.font, color: MN.sub, align: 'left', listType: 'bullet', lineSpacing: 1.8 }),
  ])),

  layout('mn-code', 'Midnight', 'Code', 'Code Showcase', slide(MN.code, [
    el('mn-c-title', 'text', 0.8, 0.3, 8.0, 0.8, '// Code Example',
      { fontSize: 28, fontFace: 'Consolas', color: MN.accent2, bold: true, align: 'left' }),
    el('mn-c-lang', 'text', 9.5, 0.4, 3.0, 0.5, 'JavaScript',
      { fontSize: 14, fontFace: MN.font, color: '#8b949e', align: 'right' }),
    el('mn-c-code', 'code', 0.8, 1.2, 11.5, 5.0,
      'async function fetchData(url) {\n  try {\n    const response = await fetch(url);\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error("Failed:", error);\n    throw error;\n  }\n}',
      { fontSize: 18, fontFace: 'Consolas', color: '#d4d4d4', backgroundColor: MN.codeBg }, { language: 'javascript' }),
    el('mn-c-cap', 'text', 0.8, 6.5, 11.5, 0.5, '↑ Async data fetching with error handling',
      { fontSize: 14, fontFace: MN.font, color: '#484f58', align: 'left' }),
  ])),

  layout('mn-compare', 'Midnight', 'Compare', 'Compare & Contrast', slide(MN.bg, [
    el('mn-2c-title', 'text', 0.8, 0.4, 11.5, 0.9, 'Compare & Contrast',
      { fontSize: 36, fontFace: MN.font, color: MN.text, bold: true, align: 'center' }),
    el('mn-2c-div', 'line', 6.666, 1.6, 0, 5.0, '', {}, { x1: 0, y1: 0, x2: 0, y2: 5.0, lineStyle: { color: '#333355', width: 2 } }),
    el('mn-2c-lh', 'text', 0.8, 1.5, 5.2, 0.7, 'Option A',
      { fontSize: 26, fontFace: MN.font, color: MN.accent, bold: true, align: 'center' }),
    el('mn-2c-lb', 'text', 0.8, 2.4, 5.2, 4.0, 'Advantages and details\nabout the first option\ngo in this column',
      { fontSize: 18, fontFace: MN.font, color: MN.sub, align: 'left', listType: 'bullet', lineSpacing: 1.6 }),
    el('mn-2c-rh', 'text', 7.2, 1.5, 5.2, 0.7, 'Option B',
      { fontSize: 26, fontFace: MN.font, color: MN.accent2, bold: true, align: 'center' }),
    el('mn-2c-rb', 'text', 7.2, 2.4, 5.2, 4.0, 'Advantages and details\nabout the second option\ngo in this column',
      { fontSize: 18, fontFace: MN.font, color: MN.sub, align: 'left', listType: 'bullet', lineSpacing: 1.6 }),
  ])),

  layout('mn-quote', 'Midnight', 'Quote', 'Quote', slide(MN.bg, [
    el('mn-q-mark', 'text', 1.5, 0.8, 2.0, 2.0, '\u201C',
      { fontSize: 120, fontFace: 'Georgia', color: MN.accent, bold: false, align: 'left' }),
    el('mn-q-text', 'text', 2.0, 2.2, 9.0, 2.5, 'The best way to predict the future is to invent it.',
      { fontSize: 32, fontFace: 'Georgia', color: MN.text, bold: false, italic: true, align: 'left', lineSpacing: 1.5 }),
    el('mn-q-line', 'line', 2.0, 5.0, 2.5, 0, '', {}, { x1: 0, y1: 0, x2: 2.5, y2: 0, lineStyle: { color: MN.accent, width: 3 } }),
    el('mn-q-auth', 'text', 2.0, 5.3, 9.0, 0.6, '— Alan Kay, Computer Scientist',
      { fontSize: 20, fontFace: 'Georgia', color: MN.sub, align: 'left' }),
  ])),

  layout('mn-image', 'Midnight', 'Image', 'Image + Text', slide(MN.bg, [
    el('mn-i-ph', 'shape', 0.6, 0.6, 5.5, 6.0, '🖼\nDrop image here',
      { fontSize: 24, fontFace: MN.font, color: MN.sub, align: 'center' },
      { shape: 'roundedRect', shapeStyle: { fill: MN.card, borderColor: MN.border, borderWidth: 2 } }),
    el('mn-i-title', 'text', 6.8, 0.8, 5.7, 0.9, 'Feature Highlight',
      { fontSize: 32, fontFace: MN.font, color: MN.text, bold: true, align: 'left' }),
    el('mn-i-line', 'line', 6.8, 1.8, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: MN.accent, width: 3 } }),
    el('mn-i-body', 'text', 6.8, 2.2, 5.7, 4.0, 'Replace the placeholder with your image and describe your feature here.\n\nUse this layout when you need a visual paired with explanatory text.',
      { fontSize: 18, fontFace: MN.font, color: MN.sub, align: 'left', lineSpacing: 1.5 }),
  ])),

  layout('mn-thanks', 'Midnight', 'Thank You', 'Thank You', slide(MN.bg, [
    el('mn-ty-title', 'text', 1.5, 2.0, 10.3, 1.8, 'Thank You!',
      { fontSize: 64, fontFace: MN.font, color: MN.text, bold: true, align: 'center' }),
    el('mn-ty-line', 'line', 5.0, 4.0, 3.3, 0, '', {}, { x1: 0, y1: 0, x2: 3.3, y2: 0, lineStyle: { color: MN.accent, width: 3 } }),
    el('mn-ty-info', 'text', 2.0, 4.5, 9.3, 1.0, 'your.email@company.com\ngithub.com/yourhandle',
      { fontSize: 18, fontFace: MN.font, color: MN.sub, align: 'center', lineSpacing: 1.6 }),
  ])),

  layout('mn-table', 'Midnight', 'Table', 'Data Table', slide(MN.bg, [
    el('mn-tbl-title', 'text', 0.8, 0.4, 11.7, 0.8, 'Data Overview',
      { fontSize: 32, fontFace: MN.font, color: MN.text, bold: true, align: 'left' }),
    el('mn-tbl-line', 'line', 0.8, 1.3, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: MN.accent, width: 3 } }),
    tableEl('mn-tbl-data', 0.8, 1.8, 11.7, 4.5,
      [
        ['Category', 'Q1', 'Q2', 'Q3', 'Q4'],
        ['Revenue', '$1.2M', '$1.5M', '$1.8M', '$2.1M'],
        ['Growth', '12%', '15%', '18%', '22%'],
        ['Users', '10K', '15K', '22K', '30K'],
        ['Retention', '85%', '87%', '90%', '92%'],
      ],
      { borderColor: MN.border, borderWidth: 1, headerBg: MN.accent, headerColor: '#FFFFFF', cellBg: MN.card, cellColor: MN.text, altRowBg: MN.bg, fontSize: 16, fontFace: MN.font }
    ),
  ])),

  // 2-Column layout
  layout('mn-2col', 'Midnight', '2 Columns', '2 Column Layout', slide(MN.bg, [
    el('mn-2c-title', 'text', 0.8, 0.4, 11.7, 0.8, 'Two Column Overview',
      { fontSize: 32, fontFace: MN.font, color: MN.text, bold: true, align: 'left' }),
    el('mn-2c-line', 'line', 0.8, 1.3, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: MN.accent, width: 3 } }),
    // Column 1
    ovalEl('mn-2c-o1', 2.3, 1.8, 1.3, MN.accent, MN.border),
    iconEl('mn-2c-i1', 2.45, 1.95, 1.0, ICONS.lightbulb, '#FFFFFF'),
    el('mn-2c-t1', 'text', 1.0, 3.3, 5.0, 0.7, 'Innovation',
      { fontSize: 24, fontFace: MN.font, color: MN.text, bold: true, align: 'center' }),
    el('mn-2c-b1', 'text', 1.0, 4.1, 5.0, 2.5, 'Drive creative solutions and push boundaries to deliver exceptional results for your team.',
      { fontSize: 16, fontFace: MN.font, color: MN.sub, align: 'center', lineSpacing: 1.5 }),
    // Column 2
    ovalEl('mn-2c-o2', 9.0, 1.8, 1.3, MN.card, MN.accent),
    iconEl('mn-2c-i2', 9.15, 1.95, 1.0, ICONS.target, MN.accent),
    el('mn-2c-t2', 'text', 7.3, 3.3, 5.0, 0.7, 'Strategy',
      { fontSize: 24, fontFace: MN.font, color: MN.text, bold: true, align: 'center' }),
    el('mn-2c-b2', 'text', 7.3, 4.1, 5.0, 2.5, 'Align your goals with actionable roadmaps and measurable milestones for success.',
      { fontSize: 16, fontFace: MN.font, color: MN.sub, align: 'center', lineSpacing: 1.5 }),
  ])),

  // 3-Column layout
  layout('mn-3col', 'Midnight', '3 Columns', '3 Column Layout', slide(MN.bg, [
    el('mn-3c-title', 'text', 0.8, 0.4, 11.7, 0.8, 'Three Pillars',
      { fontSize: 32, fontFace: MN.font, color: MN.text, bold: true, align: 'left' }),
    el('mn-3c-line', 'line', 0.8, 1.3, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: MN.accent, width: 3 } }),
    // Column 1
    ovalEl('mn-3c-o1', 1.6, 1.8, 1.2, MN.accent, MN.border),
    iconEl('mn-3c-i1', 1.72, 1.92, 0.96, ICONS.trending, '#FFFFFF'),
    el('mn-3c-t1', 'text', 0.5, 3.2, 3.4, 0.7, 'Growth',
      { fontSize: 22, fontFace: MN.font, color: MN.text, bold: true, align: 'center' }),
    el('mn-3c-b1', 'text', 0.5, 3.9, 3.4, 2.5, 'Scale your business with data-driven insights and proven methodologies.',
      { fontSize: 15, fontFace: MN.font, color: MN.sub, align: 'center', lineSpacing: 1.5 }),
    // Column 2
    ovalEl('mn-3c-o2', 6.05, 1.8, 1.2, MN.card, MN.accent),
    iconEl('mn-3c-i2', 6.17, 1.92, 0.96, ICONS.shield, MN.accent),
    el('mn-3c-t2', 'text', 4.95, 3.2, 3.4, 0.7, 'Security',
      { fontSize: 22, fontFace: MN.font, color: MN.text, bold: true, align: 'center' }),
    el('mn-3c-b2', 'text', 4.95, 3.9, 3.4, 2.5, 'Protect your assets with enterprise-grade security and compliance.',
      { fontSize: 15, fontFace: MN.font, color: MN.sub, align: 'center', lineSpacing: 1.5 }),
    // Column 3
    ovalEl('mn-3c-o3', 10.5, 1.8, 1.2, MN.accent, MN.border),
    iconEl('mn-3c-i3', 10.62, 1.92, 0.96, ICONS.globe, '#FFFFFF'),
    el('mn-3c-t3', 'text', 9.4, 3.2, 3.4, 0.7, 'Global Reach',
      { fontSize: 22, fontFace: MN.font, color: MN.text, bold: true, align: 'center' }),
    el('mn-3c-b3', 'text', 9.4, 3.9, 3.4, 2.5, 'Expand into new markets with localized solutions worldwide.',
      { fontSize: 15, fontFace: MN.font, color: MN.sub, align: 'center', lineSpacing: 1.5 }),
  ])),

  layout('mn-demo', 'Midnight', 'Demo', 'Demo Slide', slide(MN.border, [
    ovalEl('mn-dm-bg', 4.5, 0.6, 4.0, '#1a2744', MN.accent),
    iconEl('mn-dm-icon', 5.5, 1.6, 2.0, ICONS.play, MN.accent),
    el('mn-dm-title', 'text', 1.5, 4.8, 10.0, 1.5, 'DEMO',
      { fontSize: 80, fontFace: MN.font, color: '#FFFFFF', bold: true, align: 'center' }),
    el('mn-dm-sub', 'text', 2.5, 6.1, 8.0, 0.8, 'Building something extraordinary — live',
      { fontSize: 24, fontFace: MN.font, color: MN.sub, align: 'center' }),
  ])),
];


// ╔══════════════════════════════════════════════════════════════╗
// ║  AURORA — Vibrant gradient with warm accents                ║
// ╚══════════════════════════════════════════════════════════════╝
const AU = {
  bg: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
  bgSolid: '#1b1545', card: '#2a2160', border: '#3d3580',
  accent: '#ff6b6b', accent2: '#feca57', accent3: '#48dbfb',
  text: '#FFFFFF', sub: '#a5b4fc', muted: '#7c83a8',
  font: 'Segoe UI',
};

const aurora = [
  layout('au-title', 'Aurora', 'Title', 'Title Slide', slide(AU.bg, [
    el('au-t-bar', 'shape', 0, 0, 0.4, 7.5, '', {},
      { shape: 'rect', shapeStyle: { fill: AU.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('au-t-title', 'text', 1.2, 1.8, 10, 2.0, 'Big Ideas\nStart Here',
      { fontSize: 52, fontFace: AU.font, color: AU.text, bold: true, align: 'left', lineSpacing: 1.1 }),
    el('au-t-sub', 'text', 1.2, 4.3, 7, 0.7, 'A presentation template for creative thinkers',
      { fontSize: 20, fontFace: AU.font, color: AU.sub, align: 'left' }),
    el('au-t-date', 'text', 1.2, 5.5, 5, 0.5, 'Your Name  |  Date',
      { fontSize: 14, fontFace: AU.font, color: AU.muted, align: 'left' }),
  ])),

  layout('au-section', 'Aurora', 'Section', 'Section Divider', slide(AU.bg, [
    el('au-s-circle', 'shape', 0.8, 1.5, 2.5, 2.5, '01',
      { fontSize: 36, fontFace: AU.font, color: AU.text, bold: true, align: 'center' },
      { shape: 'circle', shapeStyle: { fill: 'transparent', borderColor: AU.accent, borderWidth: 4 } }),
    el('au-s-title', 'text', 4.0, 1.8, 8.5, 1.2, 'Section Title',
      { fontSize: 44, fontFace: AU.font, color: AU.text, bold: true, align: 'left' }),
    el('au-s-desc', 'text', 4.0, 3.2, 8.5, 0.8, 'Brief description of what this section covers',
      { fontSize: 18, fontFace: AU.font, color: AU.sub, align: 'left' }),
    el('au-s-line', 'line', 4.0, 4.2, 5.0, 0, '', {}, { x1: 0, y1: 0, x2: 5.0, y2: 0, lineStyle: { color: AU.accent, width: 2 } }),
  ])),

  layout('au-agenda', 'Aurora', 'Agenda', 'Agenda', slide(AU.bg, [
    el('au-a-title', 'text', 0.8, 0.4, 5.0, 0.9, 'Agenda',
      { fontSize: 36, fontFace: AU.font, color: AU.text, bold: true, align: 'left' }),
    el('au-a-line', 'line', 0.8, 1.3, 4.0, 0, '', {}, { x1: 0, y1: 0, x2: 4.0, y2: 0, lineStyle: { color: AU.accent, width: 3 } }),
    el('au-a-list', 'text', 1.0, 1.8, 10.5, 5.0, 'Introduction & Context\nProblem Statement\nProposed Solution\nDemo / Walkthrough\nTimeline & Next Steps\nQ & A',
      { fontSize: 24, fontFace: AU.font, color: AU.sub, align: 'left', listType: 'numbered', lineSpacing: 2.0 }),
  ])),

  layout('au-bullets', 'Aurora', 'Bullets', 'Bullet Points', slide(AU.bg, [
    el('au-b-title', 'text', 0.8, 0.4, 11.5, 0.9, 'Key Takeaways',
      { fontSize: 36, fontFace: AU.font, color: AU.text, bold: true, align: 'left' }),
    el('au-b-bar', 'shape', 0.8, 1.35, 11.5, 0.08, '', {},
      { shape: 'rect', shapeStyle: { fill: AU.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('au-b-list', 'text', 1.0, 1.8, 10.5, 4.5, 'First important point goes here\nSecond point with more detail\nThird point to round things out\nAdd more as needed',
      { fontSize: 22, fontFace: AU.font, color: AU.sub, align: 'left', listType: 'bullet', lineSpacing: 1.8 }),
  ])),

  layout('au-code', 'Aurora', 'Code', 'Code Showcase', slide(AU.bgSolid, [
    el('au-c-title', 'text', 0.8, 0.3, 8.0, 0.8, '// Code Example',
      { fontSize: 28, fontFace: 'Consolas', color: AU.accent2, bold: true, align: 'left' }),
    el('au-c-lang', 'text', 9.5, 0.4, 3.0, 0.5, 'JavaScript',
      { fontSize: 14, fontFace: AU.font, color: AU.muted, align: 'right' }),
    el('au-c-code', 'code', 0.8, 1.2, 11.5, 5.0,
      'async function fetchData(url) {\n  try {\n    const response = await fetch(url);\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error("Failed:", error);\n    throw error;\n  }\n}',
      { fontSize: 18, fontFace: 'Consolas', color: '#d4d4d4', backgroundColor: '#120e30' }, { language: 'javascript' }),
    el('au-c-cap', 'text', 0.8, 6.5, 11.5, 0.5, '↑ Async data fetching with error handling',
      { fontSize: 14, fontFace: AU.font, color: AU.muted, align: 'left' }),
  ])),

  layout('au-compare', 'Aurora', 'Compare', 'Compare & Contrast', slide(AU.bg, [
    el('au-2c-title', 'text', 0.8, 0.4, 11.5, 0.9, 'Compare & Contrast',
      { fontSize: 36, fontFace: AU.font, color: AU.text, bold: true, align: 'center' }),
    el('au-2c-div', 'line', 6.666, 1.6, 0, 5.0, '', {}, { x1: 0, y1: 0, x2: 0, y2: 5.0, lineStyle: { color: '#4a4580', width: 2 } }),
    el('au-2c-lh', 'text', 0.8, 1.5, 5.2, 0.7, 'Option A',
      { fontSize: 26, fontFace: AU.font, color: AU.accent, bold: true, align: 'center' }),
    el('au-2c-lb', 'text', 0.8, 2.4, 5.2, 4.0, 'Advantages and details\nabout the first option\ngo in this column',
      { fontSize: 18, fontFace: AU.font, color: AU.sub, align: 'left', listType: 'bullet', lineSpacing: 1.6 }),
    el('au-2c-rh', 'text', 7.2, 1.5, 5.2, 0.7, 'Option B',
      { fontSize: 26, fontFace: AU.font, color: AU.accent2, bold: true, align: 'center' }),
    el('au-2c-rb', 'text', 7.2, 2.4, 5.2, 4.0, 'Advantages and details\nabout the second option\ngo in this column',
      { fontSize: 18, fontFace: AU.font, color: AU.sub, align: 'left', listType: 'bullet', lineSpacing: 1.6 }),
  ])),

  layout('au-quote', 'Aurora', 'Quote', 'Quote', slide(AU.bg, [
    el('au-q-mark', 'text', 1.5, 0.8, 2.0, 2.0, '\u201C',
      { fontSize: 120, fontFace: 'Georgia', color: AU.accent, bold: false, align: 'left' }),
    el('au-q-text', 'text', 2.0, 2.2, 9.0, 2.5, 'Design is not just what it looks like. Design is how it works.',
      { fontSize: 32, fontFace: 'Georgia', color: AU.text, bold: false, italic: true, align: 'left', lineSpacing: 1.5 }),
    el('au-q-line', 'line', 2.0, 5.0, 2.5, 0, '', {}, { x1: 0, y1: 0, x2: 2.5, y2: 0, lineStyle: { color: AU.accent, width: 3 } }),
    el('au-q-auth', 'text', 2.0, 5.3, 9.0, 0.6, '— Steve Jobs',
      { fontSize: 20, fontFace: 'Georgia', color: AU.sub, align: 'left' }),
  ])),

  layout('au-image', 'Aurora', 'Image', 'Image + Text', slide(AU.bg, [
    el('au-i-ph', 'shape', 0.6, 0.6, 5.5, 6.0, '🖼\nDrop image here',
      { fontSize: 24, fontFace: AU.font, color: AU.sub, align: 'center' },
      { shape: 'roundedRect', shapeStyle: { fill: AU.card, borderColor: AU.border, borderWidth: 2 } }),
    el('au-i-title', 'text', 6.8, 0.8, 5.7, 0.9, 'Feature Highlight',
      { fontSize: 32, fontFace: AU.font, color: AU.text, bold: true, align: 'left' }),
    el('au-i-line', 'line', 6.8, 1.8, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: AU.accent, width: 3 } }),
    el('au-i-body', 'text', 6.8, 2.2, 5.7, 4.0, 'Replace the placeholder with your image and describe your feature here.\n\nUse this layout when you need a visual paired with explanatory text.',
      { fontSize: 18, fontFace: AU.font, color: AU.sub, align: 'left', lineSpacing: 1.5 }),
  ])),

  layout('au-thanks', 'Aurora', 'Thank You', 'Thank You', slide(AU.bg, [
    el('au-ty-title', 'text', 1.5, 2.0, 10.3, 1.8, 'Thank You!',
      { fontSize: 64, fontFace: AU.font, color: AU.text, bold: true, align: 'center' }),
    el('au-ty-line', 'line', 5.0, 4.0, 3.3, 0, '', {}, { x1: 0, y1: 0, x2: 3.3, y2: 0, lineStyle: { color: AU.accent, width: 3 } }),
    el('au-ty-info', 'text', 2.0, 4.5, 9.3, 1.0, 'your.email@company.com\ngithub.com/yourhandle',
      { fontSize: 18, fontFace: AU.font, color: AU.sub, align: 'center', lineSpacing: 1.6 }),
  ])),

  layout('au-table', 'Aurora', 'Table', 'Data Table', slide(AU.bg, [
    el('au-tbl-title', 'text', 0.8, 0.4, 11.7, 0.8, 'Data Overview',
      { fontSize: 32, fontFace: AU.font, color: AU.text, bold: true, align: 'left' }),
    el('au-tbl-line', 'line', 0.8, 1.3, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: AU.accent, width: 3 } }),
    tableEl('au-tbl-data', 0.8, 1.8, 11.7, 4.5,
      [
        ['Category', 'Q1', 'Q2', 'Q3', 'Q4'],
        ['Revenue', '$1.2M', '$1.5M', '$1.8M', '$2.1M'],
        ['Growth', '12%', '15%', '18%', '22%'],
        ['Users', '10K', '15K', '22K', '30K'],
        ['Retention', '85%', '87%', '90%', '92%'],
      ],
      { borderColor: AU.border, borderWidth: 1, headerBg: AU.accent, headerColor: '#FFFFFF', cellBg: AU.card, cellColor: AU.text, altRowBg: AU.bgSolid, fontSize: 16, fontFace: AU.font }
    ),
  ])),

  // 2-Column layout
  layout('au-2col', 'Aurora', '2 Columns', '2 Column Layout', slide(AU.bg, [
    el('au-2c-title', 'text', 0.8, 0.4, 11.7, 0.8, 'Two Column Overview',
      { fontSize: 32, fontFace: AU.font, color: AU.text, bold: true, align: 'left' }),
    el('au-2c-line', 'line', 0.8, 1.3, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: AU.accent, width: 3 } }),
    // Column 1
    ovalEl('au-2c-o1', 2.3, 1.8, 1.3, AU.accent, AU.border),
    iconEl('au-2c-i1', 2.45, 1.95, 1.0, ICONS.zap, '#FFFFFF'),
    el('au-2c-t1', 'text', 1.0, 3.3, 5.0, 0.7, 'Performance',
      { fontSize: 24, fontFace: AU.font, color: AU.text, bold: true, align: 'center' }),
    el('au-2c-b1', 'text', 1.0, 4.1, 5.0, 2.5, 'Supercharge your workflow with lightning-fast tools built for modern teams.',
      { fontSize: 16, fontFace: AU.font, color: AU.sub, align: 'center', lineSpacing: 1.5 }),
    // Column 2
    ovalEl('au-2c-o2', 9.0, 1.8, 1.3, AU.card, AU.accent),
    iconEl('au-2c-i2', 9.15, 1.95, 1.0, ICONS.chart, AU.accent),
    el('au-2c-t2', 'text', 7.3, 3.3, 5.0, 0.7, 'Analytics',
      { fontSize: 24, fontFace: AU.font, color: AU.text, bold: true, align: 'center' }),
    el('au-2c-b2', 'text', 7.3, 4.1, 5.0, 2.5, 'Gain deep insights from real-time dashboards and comprehensive reporting.',
      { fontSize: 16, fontFace: AU.font, color: AU.sub, align: 'center', lineSpacing: 1.5 }),
  ])),

  // 3-Column layout
  layout('au-3col', 'Aurora', '3 Columns', '3 Column Layout', slide(AU.bg, [
    el('au-3c-title', 'text', 0.8, 0.4, 11.7, 0.8, 'Our Approach',
      { fontSize: 32, fontFace: AU.font, color: AU.text, bold: true, align: 'left' }),
    el('au-3c-line', 'line', 0.8, 1.3, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: AU.accent, width: 3 } }),
    // Column 1
    ovalEl('au-3c-o1', 1.6, 1.8, 1.2, AU.accent, AU.border),
    iconEl('au-3c-i1', 1.72, 1.92, 0.96, ICONS.lightbulb, '#FFFFFF'),
    el('au-3c-t1', 'text', 0.5, 3.2, 3.4, 0.7, 'Ideate',
      { fontSize: 22, fontFace: AU.font, color: AU.text, bold: true, align: 'center' }),
    el('au-3c-b1', 'text', 0.5, 3.9, 3.4, 2.5, 'Brainstorm creative solutions and explore new possibilities together.',
      { fontSize: 15, fontFace: AU.font, color: AU.sub, align: 'center', lineSpacing: 1.5 }),
    // Column 2
    ovalEl('au-3c-o2', 6.05, 1.8, 1.2, AU.card, AU.accent2),
    iconEl('au-3c-i2', 6.17, 1.92, 0.96, ICONS.code, AU.accent2),
    el('au-3c-t2', 'text', 4.95, 3.2, 3.4, 0.7, 'Build',
      { fontSize: 22, fontFace: AU.font, color: AU.text, bold: true, align: 'center' }),
    el('au-3c-b2', 'text', 4.95, 3.9, 3.4, 2.5, 'Transform ideas into reality with robust engineering and clean code.',
      { fontSize: 15, fontFace: AU.font, color: AU.sub, align: 'center', lineSpacing: 1.5 }),
    // Column 3
    ovalEl('au-3c-o3', 10.5, 1.8, 1.2, AU.accent3, AU.border),
    iconEl('au-3c-i3', 10.62, 1.92, 0.96, ICONS.trending, '#FFFFFF'),
    el('au-3c-t3', 'text', 9.4, 3.2, 3.4, 0.7, 'Scale',
      { fontSize: 22, fontFace: AU.font, color: AU.text, bold: true, align: 'center' }),
    el('au-3c-b3', 'text', 9.4, 3.9, 3.4, 2.5, 'Grow confidently with infrastructure that scales with demand.',
      { fontSize: 15, fontFace: AU.font, color: AU.sub, align: 'center', lineSpacing: 1.5 }),
  ])),

  layout('au-demo', 'Aurora', 'Demo', 'Demo Slide', slide('#1b1545', [
    ovalEl('au-dm-bg', 4.5, 0.6, 4.0, '#2a2160', AU.accent),
    iconEl('au-dm-icon', 5.5, 1.6, 2.0, ICONS.play, AU.accent),
    el('au-dm-title', 'text', 1.5, 4.8, 10.0, 1.5, 'DEMO',
      { fontSize: 80, fontFace: AU.font, color: '#FFFFFF', bold: true, align: 'center' }),
    el('au-dm-sub', 'text', 2.5, 6.1, 8.0, 0.8, 'Watch the magic happen in real time',
      { fontSize: 24, fontFace: AU.font, color: AU.sub, align: 'center' }),
  ])),
];


// ╔══════════════════════════════════════════════════════════════╗
// ║  CLEAN — Light, professional, modern                        ║
// ╚══════════════════════════════════════════════════════════════╝
const CL = {
  bg: '#FFFFFF', card: '#f1f5f9', border: '#e2e8f0',
  accent: '#2563eb', accent2: '#10b981', accent3: '#f59e0b',
  text: '#1e293b', sub: '#475569', muted: '#94a3b8',
  font: 'Segoe UI',
};

const clean = [
  layout('cl-title', 'Clean', 'Title', 'Title Slide', slide(CL.bg, [
    el('cl-t-bar', 'shape', 0, 0, 13.333, 0.25, '', {},
      { shape: 'rect', shapeStyle: { fill: CL.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('cl-t-title', 'text', 1.5, 2.0, 10.3, 1.5, 'Your Presentation Title',
      { fontSize: 48, fontFace: CL.font, color: CL.text, bold: true, align: 'center' }),
    el('cl-t-sub', 'text', 2.5, 3.8, 8.3, 0.8, 'Subtitle goes here — click to edit',
      { fontSize: 22, fontFace: CL.font, color: CL.sub, align: 'center' }),
    el('cl-t-line', 'line', 5.5, 3.65, 2.3, 0, '', {}, { x1: 0, y1: 0, x2: 2.3, y2: 0, lineStyle: { color: CL.accent, width: 3 } }),
    el('cl-t-date', 'text', 4.5, 5.5, 4.3, 0.5, 'Your Name  |  Date',
      { fontSize: 14, fontFace: CL.font, color: CL.muted, align: 'center' }),
  ])),

  layout('cl-section', 'Clean', 'Section', 'Section Divider', slide(CL.bg, [
    el('cl-s-bar', 'shape', 0, 0, 0.25, 7.5, '', {},
      { shape: 'rect', shapeStyle: { fill: CL.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('cl-s-num', 'text', 0.8, 1.2, 2.0, 1.5, '01',
      { fontSize: 64, fontFace: CL.font, color: CL.accent, bold: true, align: 'left' }),
    el('cl-s-title', 'text', 0.8, 3.0, 10.0, 1.2, 'Section Title',
      { fontSize: 44, fontFace: CL.font, color: CL.text, bold: true, align: 'left' }),
    el('cl-s-desc', 'text', 0.8, 4.4, 8.0, 0.8, 'Brief description of what this section covers',
      { fontSize: 18, fontFace: CL.font, color: CL.sub, align: 'left' }),
  ])),

  layout('cl-agenda', 'Clean', 'Agenda', 'Agenda', slide(CL.bg, [
    el('cl-a-bar', 'shape', 0, 0, 13.333, 0.15, '', {},
      { shape: 'rect', shapeStyle: { fill: CL.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('cl-a-title', 'text', 0.8, 0.5, 5.0, 0.9, 'Agenda',
      { fontSize: 36, fontFace: CL.font, color: CL.text, bold: true, align: 'left' }),
    el('cl-a-list', 'text', 1.0, 1.6, 10.5, 5.0, 'Introduction & Context\nProblem Statement\nProposed Solution\nDemo / Walkthrough\nTimeline & Next Steps\nQ & A',
      { fontSize: 24, fontFace: CL.font, color: CL.sub, align: 'left', listType: 'numbered', lineSpacing: 2.0 }),
  ])),

  layout('cl-bullets', 'Clean', 'Bullets', 'Bullet Points', slide(CL.bg, [
    el('cl-b-title', 'text', 0.8, 0.4, 11.5, 0.9, 'Key Takeaways',
      { fontSize: 36, fontFace: CL.font, color: CL.text, bold: true, align: 'left' }),
    el('cl-b-line', 'line', 0.8, 1.4, 11.5, 0, '', {}, { x1: 0, y1: 0, x2: 11.5, y2: 0, lineStyle: { color: CL.border, width: 1 } }),
    el('cl-b-dot', 'shape', 0.8, 1.35, 0.5, 0.1, '', {},
      { shape: 'rect', shapeStyle: { fill: CL.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('cl-b-list', 'text', 1.0, 1.8, 10.5, 4.5, 'First important point goes here\nSecond point with more detail\nThird point to round things out\nAdd more as needed',
      { fontSize: 22, fontFace: CL.font, color: CL.sub, align: 'left', listType: 'bullet', lineSpacing: 1.8 }),
  ])),

  layout('cl-code', 'Clean', 'Code', 'Code Showcase', slide(CL.bg, [
    el('cl-c-title', 'text', 0.8, 0.3, 8.0, 0.8, 'Code Example',
      { fontSize: 28, fontFace: CL.font, color: CL.text, bold: true, align: 'left' }),
    el('cl-c-lang', 'text', 9.5, 0.4, 3.0, 0.5, 'JavaScript',
      { fontSize: 14, fontFace: CL.font, color: CL.muted, align: 'right' }),
    el('cl-c-code', 'code', 0.8, 1.2, 11.5, 5.0,
      'async function fetchData(url) {\n  try {\n    const response = await fetch(url);\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error("Failed:", error);\n    throw error;\n  }\n}',
      { fontSize: 18, fontFace: 'Consolas', color: '#d4d4d4', backgroundColor: '#1e293b' }, { language: 'javascript' }),
    el('cl-c-cap', 'text', 0.8, 6.5, 11.5, 0.5, '↑ Async data fetching with error handling',
      { fontSize: 14, fontFace: CL.font, color: CL.muted, align: 'left' }),
  ])),

  layout('cl-compare', 'Clean', 'Compare', 'Compare & Contrast', slide(CL.bg, [
    el('cl-2c-title', 'text', 0.8, 0.4, 11.5, 0.9, 'Compare & Contrast',
      { fontSize: 36, fontFace: CL.font, color: CL.text, bold: true, align: 'center' }),
    el('cl-2c-div', 'line', 6.666, 1.6, 0, 5.0, '', {}, { x1: 0, y1: 0, x2: 0, y2: 5.0, lineStyle: { color: CL.border, width: 1 } }),
    el('cl-2c-lh', 'text', 0.8, 1.5, 5.2, 0.7, 'Option A',
      { fontSize: 26, fontFace: CL.font, color: CL.accent, bold: true, align: 'center' }),
    el('cl-2c-lb', 'text', 0.8, 2.4, 5.2, 4.0, 'Advantages and details\nabout the first option\ngo in this column',
      { fontSize: 18, fontFace: CL.font, color: CL.sub, align: 'left', listType: 'bullet', lineSpacing: 1.6 }),
    el('cl-2c-rh', 'text', 7.2, 1.5, 5.2, 0.7, 'Option B',
      { fontSize: 26, fontFace: CL.font, color: CL.accent2, bold: true, align: 'center' }),
    el('cl-2c-rb', 'text', 7.2, 2.4, 5.2, 4.0, 'Advantages and details\nabout the second option\ngo in this column',
      { fontSize: 18, fontFace: CL.font, color: CL.sub, align: 'left', listType: 'bullet', lineSpacing: 1.6 }),
  ])),

  layout('cl-quote', 'Clean', 'Quote', 'Quote', slide(CL.card, [
    el('cl-q-mark', 'text', 1.5, 0.8, 2.0, 2.0, '\u201C',
      { fontSize: 120, fontFace: 'Georgia', color: CL.accent, bold: false, align: 'left' }),
    el('cl-q-text', 'text', 2.0, 2.2, 9.0, 2.5, 'Simplicity is the ultimate sophistication.',
      { fontSize: 32, fontFace: 'Georgia', color: CL.text, bold: false, italic: true, align: 'left', lineSpacing: 1.5 }),
    el('cl-q-line', 'line', 2.0, 5.0, 2.5, 0, '', {}, { x1: 0, y1: 0, x2: 2.5, y2: 0, lineStyle: { color: CL.accent, width: 3 } }),
    el('cl-q-auth', 'text', 2.0, 5.3, 9.0, 0.6, '— Leonardo da Vinci',
      { fontSize: 20, fontFace: 'Georgia', color: CL.sub, align: 'left' }),
  ])),

  layout('cl-image', 'Clean', 'Image', 'Image + Text', slide(CL.bg, [
    el('cl-i-ph', 'shape', 0.6, 0.6, 5.5, 6.0, '🖼\nDrop image here',
      { fontSize: 24, fontFace: CL.font, color: CL.muted, align: 'center' },
      { shape: 'roundedRect', shapeStyle: { fill: CL.card, borderColor: CL.border, borderWidth: 2 } }),
    el('cl-i-title', 'text', 6.8, 0.8, 5.7, 0.9, 'Feature Highlight',
      { fontSize: 32, fontFace: CL.font, color: CL.text, bold: true, align: 'left' }),
    el('cl-i-line', 'line', 6.8, 1.8, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: CL.accent, width: 3 } }),
    el('cl-i-body', 'text', 6.8, 2.2, 5.7, 4.0, 'Replace the placeholder with your image and describe your feature here.\n\nUse this layout when you need a visual paired with explanatory text.',
      { fontSize: 18, fontFace: CL.font, color: CL.sub, align: 'left', lineSpacing: 1.5 }),
  ])),

  layout('cl-thanks', 'Clean', 'Thank You', 'Thank You', slide(CL.bg, [
    el('cl-ty-bar', 'shape', 0, 7.25, 13.333, 0.25, '', {},
      { shape: 'rect', shapeStyle: { fill: CL.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('cl-ty-title', 'text', 1.5, 2.0, 10.3, 1.8, 'Thank You!',
      { fontSize: 64, fontFace: CL.font, color: CL.text, bold: true, align: 'center' }),
    el('cl-ty-line', 'line', 5.0, 4.0, 3.3, 0, '', {}, { x1: 0, y1: 0, x2: 3.3, y2: 0, lineStyle: { color: CL.accent, width: 3 } }),
    el('cl-ty-info', 'text', 2.0, 4.5, 9.3, 1.0, 'your.email@company.com\ngithub.com/yourhandle',
      { fontSize: 18, fontFace: CL.font, color: CL.sub, align: 'center', lineSpacing: 1.6 }),
  ])),

  layout('cl-table', 'Clean', 'Table', 'Data Table', slide(CL.bg, [
    el('cl-tbl-bar', 'shape', 0, 0, 13.333, 0.15, '', {},
      { shape: 'rect', shapeStyle: { fill: CL.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('cl-tbl-title', 'text', 0.8, 0.5, 11.7, 0.8, 'Data Overview',
      { fontSize: 32, fontFace: CL.font, color: CL.text, bold: true, align: 'left' }),
    el('cl-tbl-line', 'line', 0.8, 1.4, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: CL.accent, width: 3 } }),
    tableEl('cl-tbl-data', 0.8, 1.8, 11.7, 4.5,
      [
        ['Category', 'Q1', 'Q2', 'Q3', 'Q4'],
        ['Revenue', '$1.2M', '$1.5M', '$1.8M', '$2.1M'],
        ['Growth', '12%', '15%', '18%', '22%'],
        ['Users', '10K', '15K', '22K', '30K'],
        ['Retention', '85%', '87%', '90%', '92%'],
      ],
      { borderColor: CL.border, borderWidth: 1, headerBg: CL.accent, headerColor: '#FFFFFF', cellBg: '#FFFFFF', cellColor: CL.text, altRowBg: CL.card, fontSize: 16, fontFace: CL.font }
    ),
  ])),

  // 2-Column layout
  layout('cl-2col', 'Clean', '2 Columns', '2 Column Layout', slide(CL.bg, [
    el('cl-2c-bar', 'shape', 0, 0, 13.333, 0.15, '', {},
      { shape: 'rect', shapeStyle: { fill: CL.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('cl-2c-title', 'text', 0.8, 0.5, 11.7, 0.8, 'Two Column Overview',
      { fontSize: 32, fontFace: CL.font, color: CL.text, bold: true, align: 'left' }),
    el('cl-2c-line', 'line', 0.8, 1.4, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: CL.accent, width: 3 } }),
    // Column 1
    ovalEl('cl-2c-o1', 2.3, 1.9, 1.3, CL.accent, CL.border),
    iconEl('cl-2c-i1', 2.45, 2.05, 1.0, ICONS.checkmark, '#FFFFFF'),
    el('cl-2c-t1', 'text', 1.0, 3.4, 5.0, 0.7, 'Quality',
      { fontSize: 24, fontFace: CL.font, color: CL.text, bold: true, align: 'center' }),
    el('cl-2c-b1', 'text', 1.0, 4.2, 5.0, 2.5, 'Deliver reliable, high-quality outcomes through rigorous testing and review processes.',
      { fontSize: 16, fontFace: CL.font, color: CL.sub, align: 'center', lineSpacing: 1.5 }),
    // Column 2
    ovalEl('cl-2c-o2', 9.0, 1.9, 1.3, CL.card, CL.accent),
    iconEl('cl-2c-i2', 9.15, 2.05, 1.0, ICONS.users, CL.accent),
    el('cl-2c-t2', 'text', 7.3, 3.4, 5.0, 0.7, 'Collaboration',
      { fontSize: 24, fontFace: CL.font, color: CL.text, bold: true, align: 'center' }),
    el('cl-2c-b2', 'text', 7.3, 4.2, 5.0, 2.5, 'Work seamlessly across teams with real-time sharing and integrated communication.',
      { fontSize: 16, fontFace: CL.font, color: CL.sub, align: 'center', lineSpacing: 1.5 }),
  ])),

  // 3-Column layout
  layout('cl-3col', 'Clean', '3 Columns', '3 Column Layout', slide(CL.bg, [
    el('cl-3c-bar', 'shape', 0, 0, 13.333, 0.15, '', {},
      { shape: 'rect', shapeStyle: { fill: CL.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('cl-3c-title', 'text', 0.8, 0.5, 11.7, 0.8, 'How It Works',
      { fontSize: 32, fontFace: CL.font, color: CL.text, bold: true, align: 'left' }),
    el('cl-3c-line', 'line', 0.8, 1.4, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: CL.accent, width: 3 } }),
    // Column 1
    ovalEl('cl-3c-o1', 1.6, 1.9, 1.2, CL.accent, CL.border),
    iconEl('cl-3c-i1', 1.72, 2.02, 0.96, ICONS.star, '#FFFFFF'),
    el('cl-3c-t1', 'text', 0.5, 3.3, 3.4, 0.7, 'Discover',
      { fontSize: 22, fontFace: CL.font, color: CL.text, bold: true, align: 'center' }),
    el('cl-3c-b1', 'text', 0.5, 4.0, 3.4, 2.5, 'Explore features designed to simplify your daily workflow.',
      { fontSize: 15, fontFace: CL.font, color: CL.sub, align: 'center', lineSpacing: 1.5 }),
    // Column 2
    ovalEl('cl-3c-o2', 6.05, 1.9, 1.2, CL.accent2, CL.border),
    iconEl('cl-3c-i2', 6.17, 2.02, 0.96, ICONS.heart, '#FFFFFF'),
    el('cl-3c-t2', 'text', 4.95, 3.3, 3.4, 0.7, 'Engage',
      { fontSize: 22, fontFace: CL.font, color: CL.text, bold: true, align: 'center' }),
    el('cl-3c-b2', 'text', 4.95, 4.0, 3.4, 2.5, 'Build meaningful connections with intuitive collaboration tools.',
      { fontSize: 15, fontFace: CL.font, color: CL.sub, align: 'center', lineSpacing: 1.5 }),
    // Column 3
    ovalEl('cl-3c-o3', 10.5, 1.9, 1.2, CL.accent3, CL.border),
    iconEl('cl-3c-i3', 10.62, 2.02, 0.96, ICONS.trending, '#FFFFFF'),
    el('cl-3c-t3', 'text', 9.4, 3.3, 3.4, 0.7, 'Grow',
      { fontSize: 22, fontFace: CL.font, color: CL.text, bold: true, align: 'center' }),
    el('cl-3c-b3', 'text', 9.4, 4.0, 3.4, 2.5, 'Achieve measurable results and track your progress over time.',
      { fontSize: 15, fontFace: CL.font, color: CL.sub, align: 'center', lineSpacing: 1.5 }),
  ])),

  layout('cl-demo', 'Clean', 'Demo', 'Demo Slide', slide(CL.accent, [
    ovalEl('cl-dm-bg', 4.5, 0.6, 4.0, '#1e4fc2', 'transparent'),
    iconEl('cl-dm-icon', 5.5, 1.6, 2.0, ICONS.play, '#FFFFFF'),
    el('cl-dm-title', 'text', 1.5, 4.8, 10.0, 1.5, 'DEMO',
      { fontSize: 80, fontFace: CL.font, color: '#FFFFFF', bold: true, align: 'center' }),
    el('cl-dm-sub', 'text', 2.5, 6.1, 8.0, 0.8, 'Live demonstration',
      { fontSize: 24, fontFace: CL.font, color: '#c7d2fe', align: 'center' }),
  ])),
];


// ╔══════════════════════════════════════════════════════════════╗
// ║  GOPHER — Go/Golang inspired, cyan & teal with warm accents ║
// ╚══════════════════════════════════════════════════════════════╝
const GO = {
  bg: '#FAFDE8', card: '#EDF5E1', border: '#C5D8A4',
  accent: '#00ADD8', accent2: '#CE3263', accent3: '#5DC9E2',
  text: '#1A202C', sub: '#4A5568', muted: '#A0AEC0',
  font: 'Segoe UI',
  code: '#272822', codeBg: '#2d2d2d',
  headerBg: '#00ADD8',
};

const gopher = [
  layout('go-title', 'Gopher', 'Title', 'Title Slide', slide(GO.bg, [
    el('go-t-bar', 'shape', 0, 0, 13.333, 0.3, '', {},
      { shape: 'rect', shapeStyle: { fill: GO.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('go-t-logo', 'text', 5.0, 0.6, 3.3, 1.0, '🐹',
      { fontSize: 56, fontFace: GO.font, color: GO.text, align: 'center' }),
    el('go-t-title', 'text', 1.5, 2.0, 10.3, 1.5, 'Building with Go',
      { fontSize: 48, fontFace: GO.font, color: GO.text, bold: true, align: 'center' }),
    el('go-t-line', 'line', 4.0, 3.7, 5.3, 0, '', {}, { x1: 0, y1: 0, x2: 5.3, y2: 0, lineStyle: { color: GO.accent, width: 3 } }),
    el('go-t-sub', 'text', 2.5, 4.0, 8.3, 0.8, 'Simple, reliable, efficient — click to edit',
      { fontSize: 22, fontFace: GO.font, color: GO.sub, align: 'center' }),
    el('go-t-date', 'text', 4.5, 5.5, 4.3, 0.5, 'Your Name  |  Date',
      { fontSize: 14, fontFace: GO.font, color: GO.muted, align: 'center' }),
  ])),

  layout('go-section', 'Gopher', 'Section', 'Section Divider', slide(GO.accent, [
    el('go-s-num', 'text', 1.0, 1.0, 2.0, 2.0, '01',
      { fontSize: 80, fontFace: GO.font, color: '#FFFFFF', bold: true, align: 'left' }),
    el('go-s-title', 'text', 1.0, 3.2, 8.0, 1.2, 'Section Title',
      { fontSize: 44, fontFace: GO.font, color: '#FFFFFF', bold: true, align: 'left' }),
    el('go-s-line', 'line', 1.0, 4.6, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: '#FFFFFF', width: 4 } }),
    el('go-s-desc', 'text', 1.0, 5.0, 6.0, 0.8, 'Brief description of what this section covers',
      { fontSize: 18, fontFace: GO.font, color: 'rgba(255,255,255,0.8)', align: 'left' }),
  ])),

  layout('go-agenda', 'Gopher', 'Agenda', 'Agenda', slide(GO.bg, [
    el('go-a-title', 'text', 0.8, 0.4, 5.0, 0.9, 'Agenda',
      { fontSize: 36, fontFace: GO.font, color: GO.text, bold: true, align: 'left' }),
    el('go-a-bar', 'shape', 0.8, 1.3, 0.15, 5.5, '', {},
      { shape: 'rect', shapeStyle: { fill: GO.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('go-a-list', 'text', 1.3, 1.5, 10.5, 5.0, 'Why Go?\nLanguage Fundamentals\nConcurrency Patterns\nStandard Library Deep Dive\nReal-World Examples\nQ & A',
      { fontSize: 24, fontFace: GO.font, color: GO.text, align: 'left', listType: 'numbered', lineSpacing: 2.0 }),
  ])),

  layout('go-bullets', 'Gopher', 'Bullets', 'Bullet Points', slide(GO.bg, [
    el('go-b-title', 'text', 0.8, 0.4, 11.5, 0.9, 'Why Go?',
      { fontSize: 36, fontFace: GO.font, color: GO.text, bold: true, align: 'left' }),
    el('go-b-line', 'line', 0.8, 1.4, 11.5, 0, '', {}, { x1: 0, y1: 0, x2: 11.5, y2: 0, lineStyle: { color: GO.accent, width: 2 } }),
    el('go-b-list', 'text', 1.0, 1.8, 10.5, 4.5, 'Compiles to a single static binary — zero dependencies\nFirst-class concurrency with goroutines & channels\nFast compilation and execution\nExcellent standard library and tooling\nSimplicity by design — easy to read and maintain',
      { fontSize: 22, fontFace: GO.font, color: GO.sub, align: 'left', listType: 'bullet', lineSpacing: 1.8 }),
  ])),

  layout('go-code', 'Gopher', 'Code', 'Code Showcase', slide(GO.code, [
    el('go-c-title', 'text', 0.8, 0.3, 8.0, 0.8, '// Code Example',
      { fontSize: 28, fontFace: 'Consolas', color: GO.accent, bold: true, align: 'left' }),
    el('go-c-lang', 'text', 9.5, 0.4, 3.0, 0.5, 'Go',
      { fontSize: 14, fontFace: GO.font, color: '#8b949e', align: 'right' }),
    el('go-c-code', 'code', 0.8, 1.2, 11.5, 5.0,
      'package main\n\nimport (\n\t"fmt"\n\t"net/http"\n)\n\nfunc handler(w http.ResponseWriter, r *http.Request) {\n\tfmt.Fprintf(w, "Hello, %s!", r.URL.Path[1:])\n}\n\nfunc main() {\n\thttp.HandleFunc("/", handler)\n\tfmt.Println("Server running on :8080")\n\thttp.ListenAndServe(":8080", nil)\n}',
      { fontSize: 17, fontFace: 'Consolas', color: '#d4d4d4', backgroundColor: GO.codeBg }, { language: 'go' }),
    el('go-c-cap', 'text', 0.8, 6.5, 11.5, 0.5, '↑ A simple HTTP server in Go',
      { fontSize: 14, fontFace: GO.font, color: '#484f58', align: 'left' }),
  ])),

  layout('go-compare', 'Gopher', 'Compare', 'Compare & Contrast', slide(GO.bg, [
    el('go-cmp-title', 'text', 0.8, 0.4, 11.5, 0.9, 'Go vs. Others',
      { fontSize: 36, fontFace: GO.font, color: GO.text, bold: true, align: 'center' }),
    el('go-cmp-div', 'line', 6.666, 1.6, 0, 5.0, '', {}, { x1: 0, y1: 0, x2: 0, y2: 5.0, lineStyle: { color: GO.border, width: 2 } }),
    el('go-cmp-lh', 'text', 0.8, 1.5, 5.2, 0.7, 'Go',
      { fontSize: 26, fontFace: GO.font, color: GO.accent, bold: true, align: 'center' }),
    el('go-cmp-lb', 'text', 0.8, 2.4, 5.2, 4.0, 'Single binary deployment\nBuilt-in concurrency primitives\nFast compile times\nOpinionated formatting (gofmt)',
      { fontSize: 18, fontFace: GO.font, color: GO.sub, align: 'left', listType: 'bullet', lineSpacing: 1.6 }),
    el('go-cmp-rh', 'text', 7.2, 1.5, 5.2, 0.7, 'Alternative',
      { fontSize: 26, fontFace: GO.font, color: GO.accent2, bold: true, align: 'center' }),
    el('go-cmp-rb', 'text', 7.2, 2.4, 5.2, 4.0, 'Runtime / VM dependencies\nThread-based concurrency\nSlower build pipeline\nMultiple style options',
      { fontSize: 18, fontFace: GO.font, color: GO.sub, align: 'left', listType: 'bullet', lineSpacing: 1.6 }),
  ])),

  layout('go-quote', 'Gopher', 'Quote', 'Quote', slide(GO.bg, [
    el('go-q-bar', 'shape', 0, 0, 0.4, 7.5, '', {},
      { shape: 'rect', shapeStyle: { fill: GO.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('go-q-mark', 'text', 1.5, 0.8, 2.0, 2.0, '\u201C',
      { fontSize: 120, fontFace: 'Georgia', color: GO.accent, bold: false, align: 'left' }),
    el('go-q-text', 'text', 2.0, 2.2, 9.0, 2.5, 'Simplicity is complicated.',
      { fontSize: 32, fontFace: 'Georgia', color: GO.text, bold: false, italic: true, align: 'left', lineSpacing: 1.5 }),
    el('go-q-line', 'line', 2.0, 5.0, 2.5, 0, '', {}, { x1: 0, y1: 0, x2: 2.5, y2: 0, lineStyle: { color: GO.accent, width: 3 } }),
    el('go-q-auth', 'text', 2.0, 5.3, 9.0, 0.6, '— Rob Pike, Co-creator of Go',
      { fontSize: 20, fontFace: 'Georgia', color: GO.sub, align: 'left' }),
  ])),

  layout('go-image', 'Gopher', 'Image', 'Image + Text', slide(GO.bg, [
    el('go-i-ph', 'shape', 0.6, 0.6, 5.5, 6.0, '🐹\nDrop image here',
      { fontSize: 24, fontFace: GO.font, color: GO.sub, align: 'center' },
      { shape: 'roundedRect', shapeStyle: { fill: GO.card, borderColor: GO.border, borderWidth: 2 } }),
    el('go-i-title', 'text', 6.8, 0.8, 5.7, 0.9, 'Architecture Overview',
      { fontSize: 32, fontFace: GO.font, color: GO.text, bold: true, align: 'left' }),
    el('go-i-line', 'line', 6.8, 1.8, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: GO.accent, width: 3 } }),
    el('go-i-body', 'text', 6.8, 2.2, 5.7, 4.0, 'Replace the placeholder with your diagram, architecture, or screenshot.\n\nUse this layout to showcase system design or application structure.',
      { fontSize: 18, fontFace: GO.font, color: GO.sub, align: 'left', lineSpacing: 1.5 }),
  ])),

  layout('go-thanks', 'Gopher', 'Thank You', 'Thank You', slide(GO.bg, [
    el('go-ty-bar', 'shape', 0, 7.25, 13.333, 0.25, '', {},
      { shape: 'rect', shapeStyle: { fill: GO.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('go-ty-gopher', 'text', 5.4, 0.8, 2.5, 1.5, '🐹',
      { fontSize: 72, fontFace: GO.font, color: GO.text, align: 'center' }),
    el('go-ty-title', 'text', 1.5, 2.5, 10.3, 1.5, 'Thank You!',
      { fontSize: 64, fontFace: GO.font, color: GO.text, bold: true, align: 'center' }),
    el('go-ty-line', 'line', 5.0, 4.2, 3.3, 0, '', {}, { x1: 0, y1: 0, x2: 3.3, y2: 0, lineStyle: { color: GO.accent, width: 3 } }),
    el('go-ty-info', 'text', 2.0, 4.7, 9.3, 1.0, 'your.email@company.com\ngithub.com/yourhandle',
      { fontSize: 18, fontFace: GO.font, color: GO.sub, align: 'center', lineSpacing: 1.6 }),
  ])),

  layout('go-table', 'Gopher', 'Table', 'Data Table', slide(GO.bg, [
    el('go-tbl-title', 'text', 0.8, 0.4, 11.7, 0.8, 'Benchmark Results',
      { fontSize: 32, fontFace: GO.font, color: GO.text, bold: true, align: 'left' }),
    el('go-tbl-line', 'line', 0.8, 1.3, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: GO.accent, width: 3 } }),
    tableEl('go-tbl-data', 0.8, 1.8, 11.7, 4.5,
      [
        ['Benchmark', 'Go', 'Node.js', 'Python', 'Java'],
        ['HTTP Throughput', '120K rps', '45K rps', '8K rps', '95K rps'],
        ['Memory Usage', '12 MB', '65 MB', '45 MB', '180 MB'],
        ['Startup Time', '5 ms', '120 ms', '200 ms', '1500 ms'],
        ['Binary Size', '8 MB', 'N/A', 'N/A', '40 MB'],
      ],
      { borderColor: GO.border, borderWidth: 1, headerBg: GO.accent, headerColor: '#FFFFFF', cellBg: '#FFFFFF', cellColor: GO.text, altRowBg: GO.card, fontSize: 16, fontFace: GO.font }
    ),
  ])),

  // 2-Column layout
  layout('go-2col', 'Gopher', '2 Columns', '2 Column Layout', slide(GO.bg, [
    el('go-2c-bar', 'shape', 0, 0, 13.333, 0.15, '', {},
      { shape: 'rect', shapeStyle: { fill: GO.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('go-2c-title', 'text', 0.8, 0.5, 11.7, 0.8, 'Go\'s Strengths',
      { fontSize: 32, fontFace: GO.font, color: GO.text, bold: true, align: 'left' }),
    el('go-2c-line', 'line', 0.8, 1.4, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: GO.accent, width: 3 } }),
    // Column 1
    ovalEl('go-2c-o1', 2.3, 1.9, 1.3, GO.accent, GO.border),
    iconEl('go-2c-i1', 2.45, 2.05, 1.0, ICONS.zap, '#FFFFFF'),
    el('go-2c-t1', 'text', 1.0, 3.4, 5.0, 0.7, 'Concurrency',
      { fontSize: 24, fontFace: GO.font, color: GO.text, bold: true, align: 'center' }),
    el('go-2c-b1', 'text', 1.0, 4.2, 5.0, 2.5, 'Goroutines and channels make concurrent programming simple, safe, and efficient.',
      { fontSize: 16, fontFace: GO.font, color: GO.sub, align: 'center', lineSpacing: 1.5 }),
    // Column 2
    ovalEl('go-2c-o2', 9.0, 1.9, 1.3, GO.card, GO.accent),
    iconEl('go-2c-i2', 9.15, 2.05, 1.0, ICONS.shield, GO.accent),
    el('go-2c-t2', 'text', 7.3, 3.4, 5.0, 0.7, 'Type Safety',
      { fontSize: 24, fontFace: GO.font, color: GO.text, bold: true, align: 'center' }),
    el('go-2c-b2', 'text', 7.3, 4.2, 5.0, 2.5, 'Static typing with interfaces catches bugs at compile time, not in production.',
      { fontSize: 16, fontFace: GO.font, color: GO.sub, align: 'center', lineSpacing: 1.5 }),
  ])),

  // 3-Column layout
  layout('go-3col', 'Gopher', '3 Columns', '3 Column Layout', slide(GO.bg, [
    el('go-3c-bar', 'shape', 0, 0, 13.333, 0.15, '', {},
      { shape: 'rect', shapeStyle: { fill: GO.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('go-3c-title', 'text', 0.8, 0.5, 11.7, 0.8, 'The Go Toolchain',
      { fontSize: 32, fontFace: GO.font, color: GO.text, bold: true, align: 'left' }),
    el('go-3c-line', 'line', 0.8, 1.4, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: GO.accent, width: 3 } }),
    // Column 1
    ovalEl('go-3c-o1', 1.6, 1.9, 1.2, GO.accent, GO.border),
    iconEl('go-3c-i1', 1.72, 2.02, 0.96, ICONS.code, '#FFFFFF'),
    el('go-3c-t1', 'text', 0.5, 3.3, 3.4, 0.7, 'go build',
      { fontSize: 22, fontFace: 'Consolas', color: GO.text, bold: true, align: 'center' }),
    el('go-3c-b1', 'text', 0.5, 4.0, 3.4, 2.5, 'Compile to a single static binary with zero external dependencies.',
      { fontSize: 15, fontFace: GO.font, color: GO.sub, align: 'center', lineSpacing: 1.5 }),
    // Column 2
    ovalEl('go-3c-o2', 6.05, 1.9, 1.2, GO.accent2, GO.border),
    iconEl('go-3c-i2', 6.17, 2.02, 0.96, ICONS.checkmark, '#FFFFFF'),
    el('go-3c-t2', 'text', 4.95, 3.3, 3.4, 0.7, 'go test',
      { fontSize: 22, fontFace: 'Consolas', color: GO.text, bold: true, align: 'center' }),
    el('go-3c-b2', 'text', 4.95, 4.0, 3.4, 2.5, 'Built-in testing, benchmarking, and coverage — no extra frameworks needed.',
      { fontSize: 15, fontFace: GO.font, color: GO.sub, align: 'center', lineSpacing: 1.5 }),
    // Column 3
    ovalEl('go-3c-o3', 10.5, 1.9, 1.2, GO.accent3, GO.border),
    iconEl('go-3c-i3', 10.62, 2.02, 0.96, ICONS.trending, '#FFFFFF'),
    el('go-3c-t3', 'text', 9.4, 3.3, 3.4, 0.7, 'go mod',
      { fontSize: 22, fontFace: 'Consolas', color: GO.text, bold: true, align: 'center' }),
    el('go-3c-b3', 'text', 9.4, 4.0, 3.4, 2.5, 'Dependency management with reproducible builds and semantic versioning.',
      { fontSize: 15, fontFace: GO.font, color: GO.sub, align: 'center', lineSpacing: 1.5 }),
  ])),

  layout('go-demo', 'Gopher', 'Demo', 'Demo Slide', slide(GO.accent, [
    ovalEl('go-dm-bg', 4.5, 0.6, 4.0, '#0090B5', 'transparent'),
    iconEl('go-dm-icon', 5.5, 1.6, 2.0, ICONS.terminal, '#FFFFFF'),
    el('go-dm-title', 'text', 1.5, 4.8, 10.0, 1.5, 'DEMO',
      { fontSize: 80, fontFace: 'Consolas', color: '#FFFFFF', bold: true, align: 'center' }),
    el('go-dm-sub', 'text', 2.5, 6.1, 8.0, 0.8, 'Live Go coding session',
      { fontSize: 24, fontFace: GO.font, color: '#b3e6f4', align: 'center' }),
  ])),
];


// ╔══════════════════════════════════════════════════════════════╗
// ║  RUSTACEAN — Rust-inspired, warm orange & dark tones        ║
// ╚══════════════════════════════════════════════════════════════╝
const RS = {
  bg: '#1a1a2e', card: '#16213e', border: '#0f3460',
  accent: '#E43F1A', accent2: '#F5A623', accent3: '#7B68EE',
  text: '#F0F0F0', sub: '#B0B8C8', muted: '#6B7280',
  font: 'Segoe UI',
  code: '#1e1e1e', codeBg: '#1e1e1e',
  headerBg: '#E43F1A',
};

const rustacean = [
  layout('rs-title', 'Rustacean', 'Title', 'Title Slide', slide(RS.bg, [
    el('rs-t-bar', 'shape', 0, 0, 13.333, 0.25, '', {},
      { shape: 'rect', shapeStyle: { fill: RS.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('rs-t-logo', 'text', 5.0, 0.6, 3.3, 1.0, '🦀',
      { fontSize: 56, fontFace: RS.font, color: RS.text, align: 'center' }),
    el('rs-t-title', 'text', 1.5, 2.0, 10.3, 1.5, 'Fearless Systems Programming',
      { fontSize: 46, fontFace: RS.font, color: RS.text, bold: true, align: 'center' }),
    el('rs-t-line', 'line', 4.0, 3.7, 5.3, 0, '', {}, { x1: 0, y1: 0, x2: 5.3, y2: 0, lineStyle: { color: RS.accent, width: 3 } }),
    el('rs-t-sub', 'text', 2.5, 4.0, 8.3, 0.8, 'Safe. Fast. Concurrent. — click to edit',
      { fontSize: 22, fontFace: RS.font, color: RS.sub, align: 'center' }),
    el('rs-t-date', 'text', 4.5, 5.5, 4.3, 0.5, 'Your Name  |  Date',
      { fontSize: 14, fontFace: RS.font, color: RS.muted, align: 'center' }),
  ])),

  layout('rs-section', 'Rustacean', 'Section', 'Section Divider', slide(RS.accent, [
    el('rs-s-num', 'text', 1.0, 1.0, 2.0, 2.0, '01',
      { fontSize: 80, fontFace: RS.font, color: '#FFFFFF', bold: true, align: 'left' }),
    el('rs-s-title', 'text', 1.0, 3.2, 8.0, 1.2, 'Section Title',
      { fontSize: 44, fontFace: RS.font, color: '#FFFFFF', bold: true, align: 'left' }),
    el('rs-s-line', 'line', 1.0, 4.6, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: '#FFFFFF', width: 4 } }),
    el('rs-s-desc', 'text', 1.0, 5.0, 6.0, 0.8, 'Brief description of what this section covers',
      { fontSize: 18, fontFace: RS.font, color: 'rgba(255,255,255,0.8)', align: 'left' }),
  ])),

  layout('rs-agenda', 'Rustacean', 'Agenda', 'Agenda', slide(RS.bg, [
    el('rs-a-title', 'text', 0.8, 0.4, 5.0, 0.9, 'Agenda',
      { fontSize: 36, fontFace: RS.font, color: RS.text, bold: true, align: 'left' }),
    el('rs-a-bar', 'shape', 0.8, 1.3, 0.15, 5.5, '', {},
      { shape: 'rect', shapeStyle: { fill: RS.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('rs-a-list', 'text', 1.3, 1.5, 10.5, 5.0, 'Ownership & Borrowing\nPattern Matching\nError Handling with Result & Option\nTraits & Generics\nAsync Rust & Tokio\nQ & A',
      { fontSize: 24, fontFace: RS.font, color: RS.text, align: 'left', listType: 'numbered', lineSpacing: 2.0 }),
  ])),

  layout('rs-bullets', 'Rustacean', 'Bullets', 'Bullet Points', slide(RS.bg, [
    el('rs-b-title', 'text', 0.8, 0.4, 11.5, 0.9, 'Why Rust?',
      { fontSize: 36, fontFace: RS.font, color: RS.text, bold: true, align: 'left' }),
    el('rs-b-line', 'line', 0.8, 1.4, 11.5, 0, '', {}, { x1: 0, y1: 0, x2: 11.5, y2: 0, lineStyle: { color: RS.accent, width: 2 } }),
    el('rs-b-list', 'text', 1.0, 1.8, 10.5, 4.5, 'Memory safety without a garbage collector\nZero-cost abstractions — pay for what you use\nFearless concurrency with ownership model\nPattern matching and algebraic data types\nBest-in-class tooling: cargo, clippy, rustfmt',
      { fontSize: 22, fontFace: RS.font, color: RS.sub, align: 'left', listType: 'bullet', lineSpacing: 1.8 }),
  ])),

  layout('rs-code', 'Rustacean', 'Code', 'Code Showcase', slide(RS.code, [
    el('rs-c-title', 'text', 0.8, 0.3, 8.0, 0.8, '// Code Example',
      { fontSize: 28, fontFace: 'Consolas', color: RS.accent, bold: true, align: 'left' }),
    el('rs-c-lang', 'text', 9.5, 0.4, 3.0, 0.5, 'Rust',
      { fontSize: 14, fontFace: RS.font, color: '#8b949e', align: 'right' }),
    el('rs-c-code', 'code', 0.8, 1.2, 11.5, 5.0,
      'use std::collections::HashMap;\n\nfn word_count(text: &str) -> HashMap<&str, usize> {\n    let mut counts = HashMap::new();\n    for word in text.split_whitespace() {\n        *counts.entry(word).or_insert(0) += 1;\n    }\n    counts\n}\n\nfn main() {\n    let text = "hello world hello rust";\n    let counts = word_count(text);\n    for (word, count) in &counts {\n        println!("{word}: {count}");\n    }\n}',
      { fontSize: 17, fontFace: 'Consolas', color: '#d4d4d4', backgroundColor: RS.codeBg }, { language: 'rust' }),
    el('rs-c-cap', 'text', 0.8, 6.5, 11.5, 0.5, '↑ Word frequency counter using HashMap',
      { fontSize: 14, fontFace: RS.font, color: '#484f58', align: 'left' }),
  ])),

  layout('rs-compare', 'Rustacean', 'Compare', 'Compare & Contrast', slide(RS.bg, [
    el('rs-cmp-title', 'text', 0.8, 0.4, 11.5, 0.9, 'Rust vs. C++',
      { fontSize: 36, fontFace: RS.font, color: RS.text, bold: true, align: 'center' }),
    el('rs-cmp-div', 'line', 6.666, 1.6, 0, 5.0, '', {}, { x1: 0, y1: 0, x2: 0, y2: 5.0, lineStyle: { color: RS.border, width: 2 } }),
    el('rs-cmp-lh', 'text', 0.8, 1.5, 5.2, 0.7, 'Rust',
      { fontSize: 26, fontFace: RS.font, color: RS.accent, bold: true, align: 'center' }),
    el('rs-cmp-lb', 'text', 0.8, 2.4, 5.2, 4.0, 'Ownership prevents data races at compile time\nNo null — uses Option<T> instead\nCargo for builds, deps, and testing\nPattern matching with exhaustiveness checks',
      { fontSize: 18, fontFace: RS.font, color: RS.sub, align: 'left', listType: 'bullet', lineSpacing: 1.6 }),
    el('rs-cmp-rh', 'text', 7.2, 1.5, 5.2, 0.7, 'C++',
      { fontSize: 26, fontFace: RS.font, color: RS.accent2, bold: true, align: 'center' }),
    el('rs-cmp-rb', 'text', 7.2, 2.4, 5.2, 4.0, 'Manual memory management or smart pointers\nNull pointers and undefined behavior\nComplex build systems (CMake, Make, etc.)\nTemplate metaprogramming complexity',
      { fontSize: 18, fontFace: RS.font, color: RS.sub, align: 'left', listType: 'bullet', lineSpacing: 1.6 }),
  ])),

  layout('rs-quote', 'Rustacean', 'Quote', 'Quote', slide(RS.bg, [
    el('rs-q-bar', 'shape', 0, 0, 0.4, 7.5, '', {},
      { shape: 'rect', shapeStyle: { fill: RS.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('rs-q-mark', 'text', 1.5, 0.8, 2.0, 2.0, '\u201C',
      { fontSize: 120, fontFace: 'Georgia', color: RS.accent, bold: false, align: 'left' }),
    el('rs-q-text', 'text', 2.0, 2.2, 9.0, 2.5, 'Rust is a language empowering everyone to build reliable and efficient software.',
      { fontSize: 32, fontFace: 'Georgia', color: RS.text, bold: false, italic: true, align: 'left', lineSpacing: 1.5 }),
    el('rs-q-line', 'line', 2.0, 5.0, 2.5, 0, '', {}, { x1: 0, y1: 0, x2: 2.5, y2: 0, lineStyle: { color: RS.accent, width: 3 } }),
    el('rs-q-auth', 'text', 2.0, 5.3, 9.0, 0.6, '— The Rust Programming Language Book',
      { fontSize: 20, fontFace: 'Georgia', color: RS.sub, align: 'left' }),
  ])),

  layout('rs-image', 'Rustacean', 'Image', 'Image + Text', slide(RS.bg, [
    el('rs-i-ph', 'shape', 0.6, 0.6, 5.5, 6.0, '🦀\nDrop image here',
      { fontSize: 24, fontFace: RS.font, color: RS.sub, align: 'center' },
      { shape: 'roundedRect', shapeStyle: { fill: RS.card, borderColor: RS.border, borderWidth: 2 } }),
    el('rs-i-title', 'text', 6.8, 0.8, 5.7, 0.9, 'System Architecture',
      { fontSize: 32, fontFace: RS.font, color: RS.text, bold: true, align: 'left' }),
    el('rs-i-line', 'line', 6.8, 1.8, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: RS.accent, width: 3 } }),
    el('rs-i-body', 'text', 6.8, 2.2, 5.7, 4.0, 'Replace the placeholder with your diagram, architecture, or screenshot.\n\nShowcase your systems-level design with confidence.',
      { fontSize: 18, fontFace: RS.font, color: RS.sub, align: 'left', lineSpacing: 1.5 }),
  ])),

  layout('rs-thanks', 'Rustacean', 'Thank You', 'Thank You', slide(RS.bg, [
    el('rs-ty-bar', 'shape', 0, 7.25, 13.333, 0.25, '', {},
      { shape: 'rect', shapeStyle: { fill: RS.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('rs-ty-crab', 'text', 5.4, 0.8, 2.5, 1.5, '🦀',
      { fontSize: 72, fontFace: RS.font, color: RS.text, align: 'center' }),
    el('rs-ty-title', 'text', 1.5, 2.5, 10.3, 1.5, 'Thank You!',
      { fontSize: 64, fontFace: RS.font, color: RS.text, bold: true, align: 'center' }),
    el('rs-ty-line', 'line', 5.0, 4.2, 3.3, 0, '', {}, { x1: 0, y1: 0, x2: 3.3, y2: 0, lineStyle: { color: RS.accent, width: 3 } }),
    el('rs-ty-info', 'text', 2.0, 4.7, 9.3, 1.0, 'your.email@company.com\ngithub.com/yourhandle',
      { fontSize: 18, fontFace: RS.font, color: RS.sub, align: 'center', lineSpacing: 1.6 }),
  ])),

  layout('rs-table', 'Rustacean', 'Table', 'Data Table', slide(RS.bg, [
    el('rs-tbl-title', 'text', 0.8, 0.4, 11.7, 0.8, 'Ecosystem Comparison',
      { fontSize: 32, fontFace: RS.font, color: RS.text, bold: true, align: 'left' }),
    el('rs-tbl-line', 'line', 0.8, 1.3, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: RS.accent, width: 3 } }),
    tableEl('rs-tbl-data', 0.8, 1.8, 11.7, 4.5,
      [
        ['Crate', 'Category', 'Stars', 'Downloads/mo'],
        ['tokio', 'Async Runtime', '24K', '12M'],
        ['serde', 'Serialization', '8K', '25M'],
        ['actix-web', 'Web Framework', '19K', '3M'],
        ['clap', 'CLI Parsing', '12K', '8M'],
      ],
      { borderColor: RS.border, borderWidth: 1, headerBg: RS.accent, headerColor: '#FFFFFF', cellBg: RS.card, cellColor: RS.text, altRowBg: '#1d2740', fontSize: 16, fontFace: RS.font }
    ),
  ])),

  // 2-Column layout
  layout('rs-2col', 'Rustacean', '2 Columns', '2 Column Layout', slide(RS.bg, [
    el('rs-2c-bar', 'shape', 0, 0, 13.333, 0.15, '', {},
      { shape: 'rect', shapeStyle: { fill: RS.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('rs-2c-title', 'text', 0.8, 0.5, 11.7, 0.8, 'Rust\'s Guarantees',
      { fontSize: 32, fontFace: RS.font, color: RS.text, bold: true, align: 'left' }),
    el('rs-2c-line', 'line', 0.8, 1.4, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: RS.accent, width: 3 } }),
    // Column 1
    ovalEl('rs-2c-o1', 2.3, 1.9, 1.3, RS.accent, RS.border),
    iconEl('rs-2c-i1', 2.45, 2.05, 1.0, ICONS.shield, '#FFFFFF'),
    el('rs-2c-t1', 'text', 1.0, 3.4, 5.0, 0.7, 'Memory Safety',
      { fontSize: 24, fontFace: RS.font, color: RS.text, bold: true, align: 'center' }),
    el('rs-2c-b1', 'text', 1.0, 4.2, 5.0, 2.5, 'The borrow checker eliminates data races, use-after-free, and buffer overflows at compile time.',
      { fontSize: 16, fontFace: RS.font, color: RS.sub, align: 'center', lineSpacing: 1.5 }),
    // Column 2
    ovalEl('rs-2c-o2', 9.0, 1.9, 1.3, RS.accent2, RS.border),
    iconEl('rs-2c-i2', 9.15, 2.05, 1.0, ICONS.zap, '#FFFFFF'),
    el('rs-2c-t2', 'text', 7.3, 3.4, 5.0, 0.7, 'Zero-Cost Abstractions',
      { fontSize: 24, fontFace: RS.font, color: RS.text, bold: true, align: 'center' }),
    el('rs-2c-b2', 'text', 7.3, 4.2, 5.0, 2.5, 'High-level ergonomics with low-level performance — iterators compile to the same code as hand-written loops.',
      { fontSize: 16, fontFace: RS.font, color: RS.sub, align: 'center', lineSpacing: 1.5 }),
  ])),

  // 3-Column layout
  layout('rs-3col', 'Rustacean', '3 Columns', '3 Column Layout', slide(RS.bg, [
    el('rs-3c-bar', 'shape', 0, 0, 13.333, 0.15, '', {},
      { shape: 'rect', shapeStyle: { fill: RS.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('rs-3c-title', 'text', 0.8, 0.5, 11.7, 0.8, 'The Cargo Toolchain',
      { fontSize: 32, fontFace: RS.font, color: RS.text, bold: true, align: 'left' }),
    el('rs-3c-line', 'line', 0.8, 1.4, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: RS.accent, width: 3 } }),
    // Column 1
    ovalEl('rs-3c-o1', 1.6, 1.9, 1.2, RS.accent, RS.border),
    iconEl('rs-3c-i1', 1.72, 2.02, 0.96, ICONS.code, '#FFFFFF'),
    el('rs-3c-t1', 'text', 0.5, 3.3, 3.4, 0.7, 'cargo build',
      { fontSize: 22, fontFace: 'Consolas', color: RS.text, bold: true, align: 'center' }),
    el('rs-3c-b1', 'text', 0.5, 4.0, 3.4, 2.5, 'Compile optimized binaries with incremental builds and cross-compilation support.',
      { fontSize: 15, fontFace: RS.font, color: RS.sub, align: 'center', lineSpacing: 1.5 }),
    // Column 2
    ovalEl('rs-3c-o2', 6.05, 1.9, 1.2, RS.accent2, RS.border),
    iconEl('rs-3c-i2', 6.17, 2.02, 0.96, ICONS.checkmark, '#FFFFFF'),
    el('rs-3c-t2', 'text', 4.95, 3.3, 3.4, 0.7, 'cargo test',
      { fontSize: 22, fontFace: 'Consolas', color: RS.text, bold: true, align: 'center' }),
    el('rs-3c-b2', 'text', 4.95, 4.0, 3.4, 2.5, 'Built-in unit tests, integration tests, doc tests, and benchmarks — all in one command.',
      { fontSize: 15, fontFace: RS.font, color: RS.sub, align: 'center', lineSpacing: 1.5 }),
    // Column 3
    ovalEl('rs-3c-o3', 10.5, 1.9, 1.2, RS.accent3, RS.border),
    iconEl('rs-3c-i3', 10.62, 2.02, 0.96, ICONS.globe, '#FFFFFF'),
    el('rs-3c-t3', 'text', 9.4, 3.3, 3.4, 0.7, 'crates.io',
      { fontSize: 22, fontFace: 'Consolas', color: RS.text, bold: true, align: 'center' }),
    el('rs-3c-b3', 'text', 9.4, 4.0, 3.4, 2.5, 'Over 140K crates available — add dependencies with a single line in Cargo.toml.',
      { fontSize: 15, fontFace: RS.font, color: RS.sub, align: 'center', lineSpacing: 1.5 }),
  ])),

  layout('rs-demo', 'Rustacean', 'Demo', 'Demo Slide', slide('#0f0c24', [
    ovalEl('rs-dm-bg', 4.5, 0.6, 4.0, '#2a1a0a', RS.accent),
    iconEl('rs-dm-icon', 5.5, 1.6, 2.0, ICONS.terminal, RS.accent),
    el('rs-dm-title', 'text', 1.5, 4.8, 10.0, 1.5, 'DEMO',
      { fontSize: 80, fontFace: 'Consolas', color: '#FFFFFF', bold: true, align: 'center' }),
    el('rs-dm-sub', 'text', 2.5, 6.1, 8.0, 0.8, 'Zero-cost abstractions in action',
      { fontSize: 24, fontFace: RS.font, color: RS.sub, align: 'center' }),
  ])),
];


// ╔══════════════════════════════════════════════════════════════╗
// ║  JAVASCRIPT — Warm yellow & modern dark tones               ║
// ╚══════════════════════════════════════════════════════════════╝
const JSC = {
  bg: '#1e1e1e', card: '#252526', border: '#3e3e42',
  accent: '#F7DF1E', accent2: '#61DAFB', accent3: '#68D391',
  text: '#E8E8E8', sub: '#A0A0A0', muted: '#666666',
  font: 'Segoe UI',
  code: '#1e1e1e', codeBg: '#1e1e1e',
  headerBg: '#F7DF1E',
};

const javascript = [
  layout('js-title', 'JavaScript', 'Title', 'Title Slide', slide(JSC.bg, [
    el('js-t-bar', 'shape', 0, 0, 13.333, 0.25, '', {},
      { shape: 'rect', shapeStyle: { fill: JSC.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('js-t-logo', 'text', 5.0, 0.6, 3.3, 1.0, 'JS',
      { fontSize: 56, fontFace: 'Consolas', color: '#000000', bold: true, align: 'center', backgroundColor: JSC.accent }),
    el('js-t-title', 'text', 1.5, 2.0, 10.3, 1.5, 'Modern JavaScript',
      { fontSize: 48, fontFace: JSC.font, color: JSC.text, bold: true, align: 'center' }),
    el('js-t-line', 'line', 4.0, 3.7, 5.3, 0, '', {}, { x1: 0, y1: 0, x2: 5.3, y2: 0, lineStyle: { color: JSC.accent, width: 3 } }),
    el('js-t-sub', 'text', 2.5, 4.0, 8.3, 0.8, 'The language of the web — click to edit',
      { fontSize: 22, fontFace: JSC.font, color: JSC.sub, align: 'center' }),
    el('js-t-date', 'text', 4.5, 5.5, 4.3, 0.5, 'Your Name  |  Date',
      { fontSize: 14, fontFace: JSC.font, color: JSC.muted, align: 'center' }),
  ])),

  layout('js-section', 'JavaScript', 'Section', 'Section Divider', slide(JSC.accent, [
    el('js-s-num', 'text', 1.0, 1.0, 2.0, 2.0, '01',
      { fontSize: 80, fontFace: JSC.font, color: '#000000', bold: true, align: 'left' }),
    el('js-s-title', 'text', 1.0, 3.2, 8.0, 1.2, 'Section Title',
      { fontSize: 44, fontFace: JSC.font, color: '#000000', bold: true, align: 'left' }),
    el('js-s-line', 'line', 1.0, 4.6, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: '#000000', width: 4 } }),
    el('js-s-desc', 'text', 1.0, 5.0, 6.0, 0.8, 'Brief description of what this section covers',
      { fontSize: 18, fontFace: JSC.font, color: 'rgba(0,0,0,0.65)', align: 'left' }),
  ])),

  layout('js-agenda', 'JavaScript', 'Agenda', 'Agenda', slide(JSC.bg, [
    el('js-a-title', 'text', 0.8, 0.4, 5.0, 0.9, 'Agenda',
      { fontSize: 36, fontFace: JSC.font, color: JSC.text, bold: true, align: 'left' }),
    el('js-a-bar', 'shape', 0.8, 1.3, 0.15, 5.5, '', {},
      { shape: 'rect', shapeStyle: { fill: JSC.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('js-a-list', 'text', 1.3, 1.5, 10.5, 5.0, 'ES2024+ Features\nAsync/Await & Promises\nModules & Bundling\nFramework Landscape\nPerformance Patterns\nQ & A',
      { fontSize: 24, fontFace: JSC.font, color: JSC.text, align: 'left', listType: 'numbered', lineSpacing: 2.0 }),
  ])),

  layout('js-bullets', 'JavaScript', 'Bullets', 'Bullet Points', slide(JSC.bg, [
    el('js-b-title', 'text', 0.8, 0.4, 11.5, 0.9, 'Why JavaScript?',
      { fontSize: 36, fontFace: JSC.font, color: JSC.text, bold: true, align: 'left' }),
    el('js-b-line', 'line', 0.8, 1.4, 11.5, 0, '', {}, { x1: 0, y1: 0, x2: 11.5, y2: 0, lineStyle: { color: JSC.accent, width: 2 } }),
    el('js-b-list', 'text', 1.0, 1.8, 10.5, 4.5, 'Runs everywhere — browser, server, mobile, desktop\nMassive ecosystem with npm (2M+ packages)\nFirst-class async with Promises and async/await\nDynamic and flexible — prototype-based OOP\nConstantly evolving — yearly spec updates via TC39',
      { fontSize: 22, fontFace: JSC.font, color: JSC.sub, align: 'left', listType: 'bullet', lineSpacing: 1.8 }),
  ])),

  layout('js-code', 'JavaScript', 'Code', 'Code Showcase', slide(JSC.code, [
    el('js-c-title', 'text', 0.8, 0.3, 8.0, 0.8, '// Code Example',
      { fontSize: 28, fontFace: 'Consolas', color: JSC.accent, bold: true, align: 'left' }),
    el('js-c-lang', 'text', 9.5, 0.4, 3.0, 0.5, 'JavaScript',
      { fontSize: 14, fontFace: JSC.font, color: '#8b949e', align: 'right' }),
    el('js-c-code', 'code', 0.8, 1.2, 11.5, 5.0,
      'const fetchUsers = async (query) => {\n  const response = await fetch(\n    `/api/users?q=${encodeURIComponent(query)}`\n  );\n  if (!response.ok) {\n    throw new Error(`HTTP ${response.status}`);\n  }\n  const { data, total } = await response.json();\n  return data.map(user => ({\n    ...user,\n    displayName: `${user.first} ${user.last}`,\n    joined: new Date(user.createdAt),\n  }));\n};\n\nconst users = await fetchUsers("dev");\nconsole.log(`Found ${users.length} users`);',
      { fontSize: 16, fontFace: 'Consolas', color: '#d4d4d4', backgroundColor: JSC.codeBg }, { language: 'javascript' }),
    el('js-c-cap', 'text', 0.8, 6.5, 11.5, 0.5, '↑ Async API call with modern destructuring',
      { fontSize: 14, fontFace: JSC.font, color: '#484f58', align: 'left' }),
  ])),

  layout('js-compare', 'JavaScript', 'Compare', 'Compare & Contrast', slide(JSC.bg, [
    el('js-cmp-title', 'text', 0.8, 0.4, 11.5, 0.9, 'TypeScript vs. JavaScript',
      { fontSize: 36, fontFace: JSC.font, color: JSC.text, bold: true, align: 'center' }),
    el('js-cmp-div', 'line', 6.666, 1.6, 0, 5.0, '', {}, { x1: 0, y1: 0, x2: 0, y2: 5.0, lineStyle: { color: JSC.border, width: 2 } }),
    el('js-cmp-lh', 'text', 0.8, 1.5, 5.2, 0.7, 'TypeScript',
      { fontSize: 26, fontFace: JSC.font, color: '#3178C6', bold: true, align: 'center' }),
    el('js-cmp-lb', 'text', 0.8, 2.4, 5.2, 4.0, 'Static type checking at compile time\nRich IDE support and refactoring\nInterfaces, generics, and enums\nGradual adoption possible',
      { fontSize: 18, fontFace: JSC.font, color: JSC.sub, align: 'left', listType: 'bullet', lineSpacing: 1.6 }),
    el('js-cmp-rh', 'text', 7.2, 1.5, 5.2, 0.7, 'JavaScript',
      { fontSize: 26, fontFace: JSC.font, color: JSC.accent, bold: true, align: 'center' }),
    el('js-cmp-rb', 'text', 7.2, 2.4, 5.2, 4.0, 'No compilation step required\nMaximum flexibility and speed\nSmaller learning curve\nNative browser support',
      { fontSize: 18, fontFace: JSC.font, color: JSC.sub, align: 'left', listType: 'bullet', lineSpacing: 1.6 }),
  ])),

  layout('js-quote', 'JavaScript', 'Quote', 'Quote', slide(JSC.bg, [
    el('js-q-bar', 'shape', 0, 0, 0.4, 7.5, '', {},
      { shape: 'rect', shapeStyle: { fill: JSC.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('js-q-mark', 'text', 1.5, 0.8, 2.0, 2.0, '\u201C',
      { fontSize: 120, fontFace: 'Georgia', color: JSC.accent, bold: false, align: 'left' }),
    el('js-q-text', 'text', 2.0, 2.2, 9.0, 2.5, 'Any application that can be written in JavaScript, will eventually be written in JavaScript.',
      { fontSize: 32, fontFace: 'Georgia', color: JSC.text, bold: false, italic: true, align: 'left', lineSpacing: 1.5 }),
    el('js-q-line', 'line', 2.0, 5.0, 2.5, 0, '', {}, { x1: 0, y1: 0, x2: 2.5, y2: 0, lineStyle: { color: JSC.accent, width: 3 } }),
    el('js-q-auth', 'text', 2.0, 5.3, 9.0, 0.6, "— Jeff Atwood, Atwood's Law",
      { fontSize: 20, fontFace: 'Georgia', color: JSC.sub, align: 'left' }),
  ])),

  layout('js-image', 'JavaScript', 'Image', 'Image + Text', slide(JSC.bg, [
    el('js-i-ph', 'shape', 0.6, 0.6, 5.5, 6.0, 'JS\nDrop image here',
      { fontSize: 24, fontFace: JSC.font, color: JSC.sub, align: 'center' },
      { shape: 'roundedRect', shapeStyle: { fill: JSC.card, borderColor: JSC.border, borderWidth: 2 } }),
    el('js-i-title', 'text', 6.8, 0.8, 5.7, 0.9, 'Application Architecture',
      { fontSize: 32, fontFace: JSC.font, color: JSC.text, bold: true, align: 'left' }),
    el('js-i-line', 'line', 6.8, 1.8, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: JSC.accent, width: 3 } }),
    el('js-i-body', 'text', 6.8, 2.2, 5.7, 4.0, 'Replace the placeholder with your diagram, component tree, or screenshot.\n\nShowcase your frontend or full-stack architecture.',
      { fontSize: 18, fontFace: JSC.font, color: JSC.sub, align: 'left', lineSpacing: 1.5 }),
  ])),

  layout('js-thanks', 'JavaScript', 'Thank You', 'Thank You', slide(JSC.bg, [
    el('js-ty-bar', 'shape', 0, 7.25, 13.333, 0.25, '', {},
      { shape: 'rect', shapeStyle: { fill: JSC.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('js-ty-logo', 'text', 5.4, 0.8, 2.5, 1.5, 'JS',
      { fontSize: 72, fontFace: 'Consolas', color: '#000000', bold: true, align: 'center', backgroundColor: JSC.accent }),
    el('js-ty-title', 'text', 1.5, 2.5, 10.3, 1.5, 'Thank You!',
      { fontSize: 64, fontFace: JSC.font, color: JSC.text, bold: true, align: 'center' }),
    el('js-ty-line', 'line', 5.0, 4.2, 3.3, 0, '', {}, { x1: 0, y1: 0, x2: 3.3, y2: 0, lineStyle: { color: JSC.accent, width: 3 } }),
    el('js-ty-info', 'text', 2.0, 4.7, 9.3, 1.0, 'your.email@company.com\ngithub.com/yourhandle',
      { fontSize: 18, fontFace: JSC.font, color: JSC.sub, align: 'center', lineSpacing: 1.6 }),
  ])),

  layout('js-table', 'JavaScript', 'Table', 'Data Table', slide(JSC.bg, [
    el('js-tbl-title', 'text', 0.8, 0.4, 11.7, 0.8, 'Framework Comparison',
      { fontSize: 32, fontFace: JSC.font, color: JSC.text, bold: true, align: 'left' }),
    el('js-tbl-line', 'line', 0.8, 1.3, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: JSC.accent, width: 3 } }),
    tableEl('js-tbl-data', 0.8, 1.8, 11.7, 4.5,
      [
        ['Framework', 'Type', 'Bundle Size', 'Stars', 'Learning Curve'],
        ['React', 'Library', '~44 KB', '220K', 'Moderate'],
        ['Vue', 'Framework', '~33 KB', '207K', 'Easy'],
        ['Angular', 'Framework', '~143 KB', '95K', 'Steep'],
        ['Svelte', 'Compiler', '~2 KB', '78K', 'Easy'],
      ],
      { borderColor: JSC.border, borderWidth: 1, headerBg: '#C6B200', headerColor: '#000000', cellBg: JSC.card, cellColor: JSC.text, altRowBg: '#2a2a2a', fontSize: 16, fontFace: JSC.font }
    ),
  ])),

  layout('js-2col', 'JavaScript', '2 Columns', '2 Column Layout', slide(JSC.bg, [
    el('js-2c-bar', 'shape', 0, 0, 13.333, 0.15, '', {},
      { shape: 'rect', shapeStyle: { fill: JSC.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('js-2c-title', 'text', 0.8, 0.5, 11.7, 0.8, 'Frontend & Backend',
      { fontSize: 32, fontFace: JSC.font, color: JSC.text, bold: true, align: 'left' }),
    el('js-2c-line', 'line', 0.8, 1.4, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: JSC.accent, width: 3 } }),
    ovalEl('js-2c-o1', 2.3, 1.9, 1.3, JSC.accent, JSC.border),
    iconEl('js-2c-i1', 2.45, 2.05, 1.0, ICONS.globe, '#000000'),
    el('js-2c-t1', 'text', 1.0, 3.4, 5.0, 0.7, 'Browser',
      { fontSize: 24, fontFace: JSC.font, color: JSC.text, bold: true, align: 'center' }),
    el('js-2c-b1', 'text', 1.0, 4.2, 5.0, 2.5, 'React, Vue, or Svelte for rich interactive UIs with component-based architecture.',
      { fontSize: 16, fontFace: JSC.font, color: JSC.sub, align: 'center', lineSpacing: 1.5 }),
    ovalEl('js-2c-o2', 9.0, 1.9, 1.3, JSC.accent2, JSC.border),
    iconEl('js-2c-i2', 9.15, 2.05, 1.0, ICONS.code, '#000000'),
    el('js-2c-t2', 'text', 7.3, 3.4, 5.0, 0.7, 'Server',
      { fontSize: 24, fontFace: JSC.font, color: JSC.text, bold: true, align: 'center' }),
    el('js-2c-b2', 'text', 7.3, 4.2, 5.0, 2.5, 'Node.js, Deno, or Bun for high-throughput APIs, real-time apps, and microservices.',
      { fontSize: 16, fontFace: JSC.font, color: JSC.sub, align: 'center', lineSpacing: 1.5 }),
  ])),

  layout('js-3col', 'JavaScript', '3 Columns', '3 Column Layout', slide(JSC.bg, [
    el('js-3c-bar', 'shape', 0, 0, 13.333, 0.15, '', {},
      { shape: 'rect', shapeStyle: { fill: JSC.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('js-3c-title', 'text', 0.8, 0.5, 11.7, 0.8, 'The JS Ecosystem',
      { fontSize: 32, fontFace: JSC.font, color: JSC.text, bold: true, align: 'left' }),
    el('js-3c-line', 'line', 0.8, 1.4, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: JSC.accent, width: 3 } }),
    ovalEl('js-3c-o1', 1.6, 1.9, 1.2, JSC.accent, JSC.border),
    iconEl('js-3c-i1', 1.72, 2.02, 0.96, ICONS.zap, '#000000'),
    el('js-3c-t1', 'text', 0.5, 3.3, 3.4, 0.7, 'Runtime',
      { fontSize: 22, fontFace: JSC.font, color: JSC.text, bold: true, align: 'center' }),
    el('js-3c-b1', 'text', 0.5, 4.0, 3.4, 2.5, 'V8, SpiderMonkey, or JavaScriptCore — blazing-fast JIT compilation.',
      { fontSize: 15, fontFace: JSC.font, color: JSC.sub, align: 'center', lineSpacing: 1.5 }),
    ovalEl('js-3c-o2', 6.05, 1.9, 1.2, JSC.accent2, JSC.border),
    iconEl('js-3c-i2', 6.17, 2.02, 0.96, ICONS.trending, '#000000'),
    el('js-3c-t2', 'text', 4.95, 3.3, 3.4, 0.7, 'Bundling',
      { fontSize: 22, fontFace: JSC.font, color: JSC.text, bold: true, align: 'center' }),
    el('js-3c-b2', 'text', 4.95, 4.0, 3.4, 2.5, 'Vite, esbuild, or Webpack for optimized builds with tree-shaking and HMR.',
      { fontSize: 15, fontFace: JSC.font, color: JSC.sub, align: 'center', lineSpacing: 1.5 }),
    ovalEl('js-3c-o3', 10.5, 1.9, 1.2, JSC.accent3, JSC.border),
    iconEl('js-3c-i3', 10.62, 2.02, 0.96, ICONS.checkmark, '#000000'),
    el('js-3c-t3', 'text', 9.4, 3.3, 3.4, 0.7, 'Testing',
      { fontSize: 22, fontFace: JSC.font, color: JSC.text, bold: true, align: 'center' }),
    el('js-3c-b3', 'text', 9.4, 4.0, 3.4, 2.5, 'Vitest, Jest, or Playwright for unit, integration, and end-to-end testing.',
      { fontSize: 15, fontFace: JSC.font, color: JSC.sub, align: 'center', lineSpacing: 1.5 }),
  ])),

  layout('js-demo', 'JavaScript', 'Demo', 'Demo Slide', slide('#1a1a1a', [
    ovalEl('js-dm-bg', 4.5, 0.6, 4.0, '#2a2a00', JSC.accent),
    iconEl('js-dm-icon', 5.5, 1.6, 2.0, ICONS.play, JSC.accent),
    el('js-dm-title', 'text', 1.5, 4.8, 10.0, 1.5, 'DEMO',
      { fontSize: 80, fontFace: JSC.font, color: JSC.accent, bold: true, align: 'center' }),
    el('js-dm-sub', 'text', 2.5, 6.1, 8.0, 0.8, 'From console.log to production — live',
      { fontSize: 24, fontFace: JSC.font, color: JSC.sub, align: 'center' }),
  ])),
];


// ╔══════════════════════════════════════════════════════════════╗
// ║  DOTNET — .NET / C# inspired, purple & blue modern tones   ║
// ╚══════════════════════════════════════════════════════════════╝
const DN = {
  bg: '#1B0A3C', card: '#2D1B69', border: '#4A2D8A',
  accent: '#512BD4', accent2: '#68217A', accent3: '#0078D4',
  text: '#F0F0F0', sub: '#C0B8D6', muted: '#7B6FA0',
  font: 'Segoe UI',
  code: '#1e1e1e', codeBg: '#1e1e1e',
  headerBg: '#512BD4',
};

const dotnet = [
  layout('dn-title', '.NET', 'Title', 'Title Slide', slide(DN.bg, [
    el('dn-t-bar', 'shape', 0, 0, 13.333, 0.25, '', {},
      { shape: 'rect', shapeStyle: { fill: DN.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('dn-t-logo', 'text', 5.0, 0.6, 3.3, 1.0, '⬟',
      { fontSize: 56, fontFace: DN.font, color: '#B388FF', align: 'center' }),
    el('dn-t-title', 'text', 1.5, 2.0, 10.3, 1.5, 'Building with .NET',
      { fontSize: 48, fontFace: DN.font, color: DN.text, bold: true, align: 'center' }),
    el('dn-t-line', 'line', 4.0, 3.7, 5.3, 0, '', {}, { x1: 0, y1: 0, x2: 5.3, y2: 0, lineStyle: { color: DN.accent, width: 3 } }),
    el('dn-t-sub', 'text', 2.5, 4.0, 8.3, 0.8, 'Cloud-native, cross-platform, enterprise-ready — click to edit',
      { fontSize: 22, fontFace: DN.font, color: DN.sub, align: 'center' }),
    el('dn-t-date', 'text', 4.5, 5.5, 4.3, 0.5, 'Your Name  |  Date',
      { fontSize: 14, fontFace: DN.font, color: DN.muted, align: 'center' }),
  ])),

  layout('dn-section', '.NET', 'Section', 'Section Divider', slide(DN.accent, [
    el('dn-s-num', 'text', 1.0, 1.0, 2.0, 2.0, '01',
      { fontSize: 80, fontFace: DN.font, color: '#FFFFFF', bold: true, align: 'left' }),
    el('dn-s-title', 'text', 1.0, 3.2, 8.0, 1.2, 'Section Title',
      { fontSize: 44, fontFace: DN.font, color: '#FFFFFF', bold: true, align: 'left' }),
    el('dn-s-line', 'line', 1.0, 4.6, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: '#FFFFFF', width: 4 } }),
    el('dn-s-desc', 'text', 1.0, 5.0, 6.0, 0.8, 'Brief description of what this section covers',
      { fontSize: 18, fontFace: DN.font, color: 'rgba(255,255,255,0.8)', align: 'left' }),
  ])),

  layout('dn-agenda', '.NET', 'Agenda', 'Agenda', slide(DN.bg, [
    el('dn-a-title', 'text', 0.8, 0.4, 5.0, 0.9, 'Agenda',
      { fontSize: 36, fontFace: DN.font, color: DN.text, bold: true, align: 'left' }),
    el('dn-a-bar', 'shape', 0.8, 1.3, 0.15, 5.5, '', {},
      { shape: 'rect', shapeStyle: { fill: DN.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('dn-a-list', 'text', 1.3, 1.5, 10.5, 5.0, '.NET Platform Overview\nC# Language Features\nASP.NET Core & Minimal APIs\nEntity Framework Core\nDependency Injection & Middleware\nQ & A',
      { fontSize: 24, fontFace: DN.font, color: DN.text, align: 'left', listType: 'numbered', lineSpacing: 2.0 }),
  ])),

  layout('dn-bullets', '.NET', 'Bullets', 'Bullet Points', slide(DN.bg, [
    el('dn-b-title', 'text', 0.8, 0.4, 11.5, 0.9, 'Why .NET?',
      { fontSize: 36, fontFace: DN.font, color: DN.text, bold: true, align: 'left' }),
    el('dn-b-line', 'line', 0.8, 1.4, 11.5, 0, '', {}, { x1: 0, y1: 0, x2: 11.5, y2: 0, lineStyle: { color: DN.accent, width: 2 } }),
    el('dn-b-list', 'text', 1.0, 1.8, 10.5, 4.5, 'Cross-platform — runs on Windows, Linux, and macOS\nEnterprise-grade performance with AOT compilation\nRich ecosystem: ASP.NET, EF Core, MAUI, Blazor\nWorld-class tooling with Visual Studio and VS Code\nOpen-source with a massive community',
      { fontSize: 22, fontFace: DN.font, color: DN.sub, align: 'left', listType: 'bullet', lineSpacing: 1.8 }),
  ])),

  layout('dn-code', '.NET', 'Code', 'Code Showcase', slide(DN.code, [
    el('dn-c-title', 'text', 0.8, 0.3, 8.0, 0.8, '// Code Example',
      { fontSize: 28, fontFace: 'Consolas', color: '#B388FF', bold: true, align: 'left' }),
    el('dn-c-lang', 'text', 9.5, 0.4, 3.0, 0.5, 'C#',
      { fontSize: 14, fontFace: DN.font, color: '#8b949e', align: 'right' }),
    el('dn-c-code', 'code', 0.8, 1.2, 11.5, 5.0,
      'var builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddEndpointsApiExplorer();\nbuilder.Services.AddSwaggerGen();\n\nvar app = builder.Build();\n\napp.MapGet("/api/users/{id}", async (int id, AppDbContext db) =>\n{\n    var user = await db.Users.FindAsync(id);\n    return user is not null\n        ? Results.Ok(user)\n        : Results.NotFound();\n});\n\napp.MapPost("/api/users", async (User user, AppDbContext db) =>\n{\n    db.Users.Add(user);\n    await db.SaveChangesAsync();\n    return Results.Created($"/api/users/{user.Id}", user);\n});\n\napp.Run();',
      { fontSize: 15, fontFace: 'Consolas', color: '#d4d4d4', backgroundColor: DN.codeBg }, { language: 'csharp' }),
    el('dn-c-cap', 'text', 0.8, 6.5, 11.5, 0.5, '↑ ASP.NET Core Minimal API with Entity Framework',
      { fontSize: 14, fontFace: DN.font, color: '#484f58', align: 'left' }),
  ])),

  layout('dn-compare', '.NET', 'Compare', 'Compare & Contrast', slide(DN.bg, [
    el('dn-cmp-title', 'text', 0.8, 0.4, 11.5, 0.9, '.NET vs. Java',
      { fontSize: 36, fontFace: DN.font, color: DN.text, bold: true, align: 'center' }),
    el('dn-cmp-div', 'line', 6.666, 1.6, 0, 5.0, '', {}, { x1: 0, y1: 0, x2: 0, y2: 5.0, lineStyle: { color: DN.border, width: 2 } }),
    el('dn-cmp-lh', 'text', 0.8, 1.5, 5.2, 0.7, '.NET / C#',
      { fontSize: 26, fontFace: DN.font, color: '#B388FF', bold: true, align: 'center' }),
    el('dn-cmp-lb', 'text', 0.8, 2.4, 5.2, 4.0, 'LINQ for elegant data queries\nPattern matching and records\nMinimal APIs for microservices\nBlazor for full-stack C#',
      { fontSize: 18, fontFace: DN.font, color: DN.sub, align: 'left', listType: 'bullet', lineSpacing: 1.6 }),
    el('dn-cmp-rh', 'text', 7.2, 1.5, 5.2, 0.7, 'Java',
      { fontSize: 26, fontFace: DN.font, color: '#F89820', bold: true, align: 'center' }),
    el('dn-cmp-rb', 'text', 7.2, 2.4, 5.2, 4.0, 'Stream API for collections\nSealed classes and records (Java 17+)\nSpring Boot ecosystem\nMature enterprise ecosystem',
      { fontSize: 18, fontFace: DN.font, color: DN.sub, align: 'left', listType: 'bullet', lineSpacing: 1.6 }),
  ])),

  layout('dn-quote', '.NET', 'Quote', 'Quote', slide(DN.bg, [
    el('dn-q-bar', 'shape', 0, 0, 0.4, 7.5, '', {},
      { shape: 'rect', shapeStyle: { fill: DN.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('dn-q-mark', 'text', 1.5, 0.8, 2.0, 2.0, '\u201C',
      { fontSize: 120, fontFace: 'Georgia', color: '#B388FF', bold: false, align: 'left' }),
    el('dn-q-text', 'text', 2.0, 2.2, 9.0, 2.5, 'The best code is no code at all. Every new line of code you willingly bring into the world is code that has to be debugged.',
      { fontSize: 30, fontFace: 'Georgia', color: DN.text, bold: false, italic: true, align: 'left', lineSpacing: 1.5 }),
    el('dn-q-line', 'line', 2.0, 5.0, 2.5, 0, '', {}, { x1: 0, y1: 0, x2: 2.5, y2: 0, lineStyle: { color: DN.accent, width: 3 } }),
    el('dn-q-auth', 'text', 2.0, 5.3, 9.0, 0.6, '— Jeff Atwood',
      { fontSize: 20, fontFace: 'Georgia', color: DN.sub, align: 'left' }),
  ])),

  layout('dn-image', '.NET', 'Image', 'Image + Text', slide(DN.bg, [
    el('dn-i-ph', 'shape', 0.6, 0.6, 5.5, 6.0, '.NET\nDrop image here',
      { fontSize: 24, fontFace: DN.font, color: DN.sub, align: 'center' },
      { shape: 'roundedRect', shapeStyle: { fill: DN.card, borderColor: DN.border, borderWidth: 2 } }),
    el('dn-i-title', 'text', 6.8, 0.8, 5.7, 0.9, 'Solution Architecture',
      { fontSize: 32, fontFace: DN.font, color: DN.text, bold: true, align: 'left' }),
    el('dn-i-line', 'line', 6.8, 1.8, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: DN.accent, width: 3 } }),
    el('dn-i-body', 'text', 6.8, 2.2, 5.7, 4.0, 'Replace the placeholder with your architecture diagram, Azure topology, or application screenshot.\n\nShowcase your clean architecture or CQRS pattern.',
      { fontSize: 18, fontFace: DN.font, color: DN.sub, align: 'left', lineSpacing: 1.5 }),
  ])),

  layout('dn-thanks', '.NET', 'Thank You', 'Thank You', slide(DN.bg, [
    el('dn-ty-bar', 'shape', 0, 7.25, 13.333, 0.25, '', {},
      { shape: 'rect', shapeStyle: { fill: DN.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('dn-ty-logo', 'text', 5.4, 0.8, 2.5, 1.5, '⬟',
      { fontSize: 72, fontFace: DN.font, color: '#B388FF', align: 'center' }),
    el('dn-ty-title', 'text', 1.5, 2.5, 10.3, 1.5, 'Thank You!',
      { fontSize: 64, fontFace: DN.font, color: DN.text, bold: true, align: 'center' }),
    el('dn-ty-line', 'line', 5.0, 4.2, 3.3, 0, '', {}, { x1: 0, y1: 0, x2: 3.3, y2: 0, lineStyle: { color: DN.accent, width: 3 } }),
    el('dn-ty-info', 'text', 2.0, 4.7, 9.3, 1.0, 'your.email@company.com\ngithub.com/yourhandle',
      { fontSize: 18, fontFace: DN.font, color: DN.sub, align: 'center', lineSpacing: 1.6 }),
  ])),

  layout('dn-table', '.NET', 'Table', 'Data Table', slide(DN.bg, [
    el('dn-tbl-title', 'text', 0.8, 0.4, 11.7, 0.8, 'NuGet Package Metrics',
      { fontSize: 32, fontFace: DN.font, color: DN.text, bold: true, align: 'left' }),
    el('dn-tbl-line', 'line', 0.8, 1.3, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: DN.accent, width: 3 } }),
    tableEl('dn-tbl-data', 0.8, 1.8, 11.7, 4.5,
      [
        ['Package', 'Category', 'Downloads', 'Version'],
        ['Newtonsoft.Json', 'Serialization', '3.2B', '13.0'],
        ['Serilog', 'Logging', '900M', '3.1'],
        ['MediatR', 'CQRS/Mediator', '350M', '12.2'],
        ['Polly', 'Resilience', '450M', '8.3'],
      ],
      { borderColor: DN.border, borderWidth: 1, headerBg: DN.accent, headerColor: '#FFFFFF', cellBg: DN.card, cellColor: DN.text, altRowBg: '#241555', fontSize: 16, fontFace: DN.font }
    ),
  ])),

  layout('dn-2col', '.NET', '2 Columns', '2 Column Layout', slide(DN.bg, [
    el('dn-2c-bar', 'shape', 0, 0, 13.333, 0.15, '', {},
      { shape: 'rect', shapeStyle: { fill: DN.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('dn-2c-title', 'text', 0.8, 0.5, 11.7, 0.8, '.NET Strengths',
      { fontSize: 32, fontFace: DN.font, color: DN.text, bold: true, align: 'left' }),
    el('dn-2c-line', 'line', 0.8, 1.4, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: DN.accent, width: 3 } }),
    ovalEl('dn-2c-o1', 2.3, 1.9, 1.3, DN.accent, DN.border),
    iconEl('dn-2c-i1', 2.45, 2.05, 1.0, ICONS.zap, '#FFFFFF'),
    el('dn-2c-t1', 'text', 1.0, 3.4, 5.0, 0.7, 'Performance',
      { fontSize: 24, fontFace: DN.font, color: DN.text, bold: true, align: 'center' }),
    el('dn-2c-b1', 'text', 1.0, 4.2, 5.0, 2.5, 'AOT compilation, Span<T>, and low-allocation APIs deliver near-native speed.',
      { fontSize: 16, fontFace: DN.font, color: DN.sub, align: 'center', lineSpacing: 1.5 }),
    ovalEl('dn-2c-o2', 9.0, 1.9, 1.3, DN.accent2, DN.border),
    iconEl('dn-2c-i2', 9.15, 2.05, 1.0, ICONS.shield, '#FFFFFF'),
    el('dn-2c-t2', 'text', 7.3, 3.4, 5.0, 0.7, 'Enterprise Ready',
      { fontSize: 24, fontFace: DN.font, color: DN.text, bold: true, align: 'center' }),
    el('dn-2c-b2', 'text', 7.3, 4.2, 5.0, 2.5, 'Built-in DI, configuration, logging, and health checks for production workloads.',
      { fontSize: 16, fontFace: DN.font, color: DN.sub, align: 'center', lineSpacing: 1.5 }),
  ])),

  layout('dn-3col', '.NET', '3 Columns', '3 Column Layout', slide(DN.bg, [
    el('dn-3c-bar', 'shape', 0, 0, 13.333, 0.15, '', {},
      { shape: 'rect', shapeStyle: { fill: DN.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('dn-3c-title', 'text', 0.8, 0.5, 11.7, 0.8, '.NET Workloads',
      { fontSize: 32, fontFace: DN.font, color: DN.text, bold: true, align: 'left' }),
    el('dn-3c-line', 'line', 0.8, 1.4, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: DN.accent, width: 3 } }),
    ovalEl('dn-3c-o1', 1.6, 1.9, 1.2, DN.accent, DN.border),
    iconEl('dn-3c-i1', 1.72, 2.02, 0.96, ICONS.globe, '#FFFFFF'),
    el('dn-3c-t1', 'text', 0.5, 3.3, 3.4, 0.7, 'Web & APIs',
      { fontSize: 22, fontFace: DN.font, color: DN.text, bold: true, align: 'center' }),
    el('dn-3c-b1', 'text', 0.5, 4.0, 3.4, 2.5, 'ASP.NET Core, Minimal APIs, Blazor, and SignalR for modern web apps.',
      { fontSize: 15, fontFace: DN.font, color: DN.sub, align: 'center', lineSpacing: 1.5 }),
    ovalEl('dn-3c-o2', 6.05, 1.9, 1.2, DN.accent2, DN.border),
    iconEl('dn-3c-i2', 6.17, 2.02, 0.96, ICONS.trending, '#FFFFFF'),
    el('dn-3c-t2', 'text', 4.95, 3.3, 3.4, 0.7, 'Cloud',
      { fontSize: 22, fontFace: DN.font, color: DN.text, bold: true, align: 'center' }),
    el('dn-3c-b2', 'text', 4.95, 4.0, 3.4, 2.5, 'Azure Functions, containers, and Aspire for cloud-native distributed apps.',
      { fontSize: 15, fontFace: DN.font, color: DN.sub, align: 'center', lineSpacing: 1.5 }),
    ovalEl('dn-3c-o3', 10.5, 1.9, 1.2, DN.accent3, DN.border),
    iconEl('dn-3c-i3', 10.62, 2.02, 0.96, ICONS.code, '#FFFFFF'),
    el('dn-3c-t3', 'text', 9.4, 3.3, 3.4, 0.7, 'Desktop & Mobile',
      { fontSize: 22, fontFace: DN.font, color: DN.text, bold: true, align: 'center' }),
    el('dn-3c-b3', 'text', 9.4, 4.0, 3.4, 2.5, 'MAUI, WPF, and WinUI for cross-platform native apps from a single codebase.',
      { fontSize: 15, fontFace: DN.font, color: DN.sub, align: 'center', lineSpacing: 1.5 }),
  ])),

  layout('dn-demo', '.NET', 'Demo', 'Demo Slide', slide('#120730', [
    ovalEl('dn-dm-bg', 4.5, 0.6, 4.0, '#3D1F8A', DN.accent),
    iconEl('dn-dm-icon', 5.5, 1.6, 2.0, ICONS.play, '#a78bfa'),
    el('dn-dm-title', 'text', 1.5, 4.8, 10.0, 1.5, 'DEMO',
      { fontSize: 80, fontFace: DN.font, color: '#FFFFFF', bold: true, align: 'center' }),
    el('dn-dm-sub', 'text', 2.5, 6.1, 8.0, 0.8, 'Building with .NET — live coding',
      { fontSize: 24, fontFace: DN.font, color: DN.sub, align: 'center' }),
  ])),
];


// ╔══════════════════════════════════════════════════════════════╗
// ║  JAVA — Classic Java blue & orange, enterprise feel         ║
// ╚══════════════════════════════════════════════════════════════╝
const JV = {
  bg: '#F8F9FA', card: '#FFFFFF', border: '#DEE2E6',
  accent: '#5382A1', accent2: '#F89820', accent3: '#E76F00',
  text: '#212529', sub: '#495057', muted: '#ADB5BD',
  font: 'Segoe UI',
  code: '#2b2b2b', codeBg: '#2b2b2b',
  headerBg: '#5382A1',
};

const java = [
  layout('jv-title', 'Java', 'Title', 'Title Slide', slide(JV.bg, [
    el('jv-t-bar', 'shape', 0, 0, 13.333, 0.25, '', {},
      { shape: 'rect', shapeStyle: { fill: JV.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('jv-t-logo', 'text', 5.0, 0.6, 3.3, 1.0, '☕',
      { fontSize: 56, fontFace: JV.font, color: JV.text, align: 'center' }),
    el('jv-t-title', 'text', 1.5, 2.0, 10.3, 1.5, 'Enterprise Java',
      { fontSize: 48, fontFace: JV.font, color: JV.text, bold: true, align: 'center' }),
    el('jv-t-line', 'line', 4.0, 3.7, 5.3, 0, '', {}, { x1: 0, y1: 0, x2: 5.3, y2: 0, lineStyle: { color: JV.accent, width: 3 } }),
    el('jv-t-sub', 'text', 2.5, 4.0, 8.3, 0.8, 'Write once, run anywhere — click to edit',
      { fontSize: 22, fontFace: JV.font, color: JV.sub, align: 'center' }),
    el('jv-t-date', 'text', 4.5, 5.5, 4.3, 0.5, 'Your Name  |  Date',
      { fontSize: 14, fontFace: JV.font, color: JV.muted, align: 'center' }),
  ])),

  layout('jv-section', 'Java', 'Section', 'Section Divider', slide(JV.accent, [
    el('jv-s-num', 'text', 1.0, 1.0, 2.0, 2.0, '01',
      { fontSize: 80, fontFace: JV.font, color: '#FFFFFF', bold: true, align: 'left' }),
    el('jv-s-title', 'text', 1.0, 3.2, 8.0, 1.2, 'Section Title',
      { fontSize: 44, fontFace: JV.font, color: '#FFFFFF', bold: true, align: 'left' }),
    el('jv-s-line', 'line', 1.0, 4.6, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: '#FFFFFF', width: 4 } }),
    el('jv-s-desc', 'text', 1.0, 5.0, 6.0, 0.8, 'Brief description of what this section covers',
      { fontSize: 18, fontFace: JV.font, color: 'rgba(255,255,255,0.8)', align: 'left' }),
  ])),

  layout('jv-agenda', 'Java', 'Agenda', 'Agenda', slide(JV.bg, [
    el('jv-a-title', 'text', 0.8, 0.4, 5.0, 0.9, 'Agenda',
      { fontSize: 36, fontFace: JV.font, color: JV.text, bold: true, align: 'left' }),
    el('jv-a-bar', 'shape', 0.8, 1.3, 0.15, 5.5, '', {},
      { shape: 'rect', shapeStyle: { fill: JV.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('jv-a-list', 'text', 1.3, 1.5, 10.5, 5.0, 'Modern Java (17–21) Features\nSpring Boot & Microservices\nVirtual Threads (Project Loom)\nPattern Matching & Records\nGraalVM & Native Images\nQ & A',
      { fontSize: 24, fontFace: JV.font, color: JV.text, align: 'left', listType: 'numbered', lineSpacing: 2.0 }),
  ])),

  layout('jv-bullets', 'Java', 'Bullets', 'Bullet Points', slide(JV.bg, [
    el('jv-b-title', 'text', 0.8, 0.4, 11.5, 0.9, 'Why Java?',
      { fontSize: 36, fontFace: JV.font, color: JV.text, bold: true, align: 'left' }),
    el('jv-b-line', 'line', 0.8, 1.4, 11.5, 0, '', {}, { x1: 0, y1: 0, x2: 11.5, y2: 0, lineStyle: { color: JV.accent, width: 2 } }),
    el('jv-b-list', 'text', 1.0, 1.8, 10.5, 4.5, 'Battle-tested in enterprise for 25+ years\nMassive ecosystem — Maven Central, Spring, Jakarta EE\nJVM powers billions of devices worldwide\nStrong backward compatibility across versions\nVirtual threads bring modern concurrency (Java 21+)',
      { fontSize: 22, fontFace: JV.font, color: JV.sub, align: 'left', listType: 'bullet', lineSpacing: 1.8 }),
  ])),

  layout('jv-code', 'Java', 'Code', 'Code Showcase', slide(JV.code, [
    el('jv-c-title', 'text', 0.8, 0.3, 8.0, 0.8, '// Code Example',
      { fontSize: 28, fontFace: 'Consolas', color: JV.accent2, bold: true, align: 'left' }),
    el('jv-c-lang', 'text', 9.5, 0.4, 3.0, 0.5, 'Java',
      { fontSize: 14, fontFace: JV.font, color: '#8b949e', align: 'right' }),
    el('jv-c-code', 'code', 0.8, 1.2, 11.5, 5.0,
      '@RestController\n@RequestMapping("/api/users")\npublic class UserController {\n\n    private final UserService userService;\n\n    public UserController(UserService userService) {\n        this.userService = userService;\n    }\n\n    @GetMapping("/{id}")\n    public ResponseEntity<User> getUser(@PathVariable Long id) {\n        return userService.findById(id)\n            .map(ResponseEntity::ok)\n            .orElse(ResponseEntity.notFound().build());\n    }\n\n    @PostMapping\n    public User createUser(@RequestBody @Valid User user) {\n        return userService.save(user);\n    }\n}',
      { fontSize: 15, fontFace: 'Consolas', color: '#d4d4d4', backgroundColor: JV.codeBg }, { language: 'java' }),
    el('jv-c-cap', 'text', 0.8, 6.5, 11.5, 0.5, '↑ Spring Boot REST controller with dependency injection',
      { fontSize: 14, fontFace: JV.font, color: '#484f58', align: 'left' }),
  ])),

  layout('jv-compare', 'Java', 'Compare', 'Compare & Contrast', slide(JV.bg, [
    el('jv-cmp-title', 'text', 0.8, 0.4, 11.5, 0.9, 'Spring Boot vs. Quarkus',
      { fontSize: 36, fontFace: JV.font, color: JV.text, bold: true, align: 'center' }),
    el('jv-cmp-div', 'line', 6.666, 1.6, 0, 5.0, '', {}, { x1: 0, y1: 0, x2: 0, y2: 5.0, lineStyle: { color: JV.border, width: 2 } }),
    el('jv-cmp-lh', 'text', 0.8, 1.5, 5.2, 0.7, 'Spring Boot',
      { fontSize: 26, fontFace: JV.font, color: '#6DB33F', bold: true, align: 'center' }),
    el('jv-cmp-lb', 'text', 0.8, 2.4, 5.2, 4.0, 'Mature & battle-tested ecosystem\nAuto-configuration and starters\nMassive community and docs\nSpring Cloud for distributed systems',
      { fontSize: 18, fontFace: JV.font, color: JV.sub, align: 'left', listType: 'bullet', lineSpacing: 1.6 }),
    el('jv-cmp-rh', 'text', 7.2, 1.5, 5.2, 0.7, 'Quarkus',
      { fontSize: 26, fontFace: JV.font, color: '#4695EB', bold: true, align: 'center' }),
    el('jv-cmp-rb', 'text', 7.2, 2.4, 5.2, 4.0, 'Kubernetes-native and container-first\nGraalVM native image support\nFast startup and low memory\nReactive-first with Mutiny',
      { fontSize: 18, fontFace: JV.font, color: JV.sub, align: 'left', listType: 'bullet', lineSpacing: 1.6 }),
  ])),

  layout('jv-quote', 'Java', 'Quote', 'Quote', slide(JV.bg, [
    el('jv-q-bar', 'shape', 0, 0, 0.4, 7.5, '', {},
      { shape: 'rect', shapeStyle: { fill: JV.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('jv-q-mark', 'text', 1.5, 0.8, 2.0, 2.0, '\u201C',
      { fontSize: 120, fontFace: 'Georgia', color: JV.accent, bold: false, align: 'left' }),
    el('jv-q-text', 'text', 2.0, 2.2, 9.0, 2.5, 'Java is to JavaScript what car is to carpet.',
      { fontSize: 32, fontFace: 'Georgia', color: JV.text, bold: false, italic: true, align: 'left', lineSpacing: 1.5 }),
    el('jv-q-line', 'line', 2.0, 5.0, 2.5, 0, '', {}, { x1: 0, y1: 0, x2: 2.5, y2: 0, lineStyle: { color: JV.accent, width: 3 } }),
    el('jv-q-auth', 'text', 2.0, 5.3, 9.0, 0.6, '— Chris Heilmann',
      { fontSize: 20, fontFace: 'Georgia', color: JV.sub, align: 'left' }),
  ])),

  layout('jv-image', 'Java', 'Image', 'Image + Text', slide(JV.bg, [
    el('jv-i-ph', 'shape', 0.6, 0.6, 5.5, 6.0, '☕\nDrop image here',
      { fontSize: 24, fontFace: JV.font, color: JV.sub, align: 'center' },
      { shape: 'roundedRect', shapeStyle: { fill: JV.card, borderColor: JV.border, borderWidth: 2 } }),
    el('jv-i-title', 'text', 6.8, 0.8, 5.7, 0.9, 'System Design',
      { fontSize: 32, fontFace: JV.font, color: JV.text, bold: true, align: 'left' }),
    el('jv-i-line', 'line', 6.8, 1.8, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: JV.accent, width: 3 } }),
    el('jv-i-body', 'text', 6.8, 2.2, 5.7, 4.0, 'Replace the placeholder with your UML diagram, architecture, or screenshot.\n\nShowcase your microservice topology or domain model.',
      { fontSize: 18, fontFace: JV.font, color: JV.sub, align: 'left', lineSpacing: 1.5 }),
  ])),

  layout('jv-thanks', 'Java', 'Thank You', 'Thank You', slide(JV.bg, [
    el('jv-ty-bar', 'shape', 0, 7.25, 13.333, 0.25, '', {},
      { shape: 'rect', shapeStyle: { fill: JV.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('jv-ty-logo', 'text', 5.4, 0.8, 2.5, 1.5, '☕',
      { fontSize: 72, fontFace: JV.font, color: JV.accent2, align: 'center' }),
    el('jv-ty-title', 'text', 1.5, 2.5, 10.3, 1.5, 'Thank You!',
      { fontSize: 64, fontFace: JV.font, color: JV.text, bold: true, align: 'center' }),
    el('jv-ty-line', 'line', 5.0, 4.2, 3.3, 0, '', {}, { x1: 0, y1: 0, x2: 3.3, y2: 0, lineStyle: { color: JV.accent, width: 3 } }),
    el('jv-ty-info', 'text', 2.0, 4.7, 9.3, 1.0, 'your.email@company.com\ngithub.com/yourhandle',
      { fontSize: 18, fontFace: JV.font, color: JV.sub, align: 'center', lineSpacing: 1.6 }),
  ])),

  layout('jv-table', 'Java', 'Table', 'Data Table', slide(JV.bg, [
    el('jv-tbl-title', 'text', 0.8, 0.4, 11.7, 0.8, 'JVM Language Landscape',
      { fontSize: 32, fontFace: JV.font, color: JV.text, bold: true, align: 'left' }),
    el('jv-tbl-line', 'line', 0.8, 1.3, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: JV.accent, width: 3 } }),
    tableEl('jv-tbl-data', 0.8, 1.8, 11.7, 4.5,
      [
        ['Language', 'Type System', 'Use Case', 'Interop'],
        ['Java', 'Static', 'Enterprise, Android', '100%'],
        ['Kotlin', 'Static', 'Android, Server', '100%'],
        ['Scala', 'Static + FP', 'Data Engineering', '95%'],
        ['Groovy', 'Dynamic', 'Scripting, Gradle', '95%'],
      ],
      { borderColor: JV.border, borderWidth: 1, headerBg: JV.accent, headerColor: '#FFFFFF', cellBg: '#FFFFFF', cellColor: JV.text, altRowBg: '#F1F3F5', fontSize: 16, fontFace: JV.font }
    ),
  ])),

  layout('jv-2col', 'Java', '2 Columns', '2 Column Layout', slide(JV.bg, [
    el('jv-2c-bar', 'shape', 0, 0, 13.333, 0.15, '', {},
      { shape: 'rect', shapeStyle: { fill: JV.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('jv-2c-title', 'text', 0.8, 0.5, 11.7, 0.8, 'Modern Java',
      { fontSize: 32, fontFace: JV.font, color: JV.text, bold: true, align: 'left' }),
    el('jv-2c-line', 'line', 0.8, 1.4, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: JV.accent, width: 3 } }),
    ovalEl('jv-2c-o1', 2.3, 1.9, 1.3, JV.accent, JV.border),
    iconEl('jv-2c-i1', 2.45, 2.05, 1.0, ICONS.lightbulb, '#FFFFFF'),
    el('jv-2c-t1', 'text', 1.0, 3.4, 5.0, 0.7, 'Records & Patterns',
      { fontSize: 24, fontFace: JV.font, color: JV.text, bold: true, align: 'center' }),
    el('jv-2c-b1', 'text', 1.0, 4.2, 5.0, 2.5, 'Sealed classes, pattern matching, and records make Java more concise and expressive.',
      { fontSize: 16, fontFace: JV.font, color: JV.sub, align: 'center', lineSpacing: 1.5 }),
    ovalEl('jv-2c-o2', 9.0, 1.9, 1.3, JV.accent2, JV.border),
    iconEl('jv-2c-i2', 9.15, 2.05, 1.0, ICONS.zap, '#FFFFFF'),
    el('jv-2c-t2', 'text', 7.3, 3.4, 5.0, 0.7, 'Virtual Threads',
      { fontSize: 24, fontFace: JV.font, color: JV.text, bold: true, align: 'center' }),
    el('jv-2c-b2', 'text', 7.3, 4.2, 5.0, 2.5, 'Project Loom brings lightweight threads — handle millions of concurrent tasks effortlessly.',
      { fontSize: 16, fontFace: JV.font, color: JV.sub, align: 'center', lineSpacing: 1.5 }),
  ])),

  layout('jv-3col', 'Java', '3 Columns', '3 Column Layout', slide(JV.bg, [
    el('jv-3c-bar', 'shape', 0, 0, 13.333, 0.15, '', {},
      { shape: 'rect', shapeStyle: { fill: JV.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('jv-3c-title', 'text', 0.8, 0.5, 11.7, 0.8, 'Java Ecosystem',
      { fontSize: 32, fontFace: JV.font, color: JV.text, bold: true, align: 'left' }),
    el('jv-3c-line', 'line', 0.8, 1.4, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: JV.accent, width: 3 } }),
    ovalEl('jv-3c-o1', 1.6, 1.9, 1.2, JV.accent, JV.border),
    iconEl('jv-3c-i1', 1.72, 2.02, 0.96, ICONS.globe, '#FFFFFF'),
    el('jv-3c-t1', 'text', 0.5, 3.3, 3.4, 0.7, 'Spring Boot',
      { fontSize: 22, fontFace: JV.font, color: JV.text, bold: true, align: 'center' }),
    el('jv-3c-b1', 'text', 0.5, 4.0, 3.4, 2.5, 'Opinionated framework for production-ready REST APIs and microservices.',
      { fontSize: 15, fontFace: JV.font, color: JV.sub, align: 'center', lineSpacing: 1.5 }),
    ovalEl('jv-3c-o2', 6.05, 1.9, 1.2, JV.accent2, JV.border),
    iconEl('jv-3c-i2', 6.17, 2.02, 0.96, ICONS.target, '#FFFFFF'),
    el('jv-3c-t2', 'text', 4.95, 3.3, 3.4, 0.7, 'Maven / Gradle',
      { fontSize: 22, fontFace: JV.font, color: JV.text, bold: true, align: 'center' }),
    el('jv-3c-b2', 'text', 4.95, 4.0, 3.4, 2.5, 'Mature build tools with dependency management and plugin ecosystems.',
      { fontSize: 15, fontFace: JV.font, color: JV.sub, align: 'center', lineSpacing: 1.5 }),
    ovalEl('jv-3c-o3', 10.5, 1.9, 1.2, JV.accent3, JV.border),
    iconEl('jv-3c-i3', 10.62, 2.02, 0.96, ICONS.checkmark, '#FFFFFF'),
    el('jv-3c-t3', 'text', 9.4, 3.3, 3.4, 0.7, 'JUnit & Mockito',
      { fontSize: 22, fontFace: JV.font, color: JV.text, bold: true, align: 'center' }),
    el('jv-3c-b3', 'text', 9.4, 4.0, 3.4, 2.5, 'Industry-standard testing with parameterized tests, mocking, and assertions.',
      { fontSize: 15, fontFace: JV.font, color: JV.sub, align: 'center', lineSpacing: 1.5 }),
  ])),

  layout('jv-demo', 'Java', 'Demo', 'Demo Slide', slide(JV.accent, [
    ovalEl('jv-dm-bg', 4.5, 0.6, 4.0, '#3d6a87', 'transparent'),
    iconEl('jv-dm-icon', 5.5, 1.6, 2.0, ICONS.play, '#FFFFFF'),
    el('jv-dm-title', 'text', 1.5, 4.8, 10.0, 1.5, 'DEMO',
      { fontSize: 80, fontFace: JV.font, color: '#FFFFFF', bold: true, align: 'center' }),
    el('jv-dm-sub', 'text', 2.5, 6.1, 8.0, 0.8, 'Enterprise Java in action',
      { fontSize: 24, fontFace: JV.font, color: '#c5dbe8', align: 'center' }),
  ])),
];


// ╔══════════════════════════════════════════════════════════════╗
// ║  PYTHON — Blue & yellow, clean and readable                 ║
// ╚══════════════════════════════════════════════════════════════╝
const PY = {
  bg: '#1A1B26', card: '#24283B', border: '#3B4261',
  accent: '#3776AB', accent2: '#FFD43B', accent3: '#4EC9B0',
  text: '#E8E8E8', sub: '#A9B1D6', muted: '#565F89',
  font: 'Segoe UI',
  code: '#1a1b26', codeBg: '#1a1b26',
  headerBg: '#3776AB',
};

const python = [
  layout('py-title', 'Python', 'Title', 'Title Slide', slide(PY.bg, [
    el('py-t-bar', 'shape', 0, 0, 13.333, 0.25, '', {},
      { shape: 'rect', shapeStyle: { fill: PY.accent, borderColor: 'transparent', borderWidth: 0 } }),
    el('py-t-logo', 'text', 5.0, 0.6, 3.3, 1.0, '🐍',
      { fontSize: 56, fontFace: PY.font, color: PY.text, align: 'center' }),
    el('py-t-title', 'text', 1.5, 2.0, 10.3, 1.5, 'Python for Everyone',
      { fontSize: 48, fontFace: PY.font, color: PY.text, bold: true, align: 'center' }),
    el('py-t-line', 'line', 4.0, 3.7, 5.3, 0, '', {}, { x1: 0, y1: 0, x2: 5.3, y2: 0, lineStyle: { color: PY.accent2, width: 3 } }),
    el('py-t-sub', 'text', 2.5, 4.0, 8.3, 0.8, 'Simple is better than complex — click to edit',
      { fontSize: 22, fontFace: PY.font, color: PY.sub, align: 'center' }),
    el('py-t-date', 'text', 4.5, 5.5, 4.3, 0.5, 'Your Name  |  Date',
      { fontSize: 14, fontFace: PY.font, color: PY.muted, align: 'center' }),
  ])),

  layout('py-section', 'Python', 'Section', 'Section Divider', slide(PY.accent, [
    el('py-s-num', 'text', 1.0, 1.0, 2.0, 2.0, '01',
      { fontSize: 80, fontFace: PY.font, color: '#FFFFFF', bold: true, align: 'left' }),
    el('py-s-title', 'text', 1.0, 3.2, 8.0, 1.2, 'Section Title',
      { fontSize: 44, fontFace: PY.font, color: '#FFFFFF', bold: true, align: 'left' }),
    el('py-s-line', 'line', 1.0, 4.6, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: PY.accent2, width: 4 } }),
    el('py-s-desc', 'text', 1.0, 5.0, 6.0, 0.8, 'Brief description of what this section covers',
      { fontSize: 18, fontFace: PY.font, color: 'rgba(255,255,255,0.8)', align: 'left' }),
  ])),

  layout('py-agenda', 'Python', 'Agenda', 'Agenda', slide(PY.bg, [
    el('py-a-title', 'text', 0.8, 0.4, 5.0, 0.9, 'Agenda',
      { fontSize: 36, fontFace: PY.font, color: PY.text, bold: true, align: 'left' }),
    el('py-a-bar', 'shape', 0.8, 1.3, 0.15, 5.5, '', {},
      { shape: 'rect', shapeStyle: { fill: PY.accent2, borderColor: 'transparent', borderWidth: 0 } }),
    el('py-a-list', 'text', 1.3, 1.5, 10.5, 5.0, 'The Zen of Python\nData Structures & Comprehensions\nDecorators & Context Managers\nAsync Programming\nPackaging & Distribution\nQ & A',
      { fontSize: 24, fontFace: PY.font, color: PY.text, align: 'left', listType: 'numbered', lineSpacing: 2.0 }),
  ])),

  layout('py-bullets', 'Python', 'Bullets', 'Bullet Points', slide(PY.bg, [
    el('py-b-title', 'text', 0.8, 0.4, 11.5, 0.9, 'Why Python?',
      { fontSize: 36, fontFace: PY.font, color: PY.text, bold: true, align: 'left' }),
    el('py-b-line', 'line', 0.8, 1.4, 11.5, 0, '', {}, { x1: 0, y1: 0, x2: 11.5, y2: 0, lineStyle: { color: PY.accent2, width: 2 } }),
    el('py-b-list', 'text', 1.0, 1.8, 10.5, 4.5, 'Readable, expressive syntax — code reads like pseudocode\n#1 language for data science, ML, and AI\nMassive ecosystem — 500K+ packages on PyPI\nBatteries included — rich standard library\nVersatile — web, scripting, automation, science, DevOps',
      { fontSize: 22, fontFace: PY.font, color: PY.sub, align: 'left', listType: 'bullet', lineSpacing: 1.8 }),
  ])),

  layout('py-code', 'Python', 'Code', 'Code Showcase', slide(PY.code, [
    el('py-c-title', 'text', 0.8, 0.3, 8.0, 0.8, '# Code Example',
      { fontSize: 28, fontFace: 'Consolas', color: PY.accent2, bold: true, align: 'left' }),
    el('py-c-lang', 'text', 9.5, 0.4, 3.0, 0.5, 'Python',
      { fontSize: 14, fontFace: PY.font, color: '#8b949e', align: 'right' }),
    el('py-c-code', 'code', 0.8, 1.2, 11.5, 5.0,
      'from fastapi import FastAPI\nfrom pydantic import BaseModel\n\napp = FastAPI()\n\nclass User(BaseModel):\n    name: str\n    email: str\n    age: int | None = None\n\nusers: dict[int, User] = {}\n\n@app.get("/users/{user_id}")\nasync def get_user(user_id: int):\n    if user_id not in users:\n        return {"error": "User not found"}\n    return users[user_id]\n\n@app.post("/users/{user_id}")\nasync def create_user(user_id: int, user: User):\n    users[user_id] = user\n    return {"created": user.name}',
      { fontSize: 16, fontFace: 'Consolas', color: '#d4d4d4', backgroundColor: PY.codeBg }, { language: 'python' }),
    el('py-c-cap', 'text', 0.8, 6.5, 11.5, 0.5, '↑ REST API with FastAPI and Pydantic',
      { fontSize: 14, fontFace: PY.font, color: '#484f58', align: 'left' }),
  ])),

  layout('py-compare', 'Python', 'Compare', 'Compare & Contrast', slide(PY.bg, [
    el('py-cmp-title', 'text', 0.8, 0.4, 11.5, 0.9, 'Python 2 vs. Python 3',
      { fontSize: 36, fontFace: PY.font, color: PY.text, bold: true, align: 'center' }),
    el('py-cmp-div', 'line', 6.666, 1.6, 0, 5.0, '', {}, { x1: 0, y1: 0, x2: 0, y2: 5.0, lineStyle: { color: PY.border, width: 2 } }),
    el('py-cmp-lh', 'text', 0.8, 1.5, 5.2, 0.7, 'Python 3',
      { fontSize: 26, fontFace: PY.font, color: PY.accent2, bold: true, align: 'center' }),
    el('py-cmp-lb', 'text', 0.8, 2.4, 5.2, 4.0, 'Type hints and dataclasses\nf-strings for formatting\nAsync/await built in\nWalrus operator and match/case',
      { fontSize: 18, fontFace: PY.font, color: PY.sub, align: 'left', listType: 'bullet', lineSpacing: 1.6 }),
    el('py-cmp-rh', 'text', 7.2, 1.5, 5.2, 0.7, 'Python 2 (EOL)',
      { fontSize: 26, fontFace: PY.font, color: '#F47174', bold: true, align: 'center' }),
    el('py-cmp-rb', 'text', 7.2, 2.4, 5.2, 4.0, 'No type hints\nprint as statement, not function\n% and .format() for strings\nEnd of life since Jan 2020',
      { fontSize: 18, fontFace: PY.font, color: PY.sub, align: 'left', listType: 'bullet', lineSpacing: 1.6 }),
  ])),

  layout('py-quote', 'Python', 'Quote', 'Quote', slide(PY.bg, [
    el('py-q-bar', 'shape', 0, 0, 0.4, 7.5, '', {},
      { shape: 'rect', shapeStyle: { fill: PY.accent2, borderColor: 'transparent', borderWidth: 0 } }),
    el('py-q-mark', 'text', 1.5, 0.8, 2.0, 2.0, '\u201C',
      { fontSize: 120, fontFace: 'Georgia', color: PY.accent2, bold: false, align: 'left' }),
    el('py-q-text', 'text', 2.0, 2.2, 9.0, 2.5, 'Readability counts.',
      { fontSize: 36, fontFace: 'Georgia', color: PY.text, bold: false, italic: true, align: 'left', lineSpacing: 1.5 }),
    el('py-q-line', 'line', 2.0, 5.0, 2.5, 0, '', {}, { x1: 0, y1: 0, x2: 2.5, y2: 0, lineStyle: { color: PY.accent2, width: 3 } }),
    el('py-q-auth', 'text', 2.0, 5.3, 9.0, 0.6, '— The Zen of Python (PEP 20)',
      { fontSize: 20, fontFace: 'Georgia', color: PY.sub, align: 'left' }),
  ])),

  layout('py-image', 'Python', 'Image', 'Image + Text', slide(PY.bg, [
    el('py-i-ph', 'shape', 0.6, 0.6, 5.5, 6.0, '🐍\nDrop image here',
      { fontSize: 24, fontFace: PY.font, color: PY.sub, align: 'center' },
      { shape: 'roundedRect', shapeStyle: { fill: PY.card, borderColor: PY.border, borderWidth: 2 } }),
    el('py-i-title', 'text', 6.8, 0.8, 5.7, 0.9, 'Data Pipeline',
      { fontSize: 32, fontFace: PY.font, color: PY.text, bold: true, align: 'left' }),
    el('py-i-line', 'line', 6.8, 1.8, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: PY.accent2, width: 3 } }),
    el('py-i-body', 'text', 6.8, 2.2, 5.7, 4.0, 'Replace the placeholder with your diagram, notebook output, or visualization.\n\nShowcase your data pipeline or ML architecture.',
      { fontSize: 18, fontFace: PY.font, color: PY.sub, align: 'left', lineSpacing: 1.5 }),
  ])),

  layout('py-thanks', 'Python', 'Thank You', 'Thank You', slide(PY.bg, [
    el('py-ty-bar', 'shape', 0, 7.25, 13.333, 0.25, '', {},
      { shape: 'rect', shapeStyle: { fill: PY.accent2, borderColor: 'transparent', borderWidth: 0 } }),
    el('py-ty-logo', 'text', 5.4, 0.8, 2.5, 1.5, '🐍',
      { fontSize: 72, fontFace: PY.font, color: PY.text, align: 'center' }),
    el('py-ty-title', 'text', 1.5, 2.5, 10.3, 1.5, 'Thank You!',
      { fontSize: 64, fontFace: PY.font, color: PY.text, bold: true, align: 'center' }),
    el('py-ty-line', 'line', 5.0, 4.2, 3.3, 0, '', {}, { x1: 0, y1: 0, x2: 3.3, y2: 0, lineStyle: { color: PY.accent2, width: 3 } }),
    el('py-ty-info', 'text', 2.0, 4.7, 9.3, 1.0, 'your.email@company.com\ngithub.com/yourhandle',
      { fontSize: 18, fontFace: PY.font, color: PY.sub, align: 'center', lineSpacing: 1.6 }),
  ])),

  layout('py-table', 'Python', 'Table', 'Data Table', slide(PY.bg, [
    el('py-tbl-title', 'text', 0.8, 0.4, 11.7, 0.8, 'Popular Python Libraries',
      { fontSize: 32, fontFace: PY.font, color: PY.text, bold: true, align: 'left' }),
    el('py-tbl-line', 'line', 0.8, 1.3, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: PY.accent2, width: 3 } }),
    tableEl('py-tbl-data', 0.8, 1.8, 11.7, 4.5,
      [
        ['Library', 'Domain', 'Downloads/mo', 'Use Case'],
        ['pandas', 'Data Analysis', '180M', 'DataFrames & data wrangling'],
        ['FastAPI', 'Web Framework', '30M', 'Modern async REST APIs'],
        ['scikit-learn', 'Machine Learning', '45M', 'Classification & regression'],
        ['pytest', 'Testing', '95M', 'Test framework & fixtures'],
      ],
      { borderColor: PY.border, borderWidth: 1, headerBg: PY.accent, headerColor: '#FFFFFF', cellBg: PY.card, cellColor: PY.text, altRowBg: '#1F2335', fontSize: 16, fontFace: PY.font }
    ),
  ])),

  layout('py-2col', 'Python', '2 Columns', '2 Column Layout', slide(PY.bg, [
    el('py-2c-bar', 'shape', 0, 0, 13.333, 0.15, '', {},
      { shape: 'rect', shapeStyle: { fill: PY.accent2, borderColor: 'transparent', borderWidth: 0 } }),
    el('py-2c-title', 'text', 0.8, 0.5, 11.7, 0.8, "Python's Superpowers",
      { fontSize: 32, fontFace: PY.font, color: PY.text, bold: true, align: 'left' }),
    el('py-2c-line', 'line', 0.8, 1.4, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: PY.accent2, width: 3 } }),
    ovalEl('py-2c-o1', 2.3, 1.9, 1.3, PY.accent, PY.border),
    iconEl('py-2c-i1', 2.45, 2.05, 1.0, ICONS.lightbulb, '#FFFFFF'),
    el('py-2c-t1', 'text', 1.0, 3.4, 5.0, 0.7, 'Data Science',
      { fontSize: 24, fontFace: PY.font, color: PY.text, bold: true, align: 'center' }),
    el('py-2c-b1', 'text', 1.0, 4.2, 5.0, 2.5, 'pandas, NumPy, and Jupyter make Python the #1 language for data exploration and analysis.',
      { fontSize: 16, fontFace: PY.font, color: PY.sub, align: 'center', lineSpacing: 1.5 }),
    ovalEl('py-2c-o2', 9.0, 1.9, 1.3, PY.accent2, PY.border),
    iconEl('py-2c-i2', 9.15, 2.05, 1.0, ICONS.trending, '#000000'),
    el('py-2c-t2', 'text', 7.3, 3.4, 5.0, 0.7, 'Machine Learning',
      { fontSize: 24, fontFace: PY.font, color: PY.text, bold: true, align: 'center' }),
    el('py-2c-b2', 'text', 7.3, 4.2, 5.0, 2.5, 'TensorFlow, PyTorch, and scikit-learn power the world\'s AI from research to production.',
      { fontSize: 16, fontFace: PY.font, color: PY.sub, align: 'center', lineSpacing: 1.5 }),
  ])),

  layout('py-3col', 'Python', '3 Columns', '3 Column Layout', slide(PY.bg, [
    el('py-3c-bar', 'shape', 0, 0, 13.333, 0.15, '', {},
      { shape: 'rect', shapeStyle: { fill: PY.accent2, borderColor: 'transparent', borderWidth: 0 } }),
    el('py-3c-title', 'text', 0.8, 0.5, 11.7, 0.8, 'The Python Ecosystem',
      { fontSize: 32, fontFace: PY.font, color: PY.text, bold: true, align: 'left' }),
    el('py-3c-line', 'line', 0.8, 1.4, 3.0, 0, '', {}, { x1: 0, y1: 0, x2: 3.0, y2: 0, lineStyle: { color: PY.accent2, width: 3 } }),
    ovalEl('py-3c-o1', 1.6, 1.9, 1.2, PY.accent, PY.border),
    iconEl('py-3c-i1', 1.72, 2.02, 0.96, ICONS.globe, '#FFFFFF'),
    el('py-3c-t1', 'text', 0.5, 3.3, 3.4, 0.7, 'Web',
      { fontSize: 22, fontFace: PY.font, color: PY.text, bold: true, align: 'center' }),
    el('py-3c-b1', 'text', 0.5, 4.0, 3.4, 2.5, 'Django, Flask, and FastAPI for full-stack web apps and REST APIs.',
      { fontSize: 15, fontFace: PY.font, color: PY.sub, align: 'center', lineSpacing: 1.5 }),
    ovalEl('py-3c-o2', 6.05, 1.9, 1.2, PY.accent2, PY.border),
    iconEl('py-3c-i2', 6.17, 2.02, 0.96, ICONS.chart, '#000000'),
    el('py-3c-t2', 'text', 4.95, 3.3, 3.4, 0.7, 'Data',
      { fontSize: 22, fontFace: PY.font, color: PY.text, bold: true, align: 'center' }),
    el('py-3c-b2', 'text', 4.95, 4.0, 3.4, 2.5, 'pandas, Polars, and SQLAlchemy for data wrangling, ETL, and analytics.',
      { fontSize: 15, fontFace: PY.font, color: PY.sub, align: 'center', lineSpacing: 1.5 }),
    ovalEl('py-3c-o3', 10.5, 1.9, 1.2, PY.accent3, PY.border),
    iconEl('py-3c-i3', 10.62, 2.02, 0.96, ICONS.zap, '#FFFFFF'),
    el('py-3c-t3', 'text', 9.4, 3.3, 3.4, 0.7, 'AI / ML',
      { fontSize: 22, fontFace: PY.font, color: PY.text, bold: true, align: 'center' }),
    el('py-3c-b3', 'text', 9.4, 4.0, 3.4, 2.5, 'PyTorch, TensorFlow, and Hugging Face for deep learning and LLMs.',
      { fontSize: 15, fontFace: PY.font, color: PY.sub, align: 'center', lineSpacing: 1.5 }),
  ])),

  layout('py-demo', 'Python', 'Demo', 'Demo Slide', slide('#141520', [
    ovalEl('py-dm-bg', 4.5, 0.6, 4.0, '#1e2740', PY.accent),
    iconEl('py-dm-icon', 5.5, 1.6, 2.0, ICONS.terminal, PY.accent2),
    el('py-dm-title', 'text', 1.5, 4.8, 10.0, 1.5, 'DEMO',
      { fontSize: 80, fontFace: PY.font, color: PY.accent2, bold: true, align: 'center' }),
    el('py-dm-sub', 'text', 2.5, 6.1, 8.0, 0.8, 'Pythonic solutions — live coding',
      { fontSize: 24, fontFace: PY.font, color: PY.sub, align: 'center' }),
  ])),
];


const builtInLayouts = [...midnight, ...aurora, ...clean, ...gopher, ...rustacean, ...javascript, ...dotnet, ...java, ...python];

export { builtInLayouts };
