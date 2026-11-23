'use strict';
// R15/R17: approved watercolor direction implemented as real, accessible child-home UI.
// Exercises synthetic browser profiles only, with no children's books or family credentials.
const assert=require('node:assert/strict');
const banner=require('../assets/author/studio/home-storybook-banner-manifest.json');
const cat=require('../assets/author/studio/home-egypt-cat-manifest.json');
module.exports=async function verifyWatercolorHome(browser,url){
 const ctx=await browser.newContext({serviceWorkers:'block'});
 const page=await ctx.newPage(),errors=[];
 const seenCompanions=new Set();
 page.on('pageerror',err=>errors.push(String(err)));
 try{
   for(const [width,height] of [[1024,768],[1194,834],[1366,1024],[768,1024],[834,1194],[600,800],[512,384],[390,844],[320,700]]){
     await page.setViewportSize({width,height});await page.goto(url);
     assert.equal(await page.locator('#storybookHome .home-intro h1').textContent(),'Книга сказок');
     assert.equal(await page.locator('#storybookHome .home-story-head h2').textContent(),'Мои сказки');
     assert.equal(await page.locator('#homeWrite strong').textContent(),'Пишу свою сказку','blank profile starts a new story');
     assert.equal(await page.locator('#homeNewStory').textContent(),'✦ Написать сказку');
     assert.equal(await page.locator('.home-map button').count(),4);
     assert.equal(await page.locator('.home-paths button').count(),2);

     // Rotating nine-scene-hero feature stays real and clearly named in the
     // reference redesign. The image must not crop a face at any breakpoint.
     const companion=page.locator('#homeFox img[data-scene]');
     await companion.waitFor({state:'visible'});
     const hero=await companion.evaluate(async img=>{
       await img.decode();
       const style=getComputedStyle(img),caption=document.getElementById('friendGreeting');
       const r=caption.getBoundingClientRect(),greeting=getComputedStyle(caption);
       return {id:img.dataset.hero,name:img.alt,
         scene:img.dataset.scene,
         naturalWidth:img.naturalWidth,fit:style.objectFit,
         caption:caption.textContent,
         ariaLive:caption.getAttribute('aria-live'),
         pillHeight:r.height,display:greeting.display};
     });
     assert.equal(hero.naturalWidth,288,'companion must use a real lightweight 288px scene');
     assert.equal(hero.fit,'contain','rotating hero face must not be cropped');
     assert.equal(hero.caption,'Сегодня с тобой '+hero.name,'illustration and greeting must identify the same companion');
     assert.equal(hero.ariaLive,'polite','companion changes should be announced accessibly');
     assert.ok(hero.pillHeight>=27,'live companion greeting must remain readable');
     seenCompanions.add(hero.id);

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
     for(const [selector,asset,faces] of [
       ['.home-hero-watercolor',banner,[[3,126,83,224],[132,31,301,197],[328,6,403,66]]],
       ['.home-feature-art img',cat,[[87,40,161,108]]]
     ]){
       const image=page.locator(selector);
       assert.ok(await image.isVisible(),selector+' must be painted at '+width+'×'+height);
       const frame=await image.evaluate(async (img,faces)=>{
         await img.decode();
         const style=getComputedStyle(img),box=img.getBoundingClientRect();
         const scales=[box.width/img.naturalWidth,box.height/img.naturalHeight];
         const scale=style.objectFit==='cover'?Math.max(...scales):Math.min(...scales);
         const [px,py]=style.objectPosition.split(' ').map(value=>parseFloat(value)/100);
         const x=(box.width-img.naturalWidth*scale)*px;
         const y=(box.height-img.naturalHeight*scale)*py;
         return {
           width:img.naturalWidth,height:img.naturalHeight,fit:style.objectFit,ratio:box.width/box.height,
           path:new URL(img.currentSrc).pathname,position:style.objectPosition,
           visible:faces.every(([left,top,right,bottom])=>
             x+left*scale>=0&&y+top*scale>=0&&x+right*scale<=box.width&&y+bottom*scale<=box.height)
         };
       },faces);
       assert.ok(frame.path.endsWith('/'+asset.path),selector+' uses approved project artwork');
       assert.deepEqual([frame.width,frame.height],[asset.width,asset.height]);
       assert.ok(frame.visible,selector+' must keep every face inside its painted frame at '+width+'×'+height);
       if(asset===banner&&width<950){
         assert.ok(Math.abs(frame.ratio-asset.width/asset.height)<.02,'portrait banner preserves its natural proportions');
       }
       if(asset===cat){
         assert.equal(frame.fit,'cover','wide Egyptian cat art fills the story CTA');
         assert.equal(frame.position,'42% 92%','cat muzzle remains in the approved crop');
       }
     }
     // A real screenshot audit found the old absolutely-positioned Friends
     // button covering the title in landscape, portrait and phone.
     const [headBox,friendBox]=await Promise.all([
       page.locator('#storybookHome .home-hero-copy h1').boundingBox(),
       page.locator('#friendsOpen').boundingBox()
     ]);
     assert.ok(headBox&&friendBox,'friends remains visible');
     const overlap=Math.max(0,Math.min(headBox.x+headBox.width,friendBox.x+friendBox.width)-Math.max(headBox.x,friendBox.x))
       *Math.max(0,Math.min(headBox.y+headBox.height,friendBox.y+friendBox.height)-Math.max(headBox.y,friendBox.y));
     assert.equal(overlap,0,'Friends must never cover H1 at '+width+'x'+height);
     assert.ok(friendBox.width>=44&&friendBox.height>=44,'Friends remains finger-sized');

     // R15 reference-home visual contract: a real illustrated hero, dominant
     // story continuation and a circular live button, not screenshot hotspots.
     const artLayout=await page.evaluate(()=>{
       const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return {w:r.width,h:r.height,x:r.x,y:r.y}};
       const play=getComputedStyle(document.querySelector('#storybookHome .home-feature-play'));
       const hero=getComputedStyle(document.querySelector('#storybookHome .home-intro'));
       return {
         hero:rect('#storybookHome .home-intro'),
         feature:rect('#homeWrite'),
         art:rect('#storybookHome .home-feature-art'),
         play:rect('#storybookHome .home-feature-play'),
         heroGradient:hero.backgroundImage,
         playRadius:play.borderTopLeftRadius
       };
     });
     assert.ok(artLayout.heroGradient.includes('gradient'),'watercolor reference must use layered real CSS');
     assert.ok(artLayout.art.w>=74&&artLayout.art.h>=65,'illustrated continuation image must remain usable');
     if(width>=701){
       assert.ok(artLayout.hero.h>=180,'storybook hero needs adequate illustration space on iPad');
       assert.ok(artLayout.feature.h>=90,'continuation action must be visually prominent');
       assert.ok(parseFloat(artLayout.playRadius)>=22,'featured live CTA requires rounded play control');
     }

     // A single row on tablet; avoid an isolated half-width drafts button.
     const actions=await Promise.all(['homeNewStory','homePaint','homeDrafts'].map(async id=>{
       const el=page.locator('#'+id);return {id,visible:await el.isVisible(),
         box:await el.isVisible()?await el.boundingBox():null};
     }));
     if(actions.every(a=>a.visible)&&width>=701){
       assert.ok(actions.every(a=>Math.abs(a.box.y-actions[0].box.y)<2),
         'all three creative actions must share one row on iPad '+width+'x'+height);
     }
     if(actions.every(a=>a.visible)&&width<=700){
       assert.ok(actions[0].box.width>actions[1].box.width*1.65,
         'new story must be the largest and most prominent touch target on mobile');
       assert.ok(Math.abs(actions[1].box.y-actions[2].box.y)<2,
         'drawing and drafts follow in a balanced mobile row');
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
     if(width===1024)assert.ok(checks.scroll<=2,
       'landscape iPad first screen should not require long forced scrolling: '+checks.scroll);
   }
   assert.ok(seenCompanions.size>=2,'automatic companions should change between separate visits');
   await page.setViewportSize({width:1024,height:768});await page.goto(url);
   await page.locator('#friendsOpen').click();
   assert.ok(await page.locator('#friendsDialog').isVisible(),'moved Friends entry opens gallery');
   await page.locator('[data-favorite="bat"]').click();
   const bat=page.locator('#homeFox img[data-hero="bat"]');
   await bat.waitFor();
   await page.locator('#friendsDialog [data-close]').click();
   if(await bat.getAttribute('data-scene')==='bat-scene02')await page.reload();
   const portrait=page.locator('#homeFox img[data-scene="bat-scene01"]');
   await portrait.waitFor();
   assert.match(await portrait.evaluate(img=>getComputedStyle(img).clipPath),/^inset\(.*9%/,
     'the original tile fringe below the bat portrait is clipped');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+2),
     'even the longest companion greeting fits the landscape first screen');
   await page.locator('#homeNewStory').click();
   assert.ok(await page.locator('#storyBody').isVisible(),'new story CTA opens real writer');
   const body='Белочка нашла книгу у Нила.';
   await page.locator('#storyBody').fill(body);
   await page.keyboard.press('Escape');
   await page.waitForFunction(()=>document.querySelector('#homeWrite strong').textContent==='Продолжить сказку');
   await page.locator('#homeWrite').click();
   assert.equal(await page.locator('#storyBody').inputValue(),body,'resume opens the saved draft after closing with Escape');
   await page.keyboard.press('Escape');
   await page.reload();
   assert.equal(await page.locator('#homeWrite strong').textContent(),'Продолжить сказку','resume label is restored on reload');
   await page.locator('#homeBooks').click();
   assert.ok(await page.locator('#libraryHome').isVisible(),'book shelf CTA still navigates');
   await page.locator('#home').click();
   await page.locator('#homeCreate').click();
   assert.ok(await page.locator('#creativeHome').isVisible(),'creative studio CTA still navigates');
   assert.deepEqual(errors,[]);
 }finally{await ctx.close()}
 console.log('PASS watercolor story home responsive iPad, accessible touch targets, real artwork and working writer routes');
};
