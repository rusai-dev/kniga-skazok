'use strict';

const assert = require('node:assert/strict');

module.exports = async function verifyProjectSelection(browser, url) {
  const page = await browser.newPage({viewport: {width: 1024, height: 768}, serviceWorkers: 'block'});
  try {
    await page.goto(url);
    await page.locator('#homeCreate').click();
    await page.locator('#childDraw').click();
    await page.locator('#openProjects').click();
    await page.locator('#newProject').click();
    await page.locator('#newProjectTitle').fill('Выделение');
    await page.locator('#newProjectSize').selectOption('720×480');
    await page.locator('#createProject').click();
    const canvas = page.locator('#drawingCanvas');
    await canvas.waitFor();
    // Express fixtures on the document, independently of the available viewport area.
    const pixel = (x, y) => canvas.evaluate((sheet, [x, y]) => Array.from(sheet.getContext('2d')
      .getImageData(Math.floor(x*sheet.width/390), Math.floor(y*sheet.height/260), 1, 1).data), [x, y]);
    const position = async (x, y) => {
      const box = await canvas.boundingBox();
      await canvas.click({position: {x: x*box.width/390, y: y*box.height/260}});
    };
    const paper = [255, 255, 255, 255];
    const choose = async button => {
      await page.locator('#studioMore summary').click();
      await page.locator('#openProjectSelection').click();
      await page.getByRole('region', {name: 'Выделение'}).getByRole('button', {name: button, exact: true}).click();
    };
    const select = async (tool, points) => {
      await choose(tool);
      const move = async ([x, y]) => {
        const box = await canvas.boundingBox();
        await page.mouse.move(box.x+x*box.width/390, box.y+y*box.height/260);
      };
      await move(points[0]);
      await page.mouse.down();
      for (const point of points.slice(1)) await move(point);
      await page.mouse.up();
      await page.locator('#drawingStatus').filter({hasText: 'Выделение готово'}).waitFor();
    };
    const fillColor = color => page.evaluate(color => {
      const input = $('drawingCustom'); input.value = color;
      input.dispatchEvent(new Event('input', {bubbles: true}));
    }, color);

    const before = await canvas.evaluate(sheet => sheet.toDataURL());
    await select('Прямоугольник', [[100, 105], [190, 205]]);
    assert.equal(await canvas.evaluate(sheet => sheet.toDataURL()), before, 'the selection contour is a separate visual layer');
    for (let zoom = 0; zoom < 4; zoom++) await canvas.press('=');
    assert.equal(await page.locator('#drawingDetail').textContent(), '800%');
    const contour = await canvas.evaluate(async sheet => {
      const view = sheet.parentElement;
      const outline = view.querySelector('canvas[aria-hidden="true"]');
      const viewRect = view.getBoundingClientRect(), sheetRect = sheet.getBoundingClientRect();
      const left = sheetRect.left-viewRect.left-view.clientLeft+view.scrollLeft;
      const top = sheetRect.top-viewRect.top-view.clientTop+view.scrollTop;
      view.scrollLeft=left+sheetRect.width*100/390-view.clientWidth/2;
      view.scrollTop=top+sheetRect.height*155/260-view.clientHeight/2;
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      const x=Math.max(0,Math.round(outline.width/2)-24);
      const ink=outline.getContext('2d').getImageData(x,Math.round(outline.height/2)-12,48,24).data;
      return {bounded: outline.width<=view.clientWidth&&outline.height<=view.clientHeight,
        sheet: sheet.style.width, visible: ink.some((value,index)=>index%4===3&&value>0)};
    });
    assert.deepEqual(contour, {bounded: true, sheet: '5760px', visible: true}, 'zoom allocates only visible pixels and redraws the contour at the scrolled document point');
    assert.equal(await canvas.evaluate(sheet => sheet.toDataURL()), before);
    await page.locator('#drawingDetail').click();
    await fillColor('#1a4d9d');
    await position(244, 160);
    assert.deepEqual(await pixel(244, 160), paper);
    await position(145, 150);
    assert.deepEqual(await pixel(145, 150), [26, 77, 157, 255]);

    await fillColor('#ab2840');
    await page.locator('#drawingPanel [data-tool="fill"]').first().click();
    await position(180, 170);
    assert.deepEqual(await pixel(180, 170), [171, 40, 64, 255]);
    assert.deepEqual(await pixel(95, 170), paper);
    assert.deepEqual(await pixel(196, 170), paper);
    await choose('Инвертировать');
    await page.locator('#drawingPanel [data-tool="eraser"]').first().click();
    await position(180, 170);
    assert.deepEqual(await pixel(180, 170), [171, 40, 64, 255]);
    await fillColor('#274819');
    await page.locator('#drawingPanel [data-tool="brush"]').first().click();
    await position(240, 160);
    assert.deepEqual(await pixel(240, 160), [39, 72, 25, 255]);
    await page.locator('#drawingUndo').click();
    assert.deepEqual(await pixel(240, 160), paper);

    await select('Лассо', [[225, 120], [320, 120], [270, 210], [225, 120]]);
    await position(274, 148);
    assert.deepEqual(await pixel(274, 148), [39, 72, 25, 255]);
    await position(320, 192);
    assert.deepEqual(await pixel(320, 192), paper);
    await choose('Снять выделение');
    await position(320, 192);
    assert.deepEqual(await pixel(320, 192), [39, 72, 25, 255]);

    await select('Прямоугольник', [[305, 176], [335, 209]]);
    const clipboardOriginal = await canvas.evaluate(sheet => sheet.toDataURL());
    await choose('Копировать');
    assert.equal(await canvas.evaluate(sheet => sheet.toDataURL()), clipboardOriginal);
    await page.locator('#cutProjectSelection').click();
    assert.deepEqual(await pixel(320, 192), paper);
    await choose('Вставить');
    assert.equal(await canvas.evaluate(sheet => sheet.toDataURL()), clipboardOriginal);

    const offset = await canvas.evaluate(sheet => Math.round(55*sheet.width/390));
    const beforeTransform = await canvas.evaluate(sheet => sheet.toDataURL());
    await choose('Трансформация');
    const transform = async () => {
      await page.locator('#projectTransformX').fill(String(offset));
      await page.locator('#applyProjectTransform:enabled').waitFor();
      assert.deepEqual(await pixel(320, 192), paper);
      assert.deepEqual(await pixel(375, 192), [39, 72, 25, 255]);
    };
    await transform();
    await page.locator('#cancelProjectTransform').click();
    assert.equal(await canvas.evaluate(sheet => sheet.toDataURL()), beforeTransform, 'cancel restores the unmodified layer');
    await page.locator('#startProjectTransform').click();
    await transform();
    await page.locator('#applyProjectTransform').click();
    const moved = await canvas.evaluate(sheet => sheet.toDataURL());
    assert.notEqual(moved, beforeTransform);
    await page.locator('#drawingUndo').click();
    assert.equal(await canvas.evaluate(sheet => sheet.toDataURL()), beforeTransform);
    await page.locator('#drawingRedo').click();
    assert.equal(await canvas.evaluate(sheet => sheet.toDataURL()), moved);
  } finally {
    await page.close();
  }
  console.log('PASS LY03 rectangle and lasso, constrained pixels, local clipboard, transform preview, cancellation and undo/redo');
};
