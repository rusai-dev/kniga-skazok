'use strict';

// Exact deployed 1.5.207 source -> checked-out 1.5.208, same isolated origin.
// No production access, no real child data, no synthetic version renaming.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const {gzipSync}=require('node:zlib');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const {chromium, webkit} = require('playwright');
const {shellDefinition} = require('../tools/shell-integrity.cjs');
const root = path.resolve(__dirname, '..');
const oldSha = process.env.QA_BASE_SHA || '6fe6bcc0ad285176c93ab045e94328cf1de9bed5';
const oldVersion = process.env.QA_BASE_VERSION || '1.5.207', newVersion = process.env.QA_TARGET_VERSION || '1.5.208';
assert.match(oldSha,/^[a-f0-9]{40}$/);
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
  if(process.env.QA_TARGET_VERSION)throw Error('Exact upgrade target mismatch: '+release);
  console.log('SKIP historical exact 207->208 fixture: checkout is '+release);
  process.exit(0);
}
assert.equal(JSON.parse(oldRead('release.json')).version,oldVersion);
assert.ok(oldRead('index.html').toString().includes('<footer>Книга сказок · версия '+oldVersion+'</footer>'));
const {fingerprint} = shellDefinition(newRead('sw.js').toString());
const {createHash}=require('node:crypto');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const expectedWorkerHash=hash(newRead('sw.js'));
const expectedOldWorkerHash=hash(oldRead('sw.js'));
const expectedOldIndexHash=hash(oldRead('index.html'));
const oldDefinition=oldVersion==='1.5.207'?null:shellDefinition(oldRead('sw.js').toString());
const oldCacheName='skazki-shell-'+oldVersion+(oldDefinition?'-'+oldDefinition.fingerprint:'');
const oldEntryCount=oldDefinition?oldDefinition.resources.length+1:14;
const compressed=new Map();
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
// The historical worker has a fetch-all-headers-before-consuming-bodies
// deadlock under Chromium's installation throttle. Bootstrap only the
// already-installed legacy profile with the throttle disabled; close that
// browser completely and exercise the actual upgrade in default Chromium.
const isChromium=process.env.BROWSER!=='webkit';
const historicalBootstrap=isChromium&&oldVersion==='1.5.207';
let profileDir;
function serve(req,res) {
  const parsed = new URL(req.url,'http://127.0.0.1');
  const pathname=parsed.pathname;
  if(req.httpVersionMajor===1)res.setHeader('Connection','close');
  if (pathname === '/control.html') {res.setHeader('Content-Type','text/html');return res.end('<!doctype html><title>QA control</title>');}
  if (!pathname.startsWith('/book/')) {res.statusCode=404;return res.end();}
  const name = pathname.slice('/book/'.length)||'index.html';
  if (!/^[A-Za-z0-9_./-]+$/.test(name)||name.split('/').some(part=>part==='..'||part==='.')) {res.statusCode=404;return res.end();}
  try {
    const bytes=(serving===oldVersion?oldRead:newRead)(name);
    // The old worker fetches all response headers before consuming bodies.
    // Avoid loopback HTTP/1.1 keep-alive contention and oversized unconsumed
    // text bodies; serve ordinary compressed static responses like a web host.
    // Decompressed resource bytes, version queries and worker SHA are unchanged.
    const ext=path.extname(name);
    const gzip=bytes.length>1024&&/^(?:\.html|\.js|\.css|\.json|\.svg)$/.test(ext)&&/\bgzip\b/i.test(req.headers['accept-encoding']||'');
    const cacheKey=serving+':'+name;
    if(gzip&&!compressed.has(cacheKey))compressed.set(cacheKey,gzipSync(bytes));
    const wire=gzip?compressed.get(cacheKey):bytes;
    const record={name,query:parsed.search,protocol:req.httpVersion,version:serving,bytes:bytes.length,wireBytes:wire.length,encoding:gzip?'gzip':'identity',finished:false,...(name==='sw.js'?{sha256:hash(bytes)}:{})};
    if(requests.length<250||name==='sw.js')requests.push(record);
    res.on('finish',()=>{record.finished=true;});
    res.on('close',()=>{record.closed=true;});
    res.setHeader('Content-Type',mime[ext]||'application/octet-stream');
    res.setHeader('Cache-Control','no-store');
    res.setHeader('Content-Length',wire.length);
    res.setHeader('Vary','Accept-Encoding');
    if(gzip)res.setHeader('Content-Encoding','gzip');
    res.end(wire);
  } catch(error) {if(requests.length<250)requests.push({name,version:serving,error:String(error.message).slice(0,200)});res.statusCode=404;res.end();}
}
const server=http.createServer(serve);
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
    const contextOptions={serviceWorkers:'allow',viewport:{width:1024,height:768}};
    const configure=ctx=>{ctx.setDefaultTimeout(15000);ctx.setDefaultNavigationTimeout(20000);};
    mark('launch browser');
    if(historicalBootstrap){
      profileDir=fs.mkdtempSync(path.join(os.tmpdir(),'skazki-qa-installed-207-'));
      // Fixture preparation ONLY; default Chromium cannot reliably cold
      // install this exact historical worker. No flags in the upgrade.
      context=await bounded('bootstrap historical Chromium profile',()=>chromium.launchPersistentContext(profileDir,{...contextOptions,headless:true,timeout:20000,args:['--disable-features=ThrottleInstallingServiceWorker']}),25000);
      console.log('LEGACY FIXTURE ONLY: historical install throttle disabled');
    }else{
      browser=await bounded('launch browser',()=>(isChromium?chromium:webkit).launch({headless:true,timeout:20000}),25000);
      context=await bounded('new WebKit context',()=>browser.newContext(contextOptions));
    }
    configure(context);
    mark('open lightweight exact old release bootstrap');
    let control=await bounded('control page',()=>context.newPage());await control.goto(origin+'/control.html');
    let page=await bounded('old page',()=>context.newPage());diagnosticPage=page;
    page.on('pageerror',error=>console.log('[page error]',String(error.message).slice(0,350)));
    // Start installation from the actual small published release.json, not
    // a busy editor loading artwork and scripts. It is within /book/ scope.
    await page.goto(origin+'/book/release.json');
    assert.equal(JSON.parse(await page.locator('body').innerText()).version,oldVersion);
    mark('register exact old worker');
    // Do not await navigator.serviceWorker.ready: it never rejects if install fails.
    // The next bounded predicate proves that the old worker really activated.
    await bounded('old service worker register',()=>page.evaluate(async()=>{await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});}),25000);
    // Explicit polling: an async waitForFunction predicate can return a truthy
    // Promise before the underlying boolean becomes true. Never start upgrade
    // before the exact old worker controls the page and its offline shell exists.
    const oldCache=oldCacheName;
    const inspectOld=()=>page.evaluate(async ({name,expected})=>{
      const reg=await navigator.serviceWorker.getRegistration();
      const keys=await caches.keys();
      const cache=keys.includes(name)?await caches.open(name):null;
      const cached=cache?await cache.match(new URL('index.html',location.href).href):null;
      const bytes=cached?await cached.arrayBuffer():null;
      const html=bytes?new TextDecoder().decode(bytes):'';
      const digest=bytes?Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join(''):null;
      return {digest,controller:navigator.serviceWorker.controller?.state||null,active:reg?.active?.state||null,waiting:reg?.waiting?.state||null,installing:reg?.installing?.state||null,cacheKeys:keys,entries:cache?(await cache.keys()).length:0,exactHTML:html.includes('<footer>Книга сказок · версия '+expected+'</footer>')};
    },{name:oldCache,expected:oldVersion});
    const isOldReady=state=>state.controller==='activated'&&state.active==='activated'&&!state.waiting&&!state.installing&&state.exactHTML&&state.digest===expectedOldIndexHash&&state.entries===oldEntryCount;
    let oldState=await bounded('inspect old verified shell',inspectOld,10000);
    const deadlineOld=Date.now()+35000;
    while(!isOldReady(oldState)&&Date.now()<deadlineOld){
      await new Promise(resolve=>setTimeout(resolve,250));
      oldState=await bounded('inspect old verified shell',inspectOld,10000);
    }
    console.log('Exact old shell readiness',JSON.stringify(oldState));
    assert.ok(isOldReady(oldState),'old shell did not finish installation; do not attempt upgrade');
    assert.ok(requests.some(r=>r.name==='sw.js'&&r.version===oldVersion&&r.sha256===expectedOldWorkerHash&&r.finished),'exact old worker must be delivered');
    if(historicalBootstrap){
      mark('restart installed legacy profile in unmodified Chromium');
      await bounded('close fixture browser',()=>context.close(),20000);context=null;diagnosticPage=null;
      context=await bounded('reopen installed profile with default Chromium',()=>chromium.launchPersistentContext(profileDir,{...contextOptions,headless:true,timeout:20000}),25000);
      configure(context);
      // Persistent browser may open a blank tab; all pages created below are
      // deliberate. No fixture feature flags survive the browser restart.
      control=await bounded('reopen control page',()=>context.newPage());await control.goto(origin+'/control.html');
      page=await bounded('reopen old application page',()=>context.newPage());diagnosticPage=page;
      page.on('pageerror',error=>console.log('[page error]',String(error.message).slice(0,350)));
      console.log('ACTUAL UPGRADE: default Chromium, previously installed exact 1.5.207');
    }
    mark('open exact old application under activated worker');
    await page.goto(url);
    assert.equal(await page.evaluate(()=>APP_RELEASE),oldVersion);
    assert.ok(isOldReady(await bounded('confirm old shell still active',inspectOld,10000)));
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
    if(await updated.locator('#headerRelease').count()){assert.equal(await updated.locator('#headerRelease').textContent(),'v'+newVersion);assert.ok(await updated.locator('#headerRelease').isVisible());}
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
    console.log('PASS exact deployed '+oldVersion+' -> '+newVersion+': waiting editor, offline reopen, byte-exact legacy PNG/JPEG, continuation, text and progress preserved');
    if(['1.5.208/1.5.209','1.5.209/1.5.210'].includes(oldVersion+'/'+newVersion)){
      mark('verified '+newVersion+' -> '+oldVersion+' rollback with edited child-work fixture');
      await context.setOffline(false);
      const requestStart=requests.length;
      serving=oldVersion;
      await updated.evaluate(async()=>{
        const reg=await navigator.serviceWorker.getRegistration();
        reg.update().catch(error=>{window.qaRollbackError=String(error);});
      });
      await updated.waitForFunction(async()=>{
        const registration=await navigator.serviceWorker.getRegistration();
        return registration?.waiting?.state==='installed';
      },undefined,{timeout:35000});
      assert.ok(requests.slice(requestStart).some(r=>r.name==='sw.js'&&r.version===oldVersion&&r.sha256===expectedOldWorkerHash));
      assert.equal(await updated.evaluate(()=>APP_RELEASE),newVersion,'rollback waits for the current editor');
      assert.deepEqual(await snapshot(updated),after);
      await updated.close();
      diagnosticPage=control;
      await context.setOffline(true);
      let rolledBack;
      const rollbackDeadline=Date.now()+35000;
      while(Date.now()<rollbackDeadline){
        const probe=await context.newPage();
        await probe.goto(url,{timeout:8000});
        const loaded=await probe.evaluate(()=>({version:APP_RELEASE,controlled:!!navigator.serviceWorker.controller}));
        assert.deepEqual(await snapshot(probe),after,'rollback must not modify stored work');
        if(loaded.version===oldVersion&&loaded.controlled){rolledBack=probe;break;}
        assert.equal(loaded.version,newVersion,'unknown rollback shell');
        await probe.close();await new Promise(resolve=>setTimeout(resolve,350));
      }
      assert.ok(rolledBack,'compatible '+oldVersion+' shell did not activate offline');
      await rolledBack.locator('#homeDrafts').click();
      await rolledBack.locator('[data-own-draft]').filter({hasText:title}).click();
      assert.equal(await rolledBack.locator('#storyBody').inputValue(),edited.body);
      await rolledBack.locator('#drawStory').click();await ready(rolledBack);
      assert.equal(await rolledBack.locator('#drawingCanvas').evaluate(c=>c.toDataURL()),edited.studio.sheets[0].src);
      assert.deepEqual(await snapshot(rolledBack),after);
      serving=newVersion;
      console.log('PASS exact rollback preserves the manuscript, progress and original and new artwork');
    }
    // Independent default Chromium path for an old online-only user whose
    // historical worker never installed. Import only the synthetic bytes
    // generated by the real old editor above, never a production profile.
    if(isChromium){
      mark('default Chromium fresh worker with authentic legacy data');
      await bounded('close upgrade context',()=>context.close(),20000);context=null;diagnosticPage=null;
      if(browser){await bounded('close first browser',()=>browser.close(),20000);browser=null;}
      browser=await bounded('launch default clean Chromium',()=>chromium.launch({headless:true,timeout:20000}),25000);
      context=await bounded('clean context',()=>browser.newContext(contextOptions));configure(context);
      const seed=await context.newPage();diagnosticPage=seed;await seed.goto(origin+'/control.html');
      await seed.evaluate(({key,extras,state})=>{localStorage.setItem(key,state.library);extras.forEach((k,i)=>{if(state.extras[i]!==null)localStorage.setItem(k,state.extras[i]);});},{key,extras,state:persisted});
      const clean=await context.newPage();diagnosticPage=clean;
      await clean.goto(url);assert.equal(await clean.evaluate(()=>APP_RELEASE),newVersion);
      assert.deepEqual(await snapshot(clean),persisted,'legacy data must remain exact on a clean online open');
      await bounded('register clean candidate',()=>clean.evaluate(async()=>{await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});}),25000);
      const cleanState=()=>clean.evaluate(async ({name,key})=>{
        const reg=await navigator.serviceWorker.getRegistration(),keys=await caches.keys(),cache=keys.includes(name)?await caches.open(name):null,marker=cache?await cache.match(key):null;
        return {active:reg?.active?.state,controller:navigator.serviceWorker.controller?.state,marker:marker?await marker.text():null};
      },{name:newCache,key:readyKey});
      let cs=await bounded('inspect fresh worker',cleanState,10000);
      const cd=Date.now()+35000,valid=x=>x.active==='activated'&&x.controller==='activated'&&x.marker===fingerprint;
      while(!valid(cs)&&Date.now()<cd){await new Promise(resolve=>setTimeout(resolve,250));cs=await bounded('inspect fresh worker',cleanState,10000);}
      assert.ok(valid(cs),'fresh candidate failed in default Chromium: '+JSON.stringify(cs));
      await context.setOffline(true);await clean.reload();
      assert.equal(await clean.evaluate(()=>APP_RELEASE),newVersion);assert.deepEqual(await snapshot(clean),persisted);
      await clean.locator('#homeDrafts').click();await clean.locator('[data-own-draft]').filter({hasText:title}).click();
      assert.equal(await clean.locator('#storyBody').inputValue(),before.body);
      await clean.locator('#drawStory').click();await ready(clean);
      assert.equal(await clean.locator('#drawingCanvas').evaluate(c=>c.toDataURL()),oldPixels);
      console.log('PASS default Chromium clean candidate install with exact legacy data, offline reopen and original PNG');
    }
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
    try{await bounded('close server',()=>new Promise(resolve=>server.close(resolve)),5000);}finally{if(profileDir)fs.rmSync(profileDir,{recursive:true,force:true});}
  }
}
main().then(()=>clearTimeout(watchdog)).catch(error=>{clearTimeout(watchdog);console.error(error);process.exit(1);});
