'use strict';

// Both the confirmed sheet and its linked illustration are written through the
// same local library transaction. Legacy free drawings keep their existing key.
function storyStudio(form, from, host) {
  let state = from || { sheets: [], originals: [] };
  let current = null;
  const body = form.querySelector('#storyBody');

  function write(next, save = host.save) {
    const previous = state;
    state = next;
    if (save()) return true;
    state = previous;
    return false;
  }

  function previewKey(slot) {
    const src = host.preview(slot);
    return src ? drawingFingerprint(src) : null;
  }

  function anchorFor(sheet) {
    const text = body.value;
    const { before = '', after = '' } = sheet.position || {};
    const context = before + after;
    const saved = sheet.anchor;
    if (context && text.slice(saved - before.length, saved + after.length) === context) return saved;
    const match = context && text.indexOf(context);
    if (context && match >= 0 && text.indexOf(context, match + 1) < 0) return match + before.length;
    return body.selectionStart;
  }

  function open(sheet = state.sheets.find(item => item.slot === undefined)) {
    if (sheet?.slot !== undefined && sheet.base !== previewKey(sheet.slot)) {
      // A removed or replaced illustration must never receive an old edit.
      sheet = { ...sheet, slot: undefined, base: undefined };
    }
    if (sheet?.id !== current?.id || !current || sheet?.slot !== current.slot) {
      current = sheet ? { ...sheet } : { id: host.id() };
      form.loadDrawing(current.src, current.outline);
    }
    current.anchor = anchorFor(current);
    const pos = current.anchor;
    current.position = { before: body.value.slice(Math.max(0, pos - 32), pos), after: body.value.slice(pos, pos + 32) };
    host.open(current);
  }

  function addButton(root, title, action) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = title;
    button.onclick = action;
    root.append(button);
    return button;
  }

  function menu(root) {
    state.sheets.forEach((sheet, index) => {
      addButton(root, sheet.slot === undefined ? 'Продолжить рисунок ' + (index + 1) : 'Продолжить правку ' + (sheet.slot + 1), () => open(sheet));
      const preview = document.createElement('img');
      preview.alt = '';
      preview.loading = 'lazy';
      preview.src = sheet.src;
      root.lastElementChild.prepend(preview);
    });
    addButton(root, 'Новый рисунок', () => open({ id: host.id() }));
    const legacy = host.legacy();
    if (legacy) addButton(root, 'Копировать незаконченный рисунок', () => open({ id: host.id(), src: legacy }));
  }

  function edit(slot, preview) {
    const base = previewKey(slot);
    const saved = state.sheets.find(sheet => sheet.slot === slot && sheet.base === base);
    if (saved) open(saved);
    else {
      const original = state.originals[slot];
      open({ id: host.id(), slot, base, src: original?.previewKey === base ? original.src : preview });
    }
  }

  function store(src, outline) {
    const sheets = state.sheets.filter(sheet => sheet.id !== current.id);
    const next = { ...current, src, outline, revision: host.id() };
    if (src) {
      if (sheets.length >= 8) return false;
      sheets.unshift(next);
    }
    if (!write({ ...state, sheets })) return false;
    current = next;
    return true;
  }

  function finish(preview, src) {
    const slot = current.slot ?? host.free();
    if (slot >= 5) return host.insert(preview);
    const originals = state.originals.slice();
    const prior = originals[slot];
    const id = current.slot === undefined ? current.id : (prior?.id || current.id);
    originals[slot] = {
      id,
      revision: host.id(),
      src,
      previewKey: drawingFingerprint(preview),
      previous: prior?.src || host.preview(slot) || undefined,
      previousPreview: host.preview(slot) || undefined
    };
    const next = { originals, sheets: state.sheets.filter(sheet => sheet.id !== current.id) };
    const saved = write(next, () => current.slot === undefined ? host.insert(preview) : host.replace(slot, preview));
    if (saved) current = null;
    host.paint();
    return saved;
  }

  function remove(slot, preview) {
    const original = state.originals[slot];
    if (!original || original.previewKey !== drawingFingerprint(preview)) return host.save();
    const sheets = state.sheets.map(sheet => sheet.slot === slot ? { ...sheet, slot: undefined, base: undefined } : sheet);
    const kept = [{ id: host.id(), src: original.src, revision: host.id() }];
    if (original.previous && original.previous !== original.src) kept.push({ id: host.id(), src: original.previous, revision: host.id() });
    if (sheets.length + kept.length > 8) {
      toast('Черновики заполнены. Попроси взрослого. Рисунок остаётся в книге.');
      return false;
    }
    const originals = state.originals.slice();
    originals[slot] = null;
    return write({ originals, sheets: [...kept, ...sheets] });
  }

  function revisions(tray) {
    Array.from(tray.children).forEach(card => {
      const slot = Number(card.querySelector('[data-picture]').dataset.picture);
      const prior = state.originals[slot];
      if (!prior?.previous || !prior.previousPreview || prior.previewKey !== previewKey(slot)) return;
      addButton(card, 'Вернуть прежний рисунок', () => {
        const originals = state.originals.slice();
        originals[slot] = {
          id: prior.id, revision: host.id(), src: prior.previous,
          previewKey: drawingFingerprint(prior.previousPreview),
          previous: prior.src, previousPreview: host.preview(slot)
        };
        write({ ...state, originals }, () => host.replace(slot, prior.previousPreview));
        host.paint();
      }).className = 'cover-choice';
    });
  }

  function result(bookId) {
    const card = document.querySelector('[data-own-book-id="' + CSS.escape(bookId) + '"]');
    if (!card) return;
    const note = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = 'Моя книга готова';
    summary.style.minHeight = '44px';
    note.append(summary);
    note.addEventListener('toggle', () => {
      if (!note.open || note.children.length > 1) return;
      if (fget('skazki-studio-motif') !== 'off') {
        const picture = new Image(120, 120);
        picture.alt = '';
        picture.decoding = 'async';
        picture.src = './assets/author/studio/art-n04-hedgehog-book-show-240.webp';
        picture.onerror = () => picture.remove();
        note.append(picture);
      }
      addButton(note, 'Посмотреть мою книгу', () => card.querySelector('.own-read')?.click());
    });
    card.append(note);
  }

  const tools = form.querySelector('.studio-tools');
  addButton(tools, 'К сказке', () => form.querySelector('#drawingCancel').click());
  tools.lastElementChild.id = 'studioBackFull';

  return {
    get data() {
      const caret = [body.selectionStart, body.selectionEnd, body.scrollTop];
      return state.sheets.length || state.originals.some(Boolean) || caret.some(Boolean) ? { ...state, caret } : undefined;
    },
    restoreCaret() {
      if (!from?.caret) return;
      body.setSelectionRange(from.caret[0], from.caret[1]);
      body.scrollTop = from.caret[2];
    },
    get pending() { return state.sheets.some(sheet => sheet.slot === undefined); },
    get editing() { return current?.slot !== undefined; },
    open, edit, menu, store, finish, remove, revisions, result
  };
}

function validStoryStudio(value) {
  const image = src => typeof src === 'string' && src.length <= 3000000 &&
    /^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(src);
  const record = item => item && typeof item.id === 'string' && item.id.length <= 180 && image(item.src);
  return value && (value.caret === undefined || Array.isArray(value.caret) &&
    value.caret.length === 3 && value.caret.every(n => Number.isFinite(n) && n >= 0)) &&
    Array.isArray(value.sheets) && value.sheets.length <= 8 &&
    value.sheets.every(sheet => record(sheet) && (sheet.slot === undefined ||
      Number.isInteger(sheet.slot) && sheet.slot >= 0 && sheet.slot < 5)) &&
    new Set(value.sheets.map(sheet => sheet.id)).size === value.sheets.length &&
    Array.isArray(value.originals) && value.originals.length <= 5 &&
    value.originals.every(item => item === null || record(item) && typeof item.revision === 'string' &&
      (item.previous === undefined || image(item.previous)) &&
      (item.previousPreview === undefined || image(item.previousPreview)));
}

function drawingStorage(legacyKey, outlineKey, story, fingerprint) {
  let raw = null;
  try { if (!story) raw = localStorage.getItem(legacyKey); } catch (error) {}
  const same = () => {
    try { return localStorage.getItem(legacyKey) === raw; }
    catch (error) { return false; }
  };
  return {
    current: () => !!story || same(),
    load() {
      if (!raw) return {};
      let outline = null;
      try {
        const meta = JSON.parse(localStorage.getItem(outlineKey) || 'null');
        if (meta?.fingerprint === fingerprint(raw)) outline = meta.key;
      } catch (error) {}
      return { src: raw, outline };
    },
    store(src, outline) {
      if (story) return story.store(src, outline);
      if (!same()) return false;
      if (src) localStorage.setItem(legacyKey, src);
      else localStorage.removeItem(legacyKey);
      if (localStorage.getItem(legacyKey) !== src) return false;
      raw = src;
      if (outline && src) localStorage.setItem(outlineKey, JSON.stringify({ key: outline, fingerprint: fingerprint(src) }));
      else localStorage.removeItem(outlineKey);
      return true;
    }
  };
}

// Approved watercolors replace the decorative navigation art, never the work surface.
// Keep the original vector underneath until the new thumbnail really decodes.
document.addEventListener('DOMContentLoaded', () => {
  const draw = (root, motif) => {
    if (!root || root.querySelector('.studio-entry-watercolor')) return;
    const img = new Image(240, 240);
    img.alt = '';
    img.className = 'studio-entry-watercolor';
    img.hidden = true;
    img.decoding = 'async';
    img.onload = () => { if (img.naturalWidth) img.hidden = false; };
    img.onerror = () => img.remove();
    root.classList.add('studio-entry-art');
    root.append(img);
    img.src = './assets/author/studio/art-' + motif + '-240.webp';
  };
  draw(document.getElementById('myBooksArt'), 'n03-owl-library');
  draw(document.getElementById('createArt'), 'n02-rabbit-painting');
  const creative = document.getElementById('creativeHome');
  const paint = () => {
    if (creative.hidden) return;
    for (const [key, motif] of [['childWrite','n01-squirrel-writing-room'],['childDraw','n02-rabbit-painting'],['childBooks','n04-hedgehog-book-show']]) {
      draw(document.querySelector('#'+key+' .child-picture'), motif);
    }
  };
  // Run after the synchronous route has rendered the original SVG fallback.
  new MutationObserver(paint).observe(creative, { attributes: true, attributeFilter: ['hidden'] });
  paint();
});

// Safari reports the space above its keyboard in layout-viewport coordinates.
let writerCaretTimer = 0;
function fitStoryViewport(form, dialog, viewport) {
  if (!form) return;
  const body = form.querySelector('#storyBody');
  const title = form.querySelector('#storyTitle');
  const field = document.activeElement;
  const writing = field === body || field === title;
  const otherInput = form.contains(field) && field.matches('input, textarea, select, [contenteditable="true"]') && !writing;
  const wasTyping = form.classList.contains('keyboard-writing');
  const root = document.documentElement;
  const on = dialog.open && !dialog.classList.contains('drawing-focus') && viewport &&
    Math.max(innerHeight, root.clientHeight) - viewport.height * (viewport.scale || 1) > 32 &&
    !otherInput && (writing || wasTyping);
  form.classList.toggle('keyboard-writing', !!on);
  form.classList.toggle('keyboard-title', !!on && (field === title || (!writing && form.classList.contains('keyboard-title'))));

  let changed = !!on !== wasTyping;
  if (on) {
    const values = {
      top: Math.max(0, viewport.offsetTop || 0),
      left: Math.max(0, viewport.offsetLeft || 0),
      width: viewport.width || root.clientWidth,
      height: Math.floor(viewport.height)
    };
    for (const [key, size] of Object.entries(values)) {
      const name = '--writer-' + key;
      const value = size + 'px';
      if (dialog.style.getPropertyValue(name) === value) continue;
      dialog.style.setProperty(name, value);
      changed = true;
    }
  }
  if (changed) {
    clearTimeout(writerCaretTimer);
    writerCaretTimer = setTimeout(() => {
      if (dialog.open && document.activeElement === body) keepWriterCaretVisible(body);
    }, 60);
  }
}

// Measure the wrapped insertion point without moving the selection or focusing
// another node. Run once after the viewport has settled, never during typing.
function writerCaretBounds(body) {
  const caret = body.selectionDirection === 'backward' ? body.selectionStart : body.selectionEnd;
  const style = getComputedStyle(body);
  const mirror = document.createElement('div');
  mirror.style.cssText = 'position:fixed;inset:0 auto auto 0;visibility:hidden;pointer-events:none;box-sizing:border-box;white-space:pre-wrap';
  for (const key of ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'letterSpacing', 'wordSpacing', 'lineHeight', 'textIndent', 'overflowWrap',
    'wordBreak', 'tabSize', 'padding', 'direction', 'textAlign']) mirror.style[key] = style[key];
  mirror.style.width = body.clientWidth + 'px';
  const rest = document.createElement('span');
  rest.textContent = body.value.slice(caret) || '\u200b';
  mirror.append(document.createTextNode(body.value.slice(0, caret)), rest);
  document.body.append(mirror);
  const first = rest.getClientRects()[0];
  const top = first ? first.top - mirror.getBoundingClientRect().top : 0;
  const height = parseFloat(style.lineHeight) || parseFloat(style.fontSize);
  mirror.remove();
  return { top, bottom: top + height };
}

function keepWriterCaretVisible(body) {
  if (!body.clientHeight || body.scrollHeight <= body.clientHeight) return;
  const { top, bottom } = writerCaretBounds(body);
  const inset = 4;
  if (top < body.scrollTop + inset) body.scrollTop = Math.max(0, top - inset);
  else if (bottom > body.scrollTop + body.clientHeight - inset) body.scrollTop = bottom - body.clientHeight + inset;
}
