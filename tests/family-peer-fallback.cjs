'use strict';
// R13: encrypted browser-to-browser fallback when the permanent archive does not exist.
// These are synthetic stories and an in-memory signaling peer, NOT a real family delivery test.
const assert=require('node:assert/strict');

module.exports=async function familyPeerFallback(browser,url){
  const context=await browser.newContext({serviceWorkers:'block'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  const secret='d'.repeat(64),book={id:'qa-direct-197',title:'Сказка о белочке',body:'Глава 1. Белочка пишет книгу.',theme:'Лес',icon:'📖',rich:{images:[]}};
  const missing=r=>r.fulfill({status:404,contentType:'text/plain',body:'not found',headers:{'access-control-allow-origin':'*'}});
  try{
    await page.route('https://raw.githubusercontent.com/**',missing);
    await page.route('https://api.github.com/repos/rusai-dev/kniga-skazok-archive/**',missing);
    await page.goto(url);
    await page.evaluate(async ({secret,book})=>{
      const {key}=await fcredentials(secret),challenge='f'.repeat(48);
      window.__qaPeerInstances=0;window.__qaDirectAck=null;
      class SyntheticConnection{
        constructor(){this.open=true;this.callbacks={};queueMicrotask(()=>this.callbacks.data?.({challenge}))}
        on(name,callback){this.callbacks[name]=callback}
        send(payload){
          Promise.resolve().then(async()=>{
            const message=await fopen(key,payload);
            if(message.type==='hello'){
              if(message.challenge!==challenge)throw Error('challenge mismatch');
              this.callbacks.data?.(await fseal(key,{type:'books',challenge,seq:1,books:[book]}));
            }else if(message.type==='ack'){window.__qaDirectAck=message}
          }).catch(error=>{window.__qaDirectError=String(error)});
        }
        close(){this.open=false;this.callbacks.close?.()}
      }
      window.Peer=class SyntheticPeer{
        constructor(){window.__qaPeerInstances++;this.open=true;this.destroyed=false;this.disconnected=false;this.events={}}
        on(name,callback){this.events[name]=callback;if(name==='open')queueMicrotask(callback)}
        connect(){return new SyntheticConnection()}
        destroy(){this.destroyed=true}
        reconnect(){}
      };
      await fstart('view',secret);
    },{secret,book});
    await page.waitForFunction(()=>window.__qaDirectAck?.saved===true,{timeout:12000});
    const received=await page.evaluate(()=>({
      direct:!!fam.peer&&!fam.ghReader,
      count:document.querySelectorAll('#familyShelf .family-book').length,
      book:fam.books[0],
      stored:JSON.parse(localStorage.getItem(fam.cache)||'[]')[0],
      calls:window.__qaPeerInstances,
      ack:window.__qaDirectAck,
      error:window.__qaDirectError||null
    }));
    assert.equal(received.direct,true,'R13 missing archive must enable direct encrypted reader');
    assert.equal(received.count,1,'R13 actual reader UI must display received story');
    assert.equal(received.book.body,book.body,'R13 full synthetic text must survive transport');
    assert.equal(received.stored.body,book.body,'R13 reader must save its received copy');
    assert.equal(received.ack.seq,1,'R13 reader must acknowledge the verified packet');
    assert.equal(received.calls,1,'R13 fallback must launch exactly one direct peer');
    assert.equal(received.error,null);

    // Once a permanent archive revision has been verified, an archive outage must
    // NOT downgrade that reader to a potentially older direct-transfer snapshot.
    await page.evaluate(async secret=>{
      const {room}=await fcredentials(secret);
      const marker='skazki-family-book-cache-'+room+'-revision';
      localStorage.setItem(marker,'7');
      window.__qaPeerInstances=0;
      await fstart('view',secret);
    },secret);
    await page.waitForFunction(()=>fam?.role==='view'&&fam.ghRevision===7&&!fam.ghBusy,{timeout:12000});
    const guarded=await page.evaluate(()=>({
      revision:fam.ghRevision,github:fam.ghReader,
      peer:!!fam.peer,calls:window.__qaPeerInstances,
      cached:fam.books[0]?.body
    }));
    assert.equal(guarded.github,true,'R13 verified archive must remain authoritative');
    assert.equal(guarded.peer,false,'R13 no P2P downgrade after verified archive');
    assert.equal(guarded.calls,0,'R13 no signaling attempt for archived high-water reader');
    assert.equal(guarded.cached,book.body,'R13 outage must preserve cached books');
    assert.deepEqual(errors,[]);
  }finally{await context.close()}
  console.log('PASS R13 encrypted direct-reader fallback after archive 404, ack, cache and no verified-revision downgrade');
};
