/* Network-first offline shell. Never delete user library data. */
'use strict';
const CACHE='skazki-shell-v2';
const ROOT=new URL('./',self.registration.scope).href,INDEX=new URL('index.html',ROOT).href,CLASSIC_ART=[new URL('classic-art-153.js',ROOT).href,new URL('classic-art-155.js',ROOT).href,new URL('andersen-art-156.js',ROOT).href,new URL('learning-art-1536.css',ROOT).href];
async function fresh(url){return fetch(url,{cache:'no-store',credentials:'same-origin'})}
async function remember(response){if(response.ok&&/text\/html/i.test(response.headers.get('content-type')||'')){try{const cache=await caches.open(CACHE);await cache.put(INDEX,response.clone())}catch(e){}}}
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const response=await fresh(INDEX);if(!response.ok)throw Error('shell');
 const cache=await caches.open(CACHE);for(const url of CLASSIC_ART){const art=await fresh(url);if(!art.ok)throw Error('illustrations');await cache.put(url,art)}await remember(response);await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url),base=new URL(ROOT);
 if(req.method==='GET'&&CLASSIC_ART.includes(url.href)){event.respondWith((async()=>{const cache=await caches.open(CACHE),cached=await cache.match(url.href);if(cached)return cached;const response=await fresh(url.href);if(response.ok)await cache.put(url.href,response.clone());return response})());return}
 if(req.method!=='GET'||url.origin!==base.origin||(url.pathname!==base.pathname&&url.pathname!==new URL(INDEX).pathname)||req.mode!=='navigate')return;
 event.respondWith((async()=>{
  try{const response=await fresh(req.url);if(response.ok){await remember(response);return response}if(response.status<500)return response;throw Error('network')}
  catch(e){return await caches.match(INDEX,{cacheName:CACHE})||await caches.match(INDEX,{cacheName:'skazki-shell-v1'})||new Response('Открой Книгу сказок с интернетом один раз.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}})}
 })());
});
