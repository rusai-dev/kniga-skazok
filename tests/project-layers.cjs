'use strict';

const assert = require('node:assert/strict');
const saved = page => page.locator('#drawingStatus').filter({hasText: 'Проект сохранён'}).waitFor({state: 'visible'});
const png = page => page.locator('#drawingCanvas').evaluate(canvas => canvas.toDataURL('image/png'));

async function paint(page, color, position) {
  const canvas = page.locator('#drawingCanvas');
  await canvas.waitFor();
  await page.evaluate(value => {
    const input = $('drawingCustom');
    input.value = value;
    input.dispatchEvent(new Event('input', {bubbles: true}));
  }, color);
  await canvas.click({position});
}

module.exports = async function verifyProjectLayers(browser, url) {
  const page = await browser.newPage({viewport: {width: 1024, height: 768}, serviceWorkers: 'block'});
  try {
    await page.goto(url);
    await page.locator('#homeCreate').click();
    await page.locator('#childDraw').click();
    await paint(page, '#193983', {x: 100, y: 120});
    const base = await png(page);
    await page.locator('#studioMore summary').click();
    await page.locator('#drawingSaveProject').click();
    await page.locator('#toast').filter({hasText: 'Копия сохранена'}).waitFor({state: 'visible'});
    const [original] = await page.evaluate(async () => (await studioProjectStore()).list());
    const open = async () => {
      await page.locator('#projectShelf').getByRole('button', {name: original.title, exact: true}).click();
      await page.locator('#drawingStatus').filter({hasText: 'Продолжай свой сохранённый рисунок'}).waitFor();
    };
    await page.locator('#openProjects').click();
    await open();
    const openPanel = async () => {
      await page.locator('#studioMore summary').click();
      await page.locator('#openProjectLayers').click();
    };
    const dismiss = async () => {
      await page.locator('#closeProjectLayers').click();
      await page.locator('#studioMore summary').click();
    };
    const rows = page.locator('#projectLayerRows li');
    const top = rows.first();
    await openPanel();
    await page.locator('#addProjectLayer').click();
    await saved(page);
    assert.equal(await rows.count(), 2);
    assert.equal(await top.getByRole('button', {name: 'Слой 2'}).getAttribute('aria-pressed'), 'true');
    page.once('dialog', dialog => dialog.accept('Цвет'));
    await top.getByRole('button', {name: 'Переименовать'}).click();
    await saved(page);
    await dismiss();
    await paint(page, '#a31f2f', {x: 160, y: 170});
    await saved(page);
    const painted = await png(page);
    assert.notEqual(painted, base);

    await openPanel();
    await top.getByRole('button', {name: 'Скрыть'}).click();
    assert.equal(await png(page), base, 'hiding the upper layer leaves the original pixels untouched');
    await dismiss();
    await page.locator('#drawingUndo').click();
    assert.equal(await png(page), painted);
    await page.locator('#drawingRedo').click();
    assert.equal(await png(page), base);
    await openPanel();
    await top.getByRole('button', {name: 'Показать'}).click();
    await top.getByRole('button', {name: 'Заблокировать'}).click();
    await saved(page);
    await dismiss();
    await paint(page, '#009100', {x: 215, y: 209});
    await page.locator('#drawingStatus').filter({hasText: 'Выбери видимый и разблокированный слой'}).waitFor();
    assert.equal(await png(page), painted);

    await openPanel();
    await top.getByLabel('Режим смешивания').selectOption('multiply');
    await top.getByLabel('Непрозрачность').press('Home');
    assert.equal(await png(page), base);
    await top.getByLabel('Непрозрачность').press('End');
    await top.getByRole('button', {name: 'Ниже'}).click();
    assert.equal(await rows.last().getByRole('button', {name: 'Цвет'}).count(), 1);
    await saved(page);
    const composed = await png(page);
    await dismiss();
    await page.locator('#drawingSave').click();
    await open();
    assert.equal(await png(page), composed);
    const detail = await page.evaluate(async id => (await (await studioProjectStore()).read(id)).detail, original.documentId);
    assert.equal(detail.originalHash, original.originalHash);
    assert.equal(detail.layers.length, 2);
    assert.equal(detail.activeLayerId, detail.layers[0].id);
    assert.deepEqual(detail.layers.map(({name, visible, locked, opacity, blend}) => ({name, visible, locked, opacity, blend})), [
      {name: 'Цвет', visible: true, locked: true, opacity: 1, blend: 'multiply'},
      {name: 'Слой 1', visible: true, locked: false, opacity: 1, blend: 'source-over'},
    ]);

    const mark = {x: 225, y: 190}, outside = {x: 270, y: 200};
    const pixel = point => page.locator('#drawingCanvas').evaluate((canvas, {x, y}) => {
      const bounds = canvas.getBoundingClientRect();
      return Array.from(canvas.getContext('2d').getImageData(Math.floor(x * canvas.width / bounds.width),
        Math.floor(y * canvas.height / bounds.height), 1, 1).data);
    }, point);
    const paper = await pixel(mark);
    await openPanel();
    await page.locator('#addProjectLayer').click();
    await dismiss();
    await paint(page, '#2b3ca0', mark);
    await saved(page);
    const ink = await pixel(mark);
    assert.notDeepEqual(ink, paper);
    await openPanel();
    await top.getByRole('button', {name: 'Альфа-замок'}).click();
    await dismiss();
    await paint(page, '#4a891e', outside);
    assert.deepEqual(await pixel(outside), paper);
    await paint(page, '#4a891e', mark);
    const green = await pixel(mark);
    assert.notDeepEqual(green, ink);
    assert.notDeepEqual(green, paper);

    await openPanel();
    await top.getByRole('button', {name: 'Добавить маску'}).click();
    assert.equal(await top.getByRole('button', {name: 'Рисовать на маске'}).getAttribute('aria-pressed'), 'true');
    await dismiss();
    await page.locator('#drawingPanel [data-tool="eraser"]').first().click();
    await page.locator('#drawingCanvas').click({position: mark});
    assert.deepEqual(await pixel(mark), paper);
    await page.locator('#drawingUndo').click();
    assert.deepEqual(await pixel(mark), green);
    await page.locator('#drawingRedo').click();
    assert.deepEqual(await pixel(mark), paper);
    await openPanel();
    await top.getByRole('button', {name: 'Инвертировать маску'}).click();
    assert.deepEqual(await pixel(mark), green);
    await top.getByRole('button', {name: 'Инвертировать маску'}).click();
    assert.deepEqual(await pixel(mark), paper);
    await top.getByRole('button', {name: 'Выключить маску'}).click();
    assert.deepEqual(await pixel(mark), green);

    await page.locator('#addProjectLayer').click();
    await top.getByRole('button', {name: 'Обтравка'}).click();
    await dismiss();
    await paint(page, '#fe3905', outside);
    assert.deepEqual(await pixel(outside), paper);
    await paint(page, '#fe3905', mark);
    const orange = await pixel(mark);
    assert.notDeepEqual(orange, green);
    await saved(page);
    const model = await page.evaluate(async id => {
      const {detail, pixels} = await (await studioProjectStore()).read(id, true);
      return {layer: detail.layers[2], clip: detail.layers[3].clipping, hasMask: pixels.has(detail.layers[2].maskHash)};
    }, original.documentId);
    assert.ok(model.clip && model.hasMask && model.layer.alphaLock && !model.layer.maskEnabled);
    await page.locator('#drawingSave').click();
    await open();
    assert.deepEqual(await pixel(mark), orange);
    assert.deepEqual(await pixel(outside), paper);
  } finally {
    await page.close();
  }
  console.log('PASS LY01 layer pixels, visibility, lock, opacity, blend, order, undo/redo and reopen');
  console.log('PASS LY02 locked alpha, editable mask, reversal, clipping and durable separate mask PNG');
};
