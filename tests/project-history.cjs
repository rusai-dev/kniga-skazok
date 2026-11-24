'use strict';

const assert = require('node:assert/strict');

module.exports = async function verifyProjectHistory(browser, url) {
  const page = await browser.newPage({viewport: {width: 1024, height: 768}, serviceWorkers: 'block'});
  try {
    await page.goto(url);
    await page.locator('#homeCreate').click();
    await page.locator('#childDraw').click();
    await page.locator('#drawingCanvas').click({position: {x: 60, y: 70}});
    await page.locator('#studioMore summary').click();
    await page.locator('#drawingSaveProject').click();
    await page.locator('#toast').filter({hasText: 'Копия сохранена'}).waitFor();
    const [original] = await page.evaluate(async () => (await studioProjectStore()).list());
    await page.locator('#openProjects').click();
    const open = async () => {
      await page.locator('#projectShelf').getByRole('button', {name: original.title, exact: true}).click();
      await page.locator('#drawingStatus').filter({hasText: 'Продолжай свой сохранённый рисунок'}).waitFor();
    };
    await open();
    const results = await page.evaluate(async id => {
      const canvas = $('drawingCanvas'), initial = canvas.toDataURL();
      const bounds = canvas.getBoundingClientRect();
      const store = await studioProjectStore();
      for (let i = 0; i < 105; i++) {
        const where = {pointerId: 5, pointerType: 'pen', isPrimary: true, pressure: 0.6,
          clientX: bounds.left + 105 + (i % 15) * 17, clientY: bounds.top + 120 + Math.floor(i / 15) * 16};
        canvas.dispatchEvent(new PointerEvent('pointerdown', where));
        canvas.dispatchEvent(new PointerEvent('pointerup', {...where, pressure: 0, clientX: where.clientX + 4}));
      }
      const painted = canvas.toDataURL();
      const pendingRevision = (await store.list()).find(item => item.documentId === id).revision;
      return {initial, painted, pendingRevision};
    }, original.documentId);
    assert.notEqual(results.painted, results.initial);
    assert.equal(results.pendingRevision, original.revision, 'a burst does not write an intermediate revision');
    await page.locator('#drawingStatus').filter({hasText: 'Проект сохранён'}).waitFor();
    const archiveSize = await page.evaluate(async id => (await (await studioProjectStore()).read(id, true)).revisions.length, original.documentId);
    assert.equal(archiveSize, 2);

    const history = await page.evaluate(() => {
      const canvas = $('drawingCanvas'), undo = $('drawingUndo'), redo = $('drawingRedo');
      let undos = 0, redos = 0;
      while (!undo.disabled && undos < 110) { undo.click(); undos++; }
      const undone = canvas.toDataURL();
      while (!redo.disabled && redos < 110) { redo.click(); redos++; }
      return {undos, redos, undone, redone: canvas.toDataURL()};
    });
    assert.equal(history.undos, 105);
    assert.equal(history.redos, 105);
    assert.equal(history.undone, results.initial);
    assert.equal(history.redone, results.painted);

    await page.locator('#drawingSave').click();
    await open();
    assert.equal(await page.locator('#drawingCanvas').evaluate(canvas => canvas.toDataURL()), results.painted);
  } finally {
    await page.close();
  }
  console.log('PASS ST3/ST4 105 reversible tiled operations, complete pixel comparison, batched durable write and reopen');
};
