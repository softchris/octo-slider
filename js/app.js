// App — main entry point, wires everything together

import { SlideModel } from './slide-model.js';
import { parsePptx } from './pptx-parser.js';
import { SlideRenderer, getCanvasDimensions } from './slide-renderer.js';
import { Editor } from './editor.js';
import { Toolbar } from './toolbar.js';
import { writePptx } from './pptx-writer.js';
import { builtInLayouts } from './built-in-layouts.js';

const model = new SlideModel();
const canvas = document.getElementById('slide-canvas');
const canvasContainer = document.getElementById('canvas-container');
const canvasSizer = document.getElementById('canvas-sizer');
const editorArea = document.getElementById('editor-area');
const thumbnails = document.getElementById('slide-thumbnails');
const renderer = new SlideRenderer(model, canvas, thumbnails);
const editor = new Editor(model, renderer);
const toolbar = new Toolbar(model, editor, renderer);

editor.init();

// --- Auto-scale canvas to fit editor area ---
let currentScale = 1;

function fitCanvasToEditor() {
  const { w: CANVAS_W, h: CANVAS_H } = getCanvasDimensions();
  const canvasArea = document.getElementById('editor-canvas-area');
  const padding = 48;
  const availW = canvasArea.clientWidth - padding;
  const availH = canvasArea.clientHeight - padding;
  const scaleX = availW / CANVAS_W;
  const scaleY = availH / CANVAS_H;
  currentScale = Math.min(scaleX, scaleY, 1);

  canvasContainer.style.transform = `scale(${currentScale})`;
  canvasContainer.style.width = CANVAS_W + 'px';
  canvasContainer.style.height = CANVAS_H + 'px';
  canvasContainer.style.transformOrigin = 'top left';

  // Set sizer dimensions for absolute centering via translate(-50%, -50%)
  const visualW = Math.round(CANVAS_W * currentScale);
  const visualH = Math.round(CANVAS_H * currentScale);
  canvasSizer.style.width = visualW + 'px';
  canvasSizer.style.height = visualH + 'px';

  editor.setScale(currentScale);
}

window.addEventListener('resize', () => fitCanvasToEditor());
fitCanvasToEditor();

// --- File Open ---
const btnOpen = document.getElementById('btn-open');
const fileInput = document.getElementById('file-input');
const fileNameSpan = document.getElementById('file-name');

let currentFileName = 'presentation.pptx';

// --- New Presentation ---
const btnNew = document.getElementById('btn-new');
const newPresOverlay = document.getElementById('new-pres-overlay');
const newPresClose = document.getElementById('new-pres-close');
const newPresBlank = document.getElementById('new-pres-blank');
const newPresThemeSelect = document.getElementById('new-pres-theme-select');
const newPresPreview = document.getElementById('new-pres-preview');
const newPresPreviewGrid = document.getElementById('new-pres-preview-grid');
const newPresCreate = document.getElementById('new-pres-create');

function openNewPresDialog() {
  // Populate theme dropdown from builtInLayouts
  const themes = [...new Set(builtInLayouts.map(l => l.theme))];
  newPresThemeSelect.innerHTML = '<option value="">— Select a theme —</option>';
  themes.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    newPresThemeSelect.appendChild(opt);
  });
  newPresPreview.style.display = 'none';
  newPresPreviewGrid.innerHTML = '';
  newPresThemeSelect.value = '';
  newPresOverlay.style.display = 'flex';
}

function closeNewPresDialog() {
  newPresOverlay.style.display = 'none';
}

function doNewBlank() {
  model.clear();
  model.slideWidth = 13.333;
  model.slideHeight = 7.5;
  model.addSlide();
  model.setActiveSlide(0);
  currentFileName = 'presentation.pptx';
  fileNameSpan.textContent = 'New Presentation';
  renderer.renderAll();
  fitCanvasToEditor();
  toolbar.enableTools();
  updateNotesForActiveSlide();
  closeNewPresDialog();
}

function renderThemePreview(themeName) {
  const layouts = builtInLayouts.filter(l => l.theme === themeName);
  newPresPreviewGrid.innerHTML = '';
  layouts.forEach(layout => {
    const card = document.createElement('div');
    card.className = 'new-pres-preview-card';
    const mini = document.createElement('div');
    mini.className = 'new-pres-mini-slide';
    const slideClone = JSON.parse(JSON.stringify(layout.slide));
    const content = renderer.createMiniSlide(slideClone, 200);
    mini.appendChild(content);
    const label = document.createElement('div');
    label.className = 'new-pres-preview-label';
    label.textContent = layout.slideType;
    card.appendChild(mini);
    card.appendChild(label);
    newPresPreviewGrid.appendChild(card);
  });
  newPresPreview.style.display = 'block';
}

function createDeckFromTheme(themeName) {
  const layouts = builtInLayouts.filter(l => l.theme === themeName);
  if (layouts.length === 0) return;
  model.clear();
  model.slideWidth = 13.333;
  model.slideHeight = 7.5;
  layouts.forEach((layout, i) => {
    model.addSlide();
    model.applyLayout(i, layout.id);
  });
  model.setActiveSlide(0);
  currentFileName = `${themeName} Presentation.pptx`;
  fileNameSpan.textContent = currentFileName;
  renderer.renderAll();
  fitCanvasToEditor();
  toolbar.enableTools();
  updateNotesForActiveSlide();
  closeNewPresDialog();
}

btnNew.addEventListener('click', openNewPresDialog);
newPresClose.addEventListener('click', closeNewPresDialog);
newPresOverlay.addEventListener('click', (e) => {
  if (e.target === newPresOverlay) closeNewPresDialog();
});
newPresBlank.addEventListener('click', doNewBlank);
newPresThemeSelect.addEventListener('change', (e) => {
  const theme = e.target.value;
  if (theme) {
    renderThemePreview(theme);
  } else {
    newPresPreview.style.display = 'none';
    newPresPreviewGrid.innerHTML = '';
  }
});
newPresCreate.addEventListener('click', () => {
  const theme = newPresThemeSelect.value;
  if (theme) createDeckFromTheme(theme);
});

btnOpen.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  currentFileName = file.name;
  fileNameSpan.textContent = currentFileName;
  canvas.innerHTML = '<div class="canvas-placeholder">Loading...</div>';

  try {
    await parsePptx(file, model);

    if (model.slideCount === 0) {
      model.addSlide();
    }

    model.setActiveSlide(0);
    renderer.renderAll();
    fitCanvasToEditor(); // re-fit after dimensions may have changed
    toolbar.enableTools();
    updateNotesForActiveSlide();
  } catch (err) {
    console.error('Failed to parse PPTX:', err);
    canvas.innerHTML = `<div class="canvas-placeholder">Error loading file: ${err.message}</div>`;
  }

  fileInput.value = '';
});

// --- Save ---
const btnSave = document.getElementById('btn-save');
btnSave.addEventListener('click', () => {
  if (model.slideCount === 0) return;
  const defaultName = currentFileName
    ? currentFileName.replace(/\.pptx$/i, '') + '.pptx'
    : 'presentation.pptx';
  _showSaveDialog(defaultName);
});

function _showSaveDialog(defaultName) {
  // Remove existing dialog if any
  const existing = document.getElementById('save-dialog-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'save-dialog-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:100000;display:flex;align-items:center;justify-content:center;';
  const dialog = document.createElement('div');
  dialog.style.cssText = 'background:#1e1e2e;border:1px solid #45475a;border-radius:10px;padding:24px 28px;min-width:360px;color:#cdd6f4;font-family:Segoe UI,sans-serif;';
  dialog.innerHTML = `
    <div style="font-size:16px;font-weight:600;margin-bottom:16px;">Save Presentation</div>
    <label style="font-size:13px;color:#a6adc8;">Filename</label>
    <input id="save-filename" type="text" value="${defaultName}" style="width:100%;box-sizing:border-box;padding:8px 10px;margin:6px 0 18px;background:#313244;border:1px solid #585b70;border-radius:6px;color:#cdd6f4;font-size:14px;outline:none;">
    <div style="display:flex;gap:10px;justify-content:flex-end;">
      <button id="save-cancel-btn" style="padding:8px 18px;background:transparent;border:1px solid #585b70;border-radius:6px;color:#cdd6f4;cursor:pointer;font-size:13px;">Cancel</button>
      <button id="save-confirm-btn" style="padding:8px 18px;background:#89b4fa;border:none;border-radius:6px;color:#1e1e2e;cursor:pointer;font-weight:600;font-size:13px;">Save</button>
    </div>
  `;
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  const input = document.getElementById('save-filename');
  const confirmBtn = document.getElementById('save-confirm-btn');
  const cancelBtn = document.getElementById('save-cancel-btn');

  // Select the filename part (before .pptx)
  input.focus();
  const dotIdx = input.value.lastIndexOf('.');
  if (dotIdx > 0) input.setSelectionRange(0, dotIdx);

  cancelBtn.addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  confirmBtn.addEventListener('click', () => {
    let name = input.value.trim();
    if (!name) return;
    if (!name.toLowerCase().endsWith('.pptx')) name += '.pptx';
    overlay.remove();
    writePptx(model, name);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') confirmBtn.click();
    if (e.key === 'Escape') overlay.remove();
  });
}

// --- Slide Management ---
const btnAddSlide = document.getElementById('btn-add-slide');
const btnDeleteSlide = document.getElementById('btn-delete-slide');

btnAddSlide.addEventListener('click', () => {
  const idx = model.addSlide();
  model.setActiveSlide(idx);
  renderer.renderAll();
});

btnDeleteSlide.addEventListener('click', () => {
  if (model.slideCount <= 1) return;
  if (!confirm(`Delete slide ${model.activeSlideIndex + 1}?`)) return;
  model.removeSlide(model.activeSlideIndex);
  renderer.renderAll();
});

// --- Thumbnail keyboard navigation ---
thumbnails.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
    e.preventDefault();
    const next = model.activeSlideIndex + 1;
    if (next < model.slideCount) {
      model.setActiveSlide(next);
      renderer.renderAll();
      updateNotesForActiveSlide();
    }
  } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
    e.preventDefault();
    const prev = model.activeSlideIndex - 1;
    if (prev >= 0) {
      model.setActiveSlide(prev);
      renderer.renderAll();
      updateNotesForActiveSlide();
    }
  }
});

// Focus thumbnails when clicking a thumbnail
thumbnails.addEventListener('click', () => thumbnails.focus());

// --- Undo (Ctrl+Z) ---
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
    // Don't intercept if user is editing text in a textarea/input
    const tag = document.activeElement?.tagName;
    if (tag === 'TEXTAREA' || tag === 'INPUT') return;
    // Don't intercept if editor is in inline text-edit mode
    if (editor.isEditing) return;
    e.preventDefault();
    if (model.undo()) {
      editor.deselect();
      renderer.renderAll();
      updateNotesForActiveSlide();
    }
  }
});

// --- Speaker Notes ---
const notesTextarea = document.getElementById('notes-textarea');
const notesPanel = document.getElementById('notes-panel');
const notesResizeHandle = document.getElementById('notes-resize-handle');

function updateNotesForActiveSlide() {
  const slide = model.getActiveSlide();
  notesTextarea.value = slide ? (slide.notes || '') : '';
}

notesTextarea.addEventListener('input', () => {
  const slide = model.getActiveSlide();
  if (slide) slide.notes = notesTextarea.value;
});

// Update notes when slide changes
model.onChange((event) => {
  if (event.type === 'active-changed') {
    updateNotesForActiveSlide();
  }
});

// Drag handle to resize notes panel
let _notesDragState = null;
notesResizeHandle.addEventListener('mousedown', (e) => {
  e.preventDefault();
  _notesDragState = {
    startY: e.clientY,
    startHeight: notesPanel.offsetHeight,
  };
  document.body.style.cursor = 'ns-resize';
  document.body.style.userSelect = 'none';
});

document.addEventListener('mousemove', (e) => {
  if (!_notesDragState) return;
  const dy = _notesDragState.startY - e.clientY;
  const newHeight = Math.max(40, Math.min(window.innerHeight * 0.5, _notesDragState.startHeight + dy));
  notesPanel.style.height = newHeight + 'px';
  fitCanvasToEditor();
});

document.addEventListener('mouseup', () => {
  if (_notesDragState) {
    _notesDragState = null;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }
});

// --- Presenter Mode ---
const btnPresent = document.getElementById('btn-present');
const presenterOverlay = document.getElementById('presenter-overlay');
const presenterSlide = document.getElementById('presenter-slide');
const presenterSlideNum = document.getElementById('presenter-slide-num');
let presenterIndex = 0;
let _presenterKeyHandler = null;

function enterPresenter(fromBeginning) {
  if (model.slideCount === 0) return;
  presenterIndex = fromBeginning ? 0 : model.activeSlideIndex;
  presenterOverlay.style.display = 'flex';
  renderPresenterSlide();

  document.documentElement.requestFullscreen().then(() => {
    // Re-render after fullscreen is active to get correct dimensions
    setTimeout(() => renderPresenterSlide(), 100);
  }).catch(() => {});

  _presenterKeyHandler = (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      if (presenterIndex < model.slideCount - 1) {
        presenterIndex++;
        renderPresenterSlide();
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      if (presenterIndex > 0) {
        presenterIndex--;
        renderPresenterSlide();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      exitPresenter();
    }
  };
  document.addEventListener('keydown', _presenterKeyHandler);
}

function exitPresenter() {
  presenterOverlay.style.display = 'none';
  presenterSlide.innerHTML = '';
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  }
  if (_presenterKeyHandler) {
    document.removeEventListener('keydown', _presenterKeyHandler);
    _presenterKeyHandler = null;
  }
}

function renderPresenterSlide() {
  const { w: CANVAS_W, h: CANVAS_H } = getCanvasDimensions();
  presenterSlide.innerHTML = '';
  presenterSlide.style.width = CANVAS_W + 'px';
  presenterSlide.style.height = CANVAS_H + 'px';

  const slideData = model.slides[presenterIndex];
  if (!slideData) return;

  // Background
  const bg = slideData.background?.color || '#FFFFFF';
  if (bg.startsWith('linear-gradient') || bg.startsWith('radial-gradient')) {
    presenterSlide.style.background = bg;
  } else {
    presenterSlide.style.background = bg;
  }

  // Render elements using the renderer's _createElementDom
  for (const el of slideData.elements) {
    const dom = renderer._createElementDom(el, false);
    dom.style.cursor = 'default';
    presenterSlide.appendChild(dom);
  }

  // Scale slide to fit screen
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;
  const scale = Math.min(screenW / CANVAS_W, screenH / CANVAS_H);
  presenterSlide.style.transform = `scale(${scale})`;
  presenterSlide.style.transformOrigin = 'center center';

  presenterSlideNum.textContent = `${presenterIndex + 1} / ${model.slideCount}`;
}

const presentMenu = document.getElementById('present-menu');

btnPresent.addEventListener('click', (e) => {
  e.stopPropagation();
  const visible = presentMenu.style.display !== 'none';
  presentMenu.style.display = visible ? 'none' : 'block';
});

document.getElementById('present-from-start').addEventListener('click', () => {
  presentMenu.style.display = 'none';
  enterPresenter(true);
});

document.getElementById('present-from-current').addEventListener('click', () => {
  presentMenu.style.display = 'none';
  enterPresenter(false);
});

// Close menu when clicking elsewhere
document.addEventListener('click', () => {
  presentMenu.style.display = 'none';
});

// Exit presenter if fullscreen exits externally
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement && presenterOverlay.style.display !== 'none') {
    exitPresenter();
  }
});
