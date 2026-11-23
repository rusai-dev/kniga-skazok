'use strict';
// R01/R15/R17 synthetic visual/interaction acceptance for the approved 1.5.199 home.
const assert=require('node:assert/strict');
module.exports=async function verifyWatercolorHome(browser,url){
  const sizes=[[1024,768],[768,1024],[834,1194],[390,700],[600,800]];
  for(const [width,height] of sizes){
    const context=await browser.newContext({viewport:{width,height},serviceWorkers:'block',reducedMotion:'reduce'});
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(String(e)));
    try{
      await page.goto(url);
      const snapshot=await page.evaluate(()=>{
        const rect=id=>{const node=document.getElementById(id);if(!node)return null;const r=node.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,visible:!!r.width&&!!r.height&&getComputedStyle(node).visibility!=='hidden'}};
        const ids=['homeWrite','homeNewStory','homeDrafts','homeBooks','homeCreate','readingEntry','homeMath','homeLogic','childWorld'];
        const cards=Object.fromEntries(ids.map(id=>[id,rect(id)]));
        const art=getComputedStyle(document.querySelector('#homeWrite .home-feature-art')).backgroundImage;
        const link=[...document.styleSheets].some(s=>(s.href||'').includes('watercolor-home-199.css'));
        return {cards,art,link,heading:document.querySelector('#storybookHome .home-story-heading h2')?.textContent?.trim(),
          hero:document.querySelector('#storybookHome .home-intro h1')?.textContent?.trim(),
          width:document.documentElement.scrollWidth,viewWidth:innerWidth,
          mapEnd:document.querySelector('#storybookHome .home-map')?.getBoundingClientRect().bottom};
      });
      assert.equal(snapshot.link,true,'approved CSS must load at '+width+'x'+height);
      assert.equal(snapshot.heading,'Мои сказки');
      assert.equal(snapshot.hero,'Книга сказок');
      assert.ok(snapshot.art.includes('egypt-nile-cover-320-v1.webp'),'real art must be used in main story card');
      assert.ok(snapshot.width<=snapshot.viewWidth+2,'unexpected horizontal overflow at '+width+'x'+height);
      for(const [id,r] of Object.entries(snapshot.cards)){
        assert.ok(r&&r.visible,id+' invisible at '+width+'x'+height);
        assert.ok(r.width>=44&&r.height>=44,id+' touch target too small at '+width+'x'+height);
      }
      if(width===1024&&height===768)assert.ok(snapshot.mapEnd<=height+2,'secondary navigation must fit landscape iPad without forced scrolling');
      assert.equal(await page.locator('#storybookHome .home-paths button').count(),2,'existing books and creativity routes preserved');
      assert.equal(await page.locator('#storybookHome .home-map button').count(),4,'secondary learning routes preserved');
      await page.locator('#homeNewStory').click();
      assert.ok(await page.locator('#storyBody').isVisible(),'new story must still open working editor');
      assert.deepEqual(errors,[],'no JS runtime errors');
      console.log('PASS R15 watercolor home '+width+'x'+height+' mapEnd='+Math.round(snapshot.mapEnd));
    }finally{await context.close()}
  }
};
