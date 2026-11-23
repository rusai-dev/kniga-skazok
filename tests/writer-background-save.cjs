'use strict';
// R03/R14: synthetic text only. Simulate IME completion without an input event,
// Safari pagehide with a final DOM value, and a rejected localStorage write.
const assert=require('node:assert/strict');
module.exports=async function verifyWriterBackground(browser,url){
 const ctx=await browser.newContext({serviceWorkers:'block'});
 try{
  const page=await ctx.newPage();
  await page.goto(url);
  await page.locator('#homeWrite').click();
  await page.locator('#storyBody').waitFor({state:'visible'});
  const result=await page.evaluate(()=>{
   const body=document.querySelector('#storyBody');
   const form=document.querySelector('#storyForm');
   const savedText=()=>Object.values(JSON.parse(localStorage.getItem(KEY)).drafts||{})
     .some(d=>d.body===body.value);
   // Safari may finish an IME composition without a further input event.
   body.value='Проверка IME: белочка нашла ёжика.';
   body.dispatchEvent(new Event('compositionend',{bubbles:true}));
   const afterIME=savedText();
   // A background transition must flush a final value even if no input is sent.
   body.value+=' После ухода в фон.';
   window.dispatchEvent(new Event('pagehide'));
   const afterPagehide=savedText();
   const beforeQuota=localStorage.getItem(KEY);
   const original=Storage.prototype.setItem;
   body.value+=' Попытка при заполненной памяти.';
   try{
    Storage.prototype.setItem=function(k,v){if(k===KEY)throw Error('QA quota');return original.call(this,k,v)};
    window.dispatchEvent(new Event('pagehide'));
   }finally{Storage.prototype.setItem=original}
   const refused=form.dataset.saveFailed==='yes'&&localStorage.getItem(KEY)===beforeQuota;
   window.dispatchEvent(new Event('pagehide'));
   const retried=form.dataset.saveFailed==='no'&&savedText();
   return {afterIME,afterPagehide,refused,retried,text:body.value};
  });
  assert.equal(result.afterIME,true,'IME completion must persist text without a trailing input event');
  assert.equal(result.afterPagehide,true,'pagehide must flush the final unsignalled DOM text');
  assert.equal(result.refused,true,'quota failure must preserve previous saved content and report failure');
  assert.equal(result.retried,true,'successful pagehide retry must persist the unsaved content');
  // Closing a story must flush unsignalled DOM text (Safari/IME) and stay open on quota failure.
  const exit=await page.evaluate(()=>{
   const body=document.querySelector('#storyBody'),modal=document.querySelector('#modal');
   const before=localStorage.getItem(KEY),original=Storage.prototype.setItem;
   body.value+=' Последняя фраза перед закрытием без input.';
   let blocked=false,unchanged=false;
   try{
    Storage.prototype.setItem=function(k,v){if(k===KEY)throw Error('QA close quota');return original.call(this,k,v)};
    closeModal();
    blocked=modal.hasAttribute('open')&&document.querySelector('#storyForm').dataset.saveFailed==='yes';
    unchanged=localStorage.getItem(KEY)===before;
   }finally{Storage.prototype.setItem=original}
   closeModal();
   const saved=Object.values(JSON.parse(localStorage.getItem(KEY)).drafts||{})
     .some(d=>d.body===body.value);
   return {blocked,unchanged,closed:!modal.hasAttribute('open'),saved,text:body.value};
  });
  assert.equal(exit.blocked,true,'failed final save must block closing the story editor');
  assert.equal(exit.unchanged,true,'failed final save must preserve previous draft');
  assert.equal(exit.closed,true,'retry after storage recovery must allow closing');
  assert.equal(exit.saved,true,'closing without an input event must persist last DOM text');
  await page.reload();
  const durable=await page.evaluate(text=>Object.values(data.drafts||{})
   .some(d=>d.body===text),result.text);
  assert.equal(durable,true,'reloaded private draft must include the last recovered sentence');
  console.log('PASS R03/R14 IME, pagehide, guarded close, quota rollback and reload',process.env.BROWSER);
 }finally{await ctx.close()}
};
