/* Browser smoke test. Install Playwright separately; node tests/browser-smoke.cjs.
   Uses a temporary local profile and does not touch production or personal data. */
const {chromium,webkit}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.json':'application/json','.css':'text/css','.txt':'text/plain','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp'};
const worldArtFiles=JSON.parse(fs.readFileSync(path.join(root,'assets/world/manifest.json'),'utf8')).assets;
for(const a of worldArtFiles){const bytes=fs.readFileSync(path.join(root,a.path));assert.equal(bytes.length,a.bytes);assert.equal(require('node:crypto').createHash('sha256').update(bytes).digest('hex'),a.sha256);}
const writerArt=JSON.parse(fs.readFileSync(path.join(root,'assets/ui/writer-squirrel-manifest.json'),'utf8'));const writerArtBytes=fs.readFileSync(path.join(root,writerArt.path));assert.equal(writerArtBytes.length,writerArt.bytes);assert.equal(require('node:crypto').createHash('sha256').update(writerArtBytes).digest('hex'),writerArt.sha256);
const initialFiles=['index.html','classic-art-153.js','classic-art-155.js','andersen-art-156.js','learning-art-1536.css'];
const initialBytes=initialFiles.reduce((n,name)=>n+fs.statSync(path.join(root,name)).size,0);
assert.ok(initialBytes<=1000000,'initial source budget exceeded: '+initialBytes);
console.log('INITIAL SOURCE BYTES',initialBytes);
const release=JSON.parse(fs.readFileSync(path.join(root,'release.json'),'utf8')).version;
assert.ok(fs.readFileSync(path.join(root,'index.html'),'utf8').includes('<footer>Книга сказок · версия '+release+'</footer>'),'manifest matches HTML');
assert.ok(fs.readFileSync(path.join(root,'sw.js'),'utf8').includes("const REV='"+release+"'"),'manifest matches worker');
const entry=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.ok(entry.includes("const APP_RELEASE='"+release+"'"),'runtime release must match manifest');
for(const asset of initialFiles.slice(1))assert.ok(entry.includes(asset+'?v='+release+'"'),'versioned core URL mismatched: '+asset);

async function verifySpriteReuse(source){
 const slice=(a,b)=>source.slice(source.indexOf(a),source.indexOf(b,source.indexOf(a)+1));
 const sprite='https://test/assets/ui/sprite-v1.webp',core='https://test/index.html',bad=new Response('bad',{headers:{'content-type':'text/plain'}}),valid=new Response('image',{headers:{'content-type':'image/webp'}}),freshResponse=new Response('fresh');
 const reads=[],fetches=[];
 const api=new Function('CACHE','UI_SPRITES','find','isImage','fresh',slice('function olderShellNames(','self.addEventListener(\'install\'')+slice('function shellRevision(','function obsoleteShells(')+'return {olderShellNames,installCore}')('skazki-shell-1.5.123',[sprite],async(name,url)=>{reads.push([name,url]);return name==='skazki-shell-1.5.122'?bad:name==='skazki-shell-1.5.121'?valid:undefined},r=>r.ok&&(r.headers.get('content-type')||'').toLowerCase().startsWith('image/'),async url=>{fetches.push(url);return freshResponse});
 const older=api.olderShellNames(['unrelated','skazki-shell-1.5.124','skazki-shell-1.5.123','skazki-shell-1.5.121','skazki-shell-1.5.122']);
 assert.deepEqual(older,['skazki-shell-1.5.122','skazki-shell-1.5.121']);
 assert.equal(await api.installCore(sprite,older),valid);assert.equal(fetches.length,0);assert.equal(reads.length,2);
 assert.equal(await api.installCore(core,older),freshResponse);assert.deepEqual(fetches,[core]);assert.equal(reads.length,2);
 assert.equal(await api.installCore(sprite,[]),freshResponse);assert.deepEqual(fetches,[core,sprite]);
}
async function verifyWriterRetry(source){
 const a=[{id:'a',title:'A'}],b=[{id:'b',title:'B'}],shaA='a'.repeat(40),shaB='b'.repeat(40),shaC='c'.repeat(40);
 let local=a,remote={books:a,revision:1,sha:shaA},fail=false,reads=0,writes=0,status='';
 const state={room:'test',key:null,ghSaved:JSON.stringify(a),ghVerifiedAt:Date.now()},store=new Map([['skazki-gh-state-test',JSON.stringify({sha:shaA})]]);
 const tick=new Function('fam','ghToken','publicationWritable','$','fstatus','fget','fput','ghReadWriter','ghPublicAPI','fseal','ghRequest','ghPath','cloudEncode','toast','TextEncoder',source+'return ghWriterTick')(state,()=> 'test',()=>local,()=>null,v=>{status=v},k=>store.get(k), (k,v)=>{store.set(k,v);return true},async()=>{reads++;return remote},async()=>{if(fail)throw Error('offline');return {books:remote.books,revision:remote.revision}},async()=>({iv:'test',cipher:new Uint8Array(0)}),async()=>{writes++;const sha=writes===1?shaB:shaC;remote={books:local,revision:remote.revision+1,sha};return {content:{sha}}},()=> 'test',()=>'',()=>{},class{encode(){return new Uint8Array(0)}});
 await tick(state);if(reads!==0)throw Error('recent verified snapshot should be reused');
 local=b;fail=true;await tick(state);
 if(writes!==1||remote.books!==b||state.ghSaved!==null||state.ghVerifiedAt!==0||!status.includes('не подтверждено'))throw Error('failed verification must invalidate old confirmation: '+JSON.stringify({writes,status,state}));
 local=a;fail=false;await tick(state);
 if(writes!==2||remote.books!==a||state.ghSaved!==JSON.stringify(a)||!status.includes('Проверено'))throw Error('reverted publication must be sent and verified');
 await tick(state);if(reads!==2||writes!==2)throw Error('recent reverified snapshot should be reused');
 return true;
}
const server=http.createServer((req,res)=>{
 const name=new URL(req.url,'http://127.0.0.1').pathname;
 const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end()}
 res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);
});
(async()=>{
 await verifySpriteReuse(fs.readFileSync(path.join(root,'sw.js'),'utf8'));
 assert.ok(await verifyWriterRetry(entry.slice(entry.indexOf('function ghDecision('),entry.indexOf('function ghCachedRevision('))+entry.slice(entry.indexOf('async function ghWriterTick('),entry.indexOf('function ghWriterStart('))));
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url='http://127.0.0.1:'+server.address().port+'/?view=personal';
 const engine=process.env.BROWSER==='webkit'?webkit:chromium;
 let browser;
 try{
 browser=await engine.launch({headless:true});
 // Isolated tabs: the stale author's unsaved work stays visible, the latest library survives.
 {
 const ctx=await browser.newContext({serviceWorkers:'block'}),a=await ctx.newPage(),b=await ctx.newPage();
 try{
 await a.goto(url);await b.goto(url);
 await a.locator('#homeNewStory').click();await b.locator('#homeNewStory').click();
 await a.locator('#storyBody').fill('Первая вкладка: новая сказка.');
 const latest=await a.evaluate(()=>localStorage.getItem(KEY));
 await b.locator('#storyBody').fill('Вторая вкладка: мой текст.');
 assert.ok((await b.locator('#draftStatus').textContent()).includes('другой вкладке'));
 assert.equal(await b.evaluate(()=>localStorage.getItem(KEY)),latest);
 assert.equal(await b.evaluate(()=>publicationWritable()===null),true);
 await b.locator('#saveStoryNow').click();assert.ok(await b.locator('#storyForm').isVisible());
 assert.equal(await b.locator('#storyBody').inputValue(),'Вторая вкладка: мой текст.');
 assert.ok(await b.locator('#rescueDraft').isVisible());
 await a.locator('#saveStoryNow').click();await a.reload();await a.locator('#homeWrite').click();
 assert.equal(await a.locator('#storyBody').inputValue(),'Первая вкладка: новая сказка.');
 assert.equal(await b.evaluate(async()=>archiveSnapshot(JSON.stringify(data))),false,'stale archive skipped');
 }finally{await ctx.close()}
 console.log('PASS stale library and publication lock');
 }

 // Chromium: verify real service-worker caching with an isolated profile.
 if(engine===chromium){
  const ctx=await browser.newContext({serviceWorkers:'allow'}),page=await ctx.newPage();
  try{
   await page.goto(new URL('release.json',url).href);
   const parts=release.split('.').map(Number),rev=offset=>[parts[0],parts[1],parts[2]+offset].join('.'),shell=offset=>'skazki-shell-'+rev(offset);
   const obsolete=[-5,-4,-3].map(shell),keep=[-2,-1,0,1].map(shell).concat(['skazki-shell-v2','unrelated-cache']),previousCore='./classic-art-153.js?v='+rev(-1);
   await page.evaluate(async({names,oldName,previousCore})=>{for(const name of names)await caches.open(name);const old=await caches.open(oldName);await old.put(new URL(previousCore,location.href).href,new Response('/* previous core */'));},{names:obsolete.concat(keep.filter(n=>n!==shell(0))),oldName:shell(-1),previousCore});
   await page.goto(url);
   await page.evaluate(async()=>{await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});await navigator.serviceWorker.ready});
   await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
   await page.waitForFunction(async obsolete=>{const keys=await caches.keys();return obsolete.every(k=>!keys.includes(k))},obsolete);
   const retained=await page.evaluate(()=>caches.keys());for(const name of keep)assert.ok(retained.includes(name),'retained '+name);
   const artPath='./assets/books/andersen-pea-bed.webp';
   assert.equal(await page.evaluate(async()=>{const c=await caches.open('skazki-book-art-v1');return (await c.keys()).length}),0,'no book art is precached');
   await page.evaluate(async path=>{const img=new Image();img.src=path;await img.decode();localStorage.setItem('skazki-reading-size-v1','28')},artPath);
   assert.equal(await page.evaluate(async path=>!!await (await caches.open('skazki-book-art-v1')).match(new URL(path,location.href).href),artPath),true,'viewed art cached');
   assert.equal(await page.evaluate(async({name,previousCore})=>!!await (await caches.open(name)).match(new URL(previousCore,location.href).href),{name:shell(-1),previousCore}),true,'previous version retained before offline');
   await page.evaluate(()=>worldRoom(5));await page.waitForFunction(()=>[...document.querySelectorAll('.world-cover img')].length===2&&[...document.querySelectorAll('.world-cover img')].every(img=>!img.hidden&&img.naturalWidth===128&&img.naturalHeight===128));assert.ok(await page.locator('.world-cover img').evaluateAll(imgs=>imgs.every(img=>img.getBoundingClientRect().width<=64.1&&img.getBoundingClientRect().height>=40&&img.alt==='')));for(const a of worldArtFiles.filter(a=>a.width===128))assert.ok(await page.evaluate(async path=>!!await (await caches.open('skazki-book-art-v1')).match(new URL(path,location.href).href),a.path),'viewed world art cached');await page.waitForFunction(()=>{const img=document.querySelector('.world-scene img');return img&&!img.hidden&&img.complete&&img.naturalWidth>=320});assert.ok(await page.locator('.world-scene img').evaluate(img=>img.getBoundingClientRect().width<=320.1&&img.getBoundingClientRect().height>100&&img.currentSrc.includes('-v1.webp')));for(const action of ['egypt','bats','roost']){await page.evaluate(a=>a==='egypt'?worldRoom(4):nightRead(a==='roost'?2:7),action);await page.waitForFunction(()=>{const img=document.querySelector('.world-scene img');return img&&!img.hidden&&img.complete&&img.naturalWidth>=320});assert.ok(await page.locator('.world-scene img').evaluate(img=>img.getBoundingClientRect().width<=320.1&&img.getBoundingClientRect().height>100&&img.currentSrc.includes('-v1.webp')));assert.ok(await page.locator('.world-scene img').evaluate(async img=>!!await (await caches.open('skazki-book-art-v1')).match(img.currentSrc)),'viewed large scene cached');}await page.evaluate(()=>nightRead(0));
   await ctx.setOffline(true);assert.equal(await page.evaluate(async previousCore=>await (await fetch(previousCore)).text(),previousCore),'/* previous core */');await page.reload();
   assert.ok(await page.locator('#storybookHome').isVisible());
   assert.equal(await page.evaluate(()=>localStorage.getItem('skazki-reading-size-v1')),'28');
   assert.ok(await page.evaluate(async path=>{const img=new Image();img.src=path;await img.decode();return img.naturalWidth>180},artPath));
   assert.equal(await page.evaluate(async name=>{const keys=await (await caches.open(name)).keys();return keys.length},shell(0)),8,'complete versioned core including artwork sprites and writer image');
   const uiSprites=await page.evaluate(async name=>{const paths=['./assets/ui/home-sprite-1548.webp','./assets/ui/learning-sprite-1536.webp','./assets/ui/writer-squirrel-144-v1.webp'];return Promise.all(paths.map(async path=>{const img=new Image();img.src=path;await img.decode();const cache=await caches.open(name);return {width:img.naturalWidth,height:img.naturalHeight,cached:!!await cache.match(new URL(path,location.href).href)}}))},shell(0));assert.ok(uiSprites.every(x=>x.width>100&&x.height>100&&x.cached),'both unmodified UI sprites decode offline');
   await page.evaluate(()=>worldRoom(4));await page.waitForFunction(()=>[...document.querySelectorAll('.world-cover img')].length===2&&[...document.querySelectorAll('.world-cover img')].every(img=>!img.hidden&&img.naturalWidth===128&&img.naturalHeight===128));assert.ok(await page.locator('.world-cover img').evaluateAll(imgs=>imgs.every(img=>img.getBoundingClientRect().width<=64.1&&img.getBoundingClientRect().height>=40&&img.alt==='')));assert.ok(await page.locator('[data-world="egypt-nile"]').isVisible());await page.waitForFunction(()=>{const img=document.querySelector('.world-scene img');return img&&!img.hidden&&img.complete&&img.naturalWidth>=320});assert.ok(await page.locator('.world-scene img').evaluate(img=>img.getBoundingClientRect().width<=320.1&&img.getBoundingClientRect().height>100&&img.currentSrc.includes('-v1.webp')));await page.evaluate(()=>nightRead(2));await page.waitForFunction(()=>{const img=document.querySelector('.world-scene img');return img&&!img.hidden&&img.naturalWidth>=320&&img.currentSrc.includes('night-roost-scene')});await page.evaluate(()=>nightRead(7));await page.waitForFunction(()=>{const img=document.querySelector('.world-scene img');return img&&!img.hidden&&img.complete&&img.naturalWidth>=320});assert.ok(await page.locator('.world-scene img').evaluate(img=>img.getBoundingClientRect().width<=320.1&&img.getBoundingClientRect().height>100&&img.currentSrc.includes('-v1.webp')));assert.ok(await page.locator('.night-layout>div:first-child svg').isVisible());
   assert.equal(await page.evaluate(()=>readingBooksCache===undefined),true,'catalog remains lazy offline before first reading');
   const sourceCatalog=JSON.parse(fs.readFileSync(path.join(root,'content','reading-catalog.json'),'utf8'));
   await page.evaluate(()=>nightRead(1));await page.locator('#nightEcho>summary').click();await page.locator('#nightEchoMore').click();await page.locator('#nightEchoShow').click();assert.ok((await page.locator('#nightEchoFeedback').textContent()).includes('8 м'),'chapter echo works offline');
   await page.evaluate(()=>readingOpen('pea-full',0));await page.locator('#readingNumber').waitFor({state:'visible'});assert.ok((await page.locator('#readingText').textContent()).trim(),'full catalog works on first offline reading');
   assert.deepEqual(await page.evaluate(()=>getReadingBooks()),sourceCatalog,'full decoded catalog matches editable source in actual offline browser');
   await page.locator('#readingBack').click();assert.ok(await page.locator('[data-story="pea-full"]').isVisible(),'offline back to book shelf');
   await page.keyboard.press('Escape');
   console.log('PASS service worker offline artwork, catalog and storage');
  }finally{await ctx.close()}
 }
 // Exercise actual buttons with APIs absent on older iPad Safari (not a legacy engine emulator).
 const legacy=await browser.newContext({viewport:{width:768,height:1024},serviceWorkers:'block'});
 try{
  await legacy.addInitScript(()=>{Object.hasOwn=undefined;Array.prototype.at=undefined});
  const page=await legacy.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url);await page.locator('#startNotice').waitFor({state:'hidden'});
  await page.locator('#homeMath').click();await page.locator('#academyBack').waitFor({state:'visible'});await page.locator('#academyBack').click();
  await page.locator('#homeLogic').click();await page.locator('#academyBack').waitFor({state:'visible'});await page.locator('#academyBack').click();
  await page.locator('#childWorld').click();await page.locator('#worldHome').waitFor({state:'visible'});await page.locator('#worldHome').click();
  await page.locator('#homeBooks').click();await page.locator('#libraryHome').waitFor({state:'visible'});await page.locator('#home').click();
  await page.locator('#homeCreate').click();await page.locator('#creativeHome').waitFor({state:'visible'});await page.locator('#home').click();
  await page.locator('#childLearn').click();await page.locator('#modal').waitFor({state:'visible'});await page.locator('#close').click();
  await page.locator('#storybookHome').waitFor({state:'visible'});assert.deepEqual(errors,[],'no runtime errors with older API set');
  console.log('PASS all six home destinations with older JavaScript API set');
 }finally{await legacy.close()}
 // Navigation must work before optional book artwork scripts finish loading.
 for(const viewport of [{width:768,height:1024},{width:1024,height:768}]){
  const ctx=await browser.newContext({viewport,hasTouch:true,serviceWorkers:'block'});let unblock;const gate=new Promise(r=>unblock=r);const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.route(/\/(classic-art-153|classic-art-155|andersen-art-156)\.js\?v=/,async route=>{await gate;await route.abort()});
   await page.goto(url,{waitUntil:'commit'});await page.locator('#startNotice').waitFor({state:'hidden',timeout:10000});
   for(const [entry,target,back] of [['homeMath','academyBack','academyBack'],['homeLogic','academyBack','academyBack'],['childWorld','worldHome','worldHome'],['homeBooks','libraryHome','home'],['homeCreate','creativeHome','home'],['readingEntry','modal','close']]){
    await page.locator('#'+entry).tap();await page.locator('#'+target).waitFor({state:'visible'});await page.locator('#'+back).tap();await page.locator('#storybookHome').waitFor({state:'visible'});assert.equal(await page.locator('#modal').isVisible(),false,'no modal left after '+entry);
   }
   await page.locator('#homeWrite').tap();await page.locator('#storyBody').fill('Проверка навигации.');await page.locator('#saveStoryNow').tap();await page.locator('#modal').waitFor({state:'hidden'});assert.ok(await page.locator('#storybookHome').isVisible());
   assert.deepEqual(errors,[]);console.log('PASS touch home routes before optional artwork loads',viewport);
   // Simulate stale HTML after an attempted upgrade. A newer manifest/HTML is available,
   // but the current URL already records that attempt. No reload should be triggered.
   await page.evaluate(()=>{const u=new URL(location.href);u.searchParams.set('_release','9.9.9');history.replaceState(null,'',u.href);window.__qaStillHere=true});
   await page.route('**/release.json?*',route=>route.fulfill({contentType:'application/json',body:'{"version":"9.9.9"}'}));
   await page.route('**/index.html?_check=*',route=>route.fulfill({contentType:'text/html',body:'<footer>Книга сказок · версия 9.9.9</footer>'}));
   await page.evaluate(()=>checkRelease(true));assert.ok(await page.locator('#releaseNotice').isVisible());assert.equal(await page.evaluate(()=>window.__qaStillHere),true);assert.ok((await page.locator('#releaseText').textContent()).includes('пока не загрузилось'));
   await page.locator('#homeMath').tap();await page.locator('#academyBack').tap();
  }finally{unblock();await ctx.close()}
 }
 // Simulate Safari's reduced visual viewport; not a physical keyboard test.
 for(const viewport of [{width:768,height:1024},{width:1024,height:768}]){
  const ctx=await browser.newContext({viewport,hasTouch:true,serviceWorkers:'block'});const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.goto(url);await page.locator('#homeWrite').tap();const body=page.locator('#storyBody');const value='Длинная сказка о звёздах.\n'.repeat(30);await body.fill(value);
   const height=viewport.height===768?300:480;
   const fit=await page.evaluate(({height})=>{
    const body=$('storyBody');body.focus();body.setSelectionRange(body.value.length,body.value.length);writerViewportFit({height,offsetTop:12,scale:1});
    const r=id=>{const b=$(id).getBoundingClientRect();return {top:b.top,bottom:b.bottom,height:b.height}};
    return {modal:r('modal'),text:r('storyBody'),save:r('saveStoryNow'),done:r('writerDoneTyping'),title:r('storyTitle'),tools:r('writerExtras'),focused:document.activeElement===body,selection:body.selectionStart,value:body.value}
   },{height});
   assert.ok(fit.modal.top>=11&&fit.modal.bottom<=height+13,'dialog fits the visible viewport');assert.ok(fit.text.height>=100&&fit.text.bottom<=fit.save.top&&fit.save.bottom<=height+13&&fit.done.bottom<=height+13,'text and both actions remain above keyboard '+JSON.stringify(fit));assert.equal(fit.title.height,0);assert.equal(fit.tools.height,0);assert.equal(fit.focused,true);assert.equal(fit.selection,value.length);assert.equal(fit.value,value);
   const safe=await page.evaluate(({height,value})=>{
    const body=$('storyBody'),original=Storage.prototype.setItem;body.focus();
    try{Storage.prototype.setItem=function(k,v){if(k===KEY)throw Error('quota');return original.call(this,k,v)};body.value=value+'Конец.';body.dispatchEvent(new Event('input',{bubbles:true}));writerViewportFit({height,offsetTop:0,scale:1});$('saveStoryNow').click();return {open:$('modal').hasAttribute('open'),value:body.value,rescue:!$('rescueDraft').hidden&&$('rescueDraft').getBoundingClientRect().height>0,full:!$('rescueFull').hidden&&$('rescueFull').getBoundingClientRect().height>=44&&$('rescueFull').getBoundingClientRect().bottom<=height,failed:$('storyForm').dataset.saveFailed==='yes'}}finally{Storage.prototype.setItem=original;body.value=value;body.dispatchEvent(new Event('input',{bubbles:true}))}
   },{height,value});assert.deepEqual(safe,{open:true,value:value+'Конец.',rescue:true,full:true,failed:true},'a failed compact save leaves the full text and rescue action available');
   const restored=await page.evaluate(()=>{writerViewportFit({height:innerHeight,offsetTop:0,scale:1});return !$('storyForm').classList.contains('keyboard-writing')&&$('writerExtras').getBoundingClientRect().height>0});assert.ok(restored,'tools restored when keyboard closes');
   await page.locator('#storyTitle').fill('Звёзды');const titleFit=await page.evaluate(height=>{writerViewportFit({height,offsetTop:0,scale:1});return {visible:$('storyTitle').getBoundingClientRect().height>0,focus:document.activeElement===$('storyTitle')}},height);assert.deepEqual(titleFit,{visible:true,focus:true});
   await page.evaluate(()=>{ $('writerDoneTyping').click();writerViewportFit({height:innerHeight,offsetTop:0,scale:1})});assert.equal(await body.inputValue(),value);
   await page.locator('#saveStoryNow').tap();await page.locator('#modal').waitFor({state:'hidden'});await page.reload();await page.locator('#homeWrite').tap();assert.equal(await page.locator('#storyBody').inputValue(),value);assert.equal(await page.locator('#storyTitle').inputValue(),'Звёзды');assert.deepEqual(errors,[]);console.log('PASS compact writing visual viewport and draft recovery',viewport);
  }finally{await ctx.close()}
 }
 // Separate touch-enabled contexts: follow public entry buttons, not internal artRoom().
 for(const viewport of [{width:768,height:1024},{width:1024,height:768}]){
  for(const mode of ['free','story']){
   const touch=await browser.newContext({viewport,hasTouch:true,serviceWorkers:'block'});
   try{
    const page=await touch.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(url);await page.locator('#startNotice').waitFor({state:'hidden'});
    const storyText='Проверочная сказка о звезде.';
    if(mode==='free'){await page.locator('#homeCreate').tap();await page.locator('#childDraw').tap()}
    else{await page.locator('#homeWrite').tap();await page.locator('#storyTitle').fill('Сенсорная проверка');await page.locator('#storyBody').fill(storyText);await page.locator('#writerExtras > summary').tap();await page.locator('#drawStory').tap()}
    const canvas=page.locator('#drawingCanvas'),expand=page.locator('#drawingExpand');
    await canvas.waitFor({state:'visible'});const normal=await canvas.boundingBox(),blank=await canvas.evaluate(c=>c.toDataURL());
    await expand.tap();await page.waitForFunction(w=>document.getElementById('drawingCanvas').getBoundingClientRect().width>=w*1.10,normal.width);
    const big=await canvas.boundingBox();assert.ok(big.width*big.height>normal.width*normal.height*1.20);
    await canvas.tap({position:{x:30,y:30}});const ink=await canvas.evaluate(c=>c.toDataURL());assert.notEqual(ink,blank,'touch creates a mark');
    await expand.tap();assert.equal(await expand.getAttribute('aria-pressed'),'false');assert.equal(await canvas.evaluate(c=>c.toDataURL()),ink);
    await page.locator('#drawingUndo').tap();assert.equal(await canvas.evaluate(c=>c.toDataURL()),blank);await page.locator('#drawingRedo').tap();assert.equal(await canvas.evaluate(c=>c.toDataURL()),ink);
    await expand.tap();await page.locator('#drawingFullSave').tap();await canvas.waitFor({state:'hidden'});
    if(mode==='story'){const body=await page.locator('#storyBody').inputValue();assert.equal(body.replace('\n[[рисунок:1]]\n',''),storyText,'illustration leaves story text intact');assert.ok(body.includes('[[рисунок:1]]'),'one illustration marker');assert.equal(await page.locator('#imageTray img').count(),1);assert.ok(await page.locator('#imageTray img').evaluate(img=>img.src.startsWith('data:image/jpeg;base64,')),'saved illustration attached to story')}
    else{assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('skazki-art-gallery-v1')||'[]').length),1,'touch saves one drawing')}
    // A successful save must survive reload, not just update the current DOM.
    if(mode==='story'){
     const savedBody=await page.locator('#storyBody').inputValue(),savedImage=await page.locator('#imageTray img').getAttribute('src');
     await page.reload();await page.locator('#startNotice').waitFor({state:'hidden'});
     await page.locator('#homeDrafts').tap();await page.locator('[data-own-draft]').filter({hasText:'Сенсорная проверка'}).tap();
     assert.equal(await page.locator('#storyBody').inputValue(),savedBody);
     assert.equal(await page.locator('#imageTray img').getAttribute('src'),savedImage,'touch illustration persists in restored story');
    }else{
     const savedGallery=await page.evaluate(()=>localStorage.getItem('skazki-art-gallery-v1'));
     await page.reload();await page.locator('#startNotice').waitFor({state:'hidden'});
     await page.locator('#homeCreate').tap();await page.locator('#childDraw').tap();await page.locator('#openGallery').tap();
     assert.equal(await page.locator('#galleryGrid [data-view]').count(),1);
     assert.equal(await page.evaluate(()=>localStorage.getItem('skazki-art-gallery-v1')),savedGallery,'touch gallery survives reload');
    }
    assert.deepEqual(errors,[]);console.log('PASS touch drawing',mode,viewport);
   }finally{await touch.close()}
  }
 }
 for(const viewport of [{width:768,height:1024},{width:1024,height:768}]){
 const ctx=await browser.newContext({viewport,serviceWorkers:'block'});const page=await ctx.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.stack||e.message));
 const initialBookRequests=[];const trackBooks=req=>{if(new URL(req.url()).pathname.includes('/assets/books/'))initialBookRequests.push(req.url())};page.on('request',trackBooks);
 await page.goto(url+'#author=own&theme=');
 assert.equal(await page.evaluate(()=>location.hash),'','legacy shelf URL should be cleaned');
 assert.equal(initialBookRequests.length,0,'book artwork must not load on home');page.off('request',trackBooks);
 assert.deepEqual(await page.evaluate(()=>[readingComprehension.loaded(),readingGlossary.loaded(),readingInference.loaded()]),[false,false,false],'reading banks deferred on home');
 assert.ok(await page.locator('#storybookHome').isVisible());assert.equal(await page.locator('#libraryHome').isVisible(),false);assert.equal(await page.locator('#adultHome').isVisible(),false);
 assert.equal(await page.locator('.home-map button').count(),4);assert.equal(await page.locator('.home-paths button').count(),2);
 assert.ok(await page.locator('#homeFox img').evaluate(async e=>{await e.decode();return e.naturalWidth>180}));
 await page.waitForFunction(()=>{const img=$('homeWriteArt').querySelector('img');return img&&!img.hidden&&img.complete&&img.naturalWidth===144});
 const artBounds=await page.locator('#homeWriteArt img').boundingBox();assert.equal(artBounds.width,viewport.height<=850?64:72,'approved illustration is larger on iPad');assert.equal(artBounds.height,artBounds.width);const entryBounds=await page.locator('#homeWrite').boundingBox();assert.ok(artBounds.x>=entryBounds.x&&artBounds.y>=entryBounds.y&&artBounds.x+artBounds.width<=entryBounds.x+entryBounds.width&&artBounds.y+artBounds.height<=entryBounds.y+entryBounds.height,'art never overlaps other controls');
 const homeSnapshot=async()=>page.evaluate(()=>{const nav=performance.getEntriesByType('navigation')[0],resources=[nav,...performance.getEntriesByType('resource')].filter(x=>x&&x.name.startsWith(location.origin)).map(x=>({path:new URL(x.name).pathname,bytes:x.encodedBodySize,transfer:x.transferSize}));return {encoded:resources.reduce((n,x)=>n+x.bytes,0),transferred:resources.reduce((n,x)=>n+x.transfer,0),loadMs:nav.loadEventEnd,domReadyMs:nav.domContentLoadedEventEnd,resources}});
 assert.equal(await page.locator('#topics button,#authors button,#books > *,#heroArt > *').count(),0,'hidden shelf not built on cold home');assert.equal(await page.locator('#creativeHome .child-picture > *').count(),0,'hidden creative artwork deferred');assert.equal(await page.evaluate(()=>readingBooksCache===undefined),true,'book data allocated only on demand');
 const cold=await homeSnapshot();assert.ok(cold.resources.every(x=>!x.path.endsWith('/content/reading-catalog.json')),'editable catalog never fetched by app');console.log('COLD HOME RESOURCE BYTES',JSON.stringify({viewport,...cold}));assert.ok(cold.encoded>0&&cold.encoded<=1200000,'cold home encoded response budget exceeded: '+cold.encoded);assert.ok(cold.resources.every(x=>!/(\/assets\/(books|world)\/|\/(art-152|paintings-154|peerjs\.min)\.js$)/.test(x.path)),'optional full art or peer transport must not load on home');
 const last=await page.locator('#homeBooks').boundingBox();assert.ok(last.y>=0&&last.y+last.height<=viewport.height,'personal books must fit first screen');
 const homeLayout=await page.evaluate(()=>{const r=id=>{const b=$(id).getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height,bottom:b.bottom,right:b.right}};return {books:r('homeBooks'),create:r('homeCreate'),tabs:['readingEntry','homeMath','homeLogic','childWorld'].map(r),actions:['homeWrite','homeNewStory','homeDrafts','childLearn'].map(r),width:innerWidth,height:innerHeight,scroll:document.documentElement.scrollHeight}});assert.ok(homeLayout.books.y<homeLayout.tabs[0].y&&homeLayout.create.y<homeLayout.tabs[0].y,'creative destinations precede learning');for(const r of [...homeLayout.tabs,...homeLayout.actions,homeLayout.books,homeLayout.create])assert.ok(r.x>=0&&r.right<=homeLayout.width+1&&r.bottom<=homeLayout.height+1&&r.h>=44,'home action visible and tappable');assert.ok(homeLayout.books.h>homeLayout.tabs[0].h*1.3,'creative cards dominate');assert.ok(homeLayout.scroll<=homeLayout.height+2,'home fits iPad viewport without scrolling');
 await page.locator('#homeBooks').click();assert.ok(await page.locator('#libraryHome').isVisible());await page.evaluate(()=>{window.__qaTopics=$('topics').firstElementChild;window.__qaHero=$('heroArt').firstElementChild});await page.locator('#bookSearch').fill('Тестовый поиск');assert.equal(await page.evaluate(()=>window.__qaTopics===$('topics').firstElementChild&&window.__qaHero===$('heroArt').firstElementChild),true,'personal search preserves filter and hero DOM');await page.locator('#clearBookSearch').click();assert.ok(await page.locator('#topics button').count()>0,'shelf built on entry');assert.ok(await page.locator('#heroArt svg').count()>0,'hero art retained');assert.ok(await page.locator('#libraryHome .hero').isVisible(),'personal shelf illustrated header visible');assert.equal(await page.locator('#heading').textContent(),'Моя книжная полка');await page.waitForFunction(()=>{const im=$('heroArt').querySelector('img');return im&&!im.hidden&&im.naturalWidth===144});assert.ok(await page.locator('#books .shelf-new-art').isVisible(),'illustrated new story card');assert.ok(await page.locator('#libraryHome').evaluate(e=>e.scrollWidth<=e.clientWidth+1),'personal shelf fits width');assert.ok(await page.evaluate(()=>Array.isArray(readingBooksCache)&&readingBooksCache.length>0),'books initialized on shelf entry');assert.equal(await page.locator('#libraryFilters').evaluate(e=>e.open),false);assert.ok(await page.locator('#ownShelfNew').isVisible());assert.ok(await page.locator('#ownShelfContinue').isVisible());assert.ok(await page.locator('#ownShelfDrafts').isVisible());assert.equal(await page.locator('#ownShelfDrafts').textContent(),await page.evaluate(()=>'Мои черновики · '+(ownDraftChoices(data,OWN).length+ownEditChoices(data.stories,data.edits,OWN).length)));await page.locator('#ownShelfNew').click();assert.equal(await page.locator('#storyBody').inputValue(),'');await page.keyboard.press('Escape');assert.ok(await page.locator('#libraryHome').isVisible(),'editor returns to personal shelf');
 await page.locator('#libraryFilters summary').click();assert.ok(await page.locator('#authors').isVisible());
 const geometry=await page.evaluate(()=>{const r=id=>document.getElementById(id).getBoundingClientRect();const topic=r('topics'),author=r('authors'),search=r('bookSearch'),visible=[...document.querySelectorAll('#topics button')].filter(b=>getComputedStyle(b).display!=='none');return {searchAbove:search.bottom<=topic.top,authorsBelow:author.top>=topic.bottom,unclipped:visible.every(b=>{const x=b.getBoundingClientRect();return x.top>=topic.top-1&&x.bottom<=topic.bottom+1&&x.left>=topic.left-1&&x.right<=topic.right+1&&x.height>=44}),count:visible.length}});
 assert.deepEqual(geometry,{searchAbove:true,authorsBelow:true,unclipped:true,count:7},'compact, fully visible library filters');
 await page.locator('#moreThemes').click();assert.ok(await page.locator('#topics button:visible').count()>7);
 await page.locator('#topics button').filter({hasText:'Путешествия'}).click();assert.equal(await page.locator('#libraryFilters').evaluate(e=>e.open),false);assert.ok((await page.locator('#shelfTitle').textContent()).includes('Путешествия'));
 await page.locator('#libraryFilters summary').click();await page.locator('#moreThemes').click();assert.ok(await page.locator('#topics button.active').isVisible());
 await page.locator('#authors .author').filter({hasText:'Пушкин'}).click();assert.equal(await page.locator('#libraryFilters').evaluate(e=>e.open),false);
 assert.ok(await page.locator('#books .shelf-volume').count()>=2,'classic author shelf renders multiple volumes');
 await page.locator('#books .shelf-volume').nth(1).click();assert.ok(await page.locator('#modal').isVisible(),'second classic author volume opens');await page.keyboard.press('Escape');
 await page.locator('#home').click();
 assert.ok(await page.locator('.home-art').first().evaluate(e=>getComputedStyle(e).backgroundImage.includes('/assets/ui/home-sprite-1548.webp')));
 const homePalette=await page.evaluate(()=>({bg:getComputedStyle(document.body).backgroundColor,writer:getComputedStyle($('homeWrite')).backgroundColor,ink:getComputedStyle($('homeWrite')).color}));assert.deepEqual(homePalette,{bg:'rgb(244, 251, 250)',writer:'rgb(230, 246, 244)',ink:'rgb(23, 60, 62)'},'turquoise home remains unchanged');assert.equal(await page.locator('#homeCreate').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(240, 233, 250)','creative entrance uses lavender');assert.equal(await page.locator('#homeDrafts').evaluate(e=>getComputedStyle(e).color),'rgb(90, 50, 138)','draft entry uses dark violet');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.locator('#homeMath').click();assert.equal(await page.locator('[data-academy]').count(),12);assert.equal(await page.locator('#close').isVisible(),false);await page.locator('#academyBack').click();
 await page.locator('#homeLogic').click();assert.equal(await page.locator('[data-academy]').count(),6);await page.locator('#academyBack').click();
 await page.waitForFunction(()=>{const img=$('homeWriteArt').querySelector('img');return img&&!img.hidden&&img.complete&&img.naturalWidth===144&&img.currentSrc.endsWith('/assets/ui/writer-squirrel-144-v1.webp')});assert.ok(await page.locator('#homeWriteArt img').evaluate(img=>img.alt===''&&img.getBoundingClientRect().width>=52&&img.getBoundingClientRect().height===img.getBoundingClientRect().width),'decorative writer illustration fits');
 const visited=await homeSnapshot();console.log('HOME AFTER LIBRARY AND LESSONS',JSON.stringify({viewport,...visited}));
 const fallback=await ctx.newPage();try{await fallback.route('**/assets/ui/writer-squirrel-144-v1.webp',r=>r.abort());await fallback.goto(url);await fallback.waitForFunction(()=>!document.querySelector('#homeWriteArt img'));assert.ok(await fallback.locator('#homeWriteArt svg').isVisible(),'writer fallback when art unavailable');await fallback.locator('#homeWrite').click();assert.ok(await fallback.locator('#storyBody').isVisible(),'free writing still opens with missing art');assert.equal(await fallback.evaluate(()=>readingBooksCache===undefined),true,'cold direct writer avoids book catalog allocation');}finally{await fallback.close()}
 const writeRect=await page.locator('#homeWrite').boundingBox();assert.ok(writeRect.y>=0&&writeRect.y+writeRect.height<=viewport.height,'author entry fits first screen');
 await page.locator('#homeWrite').click();assert.ok(await page.locator('#storyForm').isVisible());assert.equal(await page.locator('#storyTitle').getAttribute('required'),null);assert.equal(await page.locator('#writerExtras').evaluate(e=>e.open),false);assert.equal(await page.locator('#drawStory').isVisible(),false);assert.equal(await page.locator('#studioEffectPane canvas').count(),0,'no preview canvases during free writing');assert.equal(await page.locator('#lessonPicture svg').count(),0,'no lesson SVG during free writing');assert.ok(await page.locator('#publishStory').isVisible());
 assert.ok(await page.evaluate(()=>document.getElementById('storyTitle').compareDocumentPosition(document.getElementById('storyBody'))&Node.DOCUMENT_POSITION_FOLLOWING));
 assert.ok(await page.evaluate(()=>document.getElementById('storyBody').compareDocumentPosition(document.getElementById('storyTheme'))&Node.DOCUMENT_POSITION_FOLLOWING),'writing before settings');

 const original=await page.locator('#storyBody').inputValue(),originalLibrary=await page.evaluate(()=>localStorage.getItem(KEY));
 assert.equal(await page.locator('#quickIdea').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(240, 233, 250)');assert.equal(await page.locator('#quickIdea').evaluate(e=>getComputedStyle(e).color),'rgb(90, 50, 138)');assert.equal(await page.locator('#quickIdeaCard').isVisible(),false);await page.locator('#quickIdea').click();assert.ok(await page.locator('#quickIdeaCard').isVisible());const firstIdea=await page.locator('#quickIdeaText').textContent();await page.locator('#quickIdea').click();assert.notEqual(await page.locator('#quickIdeaText').textContent(),firstIdea);const seenIdeas=new Set([firstIdea,await page.locator('#quickIdeaText').textContent()]);const ideaCycle=original.trim()?20:8;for(let i=2;i<ideaCycle;i++){await page.locator('#quickIdea').click();seenIdeas.add(await page.locator('#quickIdeaText').textContent())}assert.equal(seenIdeas.size,ideaCycle);await page.locator('#quickIdea').click();assert.equal(await page.locator('#quickIdeaText').textContent(),firstIdea);await page.locator('#quickIdeaClose').click();assert.equal(await page.locator('#quickIdeaCard').isVisible(),false);assert.equal(await page.locator('#quickIdea').getAttribute('aria-expanded'),'false');assert.equal(await page.evaluate(()=>document.activeElement.id),'quickIdea','idea dismissal returns focus without forcing keyboard');assert.equal(await page.locator('#storyBody').inputValue(),original);assert.equal(await page.evaluate(()=>localStorage.getItem(KEY)),originalLibrary,'quick ideas never modify drafts');
 await page.locator('#previewStory').click();assert.ok(await page.locator('#bookPreview').isVisible());await page.locator('#previewStory').click();assert.equal(await page.locator('#bookPreview').isVisible(),false);
 await page.locator('#writerExtras > summary').click();await page.locator('.story-guide summary').click();
 await page.locator('#ideaStage').selectOption('revise');await page.locator('#ideaStory').click();assert.ok((await page.locator('#ideaText').textContent()).includes('Прочитай начало'));
 await page.locator('#ideaStory').click();assert.ok((await page.locator('#ideaText').textContent()).includes('повторяется'));
 await page.locator('#ideaStage').selectOption('middle');await page.locator('#ideaStory').click();assert.ok((await page.locator('#ideaText').textContent()).includes('мешает'));
 const beforeIdea=await page.locator('#storyBody').inputValue();await page.locator('#ideaStage').selectOption('explore');await page.locator('#ideaStory').click();assert.ok((await page.locator('#ideaText').textContent()).includes('Летучая мышка'));await page.locator('#ideaStory').click();assert.ok((await page.locator('#ideaText').textContent()).includes('Нила'));assert.equal(await page.locator('#storyBody').inputValue(),beforeIdea,'theme prompts do not alter author text');
 for(const [stage,word] of [['scene','место действия'],['dialogue','Два героя'],['words','Прошептал']]){await page.locator('#ideaStage').selectOption(stage);await page.locator('#ideaStory').click();assert.ok((await page.locator('#ideaText').textContent()).includes(word));const first=await page.locator('#ideaText').textContent();await page.locator('#ideaStory').click();assert.notEqual(await page.locator('#ideaText').textContent(),first)}
 assert.equal(await page.locator('#writerWords').evaluate(e=>e.open),false);await page.locator('#writerWords summary').click();await page.locator('#writerWordSelect').selectOption('сказал');
 assert.ok(await page.locator('#writerWordSelect').evaluate(e=>e.getBoundingClientRect().height>=44));
 assert.equal(await page.locator('.writer-word-card').count(),3);assert.ok((await page.locator('#writerWordCards').textContent()).includes('Прошептал'));
 await page.locator('#writerWordSelect').selectOption('увидел');assert.equal(await page.locator('.writer-word-card').count(),2);assert.ok((await page.locator('#writerWordCards').textContent()).includes('Разглядел'));
 await page.locator('#writerWordSelect').selectOption('');assert.equal(await page.locator('.writer-word-card').count(),0);
 assert.equal(await page.locator('#storyBody').inputValue(),original,'guidance never modifies story');assert.equal(await page.evaluate(()=>localStorage.getItem(KEY)),originalLibrary,'guidance never writes library');await page.keyboard.press('Escape');
 const beforeDrafts=await page.evaluate(()=>JSON.stringify(data));
 await page.evaluate(()=>{const a={author:OWN,theme:'Лес',title:'Лесной черновик',body:'Текст один'},b={author:OWN,theme:'Море',title:'Морской черновик',body:'Текст два'};data.drafts={...data.drafts,[draftKey(OWN,'Лес')]:a,[draftKey(OWN,'Море')]:b};const story={id:'qa-edit-own',author:OWN,theme:'Лес',title:'Готовая история',body:'Старый текст'};data.stories=[...data.stories,story];data.edits={...data.edits,[story.id]:{...story,title:'Новая редакция',body:'Новый текст'}};});
 await page.locator('#homeDrafts').click();await page.locator('[data-own-draft]').filter({hasText:'Морской черновик'}).click();assert.equal(await page.locator('#storyBody').inputValue(),'Текст два');assert.equal(await page.locator('#storyTitle').inputValue(),'Морской черновик');
 await page.keyboard.press('Escape');await page.locator('#homeDrafts').click();await page.locator('[data-own-edit]').filter({hasText:'Новая редакция'}).click();assert.equal(await page.locator('#storyBody').inputValue(),'Новый текст');assert.equal(await page.evaluate(()=>bookOf('qa-edit-own').body),'Старый текст');await page.keyboard.press('Escape');await page.locator('#homeNewStory').click();assert.equal(await page.locator('#storyBody').inputValue(),'');assert.equal(await page.evaluate(()=>getDraft(OWN,'Лес').body),'Текст один');assert.equal(await page.evaluate(()=>getDraft(OWN,'Море').body),'Текст два');
 await page.evaluate(()=>{window.__qaSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===KEY)throw new Error('quota');return window.__qaSetItem.call(this,k,v)}});
 await page.locator('#storyTitle').fill('Проверка сохранения');await page.locator('#storyBody').fill('Мой текст остаётся открыт.');const sheetHeight=(await page.locator('#storyBody').boundingBox()).height;await page.locator('#writerFocus').click();assert.equal(await page.locator('#writerFocus').getAttribute('aria-pressed'),'true');assert.ok((await page.locator('#storyBody').boundingBox()).height>sheetHeight,'large writing sheet grows');assert.equal(await page.locator('#writerExtras').isVisible(),false);assert.ok(await page.locator('#saveStoryNow').isVisible());assert.equal(await page.locator('#storyBody').inputValue(),'Мой текст остаётся открыт.');await page.locator('#writerFocus').click();assert.ok(await page.locator('#writerExtras').isVisible());assert.equal(await page.locator('#storyBody').inputValue(),'Мой текст остаётся открыт.');
 assert.ok((await page.locator('#draftStatus').textContent()).includes('Не удалось сохранить'));await page.keyboard.press('Escape');assert.ok(await page.locator('#storyForm').isVisible());await page.locator('#close').click();assert.ok(await page.locator('#storyForm').isVisible());assert.equal(await page.locator('#storyBody').inputValue(),'Мой текст остаётся открыт.');assert.ok(await page.locator('#rescueDraft').isVisible());await page.locator('#saveStoryNow').click();assert.ok(await page.locator('#storyForm').isVisible());assert.equal(await page.locator('#storyBody').inputValue(),'Мой текст остаётся открыт.');const downloaded=page.waitForEvent('download');await page.locator('#rescueDraft').click();const rescue=await downloaded;assert.equal(require('fs').readFileSync(await rescue.path(),'utf8'),'Проверка сохранения\n\nМой текст остаётся открыт.');
 await page.evaluate(()=>{Storage.prototype.setItem=window.__qaSetItem});await page.locator('#saveStoryNow').click();assert.equal(await page.locator('#modal').isVisible(),false);assert.ok(await page.evaluate(()=>Object.values(JSON.parse(localStorage.getItem(KEY)).drafts).some(d=>d.body==='Мой текст остаётся открыт.')));
 await page.locator('#homeNewStory').click();await page.locator('#storyTitle').fill('Проверка рисунка');await page.locator('#storyBody').fill('Текст с рисунком.');
 await page.locator('#writerExtras > summary').click();
 const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=c.height=16;c.getContext('2d').fillRect(0,0,16,16);return c.toDataURL('image/png').split(',')[1]});
 await page.locator('#pictureFile').setInputFiles({name:'test.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});
 await page.locator('#imageTray img').waitFor({state:'visible'});await page.locator('[data-cover-pic="0"]').click();assert.equal(await page.locator('[data-cover-pic="0"]').getAttribute('aria-pressed'),'true');await page.locator('.cover-designer summary').click();assert.equal(await page.locator('#coverImage').inputValue(),'0');assert.equal(await page.locator('#coverPreview img').getAttribute('src'),await page.locator('#imageTray img').getAttribute('src'));await page.locator('#coverImage').selectOption('-1');assert.equal(await page.locator('[data-cover-pic="0"]').getAttribute('aria-pressed'),'false');await page.locator('#coverImage').selectOption('0');assert.equal(await page.locator('[data-cover-pic="0"]').getAttribute('aria-pressed'),'true');
 const moveBody='Первый абзац.\nВторой абзац.\n[[рисунок:1]]',movedBody='Первый абзац.\n[[рисунок:1]]\nВторой абзац.\n';await page.locator('#storyBody').fill(moveBody);await page.locator('#storyBody').evaluate(e=>e.setSelectionRange(2,2));
 await page.evaluate(()=>{window.__qaMoveSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===KEY)throw Error('quota');return window.__qaMoveSet.call(this,k,v)}});
 await page.locator('[data-move-pic="0"]').click();assert.equal(await page.locator('#storyBody').inputValue(),moveBody,'failed placement restores text');
 await page.locator('#coverImage').selectOption('-1');assert.equal(await page.locator('#coverImage').inputValue(),'0','failed cover selection preserves prior artwork');
 await page.evaluate(()=>{Storage.prototype.setItem=window.__qaMoveSet});await page.locator('#storyBody').evaluate(e=>e.setSelectionRange(2,2));await page.locator('[data-move-pic="0"]').click();assert.equal(await page.locator('#storyBody').inputValue(),movedBody,'move illustration without replacing prose');
 const pictureBody=await page.locator('#storyBody').inputValue(),pictureSrc=await page.locator('#imageTray img').getAttribute('src');
 const persistedPicture=()=>page.evaluate(()=>Object.values(JSON.parse(localStorage.getItem(KEY)).drafts).find(d=>d.title==='Проверка рисунка'));
 const pictureBefore=await persistedPicture();assert.equal(pictureBefore.rich.images[0],pictureSrc);assert.equal(pictureBefore.rich.coverImage,0);assert.equal(pictureBefore.body,pictureBody);
 page.once('dialog',d=>d.dismiss());await page.locator('#imageTray [data-picture]').click();assert.equal(await page.locator('#imageTray img').getAttribute('src'),pictureSrc);assert.deepEqual(await persistedPicture(),pictureBefore,'cancel keeps persisted picture draft');
 await page.evaluate(()=>{window.__qaSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===KEY)throw new Error('quota');return window.__qaSetItem.call(this,k,v)}});
 page.once('dialog',d=>d.accept());await page.locator('#imageTray [data-picture]').click();assert.equal(await page.locator('#imageTray img').getAttribute('src'),pictureSrc);assert.equal(await page.locator('#storyBody').inputValue(),pictureBody);assert.equal(await page.locator('#coverImage').inputValue(),'0');assert.deepEqual(await persistedPicture(),pictureBefore,'failed deletion keeps persisted picture draft');
 assert.ok((await page.locator('#draftStatus').textContent()).includes('Не удалось сохранить'));
 const savedCopy=page.waitForEvent('download');await page.locator('#rescueFull').click();const rescueCopy=await savedCopy,rescueRaw=fs.readFileSync(await rescueCopy.path(),'utf8'),rescueData=JSON.parse(rescueRaw);assert.equal(rescueData.kind,'story-draft');assert.equal(rescueData.draft.body,pictureBody);assert.equal(rescueData.draft.rich.images[0],pictureSrc);assert.equal(rescueData.draft.rich.coverImage,0);
 await page.evaluate(()=>{Storage.prototype.setItem=window.__qaSetItem});
 page.once('dialog',d=>d.accept());await page.locator('#imageTray [data-picture]').click();assert.equal(await page.locator('#imageTray img').count(),0);assert.equal(await page.locator('#coverImage').inputValue(),'-1');assert.equal(await page.locator('#storyBody').inputValue(),pictureBody.replaceAll('[[рисунок:1]]',''));
 const pictureAfter=await persistedPicture();assert.equal(pictureAfter.rich.images[0],null);assert.equal(pictureAfter.rich.coverImage,-1);assert.equal(pictureAfter.body,pictureBody.replaceAll('[[рисунок:1]]',''));
 assert.equal(await page.evaluate(()=>performance.getEntriesByType('resource').filter(r=>r.name.includes('/assets/world/')).length),0,'no world images before optional gallery');
 await page.locator('#coverGalleryToggle').click();assert.equal(await page.locator('#coverGallery button').count(),3);const stock=page.locator('#coverGallery button').filter({hasText:'Лунный лес'});await stock.click();await page.waitForFunction(()=>$('toast').textContent==='Обложка сохранена.');const stockBook=await persistedPicture();assert.equal(stockBook.body,pictureAfter.body,'stock cover never modifies text');assert.equal(stockBook.rich.markup,pictureAfter.rich.markup);assert.equal(stockBook.rich.coverImage,0);assert.ok(stockBook.rich.images[0].startsWith('data:image/jpeg;base64,'));assert.equal(await page.locator('#coverPreview img').getAttribute('src'),stockBook.rich.images[0]);assert.equal(await page.evaluate(b=>fbook(b).rich.images[0],stockBook),stockBook.rich.images[0],'stock cover travels with published snapshot');
 await page.route('**/egypt-nile-cover-504-v1.webp',r=>r.abort());await page.locator('#coverGallery button').filter({hasText:'Далёкие страны'}).click();await page.waitForFunction(()=>$('toast').textContent.includes('Картинка недоступна'));assert.deepEqual(await persistedPicture(),stockBook);await page.unroute('**/egypt-nile-cover-504-v1.webp');await page.evaluate(()=>{window.__qaSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===KEY)throw Error('quota');return window.__qaSetItem.call(this,k,v)}});
 await page.locator('#coverGallery button').filter({hasText:'Ночные друзья'}).click();await page.waitForFunction(()=>$('toast').textContent.includes('Обложка не изменена'));assert.deepEqual(await persistedPicture(),stockBook);assert.equal(await page.locator('#coverPreview img').getAttribute('src'),stockBook.rich.images[0]);await page.evaluate(()=>{Storage.prototype.setItem=window.__qaSetItem});await page.locator('#storyBody').evaluate(e=>e.setSelectionRange(e.value.length,e.value.length));await page.locator('#imageTray [data-move-pic]').click();const placed=await persistedPicture();assert.equal(placed.body,stockBook.body+(stockBook.body.endsWith('\n')||!stockBook.body?'':'\n')+'[[рисунок:1]]');assert.equal(placed.rich.images[0],stockBook.rich.images[0]);assert.equal(placed.rich.coverImage,0);await page.locator('#storyBody').fill(stockBook.body);page.once('dialog',d=>d.accept());await page.locator('#imageTray [data-picture]').click();assert.deepEqual(await persistedPicture(),pictureAfter,'removing optional cover restores original draft');await page.locator('#coverGalleryToggle').click();
 const txt={name:'import.txt',mimeType:'text/plain',buffer:Buffer.from('Новый текст из файла.','utf8')};
 const dismissImport=page.waitForEvent('dialog').then(d=>d.dismiss());await page.locator('#storyFile').setInputFiles(txt);await dismissImport;assert.deepEqual(await persistedPicture(),pictureAfter,'cancel import preserves stored draft');
 await page.evaluate(()=>{window.__qaSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===KEY)throw new Error('quota');return window.__qaSetItem.call(this,k,v)}});
 page.once('dialog',d=>d.accept());await page.locator('#storyFile').setInputFiles(txt);await page.waitForFunction(()=>document.getElementById('toast').textContent.includes('Прежний текст возвращён'));
 assert.equal(await page.locator('#storyBody').inputValue(),pictureAfter.body);assert.equal(await page.locator('#storyTitle').inputValue(),pictureAfter.title);assert.deepEqual(await persistedPicture(),pictureAfter,'failed import preserves stored draft and versions');
 await page.evaluate(()=>{Storage.prototype.setItem=window.__qaSetItem});
 page.once('dialog',d=>d.accept());await page.locator('#storyFile').setInputFiles(txt);await page.waitForFunction(()=>document.getElementById('toast').textContent==='Текст загружен и сохранён.');
 const imported=await persistedPicture();assert.equal(imported.body,'Новый текст из файла.');assert.equal(imported.versions[0].body,pictureAfter.body);assert.equal(imported.versions[0].title,pictureAfter.title);
 await page.locator('#storyFile').setInputFiles({name:'empty.txt',mimeType:'text/plain',buffer:Buffer.from('   ')});await page.waitForFunction(()=>document.getElementById('toast').textContent.includes('Этот файл пуст'));assert.deepEqual(await persistedPicture(),imported);
 // Story illustration: simultaneous failure of local draft and library writes.
 await page.locator('#drawStory').click();await page.locator('#drawingCanvas').waitFor({state:'visible'});await page.waitForFunction(()=>!$('drawingStatus').textContent.includes('Открываем'));
 const drawingBeforeRescue=await page.evaluate(()=>localStorage.getItem(DRAWING_DRAFT));
 await page.evaluate(()=>{window.__qaDrawingSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===KEY||k===DRAWING_DRAFT)throw Error('quota');return window.__qaDrawingSet.call(this,k,v)}});
 await page.locator('#drawingCanvas').click({position:{x:40,y:40}});
 assert.ok(await page.locator('#drawingRescue').isVisible());assert.ok((await page.locator('#drawingRescue').boundingBox()).height>=44);
 await page.locator('#drawingExpand').click();assert.ok(await page.locator('#drawingRescue').isVisible());
 const rescuePNG=await page.locator('#drawingCanvas').evaluate(c=>c.toDataURL('image/png').split(',')[1]);const drawingDownload=page.waitForEvent('download');await page.locator('#drawingRescue').click();assert.deepEqual(fs.readFileSync(await (await drawingDownload).path()),Buffer.from(rescuePNG,'base64'));
 assert.equal(await page.locator('#drawingCanvas').evaluate(c=>c.toDataURL('image/png').split(',')[1]),rescuePNG);assert.deepEqual(await persistedPicture(),imported);assert.equal(await page.evaluate(()=>localStorage.getItem(DRAWING_DRAFT)),drawingBeforeRescue);
 await page.locator('#drawingFullSave').click();assert.ok(await page.locator('#drawingCanvas').isVisible());assert.deepEqual(await persistedPicture(),imported);
 await page.evaluate(()=>{Storage.prototype.setItem=window.__qaDrawingSet});await page.locator('#drawingFullSave').click();assert.equal(await page.locator('#drawingPanel').isVisible(),false);assert.ok(await page.locator('#imageTray img').isVisible());
 assert.equal((await persistedPicture()).body.replace(/\n\[\[рисунок:1\]\]\n/,''),imported.body);
 await page.locator('#saveStoryNow').click();
 await page.locator('#homeNewStory').click();assert.equal(await page.locator('#storyBody').inputValue(),'');assert.equal(await page.locator('#storyTheme').inputValue(),'Мои истории');await page.locator('#storyTitle').fill('Вторая свободная сказка');await page.locator('#storyBody').fill('Другой текст в той же теме.');await page.locator('#saveStoryNow').click();
 await page.reload();await page.locator('#homeDrafts').click();await page.locator('[data-own-draft]').filter({hasText:'Проверка сохранения'}).click();assert.equal(await page.locator('#storyBody').inputValue(),'Мой текст остаётся открыт.');await page.keyboard.press('Escape');await page.locator('#homeDrafts').click();await page.locator('[data-own-draft]').filter({hasText:'Вторая свободная сказка'}).click();assert.equal(await page.locator('#storyBody').inputValue(),'Другой текст в той же теме.');await page.locator('#publishStory').click();assert.ok(await page.evaluate(()=>Object.values(data.drafts).some(d=>d.title==='Проверка сохранения')),'publishing one draft does not delete another');const ownCard=page.locator('#books .book').filter({has:page.locator('.book-title',{hasText:'Вторая свободная сказка'})});assert.ok(await ownCard.locator('.book-title').evaluate(e=>e.getBoundingClientRect().height>=44));assert.ok(await ownCard.evaluate(e=>e.classList.contains('own-book')));assert.ok((await ownCard.locator('.cover').boundingBox()).height>=160,'larger personal cover');assert.ok(await ownCard.locator('.cover-picture').isVisible());for(const selector of ['.own-read','.own-edit'])assert.ok((await ownCard.locator(selector).boundingBox()).height>=48,'personal book action touch target');assert.equal(await page.locator('#ownShelfDrafts').textContent(),await page.evaluate(()=>'Мои черновики · '+(ownDraftChoices(data,OWN).length+ownEditChoices(data.stories,data.edits,OWN).length)));await ownCard.locator('.own-read').click();await page.waitForFunction(()=>document.querySelector('#ownReadText')?.textContent.includes('Другой текст в той же теме.'));await page.locator('#ownReadBack').click();assert.ok(await page.locator('#libraryHome').isVisible());assert.equal(await page.locator('#modal').isVisible(),false);await ownCard.locator('.own-edit').click();assert.equal(await page.locator('#storyBody').inputValue(),'Другой текст в той же теме.');assert.equal(await page.locator('#storyBody').evaluate(e=>e===document.activeElement),true);await page.keyboard.press('Escape');assert.ok(await page.locator('#libraryHome').isVisible());await page.locator('#home').click();
 await page.locator('#homeNewStory').click();assert.equal(await page.locator('#storyBody').inputValue(),'');
 await page.locator('#writerExtras > summary').click();await page.locator('.story-notebook summary').click();await page.locator('[data-story-plan="hero"]').fill('Лисёнок');await page.locator('[data-story-plan="wish"]').fill('Найти друзей');
 assert.equal(await page.locator('#storyBody').inputValue(),'','notes never insert prose');await page.locator('#saveStoryNow').click();
 await page.reload();await page.locator('#homeDrafts').click();await page.locator('[data-own-draft]').filter({hasText:'Лисёнок'}).click();await page.locator('#writerExtras > summary').click();await page.locator('.story-notebook summary').click();
 assert.equal(await page.locator('[data-story-plan="hero"]').inputValue(),'Лисёнок');assert.equal(await page.locator('[data-story-plan="wish"]').inputValue(),'Найти друзей');assert.equal(await page.locator('#storyBody').inputValue(),'');
 await page.locator('#storyTitle').fill('Лисёнок и друзья');await page.locator('#storyBody').fill('Жил маленький лисёнок.');
 await page.locator('#storyVersions summary').click();await page.locator('#versionSave').click();assert.equal(await page.locator('[data-version-use]').count(),1);await page.locator('#storyBody').fill('Лисёнок увидел звезду.');page.once('dialog',d=>d.accept());await page.locator('[data-version-use]').click();assert.equal(await page.locator('#storyBody').inputValue(),'Жил маленький лисёнок.');assert.ok((await page.locator('#versionList').textContent()).includes('Лисёнок увидел звезду.'));await page.locator('#storyVersions summary').click();
 await page.locator('#storyChapters summary').click();const beforeChapter=await page.evaluate(()=>localStorage.getItem(KEY));await page.locator('#newChapterTitle').fill('В лесу');assert.equal(await page.evaluate(()=>localStorage.getItem(KEY)),beforeChapter,'temporary title does not save');
 await page.evaluate(()=>{window.__qaChapterSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===KEY)throw Error('quota');return window.__qaChapterSet.call(this,k,v)}});
 await page.locator('#appendChapter').click();assert.equal(await page.locator('#storyBody').inputValue(),'Жил маленький лисёнок.');assert.equal(await page.locator('#newChapterTitle').inputValue(),'В лесу');assert.ok((await page.locator('#chapterStatus').textContent()).includes('Не удалось'));assert.equal(await page.evaluate(()=>localStorage.getItem(KEY)),beforeChapter);
 await page.evaluate(()=>Storage.prototype.setItem=window.__qaChapterSet);
 await page.locator('#appendChapter').click();assert.equal(await page.locator('#storyBody').inputValue(),'Жил маленький лисёнок.\n\n## В лесу\n');
 await page.locator('#storyBody').fill('Жил маленький лисёнок.\n\n## В лесу\nОн нашёл друга.');await page.locator('#newChapterTitle').fill('Возвращение');await page.locator('#newChapterTitle').press('Enter');assert.ok(await page.locator('#storyForm').isVisible());await page.locator('#storyBody').fill('Жил маленький лисёнок.\n\n## В лесу\nОн нашёл друга.\n\n## Возвращение\nОни вернулись домой.');
 assert.equal(await page.locator('[data-chapter-jump]').count(),3);await page.locator('[data-chapter-jump]').filter({hasText:'В лесу'}).click();assert.equal(await page.locator('#storyBody').evaluate(e=>e.selectionStart),await page.locator('#storyBody').evaluate(e=>e.value.indexOf('## В лесу')));
 await page.locator('#previewStory').click();const beforePreview=await page.evaluate(()=>localStorage.getItem(KEY));await page.locator('#bookPreviewChapter').selectOption('1');assert.ok((await page.locator('#bookPreview .reader-text').textContent()).includes('Он нашёл друга.'));assert.ok(!(await page.locator('#bookPreview .reader-text').textContent()).includes('Они вернулись домой.'));assert.equal(await page.evaluate(()=>localStorage.getItem(KEY)),beforePreview);await page.locator('#previewStory').click();
 await page.locator('#publishStory').click();
 assert.ok(await page.evaluate(()=>{const b=data.stories.find(x=>x.title==='Лисёнок и друзья');return b?.body==='Жил маленький лисёнок.\n\n## В лесу\nОн нашёл друга.\n\n## Возвращение\nОни вернулись домой.'&&b.rich?.markup&&b.plan?.hero==='Лисёнок'&&!('plan' in fbook(b))}),'private notes preserved but not shared');
 await page.evaluate(()=>{const b=data.stories.find(x=>x.title==='Лисёнок и друзья');reader(b.id)});await page.locator('#ownReadPages').click();await page.locator('#ownReadText').waitFor();assert.ok((await page.locator('#ownReadText').textContent()).includes('Жил маленький лисёнок.'));assert.equal(await page.locator('#ownReadText').evaluate(el=>el.scrollHeight<=el.clientHeight+1),true);const personalBefore=await page.evaluate(()=>JSON.stringify(data.stories));await page.locator('#ownReadLarge').click();const personalSize=await page.locator('#ownReadText').evaluate(x=>getComputedStyle(x).fontSize);await page.locator('#ownReadBack').click();await page.locator('#ownReadPages').click();assert.equal(await page.locator('#ownReadText').evaluate(x=>getComputedStyle(x).fontSize),personalSize);await page.locator('#ownReadSmall').click();assert.ok(await page.locator('#ownReadText').evaluate(x=>parseFloat(getComputedStyle(x).fontSize)<parseFloat('32px')));assert.equal(await page.evaluate(()=>JSON.stringify(data.stories)),personalBefore);await page.locator('#ownReadBack').click();assert.ok(await page.locator('#editStory').isVisible());assert.equal(await page.locator('.own-family-panel .own-share-state').textContent(),'Личная сказка');assert.ok(await page.locator('#shareFamilyBook').isVisible());await page.evaluate(()=>{const original=data.stories.find(x=>x.title==='Лисёнок и друзья');window.__shareFixture=data.familyPublished;if(!commitLibrary({...data,familyPublished:[...fpublished(),fbook(original)]}))throw Error('fixture');reader(original.id)});assert.equal(await page.locator('.own-family-panel .own-share-state').textContent(),'Для семьи');await page.evaluate(()=>{const original=data.stories.find(x=>x.title==='Лисёнок и друзья');if(!commitLibrary({...data,familyPublished:fpublished().map(x=>x.id===original.id?{...x,body:'Старая редакция'}:x)}))throw Error('fixture');reader(original.id)});assert.equal(await page.locator('.own-family-panel .own-share-state').textContent(),'Есть новая редакция');await page.evaluate(()=>{if(!commitLibrary({...data,familyPublished:window.__shareFixture}))throw Error('fixture restore')});await page.keyboard.press('Escape');
 await page.locator('#home').click();
 await page.locator('#homeNewStory').click();assert.ok(await page.locator('#publishFamily').isVisible(),'family publication visible without extra tools');assert.equal(await page.locator('#storyBody').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(255, 255, 255)','white writing paper');assert.equal(await page.locator('#storyTitle').inputValue(),'');await page.locator('#storyBody').fill('Свободно написанная сказка.');await page.locator('#publishStory').click();assert.ok(await page.evaluate(()=>data.stories.some(b=>b.title==='Сказка без названия'&&b.body==='Свободно написанная сказка.')));await page.locator('#home').click();
 await page.locator('#homeWrite').click();assert.ok(await page.locator('#storyForm').isVisible(),'resume directly without chooser');await page.keyboard.press('Escape');
 await page.evaluate(raw=>{if(!commitLibrary(JSON.parse(raw)))throw Error('restore fixture')},beforeDrafts);
 await page.locator('#homeCreate').click();assert.ok(await page.locator('#creativeHome').isVisible());assert.equal(await page.locator('#storybookHome').isVisible(),false);assert.equal(await page.locator('#creativeHome .child-picture svg').count(),3,'all creative artwork built on first visit');const creativeIdentity=await page.evaluate(()=>{const n=document.querySelector('#creativeHome .child-picture svg');n.dataset.qa='retained';homeScreen('home');homeScreen('creative');return n===document.querySelector('#creativeHome .child-picture svg')});assert.equal(creativeIdentity,true,'creative art reused on return');
 await page.locator('#childBooks').click();assert.ok(await page.locator('#libraryHome').isVisible());assert.equal(await page.locator('#homeLabel').textContent(),'Главная');
 await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));const homeRect=await page.locator('#home').boundingBox();assert.ok(homeRect.y>=0&&homeRect.y+homeRect.height<=viewport.height,'home button must stay in viewport');
 await page.locator('#home').click();assert.ok(await page.locator('#storybookHome').isVisible());await page.goBack();assert.ok(await page.locator('#libraryHome').isVisible());
 await page.reload();assert.ok(await page.locator('#storybookHome').isVisible());assert.equal(await page.evaluate(()=>location.hash),'');
 assert.equal(await page.locator('#homeLabel').textContent(),'Книга сказок');
 // P0: personal search must find a persisted book outside its selected topic/author.
 await page.evaluate(()=>{const book={id:'qa-personal-search',title:'Ёжик и северное сияние',body:'Светлячок нашёл волшебный фонарь.',theme:'Винни-Пух',author:OWN,icon:'📖'};if(!commitLibrary({...data,stories:[...data.stories,book]}))throw Error('personal search fixture');});
 await page.locator('#homeBooks').click();
 await page.locator('#libraryFilters summary').click();assert.ok(await page.locator('#topics button').filter({hasText:'Винни-Пух'}).isVisible(),'used theme visible');
 await page.evaluate(()=>chooseTheme('Море'));
 await page.locator('#libraryFilters summary').click();
 await page.locator('#bookSearch').fill('ежик фонарь');assert.ok(await page.locator('#ownShelfTools').isVisible(),'personal actions accessible while searching');assert.equal(await page.locator('#libraryFilters').evaluate(e=>e.open),false,'search collapses filters');
 assert.equal(await page.locator('#books .book-title').count(),1);
 assert.equal(await page.locator('#books .book-title').textContent(),'Ёжик и северное сияние');
 assert.ok(await page.locator('#clearBookSearch').isVisible());
 await page.locator('#bookSearch').press('Enter');
 assert.equal(await page.locator('#bookSearch').evaluate(e=>document.activeElement===e),false);
 await page.locator('#books .book-title').click();assert.ok(await page.locator('#modal').isVisible());
 await page.keyboard.press('Escape');await page.reload();
 await page.locator('#homeBooks').click();await page.locator('#bookSearch').fill('СИЯНИ');
 assert.equal(await page.locator('#books .book-title').count(),1);
 await page.locator('#clearBookSearch').click();assert.equal(await page.locator('#bookSearch').inputValue(),'');
 await page.locator('#home').click();
 await page.locator('#adultEntry').click();assert.ok(await page.locator('#adultHome').isVisible());assert.ok(await page.locator('#adultProgress .study-parent').isVisible());await page.locator('#home').click();
 await page.locator('#childLearn').click();assert.equal(await page.locator('#modal .study-parent').count(),0);assert.equal(await page.locator('#close').textContent(),'← Главная');await page.locator('#close').click();assert.ok(await page.locator('#storybookHome').isVisible());await page.locator('#childLearn').click();
 await page.locator('#learnOutcomes').click();await page.locator('[data-outcome="story"]').click();
 await page.locator('#outcomeNumber').fill('10');await page.locator('#outcomeSend').click();
 assert.equal(await page.locator('#outcomeProgress').evaluate(e=>e.value),1);
 await page.locator('#outcomeExit').click();await page.locator('[data-outcome="story"]').click();
 assert.equal(await page.locator('#outcomeProgress').evaluate(e=>e.value),1);await page.locator('#outcomeSkip').click();
 assert.equal(await page.locator('#outcomeProgress').evaluate(e=>e.value),2);
 await page.locator('#outcomeExit').click();await page.locator('#outcomeBack').click();
 await page.keyboard.press('Escape');await page.locator('#homeMath').click();assert.equal(await page.locator('[data-academy]').count(),12);
 assert.equal(await page.locator('#modal').evaluate(el=>el.classList.contains('fairy-menu-focus')),true);
 assert.equal(await page.locator('[data-academy] .fairy-art').count(),12);
 const artInfo=await page.locator('[data-academy] .fairy-art').first().evaluate(el=>{const style=getComputedStyle(el);return {image:style.backgroundImage.includes('/assets/ui/learning-sprite-1536.webp'),width:el.getBoundingClientRect().width}});
 assert.ok(artInfo.image&&artInfo.width>60,'illustration sprite did not render');

 await page.evaluate(()=>{const v=studyState('story');v.n=0;v.level=2;studySave('story',v);studyOpen('math','story')});
 const staged=await page.evaluate(()=>numberQuestion('story',0,2));
 assert.ok((await page.locator('#studyNumberLabel').textContent()).includes('Шаг 1'));
 await page.locator('#studyNumber').fill(staged.steps.answer);await page.locator('#studyCheck').click();
 assert.ok((await page.locator('#studyNumberLabel').textContent()).includes('Шаг 2'));assert.equal(await page.locator('#studyNext').isVisible(),false);
 await page.locator('#studyNumber').fill(staged.answer);await page.locator('#studyCheck').click();assert.ok(await page.locator('#studyNext').isVisible());assert.equal(await page.evaluate(()=>studyState('story').independent),1);
 await page.locator('#studyBack').click();
 await page.locator('[data-academy="add"]').click();
 await page.locator('#studyQuestion').waitFor({state:'visible'});
 assert.equal(await page.locator('#modal').evaluate(el=>el.classList.contains('fairy-menu-focus')),false);
 assert.equal(await page.locator('#modal').evaluate(el=>el.classList.contains('fairy-lesson-focus')),true);
 assert.ok(await page.locator('.lesson-workspace').isVisible());
 await page.locator('#lessonHelp summary').click();await page.locator('#studySolution').click();await page.locator('#studyNext').click();
 await page.locator('#studyBack').click();await page.locator('[data-academy="place"]').click();
 assert.equal(await page.locator('#studyModel').isVisible(),true);
 await page.locator('[data-model-i="0"][data-model-d="1"]').click();assert.equal(await page.locator('#modelValue0').textContent(),'1');
 assert.equal(await page.locator('#studyModel').getAttribute('data-model-kind'),'place');assert.equal(await page.locator('#modelArt [data-ten-rod]').count(),1);assert.equal(await page.locator('#modelArt [data-unit="ten"]').count(),10);assert.equal(await page.locator('#modelArt [data-unit="one"]').count(),0);
 await page.locator('#modelReset').click();assert.equal(await page.locator('#modelValue0').textContent(),'0');
 assert.equal(await page.locator('#modelArt [data-ten-rod]').count(),0);
 await page.locator('#lessonHelp summary').click();await page.locator('#studySolution').click();assert.ok(await page.locator('#modelCheck').isDisabled());await page.locator('#studyNext').click();assert.equal(await page.locator('#studyModel').isVisible(),false);
 await page.evaluate(()=>{const v=studyState('money');v.n=0;v.level=0;studySave('money',v);studyOpen('math','money')});
 assert.equal(await page.locator('#modelArt [data-coin-panel]').count(),4);
 const coinColors=await page.locator('#modelArt [data-coin-panel]').evaluateAll(nodes=>nodes.map(x=>x.getAttribute('fill')));assert.equal(new Set(coinColors).size,4);
 const payment=await page.evaluate(()=>mathModelQuestion('money',0,0).model.solution);
 for(let i=0;i<4;i++)for(let j=0;j<payment[i];j++)await page.locator('[data-model-i="'+i+'"][data-model-d="1"]').click();
 for(let i=0;i<4;i++)assert.equal(await page.locator('#modelArt [data-coin="'+[1,2,5,10][i]+'"]').count(),payment[i]);
 await page.locator('#modelCheck').click();assert.ok(await page.locator('#studyNext').isVisible());assert.ok((await page.locator('#studyFeedback').textContent()).startsWith('Верно!'));
 await page.evaluate(()=>{const v=studyState('memory-attention');v.n=1;v.level=3;studySave('memory-attention',v);memoryOpen('attention')});
 assert.ok((await page.locator('#memPrompt').textContent()).includes('ИЛИ'));
 const selected=await page.evaluate(()=>memoryCard('attention',1,3).answer);
 for(const i of selected)await page.locator('[data-mem="'+i+'"]').click();
 await page.locator('#memNext').click();assert.ok((await page.locator('#memFeedback').textContent()).includes('Пропущено: 0'));
 assert.equal(await page.locator('#memBoard [data-result="correct"]').count(),selected.length);
 await page.locator('#memNext').click();
 const wrongCell=await page.evaluate(()=>{const v=studyState('memory-attention'),q=memoryCard('attention',v.n,v.level);return q.choices.find(i=>!q.answer.includes(i))});
 await page.locator('[data-mem="'+wrongCell+'"]').click();await page.locator('#memNext').click();
 assert.ok((await page.locator('#memFeedback').textContent()).includes('Лишних: 1'));
 await page.locator('#memBack').click();
 await page.evaluate(()=>{const v=studyState('language-sentences');v.n=1;v.level=2;studySave('language-sentences',v);studyOpen('language','sentences')});
 assert.ok(await page.locator('#studySequence').isVisible());assert.equal(await page.locator('#sequenceRules').isVisible(),false);
 const storyCards=await page.locator('#sequenceChoices button').evaluateAll(nodes=>nodes.map(n=>({height:n.getBoundingClientRect().height,color:getComputedStyle(n).backgroundColor})));assert.ok(storyCards.every(s=>s.height>=44));assert.equal(new Set(storyCards.map(s=>s.color)).size,storyCards.length);
 const storyOrder=await page.evaluate(()=>languageQuestion('sentences',1,2).sequence.solution);
 for(const i of storyOrder.slice().reverse())await page.locator('#sequenceChoices [data-answer="'+i+'"]').click();
 await page.locator('#sequenceCheck').click();assert.ok((await page.locator('#studyFeedback').textContent()).includes('Проверь ход событий'));
 await page.locator('#sequenceReset').click();
 for(const i of storyOrder)await page.locator('#sequenceChoices [data-answer="'+i+'"]').click();
 await page.locator('#sequenceCheck').click();assert.ok(await page.locator('#studyNext').isVisible());
 await page.evaluate(()=>{const v=studyState('measure');v.n=1;v.level=3;studySave('measure',v);studyOpen('math','measure')});
 assert.equal(await page.locator('#studyPicture [data-ruler-ribbon]').count(),2);
 assert.ok(await page.locator('#studyPicture svg').isVisible());
 const rulerAnswer=await page.evaluate(()=>numberQuestion('measure',1,3).answer);
 await page.locator('#studyNumber').fill(rulerAnswer);await page.locator('#studyCheck').click();assert.ok(await page.locator('#studyNext').isVisible());
 await page.evaluate(()=>{const v=studyState('measure');v.n=5;v.level=3;studySave('measure',v);studyOpen('math','measure')});
 assert.equal(await page.locator('#studyPicture [data-ruler-ribbon]').count(),2);
 assert.ok((await page.locator('#studyQuestion').textContent()).includes('вместе'));
 const rulerTotal=await page.evaluate(()=>numberQuestion('measure',5,3).answer);
 await page.locator('#studyNumber').fill(rulerTotal);await page.locator('#studyCheck').click();assert.ok(await page.locator('#studyNext').isVisible());
 await page.evaluate(()=>{const v=studyState('geometry');v.n=1;v.level=3;studySave('geometry',v);studyOpen('math','geometry')});
 assert.equal(await page.locator('#studyPicture [data-geometry-rect]').count(),1);
 assert.equal(await page.locator('#studyPicture svg text').filter({hasText:/^\?$/}).count(),2);
 const sideAnswer=await page.evaluate(()=>numberQuestion('geometry',1,3).answer);
 await page.locator('#studyNumber').fill(sideAnswer);await page.locator('#studyCheck').click();assert.ok(await page.locator('#studyNext').isVisible());
 await page.keyboard.press('Escape');await page.locator('#homeLogic').click();
 assert.equal(await page.locator('[data-academy]').count(),6);
 assert.equal(await page.locator('[data-academy] .fairy-art').count(),6);
 assert.equal(await page.locator('[data-academy="evidence"]').isVisible(),true);
 await page.locator('[data-academy="evidence"]').click();
 await page.locator('#studyChoices button').first().click();
 await page.locator('#studyFeedback').waitFor({state:'visible'});
 await page.keyboard.press('Escape');await page.locator('#homeLogic').click();
 const planning=page.locator('[data-academy="planning"]');
 assert.equal(await planning.isVisible(),true);
 await planning.click();
 await page.locator('#studySequence').waitFor({state:'visible'});
 assert.equal(await page.locator('#sequenceCheck').isDisabled(),true);
 await page.locator('#sequenceChoices button').first().click();
 await page.locator('#sequenceUndo').click();
 assert.equal(await page.locator('#sequenceCheck').isDisabled(),true);
 await page.locator('#lessonHelp summary').click();await page.locator('#studySolution').click();
 assert.equal(await page.locator('#sequenceCheck').isDisabled(),true);
 await page.locator('#studyNext').click();
 assert.equal(await page.locator('#studySequence').isVisible(),false);
 await page.keyboard.press('Escape');
 await page.evaluate(()=>{let v=studyState("logic-deduction");v.n=2;v.level=3;studySave("logic-deduction",v);studyOpen("logic","deduction")});
 assert.equal(await page.locator('#sequenceRules li').count(),4);assert.equal(await page.locator('#sequenceRules li').filter({hasText:'соседние места'}).count(),2);
 const deductOrder=await page.evaluate(()=>academyLogicQuestion("deduction",2,3).sequence.solution);
 for(const i of deductOrder.slice().reverse())await page.locator('#sequenceChoices [data-answer="'+i+'"]').click();
 await page.locator('#sequenceCheck').click();assert.ok((await page.locator('#studyFeedback').textContent()).includes('Проверь условие'));
 await page.locator('#sequenceReset').click();for(const i of deductOrder)await page.locator('#sequenceChoices [data-answer="'+i+'"]').click();await page.locator('#sequenceCheck').click();assert.ok(await page.locator('#studyNext').isVisible());
 await page.keyboard.press('Escape');
 await page.evaluate(()=>{let v=studyState("logic-order");v.n=3;v.level=2;studySave("logic-order",v);studyOpen("logic","order")});
 assert.ok(await page.locator('#studySpatial').isVisible());await page.locator('#spatialControls button:enabled').first().click();
 assert.equal(await page.locator('#spatialStatus').textContent(),'Шагов: 1');
 await page.locator('#spatialUndo').click();assert.equal(await page.locator('#spatialStatus').textContent(),'Шагов: 0');
 await page.locator('#lessonHelp summary').click();await page.locator('#studySolution').click();assert.ok(await page.locator('#spatialCheck').isDisabled());
 await page.locator('#studyNext').click();assert.equal(await page.locator('#studySpatial').isVisible(),false);
 await page.keyboard.press('Escape');await page.evaluate(()=>{let v=studyState("logic-order");v.n=1;v.level=3;studySave("logic-order",v);studyOpen("logic","order")});
 assert.equal(await page.locator('#studySpatial').getAttribute('data-kind'),'mirror');assert.equal(await page.locator('#spatialControls button').count(),9);
 const mirrorAnswer=await page.evaluate(()=>spatialQuestion(1,3).spatial.solution);
 await page.locator('#spatialControls [data-spatial="'+mirrorAnswer[0]+'"]').click();
 assert.equal(await page.locator('#spatialControls [aria-pressed="true"]').count(),1);assert.ok((await page.locator('#spatialControls [aria-pressed="true"]').evaluate(b=>getComputedStyle(b,'::after').content)).includes('✓'));assert.equal(await page.locator('#spatialCheck').evaluate(b=>getComputedStyle(b).backgroundColor),'rgb(15, 118, 110)');
 await page.locator('#spatialReset').click();assert.equal(await page.locator('#spatialControls [aria-pressed="true"]').count(),0);
 await page.locator('#spatialCheck').click();assert.ok((await page.locator('#studyFeedback').textContent()).includes('Проверь'));
 for(const i of mirrorAnswer)await page.locator('#spatialControls [data-spatial="'+i+'"]').click();
 await page.locator('#spatialCheck').click();assert.ok(await page.locator('#studyNext').isVisible());
 await page.keyboard.press('Escape');await page.evaluate(()=>{let v=studyState("logic-order");v.n=7;v.level=3;studySave("logic-order",v);studyOpen("logic","order")});
 assert.equal(await page.locator('#studyChoices button').count(),4);assert.ok(await page.locator('#studyPicture svg').isVisible());assert.equal((await page.locator('#studyQuestion').textContent()).match(/вправо|влево|вверх|вниз/g).length,4);
 const coordinateAnswer=await page.evaluate(()=>academySpatial(7,3).answer);await page.locator('#studyChoices').getByRole('button',{name:coordinateAnswer,exact:true}).click();assert.ok(await page.locator('#studyNext').isVisible());assert.ok((await page.locator('#studyFeedback').textContent()).includes('Маршрут:'));
 await page.keyboard.press('Escape');assert.ok(await page.evaluate(()=>performance.getEntriesByType('resource').filter(r=>r.name.includes('/assets/world/')).every(r=>/\/(night-owl-cover|night-bats-scene|egypt-nile-cover)-(320|504)-v1\.webp$/.test(r.name))),'only optional gallery art before world');await page.route('**/assets/world/*',r=>r.abort());await page.locator('#childWorld').click();await page.waitForFunction(()=>document.querySelectorAll('.world-cover img').length===0);assert.ok(await page.locator('.world-cover svg').evaluateAll(s=>s.length===2&&s.every(x=>getComputedStyle(x).visibility==='visible')),'SVG fallback on image failure');await page.waitForFunction(()=>!document.querySelector('.world-scene img'));assert.ok(await page.locator('.world-scene svg').isVisible());await page.unroute('**/assets/world/*');await page.locator('[data-area="4"]').click();await page.waitForFunction(()=>{const img=document.querySelector('.world-scene img');return img&&!img.hidden&&img.complete&&img.naturalWidth>=320});assert.ok(await page.locator('.world-scene img').evaluate(img=>img.getBoundingClientRect().width<=320.1&&img.getBoundingClientRect().height>100&&img.currentSrc.includes('-v1.webp')));await page.waitForFunction(()=>[...document.querySelectorAll('.world-cover img')].length===2&&[...document.querySelectorAll('.world-cover img')].every(img=>!img.hidden&&img.naturalWidth===128&&img.naturalHeight===128));assert.ok(await page.locator('.world-cover img').evaluateAll(imgs=>imgs.every(img=>img.getBoundingClientRect().width<=64.1&&img.getBoundingClientRect().height>=40&&img.alt==='')));
 assert.equal(await page.locator('[data-area]').count(),6);
 await page.locator('[data-area="5"]').click();await page.waitForFunction(()=>{const img=document.querySelector('.world-scene img');return img&&!img.hidden&&img.complete&&img.naturalWidth>=320});assert.ok(await page.locator('.world-scene img').evaluate(img=>img.getBoundingClientRect().width<=320.1&&img.getBoundingClientRect().height>100&&img.currentSrc.includes('-v1.webp')));await page.route('**/assets/world/night-roost-scene-*',r=>r.abort());await page.evaluate(()=>nightRead(2));await page.waitForFunction(()=>!document.querySelector('.night-layout .world-scene img'));assert.ok(await page.locator('.night-layout>div:first-child svg').isVisible(),'roost image fallback');await page.unroute('**/assets/world/night-roost-scene-*');await page.evaluate(()=>nightRead(0));
 for(let i=0;i<10;i++){if(i===2){await page.waitForFunction(()=>{const img=document.querySelector('.night-layout .world-scene img');return img&&!img.hidden&&img.naturalWidth>=320&&img.currentSrc.includes('night-roost-scene')});const art=page.locator('.night-layout .world-scene img');assert.ok(await art.evaluate(img=>img.getBoundingClientRect().width<=320.1&&img.getBoundingClientRect().height>100));assert.ok(await page.locator('.night-layout figcaption').evaluate(e=>parseFloat(getComputedStyle(e).fontSize)>=16));assert.equal(await page.locator('.night-layout>div:first-child svg').isVisible(),false)}else assert.ok(await page.locator('.night-layout>div:first-child svg').isVisible());assert.ok((await page.locator('.night-count').textContent()).includes((i+1)+' из 10'));assert.ok((await page.locator('.night-layout p').first().textContent()).length>80);await page.locator('#nightRiddle>summary').click();assert.ok(await page.locator('#nightRiddle>p').isVisible());await page.locator('#nightNext').click();}
 await page.locator('#nightContentsOpen').click();assert.equal(await page.locator('[data-night-chapter]').count(),10);assert.equal(await page.locator('.world-scene img').count(),0,'contents never loads full scenes');assert.ok(await page.locator('[data-night-chapter]').evaluateAll(cards=>cards.every(c=>c.getBoundingClientRect().height>=44&&c.getBoundingClientRect().width>=44&&!!c.querySelector('svg'))),'all chapter cards have artwork and touch targets');assert.ok(await page.locator('#modalBody').evaluate(e=>e.scrollWidth<=e.clientWidth+1),'contents does not overflow horizontally');assert.equal(await page.locator('[data-night-chapter][aria-current=page]').getAttribute('data-night-chapter'),'9');await page.locator('[data-night-chapter="1"]').click();assert.equal(await page.locator('#nightEcho').evaluate(e=>e.open),false);await page.locator('#nightEcho>summary').click();assert.equal(await page.locator('#nightEchoMeters').textContent(),'3 м');assert.equal(await page.locator('#nightEchoFeedback').isVisible(),false);await page.locator('#nightEchoLess').click();assert.equal(await page.locator('#nightEchoMeters').textContent(),'2 м');assert.equal(await page.locator('#nightEchoTree').getAttribute('transform'),'translate(148 0)');await page.locator('#nightEchoShow').click();assert.ok((await page.locator('#nightEchoFeedback').textContent()).includes('2 м туда + 2 м обратно = 4 м'));assert.ok((await page.locator('#nightEchoFeedback').textContent()).includes('раньше'));assert.equal(await page.locator('#nightEchoPaths').getAttribute('visibility'),'visible');await page.locator('#nightEchoDistance').press('End');assert.equal(await page.locator('#nightEchoMeters').textContent(),'5 м');assert.equal(await page.locator('#nightEchoPaths').getAttribute('visibility'),'hidden');assert.equal(await page.locator('#nightEchoFeedback').isVisible(),false);await page.locator('#nightEchoShow').click();assert.ok((await page.locator('#nightEchoFeedback').textContent()).includes('10 м'));assert.ok((await page.locator('#nightEchoFeedback').textContent()).includes('позже'));assert.ok(await page.locator('#nightEcho .bat-controls button,#nightEcho .night-echo-actions button').evaluateAll(nodes=>nodes.every(n=>n.getBoundingClientRect().height>=44)));await page.locator('#nightEchoReset').click();assert.equal(await page.locator('#nightEchoMeters').textContent(),'3 м');assert.equal(await page.locator('#nightEchoFeedback').isVisible(),false);assert.ok(await page.locator('#modalBody').evaluate(e=>e.scrollWidth<=e.clientWidth+1));await page.locator('#nightEchoShow').click();assert.ok((await page.locator('#nightEchoFeedback').textContent()).includes('через такое же время, как в начале'));await page.locator('#nightEchoReset').click();
 const tree=page.locator('#nightEchoTree');await tree.scrollIntoViewIfNeeded();const box=await tree.boundingBox(),unit=await tree.evaluate(el=>{const m=el.ownerSVGElement.getScreenCTM();return 43*m.a});assert.ok(box&&unit>0);
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+unit,box.y+box.height/2,{steps:6});await page.mouse.up();assert.equal(await page.locator('#nightEchoMeters').textContent(),'4 м','direct pointer drag updates the same model');assert.equal(await page.locator('#nightEchoFeedback').isVisible(),false);
 await page.locator('#nightEchoReset').click();await page.locator('#nightExplore').click();assert.equal(await page.locator('#worldLab').isVisible(),false);await page.locator('#worldUnsure').click();assert.ok(await page.locator('#worldLab').isVisible());await page.locator('[data-lab="2"]').click();assert.equal(await page.locator('[data-echo-wall="2"]').getAttribute('x'),'280');await page.locator('#worldBack').click();assert.ok((await page.locator('#nightTitle').textContent()).includes('дорожки звука'));await page.locator('#nightChapter').click();await page.locator('[data-night-chapter="7"]').click();assert.ok((await page.locator('.night-layout h3').textContent()).includes('Малютка'));await page.waitForFunction(()=>{const img=document.querySelector('.world-scene img');return img&&!img.hidden&&img.complete&&img.naturalWidth>=320});assert.ok(await page.locator('.world-scene img').evaluate(img=>img.getBoundingClientRect().width<=320.1&&img.getBoundingClientRect().height>100&&img.currentSrc.includes('-v1.webp')));assert.ok((await page.locator('.world-scene figcaption').textContent()).includes('не точный портрет'));assert.ok(await page.locator('.night-layout>div:first-child svg').isVisible());assert.ok((await page.locator('#nightExplore').boundingBox()).height>=44);assert.ok((await page.locator('.night-research').textContent()).includes('один общий признак'));assert.equal(await page.locator('#batCompare').evaluate(e=>e.open),false);await page.locator('#batCompare>summary').click();assert.ok(await page.locator('.bat-measure').first().isVisible());assert.equal(await page.locator('.bat-measure').count(),2);await page.locator('#batLess').click();assert.equal(await page.locator('#batValue').textContent(),'35 мм');assert.ok((await page.locator('#batResult').textContent()).includes('Нетопырь-карлик'));await page.locator('#batMore').click();assert.equal(await page.locator('#batValue').textContent(),'40 мм');assert.ok((await page.locator('#batResult').textContent()).includes('оба диапазона'));await page.locator('#batLength').press('ArrowRight');assert.equal(await page.locator('#batValue').textContent(),'41 мм');assert.equal(await page.locator('#batReason').evaluate(e=>e.open),false);await page.locator('#batReason>summary').click();assert.ok(await page.locator('#batReason p').isVisible());assert.ok((await page.locator('#batReason p').textContent()).includes('40 мм входит в оба диапазона'));assert.ok(await page.locator('#modalBody').evaluate(e=>e.scrollWidth<=e.clientWidth+1));await page.locator('#nightExplore').click();assert.ok((await page.locator('#worldBack').textContent()).includes('К главе'));await page.locator('#worldUnsure').click();await page.locator('#worldBack').click();assert.ok((await page.locator('#nightTitle').textContent()).includes('Малютка'));assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('skazki-reading-offsets-v1'))['night:forest'].scene),7);assert.equal(await page.locator('select#nightChapter').count(),0);await page.locator('#nightChapter').click();assert.equal(await page.locator('[data-night-chapter][aria-current=page]').getAttribute('data-night-chapter'),'7');await page.locator('#nightContentsBack').click();assert.ok((await page.locator('.night-count').textContent()).includes('8 из 10'));await page.locator('#nightTopPrev').click();assert.ok((await page.locator('.night-count').textContent()).includes('7 из 10'));await page.locator('#nightTopNext').click();await page.locator('#nightContentsBottom').click();await page.locator('[data-night-chapter="5"]').click();assert.ok((await page.locator('.night-layout h3').textContent()).includes('Сова'));await page.locator('#nightPrev').click();assert.ok((await page.locator('.night-count').textContent()).includes('5 из 10'));await page.locator('#nightBack').click();assert.ok((await page.locator('#nightRead').textContent()).includes('5'));await page.locator('#nightRead').click();assert.ok((await page.locator('.night-count').textContent()).includes('5 из 10'));assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('skazki-reading-offsets-v1'))['night:forest'].scene),4);await page.locator('#nightBack').click();
 await page.locator('[data-area="1"]').click();
 assert.equal(await page.locator('.explore-grid [data-world]').count(),7);
 for(const [area,id] of [[5,'bat-echo'],[5,'bat-life'],[5,'owl-hearing'],[5,'owl-eyes'],[4,'egypt-nile'],[4,'egypt-writing']]){
  await page.locator('[data-area="'+area+'"]').click();await page.locator('.explore-grid [data-world="'+id+'"]').click();
  assert.ok(await page.locator('#worldIllustration svg').isVisible());
  for(let step=0;step<3;step++){assert.ok((await page.locator('#worldQuestion').textContent()).length>10);await page.locator('#worldUnsure').click();if(step<2)await page.locator('#worldNext').click();}
  assert.ok(await page.locator('#worldTask').isVisible());assert.ok(await page.evaluate(id=>JSON.parse(localStorage.getItem('skazki-world-mastery-v1'))[id].done===1,id));
  await page.locator('#worldBack').click();
 }
 await page.locator('[data-area="1"]').click();await page.locator('[data-world="bee"]').click();
 await page.locator('#worldBack').click();
 assert.equal(await page.locator('[data-area="1"]').getAttribute('aria-pressed'),'true');
 await page.locator('[data-area="0"]').click();await page.locator('[data-world="day"]').click();
 assert.equal(await page.locator('#dayExperiment').isVisible(),false);
 await page.locator('#worldUnsure').click();await page.locator('#dayRotate').click();await page.locator('#dayRotate').click();
 assert.ok((await page.locator('.day-model-label').textContent()).includes('Ночь'));
 for(const [area,id] of [[0,'shadow'],[2,'magnet'],[2,'float'],[0,'ice'],[2,'sound'],[0,'rain'],[2,'air'],[0,'moon'],[1,'bee'],[5,'bat-echo'],[4,'egypt-nile'],[4,'egypt-writing']]){
  await page.locator('#worldBack').click();await page.locator('[data-area="'+area+'"]').click();await page.locator('[data-world="'+id+'"]').click();
  assert.equal(await page.locator('#worldLab').isVisible(),false);
  await page.locator('#worldUnsure').click();assert.ok(await page.locator('#worldLab').isVisible());
  const sizes=await page.locator('#worldLabControls button').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {w:r.width,h:r.height}}));assert.ok(sizes.every(s=>s.w>=44&&s.h>=44),'lab touch targets');
  assert.ok(await page.locator('#worldLabModel svg[role="img"][aria-label]').isVisible());
  if(id==='moon'||id==='bee'){const diagram=page.locator('#worldLabModel svg');if(id==='moon')assert.equal(await diagram.locator('[data-moon-position="0"]').count(),1);await page.locator('[data-lab="1"]').click();assert.ok((await diagram.textContent()).includes(id==='moon'?'Четверть: половина диска':'Переработка нектара'));await page.locator('[data-lab="0"]').click();}
  const first=await page.locator('#worldLabLabel').textContent();
  if(id==='bat-echo')assert.equal(await page.locator('[data-echo-wall="0"]').getAttribute('x'),'160');
  if(id==='egypt-nile')assert.equal(await page.locator('[data-nile-channel]').count(),0);
  if(id==='egypt-writing'){const code=page.locator('#worldLabModel svg');assert.ok((await code.textContent()).includes('Луна · лес · луна'));await page.locator('[data-lab="1"]').click();assert.ok((await code.textContent()).includes('Ключ неизвестен'));assert.ok((await code.textContent()).includes('? · ? · ?'));await page.locator('[data-lab="0"]').click();}
  await page.locator('[data-lab="2"]').click();
  assert.notEqual(await page.locator('#worldLabLabel').textContent(),first);
  if(id==='bat-echo')assert.equal(await page.locator('[data-echo-wall="2"]').getAttribute('x'),'280');
  if(id==='egypt-nile'){const channel=page.locator('[data-nile-channel]');assert.ok(await channel.isVisible());assert.ok(await channel.evaluate(el=>{const b=el.getBBox();return b.width>0&&b.height>0&&getComputedStyle(el).fill==='rgb(62, 145, 195)'}),'visible water channel with positive area');}
  if(id==='egypt-writing')assert.ok((await page.locator('#worldLabModel svg').textContent()).includes('Лес · луна · лес'));
  assert.equal(await page.locator('[data-lab="2"]').getAttribute('aria-pressed'),'true');
  await page.locator('#worldNext').click();assert.equal(await page.locator('#worldLab').isVisible(),false);
 }
 await page.locator('#worldBack').click();await page.locator('[data-area="1"]').click();await page.locator('[data-world="seed"]').click();
 assert.equal(await page.locator('#seedExperiment').isVisible(),false);await page.locator('#worldUnsure').click();
 assert.ok(await page.locator('#seedExperiment').isVisible());assert.ok((await page.locator('#seedArt svg').getAttribute('aria-label')).includes('Предскажи'));
 await page.locator('[data-seed="1"]').click();await page.locator('#seedYes').click();assert.ok((await page.locator('#seedFeedback').textContent()).includes('Без воды'));assert.equal(await page.locator('#seedYes').isVisible(),false);
 await page.locator('[data-seed="4"]').click();await page.locator('#seedYes').click();assert.ok((await page.locator('#seedFeedback').textContent()).includes('может прорасти без света'));await page.locator('#worldNext').click();assert.equal(await page.locator('#seedExperiment').isVisible(),false);
 await page.keyboard.press('Escape');await page.locator('#readingEntry').click();
 // Author filter, global search and topic change stay consistent.
 const filterLabel=page.locator('#readingFilterLabel');await filterLabel.click();
 const authorButton=page.locator('#readingAuthorShelf button[data-author]:not([data-author=""])').first();
 const chosenAuthor=await authorButton.getAttribute('data-author');await authorButton.click();
 assert.equal(await filterLabel.textContent(),chosenAuthor);
 assert.equal(await authorButton.getAttribute('aria-pressed'),'true');
 assert.ok((await authorButton.boundingBox()).height>=44);
 await page.locator('#readingSearch').fill('Горошина');
 assert.equal(await authorButton.getAttribute('aria-pressed'),'false');
 assert.equal(await filterLabel.textContent(),'Выбрать автора или тему');
 assert.ok((await page.locator('#readingCount').textContent()).startsWith('По всем книгам: '));
 await page.locator('#readingFilters button').first().click();
 assert.equal(await page.locator('#readingSearch').inputValue(),'');
 assert.equal(await page.locator('#readingFilters button').first().getAttribute('aria-pressed'),'true');
 await page.locator('[data-quick="Все сказки"]').click();

 await page.locator('[data-story]').first().click();await page.locator('#readingNumber').waitFor({state:'visible'});
 assert.equal(await page.locator('#readingBack').getAttribute('aria-label'),'Вернуться к списку книг');
 await page.waitForFunction(()=>document.getElementById('readingNumber')?.textContent.includes('/'));
 for(let i=0;i<3;i++){
 const dims=await page.locator('#readingText').evaluate(el=>({client:el.clientHeight,scroll:el.scrollHeight}));
 assert.ok(dims.client>0&&dims.scroll<=dims.client+2,'reading text overflow '+JSON.stringify(dims));
 if(await page.locator('#readingNext').textContent()==='Закончить')break;
 await page.locator('#readingNext').click();
 }
 const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('skazki-reading-offsets-v1')||'{}'));
 await page.setViewportSize({width:viewport.height,height:viewport.width});
 await page.waitForTimeout(150);
 const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('skazki-reading-offsets-v1')||'{}'));
 assert.deepEqual(after,before,'rotation must not move reading anchor');
 assert.equal(await page.locator('#readingLarge').isVisible(),false);await page.locator('#readerOptions summary').click();
 for(const size of ['#readingLarge','#readingSmall']){
 const btn=page.locator(size);if(await btn.isEnabled())await btn.click();
 const dims=await page.locator('#readingText').evaluate(el=>({client:el.clientHeight,scroll:el.scrollHeight}));
 assert.ok(dims.client>0&&dims.scroll<=dims.client+2,'font resize overflow');
 }
 await page.locator('#readerOptions summary').click();await page.locator('#readingBack').click();
 await page.locator('[data-story="lantern-friends"]').click();
 for(let j=0;j<50&&await page.locator('#readingNext').count();j++)await page.locator('#readingNext').click();
 await page.locator('#readingQuizStart').click();
 for(let j=0;j<3;j++){
 assert.equal(await page.locator('#rqEvidence').isVisible(),false);
 await page.locator('#rqUnsure').click();
 if(j===2){await page.locator('#rqEvidence summary').click();assert.ok((await page.locator('#rqQuote').textContent()).length>0)}
 await page.locator('#rqNext').click();
 }
 assert.ok((await page.locator('.reading-finish').textContent()).includes('0 из 3'));
 await page.keyboard.press('Escape');
 await page.evaluate(()=>artRoom());
 await page.locator('#drawingCanvas').waitFor({state:'visible'});
 // Full-screen is a CSS-only view of the existing canvas; preserve pixels and undo.
 const drawingView=page.locator('#drawingCanvas'),expand=page.locator('#drawingExpand');
 const drawSnapshot=()=>drawingView.evaluate(c=>({pixels:c.toDataURL(),width:c.width,height:c.height}));
 const blankDrawing=await drawSnapshot(),normalBox=await drawingView.boundingBox();
 assert.equal(await expand.evaluate(e=>e.parentElement.id),'studioSheet','size control belongs to the drawing sheet');
 assert.ok((await expand.boundingBox()).height>=44,'large touch target');

 await expand.click();await page.waitForFunction(()=>document.getElementById('modal').classList.contains('canvas-full'));
 await page.waitForFunction(w=>document.getElementById('drawingCanvas').getBoundingClientRect().width>=w*1.10,normalBox.width);
 const enlargedBox=await drawingView.boundingBox();console.log('DRAWING RECT',JSON.stringify({viewport:page.viewportSize(),normal:normalBox,expanded:enlargedBox}));assert.ok(enlargedBox.width*enlargedBox.height>normalBox.width*normalBox.height*1.20,'expanded area must grow by at least 20 percent');
 assert.equal(await expand.getAttribute('aria-pressed'),'true');assert.ok((await expand.textContent()).includes('Уменьшить'));
 assert.deepEqual(await drawSnapshot(),blankDrawing,'expand must not reset or resample drawing');
 assert.equal(await page.locator('#drawingFullColor').isVisible(),true);
 assert.equal(await page.locator('#drawingFullSave').isVisible(),true);
 assert.equal(await page.locator('#drawingFullSave').isEnabled(),false,'blank drawing has no save');
 for(const tool of ['fill','pick'])assert.equal(await page.locator('[data-tool="'+tool+'"]').isVisible(),true,'active tools remain visible');
 const edge=await expand.boundingBox(),paper=await drawingView.boundingBox();assert.ok(edge.y+edge.height<=paper.y+1,'expand control must never cover pixels');

 // The professional palette must work on the same full-screen drawing.
 const pro=page.locator('#studioProPane'),proButton=page.locator('#studioPro');
 await proButton.click();assert.ok(await pro.isVisible());assert.equal(await page.locator('#proEffect option').count(),30);
 await page.locator('#proPalette').selectOption('all');assert.equal(await page.locator('#proSwatches button').count(),72);
 // Width, opacity and RGB mixing must not replace palette controls or lose keyboard focus.
 const paletteResult=await page.evaluate(()=>{const host=document.getElementById('proSwatches'),before=Array.from(host.children),shade=document.getElementById('proShades').children[3],preview=document.getElementById('proPreview');const change=(id,v)=>{const e=document.getElementById(id);e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}))};before[5].focus();before[5].click();const focused=document.activeElement===before[5];change('proWidth','32');change('proOpacity','55');const pixels=preview.toDataURL();change('proRatio','23');const stablePreview=pixels===preview.toDataURL();const stable=before.every((node,i)=>host.children[i]===node)&&document.getElementById('proShades').children[3]===shade;return {focused,stable,stablePreview,selected:before[5].getAttribute('aria-pressed'),shadeMatches:shade.dataset.color===document.getElementById('proColor').value}});assert.deepEqual(paletteResult,{focused:true,stable:true,stablePreview:true,selected:'true',shadeMatches:true});

 await page.locator('#proPalette').selectOption('warm');assert.equal(await page.locator('#proSwatches button').count(),8);
 const setValue=async(id,value)=>page.locator('#'+id).evaluate((e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}))},value);
 await setValue('proColor','#ff0000');await setValue('proSecond','#0000ff');await setValue('proRatio','50');
 assert.equal(await page.locator('#proMixSample').getAttribute('title'),'#800080');await page.locator('#proMix').click();
 assert.equal(await page.locator('#drawingFullColor').inputValue(),'#800080');
 assert.equal(await page.locator('#proShades button').count(),7);
 await setValue('proWidth','40');await setValue('proOpacity','30');await page.locator('#proEffect').selectOption('solid');
 const lightPreview=await page.locator('#proPreview').evaluate(c=>c.toDataURL());
 await setValue('proOpacity','100');assert.notEqual(await page.locator('#proPreview').evaluate(c=>c.toDataURL()),lightPreview);
 await setValue('proOpacity','30');await page.locator('#studioProClose').click();assert.ok(!await pro.isVisible());
 const pixel=async()=>drawingView.evaluate(c=>Array.from(c.getContext('2d').getImageData(360,240,1,1).data));
 await drawingView.click();const faded=await pixel();assert.ok(faded[1]>100&&faded[1]<253,'transparent stroke changes actual pixels');await page.locator('#drawingUndo').click();assert.deepEqual(await drawSnapshot(),blankDrawing);
 await proButton.click();await setValue('proOpacity','100');await page.locator('#studioProClose').click();await drawingView.click();assert.deepEqual(await pixel(),[128,0,128,255],'opaque mixed pigment on paper');await page.locator('#drawingUndo').click();assert.deepEqual(await drawSnapshot(),blankDrawing);
 // Layered watercolor and gouache: readable soft edge, stronger core, actual opacity.
 const brushLayers=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=120;c.height=100;const g=c.getContext('2d');const sample=(kind,opacity)=>{g.fillStyle='#ffffff';g.fillRect(0,0,120,100);studioStroke(g,{x:20,y:50},{x:100,y:50},32,kind,'#2848b0',0,opacity);return [50,68,73,82].map(y=>g.getImageData(60,y,1,1).data[0])};return {water:sample('water',1),faded:sample('water',.3),gouache:sample('gouache',1)}});assert.ok(brushLayers.water[0]<brushLayers.water[1]&&brushLayers.water[1]<brushLayers.water[2]&&brushLayers.water[2]<255&&brushLayers.water[3]===255,'watercolor layered pigment');assert.ok(brushLayers.faded[0]>brushLayers.water[0],'watercolor honors opacity');assert.ok(brushLayers.gouache[0]<brushLayers.gouache[1]&&brushLayers.gouache[1]<brushLayers.gouache[2]&&brushLayers.gouache[2]<255&&brushLayers.gouache[3]===255,'gouache soft edge');
 // Dry pigment: deterministic grain, variable pigment density, opacity and bounded extent.
 const dry=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=160;c.height=100;const g=c.getContext('2d');const sample=(kind,opacity)=>{g.fillStyle='#ffffff';g.fillRect(0,0,160,100);studioStroke(g,{x:20,y:50},{x:140,y:50},32,kind,'#2848b0',0,opacity);const d=g.getImageData(35,43,90,14).data,values=[];for(let i=0;i<d.length;i+=4)values.push(d[i]);return {levels:new Set(values).size,mean:values.reduce((a,b)=>a+b,0)/values.length,outside:g.getImageData(80,80,1,1).data[0],image:c.toDataURL()}};const pencil=sample('grain-pencil',1),pastel=sample('pastel',1);return {pencil:pencil.levels,pastel:pastel.levels,deterministic:pencil.image===sample('grain-pencil',1).image,distinct:pencil.image!==pastel.image,opacity:sample('grain-pencil',.3).mean>pencil.mean&&sample('pastel',.3).mean>pastel.mean,outside:pencil.outside===255&&pastel.outside===255}});assert.ok(dry.pencil>5&&dry.pastel>5,'textured dry pigments');assert.ok(dry.deterministic&&dry.distinct&&dry.opacity&&dry.outside,'dry pigment boundaries, opacity and repeatability');
 // Check each new effect uses the real renderer, not merely a label.
 for(const kind of ['gouache','ink','spray','grain-pencil','pastel']){
  await proButton.click();await page.locator('#proEffect').selectOption(kind);await page.locator('#studioProClose').click();
  await drawingView.click();assert.notEqual((await drawSnapshot()).pixels,blankDrawing.pixels,kind+' paints');await page.locator('#drawingUndo').click();assert.deepEqual(await drawSnapshot(),blankDrawing);
 }
 await proButton.click();await page.locator('#proEffect').selectOption('solid');await setValue('proWidth','40');await page.locator('#proPressure').check();await page.locator('#studioProClose').click();
 const pen=async pressure=>drawingView.evaluate((c,pressure)=>{const r=c.getBoundingClientRect(),opts={pointerId:50,pointerType:'pen',pressure,clientX:r.x+r.width/2,clientY:r.y+r.height/2,bubbles:true};c.dispatchEvent(new PointerEvent('pointerdown',opts));c.dispatchEvent(new PointerEvent('pointerup',opts));const d=c.getContext('2d').getImageData(370,240,1,1).data;return Array.from(d)},pressure);
 const thin=await pen(.2);await page.locator('#drawingUndo').click();const thick=await pen(1);assert.notDeepEqual(thin,thick,'pen pressure changes painted width');await page.locator('#drawingUndo').click();
 // Restore simple-mode defaults before existing drawing suite.
 await proButton.click();await page.locator('#proPressure').uncheck();await setValue('proWidth','11');await setValue('proOpacity','100');await setValue('proColor','#344b3d');await page.keyboard.press('Escape');assert.ok(!await pro.isVisible());assert.equal(await expand.getAttribute('aria-pressed'),'true');
 assert.deepEqual(await drawSnapshot(),blankDrawing);console.log('PASS professional palette, mixed pigment, opacity, effects and synthetic pen pressure');
 // A batch of pointer samples must preserve a bend instead of drawing a straight shortcut.
 const sampled=await drawingView.evaluate(c=>{const r=c.getBoundingClientRect(),ctx=c.getContext('2d'),ev=(x,y,type='pointermove')=>new PointerEvent(type,{pointerId:81,pointerType:'pen',pressure:.8,clientX:r.x+x*r.width/c.width,clientY:r.y+y*r.height/c.height,bubbles:true});const pixel=(x,y)=>Array.from(ctx.getImageData(x,y,1,1).data);const before=pixel(360,360),straight=pixel(360,120);c.dispatchEvent(ev(180,120,'pointerdown'));const event=ev(540,120);Object.defineProperty(event,'getCoalescedEvents',{value:()=>[ev(360,360),ev(540,120)]});c.dispatchEvent(event);c.dispatchEvent(ev(540,120,'pointerup'));return {bend:pixel(360,360).join()!==before.join(),noShortcut:pixel(360,120).join()===straight.join()}});assert.deepEqual(sampled,{bend:true,noShortcut:true});
 await page.locator('#drawingUndo').click();assert.deepEqual(await drawSnapshot(),blankDrawing,'batched stroke is one undo step');
 const single=await drawingView.evaluate(c=>{const r=c.getBoundingClientRect(),ev=(x,y,type)=>new PointerEvent(type,{pointerId:82,pointerType:'touch',clientX:r.x+x*r.width/c.width,clientY:r.y+y*r.height/c.height,bubbles:true});c.dispatchEvent(ev(180,120,'pointerdown'));const e=ev(540,120,'pointermove');Object.defineProperty(e,'getCoalescedEvents',{value:()=>[]});c.dispatchEvent(e);c.dispatchEvent(ev(540,120,'pointerup'));return c.getContext('2d').getImageData(360,120,1,1).data[0]});assert.ok(single<255,'empty coalesced list falls back to regular move');await page.locator('#drawingUndo').click();assert.deepEqual(await drawSnapshot(),blankDrawing);

 const detail=page.locator('#drawingDetail'),pan=page.locator('#drawingPan');
 if(await detail.getAttribute('aria-pressed')==='false')await detail.click();
 await pan.click();assert.equal(await pan.getAttribute('aria-pressed'),'true');
 const view=await page.locator('#studioViewport').boundingBox();
 await page.mouse.move(view.x+Math.min(180,view.width-20),view.y+Math.min(180,view.height-20));await page.mouse.down();await page.mouse.move(view.x+30,view.y+30,{steps:5});await page.mouse.up();
 assert.deepEqual(await drawSnapshot(),blankDrawing,'moving paper must not draw on it');
 assert.ok(await page.locator('#studioViewport').evaluate(e=>e.scrollLeft>0||e.scrollTop>0),'paper can be moved when zoomed');
 await pan.click();await detail.click();assert.equal(await detail.getAttribute('aria-pressed'),'false');
 assert.deepEqual(await drawSnapshot(),blankDrawing,'fit view preserves original paper');
 await page.locator('[data-tool="brush"]').click();await drawingView.click({position:{x:70,y:70}});
 const expandedDrawing=await drawSnapshot();assert.notEqual(expandedDrawing.pixels,blankDrawing.pixels);assert.ok(await page.locator('#drawingFullSave').isEnabled());
 const drawViewport=page.viewportSize();await page.setViewportSize({width:drawViewport.height,height:drawViewport.width});
 assert.deepEqual(await drawSnapshot(),expandedDrawing,'rotation preserves original pixels');
 await page.setViewportSize(drawViewport);
 await expand.click();assert.equal(await expand.getAttribute('aria-pressed'),'false');assert.deepEqual(await drawSnapshot(),expandedDrawing);
 assert.equal(await page.locator('#drawingSave').isVisible(),true);
 await page.locator('#drawingUndo').click();assert.deepEqual(await drawSnapshot(),blankDrawing,'undo remains intact across resize');
 await page.locator('#drawingRedo').click();assert.deepEqual(await drawSnapshot(),expandedDrawing);
 await page.locator('#drawingUndo').click();await expand.click();await page.keyboard.press('Escape');
 assert.equal(await expand.getAttribute('aria-pressed'),'false','Escape shrinks rather than closes drawing');
 assert.ok(await drawingView.isVisible());
 console.log('PASS full-screen drawing resize, pixels, rotation and undo');

 assert.equal(await page.locator('#lessonSubject option').count(),9);assert.equal(await page.locator('#lessonPicture svg').count(),0,'no lesson SVG in free drawing');
 assert.equal(await page.locator('#premiumColoring img').getAttribute('src'),null,'premium art must not be requested when drawing opens');
 // P0/P1: all three real workshop modes, final lesson step and history.
 await page.locator('[data-art-mode="color"]').click();
 await page.locator('[data-art-mode="color"]').click();
 assert.equal(await page.locator('#storyColoringGallery .story-coloring-choice:visible').count(),8);
 // Verify the actual renderer in both browser engines and the flood-fill barriers.
 const originals=await page.evaluate(()=>{
  const scenes=[['hedgehog-garden',612,81],['fox-owl-stream',365,62],['bear-library',595,91],['kitten-balloon',360,135],['undersea-palace',86,78],['winter-village',611,65],['forest-picnic',613,74],['dragon-clouds',615,202],['rabbit-workshop',100,90],['squirrel-autumn',606,74],['owl-observatory',607,76],['forest-train',616,68]];
  const output=[];
  for(const [key,x,y] of scenes){const c=document.createElement('canvas');c.width=720;c.height=480;const cx=c.getContext('2d');if(!originalColoring(cx,key))throw Error(key);const before=c.toDataURL();const img=cx.getImageData(0,0,720,480),pixel=(px,py)=>Array.from(img.data.slice((py*720+px)*4,(py*720+px)*4+4));const outside=pixel(12,12),color=[217,33,91,255];if(!artFill(img.data,720,480,x,y,color))throw Error('fill '+key);if(pixel(x,y).join()!==color.join()||pixel(12,12).join()!==outside.join())throw Error('leaking fill '+key);output.push(before)}
  // Five independent regions in one scene; preserve every earlier fill and the exterior.
  const c=document.createElement('canvas');c.width=720;c.height=480;const cx=c.getContext('2d');originalColoring(cx,'undersea-palace');
  const img=cx.getImageData(0,0,720,480),read=(x,y)=>Array.from(img.data.slice((720*y+x)*4,(720*y+x)*4+4)).join();
  const outside=read(12,12),chosen=[[86,78],[112,40],[632,125],[671,80],[350,229]];
  const colors=chosen.map((_,i)=>[35+i*40,80,210-i*30,255]);
  for(let i=0;i<chosen.length;i++){const [x,y]=chosen[i];if(!artFill(img.data,720,480,x,y,colors[i]))throw Error('multi-region fill');for(let j=0;j<=i;j++)if(read(...chosen[j])!==colors[j].join())throw Error('previous fill changed');if(read(12,12)!==outside)throw Error('exterior changed')}
  return new Set(output).size;
 });
 assert.equal(originals,12,'independent original compositions');
 // Catalog paging, filtering and favorites persist without rendering the entire library.
 assert.ok((await page.locator('#coloringCount').textContent()).includes('из 42'));
 await page.locator('#coloringMore').click();assert.ok((await page.locator('#coloringCount').textContent()).includes('9–16'));
 assert.equal(await page.locator('#storyColoringGallery .story-coloring-choice').count(),8);
 await page.locator('#coloringPrev').click();
 await page.locator('#coloringCategory').selectOption('Космос');
 assert.ok((await page.locator('#coloringCount').textContent()).includes('из 4'));
 await page.locator('#coloringSearch').fill('ракета');assert.equal(await page.locator('#storyColoringGallery .story-coloring-choice').count(),1);
 await page.locator('.coloring-like').click();await page.locator('#coloringCategory').selectOption('liked');assert.equal(await page.locator('#storyColoringGallery .story-coloring-choice').count(),1);
 await page.locator('#coloringSearch').fill('');await page.locator('#coloringCategory').selectOption('all');
 const catalogRender=await page.evaluate(()=>{const seen=new Set();for(const key of ORIGINAL_COLORING_IDS){const c=document.createElement('canvas');c.width=720;c.height=480;const ctx=c.getContext('2d');if(!originalColoring(ctx,key))throw Error(key);seen.add(c.toDataURL());const image=ctx.getImageData(0,0,720,480);const data=image.data;let found=0;for(let y=20;y<460&&found<5;y+=16)for(let x=20;x<700&&found<5;x+=16){const p=(y*720+x)*4;if(data[p]!==255||data[p+1]!==253||data[p+2]!==247)continue;const color=[22+found*35,111,177,255];if(!artFill(data,720,480,x,y,color))continue;let n=0;for(let i=0;i<data.length;i+=4)if(data[i]===color[0]&&data[i+1]===111&&data[i+2]===177)n++;if(n>100)found++;else{for(let i=0;i<data.length;i+=4)if(data[i]===color[0]&&data[i+1]===111&&data[i+2]===177){data[i]=255;data[i+1]=253;data[i+2]=247}}}if(found<5)throw Error('insufficient color regions '+key+' '+found)}return seen.size});
 assert.equal(catalogRender,42,'all distinct rendered catalog scenes');
 const newColorings=await page.evaluate(()=>{const out=[];for(const [key,x,y] of [['moon-bat-garden',360,290],['nile-cat-voyage',422,282]]){const c=document.createElement('canvas');c.width=720;c.height=480;const ctx=c.getContext('2d');originalColoring(ctx,key);const img=ctx.getImageData(0,0,720,480),at=(x,y)=>Array.from(img.data.slice((y*720+x)*4,(y*720+x)*4+4)),outside=at(12,12),color=[45,137,190,255];if(!artFill(img.data,720,480,x,y,color)||at(x,y).join()!==color.join()||at(12,12).join()!==outside.join())throw Error('new scene fill '+key);out.push(key)}return out});assert.equal(newColorings.length,2);

 await page.locator('#storyColoringGallery .story-coloring-choice').first().click();
 assert.equal(await page.locator('[data-tool="fill"]').getAttribute('aria-pressed'),'true');
 const pixelState=()=>page.locator('#drawingCanvas').evaluate(c=>c.toDataURL());
 const template=await pixelState();
 await page.locator('#drawingColors button[data-color="#bd3948"]').click();
 await page.locator('#drawingCanvas').click({position:{x:12,y:12}});
 const colored=await pixelState();assert.notEqual(colored,template,'fill must change pixels');
 await page.locator('#drawingUndo').click();assert.equal(await pixelState(),template);
 await page.locator('#drawingRedo').click();assert.equal(await pixelState(),colored);
 await page.locator('[data-tool="pick"]').click();
 await page.locator('#drawingCanvas').click({position:{x:12,y:12}});
 assert.equal(await page.locator('#drawingCustom').inputValue(),'#bd3948');
 assert.equal(await pixelState(),colored,'pipette does not change pixels');
 // The protected sun contour must survive both fill taps and strokes across it.
 const inkAt=()=>page.locator('#drawingCanvas').evaluate(c=>Array.from(c.getContext('2d').getImageData(646,81,1,1).data));
 const canvasPoint=async(x,y)=>{const q=await page.locator('#drawingCanvas').boundingBox();return {x:q.x+x*q.width/720,y:q.y+y*q.height/480}};
 const ink=await inkAt();assert.ok(ink[0]<150,'expected original ink');
 await page.locator('[data-tool="fill"]').click();const inkPoint=await canvasPoint(646,81);await page.mouse.click(inkPoint.x,inkPoint.y);assert.equal(await pixelState(),colored,'fill on original ink ignored');
 await page.locator('[data-tool="brush"]').click();await page.locator('#drawingColors button[data-color="#bd3948"]').click();const l=await canvasPoint(630,81),r=await canvasPoint(662,81);await page.mouse.move(l.x,l.y);await page.mouse.down();await page.mouse.move(r.x,r.y,{steps:5});await page.mouse.up();assert.deepEqual(await inkAt(),ink,'brush preserves outline');await page.locator('#drawingUndo').click();assert.equal(await pixelState(),colored);
 await page.locator('[data-tool="eraser"]').click();await page.mouse.click(inkPoint.x,inkPoint.y);assert.deepEqual(await inkAt(),ink,'eraser preserves outline');await page.locator('#drawingUndo').click();assert.equal(await pixelState(),colored);

 assert.ok(await page.locator('#recentDrawingColors button').count());
 const textures=await page.evaluate(()=>{const outputs=[];for(const effect of ['solid','soft','marker','crayon','water','grain-pencil','pastel']){const c=document.createElement('canvas');c.width=100;c.height=50;const cx=c.getContext('2d');studioStroke(cx,{x:15,y:25},{x:85,y:25},12,effect,'#bd3948');outputs.push(c.toDataURL())}return new Set(outputs).size});
 assert.equal(textures,7,'distinct brush strokes');

 await page.locator('[data-art-mode="lesson"]').click();assert.equal(await page.locator('#storyColoringGallery canvas').count(),0,'hidden coloring thumbnails released');
 assert.ok(await page.locator('#studioLessonPane').isVisible());
 await page.waitForFunction(()=>{const a=document.getElementById('studioSheet').getBoundingClientRect(),b=document.getElementById('studioExtras').getBoundingClientRect(),c=document.getElementById('drawingCanvas').getBoundingClientRect();return a.width>200&&a.height>130&&c.width>200&&c.height>130&&(a.right<=b.left+1||b.bottom<=a.top+1)});
 for(const subject of ['rabbit','cat','flower','house','fox','butterfly','owl','boat','landscape']){
  await page.locator('#lessonSubject').selectOption(subject);
  for(let step=0;step<6;step++){assert.equal(await page.locator('#lessonPicture [data-lesson-stage]').count(),step+1);assert.ok((await page.locator('#lessonInstruction').textContent()).includes('Шаг '+(step+1)+' из 6'));if(step<5)await page.locator('#lessonNext').click();}
  assert.equal(await page.locator('#lessonNext').isEnabled(),false);
  await page.locator('#lessonPrev').click();assert.ok(await page.locator('#lessonNext').isEnabled());
  assert.equal(await pixelState(),colored,'lesson must not alter the child canvas');
 }

 assert.equal(await pixelState(),colored,'lesson navigation must not modify child drawing');
 await page.locator('[data-art-mode="free"]').click();
 assert.equal(await page.locator('[data-tool="brush"]').getAttribute('aria-pressed'),'true');
 assert.equal(await pixelState(),colored,'switching modes must keep image');assert.equal(await page.locator('#lessonPicture svg').count(),0,'closed lesson SVG removed');await page.locator('[data-art-mode="lesson"]').click();assert.equal(await page.locator('#lessonPicture [data-lesson-stage]').count(),5,'reopened lesson resumes current step');assert.equal(await pixelState(),colored,'reopened lesson preserves canvas');await page.locator('[data-art-mode="free"]').click();
 assert.equal(await page.locator('#drawingColors button:visible').count(),16);
 assert.equal(await page.locator('#studioEffects').isVisible(),false);
 await page.locator('#paletteMore').click();assert.equal(await page.locator('#drawingColors button:visible').count(),72);await page.locator('#paletteMore').click();
 await page.locator('#studioMore summary').click();assert.ok(await page.locator('#studioEffects').isVisible());await page.locator('#studioEffects').click();assert.ok(await page.locator('#studioExtraTitle').isVisible());assert.equal(await page.locator('#studioEffectPane canvas').count(),30);assert.ok(await page.locator('#studioEffectPane canvas').first().evaluate(c=>c.getContext('2d').getImageData(0,0,c.width,c.height).data.some((v,i)=>i%4===3&&v>0)));await page.locator('#studioExtraClose').click();assert.equal(await page.locator('#studioEffectPane canvas').count(),0,'release preview backing stores');await page.locator('#studioMore summary').click();await page.locator('#studioEffects').click();assert.equal(await page.locator('#studioEffectPane canvas').count(),30,'reopen previews');await page.locator('#studioExtraClose').click();
 const sheet=await page.locator('#drawingCanvas').boundingBox();assert.ok(sheet.width>220&&sheet.height>140,'canvas size');
 await page.mouse.move(sheet.x+sheet.width/3,sheet.y+sheet.height/3);await page.mouse.down();await page.mouse.move(sheet.x+sheet.width/2,sheet.y+sheet.height/2,{steps:5});await page.mouse.up();
 assert.ok(await page.locator('#drawingSave').isEnabled());
 // Interrupt active strokes before pointerup, as when a tablet backgrounds the page.
 await page.locator('[data-tool="brush"]').click();
 const lifecycle=await page.evaluate(()=>{const c=$('drawingCanvas'),r=c.getBoundingClientRect(),f=$('standaloneDrawing')||$('storyForm'),key=DRAWING_DRAFT,changes=[];const stroke=(id,x,color)=>{$('drawingCustom').value=color;$('drawingCustom').dispatchEvent(new Event('input',{bubbles:true}));c.dispatchEvent(new PointerEvent('pointerdown',{pointerId:id,pointerType:'touch',clientX:r.x+r.width*x,clientY:r.y+r.height*.12,bubbles:true}));c.dispatchEvent(new PointerEvent('pointermove',{pointerId:id,pointerType:'touch',clientX:r.x+r.width*x,clientY:r.y+r.height*.23,bubbles:true}))};for(const [id,x,color,kind] of [[71,.12,'#01eafb','hidden'],[72,.88,'#f900e8','pagehide']]){const before=localStorage.getItem(key);stroke(id,x,color);const pending=f.dataset.drawingDirty==='yes'&&before===localStorage.getItem(key);if(kind==='hidden'){const original=Object.getOwnPropertyDescriptor(document,'hidden');try{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))}finally{if(original)Object.defineProperty(document,'hidden',original);else delete document.hidden}}else window.dispatchEvent(new Event('pagehide'));const saved=localStorage.getItem(key);c.dispatchEvent(new PointerEvent('pointerup',{pointerId:id,bubbles:true}));changes.push({pending,updated:saved!==before,clean:f.dataset.drawingDirty==='no',stable:saved===localStorage.getItem(key)})}return changes});assert.deepEqual(lifecycle,[{pending:true,updated:true,clean:true,stable:true},{pending:true,updated:true,clean:true,stable:true}]);
 const draft=await page.evaluate(()=>localStorage.getItem('skazki-unfinished-drawing-v1'));assert.ok(draft?.startsWith('data:image/jpeg;base64,'));
 await page.evaluate(()=>{window.__encodeCalls=0;const original=HTMLCanvasElement.prototype.toDataURL;HTMLCanvasElement.prototype.toDataURL=function(...args){window.__encodeCalls++;return original.apply(this,args)}});
 await page.locator('#drawingCancel').click();assert.equal(await page.evaluate(()=>window.__encodeCalls),0,'closing an already saved drawing must not encode again');
 assert.equal(await page.evaluate(()=>localStorage.getItem('skazki-unfinished-drawing-v1')),draft);
 await page.reload();await page.evaluate(()=>artRoom());
 await page.waitForFunction(()=>document.getElementById('drawingStatus')?.textContent.includes('Продолжай свой сохранённый рисунок'));
 assert.equal(await page.evaluate(()=>localStorage.getItem('skazki-unfinished-drawing-v1')),draft);
 assert.deepEqual(await inkAt(),ink,'original contour restored after reload');
 await page.locator('#drawingExpand').click();await page.locator('#drawingFullSave').click();
 await page.locator('#galleryGrid [data-view]').first().click();assert.ok(await page.locator('.gallery-large').isVisible());
 await page.locator('#galleryReturn').click();assert.ok(await page.locator('#galleryGrid').isVisible());
 assert.ok(await page.evaluate(()=>JSON.parse(localStorage.getItem('skazki-art-gallery-v1')||'[]').length>0),'drawing stored');
 const savedGallery=await page.evaluate(()=>localStorage.getItem(ART_GALLERY));
 const expanded=await page.evaluate(()=>{const old=galleryItems();const image=old[0].src;let ok=0;for(let i=old.length;i<10;i++)if(gallerySave(image))ok++;return {count:galleryItems().length,first:galleryItems()[0].id,oldFirst:old[0].id,ok}});
 assert.equal(expanded.count,10);assert.equal(expanded.first,expanded.oldFirst);
 await page.reload();await page.evaluate(()=>artGallery());assert.equal(await page.locator('#galleryGrid [data-view]').count(),10);
 await page.evaluate(raw=>localStorage.setItem(ART_GALLERY,raw),savedGallery);

 await page.keyboard.press('Escape');
 const beforeRescue=await page.evaluate(()=>JSON.parse(localStorage.getItem(KEY)));
 await page.evaluate(()=>backup());await page.locator('#importFile').setInputFiles({name:'draft.json',mimeType:'application/json',buffer:Buffer.from(rescueRaw)});await page.locator('#cancelRestore').click();assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem(KEY))),beforeRescue);
 await page.locator('#importFile').setInputFiles({name:'draft.json',mimeType:'application/json',buffer:Buffer.from(rescueRaw)});await page.evaluate(()=>{window.__qaRescueSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===KEY)throw Error('quota');return window.__qaRescueSet.call(this,k,v)}});await page.locator('#confirmDraftRescue').click();assert.ok(await page.locator('#confirmDraftRescue').isVisible());assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem(KEY))),beforeRescue);await page.evaluate(()=>{Storage.prototype.setItem=window.__qaRescueSet});await page.locator('#confirmDraftRescue').click();await page.locator('#storyBody').waitFor({state:'visible'});assert.equal(await page.locator('#storyBody').inputValue(),rescueData.draft.body);
 const restoredRescue=await page.evaluate(()=>JSON.parse(localStorage.getItem(KEY)));assert.deepEqual(restoredRescue.stories,beforeRescue.stories);assert.deepEqual(restoredRescue.familyPublished,beforeRescue.familyPublished);for(const [k,v] of Object.entries(beforeRescue.drafts))assert.deepEqual(restoredRescue.drafts[k],v);assert.deepEqual(restoredRescue.draft.rich,rescueData.draft.rich);await page.locator('#saveStoryNow').click();
 const archiveFixture=await page.evaluate(()=>{
 const book={id:'archive-test-book',title:'Тестовая книга',body:'Сохранённый текст.',theme:'Винни-Пух',author:OWN,icon:'📖'};
 if(!commitLibrary({...data,stories:[...data.stories,book]}))throw Error('fixture save');
 localStorage.setItem('skazki-reading-size-v1','28');
 localStorage.removeItem('skazki-art-gallery-v1');
 const replacement={...fresh(),localExtras:{version:1,values:{'skazki-reading-size-v1':'32','skazki-art-gallery-v1':'[]'}}};
 return JSON.stringify(replacement);
 });
 await page.evaluate(()=>backup());
 await page.locator('#importFile').setInputFiles({name:'fixture.json',mimeType:'application/json',buffer:Buffer.from(archiveFixture)});
 await page.locator('#confirmRestore').click();
 await page.waitForFunction(()=>!document.getElementById('modal').hasAttribute('open'));
 assert.equal(await page.evaluate(()=>data.stories.some(b=>b.id==='archive-test-book')),false);
 assert.equal(await page.evaluate(()=>localStorage.getItem('skazki-reading-size-v1')),'32');
 const checkpoint=await page.evaluate(async()=>await readArchive('beforeRestore'));
 assert.ok(checkpoint&&checkpoint.entries.length===15);
 await page.evaluate(()=>backup());
 await page.locator('.archive-recovery summary').click();
 page.once('dialog',dialog=>dialog.accept());
 await page.locator('#undoRestore').click();
 await page.waitForFunction(()=>!document.getElementById('modal').hasAttribute('open'));
 assert.equal(await page.evaluate(()=>data.stories.find(b=>b.id==='archive-test-book')?.body),'Сохранённый текст.');
 assert.equal(await page.evaluate(()=>localStorage.getItem('skazki-reading-size-v1')),'28');
 assert.equal(await page.evaluate(()=>localStorage.getItem('skazki-art-gallery-v1')),null);
 const loadedAssets=await page.evaluate(async()=>{const sources=[...Object.values(SKAZKI_CLASSIC_ART),...Object.values(SKAZKI_ART_155),...Object.values(SKAZKI_ANDERSEN_ART)].map(x=>x.src).concat(Object.values(premiumArt));await Promise.all(sources.map(async src=>{if(!src.startsWith('./assets/books/'))throw Error('not external: '+src);const img=new Image();img.src=src;await img.decode();if(img.naturalWidth<180||img.naturalHeight<180)throw Error('invalid artwork '+src)}));return new Set(sources).size});assert.equal(loadedAssets,14,'all externalized artwork must decode');
 await page.evaluate(()=>{const v=studyState('logic-patterns');v.n=1;v.level=2;studySave('logic-patterns',v);studyOpen('logic','patterns')});assert.ok(await page.locator('#studyNumberForm').isVisible(),'numeric pattern must be constructed');assert.equal(await page.locator('#studyChoices button').count(),0);const answer=await page.evaluate(()=>academyLogicQuestion('patterns',1,2).answer);await page.locator('#studyNumber').fill(answer);await page.locator('#studyCheck').click();assert.ok(await page.locator('#studyNext').isVisible());await page.keyboard.press('Escape');
 await page.evaluate(()=>{const v=studyState('logic-groups');v.n=1;v.level=3;studySave('logic-groups',v);studyOpen('logic','groups')});assert.equal(await page.locator('.group-figure:visible').count(),8);assert.ok(await page.locator('#studyNumberForm').isVisible());assert.equal(await page.locator('#studyChoices button').count(),0);assert.ok(await page.evaluate(()=>[...document.querySelectorAll('.group-figure')].every(el=>el.getBoundingClientRect().right<=innerWidth+1&&el.getBoundingClientRect().left>=0)));const groupAnswer=await page.evaluate(()=>academyLogicQuestion('groups',1,3).answer);await page.locator('#studyNumber').fill(groupAnswer);await page.locator('#studyCheck').click();assert.ok(await page.locator('#studyNext').isVisible());await page.keyboard.press('Escape');
 await page.evaluate(()=>{document.body.classList.add('family-view');$('familyViewer').hidden=false;window.__familyQA={books:[{id:'a',title:'Лесная сказка',theme:'Лес',body:'Жил ёжик.',icon:'📖'},{id:'b',title:'Морская сказка',theme:'Море',body:'Жила рыбка.',icon:'📖'},{id:'c',title:'Вторая лесная сказка',theme:'Лес',body:'Жила лиса.',icon:'📖'}],received:true};fdraw(window.__familyQA)});
 assert.equal(await page.locator('#familyThemeButtons button').count(),3);assert.equal(await page.locator('.family-book').count(),3);
 await page.getByRole('button',{name:'Лес (2)',exact:true}).click();assert.equal(await page.locator('.family-book').count(),2);assert.equal(await page.getByRole('button',{name:'Лес (2)',exact:true}).getAttribute('aria-pressed'),'true');
 await page.locator('.family-book').first().click();assert.equal(await page.locator('#familyReading .family-theme-label').textContent(),'Тема: Лес');assert.equal(await page.locator('#familyReading .family-theme-label').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(240, 233, 250)');await page.locator('#familyBack').click();
 await page.evaluate(()=>{window.__familyQA.room='qa-room';window.__familyQA.books[0].body=Array.from({length:90},(_,i)=>'Глава '+(i+1)+'. Ёжик и лиса отправились в необычное путешествие. ').join('\n');fdraw(window.__familyQA)});
 await page.locator('.family-book').first().click();await page.locator('#familyReadPages').click();assert.ok(await page.locator('#modal.reading-focus').isVisible());assert.ok((await page.locator('#modalTitle').textContent()).includes('Лес'));await page.waitForFunction(()=>Number($('ownReadNumber').textContent.split('/')[1])>1);const jump=page.locator('#ownReadJump'),total=await jump.locator('option').count();assert.ok(total>1);assert.ok((await jump.boundingBox()).height>=44);await jump.selectOption(String(total-1));assert.equal(await page.locator('#ownReadNumber').textContent(),total+' / '+total);await jump.selectOption('0');assert.equal(await page.locator('#ownReadNumber').textContent(),'1 / '+total);assert.ok(await page.locator('#ownReadPrev').isDisabled());
 await page.locator('#ownReadNext').click();const place=await page.locator('#ownReadNumber').textContent(),pageText=await page.locator('#ownReadText').textContent();assert.ok(place.startsWith('2 /'));assert.equal(await page.locator('#ownReadJump').inputValue(),'1');assert.ok(await page.locator('#ownReadText').evaluate(e=>e.scrollHeight<=e.clientHeight+1));
 await page.evaluate(()=>{window.__familyQA.books[1].title='Обновлённая морская сказка';fdraw(window.__familyQA)});assert.equal(await page.locator('#ownReadNumber').textContent(),place);assert.equal(await page.locator('#ownReadText').textContent(),pageText);
 await page.locator('#ownReadBack').click();await page.locator('#familyReadPages').click();assert.equal(await page.locator('#ownReadNumber').textContent(),place);const cachedPosition=await page.evaluate(()=>readingOffsets()[familyReadingKey('qa-room','a')]);assert.ok(cachedPosition.offset>0||cachedPosition.scene>0);const familyBefore=await page.evaluate(()=>JSON.stringify(window.__familyQA.books));await page.locator('#ownReadLarge').click();const familySize=await page.locator('#ownReadText').evaluate(x=>getComputedStyle(x).fontSize);const resizedPosition=await page.evaluate(()=>readingOffsets()[familyReadingKey('qa-room','a')]);assert.equal(resizedPosition.offset,cachedPosition.offset);assert.equal(resizedPosition.scene,cachedPosition.scene);assert.equal(resizedPosition.size,parseFloat(familySize));await page.locator('#ownReadBack').click();await page.locator('#familyReadPages').click();assert.equal(await page.locator('#ownReadText').evaluate(x=>getComputedStyle(x).fontSize),familySize);assert.deepEqual(await page.evaluate(()=>readingOffsets()[familyReadingKey('qa-room','a')]),resizedPosition);assert.ok(await page.locator('#ownReadText').evaluate(x=>x.scrollHeight<=x.clientHeight+1));assert.equal(await page.evaluate(()=>JSON.stringify(window.__familyQA.books)),familyBefore);await page.evaluate(()=>{const s=window.__familyQA,b=s.books.shift();fdraw(s);s.books.unshift(b);fdraw(s)});assert.equal(await page.locator('#modal').isVisible(),false,'withdrawal closes full-screen reading');await page.locator('.family-book').first().click();await page.locator('#familyBack').click();
 await page.evaluate(()=>{window.__familyQA.books.push({id:'d',title:'Третья лесная сказка',theme:'Лес',body:'Новый текст.',icon:'📖'});fdraw(window.__familyQA)});assert.equal(await page.locator('.family-book').count(),3);assert.ok(await page.getByRole('button',{name:'Лес (3)',exact:true}).isVisible());
 await page.getByRole('button',{name:'Все сказки (4)',exact:true}).click();assert.equal(await page.locator('.family-book').count(),4);
 const palette=await page.evaluate(()=>{const el=document.querySelector('#familyRefresh'),style=getComputedStyle(el);return {ink:getComputedStyle(document.documentElement).getPropertyValue('--ink').trim(),accent:style.backgroundColor,text:style.color,bg:getComputedStyle(document.body).backgroundColor}});assert.deepEqual(palette,{ink:'#173c3e',accent:'rgb(15, 118, 110)',text:'rgb(255, 255, 255)',bg:'rgb(244, 251, 250)'},'white and turquoise family UI');
 const releaseCases=await page.evaluate(async()=>{
  const paths=[],mock=(version,actual)=>async url=>{const name=new URL(url).pathname.split('/').pop();paths.push(name);return name==='release.json'?{ok:version!==null,json:async()=>({version})}:{ok:true,text:async()=>'<footer>Книга сказок · версия '+actual+'</footer>'}};
  const current=await fetchReleaseVersion(APP_RELEASE,mock(APP_RELEASE,APP_RELEASE)),unchanged=paths.splice(0);
  const staged=await fetchReleaseVersion(APP_RELEASE,mock('9.9.9',APP_RELEASE)),unready=paths.splice(0);
  const newer=await fetchReleaseVersion(APP_RELEASE,mock('9.9.9','9.9.9')),ready=paths.splice(0);
  const fallback=await fetchReleaseVersion(APP_RELEASE,mock(null,APP_RELEASE)),legacy=paths.splice(0);
  return {current,unchanged,staged,unready,newer,ready,fallback,legacy,app:APP_RELEASE}
 });
 assert.equal(releaseCases.current,releaseCases.app);assert.deepEqual(releaseCases.unchanged,['release.json']);assert.equal(releaseCases.staged,releaseCases.app);assert.deepEqual(releaseCases.unready,['release.json','index.html']);assert.equal(releaseCases.newer,'9.9.9');assert.deepEqual(releaseCases.ready,['release.json','index.html']);assert.deepEqual(releaseCases.legacy,['release.json','index.html']);
 const synced=await page.evaluate(async()=>{
  const credentials=await fcredentials('a'.repeat(64)),s={...credentials,ghRevision:1,ghAPICheck:0};
  const old=[{id:'old',title:'Старая сказка',theme:'Лес',body:'Лес',icon:'📖'}],updated=[...old,{id:'new',title:'Новая сказка',theme:'Море',body:'Море',icon:'📖'}];
  async function envelope(revision,books){const p=await fseal(s.key,{type:'github-archive',revision,books});return JSON.stringify({version:1,revision,iv:p.iv,cipher:cloudEncode(p.cipher)})}
  const raw=await envelope(1,old),fresh=await envelope(2,updated),encoded=cloudEncode(new TextEncoder().encode(fresh)),original=window.fetch;
  let requests=[];const fixtureFetch=async(input,options)=>{const url=String(input);if(url.startsWith('https://raw.githubusercontent.com/'+GH_REPO+'/')){requests.push('cdn');return {ok:true,status:200,text:async()=>raw}}if(url.startsWith(GH_API+'/contents/')){requests.push('api');return {ok:true,status:200,json:async()=>({type:'file',encoding:'base64',content:encoded})}}return original(input,options)};
  const received=await ghReadPublic(s,true,fixtureFetch);return {revision:received.revision,theme:received.books[1]?.theme,requests}
 });assert.deepEqual(synced,{revision:2,theme:'Море',requests:['cdn','api']},'encrypted archive refresh defeats stale CDN response');
 const absence=await page.evaluate(async()=>{
  const s={room:'skazki-'+'b'.repeat(64),ghAPICheck:0},requests=[];let apiStatus=503,rawStatus=404;
  const fixture=async url=>{const raw=url.startsWith('https://raw.githubusercontent.com/');requests.push(raw?'raw':'api');const status=raw?rawStatus:apiStatus;return {status,ok:false}};
  const outcome=async()=>{try{return await ghReadPublic(s,true,fixture)===null?'missing':'read'}catch{return 'unavailable'}};
  const first=await outcome(),limited=await outcome();s.ghAPICheck=0;apiStatus=404;
  const confirmed=await outcome(),cached=await outcome();s.ghAPICheck=0;apiStatus=403;
  const failed=await outcome(),afterFail=await outcome();
  return {first,limited,confirmed,cached,failed,afterFail,requests}
 });assert.deepEqual(absence,{first:'unavailable',limited:'unavailable',confirmed:'missing',cached:'missing',failed:'unavailable',afterFail:'unavailable',requests:['raw','api','raw','raw','api','raw','raw','api','raw']},'only independently confirmed absence is reported; failures invalidate cached absence');
 const failedShelf=await page.evaluate(async()=>{
  const run=async books=>{
   const shelf={textContent:books.length?'Сохранённая сказка':'В архиве пока нет опубликованных сказок.'},refresh={disabled:false},statuses=[];
   const s={books,received:true,ghRevision:2,room:'synthetic'};
   const source=ghViewerUnavailable.toString()+';'+ghViewerTick.toString()+';return ghViewerTick';
   const tick=new Function('fam','$','readerRecovery','fstatus','ghReadPublic','ghReadMessage','fetch',source)(s,id=>id==='familyShelf'?shelf:refresh,k=>statuses.push(k),v=>statuses.push(v),async()=>{throw Error('offline')},()=> 'Библиотека временно недоступна.',()=>{});
   await tick(s,true);return {shelf:shelf.textContent,status:statuses.at(-1),count:s.books.length,busy:s.ghBusy,disabled:refresh.disabled};
  };return [await run([]),await run([{id:'synthetic'}])];
 });assert.deepEqual(failedShelf,[{shelf:'Свежий список сказок пока не получен.',status:'Библиотека временно недоступна.',count:0,busy:false,disabled:false},{shelf:'Сохранённая сказка',status:'Свежая версия недоступна. Показаны ранее полученные сказки.',count:1,busy:false,disabled:false}],'failed refresh is explicit on both empty and populated shelves');
 const rollback=await page.evaluate(()=>{const cache='qa-family-revision-cache',secret='b'.repeat(64),books=[{id:'latest',title:'Свежая сказка',theme:'Лес',body:'Текст.',icon:'📖'}];const previousReader=fget(FAMILY_READER),previousConfirmed=fget(FAMILY_CONFIRMED);try{fdel(cache);fdel(cache+'-revision');const s={cache,secret,books:[],received:false};ghPublicCache(s,{revision:3,books});const conflict=ghPublicCache(s,{revision:3,books:[]});if(conflict||s.books.length!==1||JSON.parse(fget(cache)).length!==1)throw Error('same revision conflict overwrote verified books');const reopened={cache,secret,books:JSON.parse(fget(cache)),ghRevision:ghCachedRevision({cache})};const stale=ghPublicCache(reopened,{revision:2,books:[]});const staleStatus=document.getElementById('familyViewStatus').textContent;const retry=ghPublicCache(reopened,{revision:3,books});return {revision:reopened.ghRevision,stale,count:JSON.parse(fget(cache)).length,status:staleStatus,retry,recovered:document.getElementById('familyViewStatus').textContent}}finally{fdel(cache);fdel(cache+'-revision');previousReader===null?fdel(FAMILY_READER):fput(FAMILY_READER,previousReader);previousConfirmed===null?fdel(FAMILY_CONFIRMED):fput(FAMILY_CONFIRMED,previousConfirmed)}});assert.equal(rollback.revision,3);assert.equal(rollback.stale,false);assert.equal(rollback.count,1);assert.ok(rollback.status.includes('не подтвердил свежую'));assert.equal(rollback.retry,true);assert.ok(rollback.recovered.includes('проверено и сохранено'));
 assert.deepEqual(errors,[]);await ctx.close();console.log('PASS',viewport);
 }
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
