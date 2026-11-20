/* Build-only, deterministic word dictionary. No network or runtime dependency.
   node tools/pack-reading-catalog.cjs --write   regenerate after editing content/reading-catalog.json
   node tools/pack-reading-catalog.cjs           verify exact generated block */
function utf8(s){let n=0;for(const c of s){const p=c.codePointAt(0);n+=p<128?1:p<2048?2:p<65536?3:4}return n}
// Second dictionary stores repeated fragments from the first packed stream.
// F000–F07F are disjoint from first-stage tokens, and never occur in source.
function packFragments(packed,literal){
 let output=packed;const points=Array.from(packed),counts=new Map();
 for(const len of [5,8,12,16,24])for(let i=0;i+len<=points.length;i++){const frag=points.slice(i,i+len).join('');counts.set(frag,(counts.get(frag)||0)+1)}
 const score=([word,n])=>(utf8(word)-3)*n-utf8(literal(word))-1;
 const candidates=[...counts].filter(x=>score(x)>10).sort((a,b)=>score(b)-score(a)||(a[0]<b[0]?-1:a[0]>b[0]?1:0));
 const dictionary=[];
 for(const [word] of candidates.slice(0,1200)){
  if(dictionary.length>=128)break;
  const pieces=output.split(word);if(pieces.length<3)continue;
  const code=String.fromCharCode(0xF000+dictionary.length);
  if((pieces.length-1)*(utf8(literal(word))-2-3)<=utf8(literal(word))+2)continue;
  dictionary.push(word);output=pieces.join(code);
 }
 if(output.replace(/[\uF000-\uF07F]/g,c=>dictionary[c.charCodeAt(0)-0xF000])!==packed)throw Error('Fragment round-trip failed');
 return {output,dictionary};
}
function packCatalog(catalog){
 const raw=JSON.stringify(catalog).replace(/[\u0100-\u03FF]/g,c=>'\\u'+c.charCodeAt(0).toString(16).padStart(4,'0'));if(/[\uE000-\uF8FF]/.test(raw))throw Error('Reserved dictionary character in source');
 const words=/[\p{L}\p{N}]{3,}/gu,counts=new Map();
 for(const m of raw.matchAll(words))counts.set(m[0],(counts.get(m[0])||0)+1);
 // First 768 tokens occupy two UTF-8 bytes; source characters in that interval are JSON-escaped.
 const score=([word,n])=>(utf8(word)-2)*n-utf8(word)-3;
 const dictionary=[...counts].filter(x=>score(x)>4).sort((a,b)=>score(b)-score(a)||(a[0]<b[0]?-1:a[0]>b[0]?1:0)).slice(0,1500).map(x=>x[0]);
 const codes=new Map(dictionary.map((word,i)=>[word,String.fromCharCode(i<768?0x100+i:0xE000+i-768)]));
 const packed=raw.replace(words,word=>codes.get(word)||word);
 if(packed.replace(/[\u0100-\u03FF\uE000-\uF8FF]/g,c=>dictionary[c.charCodeAt(0)<0xE000?c.charCodeAt(0)-0x100:c.charCodeAt(0)-0xE000+768])!==raw)throw Error('Catalog round-trip failed');
 const literal=value=>JSON.stringify(value).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
 const fragments=packFragments(packed,literal);
 return 'let readingBooksCache;function getReadingBooks(){if(readingBooksCache)return readingBooksCache;\n'+
 'const catalogWords='+literal(dictionary)+';\nconst catalogPhrases='+literal(fragments.dictionary)+';\nconst catalogPacked='+literal(fragments.output)+';\n'+
 'return readingBooksCache=JSON.parse(catalogPacked.replace(/[\\uF000-\\uF07F]/g,c=>{const phrase=catalogPhrases[c.charCodeAt(0)-0xF000];if(phrase===undefined)throw Error("Invalid fragment token");return phrase}).replace(/[\\u0100-\\u03FF\\uE000-\\uF8FF]/g,c=>{const p=c.charCodeAt(0),word=catalogWords[p<0xE000?p-0x100:p-0xE000+768];if(word===undefined)throw Error("Invalid catalog token");return word}));}\n\n';
}
if(typeof module!=='undefined'){module.exports={packCatalog,utf8};if(require.main===module){
 const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'..'),file=path.join(root,'index.html'),html=fs.readFileSync(file,'utf8'),catalog=JSON.parse(fs.readFileSync(path.join(root,'content/reading-catalog.json'),'utf8'));
 const start=html.indexOf('let readingBooksCache;'),end=html.indexOf('const readingAuthorNames=',start);if(start<0||end<start)throw Error('Catalog markers missing');const packed=packCatalog(catalog);
 if(process.argv.includes('--write'))fs.writeFileSync(file,html.slice(0,start)+packed+html.slice(end));else if(html.slice(start,end)!==packed)throw Error('Generated catalog differs. Run node tools/pack-reading-catalog.cjs --write');
 console.log('PACKED CATALOG BYTES',utf8(packed));
}}
