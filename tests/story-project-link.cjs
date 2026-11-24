'use strict';

const assert = require('node:assert/strict');
const manuscript = page => page.evaluate(() => localStorage.getItem(KEY));
const journal = page => page.evaluate(async () => {
  const db = await new Promise((resolve, reject) => {
    const opening = indexedDB.open('skazki-drawing-projects-v1');
    opening.onsuccess = () => resolve(opening.result);
    opening.onerror = () => reject(opening.error);
  });
  return new Promise((resolve, reject) => {
    const tx = db.transaction('storyLinks'), read = tx.objectStore('storyLinks').getAll();
    tx.oncomplete = () => { db.close(); resolve(read.result); };
    tx.onabort = () => { db.close(); reject(tx.error); };
  });
});

const abortJournalWrite = (page, phase) => page.evaluate(phase => {
  const put = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = function (value, key) {
    if (this.name === 'storyLinks' && value.phase === phase) {
      IDBObjectStore.prototype.put = put;
      this.transaction.abort();
      return null;
    }
    return put.call(this, value, key);
  };
}, phase);

const refuseLibraryWrite = page => page.evaluate(() => {
  const set = Storage.prototype.setItem;
  Storage.prototype.setItem = function (key, value) {
    if (key === KEY) {
      Storage.prototype.setItem = set;
      throw new DOMException('Synthetic quota', 'QuotaExceededError');
    }
    return set.call(this, key, value);
  };
});

module.exports = async function verifyStoryProjectLink(browser, url) {
  const page = await browser.newPage({viewport: {width: 1024, height: 768}, serviceWorkers: 'block'});
  try {
    await page.goto(url);
    await page.locator('#homeCreate').click();
    await page.locator('#childDraw').click();
    await page.locator('#drawingCanvas').click({position: {x: 85, y: 95}});
    await page.locator('#studioMore summary').click();
    await page.locator('#drawingSaveProject').click();
    await page.locator('#toast').filter({hasText: 'Копия сохранена'}).waitFor();
    const [original] = await page.evaluate(async () => (await studioProjectStore()).list());
    await page.locator('#drawingCancel').click();
    await page.locator('#home').click();
    await page.locator('#homeNewStory').click();
    await page.locator('#storyTitle').fill('Сказка с проектом');
    const body = page.locator('#storyBody');
    await body.fill('Начало сказки. Здесь будет рисунок.');
    await body.evaluate(input => { input.setSelectionRange(14, 14); input.blur(); });
    const before = await manuscript(page);
    const gallery = page.locator('#writerGallery'), status = page.locator('#storyProjectStatus');
    const prepare = async () => {
      await gallery.click();
      await page.locator('#writerArtShelf').getByRole('button', {name: 'Проекты рисунков', exact: true}).click();
      await page.locator('#storyProjectPreviewButton').click();
      await page.locator('#attachStoryProject').waitFor();
    };
    await prepare();
    const insert = page.locator('#attachStoryProject');
    assert.equal(await manuscript(page), before);
    assert.equal((await journal(page)).length, 0);
    await page.locator('#cancelStoryProject').click();
    assert.equal(await manuscript(page), before);
    await page.locator('#storyProjectPreviewButton').click();

    await abortJournalWrite(page, 'pending');
    await insert.click();
    await status.filter({hasText: 'Вставка не сохранилась'}).waitFor();
    assert.equal(await manuscript(page), before);
    assert.equal((await journal(page)).length, 0);

    await refuseLibraryWrite(page);
    await insert.click();
    await status.filter({hasText: 'Не удалось вставить рисунок'}).waitFor();
    assert.equal(await manuscript(page), before);
    const [pending] = await journal(page);
    assert.equal(pending.phase, 'pending');

    await abortJournalWrite(page, 'committed');
    await insert.click();
    await page.locator('#writerArtShelf').waitFor({state: 'hidden'});
    const inserted = await body.inputValue();
    assert.match(inserted, /^Начало сказки\.\n\[\[рисунок:1\]\]\n Здесь будет рисунок\.$/);
    assert.equal((await journal(page))[0].phase, 'pending');

    await page.reload();
    await page.locator('#homeWrite').click();
    assert.equal(await body.inputValue(), inserted);
    await prepare();
    await insert.click();
    await status.filter({hasText: 'Эта редакция уже в сказке'}).waitFor();
    assert.equal(await body.inputValue(), inserted);
    const [committed] = await journal(page);
    assert.equal(committed.id, pending.id);
    assert.equal(committed.phase, 'committed');
    assert.equal(committed.revision, original.revision);

    await gallery.click();
    await page.locator('#imageTray').getByRole('button', {name: 'Открыть слои', exact: true}).click();
    await page.locator('#drawingCanvas').waitFor();
    await page.getByRole('button', {name: 'К сказке', exact: true}).click();
    assert.equal(await body.inputValue(), inserted);
    assert.deepEqual((await page.evaluate(async () => (await studioProjectStore()).list()))[0], original);

    const picture = page.locator('#imageTray img').first();
    const firstPreview = await picture.getAttribute('src');
    await page.locator('#imageTray').getByRole('button', {name: 'Открыть слои', exact: true}).click();
    await page.locator('#drawingCanvas').click({position: {x: 165, y: 130}});
    await page.getByRole('button', {name: 'К сказке', exact: true}).click();
    assert.equal(await picture.getAttribute('src'), firstPreview, 'saving project layers does not automatically replace illustration');
    const [updated] = await page.evaluate(async () => (await studioProjectStore()).list());
    assert.notEqual(updated.revision, original.revision);

    await prepare();
    assert.equal(await insert.textContent(), 'Обновить в сказке');
    const previousState = await manuscript(page);
    await refuseLibraryWrite(page);
    await insert.click();
    await status.filter({hasText: 'Не удалось обновить иллюстрацию'}).waitFor();
    assert.equal(await manuscript(page), previousState);
    assert.equal(await picture.getAttribute('src'), firstPreview);

    await insert.click();
    await page.locator('#writerArtShelf').waitFor({state: 'hidden'});
    const secondPreview = await picture.getAttribute('src');
    assert.notEqual(secondPreview, firstPreview);
    assert.equal(await body.inputValue(), inserted);
    assert.equal(await page.locator('#imageTray img').count(), 1);
    const final = await journal(page);
    assert.equal(final.length, 2);
    assert.ok(final.some(link => link.revision === updated.revision && link.phase === 'committed'));
    const revert = page.locator('#imageTray').getByRole('button', {name: 'Вернуть прежний рисунок', exact: true});
    await revert.click();
    assert.equal(await picture.getAttribute('src'), firstPreview);
    await revert.click();
    assert.equal(await picture.getAttribute('src'), secondPreview);
    assert.equal(await body.inputValue(), inserted);
  } finally {
    await page.close();
  }
  console.log('PASS DATA02 linked illustration journal, failure recovery, in-place update and reversible illustration versions');
};
