const assert = require('node:assert/strict');

module.exports = async function verifyFriends(browser,url) {
  const fs = require('node:fs');
  const path = require('node:path');
  const crypto = require('node:crypto');
  const assets = path.join(__dirname,'../assets/author/friends');
  const manifest = require('../assets/author/friends/heroes-manifest.json');
  assert.equal(manifest.canonical_characters.length,9);
  for (const hero of manifest.canonical_characters) {
    const original = fs.readFileSync(path.join(assets,hero.file));
    assert.equal(crypto.createHash('sha256').update(original).digest('hex'),hero.sha256);
    for (const variant of ['01','02']) {
      for (const size of ['','-288']) assert.ok(fs.statSync(path.join(assets,'hero-'+hero.id+'-scene'+variant+size+'.webp')).size > 0);
    }
  }
  const context = await browser.newContext({serviceWorkers:'block'});
  const page = await context.newPage();
  const visible = async () => {
    const img = page.locator('#homeFox img[data-scene]');
    await img.waitFor({state:'visible'});
    return img.evaluate(async el => {
      await el.decode();
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 16;
      canvas.getContext('2d').drawImage(el,0,0,16,16);
      return {hero:el.dataset.hero,scene:el.dataset.scene,src:el.currentSrc,pixels:canvas.toDataURL()};
    });
  };
  try {
    const history = [];
    for (let i=0;i<12;i++) {
      await page.goto(url);
      const current = await visible();
      for (const prior of history.slice(-3)) {
        for (const key of Object.keys(current)) assert.notEqual(current[key],prior[key]);
      }
      history.push(current);
      await page.setViewportSize({width:i%2?768:1024,height:i%2?1024:768});
      assert.deepEqual(await visible(),current);
    }
    assert.equal(new Set(history.map(x=>x.hero)).size,9);
    await page.locator('#friendsOpen').click();
    const cards = page.locator('.friends-grid article');
    assert.equal(await cards.count(),9);
    for (const card of await cards.all()) {
      const image = card.locator('img');
      await image.scrollIntoViewIfNeeded();
      await image.evaluate(img=>img.decode());
      assert.ok(await card.locator('.friend-route').isVisible());
    }
    const routes = {
      squirrel:'#storyBody', rabbit:'#drawingCanvas', owl:'#readingSearch', bat:'[data-world="bat-echo"]',
      dragon:'#storyBody', hedgehog:'#ownShelfNew', kitten:'[data-world="egypt-nile"]',
      raccoon:'[data-academy]', fawn:'[data-world="butterfly"]'
    };
    for (const [id,selector] of Object.entries(routes)) {
      await page.locator('.friends-grid article').filter({has:page.locator('[data-favorite="'+id+'"]')}).locator('.friend-route').click();
      await page.locator(selector).first().waitFor({state:'visible'});
      if (id === 'rabbit') assert.ok(await page.locator('.studio-tools .friend-tool').isVisible());
      await page.goto(url);
      await page.locator('#friendsOpen').click();
    }
    await page.locator('[data-favorite="bat"]').click();
    await page.waitForFunction(()=>document.querySelector('#homeFox img').dataset.hero==='bat');
    const bat = await visible();
    await page.reload();
    const next = await visible();
    assert.equal(next.hero,'bat');
    assert.notEqual(next.src,bat.src);
    assert.notEqual(next.pixels,bat.pixels);
    await page.route('**/friends/hero-bat-*.webp', r=>r.abort());
    await page.reload();
    await page.locator('#friendsOpen').click();
    await page.locator('[data-auto]').click();
    await page.locator('[data-close]').click();
    await visible();
    await page.locator('#homeWrite').click();
    assert.ok(await page.locator('#storyBody').isVisible());
    await page.setViewportSize({width:1024,height:768});
    await page.locator('#storyTitle').fill('Книга для проверки разворота');
    await page.locator('#storyBody').fill('В лесу звенел колокольчик. '.repeat(340));
    await page.locator('#publishStory').click();
    await page.locator('.own-book .own-read').first().click();
    const facing = page.locator('#ownReadSpread .facing-page');
    await facing.waitFor();
    const right = await facing.textContent();
    assert.ok(right.length > 10);
    const fits = await facing.evaluate(el=>el.scrollHeight<=el.clientHeight+1);
    assert.ok(fits,'second page fits');
    await page.locator('#ownReadNext').click();
    assert.equal(await page.locator('#ownReadJump').inputValue(),'2');
    await page.setViewportSize({width:390,height:700});
    await facing.waitFor({state:'detached'});
    await page.locator('#ownReadBack').click();
    await page.goto(url);
    await page.locator('#friendsOpen').click();
    await page.locator('[data-close]').click();
    console.log('PASS nine decoded heroes, twelve entries, pixel history, resize, routes, favorite, fallback and responsive personal spread');
  } finally { await context.close(); }
};
