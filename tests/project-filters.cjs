'use strict';

const assert = require('node:assert/strict');

module.exports = async function verifyProjectFilters(browser, url) {
  const page = await browser.newPage({viewport: {width: 1024, height: 768}, serviceWorkers: 'block'});
  try {
    await page.goto(url);
    await page.locator('#homeCreate').click();
    await page.locator('#childDraw').click();
    await page.locator('#openProjects').click();
    await page.locator('#newProject').click();
    await page.locator('#newProjectTitle').fill('Эффекты слоя');
    await page.locator('#newProjectSize').selectOption('720×480');
    await page.locator('#newProjectBackground').selectOption('transparent');
    await page.locator('#createProject').click();
    const canvas = page.locator('#drawingCanvas'), more = page.locator('#studioMore');
    await canvas.waitFor();
    await page.evaluate(() => {
      const input = $('drawingCustom'); input.value = '#25364b';
      input.dispatchEvent(new Event('input', {bubbles: true}));
    });
    // Use the actual pointer position seen by the drawing engine, not a
    // bounding box sampled before Playwright scrolls the canvas into view.
    await canvas.scrollIntoViewIfNeeded();
    await canvas.evaluate(sheet => {
      sheet.addEventListener('pointerdown', event => {
        const r = sheet.getBoundingClientRect();
        sheet.dataset.testStrokeX = String(Math.floor((event.clientX-r.left)*sheet.width/r.width));
        sheet.dataset.testStrokeY = String(Math.floor((event.clientY-r.top)*sheet.height/r.height));
      }, {capture: true, once: true});
    });
    await canvas.click({position: {x: 150, y: 140}});
    const [x, y] = await canvas.evaluate(sheet => [Number(sheet.dataset.testStrokeX), Number(sheet.dataset.testStrokeY)]);
    assert.ok(Number.isInteger(x) && Number.isInteger(y) && x>12 && x<708 && y>12 && y<468,
      'The real pointer stroke must be inside the canvas');
    await page.locator('#drawingStatus').filter({hasText: 'Проект сохранён'}).waitFor();
    const png = () => canvas.evaluate(sheet => sheet.toDataURL());
    const pixel = (x, y) => canvas.evaluate((sheet, [x, y]) => Array.from(sheet.getContext('2d').getImageData(x, y, 1, 1).data), [x, y]);
    const stored = () => page.evaluate(async () => (await (await studioProjectStore()).list())[0].revision);
    assert.deepEqual(await pixel(x, y), [37, 54, 75, 255], 'Source brush stroke must be opaque before testing effects');
    const original = await png(), revision = await stored();
    const open = async () => {
      if (!await more.evaluate(details => details.open)) await more.locator('summary').click();
      await page.locator('#openProjectFilters').click();
    };
    const kind = page.locator('#projectFilterKind'), preview = page.locator('#applyProjectFilter:enabled');
    const cancel = page.locator('#cancelProjectFilter');
    await open();
    const brightness = page.locator('#filterBrightness');
    await brightness.fill('10');
    await brightness.fill('55');
    await preview.waitFor();
    assert.deepEqual(await pixel(x, y), [177, 194, 215, 255]);
    assert.equal(await stored(), revision, 'worker preview never writes a project revision');
    await cancel.click();
    assert.equal(await png(), original);

    await open();
    await preview.click();
    const adjusted = await png();
    assert.notEqual(adjusted, original);
    await page.locator('#drawingUndo').click();
    assert.equal(await png(), original);
    await page.locator('#drawingRedo').click();
    assert.equal(await png(), adjusted);

    await open();
    await kind.selectOption('blur');
    await page.locator('#filterRadius').fill('12');
    await preview.waitFor();
    assert.ok((await pixel(x, y))[3] < 255);
    assert.ok((await pixel(x+8, y))[3] > 0);
    await cancel.click();
    assert.equal(await png(), adjusted);

    await open();
    await kind.selectOption('glow');
    await preview.waitFor();
    const glow = await pixel(x+8, y);
    assert.ok(glow[3]>0 && glow[0]>glow[2]);
    assert.deepEqual(await pixel(x, y), [177, 194, 215, 255]);
    await kind.selectOption('gradient');
    await page.locator('#filterFromAlpha').fill('0');
    await preview.waitFor();
    assert.ok((await pixel(0, 0))[3]<5);
    assert.ok((await pixel(719, 0))[3]>250);
    await cancel.click();
    assert.equal(await png(), adjusted);

    await page.evaluate(() => { window.Worker = undefined; });
    await open();
    await kind.selectOption('tone');
    await brightness.fill('-10');
    await preview.waitFor();
    assert.notEqual(await png(), adjusted);
    await cancel.click();
    assert.equal(await png(), adjusted);
  } finally {
    await page.close();
  }
  console.log('PASS FX tone latest request, Gaussian blur, glow, gradient, worker fallback, cancellation and reversible commit');
};
