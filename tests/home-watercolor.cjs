'use strict';
// R15/R17: approved watercolor direction implemented as real, accessible child-home UI.
// Exercises synthetic browser profiles only, with no children's books or family credentials.
const assert=require('node:assert/strict');
module.exports=async function verifyWatercolorHome(browser,url){
 const ctx=await browser.newContext({serviceWorkers:'block'});
 const page=await ctx.newPage(),errors=[];
 page.on('pageerror',err=>errors.push(String(err)));
 try{
   for(const [width,height] of [[1024,768],[768,1024],[834,1194],[390,844]]){
     await page.setViewportSize({width,height});await page.goto(url);
     assert.equal(await page.locator('#storybookHome .home-intro h1').textContent(),'Книга сказок');
     assert.equal(await page.locator('#storybookHome .home-story-head h2').textContent(),'Мои сказки');
     assert.equal(await page.locator('#homeWrite strong').textContent(),'Продолжить сказку');
     assert.equal(await page.locator('#homeNewStory').textContent(),'✦ Написать сказку');
     assert.equal(await page.locator('.home-map button').count(),4);
     assert.equal(await page.locator('.home-paths button').count(),2);
     assert.ok(!await page.locator('#storybookHome .home-story-head').textContent().then(x=>x.includes('Сохранено')),
       'visual design must not lie about a successful storage write');
     for(const selector of ['.home-hero-watercolor','.home-feature-art img']){
       const image=page.locator(selector);
       assert.ok(await image.isVisible(),selector+' must be actually painted');
       const size=await image.evaluate(async element=>{await element.decode();return [element.naturalWidth,element.naturalHeight]});
       assert.equal(size[0],240,selector+' must use small real authored watercolor asset');
     }
     const checks=await page.evaluate(()=>{
       const ids=['homeWrite','homeNewStory','homeDrafts','homeBooks','homeCreate','readingEntry','homeMath','homeLogic','childWorld'];
       return {overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
         buttons:ids.map(id=>{const x=document.getElementById(id),b=x.getBoundingClientRect();return {id,width:b.width,height:b.height}}),
         scroll:document.documentElement.scrollHeight-window.innerHeight};
     });
     assert.ok(checks.overflow<=1,'no horizontal scroll for '+width+'x'+height+': '+checks.overflow);
     for(const b of checks.buttons)assert.ok(b.width>=44&&b.height>=44,
       'finger target '+b.id+' '+width+'x'+height+': '+b.width+'x'+b.height);
     if(width===1024)assert.ok(checks.scroll<=50,
       'landscape iPad first screen should not require long forced scrolling: '+checks.scroll);
   }
   await page.setViewportSize({width:1024,height:768});await page.goto(url);
   await page.locator('#homeNewStory').click();
   assert.ok(await page.locator('#storyBody').isVisible(),'new story CTA opens real writer');
   await page.keyboard.press('Escape');
   await page.locator('#homeWrite').click();
   assert.ok(await page.locator('#storyBody').isVisible(),'resume CTA opens real writer');
   await page.keyboard.press('Escape');
   await page.locator('#homeBooks').click();
   assert.ok(await page.locator('#libraryHome').isVisible(),'book shelf CTA still navigates');
   await page.locator('#home').click();
   await page.locator('#homeCreate').click();
   assert.ok(await page.locator('#creativeHome').isVisible(),'creative studio CTA still navigates');
   assert.deepEqual(errors,[]);
 }finally{await ctx.close()}
 console.log('PASS watercolor story home responsive iPad, accessible touch targets, real artwork and working writer routes');
};
