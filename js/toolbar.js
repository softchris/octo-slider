// Toolbar — handles toolbar button interactions, formatting, and background picker
import { iconLibrary, buildIconSvg, buildIconDataUrl } from './icon-library.js';

const SOLID_COLORS = [
  '#FFFFFF', '#000000', '#1E1E2E', '#2B2D42', '#3A86FF', '#4472C4',
  '#264653', '#2A9D8F', '#E9C46A', '#F4A261', '#E76F51', '#EF476F',
  '#06D6A0', '#118AB2', '#073B4C', '#7209B7', '#B5179E', '#F72585',
];

const GRADIENT_PRESETS = [
  { label: 'Ocean',     css: 'linear-gradient(135deg, #667eea, #764ba2)' },
  { label: 'Sunset',    css: 'linear-gradient(135deg, #f093fb, #f5576c)' },
  { label: 'Forest',    css: 'linear-gradient(135deg, #11998e, #38ef7d)' },
  { label: 'Night',     css: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' },
  { label: 'Sky',       css: 'linear-gradient(180deg, #a1c4fd, #c2e9fb)' },
  { label: 'Fire',      css: 'linear-gradient(135deg, #f12711, #f5af19)' },
  { label: 'Cool',      css: 'linear-gradient(135deg, #2193b0, #6dd5ed)' },
  { label: 'Warm',      css: 'linear-gradient(135deg, #e65c00, #F9D423)' },
  { label: 'Berry',     css: 'linear-gradient(135deg, #4e54c8, #8f94fb)' },
  { label: 'Mint',      css: 'linear-gradient(135deg, #00b09b, #96c93d)' },
  { label: 'Rose',      css: 'linear-gradient(135deg, #ee9ca7, #ffdde1)' },
  { label: 'Slate',     css: 'linear-gradient(135deg, #2c3e50, #4ca1af)' },
  { label: 'Dark',      css: 'linear-gradient(135deg, #232526, #414345)' },
  { label: 'Coral',     css: 'linear-gradient(135deg, #ff9a9e, #fecfef)' },
  { label: 'Deep Blue', css: 'linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)' },
  { label: 'Aurora',    css: 'linear-gradient(135deg, #43cea2, #185a9d)' },
  { label: 'Lavender',  css: 'linear-gradient(135deg, #c471f5, #fa71cd)' },
  { label: 'Storm',     css: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)' },
];

class Toolbar {
  constructor(model, editor, renderer) {
    this.model = model;
    this.editor = editor;
    this.renderer = renderer;
    // Start fresh each session — only track colors used in this session
    this._recentColors = [];
    this._bindButtons();
    this._bindFormatControls();
    this._bindBackgroundPicker();
    this._bindSelectionTools();
  }

  _trackRecentColor(color) {
    if (!color || !color.startsWith('#')) return;
    this._recentColors = this._recentColors.filter(c => c !== color);
    this._recentColors.unshift(color);
    if (this._recentColors.length > 3) this._recentColors.length = 3;
    this._renderAllRecentSwatches();
  }

  _renderRecentSwatchesFor(containerId, inputId, applyFn) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    if (this._recentColors.length === 0) return;
    for (const color of this._recentColors) {
      const swatch = document.createElement('div');
      swatch.className = 'recent-swatch';
      swatch.style.background = color;
      swatch.title = color;
      if (color === '#FFFFFF' || color === '#ffffff') swatch.style.border = '2px solid #6c7086';
      swatch.addEventListener('click', () => {
        document.getElementById(inputId).value = color;
        applyFn(color);
      });
      container.appendChild(swatch);
    }
  }

  _renderAllRecentSwatches() {
    this._renderRecentSwatchesFor('recent-fill-colors', 'color-fill', (c) => {
      const el = this._getSelectedElement();
      if (!el) return;
      this.model.updateElement(this.model.activeSlideIndex, el.id, { shapeStyle: { fill: c } });
      this._rerenderKeepSelection();
    });
    this._renderRecentSwatchesFor('recent-border-colors', 'color-border', (c) => {
      const el = this._getSelectedElement();
      if (!el) return;
      this.model.updateElement(this.model.activeSlideIndex, el.id, { shapeStyle: { borderColor: c } });
      this._rerenderKeepSelection();
    });
    this._renderRecentSwatchesFor('recent-font-colors', 'color-font', (c) => {
      const el = this._getSelectedElement();
      if (!el) return;
      this.model.updateElement(this.model.activeSlideIndex, el.id, { style: { color: c } });
      this._rerenderKeepSelection();
    });
    this._renderRecentSwatchesFor('recent-text-bg-colors', 'color-text-bg', (c) => {
      const elements = this._getSelectedElements().filter(e => e.type === 'text');
      for (const el of elements) {
        this.model.updateElement(this.model.activeSlideIndex, el.id, { style: { backgroundColor: c } });
      }
      this._rerenderKeepSelection();
    });
  }

  _previewShadowType(type) {
    const elements = this._getSelectedElements().filter(e => e.type === 'shape' || e.type === 'image');
    if (elements.length === 0) return;
    // Save originals on first preview
    if (!this._savedShadows) {
      this._savedShadows = elements.map(el => ({ id: el.id, shadow: { ...el.shadow } }));
    }
    for (const el of elements) {
      this.model.updateElement(this.model.activeSlideIndex, el.id, { shadow: { type } });
      this.renderer.updateElementDom(
        this.model.getElement(this.model.activeSlideIndex, el.id)
      );
    }
  }

  _restoreShadowPreview() {
    if (!this._savedShadows) return;
    for (const saved of this._savedShadows) {
      this.model.updateElement(this.model.activeSlideIndex, saved.id, { shadow: { type: saved.shadow.type || 'none' } });
      const el = this.model.getElement(this.model.activeSlideIndex, saved.id);
      if (el) this.renderer.updateElementDom(el);
    }
    this._savedShadows = null;
  }

  _setShadowDropdownValue(value) {
    this._shadowTypeValue = value;
    const menu = document.getElementById('shadow-type-menu');
    const selected = document.getElementById('shadow-type-selected');
    const item = menu.querySelector(`[data-value="${value}"]`);
    selected.textContent = item ? item.textContent : 'None';
    menu.querySelectorAll('.custom-dropdown-item').forEach(i => {
      i.classList.toggle('active', i.dataset.value === value);
    });
  }

  _bindButtons() {
    const btnAddText = document.getElementById('btn-add-text');
    const btnAddImage = document.getElementById('btn-add-image');
    const imageInput = document.getElementById('image-input');
    const imageAddMenu = document.getElementById('image-add-menu');
    const btnImageFromFile = document.getElementById('btn-image-from-file');
    const btnAddIcon = document.getElementById('btn-add-icon');

    btnAddText.addEventListener('click', () => {
      const el = this.model.addElement(this.model.activeSlideIndex, {
        type: 'text',
        x: 3.0, y: 2.0, w: 4.0, h: 1.0,
        content: 'New Text',
        style: { fontSize: 24, fontFace: 'Calibri', color: '#333333' },
      });
      this.renderer.addElementDom(el);
      this.editor.deselect();
      this.editor.select(el.id);
    });

    // --- Shapes dropdown ---
    const shapesBtn = document.getElementById('btn-shapes');
    const shapeMenu = document.getElementById('shape-dropdown-menu');
    if (shapesBtn && shapeMenu) {
      shapesBtn.addEventListener('click', () => {
        const isOpen = shapeMenu.classList.toggle('open');
        if (isOpen) {
          // Move to body to avoid toolbar overflow clipping
          if (shapeMenu.parentElement !== document.body) {
            document.body.appendChild(shapeMenu);
          }
          const rect = shapesBtn.getBoundingClientRect();
          shapeMenu.style.left = rect.left + 'px';
          shapeMenu.style.top = rect.bottom + 2 + 'px';
        }
      });
      document.addEventListener('click', (e) => {
        if (!e.target.closest('#shape-dropdown')) {
          shapeMenu.classList.remove('open');
        }
      });
      shapeMenu.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-shape]');
        if (!btn) return;
        const shape = btn.dataset.shape;
        shapeMenu.classList.remove('open');

        if (shape === 'line') {
          const el = this.model.addElement(this.model.activeSlideIndex, {
            type: 'line',
            x: 2.0, y: 2.5, w: 4.0, h: 0,
            x1: 0, y1: 0, x2: 4.0, y2: 0,
            lineStyle: { color: '#333333', width: 3 },
          });
          this.renderer.addElementDom(el);
          this.editor.deselect();
          this.editor.select(el.id);
          return;
        }

        if (shape === 'explanation') {
          // Explanation callout: angled line (30°) + horizontal line + text box, grouped
          const groupId = 'grp-' + Date.now();
          // Angled line: rises at ~30° from bottom-left to top-right
          // 30° means rise = length * sin(30°) = length * 0.5
          const angledLen = 1.5; // inches horizontal
          const angledRise = angledLen * Math.tan(Math.PI / 6); // ~0.866
          const baseX = 3.0, baseY = 3.5;
          const angledLine = this.model.addElement(this.model.activeSlideIndex, {
            type: 'line',
            x: baseX, y: baseY - angledRise,
            x1: 0, y1: angledRise, x2: angledLen, y2: 0,
            lineStyle: { color: '#333333', width: 2 },
            groupId,
          });
          // Horizontal line: extends right from the top of the angled line
          const horizLen = 2.5;
          const horizLine = this.model.addElement(this.model.activeSlideIndex, {
            type: 'line',
            x: baseX + angledLen, y: baseY - angledRise,
            x1: 0, y1: 0, x2: horizLen, y2: 0,
            lineStyle: { color: '#333333', width: 2 },
            groupId,
          });
          // Text box: above the horizontal line
          const textBox = this.model.addElement(this.model.activeSlideIndex, {
            type: 'text',
            x: baseX + angledLen, y: baseY - angledRise - 0.5,
            w: horizLen, h: 0.45,
            content: 'Explanation',
            style: { fontSize: 14, fontFace: 'Calibri', color: '#333333', align: 'left' },
            groupId,
          });
          this.renderer.addElementDom(angledLine);
          this.renderer.addElementDom(horizLine);
          this.renderer.addElementDom(textBox);
          this.editor.deselect();
          this.editor._selectGroup(angledLine.id);
          return;
        }

        const el = this.model.addElement(this.model.activeSlideIndex, {
          type: 'shape',
          shape,
          x: 3.0, y: 2.0, w: 3.0, h: 2.0,
          shapeStyle: { fill: '#4472C4', borderColor: '#2F5496', borderWidth: 1 },
        });
        this._trackRecentColor(el.shapeStyle.fill);
        this.renderer.addElementDom(el);
        this.editor.deselect();
        this.editor.select(el.id);
      });
    }

    btnAddImage.addEventListener('click', (e) => {
      e.stopPropagation();
      const visible = imageAddMenu.style.display !== 'none';
      if (visible) {
        imageAddMenu.style.display = 'none';
      } else {
        const rect = btnAddImage.getBoundingClientRect();
        imageAddMenu.style.left = rect.left + 'px';
        imageAddMenu.style.top = (rect.bottom + 4) + 'px';
        imageAddMenu.style.display = 'block';
      }
    });

    document.addEventListener('click', () => {
      imageAddMenu.style.display = 'none';
    });

    btnImageFromFile.addEventListener('click', () => {
      imageAddMenu.style.display = 'none';
      imageInput.click();
    });

    btnAddIcon.addEventListener('click', () => {
      imageAddMenu.style.display = 'none';
      this._openIconPicker();
    });

    imageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const el = this.model.addElement(this.model.activeSlideIndex, {
          type: 'image',
          x: 2.5, y: 1.0, w: 5.0, h: 3.5,
          content: reader.result,
        });
        this.renderer.addElementDom(el);
        this.editor.deselect();
        this.editor.select(el.id);
      };
      reader.readAsDataURL(file);
      imageInput.value = '';
    });

    const btnAddCode = document.getElementById('btn-add-code');
    btnAddCode.addEventListener('click', () => {
      const el = this.model.addElement(this.model.activeSlideIndex, {
        type: 'code',
        x: 2.0, y: 1.5, w: 5.0, h: 2.5,
        content: '// Your code here\nfunction hello() {\n  console.log("Hello!");\n}',
        language: 'javascript',
      });
      this.renderer.addElementDom(el);
      this.editor.deselect();
      this.editor.select(el.id);
    });

    // --- Table button ---
    const btnAddTable = document.getElementById('btn-add-table');
    const tableOverlay = document.getElementById('table-config-overlay');
    const tableRowsInput = document.getElementById('table-rows');
    const tableColsInput = document.getElementById('table-cols');
    const tablePreview = document.getElementById('table-config-preview');
    const tableInsertBtn = document.getElementById('table-config-insert');
    const tableCloseBtn = document.getElementById('table-config-close');

    const updateTablePreview = () => {
      const rows = Math.max(2, Math.min(10, parseInt(tableRowsInput.value) || 3));
      const cols = Math.max(2, Math.min(8, parseInt(tableColsInput.value) || 3));
      let html = '<table>';
      for (let r = 0; r < Math.min(rows, 6); r++) {
        html += '<tr>';
        for (let c = 0; c < cols; c++) html += '<td></td>';
        html += '</tr>';
      }
      if (rows > 6) html += `<tr><td colspan="${cols}" style="text-align:center;color:#7f849c;font-size:11px;border:none">+${rows - 6} more rows</td></tr>`;
      html += '</table>';
      tablePreview.innerHTML = html;
    };

    btnAddTable.addEventListener('click', () => {
      tableRowsInput.value = 4;
      tableColsInput.value = 3;
      updateTablePreview();
      tableOverlay.style.display = 'flex';
    });

    tableRowsInput.addEventListener('input', updateTablePreview);
    tableColsInput.addEventListener('input', updateTablePreview);

    tableCloseBtn.addEventListener('click', () => {
      tableOverlay.style.display = 'none';
    });
    tableOverlay.addEventListener('click', (e) => {
      if (e.target === tableOverlay) tableOverlay.style.display = 'none';
    });

    tableInsertBtn.addEventListener('click', () => {
      const rows = Math.max(2, Math.min(10, parseInt(tableRowsInput.value) || 3));
      const cols = Math.max(2, Math.min(8, parseInt(tableColsInput.value) || 3));
      tableOverlay.style.display = 'none';
      const el = this.model.addElement(this.model.activeSlideIndex, {
        type: 'table',
        x: 1.5, y: 1.5,
        tableData: {
          cells: Array.from({ length: rows }, (_, ri) =>
            Array.from({ length: cols }, (_, ci) => ri === 0 ? `Header ${ci + 1}` : '')
          ),
          headerRow: true,
          rows, cols,
        },
      });
      this.renderer.addElementDom(el);
      this.editor.deselect();
      this.editor.select(el.id);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && tableOverlay.style.display !== 'none') {
        tableOverlay.style.display = 'none';
      }
    });
  }

  _bindSelectionTools() {
    const btnDelete = document.getElementById('btn-delete-el');
    const btnDuplicate = document.getElementById('btn-duplicate-el');

    btnDelete.addEventListener('click', () => {
      if (this.editor.selectedElementIds.length === 0) return;
      for (const id of [...this.editor.selectedElementIds]) {
        this.model.removeElement(this.model.activeSlideIndex, id);
        this.renderer.removeElementDom(id);
      }
      this.editor.deselect();
    });

    btnDuplicate.addEventListener('click', () => {
      const el = this._getSelectedElement();
      if (!el) return;
      const clone = this.model.addElement(this.model.activeSlideIndex, {
        type: el.type,
        shape: el.shape,
        x: el.x + 0.3,
        y: el.y + 0.3,
        w: el.w,
        h: el.h,
        content: el.content,
        style: { ...el.style },
        shapeStyle: { ...el.shapeStyle },
        shadow: { ...el.shadow },
        ...(el.type === 'line' ? { x1: el.x1, y1: el.y1, x2: el.x2, y2: el.y2, lineStyle: { ...el.lineStyle } } : {}),
        ...(el.type === 'code' ? { language: el.language } : {}),
        ...(el.type === 'image' && el.cropShape ? { cropShape: el.cropShape } : {}),
        ...(el.iconData ? { iconData: { ...el.iconData } } : {}),
        ...(el.type === 'table' ? { tableData: JSON.parse(JSON.stringify(el.tableData)), tableStyle: { ...el.tableStyle } } : {}),
      });
      // Append only the new element instead of rebuilding everything
      const domEl = this.renderer._createElementDom(clone, false);
      this.renderer.canvas.appendChild(domEl);
      this.renderer.renderThumbnails();
      this.editor.selectedElementId = null;
      this.editor.selectedElementIds = [];
      this.editor.select(clone.id);
    });
  }

  _bindBackgroundPicker() {
    const btnSlideBg = document.getElementById('btn-slide-bg');
    const overlay = document.getElementById('bg-picker-overlay');
    const closeBtn = document.getElementById('bg-picker-close');
    const solidContainer = document.getElementById('bg-solid-swatches');
    const gradientContainer = document.getElementById('bg-gradient-swatches');
    const customColor = document.getElementById('bg-custom-color');
    const applyCustom = document.getElementById('bg-apply-custom');

    this._recentBgColors = [];

    // Populate solid swatches
    for (const color of SOLID_COLORS) {
      const swatch = document.createElement('div');
      swatch.className = 'bg-swatch';
      swatch.style.background = color;
      if (color === '#FFFFFF') swatch.style.border = '2px solid #6c7086';
      swatch.addEventListener('click', () => {
        this._applyBackground(color);
        overlay.style.display = 'none';
      });
      solidContainer.appendChild(swatch);
    }

    // Populate gradient swatches
    for (const g of GRADIENT_PRESETS) {
      const swatch = document.createElement('div');
      swatch.className = 'bg-swatch';
      swatch.style.background = g.css;
      swatch.title = g.label;
      swatch.addEventListener('click', () => {
        this._applyBackground(g.css);
        overlay.style.display = 'none';
      });
      gradientContainer.appendChild(swatch);
    }

    btnSlideBg.addEventListener('click', () => {
      this._renderRecentBgSwatches();
      overlay.style.display = 'flex';
    });

    closeBtn.addEventListener('click', () => {
      overlay.style.display = 'none';
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.style.display = 'none';
    });

    applyCustom.addEventListener('click', () => {
      this._applyBackground(customColor.value);
      overlay.style.display = 'none';
    });
  }

  _addRecentBgColor(color) {
    this._recentBgColors = this._recentBgColors.filter(c => c !== color);
    this._recentBgColors.unshift(color);
    if (this._recentBgColors.length > 3) this._recentBgColors.length = 3;
  }

  _renderRecentBgSwatches() {
    const section = document.getElementById('bg-recent-section');
    const container = document.getElementById('bg-recent-swatches');
    container.innerHTML = '';
    if (this._recentBgColors.length === 0) {
      section.style.display = 'none';
      return;
    }
    section.style.display = '';
    const overlay = document.getElementById('bg-picker-overlay');
    for (const color of this._recentBgColors) {
      const swatch = document.createElement('div');
      swatch.className = 'bg-swatch';
      swatch.style.background = color;
      if (color === '#FFFFFF') swatch.style.border = '2px solid #6c7086';
      swatch.addEventListener('click', () => {
        this._applyBackground(color);
        overlay.style.display = 'none';
      });
      container.appendChild(swatch);
    }
  }

  _applyBackground(bgValue) {
    const slide = this.model.getActiveSlide();
    if (!slide) return;
    slide.background.color = bgValue;
    this._addRecentBgColor(bgValue);
    // Update canvas background directly without full rebuild
    if (bgValue && (bgValue.startsWith('linear-gradient') || bgValue.startsWith('radial-gradient'))) {
      this.renderer.canvas.style.backgroundColor = '';
      this.renderer.canvas.style.background = bgValue;
    } else {
      this.renderer.canvas.style.background = '';
      this.renderer.canvas.style.backgroundColor = bgValue || '#ffffff';
    }
    this.renderer.renderThumbnails();
  }

  _bindFormatControls() {
    const btnBold = document.getElementById('btn-bold');
    const btnItalic = document.getElementById('btn-italic');
    const selFontSize = document.getElementById('sel-font-size');
    const selFontFamily = document.getElementById('sel-font-family');
    const colorFont = document.getElementById('color-font');
    const selAlign = document.getElementById('sel-align');
    const selListType = document.getElementById('sel-list-type');
    const selLineSpacing = document.getElementById('sel-line-spacing');
    const colorFill = document.getElementById('color-fill');
    const colorBorder = document.getElementById('color-border');
    const selBorderWidth = document.getElementById('sel-border-width');

    btnBold.addEventListener('click', () => {
      const el = this._getSelectedElement();
      if (!el) return;
      this.model.updateElement(this.model.activeSlideIndex, el.id, {
        style: { bold: !el.style.bold },
      });
      this._rerenderKeepSelection();
    });

    btnItalic.addEventListener('click', () => {
      const el = this._getSelectedElement();
      if (!el) return;
      this.model.updateElement(this.model.activeSlideIndex, el.id, {
        style: { italic: !el.style.italic },
      });
      this._rerenderKeepSelection();
    });

    selFontSize.addEventListener('change', () => {
      const el = this._getSelectedElement();
      if (!el) return;
      this.model.updateElement(this.model.activeSlideIndex, el.id, {
        style: { fontSize: parseInt(selFontSize.value) },
      });
      this._rerenderKeepSelection();
    });

    selFontFamily.addEventListener('change', () => {
      const el = this._getSelectedElement();
      if (!el) return;
      this.model.updateElement(this.model.activeSlideIndex, el.id, {
        style: { fontFace: selFontFamily.value },
      });
      this._rerenderKeepSelection();
    });

    colorFont.addEventListener('input', () => {
      const el = this._getSelectedElement();
      if (!el) return;
      this.model.updateElement(this.model.activeSlideIndex, el.id, {
        style: { color: colorFont.value },
      });
      this._rerenderKeepSelection();
    });
    colorFont.addEventListener('change', () => {
      this._trackRecentColor(colorFont.value);
    });

    const colorTextBg = document.getElementById('color-text-bg');
    const btnTextBgClear = document.getElementById('btn-text-bg-clear');

    colorTextBg.addEventListener('input', () => {
      const elements = this._getSelectedElements().filter(e => e.type === 'text');
      for (const el of elements) {
        this.model.updateElement(this.model.activeSlideIndex, el.id, {
          style: { backgroundColor: colorTextBg.value },
        });
      }
      this._rerenderKeepSelection();
    });
    colorTextBg.addEventListener('change', () => {
      this._trackRecentColor(colorTextBg.value);
    });

    btnTextBgClear.addEventListener('click', () => {
      const elements = this._getSelectedElements().filter(e => e.type === 'text');
      for (const el of elements) {
        this.model.updateElement(this.model.activeSlideIndex, el.id, {
          style: { backgroundColor: 'transparent' },
        });
      }
      this._rerenderKeepSelection();
    });

    selAlign.addEventListener('change', () => {
      const el = this._getSelectedElement();
      if (!el) return;
      this.model.updateElement(this.model.activeSlideIndex, el.id, {
        style: { align: selAlign.value },
      });
      this._rerenderKeepSelection();
    });

    selListType.addEventListener('change', () => {
      const el = this._getSelectedElement();
      if (!el) return;
      this.model.updateElement(this.model.activeSlideIndex, el.id, {
        style: { listType: selListType.value },
      });
      this._rerenderKeepSelection();
    });

    selLineSpacing.addEventListener('change', () => {
      const el = this._getSelectedElement();
      if (!el) return;
      this.model.updateElement(this.model.activeSlideIndex, el.id, {
        style: { lineSpacing: parseFloat(selLineSpacing.value) },
      });
      this._rerenderKeepSelection();
    });

    colorFill.addEventListener('input', () => {
      const elements = this._getSelectedElements().filter(e => e.type === 'shape');
      for (const el of elements) {
        this.model.updateElement(this.model.activeSlideIndex, el.id, {
          shapeStyle: { fill: colorFill.value },
        });
      }
      this._rerenderKeepSelection();
    });
    colorFill.addEventListener('change', () => {
      this._trackRecentColor(colorFill.value);
    });

    colorBorder.addEventListener('input', () => {
      const elements = this._getSelectedElements().filter(e => e.type === 'shape');
      for (const el of elements) {
        this.model.updateElement(this.model.activeSlideIndex, el.id, {
          shapeStyle: { borderColor: colorBorder.value },
        });
      }
      this._rerenderKeepSelection();
    });
    colorBorder.addEventListener('change', () => {
      this._trackRecentColor(colorBorder.value);
    });

    selBorderWidth.addEventListener('change', () => {
      const elements = this._getSelectedElements().filter(e => e.type === 'shape');
      for (const el of elements) {
        this.model.updateElement(this.model.activeSlideIndex, el.id, {
          shapeStyle: { borderWidth: parseInt(selBorderWidth.value) },
        });
      }
      this._rerenderKeepSelection();
    });

    // Code controls
    const selCodeLanguage = document.getElementById('sel-code-language');
    const selCodeFontSize = document.getElementById('sel-code-font-size');
    const colorCodeText = document.getElementById('color-code-text');
    const colorCodeBg = document.getElementById('color-code-bg');

    selCodeLanguage.addEventListener('change', () => {
      const elements = this._getSelectedElements().filter(e => e.type === 'code');
      for (const el of elements) {
        this.model.updateElement(this.model.activeSlideIndex, el.id, { language: selCodeLanguage.value });
      }
      this._rerenderKeepSelection();
    });

    selCodeFontSize.addEventListener('change', () => {
      const elements = this._getSelectedElements().filter(e => e.type === 'code');
      for (const el of elements) {
        this.model.updateElement(this.model.activeSlideIndex, el.id, { style: { fontSize: parseInt(selCodeFontSize.value) } });
      }
      this._rerenderKeepSelection();
    });

    colorCodeText.addEventListener('input', () => {
      const elements = this._getSelectedElements().filter(e => e.type === 'code');
      for (const el of elements) {
        this.model.updateElement(this.model.activeSlideIndex, el.id, { style: { color: colorCodeText.value } });
      }
      this._rerenderKeepSelection();
    });

    colorCodeBg.addEventListener('input', () => {
      const elements = this._getSelectedElements().filter(e => e.type === 'code');
      for (const el of elements) {
        this.model.updateElement(this.model.activeSlideIndex, el.id, { style: { backgroundColor: colorCodeBg.value } });
      }
      this._rerenderKeepSelection();
    });

    // Line controls
    const colorLine = document.getElementById('color-line');
    const selLineWidth = document.getElementById('sel-line-width');

    if (colorLine) {
      colorLine.addEventListener('input', () => {
        const elements = this._getSelectedElements().filter(e => e.type === 'line');
        for (const el of elements) {
          this.model.updateElement(this.model.activeSlideIndex, el.id, { lineStyle: { ...(el.lineStyle || {}), color: colorLine.value } });
        }
        this._rerenderKeepSelection();
      });
    }
    if (selLineWidth) {
      selLineWidth.addEventListener('change', () => {
        const elements = this._getSelectedElements().filter(e => e.type === 'line');
        for (const el of elements) {
          this.model.updateElement(this.model.activeSlideIndex, el.id, { lineStyle: { ...(el.lineStyle || {}), width: parseInt(selLineWidth.value) } });
        }
        this._rerenderKeepSelection();
      });
    }

    // Crop shape control for images
    const selCropShape = document.getElementById('sel-crop-shape');
    if (selCropShape) {
      selCropShape.addEventListener('change', () => {
        const el = this._getSelectedElement();
        if (!el || el.type !== 'image') return;
        this.model.updateElement(this.model.activeSlideIndex, el.id, { cropShape: selCropShape.value });
        this._rerenderKeepSelection();
      });
    }

    // Table format controls
    this._bindTableFormatControls();

    // Shadow controls — custom dropdown with hover preview
    const shadowDropdown = document.getElementById('shadow-type-dropdown');
    const shadowSelected = document.getElementById('shadow-type-selected');
    const shadowMenu = document.getElementById('shadow-type-menu');
    const colorShadow = document.getElementById('color-shadow');

    this._shadowTypeValue = 'none';

    shadowSelected.addEventListener('click', (e) => {
      e.stopPropagation();
      shadowMenu.classList.toggle('open');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
      shadowMenu.classList.remove('open');
    });
    shadowMenu.addEventListener('click', (e) => e.stopPropagation());

    // Hover preview: temporarily apply shadow to DOM elements
    shadowMenu.querySelectorAll('.custom-dropdown-item').forEach(item => {
      item.addEventListener('mouseenter', () => {
        const previewType = item.dataset.value;
        this._previewShadowType(previewType);
      });

      item.addEventListener('click', () => {
        const value = item.dataset.value;
        this._shadowTypeValue = value;
        shadowSelected.textContent = item.textContent;
        shadowMenu.classList.remove('open');

        // Commit to model
        const elements = this._getSelectedElements().filter(e => e.type === 'shape' || e.type === 'image');
        for (const el of elements) {
          this.model.updateElement(this.model.activeSlideIndex, el.id, {
            shadow: { type: value },
          });
        }
        this._savedShadows = null;
        this._rerenderKeepSelection();
      });
    });

    // Restore original shadow when leaving the menu
    shadowMenu.addEventListener('mouseleave', () => {
      this._restoreShadowPreview();
    });

    colorShadow.addEventListener('input', () => {
      const elements = this._getSelectedElements().filter(e => e.type === 'shape' || e.type === 'image');
      for (const el of elements) {
        this.model.updateElement(this.model.activeSlideIndex, el.id, {
          shadow: { color: colorShadow.value },
        });
      }
      this._rerenderKeepSelection();
    });

    // Show/hide format tools based on selection
    this.editor.onSelectionChange = (elementId, element) => {
      if (elementId === '__multi__') {
        // Use first selected element to drive visibility
        const allEls = this._getSelectedElements();
        this._updateFormatToolVisibility(allEls[0] || null);
      } else {
        this._updateFormatToolVisibility(element);
      }
    };
  }

  _rerenderKeepSelection() {
    const wasEditing = this.editor.isEditing;
    const editingId = this.editor.selectedElementId;

    // Save any in-progress text edit to the model before re-rendering
    if (wasEditing && editingId) {
      const domEl = this.renderer.canvas.querySelector(`[data-element-id="${editingId}"]`);
      if (domEl) {
        const content = domEl.querySelector('.element-content');
        if (content) {
          const el = this.model.getElement(this.model.activeSlideIndex, editingId);
          // innerText preserves newlines from contentEditable; textContent does not
          const text = (el && el.type === 'code') ? content.innerText : content.textContent;
          this.model.updateElement(this.model.activeSlideIndex, editingId, {
            content: text,
          });
        }
      }
    }
    // Update all selected elements' DOM
    const elements = this._getSelectedElements();
    for (const el of elements) {
      this.renderer.updateElementDom(el);
    }
    if (elements.length === 1) {
      this.editor.restoreSelection();
    }

    // Re-enter edit mode if we were editing
    if (wasEditing && editingId) {
      const newDom = this.renderer.canvas.querySelector(`[data-element-id="${editingId}"]`);
      if (newDom) {
        const content = newDom.querySelector('.element-content');
        if (content) {
          newDom.classList.add('editing');
          content.contentEditable = 'true';
          content.focus();
          // Place cursor at end
          const range = document.createRange();
          range.selectNodeContents(content);
          range.collapse(false);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    }

    // Re-notify so toolbar controls stay synced
    const el = this._getSelectedElement();
    if (this.editor.onSelectionChange) this.editor.onSelectionChange(this.editor.selectedElementId, el);
  }

  _getSelectedElement() {
    if (!this.editor.selectedElementId) return null;
    return this.model.getElement(this.model.activeSlideIndex, this.editor.selectedElementId);
  }

  _getSelectedElements() {
    return this.editor.selectedElementIds
      .map(id => this.model.getElement(this.model.activeSlideIndex, id))
      .filter(Boolean);
  }

  _showToolGroup(el) {
    el.style.display = 'flex';
  }

  _hideToolGroup(el) {
    el.style.display = 'none';
  }

  _updateFormatToolVisibility(element) {
    const textTools = document.getElementById('text-format-tools');
    const shapeTools = document.getElementById('shape-format-tools');
    const selectionTools = document.getElementById('selection-tools');
    const shadowTools = document.getElementById('shadow-tools');
    const codeTools = document.getElementById('code-format-tools');
    const lineTools = document.getElementById('line-format-tools');
    const imageTools = document.getElementById('image-format-tools');
    const tableTools2 = document.getElementById('table-format-tools');
    const propsEmpty = document.getElementById('props-empty');

    if (!element) {
      this._hideToolGroup(textTools);
      this._hideToolGroup(shapeTools);
      this._hideToolGroup(selectionTools);
      this._hideToolGroup(shadowTools);
      this._hideToolGroup(codeTools);
      if (lineTools) this._hideToolGroup(lineTools);
      if (imageTools) this._hideToolGroup(imageTools);
      if (tableTools2) this._hideToolGroup(tableTools2);
      if (propsEmpty) propsEmpty.style.display = '';
      return;
    }

    if (propsEmpty) propsEmpty.style.display = 'none';

    // Multi-select: show shape/shadow tools if any selected are shapes/images
    if (this.editor.selectedElementIds.length > 1) {
      this._showToolGroup(selectionTools);
      this._hideToolGroup(textTools);
      this._hideToolGroup(codeTools);
      if (lineTools) this._hideToolGroup(lineTools);
      if (imageTools) this._hideToolGroup(imageTools);
      if (tableTools2) this._hideToolGroup(tableTools2);

      const allEls = this._getSelectedElements();
      const hasShapes = allEls.some(e => e.type === 'shape');
      const hasShapesOrImages = allEls.some(e => e.type === 'shape' || e.type === 'image');

      if (hasShapes) {
        this._showToolGroup(shapeTools);
        const firstShape = allEls.find(e => e.type === 'shape');
        const fill = firstShape.shapeStyle.fill || '#ffffff';
        document.getElementById('color-fill').value = fill.startsWith('#') ? fill : '#ffffff';
        const bc = firstShape.shapeStyle.borderColor || '#000000';
        document.getElementById('color-border').value = bc.startsWith('#') ? bc : '#000000';
        document.getElementById('sel-border-width').value = firstShape.shapeStyle.borderWidth;
      } else {
        this._hideToolGroup(shapeTools);
      }

      if (hasShapesOrImages) {
        this._showToolGroup(shadowTools);
        const firstShadowEl = allEls.find(e => e.type === 'shape' || e.type === 'image');
        this._setShadowDropdownValue(firstShadowEl.shadow?.type || 'none');
        document.getElementById('color-shadow').value = firstShadowEl.shadow?.color || '#000000';
      } else {
        this._hideToolGroup(shadowTools);
      }

      this._renderAllRecentSwatches();
      return;
    }

    // Always show selection tools (delete/duplicate) when something is selected
    this._showToolGroup(selectionTools);

    // Show shadow tools for shapes and images
    if (element.type === 'shape' || element.type === 'image') {
      this._showToolGroup(shadowTools);
      this._setShadowDropdownValue(element.shadow?.type || 'none');
      document.getElementById('color-shadow').value = element.shadow?.color || '#000000';
    } else {
      this._hideToolGroup(shadowTools);
    }

    if (element.type === 'text' || (element.type === 'shape' && element.content)) {
      this._showToolGroup(textTools);
      document.getElementById('sel-font-size').value = element.style.fontSize;
      document.getElementById('sel-font-family').value = element.style.fontFace || 'Arial';
      document.getElementById('color-font').value = element.style.color;
      document.getElementById('sel-align').value = element.style.align;
      document.getElementById('sel-list-type').value = element.style.listType || 'none';
      document.getElementById('sel-line-spacing').value = String(element.style.lineSpacing || 1.2);
      document.getElementById('btn-bold').classList.toggle('active', element.style.bold);
      document.getElementById('btn-italic').classList.toggle('active', element.style.italic);
      const bg = element.style.backgroundColor || 'transparent';
      document.getElementById('color-text-bg').value = bg === 'transparent' ? '#ffffff' : bg;
    } else {
      this._hideToolGroup(textTools);
    }

    if (element.type === 'shape') {
      this._showToolGroup(shapeTools);
      const fill = element.shapeStyle.fill || '#ffffff';
      document.getElementById('color-fill').value = fill.startsWith('#') ? fill : '#ffffff';
      const bc = element.shapeStyle.borderColor || '#000000';
      document.getElementById('color-border').value = bc.startsWith('#') ? bc : '#000000';
      document.getElementById('sel-border-width').value = element.shapeStyle.borderWidth;
    } else {
      this._hideToolGroup(shapeTools);
    }

    if (element.type === 'code') {
      this._showToolGroup(codeTools);
      document.getElementById('sel-code-language').value = element.language || 'javascript';
      document.getElementById('sel-code-font-size').value = element.style.fontSize || 16;
      document.getElementById('color-code-text').value = element.style.color || '#d4d4d4';
      document.getElementById('color-code-bg').value = element.style.backgroundColor || '#1e1e1e';
      // Also show shadow for code elements
      this._showToolGroup(shadowTools);
      this._setShadowDropdownValue(element.shadow?.type || 'none');
      document.getElementById('color-shadow').value = element.shadow?.color || '#000000';
    } else {
      this._hideToolGroup(codeTools);
    }

    if (element.type === 'line' && lineTools) {
      this._showToolGroup(lineTools);
      document.getElementById('color-line').value = (element.lineStyle && element.lineStyle.color) || '#333333';
      document.getElementById('sel-line-width').value = (element.lineStyle && element.lineStyle.width) || 3;
    } else if (lineTools) {
      this._hideToolGroup(lineTools);
    }

    if (element.type === 'image' && imageTools) {
      this._showToolGroup(imageTools);
      document.getElementById('sel-crop-shape').value = element.cropShape || 'none';
    } else if (imageTools) {
      this._hideToolGroup(imageTools);
    }

    const tableTools = document.getElementById('table-format-tools');
    if (element.type === 'table' && tableTools) {
      this._showToolGroup(tableTools);
      const td = element.tableData || {};
      const ts = element.tableStyle || {};
      document.getElementById('sel-table-rows').value = td.cells?.length || 3;
      document.getElementById('sel-table-cols').value = td.cells?.[0]?.length || 3;
      document.getElementById('sel-table-header').value = td.headerRow ? 'yes' : 'no';
      document.getElementById('color-table-header-bg').value = ts.headerBg || '#4472C4';
      document.getElementById('color-table-header-text').value = ts.headerColor || '#FFFFFF';
      document.getElementById('color-table-cell-bg').value = ts.cellBg || '#FFFFFF';
      document.getElementById('color-table-alt-bg').value = ts.altRowBg || '#f0f4ff';
      document.getElementById('color-table-cell-text').value = ts.cellColor || '#333333';
      document.getElementById('color-table-border').value = ts.borderColor || '#dee2e6';
      document.getElementById('sel-table-font-size').value = ts.fontSize || 14;
    } else if (tableTools) {
      this._hideToolGroup(tableTools);
    }

    this._renderAllRecentSwatches();
  }

  _openIconPicker() {
    const overlay = document.getElementById('icon-picker-overlay');
    const grid = document.getElementById('icon-grid');
    const searchInput = document.getElementById('icon-search');
    const colorInput = document.getElementById('icon-color');
    const closeBtn = document.getElementById('icon-picker-close');

    overlay.style.display = 'flex';
    searchInput.value = '';
    searchInput.focus();

    const renderGrid = (filter = '') => {
      grid.innerHTML = '';
      const color = colorInput.value;
      const lowerFilter = filter.toLowerCase();

      // Group by category
      const categories = {};
      for (const icon of iconLibrary) {
        if (lowerFilter && !icon.name.toLowerCase().includes(lowerFilter) && !icon.category.toLowerCase().includes(lowerFilter)) continue;
        if (!categories[icon.category]) categories[icon.category] = [];
        categories[icon.category].push(icon);
      }

      for (const [cat, icons] of Object.entries(categories)) {
        const catLabel = document.createElement('div');
        catLabel.className = 'icon-grid-category';
        catLabel.textContent = cat;
        grid.appendChild(catLabel);

        for (const icon of icons) {
          const item = document.createElement('div');
          item.className = 'icon-grid-item';
          item.innerHTML = buildIconSvg(icon, 28, color);
          const label = document.createElement('span');
          label.textContent = icon.name;
          item.appendChild(label);

          item.addEventListener('click', () => {
            this._insertIcon(icon, color);
            close();
          });

          grid.appendChild(item);
        }
      }
    };

    renderGrid();

    const onSearch = () => renderGrid(searchInput.value);
    const onColor = () => renderGrid(searchInput.value);

    searchInput.addEventListener('input', onSearch);
    colorInput.addEventListener('input', onColor);

    const close = () => {
      overlay.style.display = 'none';
      searchInput.removeEventListener('input', onSearch);
      colorInput.removeEventListener('input', onColor);
      document.removeEventListener('keydown', onEsc);
    };

    const onEsc = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onEsc);

    closeBtn.onclick = close;
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    }, { once: true });
  }

  _insertIcon(icon, color) {
    const dataUrl = buildIconDataUrl(icon, 256, color);
    const el = this.model.addElement(this.model.activeSlideIndex, {
      type: 'image',
      x: 4.5, y: 2.5, w: 1.5, h: 1.5,
      content: dataUrl,
      iconData: { name: icon.name, path: icon.path, stroke: !!icon.stroke, color },
    });
    this.renderer.addElementDom(el);
    this.editor.deselect();
    this.editor.select(el.id);
  }

  _bindTableFormatControls() {
    const selRows = document.getElementById('sel-table-rows');
    const selCols = document.getElementById('sel-table-cols');
    const selHeader = document.getElementById('sel-table-header');
    const colorHeaderBg = document.getElementById('color-table-header-bg');
    const colorHeaderText = document.getElementById('color-table-header-text');
    const colorCellBg = document.getElementById('color-table-cell-bg');
    const colorAltBg = document.getElementById('color-table-alt-bg');
    const colorCellText = document.getElementById('color-table-cell-text');
    const colorBorder = document.getElementById('color-table-border');
    const selFontSize = document.getElementById('sel-table-font-size');

    if (!selRows) return;

    const getTableEl = () => {
      const el = this._getSelectedElement();
      return (el && el.type === 'table') ? el : null;
    };

    const resizeTable = () => {
      const el = getTableEl();
      if (!el) return;
      const newRows = Math.max(1, Math.min(20, parseInt(selRows.value) || 3));
      const newCols = Math.max(1, Math.min(10, parseInt(selCols.value) || 3));
      const oldCells = el.tableData.cells;
      const cells = Array.from({ length: newRows }, (_, ri) =>
        Array.from({ length: newCols }, (_, ci) =>
          (oldCells[ri] && oldCells[ri][ci] !== undefined) ? oldCells[ri][ci] : ''
        )
      );
      this.model.updateElement(this.model.activeSlideIndex, el.id, {
        tableData: { ...el.tableData, cells },
      });
      this._rerenderKeepSelection();
    };

    selRows.addEventListener('change', resizeTable);
    selCols.addEventListener('change', resizeTable);

    selHeader.addEventListener('change', () => {
      const el = getTableEl();
      if (!el) return;
      this.model.updateElement(this.model.activeSlideIndex, el.id, {
        tableData: { ...el.tableData, headerRow: selHeader.value === 'yes' },
      });
      this._rerenderKeepSelection();
    });

    colorHeaderBg.addEventListener('input', () => {
      const el = getTableEl();
      if (!el) return;
      this.model.updateElement(this.model.activeSlideIndex, el.id, { tableStyle: { headerBg: colorHeaderBg.value } });
      this._rerenderKeepSelection();
    });

    colorHeaderText.addEventListener('input', () => {
      const el = getTableEl();
      if (!el) return;
      this.model.updateElement(this.model.activeSlideIndex, el.id, { tableStyle: { headerColor: colorHeaderText.value } });
      this._rerenderKeepSelection();
    });

    colorCellBg.addEventListener('input', () => {
      const el = getTableEl();
      if (!el) return;
      this.model.updateElement(this.model.activeSlideIndex, el.id, { tableStyle: { cellBg: colorCellBg.value } });
      this._rerenderKeepSelection();
    });

    colorAltBg.addEventListener('input', () => {
      const el = getTableEl();
      if (!el) return;
      this.model.updateElement(this.model.activeSlideIndex, el.id, { tableStyle: { altRowBg: colorAltBg.value } });
      this._rerenderKeepSelection();
    });

    colorCellText.addEventListener('input', () => {
      const el = getTableEl();
      if (!el) return;
      this.model.updateElement(this.model.activeSlideIndex, el.id, { tableStyle: { cellColor: colorCellText.value } });
      this._rerenderKeepSelection();
    });

    colorBorder.addEventListener('input', () => {
      const el = getTableEl();
      if (!el) return;
      this.model.updateElement(this.model.activeSlideIndex, el.id, { tableStyle: { borderColor: colorBorder.value } });
      this._rerenderKeepSelection();
    });

    selFontSize.addEventListener('change', () => {
      const el = getTableEl();
      if (!el) return;
      this.model.updateElement(this.model.activeSlideIndex, el.id, { tableStyle: { fontSize: parseInt(selFontSize.value) } });
      this._rerenderKeepSelection();
    });
  }

  enableTools() {
    document.querySelectorAll('#btn-add-text, #btn-shapes, #btn-add-image, #btn-add-code, #btn-add-table, #btn-add-slide, #btn-delete-slide, #btn-save, #btn-slide-bg, #btn-present').forEach(btn => {
      btn.disabled = false;
    });
  }
}

export { Toolbar };
