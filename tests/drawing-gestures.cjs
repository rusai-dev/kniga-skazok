'use strict';

const assert = require('node:assert/strict');

module.exports = async function verifyDrawingGestures(browser, url) {
  const page = await browser.newPage({viewport: {width: 768, height: 1024}, serviceWorkers: 'block', hasTouch: true});
  try {
    await page.goto(url);
    await page.locator('#homeCreate').click();
    await page.locator('#childDraw').click();
    const canvas = page.locator('#drawingCanvas');
    await canvas.waitFor();
    for (const route of ['free', 'project']) {
      const results = await canvas.evaluate((sheet, route) => {
        const original = sheet.toDataURL(), initialWidth = sheet.getBoundingClientRect().width;
        const getDraft = () => localStorage.getItem(DRAWING_DRAFT);
        const userData = getDraft();
        function emit(name, id, type, x, y, primary = true) {
          const rect = sheet.getBoundingClientRect();
          sheet.dispatchEvent(new PointerEvent(name, {bubbles: true, cancelable: true, pointerId: id, pointerType: type,
            isPrimary: primary, clientX: rect.left+rect.width*x, clientY: rect.top+rect.height*y, pressure: .65}));
        }
        emit('pointerdown', 18, 'touch', .4, .4);
        emit('pointermove', 18, 'touch', .43, .4);
        expectTemporary();
        emit('pointerdown', 19, 'touch', .6, .4, false);
        const cancelled = sheet.toDataURL();
        emit('pointermove', 18, 'touch', .30, .4);
        emit('pointermove', 19, 'touch', .73, .4, false);
        const scale = sheet.getBoundingClientRect().width/initialWidth;
        emit('pointerup', 19, 'touch', .73, .4, false);
        emit('pointermove', 18, 'touch', .2, .35);
        emit('pointerup', 18, 'touch', .2, .35);
        const afterPinch = sheet.toDataURL();
        const readOnly = userData === getDraft();
        $('drawingDetail').click();

        emit('pointerdown', 31, 'pen', .39, .5);
        const penBeforeTouch = sheet.toDataURL();
        emit('pointerdown', 32, 'touch', .68, .6, false);
        emit('pointermove', 32, 'touch', .72, .66, false);
        emit('pointerup', 32, 'touch', .72, .66, false);
        const penDuringTouch = sheet.toDataURL();
        emit('pointerup', 31, 'pen', .41, .5);
        const afterPen = sheet.toDataURL();
        $('drawingPanel').querySelector('[data-tool="fill"]').click();
        emit('pointerdown', 44, 'touch', .2, .4);
        emit('pointerdown', 45, 'touch', .6, .5, false);
        emit('pointerup', 45, 'touch', .6, .5, false);
        emit('pointerup', 44, 'touch', .2, .4);
        const afterFillGesture = sheet.toDataURL();
        $('drawingPanel').querySelector('[data-tool="brush"]').click();
        emit('pointerdown', 53, 'touch', .3, .65);
        emit('pointerup', 53, 'touch', .33, .65);
        const newTouch = sheet.toDataURL();
        return { cancelled: original===cancelled, noInk: original===afterPinch, scale, readOnly,
          pen: penBeforeTouch===penDuringTouch && afterPen!==original, noFill: afterFillGesture===afterPen,
          touchWorks: newTouch!==afterPen };

        function expectTemporary() {
          if (route==='free' && sheet.toDataURL()===original) throw Error('first finger must preview a stroke');
        }
      }, route);
      assert.deepEqual({...results, scale: results.scale>1}, {
        cancelled: true, noInk: true, scale: true, readOnly: true, pen: true, noFill: true, touchWorks: true,
      }, route);
      const pixels = () => canvas.evaluate(sheet => sheet.toDataURL());
      const painted = await pixels();
      await canvas.press('Control+z');
      assert.notEqual(await pixels(), painted);
      await canvas.press('Control+Shift+z');
      assert.equal(await pixels(), painted);
      for (const [key, tool] of [['e', 'eraser'], ['i', 'pick'], ['b', 'brush']]) {
        await canvas.press(key);
        assert.equal(await page.locator(`#drawingPanel [data-tool="${tool}"]`).first().getAttribute('aria-pressed'), 'true');
      }

      await canvas.press('=');
      await canvas.press('=');
      const viewport = page.locator('#studioViewport'), box = await viewport.boundingBox();
      const scroll = () => viewport.evaluate(view => ({left: view.scrollLeft, top: view.scrollTop}));
      const previousScroll = await scroll();
      await page.keyboard.down('Space');
      await page.mouse.move(box.x+box.width*.6, box.y+box.height*.6);
      await page.mouse.down();
      await page.mouse.move(box.x+box.width*.35, box.y+box.height*.35, {steps: 4});
      await page.mouse.up();
      await page.keyboard.up('Space');
      assert.notDeepEqual(await scroll(), previousScroll, 'Space drag moves the zoomed viewport');
      assert.equal(await pixels(), painted, 'keyboard panning does not lay down ink');
      await page.locator('#drawingDetail').click();
      if (route==='project') {
        const detail = page.locator('#drawingDetail');
        assert.equal(await detail.textContent(), 'Весь лист');
        await detail.click();
        for (const factor of [1,2,4,8]) {
          assert.equal(await detail.textContent(), `${factor*100}%`);
          assert.deepEqual(await canvas.evaluate(sheet => [sheet.style.width,sheet.style.height]), [`${720*factor}px`,`${480*factor}px`]);
          if (factor<8) await canvas.press('=');
        }
        await page.setViewportSize({width: 1024, height: 768});
        assert.deepEqual(await canvas.evaluate(sheet => [sheet.width,sheet.height,sheet.style.width]), [720,480,'5760px']);
        assert.equal(await pixels(), painted, 'zoom and rotation do not resample the document');
        await detail.click();
        await page.locator('#studioPro').click();
        await page.getByText('Точный цвет sRGB', {exact: true}).click();
        const hex = page.locator('#preciseHex');
        await hex.press('Control+z');
        assert.equal(await pixels(), painted, 'text editing does not undo drawing actions');
        await hex.press('Escape');
        await page.locator('#studioProPane').waitFor({state: 'hidden'});
      }
      if (route==='free') {
        await page.locator('#studioMore summary').click();
        await page.locator('#drawingSaveProject').click();
        await page.locator('#toast').filter({hasText: 'Копия сохранена'}).waitFor();
        await page.locator('#openProjects').click();
        await page.locator('#projectShelf li').first().locator('button').first().click();
        await page.locator('#drawingStatus').filter({hasText: 'Продолжай свой сохранённый рисунок'}).waitFor();
      }
    }
  } finally {
    await page.close();
  }
  console.log('PASS IN01–IN04 touch rollback, pen isolation, keyboard shortcuts, mouse panning and native project zoom');
};
