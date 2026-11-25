'use strict';

function createStudioProjectStore(database, digest, identity) {
  const dbName = 'skazki-drawing-projects-v1';
  const tables = ['documents', 'revisions', 'pixels'];
  const maximumArchiveRevisions = 2048;
  let connection;

  function open() {
    if (!connection) {
      connection = new Promise((resolve, reject) => {
        const request = database.open(dbName, 2);
        request.onupgradeneeded = () => {
          const db = request.result;
          for (const name of [...tables, 'storyLinks']) if (!db.objectStoreNames.contains(name)) db.createObjectStore(name);
        };
        request.onsuccess = () => {
          const db = request.result;
          db.onversionchange = () => { db.close(); connection = null; };
          resolve(db);
        };
        request.onerror = () => reject(request.error);
      }).catch(error => { connection = null; throw error; });
    }
    return connection;
  }

  async function transact(names, mode, run) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(names, mode);
      let result, failure;
      tx.oncomplete = () => resolve(result);
      tx.onabort = () => reject(failure || tx.error || Error('abort'));
      run(tx, value => { result = value; }, reason => { failure = Error(reason); tx.abort(); });
    });
  }

  const validId = value => typeof value === 'string' && value.length > 0 && value.length <= 180;
  const validScope = value => typeof value === 'string' && value.length > 0 && value.length <= 640;
  const isHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
  const blends = ['source-over', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'soft-light'];
  const layerMetadata = layer => ({name: layer.name || 'Слой', visible: layer.visible !== false,
    locked: layer.locked === true, opacity: layer.opacity ?? 1, blend: layer.blend || 'source-over',
    alphaLock: layer.alphaLock === true, clipping: layer.clipping === true,
    maskHash: layer.maskHash ?? null, maskEnabled: layer.maskEnabled !== false, maskInverted: layer.maskInverted === true,
    groupId: layer.groupId ?? null});
  const groupMetadata = group => ({id: group.id, name: group.name, visible: group.visible !== false, locked: group.locked === true});
  const isBlob = value => value instanceof Blob && value.type === 'image/png' && value.size > 0 && value.size <= 16777216;
  async function pixelHash(bytes) {
    const result = new Uint8Array(await digest('SHA-256', bytes));
    return Array.from(result, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  function validateDetail(input, writing = false) {
    const {schemaVersion, documentId, title, width, height, layers, activeLayerId, activeTarget, background, groups = [], referenceLayerId} = input;
    return schemaVersion === 1 && validId(documentId) && typeof title === 'string' && title.trim().length > 0 && title.length <= 120 &&
      Number.isInteger(width) && width > 0 && width <= 4096 && Number.isInteger(height) && height > 0 && height <= 4096 &&
      (background == null || typeof background === 'string' && /^#[a-f0-9]{6}$/i.test(background)) &&
      Array.isArray(layers) && layers.length > 0 && layers.length <= 12 &&
      layers.every(layer => layer && validId(layer.id) && (layer.name === undefined || typeof layer.name === 'string' && layer.name.length <= 80) &&
        (layer.visible === undefined || typeof layer.visible === 'boolean') && (layer.locked === undefined || typeof layer.locked === 'boolean') &&
        (layer.opacity === undefined || Number.isFinite(layer.opacity) && layer.opacity >= 0 && layer.opacity <= 1) &&
        (layer.blend === undefined || blends.includes(layer.blend)) &&
        (layer.maskHash == null || isHash(layer.maskHash)) &&
        ['alphaLock', 'clipping', 'maskEnabled', 'maskInverted'].every(field => layer[field] === undefined || typeof layer[field] === 'boolean')) &&
      new Set(layers.map(layer => layer.id)).size === layers.length &&
      validateGroups(layers, groups) &&
      (referenceLayerId == null || layers.some(layer => layer.id === referenceLayerId)) &&
      (activeLayerId === undefined || layers.some(layer => layer.id === activeLayerId)) &&
      (activeTarget === undefined || activeTarget === 'layer' || activeTarget === 'mask' &&
        layers.some(layer => layer.id === activeLayerId && (layer.maskHash || writing && layer.maskBlob)));
  }

  function validateGroups(layers, groups) {
    if (!Array.isArray(groups) || groups.length > layers.length || groups.some(group => !group || !validId(group.id) ||
      typeof group.name !== 'string' || !group.name.trim() || group.name.length > 80 ||
      ['visible', 'locked'].some(field => group[field] !== undefined && typeof group[field] !== 'boolean'))) return false;
    const names = new Set(groups.map(group => group.id));
    if (names.size !== groups.length) return false;
    const encountered = new Set();
    let previous = null;
    for (const layer of layers) {
      const id = layer.groupId ?? null;
      if (id !== previous && id !== null) {
        if (!names.has(id) || encountered.has(id)) return false;
        encountered.add(id);
      }
      previous = id;
    }
    return encountered.size === groups.length;
  }

  function addPixels(store, assets) {
    for (const [hash, bytes] of assets) {
      const existing = store.getKey(hash);
      existing.onsuccess = () => { if (existing.result === undefined) store.add(bytes, hash); };
    }
  }

  async function commit(input, expectedRevision) {
    if (!validateDetail(input, true) || (expectedRevision !== null && !validId(expectedRevision))) throw Error('project');
    const {documentId, title, width, height} = input;
    const layers = [];
    const assets = new Map();
    async function register(blob) {
      if (!isBlob(blob)) throw Error('pixels');
      const bytes = await blob.arrayBuffer();
      const hash = await pixelHash(bytes);
      assets.set(hash, bytes);
      return hash;
    }
    for (const layer of input.layers) {
      const hash = await register(layer.blob);
      const maskHash = layer.maskBlob ? await register(layer.maskBlob) : null;
      layers.push({id: layer.id, hash, ...layerMetadata({...layer, maskHash})});
    }
    const revision = identity();
    const outline = typeof input.outline === 'string' && input.outline.length <= 80 ? input.outline : null;
    const background = input.background === undefined ? '#fffdf7' : input.background;
    const groups = (input.groups || []).map(groupMetadata), referenceLayerId = input.referenceLayerId ?? null;

    return transact(tables, 'readwrite', (tx, done, abort) => {
      const documents = tx.objectStore('documents');
      const pixels = tx.objectStore('pixels');
      const revisions = tx.objectStore('revisions');
      const current = documents.get(documentId);
      current.onsuccess = () => {
        const head = current.result;
        if (head && head.schemaVersion !== 1) return abort('schema');
        if ((head?.revision ?? null) !== expectedRevision) return abort('conflict');
        const activeLayerId = input.activeLayerId || layers[0].id;
        const snapshot = {schemaVersion: 1, documentId, title, width, height, layers, outline, background, groups, referenceLayerId,
          activeLayerId, activeTarget: input.activeTarget || 'layer'};
        const write = () => {
          const originalHash = head?.originalHash || layers[0].hash;
          const updated = {...snapshot, revision, originalHash, updatedAt: Date.now()};
          addPixels(pixels, assets);
          revisions.add({...updated, parentRevision: expectedRevision}, revision);
          documents.put({schemaVersion: 1, documentId, title, revision, originalHash, updatedAt: updated.updatedAt}, documentId);
          done(updated);
        };
        if (!head) return write();
        const prior = revisions.get(head.revision);
        prior.onsuccess = () => {
          const saved = prior.result;
          if (!saved || !validateDetail(saved) || saved.documentId !== documentId || !isHash(saved.originalHash)) return abort('corrupt');
          if (saved.width !== width || saved.height !== height) return abort('dimensions');
          const {schemaVersion, documentId: storedId, title, layers, outline} = saved;
          const previous = {schemaVersion, documentId: storedId, title, width: saved.width, height: saved.height,
            layers: layers.map(layer => ({id: layer.id, hash: layer.hash, ...layerMetadata(layer)})), outline,
            background: saved.background === undefined ? '#fffdf7' : saved.background, groups: (saved.groups || []).map(groupMetadata),
            referenceLayerId: saved.referenceLayerId ?? null,
            activeLayerId: saved.activeLayerId || layers[0].id, activeTarget: saved.activeTarget || 'layer'};
          if (JSON.stringify(previous) === JSON.stringify(snapshot)) {
            done(saved);
          } else write();
        };
      };
    });
  }

  function list() {
    return transact(['documents'], 'readonly', (tx, done) => {
      const request = tx.objectStore('documents').getAll();
      request.onsuccess = () => done(request.result.sort((a, b) => b.updatedAt - a.updatedAt));
    });
  }

  function inventory() {
    return transact(tables, 'readonly', (tx, done) => {
      const documents = tx.objectStore('documents').count(), revisions = tx.objectStore('revisions').count();
      const pixels = tx.objectStore('pixels').openCursor();
      let bytes = 0, images = 0, unreadable = 0;
      pixels.onsuccess = () => {
        const image = pixels.result;
        if (!image) { done({documents: documents.result, revisions: revisions.result, images, bytes, unreadable}); return; }
        images++;
        if (image.value instanceof ArrayBuffer) bytes += image.value.byteLength;
        else unreadable++;
        image.continue();
      };
    });
  }

  function history(documentId, from = null) {
    return transact(['documents', 'revisions'], 'readonly', (tx, done, abort) => {
      const source = tx.objectStore('documents').get(documentId), revisions = tx.objectStore('revisions');
      source.onsuccess = () => {
        if (!source.result) { done({entries: [], next: null}); return; }
        const entries = [], visited = new Set();
        function visit(revision) {
          if (revision === null || entries.length === 24) { done({entries, next: revision}); return; }
          if (!validId(revision) || visited.has(revision)) return abort('corrupt');
          visited.add(revision);
          const finding = revisions.get(revision);
          finding.onsuccess = () => {
            const row = finding.result;
            if (!row || row.documentId !== documentId || row.revision !== revision || !Number.isFinite(row.updatedAt)) return abort('corrupt');
            entries.push({revision, updatedAt: row.updatedAt, original: row.parentRevision === null});
            visit(row.parentRevision);
          };
        }
        visit(from || source.result.revision);
      };
    });
  }

  async function read(documentId, includeHistory = false, revisionId = null) {
    const result = await transact(tables, 'readonly', (tx, done, abort) => {
      const document = tx.objectStore('documents').get(documentId);
      document.onsuccess = () => {
        const head = document.result;
        if (!head) return done(null);
        if (head.schemaVersion !== 1) return abort('schema');
        const chain = [], seen = new Set(), hashes = new Set([head.originalHash]);
        const revisions = tx.objectStore('revisions');
        function load(revisionId) {
          if (!validId(revisionId) || seen.has(revisionId)) return abort('corrupt');
          if (chain.length >= maximumArchiveRevisions) return abort('archive-size');
          seen.add(revisionId);
          const request = revisions.get(revisionId);
          request.onsuccess = () => {
            const detail = request.result;
            if (!detail || !validateDetail(detail) || detail.documentId !== documentId || detail.revision !== revisionId ||
                !isHash(detail.originalHash) || detail.originalHash !== head.originalHash ||
                detail.layers.some(layer => !isHash(layer.hash))) return abort('corrupt');
            chain.push(detail);
            for (const layer of detail.layers) {
              hashes.add(layer.hash);
              if (layer.maskHash) hashes.add(layer.maskHash);
            }
            if (includeHistory && detail.parentRevision !== null) { load(detail.parentRevision); return; }
            const pixels = new Map(), source = tx.objectStore('pixels');
            let total = 0;
            for (const hash of hashes) {
              const image = source.get(hash);
              image.onsuccess = () => {
                const bytes = image.result;
                if (!(bytes instanceof ArrayBuffer) || !bytes.byteLength || bytes.byteLength > 16777216) return abort('corrupt');
                total += bytes.byteLength;
                if (total > 29000000) return abort('archive-size');
                pixels.set(hash, bytes);
              };
            }
            done({detail: chain[0], revisions: chain.reverse(), pixels});
          };
        }
        load(revisionId || head.revision);
      };
    });
    if (result) {
      for (const [hash, bytes] of result.pixels) {
        if (await pixelHash(bytes) !== hash) throw Error('corrupt');
        result.pixels.set(hash, new Blob([bytes], {type: 'image/png'}));
      }
    }
    return result;
  }

  async function validateArchive(revisions, pixels) {
    if (!Array.isArray(revisions) || !revisions.length || revisions.length > maximumArchiveRevisions || !(pixels instanceof Map)) throw Error('archive');
    const first = revisions[0];
    let parent = null;
    const ids = new Set(), wanted = new Set();
    for (const detail of revisions) {
      if (!detail || !validateDetail(detail) || !validId(detail.revision) || ids.has(detail.revision) || detail.parentRevision !== parent ||
          detail.documentId !== first.documentId || detail.width !== first.width || detail.height !== first.height ||
          !isHash(detail.originalHash) || detail.originalHash !== first.originalHash ||
          !Number.isFinite(detail.updatedAt) || (detail.outline !== null && (typeof detail.outline !== 'string' || detail.outline.length > 80)) ||
          detail.layers.some(layer => !isHash(layer.hash))) throw Error('archive');
      ids.add(detail.revision);
      wanted.add(detail.originalHash);
      for (const layer of detail.layers) {
        wanted.add(layer.hash);
        if (layer.maskHash) wanted.add(layer.maskHash);
      }
      parent = detail.revision;
    }
    if (wanted.size !== pixels.size) throw Error('archive');
    let total = 0;
    for (const hash of wanted) {
      const bytes = pixels.get(hash);
      if (!(bytes instanceof ArrayBuffer) || !bytes.byteLength || bytes.byteLength > 16777216 || await pixelHash(bytes) !== hash) throw Error('archive');
      total += bytes.byteLength;
      if (total > 29000000) throw Error('archive-size');
    }
  }

  async function restore(revisions, pixels) {
    await validateArchive(revisions, pixels);
    const documentId = identity(), title = revisions[revisions.length - 1].title.slice(0, 110) + ' · копия';
    return transact(tables, 'readwrite', (tx, done) => {
      addPixels(tx.objectStore('pixels'), pixels);
      const history = tx.objectStore('revisions');
      let current, parentRevision = null;
      for (const snapshot of revisions) {
        const {width, height, outline, originalHash} = snapshot;
        const background = snapshot.background === undefined ? '#fffdf7' : snapshot.background;
        const revision = identity(), layers = snapshot.layers.map(layer => ({id: layer.id, hash: layer.hash, ...layerMetadata(layer)}));
        current = {schemaVersion: 1, documentId, title, width, height, layers, outline, background, originalHash, revision,
          groups: (snapshot.groups || []).map(groupMetadata), referenceLayerId: snapshot.referenceLayerId ?? null,
          parentRevision, updatedAt: snapshot.updatedAt, activeLayerId: snapshot.activeLayerId || layers[0].id, activeTarget: snapshot.activeTarget || 'layer'};
        history.add(current, revision);
        parentRevision = revision;
      }
      const head = {schemaVersion: 1, documentId, title, revision: current.revision, originalHash: current.originalHash, updatedAt: Date.now()};
      tx.objectStore('documents').add(head, documentId);
      done(head);
    });
  }

  function beginStoryLink(scope, documentId, revision) {
    if (!validScope(scope) || ![documentId, revision].every(validId)) return Promise.reject(Error('link'));
    const key = JSON.stringify([scope, documentId, revision]);
    return transact(['revisions', 'storyLinks'], 'readwrite', (tx, done, abort) => {
      const source = tx.objectStore('revisions').get(revision);
      source.onsuccess = () => {
        if (source.result?.documentId !== documentId) return abort('revision');
        const journal = tx.objectStore('storyLinks');
        const read = journal.get(key);
        read.onsuccess = () => {
          const existing = read.result;
          const now = Date.now();
          if (existing?.phase === 'pending' && existing.leaseUntil > now) return abort('link-busy');
          const prior = existing?.phase === 'pending' ? existing : {id: identity(), scope, documentId, revision, phase: 'pending', createdAt: now};
          const entry = {...prior, lease: identity(), leaseUntil: now+10000};
          journal.put(entry, key);
          done(entry);
        };
      };
    });
  }

  function finishStoryLink(receipt) {
    const {id, scope, documentId, revision} = receipt || {};
    if (!validScope(scope) || ![id, documentId, revision].every(validId)) return Promise.reject(Error('link'));
    return transact(['storyLinks'], 'readwrite', (tx, done) => {
      const key = JSON.stringify([scope, documentId, revision]);
      const journal = tx.objectStore('storyLinks'), read = journal.get(key);
      read.onsuccess = () => {
        const entry = read.result;
        if (entry?.id !== id) { done(false); return; }
        if (entry.phase === 'pending') journal.put({...entry, phase: 'committed', leaseUntil: 0}, key);
        done(true);
      };
    });
  }

  function releaseStoryLink(receipt, lease) {
    const {id, scope, documentId, revision} = receipt;
    return transact(['storyLinks'], 'readwrite', (tx, done) => {
      const key = JSON.stringify([scope, documentId, revision]);
      const journal = tx.objectStore('storyLinks'), read = journal.get(key);
      read.onsuccess = () => {
        const entry = read.result;
        if (entry?.id === id && entry.lease === lease && entry.phase === 'pending') journal.put({...entry, leaseUntil: 0}, key);
        done(true);
      };
    });
  }

  return {list, inventory, history, read, commit, validateArchive, restore, beginStoryLink, finishStoryLink, releaseStoryLink};
}
