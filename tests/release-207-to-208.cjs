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
let serving = oldVersion;
const server = http.createServer((req,res) => {
  const pathname = new URL(req.url,'http://127.0.0.1').pathname;
  if (pathname === '/control.html') {res.setHeader('Content-Type','text/html');return res.end('<!doctype html><title>QA control</title>');}
  if (!pathname.startsWith('/book/')) {res.statusCode=404;return res.end();}
  const name = pathname.slice('/book/'.length)||'index.html';
  if (!/^[A-Za-z0-9_./-]+$/.test(name)||name.split('/').some(part=>part==='..'||part==='.')) {res.statusCode=404;return res.end();}
  try {
    const bytes=(serving===oldVersion?oldRead:newRead)(name);
    if(name==='sw.js'||(serving===newVersion&&requests.length<250))requests.push({name,version:serving,bytes:bytes.length,...(name==='sw.js'?{sha256:hash(bytes)}:{})});
    res.setHeader('Content-Type',mime[path.extname(name)]||'application/octet-stream');
    res.setHeader('Cache-Control','no-store');
    res.end(bytes);
  } catch(error) {if(serving===newVersion)requests.push({name,version:serving,error:String(error.message).slice(0,200)});res.statusCode=404;res.end();}
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
    browser=await (process.env.BROWSER==='webkit'?webkit:chromium).launch({headless:true});
    context=await browser.newContext({serviceWorkers:'allow',viewport:{width:1024,height:768}});
    const control=await context.newPage();await control.goto(origin+'/control.html');
    const page=await context.newPage();await page.goto(url);
    await page.evaluate(async()=>{await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});await navigator.serviceWorker.ready;});
    await page.waitForFunction(async()=>{
      const reg=await navigator.serviceWorker.getRegistration();
      return navigator.serviceWorker.controller?.state==='activated'&&reg?.active?.state==='activated'&&!reg.waiting&&!reg.installing;
    },null,{timeout:30000});
    assert.equal(await page.evaluate(()=>APP_RELEASE),oldVersion);
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
    // Observe waiting on the exact old worker, without navigating the old editor.
    await page.evaluate(async()=>{
      const reg=await navigator.serviceWorker.getRegistration();
      await reg.update();
    });
    const newCache='skazki-shell-'+newVersion+'-'+fingerprint;
    const readyKey=origin+'/book/__skazki_shell_verified__';
    // Check the actual named cache rather than the cross-cache match option.
    // A stale waiting reference is insufficient proof of a complete installation.
    const installationState=()=>page.evaluate(async ({name,key})=>{
      const reg=await navigator.serviceWorker.getRegistration();
      const keys=await caches.keys();
      const cache=keys.includes(name)?await caches.open(name):null;
      const marker=cache?await cache.match(key):null;
      return {active:reg?.active?.state,waiting:reg?.waiting?.state,installing:reg?.installing?.state,oldStillActive:reg?.active===window.qaOldWorker,marker:marker?await marker.text():null,cacheKeys:keys,entries:cache?(await cache.keys()).map(r=>new URL(r.url).pathname):[],events:window.qaWorkerEvents,switches:window.qaSwitches};
    },{name:newCache,key:readyKey});
    const deadlineInstall=Date.now()+60000;
    let state=await installationState();
    while(Date.now()<deadlineInstall&&(state.marker!==fingerprint||state.waiting!=='installed')){
      await new Promise(resolve=>setTimeout(resolve,500));
      state=await installationState();
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
    await page.close();
    const persisted=await snapshot(control);
    assert.deepEqual(contents(draft(persisted)),contents(before));
    assert.ok(await control.evaluate(name=>caches.has(name),newCache));
    await context.setOffline(true);
    // Natural activation is asynchronous. Close each old-version probe so
    // it cannot keep the preceding worker alive. Never force skipWaiting,
    // clear caches, unregister, or bypass the worker.
    let updated, observed=[];
    const deadline=Date.now()+45000;
    while(Date.now()<deadline){
      const probe=await context.newPage();
      let actual;
      try {
        await probe.goto(url,{timeout:8000});
        actual=await probe.evaluate(()=>({version:typeof APP_RELEASE==='undefined'?null:APP_RELEASE,controlled:!!navigator.serviceWorker.controller}));
        observed.push(actual);
        assert.deepEqual(await snapshot(probe),persisted,'saved bytes must survive every offline activation probe');
        if(actual.version===newVersion&&actual.controlled){updated=probe;break;}
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
  } finally {
    if(context)await context.close();
    if(browser)await browser.close();
    server.closeAllConnections?.();
    await new Promise(resolve=>server.close(resolve));
  }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
