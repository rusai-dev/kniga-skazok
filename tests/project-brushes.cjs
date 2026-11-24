'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');

module.exports = async function verifyProjectBrushes(browser, url) {
  const page = await browser.newPage({viewport: {width: 1024, height: 768}, serviceWorkers: 'block'});
  try {
    await page.goto(url);
    await page.locator('#homeCreate').click();
    await page.locator('#childDraw').click();
    await page.locator('#openProjects').click();
    await page.locator('#newProject').click();
    await page.locator('#newProjectTitle').fill('Кистевые материалы');
    await page.locator('#newProjectSize').selectOption('720×480');
    await page.locator('#newProjectBackground').selectOption('transparent');
    await page.locator('#createProject').click();
    const canvas = page.locator('#drawingCanvas');
    await canvas.waitFor();
    await page.evaluate(() => {
      const input = $('drawingCustom'); input.value = '#2b991d';
      input.dispatchEvent(new Event('input', {bubbles: true}));
    });
    const tools = page.locator('#studioPro');
    await tools.click();
    await page.getByText('Материалы и пресеты', {exact: true}).click();
    const material = page.locator('#studioMaterial');
    assert.equal(await material.locator('option').count(), 12);
    const set = async (name,value) => {
      const field = page.locator('#material'+name);
      await field.fill(String(value));
      await field.press('Tab');
    };
    const preview = () => page.locator('#proPreview').evaluate(sheet => sheet.toDataURL());
    const signatures = new Set();
    for (const option of await material.locator('option').evaluateAll(nodes=>nodes.map(node=>node.value))) {
      await material.selectOption(option);
      signatures.add(await preview());
    }
    assert.equal(signatures.size, 12, 'the shared material preview renders all twelve material models');

    await material.selectOption('marker');
    await set('Size', 36);
    await set('Opacity', 40);
    await set('Angle', 0);
    assert.ok(await page.locator('#materialFlowLabel').isHidden());
    page.once('dialog', dialog=>dialog.accept('Мой маркер'));
    await page.locator('#saveMaterialPreset').click();
    const download = page.waitForEvent('download');
    await page.locator('#exportMaterialPreset').click();
    const exported = JSON.parse(await fs.readFile(await (await download).path(), 'utf8'));
    assert.equal(exported.settings.opacity, 40);
    assert.equal(exported.settings.size, 36);
    assert.equal(exported.settings.kind, 'marker');
    const original = await canvas.evaluate(sheet=>sheet.toDataURL());
    await page.locator('#studioProClose').click();
    const stroke = points => canvas.evaluate((sheet, points) => {
      const box=sheet.getBoundingClientRect();
      points.forEach(([x,y],index)=>sheet.dispatchEvent(new PointerEvent(index===0?'pointerdown':index===points.length-1?'pointerup':'pointermove',
        {pointerType:'pen',pointerId:10,isPrimary:true,pressure:index===points.length-1?0:1,clientX:box.left+box.width*x/720,clientY:box.top+box.height*y/480})));
    },points);
    const alpha = (x,y) => canvas.evaluate((sheet,[x,y])=>sheet.getContext('2d').getImageData(x,y,1,1).data[3],[x,y]);
    await stroke([[160,180],[230,180],[300,180],[230,180],[170,180],[230,180],[300,180]]);
    assert.equal(await alpha(230,180),102,'marker opacity is a cap within one stroke');
    assert.equal(await alpha(296,180),102,'marker reaches the terminal point');
    await stroke([[200,180],[260,180]]);
    assert.equal(await alpha(230,180),163,'separate strokes accumulate');

    const beforeErase = await canvas.evaluate(sheet=>sheet.toDataURL());
    await tools.click();
    await material.selectOption('eraser');
    await set('Size', 28);
    await set('Opacity', 50);
    await page.locator('#studioProClose').click();
    await stroke([[215,180],[230,180],[250,180]]);
    assert.ok(await alpha(230,180)<163);
    await page.locator('#drawingUndo').click();
    assert.equal(await canvas.evaluate(sheet=>sheet.toDataURL()), beforeErase);
    await page.locator('#drawingUndo').click();
    await page.locator('#drawingUndo').click();
    assert.equal(await canvas.evaluate(sheet=>sheet.toDataURL()), original);

    await tools.click();
    const file = page.locator('#materialPresetFile');
    page.once('dialog', dialog=>dialog.accept());
    await file.setInputFiles({name:'own-brush.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({...exported,name:'Маркер из файла'}))});
    await page.locator('#materialPresets option').filter({hasText:'Маркер из файла'}).waitFor({state:'attached'});
    assert.equal(await material.inputValue(),'marker');
    assert.equal(await page.locator('#materialOpacity').inputValue(),'40');
    assert.equal(await canvas.evaluate(sheet=>sheet.toDataURL()),original,'preset editing never modifies project pixels');

    const footprints = {};
    for (const kind of ['solid','grain-pencil','charcoal','pastel','dry','ink','calligraphy','marker','water','gouache','airbrush']) {
      await material.selectOption(kind);
      await set('Size',36);
      await set('Opacity',100);
      if (['dry','ink','calligraphy','marker'].includes(kind)) await set('Angle',0);
      await page.locator('#studioProClose').click();
      await stroke([[100,320],[150,320],[200,320],[250,320],[300,320]]);
      footprints[kind] = await canvas.evaluate(sheet => {
        const {data} = sheet.getContext('2d').getImageData(120,290,160,60);
        let covered=0,peak=0,sum=0,top=60,bottom=0;
        for(let i=3;i<data.length;i+=4){
          const alpha=data[i];
          if(!alpha)continue;
          const row=Math.floor(i/(160*4));
          covered++;sum+=alpha;peak=Math.max(peak,alpha);
          top=Math.min(top,row);bottom=Math.max(bottom,row);
        }
        return {covered,peak,sum,height:bottom-top+1};
      });
      await page.locator('#drawingUndo').click();
      assert.equal(await canvas.evaluate(sheet=>sheet.toDataURL()),original,`${kind} is one reversible stroke`);
      await tools.click();
    }
    assert.ok(Object.values(footprints).every(ink=>ink.covered>0 && ink.peak>0));
    assert.equal(new Set(Object.values(footprints).map(ink=>JSON.stringify(ink))).size,11);
    assert.ok(footprints.calligraphy.height<footprints.ink.height && footprints.ink.height<footprints.solid.height);
    assert.ok(footprints.charcoal.covered>footprints['grain-pencil'].covered);
    assert.ok(footprints.water.peak<footprints.gouache.peak);
    assert.ok(footprints.airbrush.height>footprints.solid.height && footprints.airbrush.sum<footprints.solid.sum);
  } finally {
    await page.close();
  }
  console.log('PASS BR named presets, twelve visible models, independent marker opacity, true eraser and undo');
};
