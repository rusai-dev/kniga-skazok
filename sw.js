/* Versioned offline shell; lazy artwork cache. Never modify user storage. */
'use strict';
const REV='1.5.187',CACHE='skazki-shell-'+REV,ART_CACHE='skazki-book-art-v1';
const ROOT=new URL('./',self.registration.scope).href,INDEX=new URL('index.html',ROOT).href;
const LEGACY_CORE=['classic-art-153.js','classic-art-155.js','andersen-art-156.js','learning-art-1536.css'].map(name=>new URL(name,ROOT).href);
const UI_SPRITES=['assets/ui/home-sprite-1548.webp','assets/ui/learning-sprite-1536.webp','assets/ui/writer-squirrel-144-v1.webp'].map(name=>new URL(name,ROOT).href);
for(const asset of ['studio-drawings.js','studio-layout.css','studio-friends.js'])LEGACY_CORE.push(new URL(asset,ROOT).href);
const CORE=[...LEGACY_CORE.map(url=>url+'?v='+REV),...UI_SPRITES];
const ART=new Set(['andersen-pea-bed.webp','andersen-pea-journey.webp','andersen-pea-morning.webp','andersen-pea-rain.webp','classic-cinder-1.jpg','classic-cinder-11.jpg','classic-cinder-3.jpg','classic-cinder-7.jpg','historic-pea-morning.jpg','historic-sunny.jpg','historic-wind1.jpg','historic-wind2.jpg','premium-coloring.png','premium-storybook.webp'].map(name=>new URL('assets/books/'+name,ROOT).href));
for(const name of ['egypt-nile-thumb-128-v1.webp','night-owl-thumb-128-v1.webp','night-bats-scene-320-v1.webp','night-bats-scene-504-v1.webp','night-roost-scene-320-v1.webp','night-roost-scene-504-v1.webp','night-owl-cover-320-v1.webp','night-owl-cover-504-v1.webp','egypt-nile-cover-320-v1.webp','egypt-nile-cover-504-v1.webp'])ART.add(new URL('assets/world/'+name,ROOT).href);
for(const name of ['library-lantern','star-journey'])ART.add(new URL('assets/author/'+name+'-v1.svg',ROOT).href);
for(const motif of ['v01-squirrel-author','v02-hedgehog-fox','v03-owl-bats','v04-rabbit-boat','n01-squirrel-writing-room','n02-rabbit-painting','n03-owl-library','n04-hedgehog-book-show'])for(const size of ['','-240'])ART.add(new URL('assets/author/studio/art-'+motif+size+'.webp',ROOT).href);
for(const motif of ['n02-rabbit-painting','n03-owl-library']) ART.add(new URL('assets/author/studio/art-'+motif+'-entry184.webp',ROOT).href);
async function fresh(url){return fetch(url,{cache:'no-store',credentials:'same-origin'})}
function isHTML(r){return r.ok&&/text\/html/i.test(r.headers.get('content-type')||'')}
function isImage(r){return r.ok&&/^image\//i.test(r.headers.get('content-type')||'')}
async function find(name,key){try{return await (await caches.open(name)).match(key)}catch(e){return undefined}}
async function save(name,key,r){try{await (await caches.open(name)).put(key,r.clone())}catch(e){/* Quota failure must never prevent opening a valid response. */}}
async function sameRelease(r){return isHTML(r)&&(await r.clone().text()).includes('<footer>Книга сказок · версия '+REV+'</footer>')}
// Versioned UI image URLs are immutable; reuse valid copies from older shells.
function olderShellNames(names,current=CACHE){
 const version=shellRevision(current);if(!version)return [];
 return names.filter(name=>{const v=shellRevision(name);return v&&compareRevision(v,version)<0})
 .sort((a,b)=>compareRevision(shellRevision(b),shellRevision(a)));
}
async function installCore(url,older){
 if(UI_SPRITES.includes(url))for(const name of older){const r=await find(name,url);if(r&&isImage(r))return r}
 return fresh(url)
}
self.addEventListener('install',event=>event.waitUntil((async()=>{
 let older=[];try{older=olderShellNames(await caches.keys())}catch(e){}
 const responses=await Promise.all([INDEX,...CORE].map(url=>installCore(url,older)));
 if(!await sameRelease(responses[0])||responses.slice(1).some(r=>!r.ok)||responses.slice(-UI_SPRITES.length).some(r=>!isImage(r)))throw Error('Incomplete release');
 const cache=await caches.open(CACHE);
 await Promise.all([INDEX,...CORE].map((url,i)=>cache.put(url,responses[i])));
 await self.skipWaiting();
})()));
// Retain the current release and two nearest older releases; never delete an
// unrelated cache, an artwork cache, legacy fallback, or an installing newer shell.
function shellRevision(name){const match=/^skazki-shell-(\d+)\.(\d+)\.(\d+)$/.exec(name);return match?match.slice(1).map(Number):null}
function compareRevision(a,b){for(let i=0;i<3;i++){if(a[i]!==b[i])return a[i]-b[i]}return 0}
function obsoleteShells(names,current=CACHE){
 return olderShellNames(names,current).slice(2);
}
async function pruneShells(){
 try{await Promise.all((obsoleteShells(await caches.keys())).map(name=>caches.delete(name).catch(()=>false)))}catch(e){/* Storage cleanup is best effort. */}
}
self.addEventListener('activate',event=>event.waitUntil((async()=>{await self.clients.claim();await pruneShells()})()));
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url),base=new URL(ROOT);
 if(req.method!=='GET'||url.origin!==base.origin)return;
 if(CORE.includes(url.href)){
  event.respondWith((async()=>{const cached=await find(CACHE,url.href);if(cached)return cached;const r=await fresh(url.href);if(r.ok)await save(CACHE,url.href,r);return r})());return;
 }
 // An older open page may still ask for a versioned core file after an update.
 const previous=url.searchParams.get('v');
 if(previous&&/^\d+\.\d+\.\d+$/.test(previous)&&url.search==='?v='+previous&&LEGACY_CORE.includes(url.origin+url.pathname)&&compareRevision(previous.split('.').map(Number),REV.split('.').map(Number))<0){
  event.respondWith((async()=>{const cached=await find('skazki-shell-'+previous,url.href);return cached||await fresh(url.href)})());return;
 }
 if(LEGACY_CORE.includes(url.href)){
  // Old cached HTML uses bare URLs; retain its offline fallback during migration.
  event.respondWith((async()=>{try{return await fresh(url.href)}catch(e){return await find('skazki-shell-v2',url.href)||await find('skazki-shell-v1',url.href)||Response.error()}})());return;
 }
 if(ART.has(url.href)||url.href.startsWith(ROOT+'assets/author/friends/hero-')&&url.pathname.endsWith('.webp')){
  event.respondWith((async()=>{const cached=await find(ART_CACHE,url.href);if(cached)return cached;const r=await fresh(url.href);if(isImage(r))await save(ART_CACHE,url.href,r);return r})());return;
 }
 if(req.mode!=='navigate'||(url.pathname!==base.pathname&&url.pathname!==new URL(INDEX).pathname))return;
 event.respondWith((async()=>{
  try{const r=await fresh(req.url);if(r.ok)return r;if(r.status<500)return r;throw Error('network')}
  catch(e){return await find(CACHE,INDEX)||await find('skazki-shell-v2',INDEX)||await find('skazki-shell-v1',INDEX)||new Response('Открой Книгу сказок с интернетом один раз.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}})}
 })());
});
