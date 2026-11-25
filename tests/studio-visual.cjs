// Capture the same synthetic studio session on either side of a release.
const {chromium,webkit} = require('playwright');
const path = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const {visualLimit} = require('../tools/release-guard.cjs');
const [url,destination] = process.argv.slice(2);
const engine = process.env.BROWSER === 'webkit' ? webkit : chromium;
const viewports = {
  tablet: [[1024,768],[768,1024],[1194,834],[834,1194],[1366,1024]],
  mobile: [[390,700],[390,844],[600,800],[844,390]]
};
const group = process.env.VISUAL_GROUP;
assert.ok(!group || Object.hasOwn(viewports,group),'Unknown visual group');
const sizes = group ? viewports[group] : Object.values(viewports).flat();
const baseline = process.env.VISUAL_BASELINE_URL;

async function capture(browser,site,output,width,height) {
  const dir = path.join(output,width+'x'+height);
  fs.mkdirSync(dir,{recursive:true});
  const page = await browser.newPage({viewport:{width,height},serviceWorkers:'block',reducedMotion:'reduce',deviceScaleFactor:1,locale:'ru-RU',timezoneId:'Europe/Minsk'});
  await page.addInitScript(() => {
    let seed=23;
    Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
    const key='skazki-friends-v1';
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key,JSON.stringify({queue:['squirrel-scene01','owl-scene01']}));
      localStorage.setItem('skazki-studio-motif','0');
    }
  });
  const take = async (name,options={}) => {
    const geometry=await page.evaluate(async()=>{
      // The open dialog is the subject. Compare the background from the same
      // scroll position, even when click() scrolled its opener into view.
      if(document.querySelector('#modal[open]'))document.scrollingElement.scrollTop=0;
      await document.fonts.ready;
      const visible=[...document.images].filter(img=>{
        if(!img.currentSrc||!img.getClientRects().length)return false;
        const box=img.getBoundingClientRect();
        const x=(Math.max(0,box.left)+Math.min(innerWidth,box.right))/2;
        const y=(Math.max(0,box.top)+Math.min(innerHeight,box.bottom))/2;
        const hit=document.elementFromPoint(x,y);
        return hit===img||!!hit&&img.parentElement.contains(hit);
      });
      await Promise.all(visible.map(async img=>{
        img.loading='eager';
        let timeout;
        try{
          await Promise.race([img.decode(),new Promise((_,reject)=>{timeout=setTimeout(()=>reject(Error('Image did not settle: '+img.currentSrc)),3000)})]);
        }finally{clearTimeout(timeout)}
      }));
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      return {width:innerWidth,scroll:document.documentElement.scrollWidth};
    });
    assert.ok(geometry.scroll<=geometry.width+1, 'Horizontal page overflow at '+name);
    await page.screenshot({path:path.join(dir,name+'.png'),animations:'disabled',caret:'hide',...options});
  };
  const click = id => page.locator('#'+id).click();
  const openFromHome = async id => {
    // Keep the same visible backdrop for modal comparisons. Real touch
    // reachability of these entry points is exercised by browser-smoke.
    await page.locator('#'+id).evaluate(button=>{
      window.scrollTo(0,0);
      button.click();
    });
  };
  const record = {viewport:[width,height],entries:[]};
  try {
    await page.clock.setFixedTime(new Date("2026-01-15T12:00:00Z"));
    for (let i=1;i<=2;i++) {
      await page.goto(site);
      const image=page.locator('#homeFox img[data-scene]');
      await image.waitFor();
      record.entries.push(await image.evaluate(async img=>{
        await img.decode();
        return {scene:img.dataset.scene,url:img.currentSrc,name:img.alt,greeting:document.getElementById('friendGreeting').textContent};
      }));
      assert.equal(record.entries[i-1].greeting,'Сегодня с тобой '+record.entries[i-1].name);
      await take('home-'+i);
    }
    assert.notEqual(record.entries[0].scene,record.entries[1].scene);
    const cat=page.locator('.home-feature-art img');
    if(await cat.count()){
      record.cat=await cat.evaluate(async img=>{
        await img.decode();
        const bytes=await (await fetch(img.currentSrc)).arrayBuffer();
        const digest=new Uint8Array(await crypto.subtle.digest('SHA-256',bytes));
        const sha256=Array.from(digest,n=>n.toString(16).padStart(2,'0')).join('');
        return {size:[img.naturalWidth,img.naturalHeight],bytes:bytes.byteLength,sha256};
      });
      await page.locator('.home-feature-art').screenshot({path:path.join(dir,'egypt-cat.png')});
    }
    await click('friendsOpen');
    await page.locator('[data-favorite="bat"]').click();
    await page.locator('#homeFox img[data-hero="bat"]').waitFor();
    assert.equal(await page.locator('#friendGreeting').textContent(),'Сегодня с тобой Летучая мышка');
    await page.locator('[data-close]').click();
    await take('home-favorite');
    await click('friendsOpen');
    await page.locator('[data-auto]').click();
    await page.locator('.friends-grid img').first().evaluate(img=>img.decode());
    await take('friends');
    await page.locator('[data-close]').click();
    await click('homeBooks');await take('personal-library');await click('home');
    await click('adultEntry');await page.locator('#adultHome').waitFor({state:'visible'});
    if(await page.locator('#remoteReleaseStatus').count()){
      await page.locator('#remoteReleaseStatus').filter({hasText:'Версия на сервере:'}).waitFor({timeout:12000});
    }
    await page.locator('#toast').waitFor({state:'hidden'});
    await take('parent-version');await click('home');
    await page.locator('#storybookHome').waitFor({state:'visible'});
    await openFromHome('homeNewStory');
    await take('empty');
    const paragraph='Сова раскрыла атлас. На краю страницы поблёскивала река, а на другом берегу уже ждал зайчонок.';
    await page.locator('#storyTitle').fill('Атлас серебряной реки');
    const body=page.locator('#storyBody');
    await body.fill((paragraph+'\n\n').repeat(90));
    await page.locator('#writerExtras > summary').click();
    await page.locator('#storyChapters summary').click();
    await page.locator('#newChapterTitle').fill('Глава у звёздной реки');
    await click('appendChapter');
    await body.fill(await body.inputValue()+'В саду за рекой герои нашли свой первый фонарь.');
    await page.locator('#writerExtras > summary').click();
    await body.evaluate(el=>{el.setSelectionRange(95,95);el.scrollTop=0;el.closest('dialog').scrollTop=0;document.getElementById('modalBody').scrollTop=0});
    await take('manuscript');
    await page.locator('#writerExtras > summary').click();
    await page.locator('.cover-designer summary').click();
    await click('coverGalleryToggle');
    await page.locator('#coverGallery').scrollIntoViewIfNeeded();
    await take('cover-selection');
    await page.locator('#writerExtras > summary').click();
    await click('writerGallery');
    await page.locator('#writerArtShelf').scrollIntoViewIfNeeded();
    await take('writer-gallery');
    await click('writerGallery');
    record.typedFrameMs=await page.evaluate(async()=>{const body=$('storyBody');body.focus();const t=performance.now();body.setRangeText(' ',95,95,'end');body.dispatchEvent(new Event('input',{bubbles:true}));await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return performance.now()-t});
    await page.evaluate(async()=>{
      const text=$('storyBody');text.focus();text.setSelectionRange(0,0);
      writerViewportFit({width:innerWidth,height:230,offsetTop:0,scale:1});
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      text.scrollTop=0;
    });
    await take('keyboard',{clip:{x:0,y:0,width,height:230}});
    await page.evaluate(()=>writerViewportFit(window.visualViewport));
    const openStart=Date.now();
    await click('drawStory');
    const canvas=page.locator('#drawingCanvas');
    await canvas.scrollIntoViewIfNeeded();
    record.canvasOpenMs=Date.now()-openStart;
    const r=await canvas.boundingBox(),x=r.x+r.width*.40,y=r.y+r.height*.40;
    await page.mouse.move(x,y);await page.mouse.down();
    for(let i=0;i<=60;i++) await page.mouse.move(x+i*r.width/220,y+Math.sin(i/10)*14);
    await page.mouse.up();await take('canvas');
    await click('drawingExpand');await take('fullscreen');
    const detail=page.locator('#drawingDetail');
    if(await detail.getAttribute('aria-pressed')==='false')await detail.click();
    await take('zoom');
    await click('studioPro');await take('palette');await click('studioProClose');
    await click('drawingExpand');
    const returnStart=Date.now();await click('drawingSave');await page.locator('#storyBody').waitFor();
    record.canvasReturnMs=Date.now()-returnStart;
    await page.locator('#imageTray').scrollIntoViewIfNeeded();await take('insert');
    await click('publishFamily');await take('family');await click('cancelFamilyPublish');
    await click('publishStory');
    const card=page.locator('.own-book').filter({hasText:'Атлас серебряной реки'}).first();
    await card.waitFor();
    const release=await page.evaluate(()=>APP_RELEASE);
    record.release=release;
    if(release==='1.5.208'){
      // Historical baseline is captured as-is, including its known owl overlay.
      const cover=card.locator('.shelf-cover-art');
      if(await cover.count())await cover.waitFor({state:'visible'});
    }else{
      assert.equal(await card.locator('.shelf-cover-art').count(),0,'no identical owl overlay on authored books');
    }
    await card.locator('.cover-picture').waitFor({state:'visible'});
    await page.locator('#toast').waitFor({state:'hidden'});
    await take('shelf');
    await card.locator('.own-read').click();
    await page.locator('#ownReadText').waitFor();await take('book');
    const contents=page.locator('#ownReadContents');
    const navigation=await contents.count()?contents:page.locator('#ownReadJump');
    if(await contents.count())await take('book-contents');
    for(const [label,name,visible] of [['Глава у звёздной реки','chapter','#ownReadText'],['Рисунок 1','book-image','#ownReadArt img']]){
      const option=navigation.locator('option').filter({hasText:label}).first();
      await navigation.selectOption(await option.getAttribute('value'));
      await page.locator(visible).waitFor();
      await take(name);
    }
    await click('ownReadBack');await click('home');
    for(const [id,name] of [['readingEntry','reading'],['homeMath','math'],['homeLogic','logic'],['childWorld','world']]){
      await openFromHome(id);await take(name);await page.goto(site);
    }
    await click('homeNewStory');
    await page.locator('#storyBody').fill(paragraph);
    await click('saveStoryNow');
    assert.equal(await page.locator('#homeWrite strong').textContent(),'Продолжить сказку');
    await take('home-resume');
    fs.writeFileSync(path.join(dir,'entries.json'),JSON.stringify(record,null,2));
    return {dir,release};
  } finally { await page.close(); }
}
async function compare(browser,before,after) {
  const names=dir=>fs.readdirSync(dir).filter(file=>file.endsWith('.png')).sort();
  assert.deepEqual(names(after.dir),names(before.dir),'Visual screen coverage has changed');
  const page=await browser.newPage();
  const metrics={};
  try {
    for(const name of names(before.dir)){
      const data=ref=>'data:image/png;base64,'+fs.readFileSync(path.join(ref.dir,name)).toString('base64');
      metrics[name]=await page.evaluate(async ([first,second])=>{
        async function pixels(source){
          const img=new Image();img.src=source;await img.decode();
          const sheet=document.createElement('canvas');sheet.width=img.width;sheet.height=img.height;
          const ctx=sheet.getContext('2d');ctx.drawImage(img,0,0);
          return [sheet.width,sheet.height,ctx.getImageData(0,0,sheet.width,sheet.height).data];
        }
        const [w,h,a]=await pixels(first),[w2,h2,b]=await pixels(second);
        if(w!==w2||h!==h2)throw Error('Screenshot dimensions differ');
        let changed=0;
        for(let i=0;i<a.length;i+=4){
          if(Math.max(Math.abs(a[i]-b[i]),Math.abs(a[i+1]-b[i+1]),Math.abs(a[i+2]-b[i+2]))>20)changed++;
        }
        return {pixels:changed,percent:100*changed/(w*h)};
      },[data(before),data(after)]);
    }
  } finally {await page.close()}
  return metrics;
}

async function waitForSite(site) {
  for(let attempt=0;attempt<30;attempt++){
    try{if((await fetch(site,{signal:AbortSignal.timeout(1000)})).ok)return}catch(error){}
    await new Promise(resolve=>setTimeout(resolve,150));
  }
  throw Error('Visual server did not start: '+site);
}

(async()=>{
  await Promise.all([url,baseline].filter(Boolean).map(waitForSite));
  const browser=await engine.launch();
  const failures=[];
  try {
    for(const [w,h] of sizes){
      const before=baseline&&await capture(browser,baseline,path.join(destination,'before'),w,h);
      const after=await capture(browser,url,path.join(destination,'after'),w,h);
      if(!before)continue;
      const metrics=await compare(browser,before,after);
      fs.writeFileSync(path.join(after.dir,'differences.json'),JSON.stringify(metrics,null,2)+'\n');
      for(const [name,{percent}] of Object.entries(metrics)){
        const threshold=visualLimit(before.release,after.release,name,w,h);
        if(percent>threshold)failures.push(w+'×'+h+' '+name+' '+percent.toFixed(3)+'% > '+threshold+'%');
      }
    }
    if(failures.length){
      console.log('VISUAL DIFFERENCES\n'+failures.join('\n'));
      throw Error('Visual changes exceed reviewed thresholds');
    }
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1});
