/* Network-first offline shell. Never delete user library data. */
'use strict';
const CACHE='skazki-shell-v2';
const ROOT=new URL('./',self.registration.scope).href,INDEX=new URL('index.html',ROOT).href,CLASSIC_ART=new URL('classic-art-153.js',ROOT).href;
async function fresh(url){return fetch(url,{cache:'no-store',credentials:'same-origin'})}
async function remember(response){if(response.ok&&/text\/html/i.test(response.headers.get('content-type')||'')){try{const cache=await caches.open(CACHE);await cache.put(INDEX,response.clone())}catch(e){}}}
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const response=await fresh(INDEX);if(!response.ok)throw Error('shell');
 const art=await fresh(CLASSIC_ART);if(!art.ok)throw Error('illustrations');const cache=await caches.open(CACHE);await cache.put(CLASSIC_ART,art);await remember(response);await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url),base=new URL(ROOT);
 if(req.method==='GET'&&url.href===CLASSIC_ART){event.respondWith((async()=>{const cache=await caches.open(CACHE),cached=await cache.match(CLASSIC_ART);if(cached)return cached;const response=await fresh(CLASSIC_ART);if(response.ok)await cache.put(CLASSIC_ART,response.clone());return response})());return}
 if(req.method!=='GET'||url.origin!==base.origin||(url.pathname!==base.pathname&&url.pathname!==new URL(INDEX).pathname)||req.mode!=='navigate')return;
 event.respondWith((async()=>{
  try{const response=await fresh(req.url);if(response.ok){await remember(response);return response}if(response.status<500)return response;throw Error('network')}
  catch(e){return await caches.match(INDEX,{cacheName:CACHE})||await caches.match(INDEX,{cacheName:'skazki-shell-v1'})||new Response('Открой Книгу сказок с интернетом один раз.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}})}
 })());
});
