'use strict';
// Synthetic R13 transport regression: no actual family account, real server or child data.
const assert = require('node:assert/strict');
const {createHash,webcrypto} = require('node:crypto');

module.exports = async function verifyFamilyCloudRoute(browser, baseUrl) {
  const secret = 'a'.repeat(64);
  const readId = createHash('sha256').update('skazki-cloud-read-v1:' + secret).digest('hex');
  const token = 'github_pat_' + 'A'.repeat(48);
  const origin = 'https://qa-storybooks.supabase.co';
  const book = {id:'qa-family-book',title:'QA семейная сказка',body:'Только синтетический текст.',
    theme:'Лес',icon:'📖'};
  const key = await webcrypto.subtle.importKey('raw',Buffer.from(secret,'hex'),{name:'AES-GCM'},false,['encrypt']);
  const iv = Buffer.alloc(12,7);
  const cipher = Buffer.from(await webcrypto.subtle.encrypt({name:'AES-GCM',iv},key,
    Buffer.from(JSON.stringify({type:'archive',books:[book]})))).toString('base64');
  const config = {enabled:true,url:origin,publishableKey:'sb_publishable_'+'A'.repeat(36),readId};
  const remote = {revision:1,envelope:{iv:iv.toString('hex'),cipher}};
  const link = new URL(baseUrl);link.searchParams.set('view','family');link.hash='family='+secret;

  async function mockTransport(page,enabled=true) {
    const calls = {cloud:0,github:0};
    await page.route('**/family-cloud-config.json',r=>r.fulfill({status:200,contentType:'application/json',
      body:JSON.stringify(enabled?config:{enabled:false,url:'',publishableKey:'',readId:''})}));
    await page.route(origin+'/**',r=>{
      calls.cloud++;
      assert.equal(r.request().method(),'POST');
      assert.ok(r.request().url().endsWith('/rest/v1/rpc/storybook_read_v1'));
      return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(remote)});
    });
    await page.route('https://api.github.com/**',r=>{calls.github++;return r.fulfill({status:404,body:''})});
    await page.route('https://raw.githubusercontent.com/**',r=>{calls.github++;return r.fulfill({status:404,body:''})});
    return calls;
  }

  // B: isolated family reader decrypts an actual AES-GCM fixture via the cloud path.
  {
    const ctx=await browser.newContext({serviceWorkers:'block'});
    try {
      const page=await ctx.newPage();
      const calls=await mockTransport(page);
      await page.goto(link.href);
      await page.waitForFunction(()=>fam?.role==='view'&&fam?.cloud&&fam.books.length===1);
      const result=await page.evaluate(()=>({
        mode:!!fam.cloud&&!fam.ghReader,
        books:fam.books.map(b=>({id:b.id,title:b.title,body:b.body,theme:b.theme})),
        visible:document.querySelectorAll('#familyShelf .family-book').length,
        localPrivate:data.stories.length
      }));
      assert.equal(result.mode,true,'family reader must prefer configured cloud');
      assert.deepEqual(result.books,[{id:book.id,title:book.title,body:book.body,theme:book.theme}]);
      assert.equal(result.visible,1);
      assert.equal(result.localPrivate,0,'cloud reader must not import into private author library');
      assert.ok(calls.cloud>=1,'viewer must call cloud RPC');
      assert.equal(calls.github,0,'viewer must not query GitHub when configured cloud is valid');
      await page.waitForFunction(()=>!fam.cloudBusy);
      const before=await page.evaluate(()=>({
        cache:localStorage.getItem(fam.cache),
        revision:localStorage.getItem(fam.cache+'-cloud-revision')
      }));
      assert.equal(before.revision,'1','the last verified cloud revision must persist');
      // A stale cloud response, including after reload, must not erase received books.
      remote.revision=0;remote.envelope=null;
      try{
        await page.evaluate(()=>cloudTick(fam));
        const after=await page.evaluate(()=>({
          books:fam.books.map(b=>b.id),cache:localStorage.getItem(fam.cache),
          revision:localStorage.getItem(fam.cache+'-cloud-revision'),
          notice:document.querySelector('#familyViewStatus')?.textContent||''
        }));
        assert.deepEqual(after.books,[book.id],'older cloud revision must not replace a received book');
        assert.equal(after.cache,before.cache,'older cloud revision must not overwrite cached book data');
        assert.equal(after.revision,'1','verified revision cannot roll back');
        assert.ok(after.notice.includes('старую версию'),'stale remote data must produce a visible warning');
        await page.reload();
        await page.waitForFunction(()=>fam?.role==='view'&&fam?.cloud&&!fam.cloudBusy);
        assert.deepEqual(await page.evaluate(()=>fam.books.map(b=>b.id)),[book.id],
          'stale cloud data must not clear the family book after reload');
      }finally{remote.revision=1;remote.envelope={iv:iv.toString('hex'),cipher}}
    }finally{await ctx.close()}
  }

  // A: even a previously configured GitHub writer must select the same enabled cloud.
  {
    const ctx=await browser.newContext({serviceWorkers:'block'});
    try {
      const page=await ctx.newPage();
      await page.addInitScript(({secret,token})=>{
        localStorage.setItem('skazki-family-published-v3',secret);
        localStorage.setItem('skazki-github-archive-token-v1',token);
      },{secret,token});
      const calls=await mockTransport(page);
      await page.goto(baseUrl);
      await page.waitForFunction(()=>fam?.role==='host'&&fam?.cloud?.readId);
      const mode=await page.evaluate(()=>({cloud:!!fam.cloud,ghWriter:!!fam.ghWriter}));
      assert.deepEqual(mode,{cloud:true,ghWriter:false});
      assert.ok(calls.cloud>=1,'host must use configured cloud');
      assert.equal(calls.github,0,'host must not write to different GitHub archive');
    }finally{await ctx.close()}
  }

  // Legacy deployment with disabled cloud must retain the existing GitHub reader path.
  {
    const ctx=await browser.newContext({serviceWorkers:'block'});
    try {
      const page=await ctx.newPage();
      await mockTransport(page,false);
      await page.goto(link.href);
      await page.waitForFunction(()=>fam?.role==='view'&&fam?.ghReader===true);
      assert.equal(await page.evaluate(()=>Boolean(fam?.cloud)),false);
    }finally{await ctx.close()}
  }
  console.log('PASS R13 encrypted cloud family reader + matching host + disabled-config fallback');
};
