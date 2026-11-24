'use strict';

// Both the confirmed sheet and its linked illustration are written through the
// same local library transaction. Legacy free drawings keep their existing key.
function storyStudio(form, from, host) {
  let state = from || { sheets: [], originals: [] };
  let current = null;
  let opening = 0;
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
    if (!Number.isInteger(saved)) return { offset: body.selectionStart, stale: false };
    if (context && text.slice(saved - before.length, saved + after.length) === context) return { offset: saved, stale: false };
    const match = context && text.indexOf(context);
    if (context && match >= 0 && text.indexOf(context, match + 1) < 0) return { offset: match + before.length, stale: false };
    return { offset: body.selectionStart, stale: Boolean(context || text) };
  }

  function rememberAnchor(sheet, offset) {
    sheet.anchor = offset;
    sheet.position = { before: body.value.slice(Math.max(0, offset - 32), offset), after: body.value.slice(offset, offset + 32) };
  }

  async function open(sheet = state.sheets.find(item => item.slot === undefined)) {
    const request = ++opening;
    if (!await host.prepare() || request !== opening) return;
    if (sheet?.slot !== undefined && sheet.base !== previewKey(sheet.slot)) {
      // A removed or replaced illustration must never receive an old edit.
      sheet = { ...sheet, slot: undefined, base: undefined };
    }
    if (sheet?.id !== current?.id || !current || sheet?.slot !== current.slot) {
      current = sheet ? { ...sheet } : { id: host.id() };
      form.loadDrawing(current.src, current.outline);
    }
    const anchor = anchorFor(current);
    if (!anchor.stale) rememberAnchor(current, anchor.offset);
    host.open({ ...current, anchor: anchor.offset });
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
    addButton(root, 'Проекты рисунков', async () => {
      if (await loadDrawingEngine() && root.isConnected) showStoryProjects(form, root);
    });
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
    if (!current) return false;
    const anchor = anchorFor(current);
    if (current.slot === undefined && anchor.stale && !confirm('Текст рядом с рисунком изменился. Вставить рисунок рядом с текущим положением курсора?')) return false;
    const slot = current.slot ?? host.free();
    if (slot >= 5) return host.insert(preview, false, anchor.offset);
    const originals = state.originals.slice();
    const prior = originals[slot];
    const id = current.slot === undefined ? current.id : (prior?.id || current.id);
    originals[slot] = {
      id,
      revision: host.id(),
      src,
      previewKey: drawingFingerprint(preview),
      previous: prior?.src || host.preview(slot) || undefined,
      previousPreview: host.preview(slot) || undefined,
      previousProject: prior?.project
    };
    const next = { originals, sheets: state.sheets.filter(sheet => sheet.id !== current.id) };
    const saved = write(next, () => current.slot === undefined ? host.insert(preview, false, anchor.offset) : host.replace(slot, preview));
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
      if (prior?.project && prior.previewKey === previewKey(slot)) {
        addButton(card, 'Открыть слои', async () => {
          if (await loadDrawingEngine() && card.isConnected) openStoryProject(form, prior.project, host.returnWriter);
        });
      }
      if (!prior?.previous || !prior.previousPreview || prior.previewKey !== previewKey(slot)) return;
      addButton(card, 'Вернуть прежний рисунок', () => {
        const originals = state.originals.slice();
        originals[slot] = {
          id: prior.id, revision: host.id(), src: prior.previous,
          previewKey: drawingFingerprint(prior.previousPreview),
          previous: prior.src, previousPreview: host.preview(slot), project: prior.previousProject, previousProject: prior.project
        };
        write({ ...state, originals }, () => host.replace(slot, prior.previousPreview));
        host.paint();
      }).className = 'cover-choice';
    });
  }

  function attachProject(receipt, src, offset, prior) {
    return writeStoryProject(state, host, write, previewKey, receipt, src, offset, prior);
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

  return {
    projectScope: host.scope,
    projectReceipts: slots => state.originals.flatMap((item, i) => item?.project && item.previewKey === previewKey(i) ? [slots ? {...item.project, slot: i} : item.project] : []),
    attachProject,
    get data() {
      const caret = [body.selectionStart, body.selectionEnd, body.scrollTop];
      return state.sheets.length || state.originals.some(Boolean) || caret.some(Boolean) ? { ...state, caret, direction: body.selectionDirection } : undefined;
    },
    restoreCaret() {
      if (!from?.caret) return;
      body.setSelectionRange(from.caret[0], from.caret[1], from.direction || 'none');
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
  const link = p => p === undefined || p && [p.id,p.documentId,p.revision,p.scope].every(x => typeof x === 'string' && x.length > 0 && x.length <= 640);
  return value && (value.caret === undefined || Array.isArray(value.caret) &&
    value.caret.length === 3 && value.caret.every(n => Number.isFinite(n) && n >= 0)) &&
    (value.direction === undefined || ['none', 'forward', 'backward'].includes(value.direction)) &&
    Array.isArray(value.sheets) && value.sheets.length <= 8 &&
    value.sheets.every(sheet => record(sheet) && (sheet.slot === undefined ||
      Number.isInteger(sheet.slot) && sheet.slot >= 0 && sheet.slot < 5)) &&
    new Set(value.sheets.map(sheet => sheet.id)).size === value.sheets.length &&
    Array.isArray(value.originals) && value.originals.length <= 5 &&
    value.originals.every(item => item === null || record(item) && typeof item.revision === 'string' && link(item.project) && link(item.previousProject) &&
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
      if (raw === null) return {};
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
      const next = src || null;
      const metadata = next && outline ? JSON.stringify({ key: outline, fingerprint: fingerprint(next) }) : null;
      let oldMetadata, wroteMetadata = false, wroteSource = false;
      try {
        oldMetadata = localStorage.getItem(outlineKey);
        // Write derived metadata first: failed metadata must never replace the only source image.
        if (metadata === null) localStorage.removeItem(outlineKey);
        else localStorage.setItem(outlineKey, metadata);
        wroteMetadata = true;
        if (localStorage.getItem(outlineKey) !== metadata || !same()) throw Error('drawing metadata conflict');
        if (next === null) localStorage.removeItem(legacyKey);
        else localStorage.setItem(legacyKey, next);
        wroteSource = true;
        if (localStorage.getItem(legacyKey) !== next) throw Error('drawing source unconfirmed');
        raw = next;
        return true;
      } catch (error) {
        // Best-effort rollback without overwriting a value changed by another tab.
        try {
          if (wroteSource && localStorage.getItem(legacyKey) === next) {
            if (raw === null) localStorage.removeItem(legacyKey);
            else localStorage.setItem(legacyKey, raw);
          }
          if (wroteMetadata && localStorage.getItem(outlineKey) === metadata) {
            if (oldMetadata === null) localStorage.removeItem(outlineKey);
            else localStorage.setItem(outlineKey, oldMetadata);
          }
        } catch (rollbackError) {}
        return false;
      }
    }
  };
}

function readImageBytes(blob) {
  if (typeof blob.arrayBuffer === 'function') return blob.arrayBuffer();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(Error('read'));
    reader.readAsArrayBuffer(blob);
  });
}

function jpegDimensions(view) {
  let start = 2;
  while (start + 3 < view.byteLength) {
    if (view.getUint8(start++) !== 0xff) break;
    while (start < view.byteLength && view.getUint8(start) === 0xff) start++;
    if (start + 2 >= view.byteLength) break;
    const marker = view.getUint8(start++);
    if (marker === 0 || marker === 0xda || marker === 0xd9) break;
    if (marker === 1) continue;
    const length = view.getUint16(start);
    if (length < 2 || start + length > view.byteLength) break;
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker) && length >= 8) {
      return {type: 'image/jpeg', width: view.getUint16(start + 5), height: view.getUint16(start + 3)};
    }
    start += length;
  }
}

function rasterImageHeader(view, size) {
  if (view.byteLength >= 2 && view.getUint16(0) === 0xffd8) return jpegDimensions(view);
  if (view.byteLength < 20) return;
  if (view.byteLength >= 33 && view.getUint32(0) === 0x89504e47 && view.getUint32(4) === 0x0d0a1a0a &&
      view.getUint32(8) === 13 && view.getUint32(12) === 0x49484452) {
    return {type: 'image/png', width: view.getUint32(16), height: view.getUint32(20)};
  }
  const riffEnd = view.getUint32(4, true) + 8;
  if (view.getUint32(0) !== 0x52494646 || view.getUint32(8) !== 0x57454250 || riffEnd > size) return;
  const chunk = view.getUint32(12), length = view.getUint32(16, true), type = 'image/webp';
  if (length + 20 > riffEnd) return;
  if (chunk === 0x56503858 && length === 10 && view.byteLength >= 30) {
    const dimension = offset => 1 + view.getUint16(offset, true) + (view.getUint8(offset + 2) << 16);
    return {type, width: dimension(24), height: dimension(27)};
  }
  if (chunk === 0x5650384c && length >= 5 && view.byteLength >= 25 && view.getUint8(20) === 0x2f) {
    const bits = view.getUint32(21, true);
    return {type, width: 1 + (bits & 0x3fff), height: 1 + ((bits >>> 14) & 0x3fff)};
  }
  if (chunk === 0x56503820 && length >= 10 && view.byteLength >= 30 && view.getUint8(23) === 0x9d && view.getUint16(24) === 0x012a) {
    return {type, width: view.getUint16(26, true) & 0x3fff, height: view.getUint16(28, true) & 0x3fff};
  }
}

function allowedImageDimensions(width, height) {
  return width > 0 && height > 0 && Math.max(width, height) <= 8192 && width * height <= 16777216;
}

function imageMime(file) {
  return file.type.split(';', 1)[0].trim().toLowerCase();
}

async function inspectStoryImage(file) {
  if (!file || !file.size || file.size > 15000000) throw Error('size');
  const prefix = new DataView(await readImageBytes(file.slice(0, 65536)));
  let info = rasterImageHeader(prefix, file.size);
  if (!info && file.size > prefix.byteLength && prefix.getUint16(0) === 0xffd8) {
    info = rasterImageHeader(new DataView(await readImageBytes(file)), file.size);
  }
  const mime = imageMime(file);
  const type = ({'image/jpg': 'image/jpeg', 'image/pjpeg': 'image/jpeg', 'image/x-png': 'image/png'})[mime] || mime;
  if (!info || (type && type !== info.type)) throw Error('unsupported');
  if (!allowedImageDimensions(info.width, info.height)) throw Error('dimensions');
  return file.type === info.type ? file : file.slice(0, file.size, info.type);
}

const approvedStoryVectors = {
  'library-lantern': '44ee2f65f973b1b542022b525c99c76455e6fe07e71b2ab4e7dd0bbfea8a670b',
  'star-journey': 'a164908915041480242c15d8f62e311ccde77c0fb421a9fd386b5b13227ac37c'
};

async function inspectStoryVector(cover, file) {
  if (!approvedStoryVectors[cover] || imageMime(file) !== 'image/svg+xml' || file.size > 6000) throw Error('cover');
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', await readImageBytes(file)));
  const hex = Array.from(hash, byte => byte.toString(16).padStart(2, '0')).join('');
  if (hex !== approvedStoryVectors[cover]) throw Error('cover');
  return file;
}

// Approved watercolors replace the decorative navigation art, never the work surface.
// Keep the original vector underneath until the new thumbnail really decodes.
document.addEventListener('DOMContentLoaded', () => {
  const draw = (root, motif, suffix = '-240') => {
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
    img.src = './assets/author/studio/art-' + motif + suffix + '.webp';
  };
  draw(document.getElementById('myBooksArt'), 'n03-owl-library', '-entry184');
  draw(document.getElementById('createArt'), 'n02-rabbit-painting', '-entry184');
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
    !otherInput && (writing || (wasTyping && form.querySelector('#writerArtShelf')?.hidden));
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

// The left page remains the measured page and the saved reading position.
function paintFacingPage(spread, text, art, parts, next) {
  let facing = spread.querySelector('.facing-page');
  if (!spread.classList.contains('facing-pages') || !next) {
    facing?.remove();
    return;
  }
  const part = parts[next.scene];
  const page = (part.image ? art : text).cloneNode(false);
  page.removeAttribute('id');
  page.hidden = false;
  page.classList.add('facing-page');
  if (part.image) {
    const image = new Image();
    image.alt = 'Иллюстрация ' + part.number;
    image.src = part.image;
    page.append(image);
  } else {
    page.innerHTML = storyReaderSlice(part,next.start,next.end);
  }
  if (facing) facing.replaceWith(page);
  else spread.append(page);
}

function updateWriterEntry() {
  const title = document.querySelector('#homeWrite strong');
  if (title) title.textContent = ownDraftChoices(data,OWN).length || ownEditChoices(data.stories,data.edits,OWN).length
    ? 'Продолжить сказку' : 'Пишу свою сказку';
}
updateWriterEntry();
