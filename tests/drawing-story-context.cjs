'use strict';

const assert = require('node:assert/strict');

module.exports = async function verifyDrawingStoryContext(browser, url) {
  const page = await browser.newPage({viewport: {width: 1024, height: 768}, serviceWorkers: 'block'});
  try {
    await page.goto(url);
    await page.locator('#homeNewStory').click();
    await page.locator('#storyTitle').fill('История с изменённым абзацем');
    const body = page.locator('#storyBody'), canvas = page.locator('#drawingCanvas');
    await body.fill('Старый абзац про сказочную сову.\n\nЗдесь начинается другая глава.');
    await body.evaluate(input => { input.setSelectionRange(18, 24, 'backward'); input.blur(); });
    await page.locator('#drawStory').click();
    await canvas.click({position: {x: 90, y: 80}});
    await page.locator('#drawingStatus').filter({hasText: 'Черновик рисунка сохранён'}).waitFor();
    const drawing = await canvas.evaluate(sheet => sheet.toDataURL());
    await page.locator('#drawingCancel').click();
    assert.equal(await body.evaluate(input => input.selectionDirection), 'backward');
    await body.fill('В новом абзаце лиса смотрит на луну.\n\nВ другой части идёт снег.');
    const replacement = await body.inputValue();
    const expectedOffset = await body.evaluate(input => {
      input.setSelectionRange(13, 13);
      input.blur();
      return storyPictureCaret(input.value, false, 13);
    });
    await page.locator('#drawStory').click();
    await canvas.waitFor();
    assert.equal(await canvas.evaluate(sheet => sheet.toDataURL()), drawing);
    const before = await page.evaluate(() => localStorage.getItem(KEY));
    const save = page.locator('#drawingSave');
    const decide = async accept => {
      const answer = page.waitForEvent('dialog').then(async dialog => {
        assert.match(dialog.message(), /Текст рядом с рисунком изменился/);
        if (accept) await dialog.accept();
        else await dialog.dismiss();
      });
      await Promise.all([answer, save.click()]);
    };
    await decide(false);
    assert.ok(await canvas.isVisible());
    assert.equal(await body.inputValue(), replacement);
    assert.equal(await page.evaluate(() => localStorage.getItem(KEY)), before);
    await decide(true);
    await canvas.waitFor({state: 'hidden'});
    assert.equal(await body.inputValue(), replacement.slice(0, expectedOffset) + '\n[[рисунок:1]]\n' + replacement.slice(expectedOffset));
  } finally {
    await page.close();
  }
  console.log('PASS FLOW2 changed manuscript anchor, explicit placement, read-only cancellation and single insertion');
};
