/* Browser smoke test. Install Playwright separately; node tests/browser-smoke.cjs.
   Uses a temporary local profile and does not touch production or personal data. */
const {chromium,webkit}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.json':'application/json','.css':'text/css','.txt':'text/plain','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp'};
const initialFiles=['index.html','classic-art-153.js','classic-art-155.js','andersen-art-156.js','learning-art-1536.css'];
const initialBytes=initialFiles.reduce((n,name)=>n+fs.statSync(path.join(root,name)).size,0);
assert.ok(initialBytes<=1000000,'initial source budget exceeded: '+initialBytes);
console.log('INITIAL SOURCE BYTES',initialBytes);
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
 const initialBookRequests=[];const trackBooks=req=>{if(new URL(req.url()).pathname.includes('/assets/books/'))initialBookRequests.push(req.url())};page.on('request',trackBooks);
 await page.goto(url+'#author=own&theme=');
 assert.equal(await page.evaluate(()=>location.hash),'','legacy shelf URL should be cleaned');
 assert.equal(initialBookRequests.length,0,'book artwork must not load on home');page.off('request',trackBooks);
 assert.ok(await page.locator('#storybookHome').isVisible());assert.equal(await page.locator('#libraryHome').isVisible(),false);assert.equal(await page.locator('#adultHome').isVisible(),false);
 assert.equal(await page.locator('.home-map button').count(),4);assert.equal(await page.locator('.home-paths button').count(),3);
 assert.ok(await page.locator('#homeFox img').evaluate(async e=>{await e.decode();return e.naturalWidth>180}));
 const last=await page.locator('#homeBooks').boundingBox();assert.ok(last.y>=0&&last.y+last.height<=viewport.height,'personal books must fit first screen');
 await page.locator('#homeBooks').click();assert.ok(await page.locator('#libraryHome').isVisible());assert.equal(await page.locator('#libraryFilters').evaluate(e=>e.open),false);
 await page.locator('#libraryFilters summary').click();assert.ok(await page.locator('#authors').isVisible());await page.locator('#libraryFilters summary').click();await page.locator('#home').click();
 assert.ok(await page.locator('.home-art').first().evaluate(e=>getComputedStyle(e).backgroundImage.includes('data:image/webp;base64,')));
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.locator('#homeMath').click();assert.equal(await page.locator('[data-academy]').count(),12);assert.equal(await page.locator('#close').isVisible(),false);await page.locator('#academyBack').click();
 await page.locator('#homeLogic').click();assert.equal(await page.locator('[data-academy]').count(),6);await page.locator('#academyBack').click();
 await page.locator('#homeCreate').click();assert.ok(await page.locator('#creativeHome').isVisible());assert.equal(await page.locator('#storybookHome').isVisible(),false);
 await page.locator('#childBooks').click();assert.ok(await page.locator('#libraryHome').isVisible());assert.equal(await page.locator('#homeLabel').textContent(),'Главная');
 await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));const homeRect=await page.locator('#home').boundingBox();assert.ok(homeRect.y>=0&&homeRect.y+homeRect.height<=viewport.height,'home button must stay in viewport');
 await page.locator('#home').click();assert.ok(await page.locator('#storybookHome').isVisible());await page.goBack();assert.ok(await page.locator('#libraryHome').isVisible());
 await page.reload();assert.ok(await page.locator('#storybookHome').isVisible());assert.equal(await page.evaluate(()=>location.hash),'');
 assert.equal(await page.locator('#homeLabel').textContent(),'Книга сказок');
 // P0: personal search must find a persisted book outside its selected topic/author.
 await page.evaluate(()=>{const book={id:'qa-personal-search',title:'Ёжик и северное сияние',body:'Светлячок нашёл волшебный фонарь.',theme:'Винни-Пух',author:OWN,icon:'📖'};if(!commitLibrary({...data,stories:[...data.stories,book]}))throw Error('personal search fixture');});
 await page.locator('#homeBooks').click();
 await page.evaluate(()=>chooseTheme('Море'));
 await page.locator('#bookSearch').fill('ежик фонарь');
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
 const artInfo=await page.locator('[data-academy] .fairy-art').first().evaluate(el=>{const style=getComputedStyle(el);return {image:style.backgroundImage.startsWith('url("data:image/webp;base64,'),width:el.getBoundingClientRect().width}});
 assert.ok(artInfo.image&&artInfo.width>60,'illustration sprite did not render');

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
 await page.evaluate(()=>{let v=studyState("logic-order");v.n=3;v.level=2;studySave("logic-order",v);studyOpen("logic","order")});
 assert.ok(await page.locator('#studySpatial').isVisible());await page.locator('#spatialControls button:enabled').first().click();
 assert.equal(await page.locator('#spatialStatus').textContent(),'Шагов: 1');
 await page.locator('#spatialUndo').click();assert.equal(await page.locator('#spatialStatus').textContent(),'Шагов: 0');
 await page.locator('#lessonHelp summary').click();await page.locator('#studySolution').click();assert.ok(await page.locator('#spatialCheck').isDisabled());
 await page.locator('#studyNext').click();assert.equal(await page.locator('#studySpatial').isVisible(),false);
 await page.keyboard.press('Escape');await page.locator('#childWorld').click();
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
 await page.locator('#worldBack').click();await page.locator('[data-area="1"]').click();await page.locator('[data-world="seed"]').click();
 assert.equal(await page.locator('#seedExperiment').isVisible(),false);await page.locator('#worldUnsure').click();
 assert.ok(await page.locator('#seedExperiment').isVisible());assert.ok((await page.locator('#seedArt svg').getAttribute('aria-label')).includes('Предскажи'));
 await page.locator('[data-seed="1"]').click();await page.locator('#seedYes').click();assert.ok((await page.locator('#seedFeedback').textContent()).includes('Без воды'));assert.equal(await page.locator('#seedYes').isVisible(),false);
 await page.locator('[data-seed="4"]').click();await page.locator('#seedYes').click();assert.ok((await page.locator('#seedFeedback').textContent()).includes('может прорасти без света'));await page.locator('#worldNext').click();assert.equal(await page.locator('#seedExperiment').isVisible(),false);
 await page.keyboard.press('Escape');await page.locator('#readingEntry').click();
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
 assert.equal(await page.locator('#lessonSubject option').count(),6);
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
 assert.ok((await page.locator('#coloringCount').textContent()).includes('из 40'));
 await page.locator('#coloringMore').click();assert.ok((await page.locator('#coloringCount').textContent()).includes('9–16'));
 assert.equal(await page.locator('#storyColoringGallery .story-coloring-choice').count(),8);
 await page.locator('#coloringPrev').click();
 await page.locator('#coloringCategory').selectOption('Космос');
 assert.ok((await page.locator('#coloringCount').textContent()).includes('из 4'));
 await page.locator('#coloringSearch').fill('ракета');assert.equal(await page.locator('#storyColoringGallery .story-coloring-choice').count(),1);
 await page.locator('.coloring-like').click();await page.locator('#coloringCategory').selectOption('liked');assert.equal(await page.locator('#storyColoringGallery .story-coloring-choice').count(),1);
 await page.locator('#coloringSearch').fill('');await page.locator('#coloringCategory').selectOption('all');
 const catalogRender=await page.evaluate(()=>{const seen=new Set();for(const key of ORIGINAL_COLORING_IDS){const c=document.createElement('canvas');c.width=720;c.height=480;const ctx=c.getContext('2d');if(!originalColoring(ctx,key))throw Error(key);seen.add(c.toDataURL());const image=ctx.getImageData(0,0,720,480);const data=image.data;let found=0;for(let y=20;y<460&&found<5;y+=16)for(let x=20;x<700&&found<5;x+=16){const p=(y*720+x)*4;if(data[p]!==255||data[p+1]!==253||data[p+2]!==247)continue;const color=[22+found*35,111,177,255];if(!artFill(data,720,480,x,y,color))continue;let n=0;for(let i=0;i<data.length;i+=4)if(data[i]===color[0]&&data[i+1]===111&&data[i+2]===177)n++;if(n>100)found++;else{for(let i=0;i<data.length;i+=4)if(data[i]===color[0]&&data[i+1]===111&&data[i+2]===177){data[i]=255;data[i+1]=253;data[i+2]=247}}}if(found<5)throw Error('insufficient color regions '+key+' '+found)}return seen.size});
 assert.equal(catalogRender,40,'all distinct rendered catalog scenes');
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
 const textures=await page.evaluate(()=>{const outputs=[];for(const effect of ['solid','soft','marker','crayon','water']){const c=document.createElement('canvas');c.width=100;c.height=50;const cx=c.getContext('2d');studioStroke(cx,{x:15,y:25},{x:85,y:25},12,effect,'#bd3948');outputs.push(c.toDataURL())}return new Set(outputs).size});
 assert.equal(textures,5,'distinct brush strokes');

 // All paint effects and stamp types must preserve the identical pixels with cropped vs full ink restore.
 const inkEquivalence=await page.evaluate(()=>{
  const make=()=>{const c=document.createElement('canvas');c.width=720;c.height=480;return c};
  const layer=make(),lc=layer.getContext('2d');lc.strokeStyle='#40382f';lc.lineWidth=3;for(let x=0;x<720;x+=9){lc.beginPath();lc.moveTo(x,0);lc.lineTo(x,480);lc.stroke()}for(let y=0;y<480;y+=11){lc.beginPath();lc.moveTo(0,y);lc.lineTo(720,y);lc.stroke()}
  const mask=lc.getImageData(0,0,720,480);for(let i=3;i<mask.data.length;i+=4)mask.data[i]=mask.data[i]?255:0;lc.putImageData(mask,0,0);
  const a=make(),b=make(),ca=a.getContext('2d'),cb=b.getContext('2d');let cases=0;
  const kinds=['solid','soft','marker','crayon','water','pastel','rainbow','gold','silver','neon','glitter',...stampEffects];
  for(const kind of kinds)for(const width of [4,11,24])for(const [from,to] of [[{x:0,y:0},{x:17,y:22}],[{x:350.2,y:240.7},{x:355.4,y:245.2}],[{x:710,y:470},{x:719,y:479}]]){
   for(const c of [ca,cb]){c.fillStyle='#fffdf7';c.fillRect(0,0,720,480);c.drawImage(layer,0,0);if(stampEffects.has(kind))studioStamp(c,to.x,to.y,Math.max(8,width*.73),kind,'#bd3948');else studioStroke(c,from,to,width,kind,'#bd3948',120)}
   ca.drawImage(layer,0,0);studioRestoreInk(cb,layer,from,to,width);
   const x=ca.getImageData(0,0,720,480).data,y=cb.getImageData(0,0,720,480).data;
   for(let i=0;i<x.length;i++)if(x[i]!==y[i])throw Error('ink mismatch '+kind+' '+width+' at '+i);
   cases++;
  }
  return cases;
 });
 assert.ok(inkEquivalence>=180,'all ink restoration equivalence cases');
 console.log('INK EQUIVALENCE CASES',inkEquivalence);


 await page.locator('[data-art-mode="lesson"]').click();
 assert.ok(await page.locator('#studioLessonPane').isVisible());
 await page.waitForFunction(()=>{const a=document.getElementById('studioSheet').getBoundingClientRect(),b=document.getElementById('studioExtras').getBoundingClientRect(),c=document.getElementById('drawingCanvas').getBoundingClientRect();return a.width>200&&a.height>130&&c.width>200&&c.height>130&&(a.right<=b.left+1||b.bottom<=a.top+1)});
 for(const subject of ['rabbit','cat','flower','house','fox','butterfly']){
  await page.locator('#lessonSubject').selectOption(subject);
  for(let step=0;step<6;step++){assert.equal(await page.locator('#lessonPicture [data-lesson-stage]').count(),step+1);assert.ok((await page.locator('#lessonInstruction').textContent()).includes('Шаг '+(step+1)+' из 6'));if(step<5)await page.locator('#lessonNext').click();}
  assert.equal(await page.locator('#lessonNext').isEnabled(),false);
  await page.locator('#lessonPrev').click();assert.ok(await page.locator('#lessonNext').isEnabled());
  assert.equal(await pixelState(),colored,'lesson must not alter the child canvas');
 }

 assert.equal(await pixelState(),colored,'lesson navigation must not modify child drawing');
 await page.locator('[data-art-mode="free"]').click();
 assert.equal(await page.locator('[data-tool="brush"]').getAttribute('aria-pressed'),'true');
 assert.equal(await pixelState(),colored,'switching modes must keep image');
 assert.equal(await page.locator('#drawingColors button:visible').count(),16);
 assert.equal(await page.locator('#studioEffects').isVisible(),false);
 await page.locator('#paletteMore').click();assert.equal(await page.locator('#drawingColors button:visible').count(),72);await page.locator('#paletteMore').click();
 await page.locator('#studioMore summary').click();assert.ok(await page.locator('#studioEffects').isVisible());await page.locator('#studioEffects').click();assert.ok(await page.locator('#studioExtraTitle').isVisible());await page.locator('#studioExtraClose').click();
 const sheet=await page.locator('#drawingCanvas').boundingBox();assert.ok(sheet.width>220&&sheet.height>140,'canvas size');
 await page.mouse.move(sheet.x+sheet.width/3,sheet.y+sheet.height/3);await page.mouse.down();await page.mouse.move(sheet.x+sheet.width/2,sheet.y+sheet.height/2,{steps:5});await page.mouse.up();
 assert.ok(await page.locator('#drawingSave').isEnabled());
 const draft=await page.evaluate(()=>localStorage.getItem('skazki-unfinished-drawing-v1'));assert.ok(draft?.startsWith('data:image/jpeg;base64,'));
 await page.keyboard.press('Escape');await page.reload();await page.evaluate(()=>artRoom());
 await page.waitForFunction(()=>document.getElementById('drawingStatus')?.textContent.includes('Продолжай свой сохранённый рисунок'));
 assert.equal(await page.evaluate(()=>localStorage.getItem('skazki-unfinished-drawing-v1')),draft);
 assert.deepEqual(await inkAt(),ink,'original contour restored after reload');
 await page.locator('#drawingSave').click();
 await page.locator('#galleryGrid [data-view]').first().click();assert.ok(await page.locator('.gallery-large').isVisible());
 await page.locator('#galleryReturn').click();assert.ok(await page.locator('#galleryGrid').isVisible());
 assert.ok(await page.evaluate(()=>JSON.parse(localStorage.getItem('skazki-art-gallery-v1')||'[]').length>0),'drawing stored');
 const savedGallery=await page.evaluate(()=>localStorage.getItem(ART_GALLERY));
 const expanded=await page.evaluate(()=>{const old=galleryItems();const image=old[0].src;let ok=0;for(let i=old.length;i<10;i++)if(gallerySave(image))ok++;return {count:galleryItems().length,first:galleryItems()[0].id,oldFirst:old[0].id,ok}});
 assert.equal(expanded.count,10);assert.equal(expanded.first,expanded.oldFirst);
 await page.reload();await page.evaluate(()=>artGallery());assert.equal(await page.locator('#galleryGrid [data-view]').count(),10);
 await page.evaluate(raw=>localStorage.setItem(ART_GALLERY,raw),savedGallery);

 await page.keyboard.press('Escape');
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
 assert.deepEqual(errors,[]);await ctx.close();console.log('PASS',viewport);
 }
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
