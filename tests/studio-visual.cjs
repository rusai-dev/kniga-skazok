// Capture the same synthetic studio session on either side of a release.
const {chromium,webkit} = require('playwright');
const path = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const [url,destination] = process.argv.slice(2);
const engine = process.env.BROWSER === 'webkit' ? webkit : chromium;
const sizes = [[1024,768],[768,1024],[1194,834],[834,1194],[1366,1024],[390,700],[390,844],[600,800]];

async function capture(browser,width,height) {
  const dir = path.join(destination,width+'x'+height);
  fs.mkdirSync(dir,{recursive:true});
  const page = await browser.newPage({viewport:{width,height},serviceWorkers:'block',reducedMotion:'reduce'});
  await page.addInitScript(() => {
    const key='skazki-friends-v1';
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key,JSON.stringify({queue:['squirrel-scene01','owl-scene01']}));
    }
  });
  const take = (name,options={}) => page.screenshot({path:path.join(dir,name+'.jpg'),quality:85,...options});
  const click = id => page.locator('#'+id).click();
  const record = {viewport:[width,height],entries:[]};
  try {
    for (let i=1;i<=2;i++) {
      await page.goto(url);
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
    await click('homeNewStory');
    await take('empty');
    const paragraph='Сова раскрыла атлас. На краю страницы поблёскивала река, а на другом берегу уже ждал зайчонок.';
    await page.locator('#storyTitle').fill('Атлас серебряной реки');
    await page.locator('#storyBody').fill((paragraph+'\n\n').repeat(90));
    await page.locator('#storyBody').evaluate(el=>{el.setSelectionRange(95,95);el.scrollTop=0});
    await take('manuscript');
    record.typedFrameMs=await page.evaluate(async()=>{const body=$('storyBody');body.focus();const t=performance.now();body.setRangeText(' ',95,95,'end');body.dispatchEvent(new Event('input',{bubbles:true}));await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return performance.now()-t});
    await page.evaluate(()=>{$('storyBody').focus();writerViewportFit({width:innerWidth,height:230,offsetTop:0,scale:1})});
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
    await click('studioPro');await take('palette');await click('studioProClose');
    await click('drawingExpand');
    const returnStart=Date.now();await click('drawingSave');await page.locator('#storyBody').waitFor();
    record.canvasReturnMs=Date.now()-returnStart;
    await page.locator('#imageTray').scrollIntoViewIfNeeded();await take('insert');
    await click('publishFamily');await take('family');await click('cancelFamilyPublish');
    await click('publishStory');
    const card=page.locator('.own-book').filter({hasText:'Атлас серебряной реки'}).first();
    await card.waitFor();await take('shelf');await card.locator('.own-read').click();
    await page.locator('#ownReadText').waitFor();await take('book');
    await click('ownReadBack');await click('home');
    for(const [id,name] of [['readingEntry','reading'],['homeMath','math'],['homeLogic','logic'],['childWorld','world']]){
      await click(id);await take(name);await page.goto(url);
    }
    await click('homeNewStory');
    await page.locator('#storyBody').fill(paragraph);
    await click('saveStoryNow');
    assert.equal(await page.locator('#homeWrite strong').textContent(),'Продолжить сказку');
    await take('home-resume');
    fs.writeFileSync(path.join(dir,'entries.json'),JSON.stringify(record,null,2));
  } finally { await page.close(); }
}
(async()=>{
  const browser=await engine.launch();
  try { for(const [w,h] of sizes) await capture(browser,w,h); }
  finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1});
