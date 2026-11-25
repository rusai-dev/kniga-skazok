'use strict';
const {chromium,webkit}=require('playwright');
const URL=process.env.SITE_URL||'https://rusai-dev.github.io/kniga-skazok/';
const engine=process.env.BROWSER==='webkit'?webkit:chromium;
async function verifyNavigation(browser,siteUrl=URL){
  const sizes=[{width:1024,height:768},{width:768,height:1024},{width:390,height:700}];
  for(const viewport of process.env.LIVE_RELEASE_ONLY==='1'?sizes.slice(0,1):sizes){
   const ctx=await browser.newContext({viewport,hasTouch:true,serviceWorkers:'allow'});
   const page=await ctx.newPage(),errors=[],failed=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('requestfailed',r=>failed.push(r.url()+' '+r.failure()?.errorText));
   const response=await page.goto(siteUrl,{waitUntil:'domcontentloaded',timeout:25000});
   const htmlStatus=response?.status(),location=page.url();
   const status=await page.evaluate(()=>({
    footer:document.querySelector('footer')?.textContent,
    current:typeof APP_RELEASE==='string'?APP_RELEASE:null,
    headerVersion:document.querySelector('#headerRelease')?.textContent,
    headerVersionVisible:!!document.querySelector('#headerRelease')?.getClientRects().length,
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
   if(process.env.EXPECTED_LIVE_RELEASE&&status.current!==process.env.EXPECTED_LIVE_RELEASE)throw Error('Published browser version differs');
   if(status.headerVersion!==null){
    if(!status.headerVersionVisible||status.headerVersion!=='v'+status.current)throw Error('Visible header version missing or incorrect');
    const header=await page.evaluate(()=>{
     const node=document.querySelector('.storybook-header'),label=document.getElementById('headerRelease'),button=label.parentElement;
     const text=document.createRange();text.selectNodeContents(button.firstChild);
     const textBox=text.getBoundingClientRect(),labelBox=label.getBoundingClientRect(),height=node.getBoundingClientRect().height;
     label.hidden=true;const without=node.getBoundingClientRect().height;label.hidden=false;
     return {height,without,separate:labelBox.top>=textBox.bottom-1};
    });
    if(header.height!==header.without||!header.separate)throw Error('Version label must fit without moving the header or covering its button text');
    await page.locator('#adultEntry').tap();await page.locator('#adultHome').waitFor({state:'visible'});
    if(!(await page.locator('#currentRelease').innerText()).includes(status.current))throw Error('Parent version mismatch');
    await page.locator('#remoteReleaseStatus').filter({hasText:'Версия на сервере:'}).waitFor({state:'visible',timeout:15000});
    if(await page.locator('#toast').filter({hasText:'У тебя актуальная версия'}).isVisible())throw Error('Opening parent settings must not show an unsolicited version toast');
    await page.locator('#home').tap();await page.locator('#storybookHome').waitFor({state:'visible'});
   }
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
   const sample='Проверочная сказка QA: ёжик, сова и белочка. Без личных данных.';
   await page.locator('#storyBody').fill(sample);
   await page.locator('#saveStoryNow').tap();
   await page.locator('#modal').waitFor({state:'hidden'});
   await page.reload({waitUntil:'domcontentloaded'});
   await page.locator('#storybookHome').waitFor({state:'visible'});
   const persisted=await page.evaluate(text=>
     Object.values(data.drafts||{}).some(d=>d.body===text),sample);
   if(!persisted)throw Error('Synthetic private story did not survive reload at '+viewport.width+'×'+viewport.height);
   if(errors.length)throw Error('Runtime errors: '+errors.join(' | '));
   console.log('PASS LIVE all home touch routes + private draft reload',process.env.BROWSER,viewport);
   await ctx.close();
  }
}
module.exports=verifyNavigation;
if(require.main===module)(async()=>{
 const browser=await engine.launch();
 try{await verifyNavigation(browser,URL)}
 finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});