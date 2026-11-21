/* Build-only, deterministic word dictionary. No network or runtime dependency.
   node tools/pack-reading-catalog.cjs --write   regenerate after editing content/reading-catalog.json
   node tools/pack-reading-catalog.cjs           verify exact generated block */
function utf8(s){let n=0;for(const c of s){const p=c.codePointAt(0);n+=p<128?1:p<2048?2:p<65536?3:4}return n}
// Second dictionary stores repeated fragments from the first packed stream.
// U+0500–U+07FF are two-byte fragment tokens, disjoint from first-stage tokens. Literal source characters in this range are JSON-escaped.
function packFragments(packed,literal){
 if(/[\u0500-\u07FF]/.test(packed))throw Error('Reserved fragment character in input');
 let output=packed;const points=Array.from(packed),counts=new Map();
 for(const len of [3,4,5,6,7,8,10,12,16,20,24,32,40,48])for(let i=0;i+len<=points.length;i++){const frag=points.slice(i,i+len).join('');counts.set(frag,(counts.get(frag)||0)+1)}
 const candidates=[...counts].filter(x=>x[1]>=2).map(([word,n])=>{const b=utf8(literal(word));return {word,b,score:(b-4)*n-b-1}}).filter(x=>x.score>4).sort((a,b)=>b.score-a.score||(a.word<b.word?-1:a.word>b.word?1:0));
 const dictionary=[];
 for(const {word,b} of candidates.slice(0,12000)){
  if(dictionary.length>=768)break;
  const pieces=output.split(word),n=pieces.length-1;if(n<2||n*(b-4)<=b+5)continue;
  const code=String.fromCharCode(0x500+dictionary.length);
  dictionary.push(word);output=pieces.join(code);
 }
 // Fill remaining slots only when the escaped literal becomes smaller.
 const extras=[...counts].filter(x=>x[1]>=2).map(([word,n])=>{const b=utf8(literal(word))-2;return {word,b,score:(b-2)*n-b-3}}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||(a.word<b.word?-1:a.word>b.word?1:0));
 for(const {word,b} of extras.slice(0,20000)){
  if(dictionary.length>=768)break;
  const pieces=output.split(word),n=pieces.length-1;if(n<2||n*(b-2)<=b+3)continue;
  dictionary.push(word);output=pieces.join(String.fromCharCode(0x500+dictionary.length-1));
 }
 if(output.replace(/[\u0500-\u07FF]/g,c=>dictionary[c.charCodeAt(0)-0x500])!==packed)throw Error('Fragment round-trip failed');
 return {output,dictionary};
}
// Use unused word-token code points for a final dictionary over the packed stream.
function packTails(packed,literal,offset){
 if([...packed].some(c=>c.charCodeAt(0)>=0x100+offset&&c.charCodeAt(0)<=0x3ff))throw Error('Reserved tail token');
 const points=Array.from(packed),counts=new Map();
 for(const n of [2,3,4,5,6,7,8,10,12,16,20,24,32,40,48])for(let i=0;i+n<=points.length;i++){const w=points.slice(i,i+n).join('');counts.set(w,(counts.get(w)||0)+1)}
 const candidates=[...counts].filter(x=>x[1]>=2).map(([word,n])=>{const b=utf8(literal(word))-2;return {word,b,score:(b-2)*n-b-3}}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||(a.word<b.word?-1:a.word>b.word?1:0));
 let output=packed;const dictionary=[];
 for(const {word,b} of candidates.slice(0,30000)){
  if(dictionary.length>=768-offset)break;
  const parts=output.split(word),n=parts.length-1;if(n<2||n*(b-2)<=b+3)continue;
  dictionary.push(word);output=parts.join(String.fromCharCode(0x100+offset+dictionary.length-1));
 }
 if(output.replace(/[\u0100-\u03FF]/g,c=>c.charCodeAt(0)<0x100+offset?c:dictionary[c.charCodeAt(0)-0x100-offset])!==packed)throw Error('Tail round-trip failed');
 return {output,dictionary};
}
function packCatalog(catalog){
 const raw=JSON.stringify(catalog).replace(/[\u0100-\u03FF\u0500-\u07FF]/g,c=>'\\u'+c.charCodeAt(0).toString(16).padStart(4,'0'));if(/[\uE000-\uF8FF]/.test(raw))throw Error('Reserved dictionary character in source');
 const words=/[\p{L}\p{N}]{3,}/gu,counts=new Map();
 for(const m of raw.matchAll(words))counts.set(m[0],(counts.get(m[0])||0)+1);
 // First 768 tokens occupy two UTF-8 bytes; source characters in that interval are JSON-escaped.
 // Limit to 80 high-value words; the final dictionary uses remaining two-byte codes.
 const score=([word,n])=>(utf8(word)-2)*n-utf8(word)-3;
 const dictionary=[...counts].filter(x=>score(x)>4).sort((a,b)=>score(b)-score(a)||(a[0]<b[0]?-1:a[0]>b[0]?1:0)).slice(0,80).map(x=>x[0]);
 const codes=new Map(dictionary.map((word,i)=>[word,String.fromCharCode(i<768?0x100+i:0xE000+i-768)]));
 const packed=raw.replace(words,word=>codes.get(word)||word);
 if(packed.replace(/[\u0100-\u03FF\uE000-\uF8FF]/g,c=>dictionary[c.charCodeAt(0)<0xE000?c.charCodeAt(0)-0x100:c.charCodeAt(0)-0xE000+768])!==raw)throw Error('Catalog round-trip failed');
 const literal=value=>JSON.stringify(value).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
 const fragments=packFragments(packed,literal),tails=packTails(fragments.output,literal,dictionary.length);
 return 'let readingBooksCache;function getReadingBooks(){if(readingBooksCache)return readingBooksCache;\n'+
 'const catalogWords='+literal(dictionary)+';\nconst catalogPhrases='+literal(fragments.dictionary)+';\nconst catalogTails='+literal(tails.dictionary)+';\nconst catalogPacked='+literal(tails.output)+';\n'+
 'return readingBooksCache=JSON.parse(catalogPacked.replace(/[\\u0100-\\u03FF]/g,c=>{const i=c.charCodeAt(0)-0x100-catalogWords.length;if(i<0)return c;const tail=catalogTails[i];if(tail===undefined)throw Error("Invalid tail token");return tail}).replace(/[\\u0500-\\u07FF]/g,c=>{const phrase=catalogPhrases[c.charCodeAt(0)-0x500];if(phrase===undefined)throw Error("Invalid fragment token");return phrase}).replace(/[\\u0100-\\u03FF\\uE000-\\uF8FF]/g,c=>{const p=c.charCodeAt(0),word=catalogWords[p<0xE000?p-0x100:p-0xE000+768];if(word===undefined)throw Error("Invalid catalog token");return word}));}\n\n';
}
// Independent lazy question banks: use the existing reversible codec only when smaller.
function packReadingBanks(banks){
 return ['readingComprehension','readingGlossary','readingInference'].map(name=>{
 const value=banks[name];if(!value||typeof value!=='object')throw Error('Missing bank '+name);
 const plain='const '+name+'=lazyReadingBank(()=>('+JSON.stringify(value).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029')+'));\n';
 const packed=packCatalog(value).replace('let readingBooksCache;function getReadingBooks(){if(readingBooksCache)return readingBooksCache;\n','const '+name+'=lazyReadingBank(()=>{\n').replace('return readingBooksCache=','return ').replace(/;}\n\n$/,';});\n');
 return utf8(packed)<utf8(plain)?packed:plain;
 }).join('');
}
if(typeof module!=='undefined'){module.exports={packCatalog,packReadingBanks,utf8};if(require.main===module){
 const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'..'),file=path.join(root,'index.html'),html=fs.readFileSync(file,'utf8'),catalog=JSON.parse(fs.readFileSync(path.join(root,'content/reading-catalog.json'),'utf8'));
 const start=html.indexOf('let readingBooksCache;'),end=html.indexOf('const readingAuthorNames=',start);if(start<0||end<start)throw Error('Catalog markers missing');const packed=packCatalog(catalog);
 if(process.argv.includes('--write'))fs.writeFileSync(file,html.slice(0,start)+packed+html.slice(end));else if(html.slice(start,end)!==packed)throw Error('Generated catalog differs. Run node tools/pack-reading-catalog.cjs --write');
 const banks=JSON.parse(fs.readFileSync(path.join(root,'content','reading-banks.json'),'utf8')),generated=packReadingBanks(banks),current=fs.readFileSync(file,'utf8'),a=current.indexOf('const readingComprehension=lazyReadingBank('),b=current.indexOf('function readingQuestions(b)',a);
 if(a<0||b<a)throw Error('Reading bank markers missing');
 if(process.argv.includes('--write'))fs.writeFileSync(file,current.slice(0,a)+generated+current.slice(b));else if(current.slice(a,b)!==generated)throw Error('Generated reading banks differ. Run node tools/pack-reading-catalog.cjs --write');
 console.log('PACKED CATALOG BYTES',utf8(packed),'READING BANK BYTES',utf8(generated));
}}
