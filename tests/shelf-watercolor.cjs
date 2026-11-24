'use strict';
// P1 R07/R15/R17 — verify real personal-book cards without touching children's data.
// Each case runs in a fresh browser context with synthetic fiction only.
const assert=require('node:assert/strict');
module.exports=async function verifyWatercolorShelf(browser,url){
 const ctx=await browser.newContext({serviceWorkers:'block'});
 const page=await ctx.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 const title='Волшебная полка — проверка 200';
 try {
  await page.setViewportSize({width:1024,height:768});
  await page.goto(url);
  await page.locator('#homeBooks').click();
  assert.equal(await page.locator('#libraryHome').isVisible(),true);
  assert.equal(await page.locator('#libraryHome').getAttribute('data-own-shelf'),'true');
  await page.locator('#ownShelfNew').click();
  await page.locator('#storyTitle').fill(title);
  await page.locator('#storyBody').fill('Белочка нашла фиолетовую книгу. В ней было три добрых рисунка.');
  await page.locator('#writerExtras > summary').click();
  await page.locator('#storyChapters summary').click();
  const body=page.locator('#storyBody');
  for(const [name,text] of [['Тихая река','Через реку вёл деревянный мост.'],['Звёздный сад','В саду горел фонарь.']]){
    await page.locator('#newChapterTitle').fill(name);
    await page.locator('#appendChapter').click();
    await body.fill(await body.inputValue()+text);
  }
  await page.locator('#writerExtras > summary').click();
  await page.locator('#drawStory').click();
  await page.locator('#drawingCanvas').click({position:{x:45,y:45}});
  await page.locator('#drawingSave').click();
  await page.locator('#imageTray [data-cover-pic]').click();
  await page.locator('#publishStory').click();
  const card=page.locator('#libraryHome[data-own-shelf="true"] .own-book').filter({hasText:title}).first();
  await card.waitFor({timeout:15000});
  assert.match(await card.locator('.cover-picture img').getAttribute('src'),/^data:image\/jpeg/,
    'the child-selected illustration is still used on the shelf');
  for(const [width,height] of [[1024,768],[768,1024],[390,844]]){
   await page.setViewportSize({width,height});
   await card.scrollIntoViewIfNeeded();
   const measured=await card.evaluate(el=>{
    const root=document.querySelector('#libraryHome'),cs=getComputedStyle(el);
    const elems=['.cover','.book-title','.own-read','.own-edit','.own-info'].map(sel=>{
      const e=el.querySelector(sel),r=e?.getBoundingClientRect();return {sel,w:r?.width,h:r?.height,visible:!!r&&getComputedStyle(e).display!=='none'};
    });
    return {shelf:root.dataset.ownShelf,cardColor:cs.backgroundColor,radius:parseFloat(cs.borderTopLeftRadius),
     shadow:cs.boxShadow,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
     widgets:elems,bookTitle:el.querySelector('.book-title')?.textContent,coverLabel:el.querySelector('.cover')?.getAttribute('aria-label')};
   });
   assert.equal(measured.shelf,'true');
   assert.ok(measured.radius>=18,'watercolor shelf must have rounded paper cards');
   assert.notEqual(measured.shadow,'none','shelf book card must have gentle visual depth');
   assert.ok(measured.overflow<=1,'shelf must not scroll horizontally at '+width+'x'+height);
   assert.equal(measured.bookTitle,title);
   assert.ok(measured.coverLabel.includes(title));
   for(const b of measured.widgets)assert.ok(b.visible&&b.w>=44&&b.h>=44,
     'touch target '+b.sel+' too small on '+width+'x'+height+': '+b.w+'x'+b.h);
  }
  const saved=await page.evaluate(name=>{
    const book=data.stories.find(s=>s.title===name);
    return book&&{id:book.id,title:book.title,body:book.body,theme:book.theme,rich:JSON.stringify(book.rich||null)};
  },title);
  assert.ok(saved?.id,'synthetic book must persist before reading');
  await card.locator('.own-read').click();
  await page.locator('#ownReadText').waitFor();
  const contents=page.locator('#ownReadContents');
  assert.deepEqual(await contents.locator('optgroup[label="Главы"] option').allTextContents(),['Тихая река','Звёздный сад']);
  await contents.selectOption({label:'Тихая река'});
  assert.match(await page.locator('#ownReadText').textContent(),/^Тихая река/,'contents opens at the chapter heading');
  await contents.selectOption({label:'Рисунок 1'});
  await page.locator('#ownReadArt img').waitFor();
  await page.locator('#ownReadBack').click();
  await card.locator('.own-read').click();
  await page.locator('#ownReadArt img').waitFor();
  await page.locator('#ownReadBack').click();
  await page.reload();
  const after=await page.evaluate(name=>{
    const book=data.stories.find(s=>s.title===name);
    return book&&{id:book.id,title:book.title,body:book.body,theme:book.theme,rich:JSON.stringify(book.rich||null)};
  },title);
  assert.deepEqual(after,saved,'styling and reading must never change persisted book');
  assert.deepEqual(errors,[]);
 }finally{await ctx.close()}
 console.log('PASS R07/R15 watercolor personal shelf, working book actions and reload without mutations');
};
