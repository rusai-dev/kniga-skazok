/* Browser smoke test. Install Playwright separately; node tests/browser-smoke.cjs.
   Uses a temporary local profile and does not touch production or personal data. */
const {chromium,webkit}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.json':'application/json','.css':'text/css','.txt':'text/plain'};
const server=http.createServer((req,res)=>{
 const name=new URL(req.url,'http://127.0.0.1').pathname;
 const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end()}
 res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url='http://127.0.0.1:'+server.address().port+'/?view=personal';
 const engine=process.env.BROWSER==='webkit'?webkit:chromium;
 let browser;
 try{
 browser=await engine.launch({headless:true});
 for(const viewport of [{width:768,height:1024},{width:1024,height:768}]){
 const ctx=await browser.newContext({viewport,serviceWorkers:'block'});const page=await ctx.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url);await page.locator('#childLearn').click();
 await page.locator('#learnMath').click();assert.equal(await page.locator('[data-academy]').count(),12);
 await page.locator('[data-academy="add"]').click();
 await page.locator('#studyQuestion').waitFor({state:'visible'});
 await page.locator('#studySolution').click();await page.locator('#studyNext').click();
 await page.locator('#close').click();await page.locator('#childLearn').click();await page.locator('#learnLogic').click();
 assert.equal(await page.locator('[data-academy]').count(),6);
 await page.locator('.academy-topic-group').nth(1).locator('summary').click();
 await page.locator('[data-academy="evidence"]').click();
 await page.locator('#studyChoices button').first().click();
 await page.locator('#studyFeedback').waitFor({state:'visible'});
 await page.locator('#close').click();await page.locator('#childLearn').click();await page.locator('#learnLogic').click();
 const planning=page.locator('[data-academy="planning"]');
 if(!(await planning.isVisible()))await page.locator('details.academy-topic-group').filter({has:planning}).locator('summary').click();
 await planning.click();
 await page.locator('#studySequence').waitFor({state:'visible'});
 assert.equal(await page.locator('#sequenceCheck').isDisabled(),true);
 await page.locator('#sequenceChoices button').first().click();
 await page.locator('#sequenceUndo').click();
 assert.equal(await page.locator('#sequenceCheck').isDisabled(),true);
 await page.locator('#studySolution').click();
 assert.equal(await page.locator('#sequenceCheck').isDisabled(),true);
 await page.locator('#studyNext').click();
 assert.equal(await page.locator('#studySequence').isVisible(),false);
 await page.locator('#close').click();await page.locator('#readingEntry').click();
 await page.locator('[data-story]').first().click();await page.locator('#readingNumber').waitFor({state:'visible'});
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
 for(const size of ['#readingLarge','#readingSmall']){
 const btn=page.locator(size);if(await btn.isEnabled())await btn.click();
 const dims=await page.locator('#readingText').evaluate(el=>({client:el.clientHeight,scroll:el.scrollHeight}));
 assert.ok(dims.client>0&&dims.scroll<=dims.client+2,'font resize overflow');
 }
 await page.locator('#readingBack').click();
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
 await page.locator('#close').click();
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
 assert.ok(checkpoint&&checkpoint.entries.length===14);
 await page.evaluate(()=>backup());
 await page.locator('.archive-recovery summary').click();
 page.once('dialog',dialog=>dialog.accept());
 await page.locator('#undoRestore').click();
 await page.waitForFunction(()=>!document.getElementById('modal').hasAttribute('open'));
 assert.equal(await page.evaluate(()=>data.stories.find(b=>b.id==='archive-test-book')?.body),'Сохранённый текст.');
 assert.equal(await page.evaluate(()=>localStorage.getItem('skazki-reading-size-v1')),'28');
 assert.equal(await page.evaluate(()=>localStorage.getItem('skazki-art-gallery-v1')),null);
 assert.deepEqual(errors,[]);await ctx.close();console.log('PASS',viewport);
 }
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
