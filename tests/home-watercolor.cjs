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
     assert.ok(['Пишу свою сказку','Продолжить сказку'].includes(await page.locator('#homeWrite strong').textContent()),'main action distinguishes blank start vs existing books');
     assert.equal(await page.locator('#homeNewStory').textContent(),'✦ Написать сказку');
     assert.equal(await page.locator('.home-map button').count(),4);
     assert.equal(await page.locator('.home-paths button').count(),2);
     const accessibleTeal=await page.locator('#homeNewStory').evaluate(el=>{
       const gradient=getComputedStyle(el).backgroundImage,white=[255,255,255];
       const parts=[...gradient.matchAll(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/g)].map(m=>m.slice(1).map(Number));
       const luminance=rgb=>rgb.map(v=>{const x=v/255;return x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4)}).reduce((t,v,i)=>t+v*[.2126,.7152,.0722][i],0);
       return {contrast:parts.map(c=>(luminance(white)+.05)/(luminance(c)+.05)),gradient};
     });
     assert.ok(accessibleTeal.contrast.length>=2&&accessibleTeal.contrast.every(x=>x>=4.5),
       'primary turquoise action must preserve AA text contrast at both gradient endpoints: '+JSON.stringify(accessibleTeal));
     assert.ok(!await page.locator('#storybookHome .home-story-head').textContent().then(x=>x.includes('Сохранено')),
       'visual design must not lie about a successful storage write');
     for(const selector of ['.home-hero-watercolor','.home-feature-art img']){
       const image=page.locator(selector);
       // On a narrow portrait screen, the secondary hero decoration intentionally
       // disappears so text and the existing dynamic hero remain usable.
       if(selector==='.home-hero-watercolor'&&width<=700){
         assert.equal(await image.isVisible(),false,'phone must prioritize essential content');
         continue;
       }
       assert.ok(await image.isVisible(),selector+' must be actually painted');
       const size=await image.evaluate(async element=>{await element.decode();return [element.naturalWidth,element.naturalHeight]});
       assert.equal(size[0],240,selector+' decoded artwork width must match the repo manifest');
       assert.ok((await image.getAttribute('src')).endsWith('-entry184.webp'),
         selector+' must reuse exactly a previously loaded navigation thumbnail');
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
