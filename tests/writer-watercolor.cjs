'use strict';
// R03/R04/R15: original editor remains usable as a live watercolor writing surface.
const assert=require('node:assert/strict');
module.exports=async function verifyWatercolorWriter(browser,url){
  for(const [width,height] of [[1024,768],[768,1024],[390,844]]){
    const ctx=await browser.newContext({viewport:{width,height},serviceWorkers:'block',reducedMotion:'reduce'});
    const page=await ctx.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(String(e)));
    try{
      await page.goto(url);
      await page.locator('#homeNewStory').click();
      const form=page.locator('#storyForm'),title=form.locator('.writer-artbar-title');
      assert.equal(await form.isVisible(),true,'new story editor must remain accessible');
      assert.equal(await form.locator('#storyBody').isVisible(),true,'story page stays visible');
      assert.equal(await form.locator('#drawStory').isVisible(),true,'drawing action next to text');
      assert.equal(await form.locator('#writerGallery').isVisible(),true,'drawing gallery next to text');
      assert.equal(await form.locator('.writer-artbar').getAttribute('role'),'group','art actions need a named group');
      assert.equal(await form.locator('.writer-artbar').getAttribute('aria-label'),'Рисунки к сказке');

      const metrics=await page.evaluate(()=>{
        const form=$('storyForm'),art=form.querySelector('.writer-artbar'),title=art.querySelector('.writer-artbar-title'),
          box=el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,bottom:r.bottom};};
        const buttons=['drawStory','writerGallery','pictureStory','previewStory'].map(id=>({id,...box($(id))}));
        return {width:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth,
          keyboard:form.classList.contains('keyboard-writing'),display:getComputedStyle(form).display,
          artImage:getComputedStyle(art,'::before').backgroundImage,
          titleVisible:getComputedStyle(title).display!=='none',
          page:box($('storyBody')),sidebar:box(art),buttons};
      });
      assert.ok(metrics.width<=metrics.viewport+2,'writer horizontal overflow at '+width+'x'+height);
      for(const b of metrics.buttons){
        assert.ok(b.w>=44&&b.h>=44,'writer action '+b.id+' not finger-sized at '+width+'x'+height);
      }
      if(width===1024&&!metrics.keyboard){
        assert.equal(metrics.display,'grid','landscape iPad should place tools beside manuscript');
        assert.ok(metrics.sidebar.x>metrics.page.x+metrics.page.w-4,'side tool panel must be to the right');
        assert.ok(metrics.titleVisible,'art tools should have a visible heading');
        assert.ok(metrics.artImage.includes('rabbit-painting-entry184.webp'),'use existing optimized watercolor art in the sidebar');
      }
      const story='Белочка открыла книгу и нарисовала сову. Это моя новая сказка.';
      await page.locator('#storyBody').fill(story);
      assert.equal(await page.locator('#storyBody').inputValue(),story);
      await page.evaluate(()=>{const el=$('storyBody');el.focus();writerViewportFit({width:innerWidth,height:230,offsetTop:0,scale:1})});
      assert.equal(await page.locator('#drawStory').isVisible(),true,'drawing remains reachable with virtual keyboard');
      assert.equal(await page.locator('#writerGallery').isVisible(),true,'gallery remains reachable with virtual keyboard');
      assert.equal(await page.locator('#storyBody').inputValue(),story,'keyboard layout cannot delete manuscript');
      await page.evaluate(()=>writerViewportFit(window.visualViewport));
      await page.locator('#drawStory').click();
      assert.equal(await page.locator('#drawingCanvas').isVisible(),true,'real drawing canvas must open from the editor');
      assert.deepEqual(errors,[]);
    }finally{await ctx.close()}
    console.log('PASS R03/R04/R15 watercolor editor '+width+'x'+height);
  }
};
