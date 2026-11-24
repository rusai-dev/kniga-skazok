/* Versioned offline shell; lazy artwork cache. Never modify user storage. */
'use strict';
const REV='1.5.207',ART_CACHE='skazki-book-art-v1';
// BEGIN GENERATED SHELL INTEGRITY
const SHELL_FINGERPRINT='4b3c5b2dc8a2105aa73a3093';
const SHELL_SHA256={
  "index.html": "b7e8b87ee6261281f1f7c92e5b13eca6a7bf915a05b35c546cb2fa042b294315",
  "classic-art-153.js?v=1.5.207": "ce3eb9bf5f6715427bb27c4180a831f112fb454725995dd4ae1b95beebf141a9",
  "classic-art-155.js?v=1.5.207": "53ac42495ae327c0ac1202cb9dba26e47763248b2ceba7bc2886b792e8eb55b8",
  "andersen-art-156.js?v=1.5.207": "3be52eebc1c3c16a7c6bd53773789c0c2814cc243b970d84e4d1f4a57487e86b",
  "learning-art-1536.css?v=1.5.207": "ab5b6e9a78ca081852cf233ba970b45be5672a80401719aca07414f00ea73fd7",
  "world-scenes-194.js?v=1.5.207": "22896c7cbedb1baab8a76e14b4832beee49926ffe394542bc84591b1086ccbe4",
  "studio-drawings.js?v=1.5.207": "05111d4188b328e1cd2c7cf5465b4ff5da111618cc04d88c590ef71c9bae536f",
  "studio-layout.css?v=1.5.207": "acddc9e0a1decaa03d53be13a52db8932fc4088840cd3208e518c1d86039daeb",
  "studio-friends.js?v=1.5.207": "cedc82a759532ba7fea6ef9777010c0a639d881665c0815ed975c04ec4453858",
  "studio-engine-208.js?v=1.5.207": "e4aec822e3b02ef21e860134e320ce1e2db8a5d8545b26c1a328ca0802696eb7",
  "studio-project-store.js?v=1.5.207": "f09851d42ecdc0bb2bc344e97b81c2a8aa4ac586d3cbdfce5a071314b5d47767",
  "studio-filters-208.js?v=1.5.207": "876af4646662f37098a88230a22d337eaf32ca962819cf7a180b8cd3129b4625",
  "assets/ui/home-sprite-1548.webp": "1e974ad768ec11b50d63b52675b99621b6d28667e22f06bbcb318bcb687a3ed8",
  "assets/ui/learning-sprite-1536.webp": "e4b8ec07f3417b50023021aa542de958db0a4df397864b5687da50584e9208fd",
  "assets/ui/writer-squirrel-144-v1.webp": "e6a651bf88b4dc69ad11cf2af471bf27a4fca021dcca06cd91b28f9bf800c0ee",
  "assets/author/studio/home-storybook-banner-560.webp": "84a08d3507e802e7d5286b222bf40d4786e011e883ae573a57c7cb828f38c3e6",
  "assets/author/studio/home-egypt-cat-320x120.webp?v=206": "af8e75714e128470c3381676c62ece1e22c32d228c41022e6a018e34ee63db49"
};
// END GENERATED SHELL INTEGRITY
const ROOT=new URL('./',self.registration.scope).href,INDEX=new URL('index.html',ROOT).href;
const CACHE='skazki-shell-'+REV+'-'+SHELL_FINGERPRINT;
const READY=new URL('__skazki_shell_verified__',ROOT).href;
const LEGACY_CORE=['classic-art-153.js','classic-art-155.js','andersen-art-156.js','learning-art-1536.css','world-scenes-194.js'].map(name=>new URL(name,ROOT).href);
const UI_SPRITES=['assets/ui/home-sprite-1548.webp','assets/ui/learning-sprite-1536.webp','assets/ui/writer-squirrel-144-v1.webp','assets/author/studio/home-storybook-banner-560.webp','assets/author/studio/home-egypt-cat-320x120.webp?v=206'].map(name=>new URL(name,ROOT).href);
for(const asset of ['studio-drawings.js','studio-layout.css','studio-friends.js'])LEGACY_CORE.push(new URL(asset,ROOT).href);
const VERSIONED_CORE=[...LEGACY_CORE,...['studio-engine-208.js','studio-project-store.js','studio-filters-208.js'].map(name=>new URL(name,ROOT).href)];
const CORE=[...VERSIONED_CORE.map(url=>url+'?v='+REV),...UI_SPRITES];
const RELEASE_URLS=[INDEX,...CORE];
const ART=new Set(['andersen-pea-bed.webp','andersen-pea-journey.webp','andersen-pea-morning.webp','andersen-pea-rain.webp','classic-cinder-1.jpg','classic-cinder-11.jpg','classic-cinder-3.jpg','classic-cinder-7.jpg','historic-pea-morning.jpg','historic-sunny.jpg','historic-wind1.jpg','historic-wind2.jpg','premium-coloring.png','premium-storybook.webp'].map(name=>new URL('assets/books/'+name,ROOT).href));
for(const name of ['egypt-nile-thumb-128-v1.webp','night-owl-thumb-128-v1.webp','night-bats-scene-320-v1.webp','night-bats-scene-504-v1.webp','night-roost-scene-320-v1.webp','night-roost-scene-504-v1.webp','night-owl-cover-320-v1.webp','night-owl-cover-504-v1.webp','egypt-nile-cover-320-v1.webp','egypt-nile-cover-504-v1.webp'])ART.add(new URL('assets/world/'+name,ROOT).href);
for(const name of ['library-lantern','star-journey'])ART.add(new URL('assets/author/'+name+'-v1.svg',ROOT).href);
for(const motif of ['v01-squirrel-author','v02-hedgehog-fox','v03-owl-bats','v04-rabbit-boat','n01-squirrel-writing-room','n02-rabbit-painting','n03-owl-library','n04-hedgehog-book-show'])for(const size of ['','-240'])ART.add(new URL('assets/author/studio/art-'+motif+size+'.webp',ROOT).href);
for(const motif of ['n02-rabbit-painting','n03-owl-library']) ART.add(new URL('assets/author/studio/art-'+motif+'-entry184.webp',ROOT).href);
ART.add(new URL('assets/author/studio/home-egypt-cat-320x120.webp',ROOT).href);
async function fresh(url){return fetch(url,{cache:'no-store',credentials:'same-origin'})}
function isHTML(r){return r.ok&&/text\/html/i.test(r.headers.get('content-type')||'')}
function isImage(r){return r.ok&&/^image\//i.test(r.headers.get('content-type')||'')}
async function find(name,key){try{return await caches.match(key,{cacheName:name})}catch(e){return undefined}}
async function save(name,key,r){try{await (await caches.open(name)).put(key,r.clone())}catch(e){/* Quota failure must never prevent opening a valid response. */}}
async function sealed(name){
 const marker=await find(name,READY);
 return !!marker&&(await marker.text())===name.slice(-24);
}
async function verifiedResource(url,response){
 if(!response?.ok)return false;
 const name=url.slice(ROOT.length),pathname=new URL(url).pathname;
 const contentType=response.headers.get('content-type')||'';
 const validType=pathname.endsWith('.html')?isHTML(response):pathname.endsWith('.css')?/^text\/css\b/i.test(contentType):
  pathname.endsWith('.js')?/^(?:text|application)\/(?:x-)?(?:java|ecma)script\b/i.test(contentType):/^image\/webp\b/i.test(contentType);
 if(!validType||!SHELL_SHA256[name])return false;
 const hash=new Uint8Array(await crypto.subtle.digest('SHA-256',await response.clone().arrayBuffer()));
 return Array.from(hash,byte=>byte.toString(16).padStart(2,'0')).join('')===SHELL_SHA256[name];
}
// Versioned UI image URLs are immutable; reuse valid copies from older shells.
function olderShellNames(names,current=CACHE){
 const version=shellRevision(current);if(!version)return [];
 return names.filter(name=>{const v=shellRevision(name);return v&&compareRevision(v,version)<0})
 .sort((a,b)=>compareRevision(shellRevision(b),shellRevision(a)));
}
async function installCore(url,older){
 if(UI_SPRITES.includes(url))for(const name of older){const r=await find(name,url);if(await verifiedResource(url,r))return r}
 return fresh(url)
}
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const alreadyVerified=await sealed(CACHE);
 const retained=alreadyVerified?await Promise.all(RELEASE_URLS.map(async url=>{
  const response=await find(CACHE,url);
  return await verifiedResource(url,response)?response:null;
 })):[];
 if(retained.length&&retained.every(Boolean))return;
 const older=olderShellNames(await caches.keys());
 const responses=await Promise.all(RELEASE_URLS.map(async(url,index)=>{
  if(retained[index])return null;
  const response=await installCore(url,older);
  if(!await verifiedResource(url,response))throw Error('Invalid release resource: '+url);
  return response;
 }));
 try{
  const cache=await caches.open(CACHE);
  for(const [index,url] of RELEASE_URLS.entries())if(responses[index])await cache.put(url,responses[index]);
  await cache.put(READY,new Response(SHELL_FINGERPRINT));
 }catch(error){
  if(!alreadyVerified)await caches.delete(CACHE).catch(()=>false);
  throw error;
 }
 // Natural activation waits for all clients of the preceding worker to close.
})()));
// Retain the current release and two nearest older releases; never delete an
// unrelated cache, an artwork cache, legacy fallback, or an installing newer shell.
function shellRevision(name){const match=/^skazki-shell-(\d+)\.(\d+)\.(\d+)(?:-[a-f0-9]{24})?$/.exec(name);return match?match.slice(1).map(Number):null}
function compareRevision(a,b){for(let i=0;i<3;i++){if(a[i]!==b[i])return a[i]-b[i]}return 0}
function obsoleteShells(names,current=CACHE){
 const older=olderShellNames(names,current);
 const keep=new Set([...new Set(older.map(name=>shellRevision(name).join('.')))].slice(0,2));
 return older.filter(name=>!keep.has(shellRevision(name).join('.')));
}
async function pruneShells(){
 try{await Promise.all((obsoleteShells(await caches.keys())).map(name=>caches.delete(name).catch(()=>false)))}catch(e){/* Storage cleanup is best effort. */}
}
self.addEventListener('activate',event=>event.waitUntil((async()=>{await self.clients.claim();await pruneShells()})()));
function unavailable(status=503){
 return new Response(status===503?'Не удалось открыть проверенную версию. Подключись к интернету, закрой все вкладки «Книги сказок» и открой её снова.':null,
  {status,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}});
}
async function serveRelease(url){
 const cached=await find(CACHE,url);
 if(cached)return cached;
 try{
  const response=await fresh(url);
  if(await verifiedResource(url,response)){await save(CACHE,url,response);return response}
 }catch(error){}
 return unavailable();
}
async function previousRelease(revision,url){
 const plain='skazki-shell-'+revision;
 let match;
 for(const name of await caches.keys()){
  if(name!==plain&&(!name.startsWith(plain+'-')||!shellRevision(name)||!await sealed(name)))continue;
  const response=await find(name,url);
  if(!response)continue;
  if(match)return unavailable(410);
  match=response;
 }
 return match||unavailable(410);
}
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url),base=new URL(ROOT);
 if(req.method!=='GET'||url.origin!==base.origin)return;
 if(CORE.includes(url.href)){
  event.respondWith(serveRelease(url.href));return;
 }
 // An older open page may still ask for a versioned core file after an update.
 const previous=url.searchParams.get('v');
 if(previous&&/^\d+\.\d+\.\d+$/.test(previous)&&url.search==='?v='+previous&&url.pathname.startsWith(base.pathname)&&/\.(?:js|css)$/.test(url.pathname)){
  const older=compareRevision(previous.split('.').map(Number),REV.split('.').map(Number))<0;
  event.respondWith(older?previousRelease(previous,url.href):Promise.resolve(unavailable(410)));return;
 }
 if(LEGACY_CORE.includes(url.href)){
  // Old cached HTML uses bare URLs; retain its offline fallback during migration.
  event.respondWith((async()=>await find('skazki-shell-v2',url.href)||await find('skazki-shell-v1',url.href)||unavailable(410))());return;
 }
 if(ART.has(url.href)||url.href.startsWith(ROOT+'assets/author/friends/hero-')&&url.pathname.endsWith('.webp')){
  event.respondWith((async()=>{const cached=await find(ART_CACHE,url.href);if(cached)return cached;const r=await fresh(url.href);if(isImage(r))await save(ART_CACHE,url.href,r);return r})());return;
 }
 if(req.mode!=='navigate'||(url.pathname!==base.pathname&&url.pathname!==new URL(INDEX).pathname))return;
 event.respondWith(serveRelease(INDEX));
});
