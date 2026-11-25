'use strict';

const assert = require('node:assert/strict');

module.exports = async function verifyProjectGroups(browser, url) {
  const page = await browser.newPage({viewport: {width: 1024, height: 768}, serviceWorkers: 'block'});
  try {
    await page.goto(url);
    await page.locator('#homeCreate').click();
    await page.locator('#childDraw').click();
    await page.locator('#openProjects').click();
    await page.locator('#newProject').click();
    await page.locator('#newProjectTitle').fill('Группа и референс');
    await page.locator('#newProjectSize').selectOption('720×480');
    await page.locator('#createProject').click();
    const canvas = page.locator('#drawingCanvas');
    await canvas.waitFor();
    const png = () => canvas.evaluate(sheet => sheet.toDataURL());
    const blank = await png();
    const pixel = (x, y) => canvas.evaluate((sheet, [x, y]) => Array.from(sheet.getContext('2d').getImageData(x, y, 1, 1).data), [x, y]);
    const tools = page.locator('#studioMore summary'), rows = page.locator('#projectLayerRows');
    const button = name => rows.getByRole('button', {name, exact: true});
    const layers = async () => { await tools.click(); await page.locator('#openProjectLayers').click(); };
    const back = async () => { await page.locator('#closeProjectLayers').click(); await tools.click(); };
    const saved = () => page.locator('#drawingStatus').filter({hasText: 'Проект сохранён'}).waitFor();
    const color = value => page.evaluate(value => {
      const input = $('drawingCustom'); input.value = value; input.dispatchEvent(new Event('input', {bubbles: true}));
    }, value);
    const paint = async (x, y) => {
      const box = await canvas.boundingBox();
      await canvas.click({position: {x:x*box.width/720, y:y*box.height/480}});
    };
    await color('#173b95');
    await paint(120, 140);
    await layers(); await page.locator('#addProjectLayer').click(); await back();
    await color('#377421');
    await paint(460, 120);
    const two = await png();

    await layers();
    await button('Сгруппировать с нижним').click();
    const layer2 = button('Слой 2');
    const over = async (source,target,above) => rows.evaluate((list,{source,target,above}) => {
      const buttons=Array.from(list.querySelectorAll('[data-layer-action$=":select"]'));
      const from=buttons.find(button=>button.textContent===source),to=buttons.find(button=>button.textContent===target).closest('li');
      const transfer=new DataTransfer(),bounds=to.getBoundingClientRect();
      from.dispatchEvent(new DragEvent('dragstart',{bubbles:true,cancelable:true,dataTransfer:transfer}));
      const event={bubbles:true,cancelable:true,clientY:bounds.top+bounds.height*(above ? 0.25 : 0.75),dataTransfer:transfer};
      to.dispatchEvent(new DragEvent('dragover',event));
      to.dispatchEvent(new DragEvent('drop',event));
    },{source,target,above});
    const order = () => rows.locator('[data-layer-action$=":select"]').allTextContents();
    assert.equal(await layer2.getAttribute('draggable'),'true');
    await over('Слой 2','Слой 1',false);
    assert.deepEqual(await order(),['Слой 1','Слой 2']);
    assert.equal(await png(), two);
    await over('Слой 2','Слой 1',true);
    assert.deepEqual(await order(),['Слой 2','Слой 1']);
    await button('Скрыть группу').click();
    assert.equal(await png(), blank);
    await button('Показать группу').click();
    assert.equal(await png(), two);
    await button('Заблокировать группу').click();
    await back();
    await paint(260, 185);
    assert.equal(await png(), two);
    await layers();
    await button('Разблокировать группу').click();
    page.once('dialog', dialog=>dialog.accept());
    await button('Объединить с нижним').click();
    assert.equal(await png(), two);
    assert.equal(await button('Слой 2').count(), 0);
    await back();
    await page.locator('#drawingUndo').click();
    await layers();
    assert.equal(await button('Слой 2').count(), 1);
    await button('Разгруппировать').click();
    await button('Референс для заливки').click();
    await back();
    await color('#000000');
    await canvas.evaluate(sheet => {
      const box = sheet.getBoundingClientRect();
      for (const [type,y] of [['pointerdown', box.top], ['pointerup', box.bottom]]) {
        sheet.dispatchEvent(new PointerEvent(type, {pointerId:12,pointerType:'pen',isPrimary:true,
          clientX:box.left+box.width/2,clientY:y,pressure:1}));
      }
    });
    await saved();
    const beforeFill = await page.evaluate(async () => {
      const store = await studioProjectStore(), [project] = await store.list();
      return (await store.read(project.documentId)).detail;
    });
    assert.equal(beforeFill.layers[1].id, beforeFill.referenceLayerId);
    await layers(); await button('Слой 1').click(); await back();
    await color('#de7247');
    await page.locator('#drawingPanel [data-tool="fill"]').first().click();
    await paint(140, 285);
    await saved();
    assert.deepEqual(await pixel(160, 285), [222, 114, 71, 255]);
    assert.deepEqual(await pixel(530, 285), [255, 255, 255, 255]);
    const head = await page.evaluate(async id => (await (await studioProjectStore()).read(id)).detail, beforeFill.documentId);
    assert.equal(head.layers[1].hash, beforeFill.layers[1].hash, 'reference pixels are read-only during fill');
    assert.equal(head.referenceLayerId, beforeFill.referenceLayerId);
  } finally {
    await page.close();
  }
  console.log('PASS LY01/LY02 drag order, groups, visibility, lock, merge undo and reference barrier across distinct layer data');
};
