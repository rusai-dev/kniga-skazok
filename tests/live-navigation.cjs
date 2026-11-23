'use strict';
const {chromium,webkit}=require('playwright');
const URL=process.env.SITE_URL||'https://rusai-dev.github.io/kniga-skazok/';
const engine=process.env.BROWSER==='webkit'?webkit:chromium;
(async()=>{
 const browser=await engine.launch();
 try{
  for(const viewport of [{width:1024,height:768},{width:768,height:1024},{width:390,height:700}]){
   const ctx=await browser.newContext({viewport,hasTouch:true,serviceWorkers:'allow'});
   const page=await ctx.newPage(),errors=[],failed=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('requestfailed',r=>failed.push(r.url()+' '+r.failure()?.errorText));
   const response=await page.goto(URL,{waitUntil:'domcontentloaded',timeout:25000});
   const htmlStatus=response?.status(),location=page.url();
   const status=await page.evaluate(()=>({
    footer:document.querySelector('footer')?.textContent,
    startNoticeHidden:document.querySelector('#startNotice')?.hidden,
    homeVisible:!!document.querySelector('#storybookHome')?.getClientRects().length,
    homeIds:['homeBooks','homeCreate','homeWrite','homeMath','homeLogic','childWorld','readingEntry'].map(id=>{
     const el=document.getElementById(id);const r=el?.getBoundingClientRect();
     const top=r&&document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
     return {id,exists:!!el,visible:!!el?.getClientRects().length,disabled:el?.disabled,hit:!!(el&&(top===el||el.contains(top))),onclick:typeof el?.onclick};
    })
   }));
   console.log('LIVE',JSON.stringify({browser:process.env.BROWSER,viewport,htmlStatus,location,status,errors,failed}));
   if(htmlStatus!==200||!status.homeVisible||!status.startNoticeHidden||errors.length)throw Error('Site load/JS initialization failure');
   for(const [id,landed,back] of [
    ['homeBooks','#libraryHome','#home'],
    ['homeCreate','#creativeHome','#home'],
    ['homeMath','#academyBack','#academyBack'],
    ['homeLogic','#academyBack','#academyBack'],
    ['childWorld','#worldHome','#worldHome'],
    ['readingEntry','#modal','#close']
   ]){
    await page.locator('#'+id).tap({timeout:8000});
    await page.locator(landed).waitFor({state:'visible',timeout:8000});
    await page.locator(back).tap({timeout:8000});
    await page.locator('#storybookHome').waitFor({state:'visible',timeout:8000});
   }
   await page.locator('#homeWrite').tap();
   await page.locator('#storyBody').waitFor({state:'visible'});
   await page.locator('#storyBody').fill('Тестовый текст без данных ребёнка.');
   await page.locator('#saveStoryNow').tap();
   await page.locator('#modal').waitFor({state:'hidden'});
   if(errors.length)throw Error('Runtime errors: '+errors.join(' | '));
   console.log('PASS LIVE all home touch routes',process.env.BROWSER,viewport);
   await ctx.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});