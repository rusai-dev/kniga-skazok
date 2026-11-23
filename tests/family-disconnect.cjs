'use strict';
// R13 privacy regression: "stop on this iPad" is not server-side revocation.
// Uses only a synthetic family link, never a real child's archive or credential.
const assert=require('node:assert/strict');

module.exports=async function verifyFamilyDisconnect(browser,url){
  const ctx=await browser.newContext({serviceWorkers:'block'});
  const page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  try{
    await page.goto(url);
    await page.evaluate(()=>{
      window.__qaStopSecret='e'.repeat(64);
      window.__qaStopKey='github_pat_'+'J'.repeat(40);
      window.__qaStopDestroyed=false;
      fput(FAMILY_SECRET,window.__qaStopSecret);
      fput(GH_TOKEN,window.__qaStopKey);
      fput('qa-family-remote-archive-reference','archive-is-not-revoked');
      window.__qaStopLibrary=localStorage.getItem(KEY);
      $('familyBanner').hidden=false;
      fam={role:'host',clients:new Map(),tick:null,peer:{
        destroy(){window.__qaStopDestroyed=true}
      }};
    });
    let cancelMessage='';
    page.once('dialog',async dlg=>{cancelMessage=dlg.message();await dlg.dismiss()});
    await page.locator('#familyStop').click();
    assert.ok(cancelMessage.includes('не отзывает')&&cancelMessage.includes('архив'),
      'R13 confirmation must explicitly say a previous invitation is NOT revoked');
    const cancelled=await page.evaluate(()=>({
      secret:fget(FAMILY_SECRET),
      stillConnected:!!fam&&!$('familyBanner').hidden,
      library:localStorage.getItem(KEY)
    }));
    assert.equal(cancelled.secret,'e'.repeat(64),'Cancel cannot remove family invitation');
    assert.equal(cancelled.stillConnected,true,'Cancel cannot stop the active family session');
    assert.equal(cancelled.library,await page.evaluate(()=>window.__qaStopLibrary));

    let acceptedMessage='';
    page.once('dialog',async dlg=>{acceptedMessage=dlg.message();await dlg.accept()});
    await page.locator('#familyStop').click();
    assert.ok(acceptedMessage.includes('не отзывает'));
    const stopped=await page.evaluate(()=>({
      secret:fget(FAMILY_SECRET),
      token:fget(GH_TOKEN),
      localArchiveMarker:fget('qa-family-remote-archive-reference'),
      library:localStorage.getItem(KEY),
      previousLibrary:window.__qaStopLibrary,
      stopped:fam===null,
      destroyed:window.__qaStopDestroyed,
      bannerHidden:$('familyBanner').hidden,
      toastText:document.body.innerText
    }));
    assert.equal(stopped.secret,null,'Local disconnection must remove only the local invitation');
    assert.equal(stopped.token,'github_pat_'+'J'.repeat(40),
      'Existing archive setup credentials cannot be silently erased');
    assert.equal(stopped.localArchiveMarker,'archive-is-not-revoked',
      'Local disconnect must not pretend it removed remote archives');
    assert.equal(stopped.library,stopped.previousLibrary,
      'Disconnect must never modify the personal story library');
    assert.equal(stopped.stopped,true);
    assert.equal(stopped.destroyed,true);
    assert.equal(stopped.bannerHidden,true);
    assert.ok(stopped.toastText.includes('только на этом iPad')||
      stopped.toastText.includes('старая ссылка'),'R13 final notice must not promise revocation');
    assert.deepEqual(errors,[]);
  }finally{await ctx.close()}
  console.log('PASS R13 local-only disconnect: cancellation, existing archive and personal books preserved');
};
