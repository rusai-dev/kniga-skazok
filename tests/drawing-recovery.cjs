'use strict';

const assert = require('node:assert/strict');
const draftKey = 'skazki-unfinished-drawing-v1';
const outlineKey = 'skazki-drawing-outline-v1';
const libraryKey = 'skazki-library-v1';
const brokenDraft = 'data:image/jpeg;base64,AAAA';

module.exports = async function verifyDrawingRecovery(browser, url) {
  const context = await browser.newContext({viewport: {width: 1024, height: 768}, serviceWorkers: 'block'});
  const page = await context.newPage();
  const canvas = page.locator('#drawingCanvas');
  const status = page.locator('#drawingStatus');
  const click = id => page.locator('#' + id).click();
  const snapshot = keys => page.evaluate(keys => keys.map(key => localStorage.getItem(key)), keys);
  const unchanged = async (keys, before, label) => {
    const after = await snapshot(keys);
    for (const [index, key] of keys.entries()) assert.ok(after[index] === before[index], label + ': ' + key);
  };
  const draw = async () => {
    await canvas.waitFor({state: 'visible'});
    const rect = await canvas.boundingBox();
    await page.mouse.move(rect.x + rect.width * .3, rect.y + rect.height * .3);
    await page.mouse.down();
    await page.mouse.move(rect.x + rect.width * .55, rect.y + rect.height * .55, {steps: 4});
    await page.mouse.up();
  };

  try {
    await page.goto(url);
    const protectedKeys = [draftKey, outlineKey, libraryKey, 'skazki-study-skills-v2', 'skazki-reading-progress-v1'];
    await page.evaluate(([draft, outline, library, study, reading, broken]) => {
      localStorage.setItem(draft, broken);
      localStorage.setItem(outline, '{"key":"forest","fingerprint":"legacy"}');
      localStorage.setItem(library, JSON.stringify({...fresh(), stories: [{id:'qa-story', author:OWN, theme:'Тест', title:'Маяк', body:'Тестовая сказка.', icon:'✦'}]}));
      localStorage.setItem(study, '{"add":{"done":5}}');
      localStorage.setItem(reading, '{"qa-story":2}');
    }, [...protectedKeys, brokenDraft]);
    const before = await snapshot(protectedKeys);

    await click('homeCreate');
    await click('childDraw');
    await status.filter({hasText: 'не открылся'}).waitFor({state: 'attached'});
    await draw();
    await unchanged(protectedKeys, before, 'autosave preserves an unreadable draft and all unrelated data');
    assert.match(await status.textContent(), /черновик.*сохран/i);
    assert.equal(await page.locator('#drawingRescue').isEnabled(), true);
    await click('drawingSave');
    await page.locator('#galleryGrid .gallery-piece').waitFor();
    await unchanged(protectedKeys, before, 'saving a new gallery entry preserves the unreadable draft');
    assert.equal(await page.locator('#galleryGrid img').evaluate(image => image.decode().then(() => image.naturalWidth)), 720);

    await page.reload();
    await click('homeNewStory');
    await page.locator('#storyBody').fill('Лиса нарисовала маяк.');
    await click('drawStory');
    await draw();
    await click('drawingSave');
    const libraryWithBrokenOriginal = await page.evaluate(key => {
      const library = JSON.parse(localStorage.getItem(key));
      const draft = library.drafts[library.draft.draftRef];
      draft.studio.originals[0].src = 'data:image/png;base64,AAAA';
      library.draft.studio = draft.studio;
      const raw = JSON.stringify(library);
      localStorage.setItem(key, raw);
      return raw;
    }, libraryKey);
    await page.reload();
    await click('homeWrite');
    await page.locator('[data-edit-pic="0"]').click();
    await status.filter({hasText: 'не открылся'}).waitFor({state: 'attached'});
    await draw();
    await unchanged([libraryKey], [libraryWithBrokenOriginal], 'autosave does not add a replacement revision');
    assert.equal(await page.locator('#drawingFullSave').isDisabled(), true);
    assert.equal(await page.locator('#drawingRescue').isEnabled(), true);
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
    await unchanged([libraryKey], [libraryWithBrokenOriginal], 'pagehide preserves the story and linked drawing bytes');

    await page.evaluate(() => {
      const source = document.createElement('canvas');
      source.width = 8;
      source.height = 8;
      const context = source.getContext('2d');
      const originalImage = window.Image;
      const completions = window.__qaDrawingCompletions = [];
      let next = 0;
      window.Image = function () {
        const index = next++;
        const image = new originalImage();
        Object.defineProperty(image, 'onload', {set(callback) {
          image.addEventListener('load', () => { completions[index] = callback; }, {once: true});
        }});
        return image;
      };
      try {
        for (const color of ['#ff0000', '#0000ff']) {
          context.fillStyle = color;
          context.fillRect(0, 0, 8, 8);
          $('storyForm').loadDrawing(source.toDataURL());
        }
      } finally {
        window.Image = originalImage;
      }
    });
    await page.waitForFunction(() => window.__qaDrawingCompletions[0] && window.__qaDrawingCompletions[1]);
    const pixel = await canvas.evaluate(canvas => {
      const [older, latest] = window.__qaDrawingCompletions;
      latest();
      older();
      delete window.__qaDrawingCompletions;
      return [...canvas.getContext('2d').getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data];
    });
    assert.deepEqual(pixel, [0, 0, 255, 255], 'a slow decode must not repaint a newer drawing');
    await unchanged([libraryKey], [libraryWithBrokenOriginal], 'decoding alone preserves the manuscript and drawings');
  } finally {
    await context.close();
  }
  console.log('PASS G21/G22 unreadable drawing protection in free art and story routes');
};
