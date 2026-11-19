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
 await page.goto(url);
 assert.ok(await page.locator('#storybookHome').isVisible());assert.equal(await page.locator('#libraryHome').isVisible(),false);assert.equal(await page.locator('#adultHome').isVisible(),false);
 assert.equal(await page.locator('.home-map button').count(),4);
 assert.ok(await page.locator('.home-art').first().evaluate(e=>getComputedStyle(e).backgroundImage.includes('data:image/webp;base64,')));
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.locator('#homeMath').click();assert.equal(await page.locator('[data-academy]').count(),12);await page.locator('#close').click();
 await page.locator('#homeLogic').click();assert.equal(await page.locator('[data-academy]').count(),6);await page.locator('#close').click();
 await page.locator('#homeCreate').click();assert.ok(await page.locator('#creativeHome').isVisible());assert.equal(await page.locator('#storybookHome').isVisible(),false);
 await page.locator('#childBooks').click();assert.ok(await page.locator('#libraryHome').isVisible());await page.locator('#home').click();
 await page.locator('#adultEntry').click();assert.ok(await page.locator('#adultHome').isVisible());assert.ok(await page.locator('#adultProgress .study-parent').isVisible());await page.locator('#home').click();
 await page.locator('#childLearn').click();assert.equal(await page.locator('#modal .study-parent').count(),0);
 await page.locator('#learnOutcomes').click();await page.locator('[data-outcome="story"]').click();
 await page.locator('#outcomeNumber').fill('10');await page.locator('#outcomeSend').click();
 assert.equal(await page.locator('#outcomeProgress').evaluate(e=>e.value),1);
 await page.locator('#outcomeExit').click();await page.locator('[data-outcome="story"]').click();
 assert.equal(await page.locator('#outcomeProgress').evaluate(e=>e.value),1);await page.locator('#outcomeSkip').click();
 assert.equal(await page.locator('#outcomeProgress').evaluate(e=>e.value),2);
 await page.locator('#outcomeExit').click();await page.locator('#outcomeBack').click();
 await page.locator('#learnMath').click();assert.equal(await page.locator('[data-academy]').count(),12);
 assert.equal(await page.locator('#modal').evaluate(el=>el.classList.contains('fairy-menu-focus')),true);
 assert.equal(await page.locator('[data-academy] .fairy-art').count(),12);
 const artInfo=await page.locator('[data-academy] .fairy-art').first().evaluate(el=>{const style=getComputedStyle(el);return {image:style.backgroundImage.startsWith('url("data:image/webp;base64,'),width:el.getBoundingClientRect().width}});
 assert.ok(artInfo.image&&artInfo.width>60,'illustration sprite did not render');

 await page.locator('[data-academy="add"]').click();
 await page.locator('#studyQuestion').waitFor({state:'visible'});
 assert.equal(await page.locator('#modal').evaluate(el=>el.classList.contains('fairy-menu-focus')),false);
 assert.equal(await page.locator('#modal').evaluate(el=>el.classList.contains('fairy-lesson-focus')),true);
 assert.ok(await page.locator('.lesson-workspace').isVisible());
 await page.locator('#studySolution').click();await page.locator('#studyNext').click();
 await page.locator('#studyBack').click();await page.locator('[data-academy="place"]').click();
 assert.equal(await page.locator('#studyModel').isVisible(),true);
 await page.locator('[data-model-i="0"][data-model-d="1"]').click();assert.equal(await page.locator('#modelValue0').textContent(),'1');
 await page.locator('#modelReset').click();assert.equal(await page.locator('#modelValue0').textContent(),'0');
 await page.locator('#studySolution').click();assert.ok(await page.locator('#modelCheck').isDisabled());await page.locator('#studyNext').click();assert.equal(await page.locator('#studyModel').isVisible(),false);
 await page.locator('#close').click();await page.locator('#childLearn').click();await page.locator('#learnLogic').click();
 assert.equal(await page.locator('[data-academy]').count(),6);
 assert.equal(await page.locator('[data-academy] .fairy-art').count(),6);
 assert.equal(await page.locator('[data-academy="evidence"]').isVisible(),true);
 await page.locator('[data-academy="evidence"]').click();
 await page.locator('#studyChoices button').first().click();
 await page.locator('#studyFeedback').waitFor({state:'visible'});
 await page.locator('#close').click();await page.locator('#childLearn').click();await page.locator('#learnLogic').click();
 const planning=page.locator('[data-academy="planning"]');
 assert.equal(await planning.isVisible(),true);
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
 await page.locator('#close').click();
 await page.evaluate(()=>{let v=studyState("logic-order");v.n=3;v.level=2;studySave("logic-order",v);studyOpen("logic","order")});
 assert.ok(await page.locator('#studySpatial').isVisible());await page.locator('#spatialControls button:enabled').first().click();
 assert.equal(await page.locator('#spatialStatus').textContent(),'Шагов: 1');
 await page.locator('#spatialUndo').click();assert.equal(await page.locator('#spatialStatus').textContent(),'Шагов: 0');
 await page.locator('#studySolution').click();assert.ok(await page.locator('#spatialCheck').isDisabled());
 await page.locator('#studyNext').click();assert.equal(await page.locator('#studySpatial').isVisible(),false);
 await page.locator('#close').click();await page.locator('#childLearn').click();await page.locator('#learnWorld').click();
 assert.equal(await page.locator('[data-area]').count(),4);
 await page.locator('[data-area="1"]').click();
 assert.equal(await page.locator('.explore-grid [data-world]').count(),7);
 await page.locator('[data-world="bee"]').click();
 await page.locator('#worldBack').click();
 assert.equal(await page.locator('[data-area="1"]').getAttribute('aria-pressed'),'true');
 await page.locator('[data-area="0"]').click();await page.locator('[data-world="day"]').click();
 assert.equal(await page.locator('#dayExperiment').isVisible(),false);
 await page.locator('#worldUnsure').click();await page.locator('#dayRotate').click();await page.locator('#dayRotate').click();
 assert.ok((await page.locator('.day-model-label').textContent()).includes('Ночь'));
 for(const [area,id] of [[0,'shadow'],[2,'magnet'],[2,'float']]){
  await page.locator('#worldBack').click();await page.locator('[data-area="'+area+'"]').click();await page.locator('[data-world="'+id+'"]').click();
  assert.equal(await page.locator('#worldLab').isVisible(),false);
  await page.locator('#worldUnsure').click();assert.ok(await page.locator('#worldLab').isVisible());
  const first=await page.locator('#worldLabLabel').textContent();
  await page.locator('[data-lab="2"]').click();
  assert.notEqual(await page.locator('#worldLabLabel').textContent(),first);
  assert.equal(await page.locator('[data-lab="2"]').getAttribute('aria-pressed'),'true');
  await page.locator('#worldNext').click();assert.equal(await page.locator('#worldLab').isVisible(),false);
 }
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
 assert.ok(checkpoint&&checkpoint.entries.length===15);
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
