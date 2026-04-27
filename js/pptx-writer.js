// PPTX Writer — serializes the internal model to a downloadable .pptx file using PptxGenJS

import { tokenize } from './syntax-highlight.js';

function _buildShadowOpts(shadow) {
  const dirMap = {
    'drop-bottom-right': { angle: 45,  offset: 6 },
    'drop-bottom-left':  { angle: 135, offset: 6 },
    'drop-top-right':    { angle: 315, offset: 6 },
    'drop-top-left':     { angle: 225, offset: 6 },
    'drop-right':        { angle: 0,   offset: 6 },
    'drop-left':         { angle: 180, offset: 6 },
    'drop-below':        { angle: 90,  offset: 6 },
    'drop-above':        { angle: 270, offset: 6 },
    'soft-glow':         { angle: 0,   offset: 0 },
    'hard-edge':         { angle: 45,  offset: 6 },
    'inner':             { angle: 45,  offset: 4 },
    'deep':              { angle: 45,  offset: 10 },
    'distant':           { angle: 45,  offset: 14 },
    'close':             { angle: 45,  offset: 2 },
    'wide-spread':       { angle: 0,   offset: 0 },
    'distorted':         { angle: 30,  offset: 8 },
    'outer':             { angle: 45,  offset: 6 },
    'perspective':       { angle: 45,  offset: 14 },
  };
  const dir = dirMap[shadow.type] || { angle: 45, offset: 6 };
  const blur = shadow.type === 'soft-glow' ? (shadow.blur || 8) * 2.5
             : shadow.type === 'deep' ? (shadow.blur || 8) * 2
             : shadow.type === 'distant' ? (shadow.blur || 8) * 3
             : shadow.type === 'close' ? Math.max(2, (shadow.blur || 8) * 0.3)
             : shadow.type === 'hard-edge' ? 0
             : shadow.blur || 8;
  return {
    type: shadow.type === 'inner' ? 'inner' : 'outer',
    color: (shadow.color || '#000000').replace('#', ''),
    blur: Math.round(blur),
    offset: dir.offset,
    angle: dir.angle,
    opacity: shadow.opacity ?? 0.4,
  };
}

function writePptx(model, filename = 'presentation.pptx') {
  const pptx = new PptxGenJS();

  // Set slide dimensions (standard 16:9)
  pptx.defineLayout({ name: 'CUSTOM', width: model.slideWidth || 10, height: model.slideHeight || 5.625 });
  pptx.layout = 'CUSTOM';

  for (const slideData of model.slides) {
    const slide = pptx.addSlide();

    // Speaker notes
    if (slideData.notes) {
      slide.addNotes(slideData.notes);
    }

    // Background
    if (slideData.background.color && slideData.background.color !== '#FFFFFF') {
      slide.background = { color: slideData.background.color.replace('#', '') };
    }

    for (const el of slideData.elements) {
      if (el.type === 'text') {
        const baseTextStyle = {
          fontSize: el.style.fontSize,
          fontFace: el.style.fontFace,
          color: el.style.color.replace('#', ''),
          bold: el.style.bold,
          italic: el.style.italic,
          align: el.style.align,
        };
        const textOpts = {
          x: el.x,
          y: el.y,
          w: el.w,
          h: el.h,
          valign: 'top',
          wrap: true,
          ...baseTextStyle,
        };
        if (el.style.lineSpacing && el.style.lineSpacing !== 1.2) {
          textOpts.lineSpacingMultiple = el.style.lineSpacing;
        }
        if (el.style.backgroundColor && el.style.backgroundColor !== 'transparent') {
          textOpts.fill = { color: el.style.backgroundColor.replace('#', '') };
        }
        if (el.style.listType && el.style.listType !== 'none') {
          const lines = (el.content || '').split('\n');
          const bulletRuns = lines.map((line, i) => ({
            text: line,
            options: {
              fontSize: el.style.fontSize,
              fontFace: el.style.fontFace,
              color: el.style.color.replace('#', ''),
              bold: el.style.bold,
              italic: el.style.italic,
              bullet: el.style.listType === 'numbered' ? { type: 'number' } : true,
              breakLine: i < lines.length - 1,
            },
          }));
          slide.addText(bulletRuns, textOpts);
        } else {
          slide.addText(el.content || '', textOpts);
        }

      } else if (el.type === 'code') {
        const tokenColorMap = {
          keyword: { color: '569cd6', bold: true },
          comment: { color: '6a9955', italic: true },
          string:  { color: 'ce9178' },
          number:  { color: 'b5cea8' },
          plain:   { color: (el.style.color || '#d4d4d4').replace('#', '') },
        };
        // Build flat array of text runs; last run per line gets breakLine:true
        const lines = (el.content || '').split('\n');
        const textRuns = [];
        for (let li = 0; li < lines.length; li++) {
          const line = lines[li];
          if (!line) {
            textRuns.push({ text: '', options: { fontSize: el.style.fontSize, fontFace: el.style.fontFace || 'Consolas', color: (el.style.color || '#d4d4d4').replace('#', ''), breakLine: li < lines.length - 1 } });
            continue;
          }
          const tokens = tokenize(line, el.language || 'javascript');
          for (let ti = 0; ti < tokens.length; ti++) {
            const t = tokens[ti];
            const style = tokenColorMap[t.type] || tokenColorMap.plain;
            const run = {
              text: t.text,
              options: {
                fontSize: el.style.fontSize,
                fontFace: el.style.fontFace || 'Consolas',
                color: style.color,
                bold: style.bold || false,
                italic: style.italic || false,
              },
            };
            // Last token on this line gets breakLine (except last line)
            if (ti === tokens.length - 1 && li < lines.length - 1) {
              run.options.breakLine = true;
            }
            textRuns.push(run);
          }
        }
        const codeOpts = {
          x: el.x,
          y: el.y,
          w: el.w,
          h: el.h,
          align: 'left',
          valign: 'top',
          fill: { color: (el.style.backgroundColor || '#1e1e1e').replace('#', '') },
        };
        if (el.shadow && el.shadow.type !== 'none') {
          codeOpts.shadow = _buildShadowOpts(el.shadow);
        }
        slide.addText(textRuns, codeOpts);

      } else if (el.type === 'shape') {
        const shapeMap = {
          'rect': pptx.ShapeType.rect,
          'ellipse': pptx.ShapeType.ellipse,
          'roundRect': pptx.ShapeType.roundRect,
          'diamond': pptx.ShapeType.diamond,
          'triangle': pptx.ShapeType.triangle,
          'pentagon': pptx.ShapeType.pentagon,
          'hexagon': pptx.ShapeType.hexagon,
          'star': pptx.ShapeType.star5,
          'arrow-right': pptx.ShapeType.rightArrow,
          'arrow-left': pptx.ShapeType.leftArrow,
          'trapezoid': pptx.ShapeType.trapezoid,
          'parallelogram': pptx.ShapeType.parallelogram,
          'cross': pptx.ShapeType.plus,
        };
        const shapeType = shapeMap[el.shape] || pptx.ShapeType.rect;

        const shapeOpts = {
          x: el.x,
          y: el.y,
          w: el.w,
          h: el.h,
          fill: { color: (el.shapeStyle.fill || '#4472C4').replace('#', '') },
        };

        if (el.shapeStyle.borderWidth > 0) {
          shapeOpts.line = {
            color: (el.shapeStyle.borderColor || '#000000').replace('#', ''),
            width: el.shapeStyle.borderWidth,
          };
        }

        // Add shadow to shape
        if (el.shadow && el.shadow.type !== 'none') {
          shapeOpts.shadow = _buildShadowOpts(el.shadow);
        }

        if (el.content) {
          // Shape with text
          const textOpts = {
            ...shapeOpts,
            fontSize: el.style.fontSize,
            fontFace: el.style.fontFace,
            color: el.style.color.replace('#', ''),
            bold: el.style.bold,
            italic: el.style.italic,
            align: el.style.align,
            valign: 'middle',
            shape: shapeType,
          };
          slide.addText(el.content, textOpts);
        } else {
          slide.addShape(shapeType, shapeOpts);
        }

      } else if (el.type === 'line') {
        const ls = el.lineStyle || {};
        slide.addShape(pptx.ShapeType.line, {
          x: el.x,
          y: el.y,
          w: el.x2 != null ? el.x2 - (el.x1 || 0) : el.w,
          h: el.y2 != null ? el.y2 - (el.y1 || 0) : 0,
          line: {
            color: (ls.color || '#333333').replace('#', ''),
            width: ls.width || 3,
          },
        });

      } else if (el.type === 'image') {
        if (el.content) {
          const imgOpts = {
            data: el.content,
            x: el.x,
            y: el.y,
            w: el.w,
            h: el.h,
            sizing: { type: 'cover', w: el.w, h: el.h },
          };
          if (el.shadow && el.shadow.type !== 'none') {
            imgOpts.shadow = _buildShadowOpts(el.shadow);
          }
          if (el.cropShape && el.cropShape !== 'none') {
            const cropShapeMap = {
              'ellipse': pptx.ShapeType.ellipse,
              'roundRect': pptx.ShapeType.roundRect,
              'diamond': pptx.ShapeType.diamond,
              'triangle': pptx.ShapeType.triangle,
              'pentagon': pptx.ShapeType.pentagon,
              'hexagon': pptx.ShapeType.hexagon,
              'star': pptx.ShapeType.star5,
              'cross': pptx.ShapeType.plus,
              'arrow-right': pptx.ShapeType.rightArrow,
            };
            imgOpts.rounding = el.cropShape === 'roundRect';
            if (cropShapeMap[el.cropShape] && el.cropShape !== 'roundRect') {
              imgOpts.shape = cropShapeMap[el.cropShape];
            }
          }
          slide.addImage(imgOpts);
        }
      } else if (el.type === 'table' && el.tableData) {
        const ts = el.tableStyle || {};
        const cells = el.tableData.cells || [];
        const tableRows = cells.map((row, ri) => {
          const isHeader = ri === 0 && el.tableData.headerRow;
          return (row || []).map(cellText => ({
            text: cellText || '',
            options: {
              fill: { color: (isHeader ? (ts.headerBg || '#4472C4') : (ri % 2 === 0 ? (ts.altRowBg || '#f0f4ff') : (ts.cellBg || '#FFFFFF'))).replace('#', '') },
              color: (isHeader ? (ts.headerColor || '#FFFFFF') : (ts.cellColor || '#333333')).replace('#', ''),
              fontSize: ts.fontSize || 14,
              fontFace: ts.fontFace || 'Arial',
              bold: isHeader,
              border: { pt: ts.borderWidth || 1, color: (ts.borderColor || '#dee2e6').replace('#', '') },
              valign: 'middle',
            },
          }));
        });
        slide.addTable(tableRows, { x: el.x, y: el.y, w: el.w, h: el.h, colW: el.w / (cells[0]?.length || 3) });
      }
    }
  }

  pptx.writeFile({ fileName: filename });
}

export { writePptx };
