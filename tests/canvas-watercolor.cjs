'use strict';
// R05/R15/R17: the real drawing surface adopts the watercolor design without
// changing strokes, zoom, saves or the underlying white bitmap.
const assert=require('node:assert/strict');

module.exports=async function verifyWatercolorCanvas(browser,url){
  for(const [width,height] of [[1024,768],[768,1024],[390,844]]){
    const ctx=await browser.newContext({viewport:{width,height},serviceWorkers:'block',reducedMotion:'reduce'});
    const page=await ctx.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(String(e)));
    try{
      await page.goto(url);
      await page.locator('#homeNewStory').click();
      const manuscript='Белочка открыла альбом и решила нарисовать свой лес.';
      await page.locator('#storyBody').fill(manuscript);
      await page.locator('#drawStory').click();
      await page.locator('#drawingCanvas').waitFor({state:'visible'});
      const values=await page.evaluate(()=>{
        const pick=(id)=>$(id),style=(id)=>getComputedStyle(pick(id)),
          box=(id)=>{const x=pick(id).getBoundingClientRect();return {x:x.x,y:x.y,w:x.width,h:x.height,right:x.right,bottom:x.bottom}},
          buttons=['drawingExpand','drawingSave','drawingCancel','drawingUndo','drawingRedo']
            .map(id=>({id,...box(id),visible:pick(id).getClientRects().length>0}));
        return {
          pageWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,
          drawer:!!document.querySelector('#modal.drawing-focus #drawingPanel:not([hidden])'),
          sheetBg:style('studioSheet').backgroundImage,
          canvasBg:style('drawingCanvas').backgroundColor,
          toolBg:getComputedStyle(document.querySelector('#drawingPanel .studio-tools')).backgroundImage,
          paletteBg:getComputedStyle(document.querySelector('#drawingPanel .studio-palette')).backgroundImage,
          saveBg:style('drawingSave').backgroundColor,
          saveDisabled:pick('drawingSave').disabled,
          sheet:box('studioSheet'),canvas:box('drawingCanvas'),buttons
        };
      });
      assert.equal(values.drawer,true,'real drawing panel must be open');
      assert.ok(values.pageWidth<=values.clientWidth+2,'drawing studio horizontal overflow '+width+'x'+height);
      assert.ok(values.sheetBg.includes('gradient'),'R15 watercolor sheet frame missing');
      assert.ok(values.toolBg.includes('gradient'),'R15 watercolor tools background missing');
      assert.ok(values.paletteBg.includes('gradient'),'R15 watercolor palette missing');
      assert.equal(values.canvasBg,'rgb(255, 255, 255)','R05 drawing paper must remain pure white');
      assert.equal(values.saveBg,values.saveDisabled?'rgb(220, 232, 230)':'rgb(15, 118, 110)','R05 primary insert must look inactive until there is a drawing');
      assert.ok(values.canvas.w>120&&values.canvas.h>90,'R05 drawing area must be visible and usable');
      for(const b of values.buttons){
        if(!b.visible)continue;
        assert.ok(b.w>=44&&b.h>=44,'R05 finger-sized '+b.id+' '+width+'x'+height+' '+b.w+'x'+b.h);
      }
      await page.locator('#drawingExpand').click();
      assert.equal(await page.locator('#drawingExpand').getAttribute('aria-pressed'),'true','real fullscreen toggle');
      await page.locator('#drawingExpand').click();
      assert.equal(await page.locator('#drawingExpand').getAttribute('aria-pressed'),'false','real fullscreen exit');
      await page.locator('#drawingCancel').click();
      assert.equal(await page.locator('#storyBody').inputValue(),manuscript,'leaving art studio must keep manuscript');
      assert.deepEqual(errors,[],'no canvas JavaScript errors');
    }finally{await ctx.close()}
    console.log('PASS R05/R15 watercolor canvas '+width+'x'+height);
  }
};
