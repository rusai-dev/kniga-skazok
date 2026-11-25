'use strict';

const assert = require('node:assert/strict');

module.exports = async function verifyProjectColor(browser, url) {
  const page = await browser.newPage({viewport: {width: 1024, height: 768}, serviceWorkers: 'block'});
  try {
    await page.goto(url);
    await page.locator('#homeCreate').click();
    await page.locator('#childDraw').click();
    await page.locator('#openProjects').click();
    await page.locator('#newProject').click();
    await page.locator('#newProjectTitle').fill('Точный цвет');
    await page.locator('#newProjectSize').selectOption('720×480');
    await page.locator('#newProjectBackground').selectOption('transparent');
    await page.locator('#createProject').click();
    const canvas = page.locator('#drawingCanvas');
    await canvas.waitFor();
    const tools = page.locator('#studioPro');
    const exact = page.locator('#studioProPane').getByText('Точный цвет sRGB', {exact: true});
    await tools.click();
    await exact.click();
    const value = page.locator('#preciseHex');
    await value.fill('#2266aa80');
    await value.press('Tab');
    assert.deepEqual(await page.locator('#studioProPane [id^="preciseChannel"]').evaluateAll(fields => fields.map(field => field.valueAsNumber)), [34, 102, 170, 128]);
    await page.getByRole('button', {name: 'Точный цвет #2266aa80'}).waitFor();
    const hue = page.locator('#preciseHue');
    const old = Number(await hue.getAttribute('aria-valuenow'));
    await hue.press('Shift+ArrowRight');
    assert.equal(Number(await hue.getAttribute('aria-valuenow')), (old+10)%360);
    assert.notEqual(await value.inputValue(), '#2266aa80');
    await page.getByRole('button', {name: 'Точный цвет #2266aa80'}).click();
    assert.equal(await value.inputValue(), '#2266aa80');

    await page.locator('#studioProClose').click();
    await canvas.click({position: {x: 145, y: 130}});
    const dimensions = await canvas.boundingBox();
    const pixel = await canvas.evaluate((sheet, {width, height}) => Array.from(sheet.getContext('2d')
      .getImageData(Math.floor(145*sheet.width/width), Math.floor(130*sheet.height/height), 1, 1).data), dimensions);
    assert.equal(pixel[3], 128);
    for (const [i, value] of [34, 102, 170].entries()) assert.ok(Math.abs(pixel[i]-value)<=1, 'unpremultiplication stays within one RGB step');
    await page.locator('#drawingPanel [data-tool="pick"]').first().click();
    await canvas.click({position: {x: 145, y: 130}});
    await tools.click();
    const sampled = '#'+pixel.map(channel=>channel.toString(16).padStart(2,'0')).join('');
    assert.equal(await value.inputValue(), sampled);
    assert.ok(await page.evaluate(() => JSON.parse(localStorage.getItem('skazki-precise-colors-v1')).includes('#2266aa80')));

    const setExact = async color => { await value.fill(color); await value.press('Tab'); };
    await setExact('#000000ff');
    await page.evaluate(() => {
      $('proSecond').value='#ffffff';$('proRatio').value='50';
      $('proRatio').dispatchEvent(new Event('input', {bubbles:true}));
    });
    const preview = page.locator('#proMixSample');
    assert.equal(await preview.getAttribute('title'), '#808080');
    await page.locator('#preciseMixSpace').selectOption('linear');
    assert.equal(await preview.getAttribute('title'), '#bcbcbc');
    assert.equal(await value.inputValue(), '#000000ff', 'comparison previews leave the brush color alone');
    await page.locator('#proMix').click();
    assert.equal(await value.inputValue(), '#bcbcbcff');

    const source = page.locator('#precisePickSource'), alpha = page.locator('#precisePickAlpha');
    await source.selectOption('layer');
    await page.locator('#studioProClose').click();
    await page.locator('#studioMore summary').click();
    await page.locator('#openProjectLayers').click();
    await page.locator('#addProjectLayer').click();
    await page.locator('#closeProjectLayers').click();
    await page.locator('#studioMore summary').click();
    const pick = page.locator('#drawingPanel [data-tool="pick"]').first();
    const eyedrop = async () => { await pick.click(); await canvas.click({position:{x:145,y:130}}); };
    await eyedrop();
    assert.equal(await pick.getAttribute('aria-pressed'), 'true');
    await page.locator('#drawingStatus').filter({hasText:'прозрачен'}).waitFor();
    await tools.click();
    assert.equal(await value.inputValue(), '#bcbcbcff', 'a transparent pixel preserves the chosen color');
    await source.selectOption('composite');
    await alpha.uncheck();
    await page.locator('#studioProClose').click();
    await eyedrop();
    await tools.click();
    assert.equal(await value.inputValue(), sampled.slice(0,7)+'ff');
    await alpha.check();
    await page.locator('#studioProClose').click();
    await eyedrop();
    await tools.click();
    assert.equal(await value.inputValue(), sampled);
  } finally {
    await page.close();
  }
  console.log('PASS CL01–CL03 canonical sRGB RGBA, alpha stroke, project eyedropper, color history and both mixing spaces');
};
