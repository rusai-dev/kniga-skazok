'use strict';

const assert = require('node:assert/strict');

module.exports = async function verifyDrawingInput(browser, url) {
  for (const route of ['free', 'story']) {
    const context = await browser.newContext({viewport: {width: 1024, height: 768}, serviceWorkers: 'block'});
    try {
      const page = await context.newPage();
      const click = id => page.locator('#' + id).click();
      const canvas = page.locator('#drawingCanvas');
      const pixels = () => canvas.evaluate(canvas => canvas.toDataURL());
      await page.goto(url);
      if (route === 'free') {
        await click('homeCreate');
        await click('childDraw');
      } else {
        await click('homeNewStory');
        await click('drawStory');
      }
      await canvas.waitFor({state: 'visible'});
      const blank = await pixels();
      const samples = await canvas.evaluate(canvas => {
        const ctx = canvas.getContext('2d');
        $('drawingCustom').value = '#242424';
        $('drawingCustom').dispatchEvent(new Event('input', {bubbles: true}));
        $('proPressure').checked = true;
        const rect = canvas.getBoundingClientRect();
        const point = (type, id, x, y, pressure) => canvas.dispatchEvent(new PointerEvent(type, {
          pointerId: id, pointerType: 'pen', pressure, clientX: rect.x + rect.width * x,
          clientY: rect.y + rect.height * y, bubbles: true
        }));
        const pixel = (x, y) => [...ctx.getImageData(x * canvas.width, y * canvas.height, 1, 1).data];
        point('pointerdown', 7, .2, .35, .25);
        point('pointermove', 7, .4, .35, .25);
        point('pointerup', 7, .75, .35, 0);
        const end = pixel(.65, .35);
        const beyondPressure = pixel(.65, .35 + 4 / canvas.height);
        point('pointerdown', 8, .2, .7, .25);
        point('pointercancel', 8, .75, .7, 0);
        return {end, beyondPressure, cancelledTail: pixel(.65, .7)};
      });
      assert.ok(samples.end[0] < 100, 'pointerup without a last pointermove still inks the endpoint in ' + route + ': ' + samples.end);
      assert.deepEqual(samples.beyondPressure, [255, 253, 247, 255], 'zero pressure at pen lift preserves the stroke width');
      assert.deepEqual(samples.cancelledTail, [255, 253, 247, 255], 'pointercancel does not invent a tail');
      const drawing = await pixels();
      await click('drawingUndo');
      await click('drawingUndo');
      assert.equal(await pixels(), blank, 'each gesture is a single undo step');
      await click('drawingRedo');
      await click('drawingRedo');
      assert.equal(await pixels(), drawing, 'redo restores the completed pixels exactly');
    } finally {
      await context.close();
    }
  }
  console.log('PASS G14 pen endpoint, pressure, cancellation and pixel undo/redo in both routes');
};
