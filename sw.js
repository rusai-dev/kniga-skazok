/* Versioned offline shell; lazy artwork cache. Never modify user storage. */
'use strict';
const REV='1.5.100',CACHE='skazki-shell-'+REV,ART_CACHE='skazki-book-art-v1';
const ROOT=new URL('./',self.registration.scope).href,INDEX=new URL('index.html',ROOT).href;
const LEGACY_CORE=['classic-art-153.js','classic-art-155.js','andersen-art-156.js','learning-art-1536.css'].map(name=>new URL(name,ROOT).href);
const UI_SPRITES=['assets/ui/home-sprite-1548.webp','assets/ui/learning-sprite-1536.webp'].map(name=>new URL(name,ROOT).href);
const CORE=[...LEGACY_CORE.map(url=>url+'?v='+REV),...UI_SPRITES];
const ART=new Set(['andersen-pea-bed.webp','andersen-pea-journey.webp','andersen-pea-morning.webp','andersen-pea-rain.webp','classic-cinder-1.jpg','classic-cinder-11.jpg','classic-cinder-3.jpg','classic-cinder-7.jpg','historic-pea-morning.jpg','historic-sunny.jpg','historic-wind1.jpg','historic-wind2.jpg','premium-coloring.png','premium-storybook.webp'].map(name=>new URL('assets/books/'+name,ROOT).href));
async function fresh(url){return fetch(url,{cache:'no-store',credentials:'same-origin'})}
function isHTML(r){return r.ok&&/text\/html/i.test(r.headers.get('content-type')||'')}
function isImage(r){return r.ok&&/^image\//i.test(r.headers.get('content-type')||'')}
async function find(name,key){try{return await (await caches.open(name)).match(key)}catch(e){return undefined}}
async function save(name,key,r){try{await (await caches.open(name)).put(key,r.clone())}catch(e){/* Quota failure must never prevent opening a valid response. */}}
async function sameRelease(r){return isHTML(r)&&(await r.clone().text()).includes('<footer>Книга сказок · версия '+REV+'</footer>')}
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const responses=await Promise.all([INDEX,...CORE].map(fresh));
 if(!await sameRelease(responses[0])||responses.slice(1).some(r=>!r.ok)||responses.slice(-UI_SPRITES.length).some(r=>!isImage(r)))throw Error('Incomplete release');
 const cache=await caches.open(CACHE);
 await Promise.all([INDEX,...CORE].map((url,i)=>cache.put(url,responses[i])));
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url),base=new URL(ROOT);
 if(req.method!=='GET'||url.origin!==base.origin)return;
 if(CORE.includes(url.href)){
  event.respondWith((async()=>{const cached=await find(CACHE,url.href);if(cached)return cached;const r=await fresh(url.href);if(r.ok)await save(CACHE,url.href,r);return r})());return;
 }
 if(LEGACY_CORE.includes(url.href)){
  // Old cached HTML uses bare URLs; retain its offline fallback during migration.
  event.respondWith((async()=>{try{return await fresh(url.href)}catch(e){return await find('skazki-shell-v2',url.href)||await find('skazki-shell-v1',url.href)||Response.error()}})());return;
 }
 if(ART.has(url.href)){
  event.respondWith((async()=>{const cached=await find(ART_CACHE,url.href);if(cached)return cached;const r=await fresh(url.href);if(isImage(r))await save(ART_CACHE,url.href,r);return r})());return;
 }
 if(req.mode!=='navigate'||(url.pathname!==base.pathname&&url.pathname!==new URL(INDEX).pathname))return;
 event.respondWith((async()=>{
  try{const r=await fresh(req.url);if(r.ok)return r;if(r.status<500)return r;throw Error('network')}
  catch(e){return await find(CACHE,INDEX)||await find('skazki-shell-v2',INDEX)||await find('skazki-shell-v1',INDEX)||new Response('Открой Книгу сказок с интернетом один раз.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}})}
 })());
});
