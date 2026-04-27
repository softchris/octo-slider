// Editor — handles selection, drag/drop, resize, text editing, multi-select & alignment

import { inchesToPx, pxToInches, getCanvasDimensions } from './slide-renderer.js';

class Editor {
  constructor(model, renderer) {
    this.model = model;
    this.renderer = renderer;
    this.selectedElementId = null;
    this.selectedElementIds = []; // multi-select support
    this.isEditing = false;
    this._isSubSelection = false;
    this._subSelectionGroupId = null;
    this._pendingSubSelection = null;
    this._dragState = null;
    this._resizeState = null;
    this._lineEndpointState = null;
    this._scale = 1;
    this._cleanupFns = [];
    this._clipboard = []; // for copy/paste

    this.onSelectionChange = null; // callback(elementId, element)
    this.onTextEditStart = null;
    this.onTextEditEnd = null;

    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);

    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('mouseup', this._onMouseUp);

    // Keyboard handler for delete
    document.addEventListener('keydown', (e) => {
      if (this.isEditing) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (this.selectedElementIds.length > 0) {
          e.preventDefault();
          for (const id of [...this.selectedElementIds]) {
            this.model.removeElement(this.model.activeSlideIndex, id);
            this.renderer.removeElementDom(id);
          }
          this.deselect();
        }
      }
      if (e.key === 'Escape') {
        if (this.isEditing) {
          this._exitTextEdit();
        } else if (this.selectedElementIds.length > 0) {
          this.deselect();
        }
      }
      // Copy
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        if (this.selectedElementIds.length > 0) {
          e.preventDefault();
          this._clipboard = this.selectedElementIds.map(id =>
            this.model.getElement(this.model.activeSlideIndex, id)
          ).filter(Boolean).map(el => JSON.parse(JSON.stringify(el)));
          this._pasteCount = 0;
        }
      }
      // Paste
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        if (this._clipboard && this._clipboard.length > 0) {
          e.preventDefault();
          const pasteOffset = (this._pasteCount || 0) + 1;
          this._pasteCount = pasteOffset;
          const offsetInches = 0.3 * pasteOffset;
          const newIds = [];
          // Remap groupIds so pasted elements form new groups
          const groupIdMap = {};
          for (const orig of this._clipboard) {
            const { id: _discardId, groupId: origGroupId, ...props } = orig;
            let newGroupId = null;
            if (origGroupId) {
              if (!groupIdMap[origGroupId]) groupIdMap[origGroupId] = 'grp-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
              newGroupId = groupIdMap[origGroupId];
            }
            const clone = this.model.addElement(this.model.activeSlideIndex, {
              ...props,
              x: orig.x + offsetInches,
              y: orig.y + offsetInches,
              style: { ...orig.style },
              shapeStyle: { ...orig.shapeStyle },
              shadow: { ...orig.shadow },
              groupId: newGroupId,
            });
            newIds.push(clone.id);
          }
          this.deselect();
          // Add pasted elements incrementally
          for (const id of newIds) {
            const el = this.model.getElement(this.model.activeSlideIndex, id);
            if (el) this.renderer.addElementDom(el);
          }
          // Select all pasted elements
          for (const id of newIds) {
            if (newIds.length === 1) {
              this.select(id);
            } else {
              this._addToSelection(id);
            }
          }
        }
      }
    });

    // Context menu
    this._contextMenu = null;
    this._buildContextMenu();
    document.addEventListener('click', () => this._hideContextMenu());
  }

  init() {
    const canvas = this.renderer.canvas;

    canvas.addEventListener('mousedown', (e) => {
      // Ignore right-clicks — context menu handles those
      if (e.button === 2) return;

      const elDiv = e.target.closest('.slide-element');

      if (elDiv && elDiv.dataset.elementId) {
        e.stopPropagation();
        const elementId = elDiv.dataset.elementId;

        if (this.isEditing && this.selectedElementId === elementId) return;
        // If in table edit mode and clicking inside the table, let cell handler deal with it
        if (this._tableEditId === elementId && e.target.closest('td')) return;
        if (this.isEditing) this._exitTextEdit();

        if (e.shiftKey) {
          // Shift+click: add to selection
          if (!this.selectedElementIds.includes(elementId)) {
            this._addToSelection(elementId);
          }
        } else if (e.ctrlKey || e.metaKey) {
          // Ctrl+click: remove from selection
          if (this.selectedElementIds.includes(elementId)) {
            this._removeFromSelection(elementId);
          }
        } else if (this.selectedElementIds.includes(elementId) && this.selectedElementIds.length > 1) {
          // Clicked an already-selected element in a multi-selection
          // Defer sub-selection to mouseup (so dragging keeps the group intact)
          this._pendingSubSelection = elementId;
          // Keep group intact for drag
        } else {
          // Plain click: replace selection with this element
          this.select(elementId);
        }

        // Start drag — capture positions for all selected elements
        if (!e.target.classList.contains('resize-handle') && !this.isEditing) {
          e.preventDefault();
          const multiDragItems = [];
          for (const id of this.selectedElementIds) {
            const dom = this._getDomElement(id);
            if (dom) {
              multiDragItems.push({ elementId: id, origLeft: parseFloat(dom.style.left), origTop: parseFloat(dom.style.top) });
            }
          }
          this._dragState = {
            elementId,
            startX: e.clientX,
            startY: e.clientY,
            origLeft: parseFloat(elDiv.style.left),
            origTop: parseFloat(elDiv.style.top),
            multiDragItems,
          };
          this.model.beginUndoBatch();
        }
      } else {
        // Clicked on empty canvas area — clear all selections
        if (this.isEditing) this._exitTextEdit();
        this.deselect();
      }
    });

    // Right-click context menu
    canvas.addEventListener('contextmenu', (e) => {
      if (this.selectedElementIds.length >= 1) {
        e.preventDefault();
        this._updateContextMenuItems();
        this._showContextMenu(e.clientX, e.clientY);
      }
    });

    // Double-click for text editing
    canvas.addEventListener('dblclick', (e) => {
      const elDiv = e.target.closest('.slide-element');
      if (!elDiv || !elDiv.dataset.elementId) return;

      const elementId = elDiv.dataset.elementId;
      const el = this.model.getElement(this.model.activeSlideIndex, elementId);
      if (!el) return;
      if (el.type === 'image' || el.type === 'line') return;

      if (el.type === 'table') {
        this._enterTableEdit(elDiv, elementId, e);
        return;
      }

      this.select(elementId);
      this._enterTextEdit(elDiv, elementId);
    });
  }

  setScale(scale) {
    this._scale = scale;
  }

  select(elementId) {
    if (this.selectedElementId === elementId && this.selectedElementIds.length === 1 && !this._isSubSelection) {
      const domEl = this._getDomElement(elementId);
      if (domEl && !domEl.classList.contains('selected')) {
        domEl.classList.add('selected');
        this._addResizeHandles(domEl);
      }
      return;
    }

    // If element belongs to a group, select the whole group
    const members = this._getGroupMembers(elementId);
    if (members.length > 1) {
      this._selectGroup(elementId);
      return;
    }

    this.deselect();
    this.selectedElementId = elementId;
    this.selectedElementIds = [elementId];

    const domEl = this._getDomElement(elementId);
    if (!domEl) return;

    domEl.classList.add('selected');
    this._addResizeHandles(domEl);

    const el = this.model.getElement(this.model.activeSlideIndex, elementId);
    if (this.onSelectionChange) {
      try {
        this.onSelectionChange(elementId, el);
      } catch (err) {
        console.error('[Editor] onSelectionChange error:', err);
      }
    }
  }

  _addToSelection(elementId) {
    if (this.selectedElementIds.includes(elementId)) return;
    this.selectedElementIds.push(elementId);
    const domEl = this._getDomElement(elementId);
    if (domEl) {
      domEl.classList.add('selected');
      this._addResizeHandles(domEl);
    }
    this.selectedElementId = elementId;
    if (this.selectedElementIds.length > 1) {
      if (this.onSelectionChange) this.onSelectionChange('__multi__', null);
    } else {
      const el = this.model.getElement(this.model.activeSlideIndex, elementId);
      if (this.onSelectionChange) this.onSelectionChange(elementId, el);
    }
  }

  _removeFromSelection(elementId) {
    const idx = this.selectedElementIds.indexOf(elementId);
    if (idx < 0) return;
    const domEl = this._getDomElement(elementId);
    if (domEl) {
      domEl.classList.remove('selected');
      this._removeResizeHandles(domEl);
    }
    this.selectedElementIds.splice(idx, 1);

    if (this.selectedElementIds.length === 1) {
      this.selectedElementId = this.selectedElementIds[0];
      const el = this.model.getElement(this.model.activeSlideIndex, this.selectedElementId);
      if (this.onSelectionChange) this.onSelectionChange(this.selectedElementId, el);
    } else if (this.selectedElementIds.length === 0) {
      this.selectedElementId = null;
      if (this.onSelectionChange) this.onSelectionChange(null, null);
    } else {
      this.selectedElementId = this.selectedElementIds[this.selectedElementIds.length - 1];
      if (this.onSelectionChange) this.onSelectionChange('__multi__', null);
    }
  }

  deselect() {
    this._exitSubSelection();
    for (const id of this.selectedElementIds) {
      const domEl = this._getDomElement(id);
      if (domEl) {
        domEl.classList.remove('selected');
        this._removeResizeHandles(domEl);
      }
    }
    this.selectedElementId = null;
    this.selectedElementIds = [];
    if (this.onSelectionChange) this.onSelectionChange(null, null);
  }

  restoreSelection() {
    for (const id of this.selectedElementIds) {
      const domEl = this._getDomElement(id);
      if (domEl) {
        domEl.classList.add('selected');
        this._addResizeHandles(domEl);
      }
    }
  }

  // --- Context Menu ---

  _buildContextMenu() {
    const menu = document.createElement('div');
    menu.className = 'align-context-menu';
    menu.style.display = 'none';
    menu.innerHTML = `
      <div class="ctx-header">Align Selected</div>
      <button data-action="align-top">↑ Align Top</button>
      <button data-action="align-middle">⬌ Align Middle (H)</button>
      <button data-action="align-bottom">↓ Align Bottom</button>
      <div class="ctx-sep"></div>
      <button data-action="align-left">← Align Left</button>
      <button data-action="align-center">⬍ Align Center (V)</button>
      <button data-action="align-right">→ Align Right</button>
      <div class="ctx-sep"></div>
      <button data-action="distribute-h">⇔ Distribute Horizontally</button>
      <button data-action="distribute-v">⇕ Distribute Vertically</button>
      <div class="ctx-sep"></div>
      <button data-action="group">🔗 Group</button>
      <button data-action="ungroup">🔓 Ungroup</button>
      <div class="ctx-sep-layer"></div>
      <button data-action="bring-front">⬆⬆ Bring to Front</button>
      <button data-action="bring-forward">⬆ Bring Forward</button>
      <button data-action="send-backward">⬇ Send Backward</button>
      <button data-action="send-back">⬇⬇ Send to Back</button>
    `;
    menu.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      e.stopPropagation();
      const action = btn.dataset.action;
      if (action === 'group') {
        this._groupSelected();
      } else if (action === 'ungroup') {
        this._ungroupSelected();
      } else if (action.startsWith('bring-') || action.startsWith('send-')) {
        this._changeZOrder(action);
      } else {
        this._executeAlignment(action);
      }
      this._hideContextMenu();
    });
    document.body.appendChild(menu);
    this._contextMenu = menu;
  }

  _showContextMenu(x, y) {
    const menu = this._contextMenu;
    menu.style.display = 'block';
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    requestAnimationFrame(() => {
      const rect = menu.getBoundingClientRect();
      const pad = 8;
      if (rect.right > window.innerWidth) menu.style.left = Math.max(pad, window.innerWidth - rect.width - pad) + 'px';
      if (rect.bottom > window.innerHeight) menu.style.top = Math.max(pad, window.innerHeight - rect.height - pad) + 'px';
    });
  }

  _hideContextMenu() {
    if (this._contextMenu) this._contextMenu.style.display = 'none';
  }

  _updateContextMenuItems() {
    const menu = this._contextMenu;
    const hasMultiple = this.selectedElementIds.length >= 2;
    const slideIdx = this.model.activeSlideIndex;
    const hasGroup = this.selectedElementIds.some(id => {
      const el = this.model.getElement(slideIdx, id);
      return el && el.groupId;
    });

    // Show/hide alignment buttons (need 2+)
    menu.querySelectorAll('button[data-action^="align-"], button[data-action^="distribute-"]').forEach(btn => {
      btn.style.display = hasMultiple ? '' : 'none';
    });
    // Show/hide alignment header and separators
    menu.querySelectorAll('.ctx-header, .ctx-sep').forEach(el => {
      el.style.display = hasMultiple ? '' : 'none';
    });

    const groupBtn = menu.querySelector('[data-action="group"]');
    const ungroupBtn = menu.querySelector('[data-action="ungroup"]');
    if (groupBtn) groupBtn.style.display = hasMultiple ? '' : 'none';
    if (ungroupBtn) ungroupBtn.style.display = hasGroup ? '' : 'none';

    // Z-order buttons: always visible when 1+ elements selected
    const hasSel = this.selectedElementIds.length >= 1;
    const layerSep = menu.querySelector('.ctx-sep-layer');
    if (layerSep) layerSep.style.display = hasSel ? '' : 'none';
    menu.querySelectorAll('[data-action="bring-front"], [data-action="bring-forward"], [data-action="send-backward"], [data-action="send-back"]').forEach(btn => {
      btn.style.display = hasSel ? '' : 'none';
    });
  }

  _executeAlignment(action) {
    const ids = this.selectedElementIds;
    if (ids.length < 2) return;
    const slideIdx = this.model.activeSlideIndex;
    const elements = ids.map(id => this.model.getElement(slideIdx, id)).filter(Boolean);
    if (elements.length < 2) return;

    switch (action) {
      case 'align-top': {
        const minY = Math.min(...elements.map(e => e.y));
        for (const el of elements) this.model.updateElement(slideIdx, el.id, { y: minY });
        break;
      }
      case 'align-middle': {
        const centers = elements.map(e => e.y + e.h / 2);
        const avgCenter = centers.reduce((a, b) => a + b, 0) / centers.length;
        for (const el of elements) this.model.updateElement(slideIdx, el.id, { y: avgCenter - el.h / 2 });
        break;
      }
      case 'align-bottom': {
        const maxBottom = Math.max(...elements.map(e => e.y + e.h));
        for (const el of elements) this.model.updateElement(slideIdx, el.id, { y: maxBottom - el.h });
        break;
      }
      case 'align-left': {
        const minX = Math.min(...elements.map(e => e.x));
        for (const el of elements) this.model.updateElement(slideIdx, el.id, { x: minX });
        break;
      }
      case 'align-center': {
        const centers = elements.map(e => e.x + e.w / 2);
        const avgCenter = centers.reduce((a, b) => a + b, 0) / centers.length;
        for (const el of elements) this.model.updateElement(slideIdx, el.id, { x: avgCenter - el.w / 2 });
        break;
      }
      case 'align-right': {
        const maxRight = Math.max(...elements.map(e => e.x + e.w));
        for (const el of elements) this.model.updateElement(slideIdx, el.id, { x: maxRight - el.w });
        break;
      }
      case 'distribute-h': {
        // Place all at same height (average center Y) with equal spacing along X
        const sorted = [...elements].sort((a, b) => a.x - b.x);
        const avgCenterY = elements.reduce((s, e) => s + e.y + e.h / 2, 0) / elements.length;
        const totalW = sorted.reduce((s, e) => s + e.w, 0);
        const MIN_GAP = 0.3; // inches
        const span = sorted[sorted.length - 1].x + sorted[sorted.length - 1].w - sorted[0].x;
        const neededSpan = totalW + MIN_GAP * (sorted.length - 1);
        const startX = span >= neededSpan ? sorted[0].x : sorted[0].x;
        const actualSpan = Math.max(span, neededSpan);
        const gap = (actualSpan - totalW) / (sorted.length - 1);
        let cx = startX;
        for (const el of sorted) {
          this.model.updateElement(slideIdx, el.id, { x: cx, y: avgCenterY - el.h / 2 });
          cx += el.w + gap;
        }
        break;
      }
      case 'distribute-v': {
        // Place all at same X (average center X) with equal spacing along Y
        const sorted = [...elements].sort((a, b) => a.y - b.y);
        const avgCenterX = elements.reduce((s, e) => s + e.x + e.w / 2, 0) / elements.length;
        const totalH = sorted.reduce((s, e) => s + e.h, 0);
        const MIN_GAP = 0.3;
        const span = sorted[sorted.length - 1].y + sorted[sorted.length - 1].h - sorted[0].y;
        const neededSpan = totalH + MIN_GAP * (sorted.length - 1);
        const actualSpan = Math.max(span, neededSpan);
        const gap = (actualSpan - totalH) / (sorted.length - 1);
        let cy = sorted[0].y;
        for (const el of sorted) {
          this.model.updateElement(slideIdx, el.id, { x: avgCenterX - el.w / 2, y: cy });
          cy += el.h + gap;
        }
        break;
      }
    }

    // Update DOM positions for aligned elements without full rebuild
    for (const id of ids) {
      const el = this.model.getElement(slideIdx, id);
      if (!el) continue;
      const domEl = this._getDomElement(id);
      if (!domEl) continue;
      domEl.style.left = inchesToPx(el.x, 'x') + 'px';
      domEl.style.top = inchesToPx(el.y, 'y') + 'px';
    }
    this.renderer.renderThumbnails();
    this.restoreSelection();
  }

  // --- Grouping ---

  _groupSelected() {
    if (this.selectedElementIds.length < 2) return;
    const groupId = 'grp-' + Date.now();
    const slideIdx = this.model.activeSlideIndex;
    for (const id of this.selectedElementIds) {
      this.model.updateElement(slideIdx, id, { groupId });
    }
  }

  _ungroupSelected() {
    const slideIdx = this.model.activeSlideIndex;
    const groupIds = new Set();
    for (const id of this.selectedElementIds) {
      const el = this.model.getElement(slideIdx, id);
      if (el && el.groupId) groupIds.add(el.groupId);
    }
    const slide = this.model.getActiveSlide();
    for (const el of slide.elements) {
      if (el.groupId && groupIds.has(el.groupId)) {
        el.groupId = null;
      }
    }
  }

  _changeZOrder(action) {
    const slide = this.model.getActiveSlide();
    if (!slide) return;
    const elements = slide.elements;
    const selectedIds = new Set(this.selectedElementIds);

    // Get indices of selected elements (sorted)
    const indices = [];
    for (let i = 0; i < elements.length; i++) {
      if (selectedIds.has(elements[i].id)) indices.push(i);
    }
    if (indices.length === 0) return;

    if (action === 'bring-front') {
      // Move selected to end of array (top)
      const selected = indices.map(i => elements[i]);
      const remaining = elements.filter(el => !selectedIds.has(el.id));
      slide.elements = [...remaining, ...selected];
    } else if (action === 'send-back') {
      // Move selected to start of array (bottom)
      const selected = indices.map(i => elements[i]);
      const remaining = elements.filter(el => !selectedIds.has(el.id));
      slide.elements = [...selected, ...remaining];
    } else if (action === 'bring-forward') {
      // Swap each selected element one position forward (from end to start)
      for (let k = indices.length - 1; k >= 0; k--) {
        const i = indices[k];
        if (i < elements.length - 1 && !selectedIds.has(elements[i + 1].id)) {
          [elements[i], elements[i + 1]] = [elements[i + 1], elements[i]];
        }
      }
    } else if (action === 'send-backward') {
      // Swap each selected element one position backward (from start to end)
      for (let k = 0; k < indices.length; k++) {
        const i = indices[k];
        if (i > 0 && !selectedIds.has(elements[i - 1].id)) {
          [elements[i], elements[i - 1]] = [elements[i - 1], elements[i]];
        }
      }
    }

    // Re-render slide to reflect new order
    this.renderer.renderActiveSlide();
    this.renderer.renderThumbnails();
    this.restoreSelection();
  }

  _getGroupMembers(elementId) {
    const slideIdx = this.model.activeSlideIndex;
    const el = this.model.getElement(slideIdx, elementId);
    if (!el || !el.groupId) return [];
    const slide = this.model.getActiveSlide();
    return slide.elements.filter(e => e.groupId === el.groupId).map(e => e.id);
  }

  _selectGroup(elementId) {
    const members = this._getGroupMembers(elementId);
    if (members.length <= 1) return false;
    this.deselect();
    this._isSubSelection = false;
    this._subSelectionGroupId = null;
    for (const id of members) {
      this._addToSelection(id);
    }
    return true;
  }

  _enterSubSelection(elementId) {
    const el = this.model.getElement(this.model.activeSlideIndex, elementId);
    if (!el || !el.groupId) return;
    const members = this._getGroupMembers(elementId);

    // Remove selected + resize handles from all group members
    for (const id of members) {
      const dom = this._getDomElement(id);
      if (dom) {
        dom.classList.remove('selected');
        this._removeResizeHandles(dom);
        // Show group siblings with a subtle outline
        if (id !== elementId) {
          dom.classList.add('group-sibling');
        }
      }
    }

    // Sub-select just this one element
    this.selectedElementId = elementId;
    this.selectedElementIds = [elementId];
    this._isSubSelection = true;
    this._subSelectionGroupId = el.groupId;

    const domEl = this._getDomElement(elementId);
    if (domEl) {
      domEl.classList.add('selected', 'sub-selected');
      this._addResizeHandles(domEl);
    }

    if (this.onSelectionChange) {
      this.onSelectionChange(elementId, el);
    }
  }

  _exitSubSelection() {
    if (!this._isSubSelection) return;
    // Remove sub-selection styling
    const siblings = this.renderer.canvas.querySelectorAll('.group-sibling');
    siblings.forEach(el => el.classList.remove('group-sibling'));
    const subSel = this.renderer.canvas.querySelectorAll('.sub-selected');
    subSel.forEach(el => el.classList.remove('sub-selected'));
    this._isSubSelection = false;
    this._subSelectionGroupId = null;
  }

  _getDomElement(elementId) {
    return this.renderer.canvas.querySelector(`[data-element-id="${elementId}"]`);
  }

  _addResizeHandles(domEl) {
    this._removeResizeHandles(domEl);
    const elementId = domEl.dataset.elementId;
    const el = this.model.getElement(this.model.activeSlideIndex, elementId);

    if (el && el.type === 'line') {
      // Add endpoint handles for lines
      for (const ep of ['start', 'end']) {
        const handle = document.createElement('div');
        handle.className = 'line-endpoint';
        handle.dataset.endpoint = ep;
        const x1px = inchesToPx(el.x1 || 0, 'x');
        const y1px = inchesToPx(el.y1 || 0, 'y');
        const x2px = inchesToPx(el.x2 || 4, 'x');
        const y2px = inchesToPx(el.y2 || 0, 'y');
        const minXpx = Math.min(x1px, x2px);
        const minYpx = Math.min(y1px, y2px);
        if (ep === 'start') {
          handle.style.left = (x1px - minXpx) + 'px';
          handle.style.top = (y1px - minYpx) + 'px';
        } else {
          handle.style.left = (x2px - minXpx) + 'px';
          handle.style.top = (y2px - minYpx) + 'px';
        }
        handle.addEventListener('mousedown', (e) => {
          e.stopPropagation();
          e.preventDefault();
          this._startLineEndpointDrag(e, ep, domEl, el);
        });
        domEl.appendChild(handle);
      }
      return;
    }

    const handles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
    for (const pos of handles) {
      const handle = document.createElement('div');
      handle.className = `resize-handle ${pos}`;
      handle.dataset.handle = pos;
      handle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        this._startResize(e, pos, domEl);
      });
      domEl.appendChild(handle);
    }
  }

  _removeResizeHandles(domEl) {
    domEl.querySelectorAll('.resize-handle, .line-endpoint').forEach(h => h.remove());
  }

  _startLineEndpointDrag(e, endpoint, domEl, el) {
    this.model.beginUndoBatch();
    this._lineEndpointState = {
      elementId: el.id,
      endpoint,
      startX: e.clientX,
      startY: e.clientY,
      origX: el.x,
      origY: el.y,
      origX1: el.x1 || 0,
      origY1: el.y1 || 0,
      origX2: el.x2 || 4,
      origY2: el.y2 || 0,
    };
  }

  _startResize(e, handle, domEl) {
    this.model.beginUndoBatch();
    // Capture all selected elements for group resize
    const groupItems = [];
    for (const id of this.selectedElementIds) {
      const dom = this._getDomElement(id);
      if (dom) {
        groupItems.push({
          elementId: id,
          origLeft: parseFloat(dom.style.left),
          origTop: parseFloat(dom.style.top),
          origWidth: parseFloat(dom.style.width),
          origHeight: parseFloat(dom.style.height),
        });
      }
    }
    // Compute bounding box of all selected elements
    const allLeft = Math.min(...groupItems.map(i => i.origLeft));
    const allTop = Math.min(...groupItems.map(i => i.origTop));
    const allRight = Math.max(...groupItems.map(i => i.origLeft + i.origWidth));
    const allBottom = Math.max(...groupItems.map(i => i.origTop + i.origHeight));

    this._resizeState = {
      elementId: domEl.dataset.elementId,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      origLeft: parseFloat(domEl.style.left),
      origTop: parseFloat(domEl.style.top),
      origWidth: parseFloat(domEl.style.width),
      origHeight: parseFloat(domEl.style.height),
      groupItems: groupItems.length > 1 ? groupItems : null,
      bbox: groupItems.length > 1 ? { left: allLeft, top: allTop, width: allRight - allLeft, height: allBottom - allTop } : null,
    };

    // Lock aspect ratio for images
    const el = this.model.getElement(this.model.activeSlideIndex, domEl.dataset.elementId);
    if (el && el.type === 'image') {
      this._resizeState.aspectRatio = this._resizeState.origWidth / this._resizeState.origHeight;
    }
  }

  _onMouseMove(e) {
    if (this._dragState) {
      const dx = (e.clientX - this._dragState.startX) / this._scale;
      const dy = (e.clientY - this._dragState.startY) / this._scale;
      const { w: CANVAS_W, h: CANVAS_H } = getCanvasDimensions();

      // Move all selected elements together
      for (const item of this._dragState.multiDragItems) {
        const dom = this._getDomElement(item.elementId);
        if (!dom) continue;
        const domW = parseFloat(dom.style.width);
        const domH = parseFloat(dom.style.height);
        let newLeft = item.origLeft + dx;
        let newTop = item.origTop + dy;
        newLeft = Math.max(-domW / 2, Math.min(newLeft, CANVAS_W - domW / 2));
        newTop = Math.max(-domH / 2, Math.min(newTop, CANVAS_H - domH / 2));
        dom.style.left = newLeft + 'px';
        dom.style.top = newTop + 'px';
      }

      // Snap guides based on the primary dragged element
      const primaryDom = this._getDomElement(this._dragState.elementId);
      if (primaryDom) {
        const pLeft = parseFloat(primaryDom.style.left);
        const pTop = parseFloat(primaryDom.style.top);
        const pW = parseFloat(primaryDom.style.width);
        const pH = parseFloat(primaryDom.style.height);
        const snap = this._computeSnapGuides(
          this._dragState.elementId, pLeft, pTop, pW, pH
        );
        if (snap.snapX !== null || snap.snapY !== null) {
          const snapDx = snap.snapX !== null ? snap.snapX - pLeft : 0;
          const snapDy = snap.snapY !== null ? snap.snapY - pTop : 0;
          for (const item of this._dragState.multiDragItems) {
            const dom = this._getDomElement(item.elementId);
            if (dom) {
              dom.style.left = (parseFloat(dom.style.left) + snapDx) + 'px';
              dom.style.top = (parseFloat(dom.style.top) + snapDy) + 'px';
            }
          }
        }
        this._drawGuides(snap.guides);
      }
    }

    if (this._lineEndpointState) {
      const s = this._lineEndpointState;
      const dxInch = pxToInches((e.clientX - s.startX) / this._scale, 'x');
      const dyInch = pxToInches((e.clientY - s.startY) / this._scale, 'y');
      let newX1 = s.origX1, newY1 = s.origY1, newX2 = s.origX2, newY2 = s.origY2;
      if (s.endpoint === 'start') {
        newX1 = s.origX1 + dxInch;
        newY1 = s.origY1 + dyInch;
      } else {
        newX2 = s.origX2 + dxInch;
        newY2 = s.origY2 + dyInch;
      }
      // Recompute bounding box position
      const minX = Math.min(newX1, newX2);
      const minY = Math.min(newY1, newY2);
      // Store endpoints relative to origin (0,0)
      this.model.updateElement(this.model.activeSlideIndex, s.elementId, {
        x: s.origX + minX, y: s.origY + minY,
        x1: newX1 - minX, y1: newY1 - minY,
        x2: newX2 - minX, y2: newY2 - minY,
      });
      const el = this.model.getElement(this.model.activeSlideIndex, s.elementId);
      const newDom = this.renderer.updateElementDom(el);
      if (newDom) {
        newDom.classList.add('selected');
        this._addResizeHandles(newDom);
      }
    }

    if (this._resizeState) {
      const s = this._resizeState;
      const dx = (e.clientX - s.startX) / this._scale;
      const dy = (e.clientY - s.startY) / this._scale;

      if (s.groupItems && s.bbox) {
        // Group resize: compute new bounding box, scale all members
        let newBboxLeft = s.bbox.left;
        let newBboxTop = s.bbox.top;
        let newBboxW = s.bbox.width;
        let newBboxH = s.bbox.height;

        if (s.handle.includes('e')) newBboxW = Math.max(30, s.bbox.width + dx);
        if (s.handle.includes('w')) { newBboxW = Math.max(30, s.bbox.width - dx); newBboxLeft = s.bbox.left + dx; }
        if (s.handle.includes('s')) newBboxH = Math.max(30, s.bbox.height + dy);
        if (s.handle.includes('n')) { newBboxH = Math.max(30, s.bbox.height - dy); newBboxTop = s.bbox.top + dy; }

        const scaleX = newBboxW / s.bbox.width;
        const scaleY = newBboxH / s.bbox.height;

        for (const item of s.groupItems) {
          const dom = this._getDomElement(item.elementId);
          if (!dom) continue;
          const relX = item.origLeft - s.bbox.left;
          const relY = item.origTop - s.bbox.top;
          dom.style.left = (newBboxLeft + relX * scaleX) + 'px';
          dom.style.top = (newBboxTop + relY * scaleY) + 'px';
          dom.style.width = Math.max(10, item.origWidth * scaleX) + 'px';
          dom.style.height = Math.max(10, item.origHeight * scaleY) + 'px';
        }
      } else {
        // Single element resize
        const domEl = this._getDomElement(s.elementId);
        if (!domEl) return;

        let newLeft = s.origLeft;
        let newTop = s.origTop;
        let newWidth = s.origWidth;
        let newHeight = s.origHeight;

        if (s.handle.includes('e')) newWidth = Math.max(30, s.origWidth + dx);
        if (s.handle.includes('w')) { newWidth = Math.max(30, s.origWidth - dx); newLeft = s.origLeft + dx; }
        if (s.handle.includes('s')) newHeight = Math.max(30, s.origHeight + dy);
        if (s.handle.includes('n')) { newHeight = Math.max(30, s.origHeight - dy); newTop = s.origTop + dy; }

        // Proportional resize for images on corner handles
        if (s.aspectRatio && s.handle.length === 2) {
          // Determine dominant axis from mouse movement
          if (Math.abs(dx) > Math.abs(dy)) {
            newHeight = newWidth / s.aspectRatio;
          } else {
            newWidth = newHeight * s.aspectRatio;
          }
          // Adjust position for nw/ne/sw corners
          if (s.handle.includes('n')) {
            newTop = s.origTop + s.origHeight - newHeight;
          }
          if (s.handle.includes('w')) {
            newLeft = s.origLeft + s.origWidth - newWidth;
          }
        }

        domEl.style.left = newLeft + 'px';
        domEl.style.top = newTop + 'px';
        domEl.style.width = newWidth + 'px';
        domEl.style.height = newHeight + 'px';
      }
    }
  }

  _onMouseUp(e) {
    this._clearGuides();

    if (this._lineEndpointState) {
      this._lineEndpointState = null;
      this.renderer.renderThumbnails();
      this.model.endUndoBatch();
    }

    const didDrag = this._dragState && (
      Math.abs(e.clientX - this._dragState.startX) > 3 ||
      Math.abs(e.clientY - this._dragState.startY) > 3
    );

    if (this._dragState) {
      // Commit positions for all dragged elements
      for (const item of this._dragState.multiDragItems) {
        const dom = this._getDomElement(item.elementId);
        if (dom) {
          this.model.updateElement(this.model.activeSlideIndex, item.elementId, {
            x: pxToInches(parseFloat(dom.style.left), 'x'),
            y: pxToInches(parseFloat(dom.style.top), 'y'),
          });
        }
      }
      this.renderer.renderThumbnails();
      this._dragState = null;
      this.model.endUndoBatch();
    }

    // Sub-selection: only if mouse didn't drag (was a click)
    if (this._pendingSubSelection && !didDrag) {
      const elementId = this._pendingSubSelection;
      const el = this.model.getElement(this.model.activeSlideIndex, elementId);
      if (el && el.groupId && !this._isSubSelection) {
        this._enterSubSelection(elementId);
      }
    }
    this._pendingSubSelection = null;

    if (this._resizeState) {
      if (this._resizeState.groupItems) {
        // Commit all group members
        for (const item of this._resizeState.groupItems) {
          const dom = this._getDomElement(item.elementId);
          if (dom) {
            this.model.updateElement(this.model.activeSlideIndex, item.elementId, {
              x: pxToInches(parseFloat(dom.style.left), 'x'),
              y: pxToInches(parseFloat(dom.style.top), 'y'),
              w: pxToInches(parseFloat(dom.style.width), 'x'),
              h: pxToInches(parseFloat(dom.style.height), 'y'),
            });
          }
        }
      } else {
        const domEl = this._getDomElement(this._resizeState.elementId);
        if (domEl) {
          this.model.updateElement(this.model.activeSlideIndex, this._resizeState.elementId, {
            x: pxToInches(parseFloat(domEl.style.left), 'x'),
            y: pxToInches(parseFloat(domEl.style.top), 'y'),
            w: pxToInches(parseFloat(domEl.style.width), 'x'),
            h: pxToInches(parseFloat(domEl.style.height), 'y'),
          });
        }
      }
      this.renderer.renderThumbnails();
      this._resizeState = null;
      this.model.endUndoBatch();
    }
  }

  // --- Snap & Alignment Guides ---

  _computeSnapGuides(draggedId, left, top, width, height) {
    const SNAP_THRESHOLD = 6; // pixels
    const guides = [];
    let snapX = null;
    let snapY = null;
    let bestDx = SNAP_THRESHOLD + 1;
    let bestDy = SNAP_THRESHOLD + 1;

    // Dragged element edges & center
    const dLeft = left, dRight = left + width, dCenterX = left + width / 2;
    const dTop = top, dBottom = top + height, dCenterY = top + height / 2;

    const { w: CANVAS_W, h: CANVAS_H } = getCanvasDimensions();

    // Canvas center guides
    const canvasCX = CANVAS_W / 2, canvasCY = CANVAS_H / 2;
    const cxDiff = Math.abs(dCenterX - canvasCX);
    if (cxDiff < bestDx) { bestDx = cxDiff; snapX = canvasCX - width / 2; }
    const cyDiff = Math.abs(dCenterY - canvasCY);
    if (cyDiff < bestDy) { bestDy = cyDiff; snapY = canvasCY - height / 2; }

    // Collect other elements' edges & centers
    const slide = this.model.getActiveSlide();
    if (!slide) return { snapX: null, snapY: null, guides };

    for (const el of slide.elements) {
      if (el.id === draggedId) continue;
      if (this.selectedElementIds.includes(el.id)) continue;
      const domOther = this._getDomElement(el.id);
      if (!domOther) continue;

      const oL = parseFloat(domOther.style.left), oT = parseFloat(domOther.style.top);
      const oW = parseFloat(domOther.style.width), oH = parseFloat(domOther.style.height);
      const oR = oL + oW, oCX = oL + oW / 2;
      const oB = oT + oH, oCY = oT + oH / 2;

      // Horizontal alignment (X-axis snaps): left-left, right-right, center-center, left-right, right-left
      const xPairs = [
        { dragged: dLeft, other: oL, snapVal: oL },
        { dragged: dRight, other: oR, snapVal: oR - width },
        { dragged: dCenterX, other: oCX, snapVal: oCX - width / 2 },
        { dragged: dLeft, other: oR, snapVal: oR },
        { dragged: dRight, other: oL, snapVal: oL - width },
      ];
      for (const p of xPairs) {
        const diff = Math.abs(p.dragged - p.other);
        if (diff < bestDx) {
          bestDx = diff;
          snapX = p.snapVal;
        }
      }

      // Vertical alignment (Y-axis snaps): top-top, bottom-bottom, center-center, top-bottom, bottom-top
      const yPairs = [
        { dragged: dTop, other: oT, snapVal: oT },
        { dragged: dBottom, other: oB, snapVal: oB - height },
        { dragged: dCenterY, other: oCY, snapVal: oCY - height / 2 },
        { dragged: dTop, other: oB, snapVal: oB },
        { dragged: dBottom, other: oT, snapVal: oT - height },
      ];
      for (const p of yPairs) {
        const diff = Math.abs(p.dragged - p.other);
        if (diff < bestDy) {
          bestDy = diff;
          snapY = p.snapVal;
        }
      }
    }

    if (bestDx > SNAP_THRESHOLD) snapX = null;
    if (bestDy > SNAP_THRESHOLD) snapY = null;

    // Build guide lines for the snapped axes
    const finalLeft = snapX !== null ? snapX : left;
    const finalTop = snapY !== null ? snapY : top;

    if (snapX !== null) {
      // Find which X value matched
      const fL = finalLeft, fR = finalLeft + width, fCX = finalLeft + width / 2;
      const xVals = [fL, fR, fCX];
      for (const el of slide.elements) {
        if (el.id === draggedId) continue;
        if (this.selectedElementIds.includes(el.id)) continue;
        const domO = this._getDomElement(el.id);
        if (!domO) continue;
        const oL = parseFloat(domO.style.left), oR = oL + parseFloat(domO.style.width), oCX = oL + parseFloat(domO.style.width) / 2;
        for (const xv of xVals) {
          for (const ox of [oL, oR, oCX]) {
            if (Math.abs(xv - ox) < 1) {
              const minY = Math.min(finalTop, parseFloat(domO.style.top));
              const maxY = Math.max(finalTop + height, parseFloat(domO.style.top) + parseFloat(domO.style.height));
              guides.push({ type: 'v', x: xv, y1: minY, y2: maxY });
            }
          }
        }
      }
      // Canvas center
      if (Math.abs(fCX - canvasCX) < 1) {
        guides.push({ type: 'v', x: canvasCX, y1: 0, y2: CANVAS_H });
      }
    }

    if (snapY !== null) {
      const fT = finalTop, fB = finalTop + height, fCY = finalTop + height / 2;
      const yVals = [fT, fB, fCY];
      for (const el of slide.elements) {
        if (el.id === draggedId) continue;
        if (this.selectedElementIds.includes(el.id)) continue;
        const domO = this._getDomElement(el.id);
        if (!domO) continue;
        const oT = parseFloat(domO.style.top), oB = oT + parseFloat(domO.style.height), oCY = oT + parseFloat(domO.style.height) / 2;
        for (const yv of yVals) {
          for (const oy of [oT, oB, oCY]) {
            if (Math.abs(yv - oy) < 1) {
              const minX = Math.min(finalLeft, parseFloat(domO.style.left));
              const maxX = Math.max(finalLeft + width, parseFloat(domO.style.left) + parseFloat(domO.style.width));
              guides.push({ type: 'h', y: yv, x1: minX, x2: maxX });
            }
          }
        }
      }
      if (Math.abs(fCY - canvasCY) < 1) {
        guides.push({ type: 'h', y: canvasCY, x1: 0, x2: CANVAS_W });
      }
    }

    return { snapX, snapY, guides };
  }

  _drawGuides(guides) {
    this._clearGuides();
    const canvas = this.renderer.canvas;
    for (const g of guides) {
      const line = document.createElement('div');
      line.className = 'snap-guide';
      if (g.type === 'v') {
        line.style.left = g.x + 'px';
        line.style.top = g.y1 + 'px';
        line.style.width = '1px';
        line.style.height = (g.y2 - g.y1) + 'px';
      } else {
        line.style.left = g.x1 + 'px';
        line.style.top = g.y + 'px';
        line.style.width = (g.x2 - g.x1) + 'px';
        line.style.height = '1px';
      }
      canvas.appendChild(line);
    }
  }

  _clearGuides() {
    const canvas = this.renderer.canvas;
    canvas.querySelectorAll('.snap-guide').forEach(g => g.remove());
  }

  _enterTextEdit(domEl, elementId) {
    this.isEditing = true;
    this.selectedElementId = elementId;
    domEl.classList.add('editing');

    const content = domEl.querySelector('.element-content');
    if (content) {
      const el = this.model.getElement(this.model.activeSlideIndex, elementId);
      if (el && el.type === 'code') {
        content.textContent = el.content || '';
      } else if (el && el.style.listType && el.style.listType !== 'none') {
        // Keep list HTML for editing so user sees bullets/numbers
      } else if (el) {
        content.innerHTML = '';
        content.style.whiteSpace = 'pre-wrap';
        content.textContent = el.content || '';
      }
      content.contentEditable = 'true';
      content.focus();

      const range = document.createRange();
      range.selectNodeContents(content);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }

    if (this.onTextEditStart) this.onTextEditStart(elementId);
  }

  _exitTextEdit() {
    if (this._tableEditId) {
      this._exitTableEdit();
      return;
    }
    if (!this.isEditing || !this.selectedElementId) {
      this.isEditing = false;
      return;
    }

    const domEl = this._getDomElement(this.selectedElementId);
    if (domEl) {
      domEl.classList.remove('editing');
      const content = domEl.querySelector('.element-content');
      if (content) {
        content.contentEditable = 'false';
        const el = this.model.getElement(this.model.activeSlideIndex, this.selectedElementId);
        let text;
        // Extract text from list items if present
        const listItems = content.querySelectorAll('li');
        if (listItems.length > 0) {
          text = Array.from(listItems).map(li => li.innerText).join('\n');
        } else {
          text = content.innerText;
        }
        this.model.updateElement(this.model.activeSlideIndex, this.selectedElementId, {
          content: text,
        });
      }
    }

    const editedId = this.selectedElementId;
    this.isEditing = false;
    if (this.onTextEditEnd) this.onTextEditEnd(editedId);

    // Re-render the element to restore syntax highlighting (code elements)
    const el = this.model.getElement(this.model.activeSlideIndex, editedId);
    if (el) {
      this.renderer.updateElementDom(el);
    }

    const freshDom = this._getDomElement(editedId);
    if (freshDom) {
      freshDom.classList.add('selected');
      this._addResizeHandles(freshDom);
    }
    this.renderer.renderThumbnails();
  }

  // --- Table cell editing ---

  _enterTableEdit(domEl, elementId, e) {
    this.isEditing = true;
    this._tableEditId = elementId;
    this.selectedElementId = elementId;
    domEl.classList.add('editing');

    // Find the clicked cell
    const td = e.target.closest('td');
    if (td) {
      this._editTableCell(td, elementId);
    }

    // Listen for clicks on other cells within this table
    this._tableCellClickHandler = (ev) => {
      const clickedTd = ev.target.closest('td');
      if (clickedTd && domEl.contains(clickedTd)) {
        ev.stopPropagation();
        ev.preventDefault();
        // Save previous cell first
        this._saveActiveTableCell(elementId);
        this._editTableCell(clickedTd, elementId);
      }
    };
    domEl.addEventListener('mousedown', this._tableCellClickHandler, true);

    // Tab navigation between cells
    this._tableKeyHandler = (ev) => {
      if (ev.key !== 'Tab') return;
      ev.preventDefault();
      const el = this.model.getElement(this.model.activeSlideIndex, elementId);
      if (!el || !el.tableData) return;
      const cells = el.tableData.cells;
      const curRow = parseInt(this._activeTableCell?.dataset.row ?? 0);
      const curCol = parseInt(this._activeTableCell?.dataset.col ?? 0);
      const numCols = cells[0]?.length || 1;
      const numRows = cells.length;

      this._saveActiveTableCell(elementId);

      let nextRow, nextCol;
      if (ev.shiftKey) {
        // Move backwards
        nextCol = curCol - 1;
        nextRow = curRow;
        if (nextCol < 0) {
          nextRow--;
          nextCol = numCols - 1;
        }
        if (nextRow < 0) return; // already at first cell
      } else {
        // Move forward
        nextCol = curCol + 1;
        nextRow = curRow;
        if (nextCol >= numCols) {
          nextRow++;
          nextCol = 0;
        }
        // Last cell — add a new row
        if (nextRow >= numRows) {
          const newCells = JSON.parse(JSON.stringify(cells));
          newCells.push(Array.from({ length: numCols }, () => ''));
          this.model.updateElement(this.model.activeSlideIndex, elementId, {
            tableData: { ...el.tableData, cells: newCells },
          });
          // Re-render the table DOM to include the new row
          const freshEl = this.model.getElement(this.model.activeSlideIndex, elementId);
          this.renderer.updateElementDom(freshEl);
          const freshDom = this._getDomElement(elementId);
          if (freshDom) {
            freshDom.classList.add('selected', 'editing');
            this._addResizeHandles(freshDom);
            // Re-attach handlers on fresh DOM
            freshDom.addEventListener('mousedown', this._tableCellClickHandler, true);
            freshDom.addEventListener('keydown', this._tableKeyHandler, true);
          }
          // Focus the first cell in the new row
          const newTd = freshDom?.querySelector(`td[data-row="${nextRow}"][data-col="0"]`);
          if (newTd) this._editTableCell(newTd, elementId);
          this.renderer.renderThumbnails();
          return;
        }
      }

      // Focus the target cell
      const currentDom = this._getDomElement(elementId);
      const targetTd = currentDom?.querySelector(`td[data-row="${nextRow}"][data-col="${nextCol}"]`);
      if (targetTd) this._editTableCell(targetTd, elementId);
    };
    domEl.addEventListener('keydown', this._tableKeyHandler, true);
  }

  _editTableCell(td, elementId) {
    // Deactivate any previously active cell
    const domEl = this._getDomElement(elementId);
    if (domEl) {
      domEl.querySelectorAll('td[contenteditable="true"]').forEach(c => {
        c.contentEditable = 'false';
      });
    }
    this._activeTableCell = td;
    td.contentEditable = 'true';
    td.focus();
    const range = document.createRange();
    range.selectNodeContents(td);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  _saveActiveTableCell(elementId) {
    if (!this._activeTableCell) return;
    const td = this._activeTableCell;
    const row = parseInt(td.dataset.row);
    const col = parseInt(td.dataset.col);
    const el = this.model.getElement(this.model.activeSlideIndex, elementId);
    if (el && el.tableData && !isNaN(row) && !isNaN(col)) {
      const newCells = JSON.parse(JSON.stringify(el.tableData.cells));
      newCells[row][col] = td.textContent || '';
      this.model.updateElement(this.model.activeSlideIndex, elementId, {
        tableData: { ...el.tableData, cells: newCells },
      });
    }
    td.contentEditable = 'false';
    this._activeTableCell = null;
  }

  _exitTableEdit() {
    if (!this._tableEditId) return;
    const elementId = this._tableEditId;
    const domEl = this._getDomElement(elementId);

    // Save active cell
    this._saveActiveTableCell(elementId);

    if (domEl) {
      domEl.classList.remove('editing');
      if (this._tableCellClickHandler) {
        domEl.removeEventListener('mousedown', this._tableCellClickHandler, true);
      }
      if (this._tableKeyHandler) {
        domEl.removeEventListener('keydown', this._tableKeyHandler, true);
      }
    }

    this._tableEditId = null;
    this._tableCellClickHandler = null;
    this._tableKeyHandler = null;
    this.isEditing = false;

    // Re-render to sync
    const el = this.model.getElement(this.model.activeSlideIndex, elementId);
    if (el) {
      this.renderer.updateElementDom(el);
    }
    const freshDom = this._getDomElement(elementId);
    if (freshDom) {
      freshDom.classList.add('selected');
      this._addResizeHandles(freshDom);
    }
    this.renderer.renderThumbnails();
  }
}

export { Editor };
