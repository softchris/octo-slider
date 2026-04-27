// Slide data model — internal representation of the presentation
import { builtInLayouts } from './built-in-layouts.js';

let _nextElementId = 1;

function generateId() {
  return `el-${_nextElementId++}`;
}

function createDefaultElement(type, overrides = {}) {
  const base = {
    id: generateId(),
    type,
    x: 3.0,
    y: 2.0,
    w: 4.0,
    h: 1.0,
    content: '',
    rotation: 0,
    style: {
      fontSize: 24,
      fontFace: 'Arial',
      color: '#333333',
      backgroundColor: 'transparent',
      bold: false,
      italic: false,
      align: 'left',
      listType: 'none',
      lineSpacing: 1.2,
    },
    shape: null,
    shapeStyle: {
      fill: '#4472C4',
      borderColor: '#2F5496',
      borderWidth: 1,
    },
    shadow: {
      type: 'none',
      color: '#000000',
      opacity: 0.4,
      blur: 8,
      offsetX: 4,
      offsetY: 4,
    },
    groupId: null,
  };

  if (type === 'text') {
    base.content = 'Text';
    base.w = 4.0;
    base.h = 1.0;
  } else if (type === 'shape') {
    base.shape = 'rect';
    base.w = 3.0;
    base.h = 2.0;
    base.content = '';
  } else if (type === 'line') {
    base.x = 2.0;
    base.y = 2.5;
    base.w = 4.0;
    base.h = 0;
    base.x1 = 0;   // relative to x,y (left of bounding box)
    base.y1 = 0;
    base.x2 = 4.0;  // in inches, relative offset from x,y
    base.y2 = 0;
    base.lineStyle = {
      color: '#333333',
      width: 3,
    };
  } else if (type === 'image') {
    base.w = 4.0;
    base.h = 3.0;
    base.content = ''; // data URL
  } else if (type === 'code') {
    base.content = '// Your code here';
    base.w = 5.0;
    base.h = 2.5;
    base.style.fontSize = 16;
    base.style.fontFace = 'Consolas';
    base.style.color = '#d4d4d4';
    base.style.backgroundColor = '#1e1e1e';
    base.style.align = 'left';
    base.language = 'javascript';
  } else if (type === 'table') {
    const rows = overrides.tableData?.rows || 3;
    const cols = overrides.tableData?.cols || 3;
    base.w = Math.min(cols * 2.0, 10);
    base.h = Math.min(rows * 0.55 + 0.2, 5);
    base.content = '';
    base.tableData = {
      cells: Array.from({ length: rows }, (_, ri) =>
        Array.from({ length: cols }, (_, ci) => ri === 0 ? `Header ${ci + 1}` : '')
      ),
      headerRow: true,
    };
    base.tableStyle = {
      borderColor: '#dee2e6',
      borderWidth: 1,
      headerBg: '#4472C4',
      headerColor: '#FFFFFF',
      cellBg: '#FFFFFF',
      cellColor: '#333333',
      altRowBg: '#f0f4ff',
      fontSize: 14,
      fontFace: 'Arial',
    };
  }

  return { ...base, ...overrides, style: { ...base.style, ...(overrides.style || {}) }, shapeStyle: { ...base.shapeStyle, ...(overrides.shapeStyle || {}) }, shadow: { ...base.shadow, ...(overrides.shadow || {}) }, ...(base.tableStyle ? { tableStyle: { ...base.tableStyle, ...(overrides.tableStyle || {}) } } : {}) };
}

function createDefaultSlide() {
  return {
    background: { color: '#FFFFFF', image: null },
    elements: [],
    notes: '',
    layoutXml: null,
  };
}

class SlideModel {
  constructor() {
    this.slides = [];
    this.activeSlideIndex = 0;
    this.masterLayouts = [];
    this._listeners = [];
    this.slideWidth = 10;      // inches, updated by parser
    this.slideHeight = 5.625;  // inches, updated by parser
    this._undoStack = [];
    this._maxUndo = 50;
    this._undoInProgress = false;
    this._batchDepth = 0;
    this._loadMasterLayouts();
  }

  onChange(fn) {
    this._listeners.push(fn);
  }

  _notify(event) {
    for (const fn of this._listeners) fn(event);
  }

  _pushUndo() {
    if (this._undoInProgress || this._batchDepth > 0) return;
    this._undoStack.push({
      slides: JSON.parse(JSON.stringify(this.slides)),
      activeSlideIndex: this.activeSlideIndex,
    });
    if (this._undoStack.length > this._maxUndo) {
      this._undoStack.shift();
    }
  }

  // Call before a continuous operation (drag/resize) to save one snapshot
  beginUndoBatch() {
    if (this._batchDepth === 0) {
      this._pushUndoForBatch();
    }
    this._batchDepth++;
  }

  endUndoBatch() {
    if (this._batchDepth > 0) this._batchDepth--;
  }

  _pushUndoForBatch() {
    if (this._undoInProgress) return;
    this._undoStack.push({
      slides: JSON.parse(JSON.stringify(this.slides)),
      activeSlideIndex: this.activeSlideIndex,
    });
    if (this._undoStack.length > this._maxUndo) {
      this._undoStack.shift();
    }
  }

  undo() {
    if (this._undoStack.length === 0) return false;
    this._undoInProgress = true;
    const snapshot = this._undoStack.pop();
    this.slides = snapshot.slides;
    this.activeSlideIndex = snapshot.activeSlideIndex;
    // Ensure element ID counter stays ahead of restored IDs
    for (const slide of this.slides) {
      for (const el of slide.elements) {
        const num = parseInt(el.id.replace('el-', ''), 10);
        if (!isNaN(num) && num >= _nextElementId) {
          _nextElementId = num + 1;
        }
      }
    }
    this._undoInProgress = false;
    this._notify({ type: 'undo' });
    return true;
  }

  addSlide(slide = null) {
    this._pushUndo();
    const s = slide || createDefaultSlide();
    this.slides.push(s);
    this._notify({ type: 'slide-added', index: this.slides.length - 1 });
    return this.slides.length - 1;
  }

  insertSlide(index, slide = null) {
    this._pushUndo();
    const s = slide || createDefaultSlide();
    this.slides.splice(index, 0, s);
    this._notify({ type: 'slide-added', index });
    return index;
  }

  removeSlide(index) {
    if (this.slides.length <= 1) return false;
    this._pushUndo();
    this.slides.splice(index, 1);
    if (this.activeSlideIndex >= this.slides.length) {
      this.activeSlideIndex = this.slides.length - 1;
    }
    this._notify({ type: 'slide-removed', index });
    return true;
  }

  duplicateSlide(index) {
    const source = this.slides[index];
    if (!source) return -1;
    this._pushUndo();
    const clone = JSON.parse(JSON.stringify(source));
    // Assign new unique IDs to all elements
    for (const el of clone.elements) {
      el.id = generateId();
    }
    this.slides.splice(index + 1, 0, clone);
    this._notify({ type: 'slide-added', index: index + 1 });
    return index + 1;
  }

  moveSlide(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;
    if (fromIndex < 0 || fromIndex >= this.slides.length) return;
    if (toIndex < 0 || toIndex >= this.slides.length) return;
    this._pushUndo();
    const [slide] = this.slides.splice(fromIndex, 1);
    this.slides.splice(toIndex, 0, slide);
    // Update activeSlideIndex to follow the moved slide
    if (this.activeSlideIndex === fromIndex) {
      this.activeSlideIndex = toIndex;
    } else if (fromIndex < this.activeSlideIndex && toIndex >= this.activeSlideIndex) {
      this.activeSlideIndex--;
    } else if (fromIndex > this.activeSlideIndex && toIndex <= this.activeSlideIndex) {
      this.activeSlideIndex++;
    }
    this._notify({ type: 'slide-moved', fromIndex, toIndex });
  }

  // --- Templates ---

  addMasterLayout(name, slide) {
    const clone = JSON.parse(JSON.stringify(slide));
    for (const el of clone.elements) {
      el.id = generateId();
    }
    const layout = { id: 'layout-' + Date.now(), name, slide: clone };
    this.masterLayouts.push(layout);
    this._saveMasterLayouts();
    this._notify({ type: 'layout-added', layout });
    return layout;
  }

  removeMasterLayout(layoutId) {
    const idx = this.masterLayouts.findIndex(l => l.id === layoutId);
    if (idx === -1 || this.masterLayouts[idx].builtIn) return false;
    this.masterLayouts.splice(idx, 1);
    this._saveMasterLayouts();
    this._notify({ type: 'layout-removed', layoutId });
    return true;
  }

  renameMasterLayout(layoutId, newName) {
    const layout = this.masterLayouts.find(l => l.id === layoutId);
    if (!layout || layout.builtIn) return false;
    layout.name = newName;
    this._saveMasterLayouts();
    this._notify({ type: 'layout-renamed', layoutId, newName });
    return true;
  }

  applyLayout(slideIndex, layoutId) {
    const slide = this.slides[slideIndex];
    const layout = this.masterLayouts.find(l => l.id === layoutId);
    if (!slide || !layout) return false;
    this._pushUndo();
    const clone = JSON.parse(JSON.stringify(layout.slide));
    for (const el of clone.elements) {
      el.id = generateId();
    }
    slide.background = clone.background;
    slide.elements = clone.elements;
    this._notify({ type: 'layout-applied', slideIndex, layoutId });
    return true;
  }

  _saveMasterLayouts() {
    try {
      const userLayouts = this.masterLayouts.filter(l => !l.builtIn);
      localStorage.setItem('slideHelper_masterLayouts', JSON.stringify(userLayouts));
    } catch (e) {
      console.warn('Failed to save master layouts:', e);
    }
  }

  _loadMasterLayouts() {
    let userLayouts = [];
    try {
      const data = localStorage.getItem('slideHelper_masterLayouts');
      if (data) {
        userLayouts = JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to load master layouts:', e);
    }
    // Built-in layouts first, then user layouts
    this.masterLayouts = [
      ...builtInLayouts.map(l => JSON.parse(JSON.stringify(l))),
      ...userLayouts,
    ];
  }



  getSlide(index) {
    return this.slides[index] || null;
  }

  getActiveSlide() {
    return this.slides[this.activeSlideIndex] || null;
  }

  setActiveSlide(index) {
    if (index >= 0 && index < this.slides.length) {
      this.activeSlideIndex = index;
      this._notify({ type: 'active-changed', index });
    }
  }

  addElement(slideIndex, element) {
    const slide = this.slides[slideIndex];
    if (!slide) return null;
    this._pushUndo();
    const el = createDefaultElement(element.type, element);
    slide.elements.push(el);
    this._notify({ type: 'element-added', slideIndex, element: el });
    return el;
  }

  removeElement(slideIndex, elementId) {
    const slide = this.slides[slideIndex];
    if (!slide) return false;
    const idx = slide.elements.findIndex(e => e.id === elementId);
    if (idx === -1) return false;
    this._pushUndo();
    slide.elements.splice(idx, 1);
    this._notify({ type: 'element-removed', slideIndex, elementId });
    return true;
  }

  updateElement(slideIndex, elementId, props) {
    const slide = this.slides[slideIndex];
    if (!slide) return null;
    const el = slide.elements.find(e => e.id === elementId);
    if (!el) return null;
    this._pushUndo();

    for (const [key, value] of Object.entries(props)) {
      if (key === 'style') {
        Object.assign(el.style, value);
      } else if (key === 'shapeStyle') {
        Object.assign(el.shapeStyle, value);
      } else if (key === 'shadow') {
        Object.assign(el.shadow, value);
      } else if (key === 'lineStyle') {
        if (!el.lineStyle) el.lineStyle = {};
        Object.assign(el.lineStyle, value);
      } else if (key === 'tableStyle') {
        if (!el.tableStyle) el.tableStyle = {};
        Object.assign(el.tableStyle, value);
      } else if (key === 'tableData') {
        el.tableData = value;
      } else {
        el[key] = value;
      }
    }
    this._notify({ type: 'element-updated', slideIndex, elementId, props });
    return el;
  }

  getElement(slideIndex, elementId) {
    const slide = this.slides[slideIndex];
    if (!slide) return null;
    return slide.elements.find(e => e.id === elementId) || null;
  }

  clear() {
    this._pushUndo();
    this.slides = [];
    this.activeSlideIndex = 0;
    _nextElementId = 1;
    this._notify({ type: 'cleared' });
  }

  get slideCount() {
    return this.slides.length;
  }
}

export { SlideModel, createDefaultElement, createDefaultSlide };
