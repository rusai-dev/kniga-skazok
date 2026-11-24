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
  } finally {
    await page.close();
  }
  console.log('PASS LY01 layer pixels, visibility, lock, opacity, blend, order, undo/redo and reopen');
};
