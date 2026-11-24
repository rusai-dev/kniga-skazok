'use strict';
// R05/R15: inspect a real drawing workspace, not a static painted mockup.
const assert=require('node:assert/strict');
module.exports=async function verifyWatercolorDrawing(browser,url){
  for(const [width,height] of [[1024,768],[768,1024],[390,844]]){
    const context=await browser.newContext({viewport:{width,height},serviceWorkers:'block',reducedMotion:'reduce'});
    const page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(String(error)));
    try{
      await page.goto(url);
      await page.locator('#homeNewStory').click();
      await page.locator('#storyBody').fill('Белочка нарисовала сову над рекой.');
      await page.locator('#drawStory').click();
      await page.locator('#drawingCanvas').waitFor({state:'visible',timeout:5000});
      const measure=await page.evaluate(()=>{
        const box=id=>{const element=$(id),rect=element.getBoundingClientRect();return {
          id,x:rect.x,y:rect.y,width:rect.width,height:rect.height,
          visible:getComputedStyle(element).display!=='none'
        }};
        const sheet=$('studioSheet'),panel=$('drawingPanel'),
          colors=$('drawingColors'),container=document.documentElement;
        return {drawing:!!$('modal').classList.contains('drawing-focus'),panelDisplay:getComputedStyle(panel).display,
          sheetBg:getComputedStyle(sheet).backgroundImage,sheetBorder:getComputedStyle(sheet).borderColor,
          paletteBg:getComputedStyle(colors.closest('.studio-palette')).backgroundImage,
          liveStatus:$('drawingStatus').getAttribute('role'),
          expand:box('drawingExpand'),save:box('drawingSave'),clear:box('drawingClear'),cancel:box('drawingCancel'),
          canvas:box('drawingCanvas'),tools:box('drawingUndo'),redo:box('drawingRedo'),
          scroll:container.scrollWidth,client:container.clientWidth};
      });
      assert.equal(measure.drawing,true,'real drawing mode must activate');
      assert.ok(measure.panelDisplay!=='none','drawing studio cannot be hidden');
      assert.ok(measure.sheetBg.includes('gradient'),'R15 watercolor paper framing must be rendered with CSS');
      assert.ok(measure.paletteBg.includes('gradient'),'R15 watercolor palette needs distinct background');
      assert.equal(measure.liveStatus,'status','brush status must remain accessible');
      assert.ok(measure.canvas.width>=200&&measure.canvas.height>=100,'canvas should occupy significant viewport space');
      assert.ok(measure.scroll<=measure.client+2,'R15 drawing horizontal overflow '+width+'x'+height);
      for(const b of [measure.expand,measure.save,measure.clear,measure.cancel,measure.tools,measure.redo]){
        if(!b.visible)continue;
        assert.ok(b.width>=44&&b.height>=44,
          'drawing button '+b.id+' smaller than 44px at '+width+'x'+height+' ('+b.width+'×'+b.height+')');
      }
      const canvas=page.locator('#drawingCanvas'),zoom=page.locator('#drawingDetail');
      const pixels=await canvas.evaluate(el=>el.toDataURL());
      const fitted=(await canvas.boundingBox()).width;
      assert.equal(await zoom.textContent(),'100%');
      for(const id of ['drawingZoomIn','drawingZoomOut','drawingDetail']){
        const box=await page.locator('#'+id).boundingBox();
        assert.ok(box.width>=44&&box.height>=44,'normal mode zoom controls are touch-sized');
      }
      await page.locator('#drawingZoomIn').click();
      await page.locator('#drawingZoomIn').click();
      assert.equal(await zoom.textContent(),'180%');
      assert.ok((await canvas.boundingBox()).width>fitted*1.6,'zoom actually enlarges the sheet');
      await page.locator('#drawingZoomIn').click();
      assert.equal(await zoom.textContent(),'220%');
      assert.ok(await page.locator('#drawingZoomIn').isDisabled());
      await page.locator('#drawingZoomOut').click();
      assert.equal(await zoom.textContent(),'180%');
      await zoom.click();
      assert.equal(await zoom.textContent(),'100%');
      assert.equal(await canvas.evaluate(el=>el.toDataURL()),pixels,'zoom cannot change the canvas bitmap');
      await page.locator('#drawingExpand').click();
      assert.equal(await page.locator('#modal').evaluate(el=>el.classList.contains('canvas-full')),true,
        'real drawing fullscreen remains functional after R15 restyle');
      assert.ok(await page.locator('#drawingCanvas').isVisible(),'canvas must survive fullscreen');
      await page.locator('#drawingExpand').click();
      assert.equal(await page.locator('#modal').evaluate(el=>el.classList.contains('canvas-full')),false,
        'fullscreen must close without losing the canvas');
      const body=await page.locator('#storyBody').inputValue();
      assert.equal(body,'Белочка нарисовала сову над рекой.','restyle must not modify manuscript');
      assert.deepEqual(errors,[]);
    }finally{await context.close()}
    console.log('PASS R05/R15 watercolor drawing workspace '+width+'x'+height);
  }

  for (const [width, height] of [[320, 640], [360, 780], [390, 844], [430, 932]]) {
    const context = await browser.newContext({viewport: {width, height}, hasTouch: true, serviceWorkers: 'block'});
    try {
      const page = await context.newPage();
      const tap = id => page.locator('#' + id).tap();
      const canvas = page.locator('#drawingCanvas');
      const panel = page.locator('#drawingPanel');
      const geometry = () => panel.evaluate(panel => {
        const bounds = panel.getBoundingClientRect();
        const sheet = panel.querySelector('canvas').getBoundingClientRect();
        return {scroll: panel.scrollLeft, overflow: panel.scrollWidth - panel.clientWidth,
          visibleSheet: sheet.left >= bounds.left - 1 && sheet.right <= bounds.right + 1 && sheet.height >= 44};
      });
      await page.goto(url);
      await tap('homeCreate');
      await tap('childDraw');
      await canvas.waitFor({state: 'visible'});
      assert.ok(await page.locator('#studioPro').evaluate(button => {
        const box = button.getBoundingClientRect();
        return box.height >= 44 && box.width >= 44 && button.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2));
      }), 'professional palette must be reachable without scrolling the workspace at ' + width);
      const initial = await geometry();
      assert.ok(initial.visibleSheet && initial.scroll === 0 && initial.overflow <= 1,
        'the viewport keeps the sheet inside the workspace at ' + width + 'px: ' + JSON.stringify(initial));
      await tap('studioPro');
      assert.ok(await page.locator('#studioProPane').isVisible());
      await tap('studioProClose');
      assert.deepEqual(await geometry(), initial, 'opening and closing the palette must preserve the sheet position');
      await canvas.tap();
      assert.ok(await page.locator('#drawingSave').isEnabled());
      await tap('drawingSave');
      await page.locator('#galleryGrid .gallery-piece').waitFor({state: 'visible'});
    } finally {
      await context.close();
    }
  }
  console.log('PASS G29 mobile free drawing and palette at 320, 360, 390 and 430 CSS px');
};
