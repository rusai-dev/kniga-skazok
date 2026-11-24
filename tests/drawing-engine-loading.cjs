'use strict';

const assert = require('node:assert/strict');

module.exports = async function verifyDrawingEngineLoading(browser, url) {
  const context = await browser.newContext({viewport: {width: 1024, height: 768}, serviceWorkers: 'block'});
  const page = await context.newPage();
  const click = id => page.locator('#' + id).click();
  let requests = 0;
  let allowSecond;
  const second = new Promise(resolve => { allowSecond = resolve; });

  try {
    await page.route('**/studio-engine-208.js?*', async route => {
      requests++;
      if (requests === 1) return route.abort();
      await second;
      await route.continue();
    });
    await page.goto(url);
    await click('homeMath');
    assert.equal(await page.locator('[data-academy]').count(), 12);
    await click('academyBack');
    await click('homeNewStory');
    await page.locator('#storyBody').fill('Лиса смотрит на маяк.');
    assert.equal(requests, 0, 'home, math and text editing do not request the renderer');
    await click('drawStory');
    await page.locator('#toast').filter({hasText: 'Мастерская не открылась'}).waitFor({state: 'visible'});
    assert.equal(await page.locator('#storyBody').inputValue(), 'Лиса смотрит на маяк.');
    await click('drawStory');
    await page.evaluate(() => { $('drawStory').click(); $('drawStory').click(); });
    await click('saveStoryNow');
    await page.locator('#storyBody').waitFor({state: 'hidden'});
    allowSecond();
    await page.waitForFunction(() => typeof window.initDrawing === 'function');
    assert.equal(await page.locator('#drawingCanvas').isVisible(), false, 'late module load cannot reopen a closed editor');

    await click('homeCreate');
    await click('childDraw');
    await page.locator('#drawingCanvas').waitFor({state: 'visible'});
    assert.equal(await page.locator('#drawingUndo').isDisabled(), true);
    assert.equal(requests, 2, 'rapid requests share the retry and the free route reuses the loaded module');
  } finally {
    allowSecond();
    await context.close();
  }
  console.log('PASS G05/G07 lazy drawing module, failed load, deduplicated retry and editor exit');
};
