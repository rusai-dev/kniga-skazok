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
  if (!oldFiles.has(name)) oldFiles.set(name, execFileSync('git',['show',oldSha+':'+name],{cwd:root,maxBuffer:32*1024*1024,stdio:['ignore','pipe','ignore']}));
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
let serving = oldVersion;
const server = http.createServer((req,res) => {
  const pathname = new URL(req.url,'http://127.0.0.1').pathname;
  if (pathname === '/control.html') {res.setHeader('Content-Type','text/html');return res.end('<!doctype html><title>QA control</title>');}
  if (!pathname.startsWith('/book/')) {res.statusCode=404;return res.end();}
  const name = pathname.slice('/book/'.length)||'index.html';
  if (!/^[A-Za-z0-9_./-]+$/.test(name)||name.split('/').some(part=>part==='..'||part==='.')) {res.statusCode=404;return res.end();}
  try {
    const bytes=(serving===oldVersion?oldRead:newRead)(name);
    res.setHeader('Content-Type',mime[path.extname(name)]||'application/octet-stream');
    res.setHeader('Cache-Control','no-store');
    res.end(bytes);
  } catch {res.statusCode=404;res.end();}
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
    await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
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
    await page.evaluate(()=>{window.qaSwitches=0;navigator.serviceWorker.addEventListener('controllerchange',()=>window.qaSwitches++);});
    serving=newVersion;
    // Observe waiting on the exact old worker, without navigating the old editor.
    await page.evaluate(async()=>{
      const reg=await navigator.serviceWorker.getRegistration();
      await reg.update();
    });
    await page.waitForFunction(async()=>!!(await navigator.serviceWorker.getRegistration()).waiting,{},{timeout:30000});
    assert.equal(await page.evaluate(()=>window.qaSwitches),0);
    assert.equal(await page.evaluate(()=>APP_RELEASE),oldVersion);
    assert.equal(await canvas.evaluate(c=>c.toDataURL()),oldPixels);
    assert.deepEqual(contents(draft(await snapshot(page))),contents(before));
    await page.close();
    await control.waitForFunction(async scope=>{
      const reg=await navigator.serviceWorker.getRegistration(scope);
      return reg?.active?.state==='activated'&&!reg.waiting&&!reg.installing;
    },url,{timeout:30000});
    const persisted=await snapshot(control);
    assert.deepEqual(contents(draft(persisted)),contents(before));
    assert.ok(await control.evaluate(name=>caches.has(name),'skazki-shell-'+newVersion+'-'+fingerprint));
    await context.setOffline(true);
    const updated=await context.newPage();await updated.goto(url);
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
    await new Promise(resolve=>server.close(resolve));
  }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
