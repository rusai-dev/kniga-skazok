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
        const host = $('studioViewport'), original = sheet.toDataURL();
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
        const scale = Number(host.dataset.scale);
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
  console.log('PASS IN01/IN02 two-finger pinch rolls back tentative ink/fill, pen ignores touch, both artwork routes');
};
