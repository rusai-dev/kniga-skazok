'use strict';

// Exact deployed 1.5.207 source -> checked-out 1.5.208, same isolated origin.
// No production access, no real child data, no synthetic version renaming.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const {chromium, webkit} = require('playwright');
const {shellDefinition} = require('../tools/shell-integrity.cjs');
const root = path.resolve(__dirname, '..');
const oldSha = '6fe6bcc0ad285176c93ab045e94328cf1de9bed5';
const oldVersion = '1.5.207', newVersion = '1.5.208';
const key = 'skazki-library-v1';
const extras = ['skazki-unfinished-drawing-v1','skazki-study-skills-v2','skazki-reading-progress-v1'];
const mime = {'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const oldFiles = new Map();
function oldRead(name) {
  if (!oldFiles.has(name)) oldFiles.set(name, execFileSync('git',['-c','safe.directory='+root,'show',oldSha+':'+name],{cwd:root,maxBuffer:32*1024*1024,stdio:['ignore','pipe','pipe']}));
  return oldFiles.get(name);
}
function newRead(name) { return fs.readFileSync(path.join(root,name)); }
const release = JSON.parse(newRead('release.json')).version;
if (release !== newVersion) {
  console.log('SKIP exact 207->208 fixture: checkout is '+release);
  process.exit(0);
}
assert.equal(JSON.parse(oldRead('release.json')).version,oldVersion);
assert.ok(oldRead('index.html').toString().includes('<footer>Книга сказок · версия '+oldVersion+'</footer>'));
const {fingerprint} = shellDefinition(newRead('sw.js').toString());
const {createHash}=require('node:crypto');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const expectedWorkerHash=hash(newRead('sw.js'));
const requests=[];
let phase='startup', diagnosticPage;
function mark(value){phase=value;console.log('[upgrade phase]',value);}
function bounded(label,task,ms=30000){
  let timer;
  return Promise.race([Promise.resolve().then(task),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Deadline '+ms+'ms: '+label)),ms);})]).finally(()=>clearTimeout(timer));
}
// Hard watchdog also catches unresponsive Playwright protocol or cleanup.
const watchdog=setTimeout(()=>{console.error('UPGRADE WATCHDOG',JSON.stringify({phase,requests}));process.exit(1);},210000);
let serving = oldVersion;
const server = http.createServer((req,res) => {
  const pathname = new URL(req.url,'http://127.0.0.1').pathname;
  if (pathname === '/control.html') {res.setHeader('Content-Type','text/html');return res.end('<!doctype html><title>QA control</title>');}
  if (!pathname.startsWith('/book/')) {res.statusCode=404;return res.end();}
  const name = pathname.slice('/book/'.length)||'index.html';
  if (!/^[A-Za-z0-9_./-]+$/.test(name)||name.split('/').some(part=>part==='..'||part==='.')) {res.statusCode=404;return res.end();}
  try {
    const bytes=(serving===oldVersion?oldRead:newRead)(name);
    if(requests.length<250||name==='sw.js')requests.push({name,version:serving,bytes:bytes.length,...(name==='sw.js'?{sha256:hash(bytes)}:{})});
    res.setHeader('Content-Type',mime[path.extname(name)]||'application/octet-stream');
    res.setHeader('Cache-Control','no-store');
    res.end(bytes);
  } catch(error) {if(requests.length<250)requests.push({name,version:serving,error:String(error.message).slice(0,200)});res.statusCode=404;res.end();}
});
const title='QA exact legacy upgrade';
const text='Сова нашла фонарь.\n\nЭто синтетический черновик, не работа ребёнка.';
const snapshot = page => page.evaluate(({key,extras})=>({library:localStorage.getItem(key),extras:extras.map(k=>localStorage.getItem(k))}),{key,extras});
const draft = state => Object.values(JSON.parse(state.library).drafts).find(d=>d.title===title);
const contents = d => ({title:d.title,body:d.body,images:d.rich.images,originals:d.studio.originals,sheets:d.studio.sheets});
async function main() {
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin='http://127.0.0.1:'+server.address().port, url=origin+'/book/?view=personal';
  let browser,context;
  try {
    mark('launch browser');
    browser=await bounded('launch browser',()=> (process.env.BROWSER==='webkit'?webkit:chromium).launch({headless:true,timeout:20000}),25000);
    context=await bounded('new browser context',()=>browser.newContext({serviceWorkers:'allow',viewport:{width:1024,height:768}}));
    context.setDefaultTimeout(15000);context.setDefaultNavigationTimeout(20000);
    mark('open old shell');
    const control=await bounded('control page',()=>context.newPage());await control.goto(origin+'/control.html');
    const page=await bounded('old page',()=>context.newPage());diagnosticPage=page;
    page.on('pageerror',error=>console.log('[page error]',String(error.message).slice(0,350)));
    await page.goto(url);
    mark('register exact old worker');
    // Do not await navigator.serviceWorker.ready: it never rejects if install fails.
    // The next bounded predicate proves that the old worker really activated.
    await bounded('old service worker register',()=>page.evaluate(async()=>{await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});}),25000);
    // Explicit polling: an async waitForFunction predicate can return a truthy
    // Promise before the underlying boolean becomes true. Never start upgrade
    // before the exact old worker controls the page and its offline shell exists.
    const oldCache='skazki-shell-'+oldVersion;
    const inspectOld=()=>page.evaluate(async ({name,expected})=>{
      const reg=await navigator.serviceWorker.getRegistration();
      const keys=await caches.keys();
      const cache=keys.includes(name)?await caches.open(name):null;
      const cached=cache?await cache.match(new URL('index.html',location.href).href):null;
      const html=cached?await cached.text():'';
      return {controller:navigator.serviceWorker.controller?.state||null,active:reg?.active?.state||null,waiting:reg?.waiting?.state||null,installing:reg?.installing?.state||null,cacheKeys:keys,entries:cache?(await cache.keys()).length:0,exactHTML:html.includes('<footer>Книга сказок · версия '+expected+'</footer>')};
    },{name:oldCache,expected:oldVersion});
    const isOldReady=state=>state.controller==='activated'&&state.active==='activated'&&!state.waiting&&!state.installing&&state.exactHTML&&state.entries>=14;
    let oldState=await bounded('inspect old verified shell',inspectOld,10000);
    const deadlineOld=Date.now()+35000;
    while(!isOldReady(oldState)&&Date.now()<deadlineOld){
      await new Promise(resolve=>setTimeout(resolve,250));
      oldState=await bounded('inspect old verified shell',inspectOld,10000);
    }
    console.log('Exact old shell readiness',JSON.stringify(oldState));
    assert.ok(isOldReady(oldState),'old shell did not finish installation; do not attempt upgrade');
    assert.equal(await page.evaluate(()=>APP_RELEASE),oldVersion);
    mark('create old-version draft with original and unfinished drawing');
    await page.evaluate(keys=>{
      const canvas=document.createElement('canvas');canvas.width=48;canvas.height=48;
      const ctx=canvas.getContext('2d');ctx.fillStyle='#22aabb';ctx.fillRect(0,0,48,48);
      localStorage.setItem(keys[0],canvas.toDataURL('image/jpeg'));
      localStorage.setItem(keys[1],JSON.stringify({add:{done:5}}));
      localStorage.setItem(keys[2],JSON.stringify({'qa-book':2}));
    },extras);
    await page.locator('#homeNewStory').click();
    await page.locator('#storyTitle').fill(title);await page.locator('#storyBody').fill(text);
    await page.locator('#storyBody').evaluate(e=>e.setSelectionRange(15,15));
    const canvas=page.locator('#drawingCanvas');
    const ready=async p=>{await p.locator('#drawingCanvas').waitFor({state:'visible'});await p.waitForFunction(()=>!$('drawingStatus').textContent.startsWith('Открываем'));};
    await page.locator('#drawStory').click();await ready(page);
    await canvas.click({position:{x:30,y:30}});await page.locator('#drawingCancel').click();
    await page.locator('#writerGallery').click();
    await page.getByRole('button',{name:'Новый рисунок',exact:true}).click();await ready(page);
    await canvas.click({position:{x:90,y:90}});await page.locator('#drawingCancel').click();
    await page.locator('#writerGallery').click();
    await page.getByRole('button',{name:'Продолжить рисунок 2',exact:true}).click();await ready(page);
    await page.locator('#drawingSave').click();
    await page.locator('#saveStoryNow').click();
    await page.locator('#homeDrafts').click();
    await page.locator('[data-own-draft]').filter({hasText:title}).click();
    await page.locator('#drawStory').click();await ready(page);
    const before=draft(await snapshot(page));
    assert.ok(before.rich.images[0].startsWith('data:image/jpeg;base64,'));
    assert.ok(before.studio.originals[0].src.startsWith('data:image/png;base64,'));
    assert.equal(before.studio.sheets.length,1);
    const oldPixels=await canvas.evaluate(c=>c.toDataURL());
    assert.equal(oldPixels,before.studio.sheets[0].src);
    await page.evaluate(async()=>{
      const reg=await navigator.serviceWorker.getRegistration();
      if(reg?.active?.state!=='activated'||reg.installing||reg.waiting||navigator.serviceWorker.controller?.state!=='activated')throw Error('old worker not active before update');
      window.qaSwitches=0;window.qaWorkerEvents=[];window.qaOldWorker=reg.active;
      navigator.serviceWorker.addEventListener('controllerchange',()=>{window.qaSwitches++;window.qaWorkerEvents.push('controllerchange');});
      reg.addEventListener('updatefound',()=>{
        const worker=reg.installing;
        if(!worker)return;
        window.qaWorkerEvents.push('updatefound:'+worker.state);
        worker.addEventListener('statechange',()=>window.qaWorkerEvents.push('state:'+worker.state));
      });
    });
    serving=newVersion;
    mark('request exact new worker');
    // Do not block on update() itself; the cache seal, delivered SHA-256 and
    // installed waiting worker below are the actual acceptance criteria.
    await bounded('dispatch service worker update',()=>page.evaluate(async()=>{
      const reg=await navigator.serviceWorker.getRegistration();
      if(!reg)throw Error('old registration missing');
      window.qaUpdateError=null;
      reg.update().catch(error=>{window.qaUpdateError=String(error);});
    }));
    mark('verify new shell installation');
    const newCache='skazki-shell-'+newVersion+'-'+fingerprint;
    const readyKey=origin+'/book/__skazki_shell_verified__';
    // Check the actual named cache rather than the cross-cache match option.
    // A stale waiting reference is insufficient proof of a complete installation.
    const installationState=()=>page.evaluate(async ({name,key})=>{
      const reg=await navigator.serviceWorker.getRegistration();
      const keys=await caches.keys();
      const cache=keys.includes(name)?await caches.open(name):null;
      const marker=cache?await cache.match(key):null;
      return {active:reg?.active?.state,waiting:reg?.waiting?.state,installing:reg?.installing?.state,oldStillActive:!!window.qaOldWorker&&reg?.active===window.qaOldWorker,marker:marker?await marker.text():null,cacheKeys:keys,entries:cache?(await cache.keys()).map(r=>new URL(r.url).pathname):[],events:window.qaWorkerEvents,switches:window.qaSwitches,updateError:window.qaUpdateError};
    },{name:newCache,key:readyKey});
    const deadlineInstall=Date.now()+60000;
    let state=await bounded('inspect installed cache',installationState,10000);
    while(Date.now()<deadlineInstall&&(state.marker!==fingerprint||state.waiting!=='installed')){
      await new Promise(resolve=>setTimeout(resolve,500));
      state=await bounded('inspect installed cache',installationState,10000);
    }
    console.log('Exact upgrade install diagnostics',JSON.stringify({state,expectedWorkerHash,requests}));
    assert.ok(requests.some(r=>r.name==='sw.js'&&r.version===newVersion&&r.sha256===expectedWorkerHash),'browser must receive exact new worker bytes');
    assert.equal(state.marker,fingerprint,'new verified shell marker is missing');
    assert.equal(state.waiting,'installed','new worker must wait while editor is open');
    assert.equal(await page.evaluate(()=>window.qaSwitches),0);
    assert.equal(await page.evaluate(()=>APP_RELEASE),oldVersion);
    assert.equal(await canvas.evaluate(c=>c.toDataURL()),oldPixels);
    assert.deepEqual(contents(draft(await snapshot(page))),contents(before));
    // The verified shell is now installed; activation must preserve the editor.
    mark('close old editor and verify persisted bytes');
    await bounded('close old editor',()=>page.close(),20000);diagnosticPage=control;
    const persisted=await bounded('snapshot after closing',()=>snapshot(control));
    assert.deepEqual(contents(draft(persisted)),contents(before));
    assert.ok(await control.evaluate(name=>caches.has(name),newCache));
    mark('offline activation');
    await bounded('set offline',()=>context.setOffline(true));
    // Natural activation is asynchronous. Close each old-version probe so
    // it cannot keep the preceding worker alive. Never force skipWaiting,
    // clear caches, unregister, or bypass the worker.
    let updated, observed=[];
    const deadline=Date.now()+45000;
    while(Date.now()<deadline){
      const probe=await bounded('open offline probe',()=>context.newPage(),10000);
      let actual;
      try {
        await probe.goto(url,{timeout:8000});
        actual=await probe.evaluate(()=>({version:typeof APP_RELEASE==='undefined'?null:APP_RELEASE,controlled:!!navigator.serviceWorker.controller}));
        observed.push(actual);
        assert.deepEqual(await snapshot(probe),persisted,'saved bytes must survive every offline activation probe');
        if(actual.version===newVersion&&actual.controlled){updated=probe;diagnosticPage=probe;break;}
        assert.equal(actual.version,oldVersion,'unexpected offline shell');
      } catch(error) {
        await probe.close();
        throw error;
      }
      await probe.close();
      await new Promise(resolve=>setTimeout(resolve,350));
    }
    assert.ok(updated,'New verified shell did not activate offline: '+JSON.stringify(observed.slice(-8)));
    console.log('Exact upgrade offline activation probes:',JSON.stringify(observed));
    assert.equal(await updated.evaluate(()=>APP_RELEASE),newVersion);
    assert.equal(await updated.locator('footer').textContent(),'Книга сказок · версия '+newVersion);
    assert.deepEqual(await snapshot(updated),persisted,'opening the updated shell must not rewrite any saved data');
    mark('reopen and continue original draft');
    await updated.locator('#homeDrafts').click();
    await updated.locator('[data-own-draft]').filter({hasText:title}).click();
    assert.equal(await updated.locator('#storyBody').inputValue(),before.body);
    await updated.locator('#drawStory').click();await ready(updated);
    assert.equal(await updated.locator('#drawingCanvas').evaluate(c=>c.toDataURL()),oldPixels,'legacy unfinished PNG reopens exactly');
    await updated.locator('#drawingCanvas').click({position:{x:150,y:120}});
    await updated.locator('#drawingCancel').click();
    await updated.locator('#storyBody').fill(before.body+'\nПродолжение после обновления.');
    await updated.locator('#saveStoryNow').click();
    const after=await snapshot(updated), edited=draft(after);
    assert.ok(edited.body.endsWith('Продолжение после обновления.'));
    assert.notEqual(edited.studio.sheets[0].src,before.studio.sheets[0].src);
    assert.deepEqual(edited.rich.images,before.rich.images);
    assert.deepEqual(edited.studio.originals,before.studio.originals);
    assert.deepEqual(after.extras,persisted.extras);
    await updated.reload();
    assert.deepEqual(contents(draft(await snapshot(updated))),contents(edited));
    console.log('PASS exact deployed 1.5.207 -> 1.5.208: waiting editor, offline reopen, byte-exact legacy PNG/JPEG, continuation, text and progress preserved');
  } catch(error) {
    console.error('Exact upgrade failure',JSON.stringify({phase,requests}));
    if(diagnosticPage&&!diagnosticPage.isClosed()){
      try{console.error('Browser state',await bounded('failure diagnostics',()=>diagnosticPage.evaluate(async()=>{const reg=await navigator.serviceWorker.getRegistration();return {url:location.pathname,controller:navigator.serviceWorker.controller?.state,active:reg?.active?.state,waiting:reg?.waiting?.state,installing:reg?.installing?.state,cacheKeys:await caches.keys(),events:window.qaWorkerEvents,updateError:window.qaUpdateError};}),3000));}catch(e){console.error('Browser diagnostics unavailable',String(e));}
    }
    throw error;
  } finally {
    mark('cleanup');
    if(context)await bounded('close context',()=>context.close(),10000).catch(e=>console.error(String(e)));
    if(browser)await bounded('close browser',()=>browser.close(),10000).catch(e=>console.error(String(e)));
    server.closeAllConnections?.();
    await bounded('close server',()=>new Promise(resolve=>server.close(resolve)),5000);
  }
}
main().then(()=>clearTimeout(watchdog)).catch(error=>{clearTimeout(watchdog);console.error(error);process.exit(1);});
