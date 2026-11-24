'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const {createHash} = require('node:crypto');
const fingerprint = content => createHash('sha256').update(content).digest('hex');

async function exportFile(page, button) {
  const download = page.waitForEvent('download');
  await page.locator(button).click();
  return fs.readFile(await (await download).path());
}

function decodeSample(page, bytes, mime) {
  return page.evaluate(async ({data, mime}) => {
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = 'data:' + mime + ';base64,' + data;
    });
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const context = canvas.getContext('2d');
    context.drawImage(img, 0, 0);
    return {width: canvas.width, height: canvas.height, corner: Array.from(context.getImageData(0, 0, 1, 1).data)};
  }, {data: bytes.toString('base64'), mime});
}

module.exports = async function verifyProjectProfiles(browser, url) {
  const page = await browser.newPage({viewport: {width: 1024, height: 768}, serviceWorkers: 'block'});
  try {
    await page.goto(url);
    await page.locator('#homeCreate').click();
    await page.locator('#childDraw').click();
    await page.locator('#openProjects').click();
    await page.locator('#newProject').click();
    await page.locator('#newProjectTitle').fill('Прозрачный квадрат');
    await page.locator('#newProjectSize').selectOption('4096×4096');
    await page.locator('#newProjectStatus').filter({hasText: 'превышает рабочий бюджет'}).waitFor();
    assert.ok(await page.locator('#createProject').isDisabled());
    assert.equal(await page.evaluate(async () => (await (await studioProjectStore()).list()).length), 0);

    await page.locator('#newProjectSize').selectOption('2048×2048');
    await page.locator('#newProjectBackground').selectOption('transparent');
    await page.locator('#createProject').click();
    const canvas = page.locator('#drawingCanvas');
    await canvas.waitFor();
    assert.deepEqual(await canvas.evaluate(sheet => [sheet.width, sheet.height]), [2048, 2048]);
    const bounds = await canvas.boundingBox();
    assert.ok(Math.abs(bounds.width - bounds.height) <= 1, 'square document keeps its proportions in the viewport');
    const openLayers = async () => {
      await page.locator('#studioMore summary').click();
      await page.locator('#openProjectLayers').click();
    };
    const closeLayers = async () => {
      await page.locator('#closeProjectLayers').click();
      await page.locator('#studioMore summary').click();
    };
    await openLayers();
    for (let layer = 1; layer <= 7; layer++) await page.locator('#addProjectLayer').click();
    assert.equal(await page.locator('#projectLayerRows li').count(), 8);
    await closeLayers();
    await canvas.click({position: {x: 140, y: 145}});
    const png = await canvas.evaluate(sheet => sheet.toDataURL());
    const hasOpaquePixels = await canvas.evaluate(sheet => {
      const {data} = sheet.getContext('2d').getImageData(0, 0, sheet.width, sheet.height);
      for (let i=3; i<data.length; i+=4) if (data[i]===255) return true;
      return false;
    });
    assert.ok(hasOpaquePixels, 'the active layer has a painted mark');
    await page.locator('#studioMore summary').click();
    const alpha = await decodeSample(page, await exportFile(page, '#drawingRescue'), 'image/png');
    assert.deepEqual(alpha, {width: 2048, height: 2048, corner: [0, 0, 0, 0]});
    await page.locator('#openProjectLayers').click();
    const white = await decodeSample(page, await exportFile(page, '#exportProjectOnWhite'), 'image/png');
    assert.deepEqual(white, {width: 2048, height: 2048, corner: [255, 255, 255, 255]});
    const jpeg = await decodeSample(page, await exportFile(page, '#exportProjectJpeg'), 'image/jpeg');
    assert.deepEqual(jpeg, white);
    await closeLayers();
    assert.equal(fingerprint(await canvas.evaluate(sheet => sheet.toDataURL())), fingerprint(png), 'export leaves the editor canvas unchanged');
    await page.locator('#drawingSave').click();
    await page.locator('#projectShelf').waitFor().catch(async error => {
      throw new Error(`${error.message}\n${await page.locator('#modalBody').innerText()}`);
    });
    const archive = await exportFile(page, 'button[aria-label="Скачать архив «Прозрачный квадрат»"]');
    const originalRevisions = JSON.parse(archive).revisions;
    assert.equal(originalRevisions.at(-1).layers.length, 8);
    await page.locator('#projectImport:enabled').waitFor();
    await page.locator('#projectArchiveFile').setInputFiles({name: 'square.json', mimeType: 'application/json', buffer: archive});
    await page.locator('#confirmProjectImport').click();
    await page.locator('#projectShelf').getByRole('button', {name: 'Прозрачный квадрат · копия', exact: true}).click();
    await page.locator('#drawingStatus').filter({hasText: 'Продолжай свой сохранённый рисунок'}).waitFor();
    const comparison = await canvas.evaluate(async (sheet, source) => {
      const image = new Image();
      await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; image.src = source; });
      const copy = document.createElement('canvas'); copy.width = sheet.width; copy.height = sheet.height;
      const context = copy.getContext('2d'); context.drawImage(image, 0, 0);
      const before = context.getImageData(0, 0, sheet.width, sheet.height).data;
      const after = sheet.getContext('2d').getImageData(0, 0, sheet.width, sheet.height).data;
      let alpha = 0, opaque = 0, edge = 0;
      for (let i=0; i<before.length; i+=4) {
        alpha = Math.max(alpha, Math.abs(before[i+3]-after[i+3]));
        for (let c=0; c<3; c++) {
          const difference = Math.abs(before[i+c]-after[i+c]);
          if (before[i+3]===255) opaque = Math.max(opaque, difference);
          else if(before[i+3]>0) edge = Math.max(edge, difference);
        }
      }
      return {alpha, opaque, edge};
    }, png);
    assert.deepEqual(comparison, {alpha: 0, opaque: 0, edge: 0});
    const kept = await page.evaluate(async () => {
      const store = await studioProjectStore(), copy = (await store.list()).find(item => item.title.endsWith(' · копия'));
      const restored = await store.read(copy.documentId, true);
      return {root: restored.detail.originalHash, revisions: restored.revisions.map(snapshot => snapshot.layers.map(layer => layer.hash))};
    });
    assert.deepEqual(kept, {root: originalRevisions[0].originalHash,
      revisions: originalRevisions.map(revision => revision.layers.map(layer => layer.hash))});
  } finally {
    await page.close();
  }
  console.log('PASS CAN01/CAN04 2048×2048 with eight layers, rejected preflight, PNG alpha/white, JPEG and archive round-trip');
};
