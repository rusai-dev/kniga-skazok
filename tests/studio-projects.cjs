'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const {createHash} = require('node:crypto');
const legacyDraftKey = 'skazki-unfinished-drawing-v1';

async function paint(page, position, color) {
  const canvas = page.locator('#drawingCanvas');
  await canvas.waitFor();
  await page.evaluate(color => {
    $('drawingCustom').value = color;
    $('drawingCustom').dispatchEvent(new Event('input', {bubbles: true}));
  }, color);
  await canvas.click({position});
}

async function copyProject(page) {
  await page.locator('#studioMore summary').click();
  await page.locator('#drawingSaveProject').click();
  await page.locator('#toast').filter({hasText: 'Копия сохранена'}).waitFor({state: 'attached'});
}

async function openProject(page, name) {
  await page.locator('#openProjects').click();
  await page.locator('#projectShelf').getByRole('button', {name, exact: true}).click();
  await page.locator('#drawingStatus').filter({hasText: 'Продолжай свой сохранённый рисунок'}).waitFor({state: 'visible'});
}

const projects = page => page.evaluate(async () => (await studioProjectStore()).list());
const legacy = page => page.evaluate(key => localStorage.getItem(key), legacyDraftKey);
const png = page => page.locator('#drawingCanvas').evaluate(canvas => canvas.toDataURL('image/png'));

const storedCounts = page => page.evaluate(async () => {
  const db = await new Promise((resolve, reject) => {
    const request = indexedDB.open('skazki-drawing-projects-v1');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return new Promise((resolve, reject) => {
    const names = ['documents', 'revisions', 'pixels'];
    const tx = db.transaction(names, 'readonly');
    const counts = names.map(name => tx.objectStore(name).count());
    tx.oncomplete = () => { db.close(); resolve(counts.map(request => request.result)); };
    tx.onabort = () => { db.close(); reject(tx.error); };
  });
});

module.exports = async function verifyStudioProjects(browser, url) {
  const context = await browser.newContext({viewport: {width: 1024, height: 768}, serviceWorkers: 'block'});
  try {
    const first = await context.newPage();
    await first.goto(url);
    await first.locator('#homeCreate').click();
    await first.locator('#childDraw').click();
    await paint(first, {x: 50, y: 60}, '#993311');
    const priorDraft = await legacy(first), originalPng = await png(first);
    await copyProject(first);
    assert.equal(await legacy(first), priorDraft);
    const [created] = await projects(first);
    const originalAsset = await first.evaluate(async documentId => {
      const result = await (await studioProjectStore()).read(documentId);
      return projectDataUrl(result.pixels.get(result.detail.originalHash));
    }, created.documentId);
    assert.deepEqual(await storedCounts(first), [1, 1, 1]);
    await openProject(first, created.title);
    assert.equal(await png(first), originalPng);

    const second = await context.newPage();
    await second.goto(url);
    await second.locator('#homeCreate').click();
    await second.locator('#childDraw').click();
    await openProject(second, created.title);
    assert.deepEqual(await storedCounts(first), [1, 1, 1], 'opening in two tabs never creates a revision or pixel blob');

    await paint(first, {x: 100, y: 120}, '#113366');
    await first.locator('#drawingStatus').filter({hasText: 'Проект сохранён'}).waitFor({state: 'visible'});
    const [confirmed] = await projects(first);
    assert.notEqual(confirmed.revision, created.revision);
    assert.equal(confirmed.originalHash, created.originalHash);
    await paint(second, {x: 150, y: 160}, '#772299');
    await second.locator('#drawingStatus').filter({hasText: 'Проект изменился в другой вкладке'}).waitFor({state: 'visible'});
    assert.deepEqual(await projects(first), [confirmed]);
    assert.deepEqual(await storedCounts(first), [1, 2, 2]);
    await copyProject(second);
    assert.equal((await projects(first)).length, 2);
    assert.equal(await legacy(first), priorDraft, 'project edits and conflicts preserve the legacy draft');

    await first.evaluate(() => {
      const original = IDBObjectStore.prototype.put;
      IDBObjectStore.prototype.put = function (value, key) {
        if (this.name === 'documents' && this.transaction.db.name === 'skazki-drawing-projects-v1') {
          IDBObjectStore.prototype.put = original;
          this.transaction.abort();
          return null;
        }
        return original.call(this, value, key);
      };
    });
    const beforeAbort = await storedCounts(first);
    await paint(first, {x: 200, y: 180}, '#226633');
    await first.locator('#drawingStatus').filter({hasText: 'Не удалось сохранить проект'}).waitFor({state: 'visible'});
    assert.deepEqual(await storedCounts(first), beforeAbort, 'abort rolls back both the revision and the pixel blob');
    assert.ok(await first.locator('#drawingCanvas').isVisible());
    const retriedPng = await png(first);
    await first.locator('#drawingSave').click();
    await first.locator('#projectShelf').waitFor({state: 'visible'});
    const retried = (await projects(first)).find(item => item.documentId === created.documentId);
    assert.notEqual(retried.revision, confirmed.revision);
    assert.equal(retried.originalHash, created.originalHash);

    const downloaded = first.waitForEvent('download');
    await first.getByRole('button', {name: 'Скачать архив «' + created.title + '»', exact: true}).click();
    const download = await downloaded;
    const file = await fs.readFile(await download.path());
    const archive = JSON.parse(file.toString());
    assert.equal(archive.kind, 'skazki-drawing-project');
    assert.deepEqual(archive.revisions.map(revision => revision.revision), [created.revision, confirmed.revision, retried.revision]);
    assert.ok(archive.assets.some(pixel => pixel.hash === created.originalHash && pixel.data === originalAsset));
    for (const pixel of archive.assets) assert.equal(createHash('sha256').update(Buffer.from(pixel.data.split(',')[1], 'base64')).digest('hex'), pixel.hash);

    const clean = await browser.newContext({viewport: {width: 1024, height: 768}, serviceWorkers: 'block'});
    try {
      const restored = await clean.newPage();
      await restored.goto(url);
      await restored.locator('#homeCreate').click();
      await restored.locator('#childDraw').click();
      await restored.locator('#openProjects').click();
      await restored.locator('#projectImport:enabled').waitFor();
      const input = restored.locator('#projectArchiveFile');
      const ready = restored.locator('#confirmProjectImport');
      const upload = buffer => input.setInputFiles({name: 'project.json', mimeType: 'application/json', buffer});
      await upload(file);
      await ready.waitFor({state: 'visible'});
      assert.deepEqual(await storedCounts(restored), [0, 0, 0], 'archive preview is read-only');
      await restored.locator('#cancelProjectImport').click();
      assert.deepEqual(await storedCounts(restored), [0, 0, 0]);

      const changed = structuredClone(archive), bytes = Buffer.from(changed.assets[0].data.split(',')[1], 'base64');
      bytes[40] ^= 1;
      changed.assets[0].data = 'data:image/png;base64,' + bytes.toString('base64');
      await upload(Buffer.from(JSON.stringify(changed)));
      await restored.locator('#projectShelfStatus').filter({hasText: 'Не удалось проверить архив'}).waitFor();
      assert.deepEqual(await storedCounts(restored), [0, 0, 0]);

      const undecodable = structuredClone(archive), badAsset = undecodable.assets[0];
      const complete = Buffer.from(badAsset.data.split(',')[1], 'base64');
      const truncated = Buffer.concat([complete.subarray(0, 33), complete.subarray(-12)]);
      const badHash = createHash('sha256').update(truncated).digest('hex'), replacedHash = badAsset.hash;
      badAsset.hash = badHash;
      badAsset.data = 'data:image/png;base64,' + truncated.toString('base64');
      for (const revision of undecodable.revisions) {
        if (revision.originalHash === replacedHash) revision.originalHash = badHash;
        for (const layer of revision.layers) if (layer.hash === replacedHash) layer.hash = badHash;
      }
      await upload(Buffer.from(JSON.stringify(undecodable)));
      await restored.locator('#projectShelfStatus').filter({hasText: 'Не удалось проверить архив'}).waitFor();
      assert.deepEqual(await storedCounts(restored), [0, 0, 0], 'matching hashes cannot make a malformed PNG importable');

      await upload(file);
      await ready.click();
      await restored.locator('#projectShelf button').first().waitFor();
      const [copied] = await projects(restored);
      const result = await restored.evaluate(async id => {
        const saved = await (await studioProjectStore()).read(id, true);
        return saved.revisions.map(revision => ({original: revision.originalHash, layer: revision.layers[0].hash}));
      }, copied.documentId);
      assert.notEqual(copied.documentId, created.documentId);
      assert.deepEqual(result, archive.revisions.map(revision => ({original: revision.originalHash, layer: revision.layers[0].hash})));
      await restored.locator('#projectShelf').getByRole('button', {name: copied.title, exact: true}).click();
      await restored.locator('#drawingStatus').filter({hasText: 'Продолжай свой сохранённый рисунок'}).waitFor({state: 'visible'});
      assert.equal(await png(restored), retriedPng);
    } finally {
      await clean.close();
    }

    const story = await context.newPage();
    await story.goto(url);
    await story.locator('#homeNewStory').click();
    await story.locator('#storyTitle').fill('Проект к сказке');
    await story.locator('#storyBody').fill('Синтетическая сказка.');
    await story.locator('#drawStory').click();
    await paint(story, {x: 60, y: 70}, '#334477');
    const savedManuscript = await story.evaluate(() => localStorage.getItem(KEY));
    await copyProject(story);
    assert.ok((await projects(story)).some(item => item.title === 'Проект к сказке'));
    assert.equal(await story.evaluate(() => localStorage.getItem(KEY)), savedManuscript);
    assert.equal(await legacy(story), priorDraft);

    const beforeHistory = await projects(first);
    await first.getByRole('button', {name: 'История «'+created.title+'»', exact: true}).click();
    const sourceRevision = first.getByRole('button', {name: 'Исходная редакция', exact: true});
    await sourceRevision.click();
    await first.locator('#projectRevisionPreview').waitFor();
    assert.deepEqual(await projects(first), beforeHistory);
    await first.locator('#cancelProjectRevision').click();
    assert.deepEqual(await projects(first), beforeHistory);
    await sourceRevision.click();
    await first.locator('#copyProjectRevision').click();
    await first.locator('#projectShelf').waitFor();
    const added = (await projects(first)).find(item => !beforeHistory.some(previous=>previous.documentId===item.documentId));
    const baseRevision = await first.evaluate(async id => (await (await studioProjectStore()).read(id)).detail.layers[0].hash, added.documentId);
    assert.equal(baseRevision, created.originalHash);
    assert.ok((await projects(first)).some(item => item.documentId === retried.documentId && item.revision === retried.revision));
  } finally {
    await context.close();
  }
  console.log('PASS G21–G23 local projects, two-tab CAS, abort, original PNG, artwork routes and full archive round-trip');
};
