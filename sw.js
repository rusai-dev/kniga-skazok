/* Network-first offline shell; lazily cache immutable book images. No user data is touched. */
'use strict';
const CACHE='skazki-shell-v3',ART_CACHE='skazki-book-assets-v1';
const ROOT=new URL('./',self.registration.scope).href,INDEX=new URL('index.html',ROOT).href;
const STATIC=['classic-art-153.js','classic-art-155.js','andersen-art-156.js','learning-art-1536.css'].map(x=>new URL(x,ROOT).href);
const BOOKS=new Set(['classic-cinder-1.jpg','classic-cinder-3.jpg','classic-cinder-7.jpg','classic-cinder-11.jpg','historic-pea-morning.jpg','historic-wind1.jpg','historic-wind2.jpg','historic-sunny.jpg','andersen-pea-journey.webp','andersen-pea-rain.webp','andersen-pea-bed.webp','andersen-pea-morning.webp','premium-coloring.png','premium-storybook.webp'].map(x=>new URL('assets/books/'+x,ROOT).href));
async function fresh(url){return fetch(url,{cache:'no-store',credentials:'same-origin'})}
async function remember(cache,key,response){if(response.ok){try{await cache.put(key,response.clone())}catch(e){}}return response}
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const responses=await Promise.all([INDEX,...STATIC].map(fresh));if(responses.some(x=>!x.ok))throw Error('shell');
 const cache=await caches.open(CACHE);await Promise.all(responses.map((response,i)=>cache.put([INDEX,...STATIC][i],response)));await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url),base=new URL(ROOT);if(req.method!=='GET'||url.origin!==base.origin)return;
 if(BOOKS.has(url.href)){event.respondWith((async()=>{const cache=await caches.open(ART_CACHE),saved=await cache.match(url.href);if(saved)return saved;return remember(cache,url.href,await fetch(req))})());return}
 if(STATIC.includes(url.href)){event.respondWith((async()=>{const cache=await caches.open(CACHE),saved=await cache.match(url.href);if(saved)return saved;return remember(cache,url.href,await fresh(url.href))})());return}
 if((url.pathname!==base.pathname&&url.pathname!==new URL(INDEX).pathname)||req.mode!=='navigate')return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  try{const response=await fresh(req.url);if(response.ok&&/text\/html/i.test(response.headers.get('content-type')||''))return remember(cache,INDEX,response);if(response.status<500)return response;throw Error('network')}
  catch(e){return await cache.match(INDEX)||await caches.match(INDEX,{cacheName:'skazki-shell-v2'})||await caches.match(INDEX,{cacheName:'skazki-shell-v1'})||new Response('Открой Книгу сказок с интернетом один раз.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}})}
 })());
});
