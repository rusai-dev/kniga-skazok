'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

module.exports = async function verifyImageImport(browser, url) {
  const context = await browser.newContext({viewport: {width: 1024, height: 768}, serviceWorkers: 'block'});
  try {
    const page = await context.newPage();
    const click = id => page.locator('#' + id).click();
    const preview = page.locator('#imageTray img');
    const input = page.locator('#pictureFile');
    const privateState = () => page.evaluate(() => [localStorage.getItem(KEY), localStorage.getItem('skazki-study-skills-v2')]);
    const waitMessage = text => page.locator('#toast').filter({hasText: text}).waitFor({state: 'attached'});
    await page.goto(url);
    await page.evaluate(() => {
      localStorage.setItem('skazki-study-skills-v2', '{"add":{"done":5}}');
      window.imageDecodes = 0;
      const create = URL.createObjectURL;
      URL.createObjectURL = blob => { window.imageDecodes++; return create.call(URL, blob); };
    });
    await click('homeNewStory');
    await page.locator('#storyBody').fill('Синтетическая история про фонарь.');
    const before = await privateState();
    const frames = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 22;
      canvas.height = 14;
      const painter = canvas.getContext('2d');
      painter.fillStyle = '#299f9f';
      painter.fillRect(0, 0, 22, 14);
      return ['image/png', 'image/jpeg'].map(type => canvas.toDataURL(type).split(',')[1]);
    });
    const png = Buffer.from(frames[0], 'base64'), jpeg = Buffer.from(frames[1], 'base64');
    const webp = fs.readFileSync(path.join(__dirname, '../assets/world/night-owl-cover-320-v1.webp'));
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="14"><rect width="22" height="14" fill="#f66"/></svg>';
    const oversized = Buffer.from(png);
    oversized.writeUInt32BE(9000, 16);
    oversized.writeUInt32BE(4000, 20);

    for (const [name, mimeType, buffer, error] of [
      ['uploaded.svg', 'image/svg+xml', Buffer.from(svg), 'Не удалось открыть рисунок'],
      ['pretends.png', 'image/png', Buffer.from(svg), 'Не удалось открыть рисунок'],
      ['wrong.png', 'image/png', jpeg, 'Не удалось открыть рисунок'],
      ['large.png', 'image/png', oversized, 'Рисунок слишком большой']
    ]) {
      await input.setInputFiles({name, mimeType, buffer});
      await waitMessage(error);
      await page.waitForFunction(() => !$('publishStory').disabled);
      assert.deepEqual(await privateState(), before);
      assert.equal(await preview.count(), 0);
    }
    assert.equal(await page.evaluate(() => window.imageDecodes), 0, 'invalid or oversized files never reach the decoder');

    for (const [index, name, mimeType, buffer] of [
      [1, 'valid.png', 'image/png', png], [2, 'valid.jpg', 'image/jpeg', jpeg], [3, 'valid.webp', 'image/webp', webp]
    ]) {
      await input.setInputFiles({name, mimeType, buffer});
      await preview.nth(index - 1).waitFor();
      assert.ok((await preview.nth(index - 1).getAttribute('src')).startsWith('data:image/jpeg;base64,'));
    }
    assert.equal(await page.evaluate(() => window.imageDecodes), 3);
    assert.equal((await privateState())[1], before[1]);

    await page.locator('#writerExtras > summary').click();
    await page.locator('.cover-designer summary').click();
    await click('coverGalleryToggle');
    const selectedCover = page.getByRole('button', {name: 'Волшебная библиотека'});
    const beforeCover = await privateState();
    await page.route('**/library-lantern-v1.svg', route => route.fulfill({contentType: 'image/svg+xml', body: svg}));
    await selectedCover.click();
    await waitMessage('Картинка недоступна');
    assert.deepEqual(await privateState(), beforeCover);
    assert.equal(await page.evaluate(() => window.imageDecodes), 3, 'modified packaged vector is rejected before decoding');
    await page.unroute('**/library-lantern-v1.svg');
    await selectedCover.click();
    await page.waitForFunction(() => $('coverImage').value === '3');
    assert.equal(await preview.count(), 4);
  } finally {
    await context.close();
  }
  console.log('PASS G24 raster signature, MIME, dimensions, protected manuscript and approved bundled vector');
};
