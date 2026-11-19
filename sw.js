/* Offline shell, no stories are transmitted or cached as network requests. */
'use strict';
const CACHE='skazki-shell-v1';
const ROOT=new URL('./',self.registration.scope).href;
const INDEX=new URL('index.html',ROOT).href;
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{const response=await fetch(INDEX,{cache:'reload'});if(!response.ok)throw Error('shell');const cache=await caches.open(CACHE);await cache.put(INDEX,response);await self.skipWaiting()})());
});
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url),base=new URL(ROOT);
 if(req.method!=='GET'||url.origin!==base.origin||url.pathname!==base.pathname&&url.pathname!==new URL(INDEX).pathname||req.mode!=='navigate')return;
 event.respondWith((async()=>{try{const response=await fetch(req);if(response.ok){try{const cache=await caches.open(CACHE);await cache.put(INDEX,response.clone())}catch(e){}return response}return response}catch(e){const saved=await caches.match(INDEX,{cacheName:CACHE});return saved||new Response('Открой Книгу сказок с интернетом один раз.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}})}})());
});
