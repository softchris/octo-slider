// Slide Renderer — renders the model to DOM

import { highlight } from './syntax-highlight.js';

// Base canvas width in pixels — height derived from actual slide aspect ratio
const BASE_CANVAS_W = 960;
// These are updated dynamically based on the PPTX slide size
let CANVAS_W = 960;
let CANVAS_H = 540;
let SLIDE_W_INCHES = 10;
let SLIDE_H_INCHES = 5.625;

function updateDimensions(model) {
  SLIDE_W_INCHES = model.slideWidth || 10;
  SLIDE_H_INCHES = model.slideHeight || 5.625;
  // Keep canvas width at 960 and derive height from aspect ratio
  CANVAS_W = BASE_CANVAS_W;
  CANVAS_H = Math.round(BASE_CANVAS_W * (SLIDE_H_INCHES / SLIDE_W_INCHES));
}

function inchesToPx(inches, axis = 'x') {
  if (axis === 'x') return (inches / SLIDE_W_INCHES) * CANVAS_W;
  return (inches / SLIDE_H_INCHES) * CANVAS_H;
}

function pxToInches(px, axis = 'x') {
  if (axis === 'x') return (px / CANVAS_W) * SLIDE_W_INCHES;
  return (px / CANVAS_H) * SLIDE_H_INCHES;
}

function getCanvasDimensions() {
  return { w: CANVAS_W, h: CANVAS_H };
}

// Convert font points to canvas pixels based on actual slide DPI
// Canvas is CANVAS_W px wide representing SLIDE_W_INCHES inches
// So effective DPI = CANVAS_W / SLIDE_W_INCHES
// And 1pt at that DPI = DPI / 72 px
function fontPtToPx(pt) {
  const canvasDPI = CANVAS_W / SLIDE_W_INCHES;
  return pt * (canvasDPI / 72);
}

class SlideRenderer {
  constructor(model, canvasEl, thumbnailsEl) {
    this.model = model;
    this.canvas = canvasEl;
    this.thumbnails = thumbnailsEl;
    this.onElementClick = null;
    this.onCanvasClick = null;
    this._viewMode = 'slides'; // 'slides' or 'masters'
    this._initTabs();
  }

  _initTabs() {
    const tabSlides = document.getElementById('tab-slides');
    const tabMasters = document.getElementById('tab-masters');
    if (!tabSlides || !tabMasters) return;

    tabSlides.addEventListener('click', () => {
      this._viewMode = 'slides';
      tabSlides.classList.add('active');
      tabMasters.classList.remove('active');
      this.renderThumbnails();
      this.renderActiveSlide();
    });

    tabMasters.addEventListener('click', () => {
      this._viewMode = 'masters';
      tabMasters.classList.add('active');
      tabSlides.classList.remove('active');
      this.renderMasterThumbnails();
      if (this.model.masterLayouts.length > 0) {
        this._renderMasterOnCanvas(0);
      } else {
        this.canvas.innerHTML = '<div class="canvas-placeholder">No templates yet.<br>Right-click a slide → Save as Template</div>';
      }
    });
  }

  renderAll() {
    updateDimensions(this.model);
    this.canvas.style.width = CANVAS_W + 'px';
    this.canvas.style.height = CANVAS_H + 'px';

    if (this._viewMode === 'masters') {
      this.renderMasterThumbnails();
      if (this.model.masterLayouts.length > 0) {
        this._renderMasterOnCanvas(this._activeMasterIndex || 0);
      }
    } else {
      this.renderThumbnails();
      this.renderActiveSlide();
    }
  }

  renderThumbnails() {
    this.thumbnails.innerHTML = '';

    // Allow dropping on the container itself
    this.thumbnails.ondragover = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };

    for (let i = 0; i < this.model.slides.length; i++) {
      const thumb = document.createElement('div');
      thumb.className = 'slide-thumbnail' + (i === this.model.activeSlideIndex ? ' active' : '');
      thumb.dataset.index = i;
      thumb.draggable = true;

      const content = document.createElement('div');
      content.className = 'slide-thumbnail-content';

      const slide = this.model.slides[i];
      const bg = slide.background.color;
      if (bg && (bg.startsWith('linear-gradient') || bg.startsWith('radial-gradient'))) {
        content.style.background = bg;
      } else {
        content.style.background = bg || '#ffffff';
      }

      const thumbWidth = 256;
      const scale = thumbWidth / CANVAS_W;
      content.style.transform = `scale(${scale})`;
      content.style.width = CANVAS_W + 'px';
      content.style.height = CANVAS_H + 'px';

      for (const el of slide.elements) {
        const domEl = this._createElementDom(el, true);
        content.appendChild(domEl);
      }

      const num = document.createElement('div');
      num.className = 'thumb-number';
      num.textContent = i + 1;

      thumb.appendChild(content);
      thumb.appendChild(num);

      thumb.addEventListener('click', () => {
        this.model.setActiveSlide(i);
        this.renderAll();
      });

      // Right-click context menu for slides
      thumb.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this._showSlideContextMenu(e.clientX, e.clientY, i);
      });

      // Drag-and-drop reordering
      thumb.addEventListener('dragstart', (e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(i));
        thumb.classList.add('dragging');
      });
      thumb.addEventListener('dragend', () => {
        thumb.classList.remove('dragging');
        this.thumbnails.querySelectorAll('.slide-thumbnail').forEach(t => t.classList.remove('drag-over-top', 'drag-over-bottom'));
      });
      thumb.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const rect = thumb.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        thumb.classList.remove('drag-over-top', 'drag-over-bottom');
        if (e.clientY < midY) {
          thumb.classList.add('drag-over-top');
        } else {
          thumb.classList.add('drag-over-bottom');
        }
      });
      thumb.addEventListener('dragleave', () => {
        thumb.classList.remove('drag-over-top', 'drag-over-bottom');
      });
      thumb.addEventListener('drop', (e) => {
        e.preventDefault();
        thumb.classList.remove('drag-over-top', 'drag-over-bottom');
        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
        const rect = thumb.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        let toIndex = i;
        if (e.clientY >= midY && fromIndex < i) toIndex = i;
        else if (e.clientY >= midY && fromIndex > i) toIndex = i + 1;
        else if (e.clientY < midY && fromIndex < i) toIndex = i - 1;
        else if (e.clientY < midY && fromIndex > i) toIndex = i;
        if (toIndex < 0) toIndex = 0;
        if (toIndex >= this.model.slides.length) toIndex = this.model.slides.length - 1;
        this.model.moveSlide(fromIndex, toIndex);
        this.renderAll();
      });

      this.thumbnails.appendChild(thumb);
    }
  }

  _showSlideContextMenu(x, y, slideIndex) {
    this._hideSlideContextMenu();
    const menu = document.createElement('div');
    menu.className = 'slide-context-menu';

    const addBeforeBtn = document.createElement('button');
    addBeforeBtn.textContent = '⬆ Add Slide Before';
    addBeforeBtn.addEventListener('click', () => {
      const idx = this.model.insertSlide(slideIndex);
      this.model.setActiveSlide(idx);
      this.renderAll();
      this._hideSlideContextMenu();
    });
    menu.appendChild(addBeforeBtn);

    const addAfterBtn = document.createElement('button');
    addAfterBtn.textContent = '⬇ Add Slide After';
    addAfterBtn.addEventListener('click', () => {
      const idx = this.model.insertSlide(slideIndex + 1);
      this.model.setActiveSlide(idx);
      this.renderAll();
      this._hideSlideContextMenu();
    });
    menu.appendChild(addAfterBtn);

    const dupBtn = document.createElement('button');
    dupBtn.textContent = '📋 Duplicate Slide';
    dupBtn.addEventListener('click', () => {
      const newIdx = this.model.duplicateSlide(slideIndex);
      this.model.setActiveSlide(newIdx);
      this.renderAll();
      this._hideSlideContextMenu();
    });
    menu.appendChild(dupBtn);

    const delBtn = document.createElement('button');
    delBtn.textContent = '🗑 Delete Slide';
    delBtn.addEventListener('click', () => {
      if (this.model.slides.length <= 1) return;
      this.model.removeSlide(slideIndex);
      this.renderAll();
      this._hideSlideContextMenu();
    });
    menu.appendChild(delBtn);

    // Separator
    const sep1 = document.createElement('div');
    sep1.style.cssText = 'height:1px; background:#444; margin:4px 0;';
    menu.appendChild(sep1);

    // Save as Template
    const saveBtn = document.createElement('button');
    saveBtn.textContent = '📐 Save as Template';
    saveBtn.addEventListener('click', () => {
      this._hideSlideContextMenu();
      const name = prompt('Template name:', `Template ${this.model.masterLayouts.length + 1}`);
      if (!name) return;
      const slide = this.model.slides[slideIndex];
      this.model.addMasterLayout(name, slide);
    });
    menu.appendChild(saveBtn);

    // Apply Layout submenu
    if (this.model.masterLayouts.length > 0) {
      const sep2 = document.createElement('div');
      sep2.style.cssText = 'height:1px; background:#444; margin:4px 0;';
      menu.appendChild(sep2);

      const builtIns = this.model.masterLayouts.filter(l => l.builtIn);
      const userLayouts = this.model.masterLayouts.filter(l => !l.builtIn);

      // Built-in templates grouped by theme
      if (builtIns.length > 0) {
        const biHeader = document.createElement('div');
        biHeader.textContent = '▸ Built-in Templates';
        biHeader.style.cssText = 'padding:6px 16px; font-size:12px; color:#a5b4fc; cursor:pointer; font-weight:600;';
        const biContainer = document.createElement('div');
        biContainer.style.display = 'none';

        biHeader.addEventListener('click', (e) => {
          e.stopPropagation();
          const open = biContainer.style.display !== 'none';
          biContainer.style.display = open ? 'none' : 'block';
          biHeader.textContent = (open ? '▸' : '▾') + ' Built-in Templates';
          requestAnimationFrame(() => this._clampMenuPosition(menu));
        });

        // Group by theme
        const themes = {};
        for (const layout of builtIns) {
          const theme = layout.theme || 'Other';
          if (!themes[theme]) themes[theme] = [];
          themes[theme].push(layout);
        }

        for (const [themeName, layouts] of Object.entries(themes)) {
          const themeHeader = document.createElement('div');
          themeHeader.textContent = `  ▸ ${themeName}`;
          themeHeader.style.cssText = 'padding:5px 16px 5px 24px; font-size:12px; color:#cba6f7; cursor:pointer; font-weight:500;';
          const themeContainer = document.createElement('div');
          themeContainer.style.display = 'none';

          themeHeader.addEventListener('click', (e) => {
            e.stopPropagation();
            const open = themeContainer.style.display !== 'none';
            themeContainer.style.display = open ? 'none' : 'block';
            themeHeader.textContent = `  ${open ? '▸' : '▾'} ${themeName}`;
            requestAnimationFrame(() => this._clampMenuPosition(menu));
          });

          for (const layout of layouts) {
            const btn = document.createElement('button');
            btn.textContent = layout.slideType || layout.name;
            btn.style.paddingLeft = '44px';
            btn.style.fontSize = '12px';
            btn.addEventListener('click', () => {
              this.model.applyLayout(slideIndex, layout.id);
              this.model.setActiveSlide(slideIndex);
              this.renderAll();
              this._hideSlideContextMenu();
            });
            themeContainer.appendChild(btn);
          }

          biContainer.appendChild(themeHeader);
          biContainer.appendChild(themeContainer);
        }

        menu.appendChild(biHeader);
        menu.appendChild(biContainer);
      }

      // User layouts (shown directly)
      if (userLayouts.length > 0) {
        const userHeader = document.createElement('div');
        userHeader.textContent = 'My Templates';
        userHeader.style.cssText = 'padding:4px 16px; font-size:11px; color:#7f849c; text-transform:uppercase; letter-spacing:0.5px;';
        menu.appendChild(userHeader);

        for (const layout of userLayouts) {
          const btn = document.createElement('button');
          btn.textContent = `  📄 ${layout.name}`;
          btn.addEventListener('click', () => {
            this.model.applyLayout(slideIndex, layout.id);
            this.model.setActiveSlide(slideIndex);
            this.renderAll();
            this._hideSlideContextMenu();
          });
          menu.appendChild(btn);
        }
      }
    }

    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    document.body.appendChild(menu);
    this._slideContextMenu = menu;

    requestAnimationFrame(() => this._clampMenuPosition(menu));

    const closeHandler = (e) => {
      if (!menu.contains(e.target)) {
        this._hideSlideContextMenu();
        document.removeEventListener('click', closeHandler);
      }
    };
    setTimeout(() => document.addEventListener('click', closeHandler), 0);
  }

  _hideSlideContextMenu() {
    if (this._slideContextMenu) {
      this._slideContextMenu.remove();
      this._slideContextMenu = null;
    }
  }

  _clampMenuPosition(menu) {
    const rect = menu.getBoundingClientRect();
    const pad = 8;
    if (rect.right > window.innerWidth) {
      menu.style.left = Math.max(pad, window.innerWidth - rect.width - pad) + 'px';
    }
    if (rect.bottom > window.innerHeight) {
      menu.style.top = Math.max(pad, window.innerHeight - rect.height - pad) + 'px';
    }
  }

  // --- Template Views ---

  renderMasterThumbnails() {
    this.thumbnails.innerHTML = '';
    const layouts = this.model.masterLayouts;

    if (layouts.length === 0) {
      const msg = document.createElement('div');
      msg.className = 'master-empty-msg';
      msg.textContent = 'No templates yet. Right-click a slide → Save as Template';
      this.thumbnails.appendChild(msg);
      return;
    }

    for (let i = 0; i < layouts.length; i++) {
      const layout = layouts[i];
      const thumb = document.createElement('div');
      thumb.className = 'slide-thumbnail' + (i === (this._activeMasterIndex || 0) ? ' active' : '');
      thumb.dataset.index = i;

      const content = document.createElement('div');
      content.className = 'slide-thumbnail-content';

      const slide = layout.slide;
      const bg = slide.background.color;
      if (bg && (bg.startsWith('linear-gradient') || bg.startsWith('radial-gradient'))) {
        content.style.background = bg;
      } else {
        content.style.background = bg || '#ffffff';
      }

      const thumbWidth = 256;
      const scale = thumbWidth / CANVAS_W;
      content.style.transform = `scale(${scale})`;
      content.style.width = CANVAS_W + 'px';
      content.style.height = CANVAS_H + 'px';

      for (const el of slide.elements) {
        const domEl = this._createElementDom(el, true);
        content.appendChild(domEl);
      }

      const num = document.createElement('div');
      num.className = 'thumb-number';
      num.textContent = i + 1;

      const nameLabel = document.createElement('div');
      nameLabel.className = 'master-layout-name';
      nameLabel.textContent = layout.name;

      thumb.appendChild(content);
      thumb.appendChild(num);
      thumb.appendChild(nameLabel);

      thumb.addEventListener('click', () => {
        this._activeMasterIndex = i;
        this._renderMasterOnCanvas(i);
        this.renderMasterThumbnails();
      });

      thumb.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this._showMasterContextMenu(e.clientX, e.clientY, i);
      });

      this.thumbnails.appendChild(thumb);
    }
  }

  _renderMasterOnCanvas(index) {
    this._activeMasterIndex = index;
    const layout = this.model.masterLayouts[index];
    if (!layout) return;
    const slide = layout.slide;

    this.canvas.innerHTML = '';
    const bg = slide.background.color;
    if (bg && (bg.startsWith('linear-gradient') || bg.startsWith('radial-gradient'))) {
      this.canvas.style.backgroundColor = '';
      this.canvas.style.background = bg;
    } else {
      this.canvas.style.background = '';
      this.canvas.style.backgroundColor = bg || '#ffffff';
    }

    for (const el of slide.elements) {
      const domEl = this._createElementDom(el, false);
      this.canvas.appendChild(domEl);
    }
  }

  _showMasterContextMenu(x, y, layoutIndex) {
    this._hideSlideContextMenu();
    const menu = document.createElement('div');
    menu.className = 'slide-context-menu';
    const layout = this.model.masterLayouts[layoutIndex];

    // Apply to current slide
    const applyBtn = document.createElement('button');
    applyBtn.textContent = '📋 Apply to Current Slide';
    applyBtn.addEventListener('click', () => {
      this.model.applyLayout(this.model.activeSlideIndex, layout.id);
      this._hideSlideContextMenu();
    });
    menu.appendChild(applyBtn);

    if (!layout.builtIn) {
      const renameBtn = document.createElement('button');
      renameBtn.textContent = '✏️ Rename';
      renameBtn.addEventListener('click', () => {
        const name = prompt('New name:', layout.name);
        if (name) {
          this.model.renameMasterLayout(layout.id, name);
          this.renderMasterThumbnails();
        }
        this._hideSlideContextMenu();
      });
      menu.appendChild(renameBtn);

      const delBtn = document.createElement('button');
      delBtn.textContent = '🗑 Delete Template';
      delBtn.addEventListener('click', () => {
        this.model.removeMasterLayout(layout.id);
        if (this._activeMasterIndex >= this.model.masterLayouts.length) {
          this._activeMasterIndex = Math.max(0, this.model.masterLayouts.length - 1);
        }
        this.renderAll();
        this._hideSlideContextMenu();
      });
      menu.appendChild(delBtn);
    }

    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    document.body.appendChild(menu);
    this._slideContextMenu = menu;

    requestAnimationFrame(() => this._clampMenuPosition(menu));

    const closeHandler = (e) => {
      if (!menu.contains(e.target)) {
        this._hideSlideContextMenu();
        document.removeEventListener('click', closeHandler);
      }
    };
    setTimeout(() => document.addEventListener('click', closeHandler), 0);
  }

  renderActiveSlide() {
    const slide = this.model.getActiveSlide();
    if (!slide) {
      this.canvas.innerHTML = '<div class="canvas-placeholder">No slides</div>';
      return;
    }

    this.canvas.innerHTML = '';
    const bg = slide.background.color;
    if (bg && (bg.startsWith('linear-gradient') || bg.startsWith('radial-gradient'))) {
      this.canvas.style.backgroundColor = '';
      this.canvas.style.background = bg;
    } else {
      this.canvas.style.background = '';
      this.canvas.style.backgroundColor = bg || '#ffffff';
    }

    for (const el of slide.elements) {
      const domEl = this._createElementDom(el, false);
      this.canvas.appendChild(domEl);
    }
  }

  // --- Incremental DOM updates (no full rebuild) ---

  /** Create a mini slide preview DOM element for a given slide data object */
  createMiniSlide(slideData, thumbWidth = 200) {
    const content = document.createElement('div');
    content.className = 'slide-thumbnail-content';
    const bg = slideData.background.color;
    if (bg && (bg.startsWith('linear-gradient') || bg.startsWith('radial-gradient'))) {
      content.style.background = bg;
    } else {
      content.style.background = bg || '#ffffff';
    }
    const scale = thumbWidth / CANVAS_W;
    content.style.transform = `scale(${scale})`;
    content.style.transformOrigin = 'top left';
    content.style.width = CANVAS_W + 'px';
    content.style.height = CANVAS_H + 'px';
    for (const el of slideData.elements) {
      const domEl = this._createElementDom(el, true);
      content.appendChild(domEl);
    }
    return content;
  }

  addElementDom(element) {
    const domEl = this._createElementDom(element, false);
    this.canvas.appendChild(domEl);
    if (this._viewMode === 'slides') this.renderThumbnails();
  }

  removeElementDom(elementId) {
    const domEl = this.canvas.querySelector(`[data-element-id="${elementId}"]`);
    if (domEl) domEl.remove();
    if (this._viewMode === 'slides') this.renderThumbnails();
  }

  updateElementDom(element) {
    const old = this.canvas.querySelector(`[data-element-id="${element.id}"]`);
    if (!old) return;
    const wasSelected = old.classList.contains('selected');
    const newDom = this._createElementDom(element, false);
    old.replaceWith(newDom);
    if (wasSelected) {
      newDom.classList.add('selected');
    }
    // Auto-grow text elements if content overflows
    if (element.type === 'text') {
      this._autoGrowText(newDom, element);
    }
    if (this._viewMode === 'slides') this.renderThumbnails();
    return newDom;
  }

  _autoGrowText(domEl, el) {
    requestAnimationFrame(() => {
      const content = domEl.querySelector('.element-content');
      if (!content) return;
      const currentH = parseFloat(domEl.style.height);
      const needed = content.scrollHeight;
      if (needed > currentH) {
        domEl.style.height = needed + 'px';
        el.h = pxToInches(needed, 'y');
        if (this._viewMode === 'slides') this.renderThumbnails();
      }
    });
  }

  _setContentWithList(container, text, listType) {
    if (!listType || listType === 'none') {
      container.textContent = text || '';
      return;
    }
    // Split text into lines and render as list items
    const lines = (text || '').split('\n');
    container.innerHTML = '';
    container.style.whiteSpace = 'normal';
    const list = document.createElement(listType === 'numbered' ? 'ol' : 'ul');
    list.style.margin = '0';
    list.style.paddingLeft = '1.5em';
    list.style.listStyleType = listType === 'numbered' ? 'decimal' : 'disc';
    for (const line of lines) {
      const li = document.createElement('li');
      li.textContent = line;
      list.appendChild(li);
    }
    container.appendChild(list);
  }

  _createElementDom(el, isThumbnail) {
    const div = document.createElement('div');
    div.className = 'slide-element';
    div.dataset.elementId = el.id;

    const x = inchesToPx(el.x, 'x');
    const y = inchesToPx(el.y, 'y');
    const w = inchesToPx(el.w, 'x');
    const h = inchesToPx(el.h, 'y');

    div.style.left = x + 'px';
    div.style.top = y + 'px';
    div.style.width = w + 'px';
    div.style.height = h + 'px';

    if (el.type === 'text') {
      if (el.style.backgroundColor && el.style.backgroundColor !== 'transparent') {
        div.style.backgroundColor = el.style.backgroundColor;
      }
      const content = document.createElement('div');
      content.className = 'element-content';
      content.style.fontSize = fontPtToPx(el.style.fontSize) + 'px';
      content.style.fontFamily = el.style.fontFace;
      content.style.color = el.style.color;
      content.style.fontWeight = el.style.bold ? 'bold' : 'normal';
      content.style.fontStyle = el.style.italic ? 'italic' : 'normal';
      content.style.textAlign = el.style.align;
      content.style.lineHeight = String(el.style.lineSpacing || 1.2);
      content.style.whiteSpace = 'pre-wrap';
      content.style.wordWrap = 'break-word';
      content.style.overflow = 'hidden';
      this._setContentWithList(content, el.content, el.style.listType);
      div.appendChild(content);
    } else if (el.type === 'shape') {
      div.style.backgroundColor = el.shapeStyle.fill;
      if (el.shapeStyle.fill && (el.shapeStyle.fill.startsWith('linear-gradient') || el.shapeStyle.fill.startsWith('radial-gradient'))) {
        div.style.backgroundColor = '';
        div.style.background = el.shapeStyle.fill;
      }
      if (el.shapeStyle.borderWidth > 0) {
        div.style.border = `${el.shapeStyle.borderWidth}px solid ${el.shapeStyle.borderColor}`;
      }
      // Apply shape clip-path / border-radius
      const shapeClips = {
        'ellipse': () => { div.style.borderRadius = '50%'; },
        'roundRect': () => { div.style.borderRadius = '12px'; },
        'diamond': () => { div.style.clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'; },
        'triangle': () => { div.style.clipPath = 'polygon(50% 0%, 100% 100%, 0% 100%)'; },
        'pentagon': () => { div.style.clipPath = 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'; },
        'hexagon': () => { div.style.clipPath = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'; },
        'star': () => { div.style.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'; },
        'arrow-right': () => { div.style.clipPath = 'polygon(0% 20%, 65% 20%, 65% 0%, 100% 50%, 65% 100%, 65% 80%, 0% 80%)'; },
        'arrow-left': () => { div.style.clipPath = 'polygon(35% 0%, 35% 20%, 100% 20%, 100% 80%, 35% 80%, 35% 100%, 0% 50%)'; },
        'trapezoid': () => { div.style.clipPath = 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'; },
        'parallelogram': () => { div.style.clipPath = 'polygon(20% 0%, 100% 0%, 80% 100%, 0% 100%)'; },
        'cross': () => { div.style.clipPath = 'polygon(35% 0%, 65% 0%, 65% 35%, 100% 35%, 100% 65%, 65% 65%, 65% 100%, 35% 100%, 35% 65%, 0% 65%, 0% 35%, 35% 35%)'; },
      };
      if (shapeClips[el.shape]) shapeClips[el.shape]();
      // Shape can contain text
      if (el.content) {
        const content = document.createElement('div');
        content.className = 'element-content';
        content.style.fontSize = fontPtToPx(el.style.fontSize) + 'px';
        content.style.fontFamily = el.style.fontFace;
        content.style.color = el.style.color;
        content.style.fontWeight = el.style.bold ? 'bold' : 'normal';
        content.style.fontStyle = el.style.italic ? 'italic' : 'normal';
        content.style.textAlign = el.style.align;
        content.style.display = 'flex';
        content.style.alignItems = 'center';
        content.style.justifyContent = el.style.align === 'center' ? 'center' : (el.style.align === 'right' ? 'flex-end' : 'flex-start');
        content.style.padding = '8px';
        content.style.lineHeight = String(el.style.lineSpacing || 1.2);
        content.style.whiteSpace = 'pre-wrap';
        content.style.wordWrap = 'break-word';
        this._setContentWithList(content, el.content, el.style.listType);
        div.appendChild(content);
      }
    } else if (el.type === 'line') {
      // Line element: rendered as SVG inside the positioned div
      div.style.overflow = 'visible';
      div.style.background = 'none';
      // Compute bounding box from endpoints
      const x1px = inchesToPx(el.x1 || 0, 'x');
      const y1px = inchesToPx(el.y1 || 0, 'y');
      const x2px = inchesToPx(el.x2 || 4, 'x');
      const y2px = inchesToPx(el.y2 || 0, 'y');
      const minXpx = Math.min(x1px, x2px);
      const minYpx = Math.min(y1px, y2px);
      const maxXpx = Math.max(x1px, x2px);
      const maxYpx = Math.max(y1px, y2px);
      const svgW = Math.max(maxXpx - minXpx, 2);
      const svgH = Math.max(maxYpx - minYpx, 2);
      div.style.width = svgW + 'px';
      div.style.height = svgH + 'px';
      const ls = el.lineStyle || {};
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', svgW);
      svg.setAttribute('height', svgH);
      svg.style.position = 'absolute';
      svg.style.left = '0';
      svg.style.top = '0';
      svg.style.overflow = 'visible';
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1px - minXpx);
      line.setAttribute('y1', y1px - minYpx);
      line.setAttribute('x2', x2px - minXpx);
      line.setAttribute('y2', y2px - minYpx);
      line.setAttribute('stroke', ls.color || '#333333');
      line.setAttribute('stroke-width', ls.width || 3);
      line.setAttribute('stroke-linecap', 'round');
      svg.appendChild(line);
      div.appendChild(svg);
    } else if (el.type === 'code') {
      div.style.backgroundColor = el.style.backgroundColor || '#1e1e1e';
      div.style.borderRadius = '6px';
      div.style.overflow = 'hidden';
      const content = document.createElement('div');
      content.className = 'element-content code-content';
      content.innerHTML = highlight(el.content || '', el.language || 'javascript');
      content.style.fontSize = fontPtToPx(el.style.fontSize) + 'px';
      content.style.fontFamily = el.style.fontFace || 'Consolas';
      content.style.color = el.style.color || '#d4d4d4';
      content.style.lineHeight = '1.4';
      content.style.whiteSpace = 'pre';
      content.style.overflow = 'auto';
      content.style.padding = '12px';
      content.style.tabSize = '4';
      div.appendChild(content);
    } else if (el.type === 'image') {
      if (el.content) {
        const img = document.createElement('img');
        img.src = el.content;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.draggable = false;
        div.appendChild(img);
      } else {
        div.style.backgroundColor = '#e0e0e0';
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.justifyContent = 'center';
        const placeholder = document.createElement('span');
        placeholder.textContent = '🖼️';
        placeholder.style.fontSize = '32px';
        div.appendChild(placeholder);
      }
      // Apply crop shape
      if (el.cropShape && el.cropShape !== 'none') {
        const cropClips = {
          'ellipse': () => { div.style.borderRadius = '50%'; div.style.overflow = 'hidden'; },
          'roundRect': () => { div.style.borderRadius = '12px'; div.style.overflow = 'hidden'; },
          'diamond': () => { div.style.clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'; },
          'triangle': () => { div.style.clipPath = 'polygon(50% 0%, 100% 100%, 0% 100%)'; },
          'pentagon': () => { div.style.clipPath = 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'; },
          'hexagon': () => { div.style.clipPath = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'; },
          'star': () => { div.style.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'; },
          'cross': () => { div.style.clipPath = 'polygon(35% 0%, 65% 0%, 65% 35%, 100% 35%, 100% 65%, 65% 65%, 65% 100%, 35% 100%, 35% 65%, 0% 65%, 0% 35%, 35% 35%)'; },
          'arrow-right': () => { div.style.clipPath = 'polygon(0% 20%, 65% 20%, 65% 0%, 100% 50%, 65% 100%, 65% 80%, 0% 80%)'; },
        };
        if (cropClips[el.cropShape]) cropClips[el.cropShape]();
      }
    } else if (el.type === 'table' && el.tableData) {
      const ts = el.tableStyle || {};
      const cells = el.tableData.cells || [];
      const wrapper = document.createElement('div');
      wrapper.className = 'element-table';
      const table = document.createElement('table');
      const fontSize = fontPtToPx(ts.fontSize || 14) + 'px';
      for (let ri = 0; ri < cells.length; ri++) {
        const tr = document.createElement('tr');
        const isHeader = ri === 0 && el.tableData.headerRow;
        for (let ci = 0; ci < (cells[ri] || []).length; ci++) {
          const td = document.createElement('td');
          td.textContent = cells[ri][ci] || '';
          td.style.fontSize = fontSize;
          td.style.fontFamily = ts.fontFace || 'Arial';
          td.style.border = `${ts.borderWidth || 1}px solid ${ts.borderColor || '#dee2e6'}`;
          if (isHeader) {
            td.style.backgroundColor = ts.headerBg || '#4472C4';
            td.style.color = ts.headerColor || '#FFFFFF';
            td.style.fontWeight = 'bold';
          } else {
            td.style.backgroundColor = (ri % 2 === 0 ? ts.altRowBg : ts.cellBg) || '#FFFFFF';
            td.style.color = ts.cellColor || '#333333';
          }
          td.dataset.row = ri;
          td.dataset.col = ci;
          tr.appendChild(td);
        }
        table.appendChild(tr);
      }
      wrapper.appendChild(table);
      div.appendChild(wrapper);
    }

    // Apply shadow if the element has one (shapes and images)
    if (el.shadow && el.shadow.type !== 'none' && (el.type === 'shape' || el.type === 'image')) {
      const s = el.shadow;
      const hexToRgba = (hex, alpha) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${alpha})`;
      };
      const color = hexToRgba(s.color || '#000000', s.opacity ?? 0.4);
      const blur = s.blur || 8;

      const shadowPresets = {
        'drop-bottom-right': `4px 4px ${blur}px ${color}`,
        'drop-bottom-left':  `-4px 4px ${blur}px ${color}`,
        'drop-top-right':    `4px -4px ${blur}px ${color}`,
        'drop-top-left':     `-4px -4px ${blur}px ${color}`,
        'drop-right':        `6px 0px ${blur}px ${color}`,
        'drop-left':         `-6px 0px ${blur}px ${color}`,
        'drop-below':        `0px 6px ${blur}px ${color}`,
        'drop-above':        `0px -6px ${blur}px ${color}`,
        'soft-glow':         `0px 0px ${blur * 2.5}px ${hexToRgba(s.color || '#000000', (s.opacity ?? 0.4) * 0.7)}`,
        'hard-edge':         `4px 4px 0px ${color}`,
        'inner':             `inset 4px 4px ${blur}px ${color}`,
        'deep':              `4px 4px ${blur}px ${color}, 8px 8px ${blur * 2}px ${hexToRgba(s.color || '#000000', (s.opacity ?? 0.4) * 0.5)}`,
        'distant':           `10px 10px ${blur * 3}px ${hexToRgba(s.color || '#000000', (s.opacity ?? 0.4) * 0.5)}`,
        'close':             `2px 2px ${Math.max(2, blur * 0.3)}px ${color}`,
        'wide-spread':       `0px 0px ${blur}px 6px ${color}`,
        'distorted':         `6px 2px ${blur}px ${color}, -2px 6px ${blur * 1.5}px ${hexToRgba(s.color || '#000000', (s.opacity ?? 0.4) * 0.5)}`,
      };

      // Legacy fallback for old types
      if (s.type === 'outer') {
        div.style.boxShadow = shadowPresets['drop-bottom-right'];
      } else if (s.type === 'perspective') {
        div.style.boxShadow = shadowPresets['distant'];
      } else if (shadowPresets[s.type]) {
        div.style.boxShadow = shadowPresets[s.type];
      }
    }

    return div;
  }
}

export { SlideRenderer, inchesToPx, pxToInches, getCanvasDimensions };
