'use strict';
// R14: two real same-origin tabs, synthetic drafts, no user data.
// Detect another tab's write before typing; refuse a stale overwrite and retain rescue.
const assert=require('node:assert/strict');
module.exports=async function verifyWriterTabConflict(browser,url){
 const ctx=await browser.newContext({serviceWorkers:'block'});
 try{
  const [a,b]=await Promise.all([ctx.newPage(),ctx.newPage()]);
  await Promise.all([a.goto(url),b.goto(url)]);
  await Promise.all([a.locator('#homeWrite').click(),b.locator('#homeWrite').click()]);
  const original='Белочка написала сказку в первой вкладке.';
  await a.locator('#storyBody').fill(original);
  await b.waitForFunction(()=>document.querySelector('#storyForm')?.dataset.saveFailed==='yes');
  assert.match(await b.locator('#draftStatus').textContent(),/другой вкладке/i);
  assert.equal(await b.locator('#rescueDraft').isVisible(),true,'export rescue is visible before the child types');
  const before=await a.evaluate(()=>localStorage.getItem(KEY));
  const text='Сова написала другую сказку во второй вкладке.';
  await b.locator('#storyBody').fill(text);
  assert.equal(await b.locator('#storyBody').inputValue(),text,'stale text remains in the editor for export');
  assert.equal(await b.locator('#rescueDraft').isVisible(),true,'failed write preserves rescue');
  assert.equal(await b.evaluate(()=>localStorage.getItem(KEY)),before,'stale tab cannot overwrite another tab');
  await b.locator('#close').click();
  assert.equal(await b.locator('#modal').evaluate(m=>m.hasAttribute('open')),true,'back must not silently abandon the stale editor');
  assert.match(await b.locator('#draftStatus').textContent(),/другой вкладке/i);
  // A reload is allowed only after confirming the first tab's data is durable.
  assert.ok(JSON.parse(before).drafts&&Object.values(JSON.parse(before).drafts).some(d=>d.body===original));
  await b.reload();
  assert.equal(await b.evaluate(expected=>Object.values(data.drafts||{}).some(d=>d.body===expected),original),true,
    'latest saved draft survives reload after the rejected stale write');
  // A passive, unchanged tab may leave safely; only an edited stale tab is blocked.
  await b.locator('#homeWrite').click();
  const continued=original+' А потом встретила сову.';
  await a.locator('#storyBody').fill(continued);
  await b.waitForFunction(()=>document.querySelector('#draftStatus')?.textContent.includes('В другой вкладке сохранены изменения.'));
  await b.locator('#close').click();
  assert.equal(await b.locator('#modal').evaluate(m=>m.hasAttribute('open')),false,
    'unchanged stale editor must be allowed to close');
  await b.reload();
  assert.equal(await b.evaluate(expected=>Object.values(data.drafts||{}).some(d=>d.body===expected),continued),true,
    'passive stale tab closing must not revert a newer draft');
  console.log('PASS R14 two-tab conflict warning, safe refusal, rescue and safe passive exit',process.env.BROWSER);
 }finally{await ctx.close()}
};
