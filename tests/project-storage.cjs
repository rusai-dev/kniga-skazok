'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');

module.exports = async function verifyProjectStorage(browser, url) {
  const page = await browser.newPage({viewport: {width: 1024, height: 768}, serviceWorkers: 'block'});
  try {
    await page.goto(url);
    await page.locator('#homeCreate').click();
    await page.locator('#childDraw').click();
    await page.locator('#openProjects').click();
    await page.locator('#newProject').click();
    await page.locator('#newProjectTitle').fill('Длинная история');
    await page.locator('#newProjectSize').selectOption('720×480');
    await page.locator('#createProject').click();
    await page.locator('#drawingCanvas').waitFor();
    await page.locator('#drawingSave').click();
    const initial = await page.evaluate(async () => {
      const store = await studioProjectStore(), [head] = await store.list();
      const {detail} = await store.read(head.documentId);
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open('skazki-drawing-projects-v1');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      await new Promise((resolve, reject) => {
        const tx = db.transaction(['documents', 'revisions'], 'readwrite');
        const history = tx.objectStore('revisions');
        let parentRevision = head.revision;
        for (let i = 0; i < 2049; i++) {
          const revision = 'qa-revision-'+i;
          history.add({...detail, parentRevision, revision, updatedAt: head.updatedAt+i+1}, revision);
          parentRevision = revision;
        }
        tx.objectStore('documents').put({...head, revision: parentRevision}, head.documentId);
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onabort = () => { db.close(); reject(tx.error); };
      });
      return head;
    });
    await page.locator('#projectStorage summary').click();
    await page.locator('#projectStorageStatus').filter({hasText: 'Проектов 1, редакций 2050, растровых файлов 1'}).waitFor();
    const before = await page.evaluate(async () => (await studioProjectStore()).inventory());
    assert.ok(before.bytes > 0);
    await page.getByRole('button', {name: 'Скачать архив «Длинная история»', exact: true}).click();
    await page.locator('#projectShelfStatus').filter({hasText: 'Полный архив превышает лимит'}).waitFor();
    const expected = page.waitForEvent('download');
    await page.getByRole('button', {name: 'Архив текущей редакции', exact: true}).click();
    const archive = JSON.parse(await fs.readFile(await (await expected).path(), 'utf8'));
    assert.equal(archive.revisions.length, 1);
    assert.equal(archive.revisions[0].revision, 'qa-revision-2048');
    assert.equal(archive.revisions[0].originalHash, initial.originalHash);
    assert.deepEqual(archive.assets.map(asset=>asset.hash), [initial.originalHash]);
    assert.deepEqual(await page.evaluate(async () => (await studioProjectStore()).inventory()), before);
  } finally {
    await page.close();
  }
  console.log('PASS G19 archive cap preserves 2,050 revisions, reports real stored bytes and offers a verified head snapshot');
};
