'use strict';

function brushWidths(){return [4,11,24]}
function drawingJPEG(canvas){
let result=canvas.toDataURL('image/jpeg',.88);
if(result.length>350000)result=canvas.toDataURL('image/jpeg',.66);
if(result.length>350000)throw Error('size');
return result;
}

function artRandom(seed){let n=seed>>>0;return ()=>{n=(Math.imul(1664525,n)+1013904223)>>>0;return n/4294967296}}
function artScene(ctx,scene,hero,outline,seed){
const random=artRandom(seed),ink='#52634e',paper='#fffdf7';
const colors={forest:['#e3edda','#b3c99a','#81a67e','#f6db9b'],sea:['#e2f1ee','#a7d0d3','#78b4c1','#f5d69d'],castle:['#f0e7f3','#d3c2df','#a7ba91','#f3d5b1'],night:['#dce2f2','#b4bddb','#8e9cbf','#fff0b7']};
if(!Object.prototype.hasOwnProperty.call(colors,scene))scene='forest';
if(!['rabbit','fox','bear','owl'].includes(hero))hero='rabbit';
const p=colors[scene];
ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.lineJoin='round';ctx.lineCap='round';
function shape(fill,draw,stroke=ink,w=2.5){ctx.beginPath();draw();ctx.fillStyle=outline?paper:fill;ctx.fill();ctx.strokeStyle=stroke;ctx.lineWidth=w;ctx.stroke()}
function ellipse(x,y,rx,ry,fill,angle=0){shape(fill,()=>ctx.ellipse(x,y,rx,ry,angle,0,Math.PI*2))}
function poly(points,fill){shape(fill,()=>{ctx.moveTo(...points[0]);for(const a of points.slice(1))ctx.lineTo(...a);ctx.closePath()})}
function line(points,w=2.5){ctx.beginPath();ctx.moveTo(...points[0]);for(const a of points.slice(1))ctx.lineTo(...a);ctx.lineWidth=w;ctx.strokeStyle=ink;ctx.stroke()}
function star(x,y,r){const pts=[];for(let i=0;i<8;i++){const a=i*Math.PI/4-Math.PI/2,k=i%2?r*.38:r;pts.push([x+Math.cos(a)*k,y+Math.sin(a)*k])}poly(pts,'#fff2bb')}
function tree(x,y,z){shape('#b99572',()=>ctx.rect(x-10*z,y-75*z,20*z,86*z));ellipse(x,y-91*z,38*z,49*z,p[2]);ellipse(x-24*z,y-67*z,27*z,30*z,p[1]);ellipse(x+24*z,y-70*z,28*z,32*z,p[2])}
function flower(x,y){line([[x,y],[x,y-17]],2);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;ellipse(x+Math.cos(a)*6,y-20+Math.sin(a)*6,4.5,4.5,'#e8a69c')}ellipse(x,y-20,3,3,'#e6bd65')}
ctx.fillStyle=outline?paper:p[0];ctx.fillRect(0,0,720,480);
if(scene==='night'){
shape('#fff2bd',()=>{ctx.arc(568,86,43,.65,4.85);ctx.quadraticCurveTo(545,99,604,112);ctx.closePath()});
for(let i=0;i<13;i++)star(35+random()*650,23+random()*140,4+random()*6);
}else{
ellipse(565,78,40,40,p[3]);
for(const x of [110,280]){shape('#fffaf0',()=>{ctx.moveTo(x-48,102);ctx.bezierCurveTo(x-58,79,x-20,69,x-14,86);ctx.bezierCurveTo(x-4,51,x+31,61,x+34,87);ctx.bezierCurveTo(x+65,87,x+65,111,x+36,113);ctx.lineTo(x-38,113);ctx.closePath()})}
}
shape(p[1],()=>{ctx.moveTo(0,260);ctx.quadraticCurveTo(110,150,290,258);ctx.quadraticCurveTo(505,135,720,238);ctx.lineTo(720,480);ctx.lineTo(0,480);ctx.closePath()});
shape(scene==='sea'?p[2]:'#dce6bd',()=>{ctx.moveTo(0,338);ctx.quadraticCurveTo(175,270,350,331);ctx.quadraticCurveTo(565,263,720,332);ctx.lineTo(720,480);ctx.lineTo(0,480);ctx.closePath()});
if(scene==='forest'||scene==='night'){
tree(80,310,.95);tree(160,267,.66);tree(645,301,.93);tree(560,263,.61);
}else if(scene==='sea'){
poly([[28,270],[125,270],[105,294],[46,294]],'#bd9974');poly([[76,202],[76,267],[125,267]],'#fff5d6');line([[76,197],[76,273]]);
for(let i=0;i<6;i++){let x=18+random()*660,y=340+random()*115;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+11,y-7,x+22,y);ctx.strokeStyle='#567b81';ctx.lineWidth=1.8;ctx.stroke()}
}else{
for(const [x,y,w] of [[88,188,75],[550,162,82]]){shape('#efdae4',()=>ctx.rect(x,y,w,119));poly([[x-9,y],[x+w/2,y-59],[x+w+9,y]],'#bd9bc5');shape('#fff2ba',()=>{ctx.moveTo(x+w/2-10,y+65);ctx.lineTo(x+w/2-10,y+32);ctx.quadraticCurveTo(x+w/2,y+11,x+w/2+10,y+32);ctx.lineTo(x+w/2+10,y+65);ctx.closePath()})}
}
const x=344+(random()-.5)*70,y=292;
const fur={rabbit:'#e8dacc',fox:'#dca16e',bear:'#b89470',owl:'#b59b82'}[hero];
if(hero==='fox')ellipse(x+71,y+66,78,34,fur,-.42);
ellipse(x,y+78,67,70,fur);ellipse(x,y+86,38,45,'#f8ebd0');
if(hero==='rabbit'){ellipse(x-31,y-102,19,61,fur,-.17);ellipse(x+31,y-102,19,61,fur,.17);ellipse(x-31,y-103,8,40,'#e8aeb3',-.17);ellipse(x+31,y-103,8,40,'#e8aeb3',.17)}
else if(hero==='fox'){poly([[x-62,y-16],[x-68,y-100],[x-9,y-45]],fur);poly([[x+62,y-16],[x+68,y-100],[x+9,y-45]],fur);poly([[x-54,y-40],[x-57,y-79],[x-24,y-45]],'#f5d4c6');poly([[x+54,y-40],[x+57,y-79],[x+24,y-45]],'#f5d4c6')}
else if(hero==='bear'){ellipse(x-54,y-53,24,24,fur);ellipse(x+54,y-53,24,24,fur);ellipse(x-54,y-53,12,12,'#ddbaa0');ellipse(x+54,y-53,12,12,'#ddbaa0')}
else {poly([[x-62,y-30],[x-60,y-76],[x-14,y-44]],fur);poly([[x+62,y-30],[x+60,y-76],[x+14,y-44]],fur)}
ellipse(x,y,73,62,fur);
if(hero==='owl'){ellipse(x-28,y-3,30,33,'#fff5da');ellipse(x+28,y-3,30,33,'#fff5da');poly([[x-9,y+13],[x+9,y+13],[x,y+27]],'#dfb36a')}
else{ellipse(x,y+28,34,23,'#fff1d4');ellipse(x,y+15,10,7,'#625447');line([[x,y+22],[x,y+30]]);ctx.beginPath();ctx.arc(x-7,y+29,7,0,Math.PI);ctx.arc(x+7,y+29,7,0,Math.PI);ctx.strokeStyle=ink;ctx.lineWidth=2.5;ctx.stroke()}
for(const dx of [-27,27]){ellipse(x+dx,y-7,8,11,'#3b463e');ctx.fillStyle='#fffdf7';ctx.beginPath();ctx.arc(x+dx-2,y-11,2.5,0,Math.PI*2);ctx.fill()}
ellipse(x-45,y+130,26,18,fur);ellipse(x+45,y+130,26,18,fur);
ellipse(x-62,y+66,20,34,fur,.3);ellipse(x+62,y+66,20,34,fur,-.3);
if(scene!=='sea')for(let i=0;i<7;i++){const xx=i<4?22+random()*160:535+random()*155;flower(xx,383+random()*65)}
ctx.restore();
}
function artFill(pixels,w,h,x,y,rgba,barrier=null){
x=Math.floor(x);y=Math.floor(y);if(x<0||x>=w||y<0||y>=h)return false;
const root=y*w+x;if(barrier?.[root])return false;
const start=root*4,r=pixels[start],g=pixels[start+1],b=pixels[start+2],a=pixels[start+3];
if(r===rgba[0]&&g===rgba[1]&&b===rgba[2]&&a===rgba[3])return false;
const size=w*h,seen=new Uint8Array(size),queue=new Int32Array(size);let head=0,tail=1;queue[0]=root;seen[root]=1;
while(head<tail){const n=queue[head++],p=n*4;if((barrier&&barrier[n])||Math.abs(pixels[p]-r)>12||Math.abs(pixels[p+1]-g)>12||Math.abs(pixels[p+2]-b)>12||Math.abs(pixels[p+3]-a)>12)continue;
pixels[p]=rgba[0];pixels[p+1]=rgba[1];pixels[p+2]=rgba[2];pixels[p+3]=rgba[3];
const col=n%w;
let m=n-1;if(col>0&&!seen[m]){seen[m]=1;queue[tail++]=m}
m=n+1;if(col<w-1&&!seen[m]){seen[m]=1;queue[tail++]=m}
m=n-w;if(n>=w&&!seen[m]){seen[m]=1;queue[tail++]=m}
m=n+w;if(m<size&&!seen[m]){seen[m]=1;queue[tail++]=m}
}
return true;
}

function drawingLesson(subject,step){
const p=(d,tone='none')=>'<path d="'+d+'" data-tone="'+tone+'"/>';
const e=(x,y,rx,ry,tone='none')=>'<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" data-tone="'+tone+'"/>';
const dot=(x,y,r=2)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="#513b31" stroke="none"/>';
const face=(x,y)=>dot(x-13,y,3)+dot(x+13,y,3)+p('M'+(x-3)+' '+(y+9)+' q3 -3 6 0 l-3 4Z','#9c625b')+p('M'+x+' '+(y+13)+' q-5 7 -10 2 M'+x+' '+(y+13)+' q5 7 10 2');
const grass=p('M14 187 Q35 174 60 187 M175 187 Q205 176 226 187 M25 184 l-5 -12 m5 12 7 -13 M209 184 l-7 -14 m7 14 7 -11');
const petals=(x,y,k=1)=>'<g transform="translate('+x+' '+y+') scale('+k+')">'+[0,72,144,216,288].map(a=>'<g transform="rotate('+a+')">'+e(0,-11,5.5,9,'#efacb9')+'</g>').join('')+e(0,0,4.5,4.5,'#f3d177')+'</g>';
const lessons={
rabbit:[
[p('M92 120 Q63 151 78 178 Q96 192 144 185 Q174 181 162 148 Q151 126 140 120Z','#ecd4b4')+e(120,102,36,34,'#f4dec1'),'Наметь голову и мягкий силуэт сидящего зайчика.'],
[p('M94 78 Q68 41 84 12 Q104 0 111 67Z','#f4dec1')+p('M129 69 Q137 3 156 12 Q172 39 146 81Z','#f4dec1')+p('M91 65 Q82 38 88 25 Q99 35 104 65Z','#e7a2aa')+p('M137 64 Q145 34 154 25 Q159 41 145 66Z','#e7a2aa'),'Нарисуй длинные ушки. Внутри каждого — тонкая форма.'],
[e(77,165,16,16,'#fff1da')+e(98,180,23,11,'#ecd4b4')+e(146,180,23,11,'#ecd4b4')+e(120,158,22,25,'#fff1da')+p('M96 135 Q88 154 109 164 M145 135 Q151 154 132 164'),'Добавь пушистый хвост, лапки и светлую грудку.'],
[face(120,101)+e(98,116,7,4,'#f1b5ae')+e(142,116,7,4,'#f1b5ae')+p('M102 74 q8 -7 15 -5 m12 0 q8 -2 15 5'),'Добавь глаза, улыбку, нос и щёчки.'],
[grass+petals(42,161,.65)+p('M42 173 v17 M42 182 q-12 -8 -14 -3')+petals(199,158,.7)+p('M199 170 v21 M199 181 q14 -10 15 -3 M94 182 l-4 -3 m11 3 -3 -3 m43 3 3 -3 m5 3 4 -3'),'Короткими штрихами покажи шерсть. Нарисуй цветы и траву.'],
['','Раскрась зайчика тёплыми оттенками, ушки — розовым. Выбери свои цвета.']],
cat:[
[p('M99 124 Q79 145 86 180 Q113 191 152 180 Q166 147 143 124Z','#e8ae75')+e(121,101,41,35,'#f5c990'),'Наметь большую голову и туловище котёнка.'],
[p('M87 83 L76 40 Q77 31 85 36 L113 68Z','#f5c990')+p('M132 68 L159 37 Q167 32 167 42 L155 83Z','#f5c990')+p('M87 48 L94 70 L104 66Z','#e5a6ab')+p('M156 49 L140 67 L150 71Z','#e5a6ab')+p('M157 165 Q193 172 189 139 Q186 122 175 131 Q195 132 176 154 Q167 156 157 155Z','#e8ae75'),'Добавь треугольные уши и изогнутый хвост.'],
[e(119,156,23,25,'#fff0ce')+e(101,181,18,10,'#f5c990')+e(139,181,18,10,'#f5c990')+p('M99 137 L103 168 M143 137 L139 168'),'Нарисуй грудку и передние лапки.'],
[face(121,101)+p('M94 117 l-23 -4 M95 123 l-23 4 M148 117 l23 -4 M147 123 l24 4')+p('M113 71 l8 12 8 -12 M85 90 l11 4 -10 4 M157 90 l-11 4 10 4'),'Нарисуй мордочку, усики и полоски.'],
[e(120,192,86,10,'#d5bce9')+p('M52 194 l10 -3 m10 5 13 -3 m77 2 12 -3 M20 165 q8 -14 15 0 q-8 12 -15 0Z','#efacb9')+p('M28 175 l-10 12 7 2 M113 177 l-2 4 m17 -4 2 4'),'Добавь коврик, игрушку и маленькие штрихи на лапках.'],
['','Раскрась полоски, шерсть и коврик. Не обязательно повторять образец.']],
flower:[
[e(116,76,17,17,'#edbd53')+p('M113 92 Q105 128 113 186 L121 186 Q115 127 122 93Z','#75ad7c'),'Наметь серединку цветка и плавный стебель.'],
[[0,60,120,180,240,300].map(a=>'<g transform="translate(116 76) rotate('+a+')">'+p('M-10 -13 Q-28 -37 -11 -52 Q1 -63 13 -51 Q28 -35 10 -13Z','#f1b6c6')+'</g>').join('')+e(116,76,17,17,'#edbd53'),'Нарисуй шесть широких лепестков вокруг серединки.'],
[p('M114 138 Q75 107 53 130 Q66 157 114 152Z','#84b77b')+p('M119 158 Q160 123 184 146 Q165 173 119 169Z','#84b77b'),'Добавь два листочка разной формы.'],
[p('M65 134 Q94 140 112 145 M123 165 Q151 152 173 148')+dot(109,70)+dot(121,78)+dot(111,84)+dot(124,68)+p('M116 57 v-18 M98 67 l-14 -10 M134 67 l14 -10'),'Нарисуй прожилки и точечки на серединке.'],
[grass+petals(31,158,.64)+petals(208,158,.64)+p('M31 168 v24 M208 168 v24')+p('M185 52 Q173 27 163 41 Q153 58 180 63 Q165 83 185 79 L190 62 Q220 75 219 55 Q219 38 194 50Z','#c0b5e7')+e(190,57,3.5,13,'#c99c77'),'Добавь маленькие цветы и бабочку.'],
['','Выбери цвета лепестков и листьев. Можно сделать цветок разноцветным.']],
house:[
[p('M54 86 Q114 77 176 86 L176 172 Q112 181 54 172Z','#f1d3a4'),'Наметь стены сказочного домика.'],
[p('M34 91 L111 22 Q118 15 126 22 L196 91 L181 103 L119 48 L49 103Z','#d9896f')+p('M155 52 V23 H172 V67Z','#d7a493'),'Нарисуй крышу со свесом и трубу.'],
[p('M107 177 V129 Q123 107 139 129 V177Z','#ba8e67')+p('M68 107 H94 V138 H68Z','#a9d8e7')+p('M146 107 H166 V138 H146Z','#a9d8e7')+p('M81 107 V138 M68 122 H94 M156 107 V138 M146 122 H166')+dot(132,151),'Добавь дверь, окна и ручку.'],
[p('M13 174 Q36 159 54 174 M176 174 Q201 159 228 179 M107 177 L86 207 H160 L139 177Z','#e9c79a')+p('M28 170 Q8 139 27 130 Q35 104 49 130 Q72 137 51 170Z','#97bb85')+p('M198 171 Q181 140 201 127 Q203 105 219 126 Q237 141 222 171Z','#a7c58b'),'Нарисуй дорожку и два кустика.'],
[p('M61 78 L120 30 M82 84 L120 50 M147 71 L159 84 M55 151 h18 m-8 7 h15 M155 151 h19')+petals(30,181,.55)+petals(211,181,.55)+e(210,35,14,14,'#f9d47a')+p('M180 14 q5 -8 13 -1 q7 -13 19 -3'),'Добавь фактуру крыши, цветы, солнце и облака.'],
['','Раскрась домик, сад и дорожку. Придумай, кто здесь живёт.']],
fox:[
[p('M98 116 Q69 141 83 177 Q111 197 150 179 Q169 152 145 116Z','#df9a5b')+p('M78 82 Q78 63 102 57 Q123 50 146 57 Q170 64 165 96 Q159 120 121 136 Q81 120 78 82Z','#e7a15d'),'Наметь голову с острой мордочкой и сидящее туловище.'],
[p('M82 79 L65 24 Q65 15 77 22 L113 57Z','#e7a15d')+p('M131 57 L168 22 Q179 16 176 29 L161 82Z','#e7a15d')+p('M76 34 L88 66 L100 58Z','#edb8b0')+p('M165 34 L143 58 L157 66Z','#edb8b0'),'Добавь большие треугольные уши.'],
[p('M83 161 Q46 135 35 162 Q17 193 69 198 Q108 199 132 179 Q109 162 83 161Z','#e7a15d')+p('M35 162 Q17 193 61 197 Q73 183 63 170Z','#fff1d8')+p('M104 127 Q121 135 139 127 Q151 152 121 176 Q92 152 104 127Z','#fff1d8')+e(99,180,17,10,'#ba7952')+e(145,180,17,10,'#ba7952'),'Нарисуй пушистый хвост, грудку и лапки.'],
[p('M80 98 Q99 86 121 108 Q143 86 163 98 Q156 121 121 136 Q86 120 80 98Z','#fff1d8')+face(121,94)+p('M94 83 q7 -5 13 -1 M135 82 q8 -4 14 1'),'Добавь белые щёки, глаза, носик и улыбку.'],
[grass+petals(30,158,.65)+petals(201,159,.65)+p('M30 169 v22 M201 170 v21 M92 146 l-6 5 m64 -5 6 5 M38 183 l8 6 m4 -3 9 5'),'Нарисуй цветы, траву и несколько штрихов шерсти.'],
['','Раскрась лисёнка. Можно выбрать рыжий, золотой и кремовый.']],
butterfly:[
[e(120,109,7.5,39,'#9d7ba3')+e(120,62,9,10,'#b898c3'),'Наметь туловище и маленькую голову.'],
[p('M113 101 Q63 17 32 42 Q8 70 39 105 Q67 130 113 126Z','#94c6df')+p('M127 101 Q177 17 208 42 Q232 70 201 105 Q173 130 127 126Z','#94c6df'),'Нарисуй два широких верхних крыла.'],
[p('M113 126 Q65 101 54 139 Q47 170 77 182 Q104 191 117 149Z','#bca9e5')+p('M127 126 Q175 101 186 139 Q193 170 163 182 Q136 191 123 149Z','#bca9e5')+p('M115 55 Q98 28 90 34 M125 55 Q142 28 150 34'),'Добавь нижние крылья и усики.'],
[e(69,82,19,23,'#f6d287')+e(171,82,19,23,'#f6d287')+e(85,148,13,17,'#f4b5bf')+e(155,148,13,17,'#f4b5bf')+e(69,82,8,10,'#fff1d5')+e(171,82,8,10,'#fff1d5'),'Нарисуй парные узоры на крыльях.'],
[p('M109 113 Q79 97 48 55 M131 113 Q161 97 192 55 M111 145 Q90 154 69 165 M129 145 Q150 154 171 165')+dot(117,60)+dot(123,60)+grass+petals(25,170,.55)+petals(216,170,.55),'Добавь прожилки крыльев и цветы на полянке.'],
['','Раскрась крылья. Попробуй одинаковые цвета слева и справа. Дорисуй собственный симметричный узор.']],
owl:[
[e(120,146,39,45,'#d7af83')+e(120,77,48,39,'#c49771'),'Наметь большое округлое туловище и широкую голову.'],
[p('M76 61 L72 20 Q74 15 83 24 L105 43Z','#c49771')+p('M135 43 L157 24 Q166 15 168 20 L164 61Z','#c49771')+e(99,75,21,24,'#f4e3bf')+e(141,75,21,24,'#f4e3bf'),'Добавь ушки и два больших одинаковых круга вокруг глаз.'],
[e(99,76,8,10,'#655043')+e(141,76,8,10,'#655043')+p('M113 91 L127 91 L120 104Z','#e4ae51')+p('M85 118 Q73 148 95 173 Q110 150 102 125Z','#aa795b')+p('M155 118 Q167 148 145 173 Q130 150 138 125Z','#aa795b'),'Нарисуй глаза, клюв и крылья. Сравни правую и левую стороны.'],
[p('M20 187 Q85 175 143 183 L226 173 L229 187 Q153 200 85 193 L20 199Z','#9b7655')+p('M88 185 q1 -11 8 -11 m-1 11 q1 -11 8 -11 m30 11 q1 -11 8 -11 m-1 11 q1 -11 8 -11')+p('M174 182 Q188 155 211 150 Q206 175 174 182Z','#9db688'),'Добавь ветку под лапками и листок.'],
[p('M111 126 q9 9 18 0 M108 140 q12 9 24 0 M108 155 q12 9 24 0')+e(202,36,14,14,'#ead394')+p('M24 36 l0 12 m-6 -6 h12 M37 66 v8 m-4 -4 h8'),'Добавь перья, луну и звёзды.'],
['','Раскрась совёнка. Придумай, что он увидел ночью, и дорисуй это.']],
boat:[
[p('M35 147 Q120 155 205 147 L184 177 Q121 187 56 177Z','#b9845d')+p('M120 55 L120 147'),'Наметь корпус кораблика и вертикальную мачту.'],
[p('M115 35 Q81 87 58 135 L115 135Z','#e9b997')+p('M125 44 Q153 96 181 135 L125 135Z','#a5c7df'),'Нарисуй два паруса. Какой из них больше?'],
[p('M121 31 L157 39 L121 50Z','#d98882')+p('M46 152 Q121 160 194 152 M72 169 H177')+e(85,164,5,5,'#e6d5ab')+e(155,164,5,5,'#e6d5ab'),'Добавь флажок, полосы и два круглых окошка.'],
[p('M10 182 Q28 173 46 182 T82 182 T118 182 T154 182 T190 182 T226 182 M8 198 Q26 190 44 198 T80 198 T116 198 T152 198 T188 198 T224 198'),'Нарисуй волны: ближние можно сделать крупнее.'],
[e(199,28,13,13,'#f4d277')+p('M16 71 q10 -12 23 0 q10 -12 23 0 M181 78 q9 -12 20 0 q9 -12 20 0')+p('M28 119 Q39 106 54 117'),'Добавь птиц, солнце и берег вдали.'],
['','Выбери цвета парусов. Куда плывёт кораблик? Дорисуй место назначения.']],
landscape:[
[p('M10 105 L70 30 L126 104 L171 46 L230 109Z','#aeb9c3')+p('M10 109 H230'),'Наметь горы вдали: две вершины разной высоты.'],
[p('M47 59 L70 30 L96 63 L81 59 L70 68 L58 56Z','#fff7e8')+p('M154 68 L171 46 L190 72 L175 65 L168 73Z','#fff7e8'),'Добавь снежные вершины. Оставь их светлыми.'],
[p('M10 112 Q58 83 123 111 Q174 89 230 115 L230 205 L10 205Z','#a7c49b')+p('M118 111 Q163 135 102 157 Q60 179 94 205 L173 205 Q119 180 159 158 Q199 138 137 111Z','#9ac7de'),'Нарисуй холмы и извилистую реку, которая расширяется к тебе.'],
[p('M24 177 V204 M12 178 L24 145 L37 178Z','#5c8c71')+p('M205 174 V205 M190 175 L205 132 L221 175Z','#5c8c71')+p('M47 133 v15 M40 134 L47 115 L54 134Z','#7ca38a'),'Нарисуй большие деревья рядом и маленькое дерево вдали.'],
[e(34,30,15,15,'#f0cc76')+p('M144 24 q8 -10 16 0 q8 -10 16 0 M179 193 l5 -5 m12 7 4 -6 M20 194 l5 -7')+petals(59,184,.6)+petals(184,187,.5),'Добавь солнце, птиц и цветы на переднем плане.'],
['','Раскрась пейзаж. Попробуй холодные оттенки вдали и более тёплые рядом. Придумай свой сезон.']]
};
const list=lessons[subject]||lessons.rabbit,i=Math.max(0,Math.min(list.length-1,Number.isFinite(step)?Math.floor(step):0)),colored=i===list.length-1;
const groups=list.slice(0,i+1).map(([markup],n)=>'<g data-lesson-stage="'+(n+1)+'">'+markup.replace(/data-tone="([^"]+)"/g,(_,tone)=>'fill="'+(tone==='none'?'none':colored?tone:'#fffdf7')+'"')+'</g>').join('');
return {svg:'<svg viewBox="0 0 240 215" role="img" aria-label="Рисунок по шагам" xmlns="http://www.w3.org/2000/svg"><rect width="240" height="215" rx="12" fill="#fffdf7"/><g fill="none" stroke="#674a40" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">'+groups+'</g></svg>',total:list.length,instruction:'Шаг '+(i+1)+' из '+list.length+'. '+list[i][1]};
}

const stampEffects=new Set(['dots','stars','hearts','flowers','petals','leaves','butterflies','snow','bubbles','moons','diamonds','clouds','paw','notes','bows']);
function studioStamp(ctx,x,y,r,kind,color,opacity=1){
ctx.save();ctx.globalAlpha=opacity;ctx.translate(x,y);ctx.fillStyle=color;ctx.strokeStyle=color;ctx.lineWidth=Math.max(1,r*.13);ctx.lineCap='round';ctx.lineJoin='round';
const circle=(x,y,rad,fill=true)=>{ctx.beginPath();ctx.arc(x,y,rad,0,Math.PI*2);fill?ctx.fill():ctx.stroke()};
const ellipse=(x,y,rx,ry,rot=0)=>{ctx.beginPath();ctx.ellipse(x,y,rx,ry,rot,0,Math.PI*2);ctx.fill()};
const poly=pts=>{ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill()};
if(kind==='stars'){poly(Array.from({length:10},(_,i)=>{const t=-Math.PI/2+i*Math.PI/5,a=i%2?r*.42:r;return [Math.cos(t)*a,Math.sin(t)*a]}))}
else if(kind==='hearts'){ctx.beginPath();ctx.moveTo(0,r*.8);ctx.bezierCurveTo(-r*1.8,-r*.2,-r*.9,-r*1.5,0,-r*.55);ctx.bezierCurveTo(r*.9,-r*1.5,r*1.8,-r*.2,0,r*.8);ctx.fill()}
else if(kind==='flowers'){for(let i=0;i<5;i++){const a=i*Math.PI*2/5;ellipse(Math.cos(a)*r*.55,Math.sin(a)*r*.55,r*.52,r*.36,a)}ctx.fillStyle='#f5d26b';circle(0,0,r*.34)}
else if(kind==='petals'||kind==='leaves'){ctx.rotate(-.6);ctx.beginPath();ctx.moveTo(0,-r);ctx.quadraticCurveTo(r*1.25,-r*.3,0,r);ctx.quadraticCurveTo(-r*1.25,r*.3,0,-r);ctx.fill();ctx.strokeStyle='#fffdf7';ctx.globalAlpha=.75*opacity;ctx.beginPath();ctx.moveTo(0,-r*.75);ctx.lineTo(0,r*.7);ctx.stroke()}
else if(kind==='butterflies'){ellipse(-r*.48,-r*.23,r*.6,r*.76,-.5);ellipse(r*.48,-r*.23,r*.6,r*.76,.5);ellipse(-r*.41,r*.31,r*.44,r*.47,.5);ellipse(r*.41,r*.31,r*.44,r*.47,-.5);ctx.fillStyle='#726451';ellipse(0,0,r*.12,r*.7)}
else if(kind==='snow'){for(let i=0;i<6;i++){ctx.save();ctx.rotate(i*Math.PI/3);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-r);ctx.moveTo(-r*.23,-r*.6);ctx.lineTo(0,-r*.4);ctx.lineTo(r*.23,-r*.6);ctx.stroke();ctx.restore()}}
else if(kind==='bubbles'){ctx.globalAlpha=.27*opacity;circle(0,0,r);ctx.globalAlpha=.9*opacity;circle(0,0,r,false);ctx.fillStyle='#fffdf7';circle(-r*.33,-r*.38,r*.22)}
else if(kind==='moons'){ctx.beginPath();ctx.arc(0,0,r,-Math.PI*.7,Math.PI*.7,true);ctx.quadraticCurveTo(r*.23,0,-r*.588,-r*.809);ctx.closePath();ctx.fill()}
else if(kind==='diamonds'){poly([[0,-r],[r*.8,0],[0,r],[-r*.8,0]]);ctx.globalAlpha=.7*opacity;ctx.fillStyle='#fffdf7';poly([[0,-r*.8],[r*.35,0],[0,r*.2],[-r*.28,0]])}
else if(kind==='clouds'){circle(-r*.43,r*.12,r*.54);circle(r*.05,-r*.24,r*.65);circle(r*.48,r*.13,r*.49);ctx.fillRect(-r*.45,r*.13,r*.9,r*.51)}
else if(kind==='paw'){ellipse(0,r*.35,r*.57,r*.55);for(let i=0;i<4;i++){const t=-2.85+i*.84;ellipse(Math.cos(t)*r*.8,Math.sin(t)*r*.82,r*.24,r*.31,t+Math.PI/2)}}
else if(kind==='notes'){ellipse(-r*.3,r*.55,r*.38,r*.27,-.3);ctx.beginPath();ctx.moveTo(0,r*.5);ctx.lineTo(0,-r*.8);ctx.lineTo(r*.65,-r*.45);ctx.stroke()}
else if(kind==='bows'){poly([[0,0],[-r,-r*.62],[-r,r*.62]]);poly([[0,0],[r,-r*.62],[r,r*.62]]);ctx.fillStyle='#f5d2c3';circle(0,0,r*.23)}
else {circle(-r*.46,-r*.22,r*.29);circle(r*.42,r*.26,r*.35);circle(r*.18,-r*.66,r*.18)}
ctx.restore();
}
function studioStroke(ctx,from,to,width,kind,color,hue=0,opacity=1){
const len=Math.hypot(to.x-from.x,to.y-from.y),line=(w,pigment,alpha=1)=>{ctx.globalAlpha=alpha*opacity;ctx.strokeStyle=pigment;ctx.fillStyle=pigment;ctx.lineWidth=w;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();if(len){ctx.moveTo(from.x,from.y);ctx.lineTo(to.x,to.y);ctx.stroke()}else{ctx.arc(to.x,to.y,w/2,0,Math.PI*2);ctx.fill()}};
const grain=(spread,alpha)=>{const n=Math.min(120,Math.max(4,Math.ceil(len/2))),dx=to.x-from.x,dy=to.y-from.y,nx=len?-dy/len:1,ny=len?dx/len:0,r=Math.max(.35,Math.min(1.5,width*.06));ctx.fillStyle=color;ctx.globalAlpha=alpha*opacity;ctx.beginPath();for(let i=0;i<n;i++){const t=(i+.5)/n,x=from.x+dx*t,y=from.y+dy*t;for(let j=0;j<3;j++){const d=Math.sin((x+3*j)*12.9898+(y+5*j)*78.233)*spread*width,px=x+nx*d,py=y+ny*d;ctx.moveTo(px+r,py);ctx.arc(px,py,r,0,Math.PI*2)}}ctx.fill()};
ctx.save();if(kind==='grain-pencil'){line(width,color,.20);line(width*.32,color,.55);grain(.43,.65)}else if(kind==='gouache'){line(width*1.48,color,.36);line(width*1.23,color,.87);line(width*.8,color,.95)}else if(kind==='ink'){line(width*(.35+.65*Math.abs(to.x-from.x)/(len||1)),color)}else if(kind==='spray'){const n=Math.min(180,Math.max(8,Math.ceil(len*3)));for(let i=0;i<n;i++){const t=i/n,x=from.x+(to.x-from.x)*t,y=from.y+(to.y-from.y)*t,a=i*2.39996,r=width*Math.sqrt((i*.618033)%1);ctx.globalAlpha=.26*opacity;ctx.fillStyle=color;ctx.beginPath();ctx.arc(x+Math.cos(a)*r,y+Math.sin(a)*r,Math.max(.5,width*.045),0,Math.PI*2);ctx.fill()}}else if(kind==='water'){line(width*1.75,color,.08);line(width*1.35,color,.16);line(width*.8,color,.10)}else if(kind==='pastel'){line(width*1.55,color,.15);line(width*.92,color,.30);grain(.65,.48)}else if(kind==='soft'){line(width*1.7,color,.17);line(width*1.1,color,.35);line(width*.55,color,.75)}else if(kind==='crayon'){line(width,color,.52);const n=Math.max(1,Math.ceil(len/2));for(let i=0;i<n;i++){const t=(i+.5)/n,x=from.x+(to.x-from.x)*t,y=from.y+(to.y-from.y)*t;ctx.fillStyle=color;ctx.globalAlpha=.55*opacity;ctx.beginPath();ctx.arc(x+Math.sin(x*5+y)*width*.38,y+Math.cos(y*7+x)*width*.38,Math.max(.6,width*.08),0,Math.PI*2);ctx.fill()}}else if(kind==='marker')line(width*1.3,color,.72);else if(kind==='rainbow')line(width,'hsl('+hue+' 78% 54%)');else if(kind==='gold'||kind==='silver'){const metal=kind==='gold'?['#a4782b','#f2d07b','#fff1c5']:['#788899','#c9d8e0','#f6fbff'];line(width*1.2,metal[0]);line(width*.78,metal[1]);line(width*.24,metal[2],.85)}else if(kind==='neon'){line(width*2.1,color,.18);line(width*1.45,color,.48);line(width*.65,color);line(width*.19,'#fffdf7',.85)}else if(kind==='glitter'){line(width,color,.65);const step=Math.max(3,width*.35),n=Math.max(1,Math.ceil(len/step));for(let i=0;i<n;i++){const t=(i+.5)/n,px=from.x+(to.x-from.x)*t,py=from.y+(to.y-from.y)*t;ctx.globalAlpha=.9*opacity;ctx.fillStyle=i%2?'#fff8d6':'#e9c371';ctx.beginPath();ctx.arc(px+Math.sin(px*2+py)*width*.37,py+Math.cos(py*2+px)*width*.37,Math.max(1,width*.095),0,Math.PI*2);ctx.fill()}}else line(width,color);ctx.restore();
}
function studioEffectPreview(canvas,kind){const ctx=canvas.getContext('2d');if(!ctx)return;ctx.clearRect(0,0,canvas.width,canvas.height);if(stampEffects.has(kind)){for(let i=0;i<3;i++)studioStamp(ctx,20+i*30,20,10,kind,['#b879a0','#d4a350','#719eaa'][i])}else for(let i=0;i<13;i++)studioStroke(ctx,{x:7+i*6.5,y:22+Math.sin(i*.5)*6},{x:7+(i+1)*6.5,y:22+Math.sin((i+1)*.5)*6},9,kind,'#9b83b9',i*27)}
function studioFitImage(w,h,iw,ih){const scale=Math.min(w/iw,h/ih),dw=iw*scale,dh=ih*scale;return {x:(w-dw)/2,y:(h-dh)/2,w:dw,h:dh}}



const ORIGINAL_COLORING_IDS=["hedgehog-garden","fox-owl-stream","bear-library","kitten-balloon","undersea-palace","winter-village","forest-picnic","dragon-clouds","rabbit-workshop","squirrel-autumn","owl-observatory","forest-train","duck-pond","puppy-kite","panda-bamboo","turtle-beach","whale-splash","octopus-treasure","spring-nest","rain-boots","sunflower-bee","apple-harvest","mushroom-house","fairy-lantern","unicorn-meadow","pirate-map","moon-rocket","planet-rover","space-cat","sailing-boat","city-bus","garden-bicycle","birthday-cake","holiday-gifts","tea-party","bakery-window","greenhouse","mountain-camp","fox-snowsled","butterfly-garden","moon-bat-garden","nile-cat-voyage"];
function originalColoring(ctx,key){
if(!ORIGINAL_COLORING_IDS.includes(key))return false;
const paper='#fffdf7',ink='#40382f';
ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=paper;ctx.fillRect(0,0,720,480);ctx.lineJoin='round';ctx.lineCap='round';ctx.strokeStyle=ink;
function zone(d){const p=new Path2D(d);ctx.fillStyle=paper;ctx.fill(p);ctx.lineWidth=3;ctx.stroke(p)}
function detail(d){ctx.lineWidth=2;ctx.stroke(new Path2D(d))}
function oval(x,y,a,b,solid=false){ctx.beginPath();ctx.ellipse(x,y,a,b,0,0,Math.PI*2);ctx.fillStyle=solid?ink:paper;ctx.fill();ctx.lineWidth=2.7;ctx.stroke()}
function eye(x,y){oval(x,y,7,10,true);ctx.beginPath();ctx.arc(x-2,y-3,2.4,0,Math.PI*2);ctx.fillStyle=paper;ctx.fill()}
function flower(x,y,k){ctx.save();ctx.translate(x,y);ctx.scale(k,k);zone('M0 8 Q-15 55 -4 94 L5 94 Q-4 53 7 8Z');zone('M0 57 Q-38 20 -47 43 Q-39 66 0 69Z');zone('M4 75 Q38 36 48 56 Q37 80 4 85Z');for(let i=0;i<6;i++){ctx.save();ctx.rotate(i*Math.PI/3);oval(0,-21,12,19);ctx.restore()}oval(0,0,13,13);ctx.restore()}
function cloud(x,y,k){ctx.save();ctx.translate(x,y);ctx.scale(k,k);zone('M-41 13 C-60 6 -49 -15 -31 -13 C-31 -37 4 -42 15 -19 C38 -26 54 -7 46 10 Q39 25 17 20 L-28 20 Q-39 20 -41 13Z');ctx.restore()}
function leaf(x,y,k){ctx.save();ctx.translate(x,y);ctx.rotate(k);zone('M0 0 Q-22 -35 0 -42 Q22 -35 0 0Z');detail('M0 0 L0 -30');ctx.restore()}
const Z=zone,D=detail,O=oval,E=(x,y)=>{ctx.save();ctx.translate(x,y);ctx.scale(.5,.5);eye(0,0);ctx.restore()},F=flower,C=cloud,L=(x,y,r)=>{ctx.save();ctx.translate(x,y);ctx.scale(.5,.5);leaf(0,0,r);ctx.restore()};
if(key==='hedgehog-garden'){
cloud(138,70,1.15);cloud(484,60,.86);oval(612,81,34,34);for(let i=0;i<8;i++){const a=i*Math.PI/4;detail('M'+(612+43*Math.cos(a))+' '+(81+43*Math.sin(a))+' L'+(612+54*Math.cos(a))+' '+(81+54*Math.sin(a)))}
zone('M0 339 Q150 295 294 330 Q523 277 720 331 L720 480 L0 480Z');
zone('M44 420 Q55 381 67 338 Q89 365 91 404 Q112 373 134 384 L116 432Z');
flower(103,265,.95);flower(595,250,1.35);flower(664,324,.67);flower(161,359,.62);
zone('M217 354 Q176 348 187 319 L158 295 L194 290 L175 262 L209 261 L192 225 L229 230 L226 190 L259 205 L275 171 L297 193 L327 160 L345 193 L383 174 L389 207 L430 204 L421 236 Q449 244 446 282 Q428 348 381 370 Q286 402 217 354Z');
zone('M375 224 Q407 201 437 224 Q457 239 471 275 Q487 300 523 305 Q541 311 524 331 Q500 349 449 341 Q421 368 385 355 Q350 332 356 288 Q359 252 375 224Z');
oval(377,242,19,26);detail('M372 230 Q389 234 380 252');eye(447,281);oval(523,312,10,8,true);detail('M505 333 Q489 345 476 330');
zone('M252 357 Q244 376 255 388 Q282 396 298 380 L302 365Z');zone('M359 357 Q347 376 360 388 Q389 394 401 377 L396 356Z');
for(const d of ['M224 276 L249 251 L247 288','M264 229 L284 210 L282 242','M303 266 L326 240 L330 270','M205 315 L233 304 L223 332','M279 339 L304 312 L312 337','M353 206 L369 224','M341 293 L352 273'])detail(d);
zone('M316 83 Q274 57 278 112 Q289 132 321 125 Q290 171 334 148 L344 126 Q397 148 394 106 Q394 76 350 100 Q348 66 316 83Z');oval(339,113,7,23);detail('M336 92 Q324 77 315 78 M342 91 Q352 75 361 77');
detail('M14 450 Q32 439 50 449 M475 433 Q496 421 521 431 M548 458 Q565 440 582 452');
}
if(key==='fox-owl-stream'){
cloud(365,62,1.1);cloud(595,80,.75);
zone('M0 300 Q190 274 283 317 Q470 284 720 302 L720 480 L0 480Z');
zone('M368 304 Q271 357 347 397 Q409 432 314 480 L720 480 L720 420 Q549 407 537 366 Q525 326 615 304Z');
detail('M391 335 Q350 359 389 376 M456 414 Q483 421 511 416 M570 448 Q612 461 655 449');
zone('M0 0 L90 0 Q81 69 103 115 Q151 130 211 100 L224 115 Q164 159 109 146 Q125 219 99 326 L0 340Z');
detail('M36 10 Q54 133 35 280 M74 163 Q88 234 65 308');
for(const [x,y,r] of [[120,52,-.6],[170,80,1],[213,80,.7],[100,113,-.9],[68,65,-1.1]])leaf(x,y,r);
zone('M145 104 Q139 79 161 67 L168 49 L185 64 Q207 60 221 72 L239 58 L239 88 Q257 132 225 159 Q182 177 153 151 Q135 135 145 104Z');
oval(178,108,19,19);oval(216,107,19,19);eye(178,108);eye(216,107);zone('M189 128 L202 125 L197 140Z');zone('M164 135 Q147 118 150 152 Q167 166 180 155Z');detail('M180 151 Q190 145 200 151 M190 161 Q200 153 210 160');
zone('M190 357 Q99 321 83 369 Q57 430 151 440 Q207 440 254 411 Q276 377 249 349Z');
zone('M83 369 Q61 409 101 431 Q121 422 125 395 Q101 391 83 369Z');
zone('M249 299 Q270 276 306 298 Q334 331 320 392 Q309 433 254 430 Q224 424 229 390Z');
zone('M207 268 L176 205 Q170 185 193 192 L252 219 Q278 211 294 218 L347 182 Q365 178 359 205 L341 274 Q355 295 330 315 Q277 346 227 316 Q207 301 207 268Z');
zone('M193 210 L212 249 L236 232Z');zone('M339 202 L306 232 L337 249Z');
zone('M214 283 Q246 263 276 295 Q305 265 340 280 Q343 308 310 323 Q276 345 237 320 Q213 305 214 283Z');
eye(248,267);eye(309,264);oval(277,297,12,8,true);detail('M277 305 Q266 319 253 306 M277 305 Q290 317 301 305');
zone('M260 388 Q247 372 238 397 Q222 431 250 436 Q276 439 278 411Z');zone('M305 390 Q320 375 326 406 Q337 435 309 438 Q287 439 288 413Z');
zone('M555 355 Q586 338 603 355 Q614 369 593 379 Q568 385 551 371Z');oval(576,344,13,5);flower(650,277,.7);
}
if(key==='bear-library'){
zone('M20 29 H700 V364 H20Z');zone('M32 43 H337 V350 H32Z');
for(const y of [139,237,335])zone('M32 '+y+' H337 V'+(y+12)+' H32Z');
const books=[[49,65,31,74],[83,54,42,85],[129,79,27,60],[160,57,45,82],[210,73,35,66],[249,49,62,90],[49,155,42,82],[96,178,27,59],[129,161,54,76],[187,150,28,87],[220,172,49,65],[273,156,41,81],[48,251,53,84],[106,264,33,71],[144,257,49,78]];
for(const [x,y,w,h] of books){zone('M'+x+' '+y+' h'+w+' v'+h+' h-'+w+'Z');detail('M'+(x+6)+' '+(y+12)+' h'+(w-12)+' M'+(x+6)+' '+(y+h-12)+' h'+(w-12))}
zone('M514 50 H670 V209 H514Z');zone('M526 62 H658 V197 H526Z');detail('M592 62V197 M526 129H658');
zone('M0 364 H720 V480 H0Z');oval(452,435,227,34);
zone('M356 310 Q285 281 257 318 L257 390 Q257 420 292 427 L616 427 Q651 422 651 386 L651 322 Q633 292 584 310 L584 228 Q583 190 543 190 L399 190 Q356 190 356 235Z');
oval(386,228,32,35);oval(533,227,32,35);oval(386,228,15,17);oval(533,227,15,17);
zone('M391 293 Q360 331 382 385 Q416 409 505 405 Q550 399 551 348 Q549 310 521 293Z');
zone('M370 254 Q375 194 459 193 Q545 194 547 260 Q552 321 459 331 Q366 321 370 254Z');
oval(459,284,42,30);eye(423,257);eye(496,257);oval(459,277,13,9,true);detail('M459 286 V295 Q447 305 438 293 M459 295 Q471 305 481 293');
zone('M332 337 Q386 321 452 350 Q505 326 575 338 L561 408 Q506 398 452 426 Q399 398 344 409Z');detail('M452 350 V426 M352 354 Q400 344 444 365 M462 365 Q506 346 552 352 M353 373 Q401 363 442 386 M463 386 Q504 368 550 372');
oval(349,366,26,22);oval(559,365,26,22);oval(395,423,30,17);oval(518,423,30,17);
zone('M74 372 H175 V388 H74Z');zone('M86 388 H99 V452 H86Z');zone('M150 388 H163 V452 H150Z');zone('M115 310 H134 V369 H115Z');zone('M79 313 Q85 248 125 248 Q165 248 171 313Z');
}
if(key==='kitten-balloon'){
cloud(91,87,.95);cloud(609,74,1.3);cloud(605,264,.9);cloud(96,300,1.25);
zone('M0 446 Q138 388 259 440 Q430 390 573 437 Q649 408 720 438 L720 480 H0Z');
zone('M259 258 C228 231 185 168 199 101 C213 38 280 15 361 16 C441 16 514 49 525 109 C536 177 493 235 458 258Z');
zone('M259 258 C207 164 257 39 361 16 C297 75 294 182 321 258Z');
zone('M400 258 C430 184 431 77 361 16 C463 38 517 163 458 258Z');
zone('M321 258 C294 182 297 75 361 16 C431 77 430 184 400 258Z');
zone('M252 258 H465 L451 278 H267Z');zone('M270 278 L304 359 L316 359 L284 278Z');zone('M434 278 L404 359 H416 L448 278Z');
zone('M329 355 Q310 335 324 310 L313 279 Q309 264 325 272 L355 291 Q367 289 378 291 L408 271 Q424 268 419 284 L405 315 Q420 335 400 352 Q364 377 329 355Z');
zone('M324 282 L333 306 L345 294Z');zone('M407 283 L389 295 L400 305Z');eye(343,326);eye(390,326);zone('M359 338 Q366 334 373 338 L366 345Z');detail('M366 345 Q358 357 350 348 M366 345 Q375 357 383 348 M330 340 L308 336 M330 348 L309 353 M404 340 L427 335 M403 348 L427 354');
zone('M290 365 H432 L416 434 Q363 449 306 434Z');zone('M285 356 H437 V377 H285Z');detail('M300 392 H423 M303 409 H420 M327 378 V436 M361 378 V441 M395 378 V436');oval(333,365,14,10);oval(399,365,14,10);
for(const [x,y] of [[112,193],[576,174],[654,346]]){zone('M'+x+' '+(y-11)+' q-22 -11 -19 10 q3 17 19 14 q18 2 21 -14 q0 -20 -21 -10Z');detail('M'+x+' '+(y-11)+' q-4 -10 5 -15')}
}

if(key==='undersea-palace'){
oval(86,78,17,17);oval(112,40,9,9);oval(632,125,12,12);oval(671,80,8,8);
zone('M0 390 Q156 351 340 390 Q520 348 720 388 V480 H0Z');
for(const [x,y] of [[168,130],[548,130]]){zone('M'+(x-60)+' '+(y+72)+' L'+x+' '+y+' L'+(x+60)+' '+(y+72)+'Z');zone('M'+(x-43)+' '+(y+72)+' H'+(x+43)+' V394 H'+(x-43)+'Z');zone('M'+(x-20)+' '+(y+155)+' Q'+x+' '+(y+124)+' '+(x+20)+' '+(y+155)+' V'+(y+192)+' H'+(x-20)+'Z')}
zone('M238 208 Q360 81 482 208Z');zone('M257 208 H463 V395 H257Z');
zone('M320 395 V309 Q360 250 400 309 V395Z');oval(360,238,23,23);detail('M337 238 H383 M360 215 V261');
for(const x of [280,436])zone('M'+(x-11)+' 279 Q'+x+' 258 '+(x+11)+' 279 V318 H'+(x-11)+'Z');
zone('M47 252 Q93 211 138 252 Q162 224 184 221 L175 253 L184 285 Q158 282 138 257 Q93 294 47 252Z');eye(79,251);detail('M111 235 Q122 251 111 268');
zone('M561 328 Q596 292 635 324 L675 302 L670 350 L635 329 Q596 364 561 328Z');eye(588,327);
for(const x of [35,88,612,681]){zone('M'+x+' 438 Q'+(x-34)+' 386 '+(x-12)+' 360 Q'+(x+9)+' 390 '+x+' 421 Q'+(x+6)+' 366 '+(x+26)+' 370 Q'+(x+34)+' 410 '+(x+8)+' 447Z')}
zone('M286 451 Q310 414 339 437 Q366 415 390 450 Q344 472 286 451Z');detail('M339 437 V456 M310 439 L323 455 M367 439 L354 455');
}
if(key==='winter-village'){
oval(611,65,25,25);cloud(127,66,.9);cloud(366,43,.7);
zone('M0 320 L156 104 L248 245 L386 83 L551 305 L650 185 L720 321 V480 H0Z');
zone('M0 349 Q154 310 300 350 Q520 304 720 351 V480 H0Z');
for(const [x,y,k] of [[160,220,1],[402,242,.85],[586,257,.65]]){ctx.save();ctx.translate(x,y);ctx.scale(k,k);zone('M-83 58 L0 -42 L83 58Z');zone('M-66 58 H66 V179 H-66Z');zone('M-13 179 V120 Q0 104 13 120 V179Z');for(const a of [-43,27]){zone('M'+a+' 80 H'+(a+24)+' V108 H'+a+'Z');detail('M'+(a+12)+' 80 V108 M'+a+' 94 H'+(a+24))}zone('M30 -7 V-46 H47 V13Z');zone('M-83 58 L0 -42 L83 58 L72 68 L0 -19 L-72 68Z');ctx.restore()}
for(const [x,y] of [[54,376],[306,335],[673,385]]){zone('M'+x+' '+(y-95)+' l-41 66 h22 l-29 44 h37 v20 h22 v-20 h36 l-28 -44 h22Z')}
oval(338,425,29,24);oval(338,391,23,23);oval(338,355,19,19);eye(332,350);eye(344,350);zone('M338 359 L361 363 L338 367Z');zone('M315 371 Q337 362 361 372 V386 Q338 382 315 386Z');detail('M322 394 L293 377 M355 394 L379 374');oval(338,394,3,3,true);oval(338,410,3,3,true);
detail('M61 448 Q122 433 169 451 M442 446 Q488 436 543 448');
}
if(key==='forest-picnic'){
cloud(140,54,.95);oval(613,74,33,33);
zone('M0 335 Q176 285 360 332 Q560 281 720 327 V480 H0Z');
zone('M24 320 V56 Q64 88 106 45 L112 93 Q94 173 100 320Z');for(const [x,y,r] of [[36,44,-.8],[83,56,.7],[117,85,.9]])leaf(x,y,r);
zone('M156 363 L567 350 L674 466 L58 466Z');for(const y of [385,413,442])detail('M'+(156-(y-363)*.9)+' '+y+' L'+(567+(y-350)*.85)+' '+y);
for(const x of [190,270,350,430,510])detail('M'+x+' 364 L'+(x+(x-350)*.44)+' 466');
oval(193,310,52,65);oval(148,234,16,47);oval(177,218,15,52);oval(179,263,48,42);eye(161,257);eye(195,257);oval(178,273,6,5,true);detail('M178 278 Q169 285 164 280 M178 278 Q188 285 194 280');
oval(498,292,54,64);oval(464,214,22,23);oval(534,214,22,23);oval(499,247,57,48);oval(499,267,23,16);eye(480,239);eye(518,239);oval(499,260,8,5,true);detail('M499 266 Q501 279 512 269');
zone('M286 299 L302 365 Q351 391 403 365 L418 299Z');zone('M286 299 Q350 279 418 299 L417 316 Q351 335 287 316Z');zone('M306 299 Q297 222 351 222 Q405 222 397 299 H383 Q390 240 351 240 Q312 240 320 299Z');detail('M310 330 L320 373 M335 333 L342 380 M365 333 L360 380 M392 330 L385 373');
oval(241,417,45,19);zone('M224 416 Q213 397 236 388 Q254 385 261 404 Q263 419 247 424Z');oval(555,409,44,18);zone('M535 405 L554 375 L574 405Z');
flower(678,325,.6);flower(54,350,.65);
}
if(key==='dragon-clouds'){
cloud(116,85,1.15);cloud(607,71,1.1);cloud(100,341,1.2);cloud(611,392,1.25);
oval(615,202,30,30);
zone('M296 259 Q216 137 149 158 Q186 198 169 264 Q219 220 254 286Z');detail('M179 179 Q232 208 254 269');
zone('M412 256 Q485 111 561 134 Q531 184 554 235 Q508 204 460 283Z');detail('M539 155 Q486 197 460 267');
zone('M412 354 Q495 420 582 345 L601 310 L606 355 L633 369 L600 379 Q509 452 410 392Z');
zone('M292 235 Q271 291 288 350 Q319 418 411 381 Q470 355 438 282 Q426 244 400 234Z');
zone('M322 265 Q298 319 331 369 Q366 388 388 360 Q413 312 379 267Z');detail('M322 304 Q353 321 397 305 M325 332 Q361 349 394 333');
zone('M278 185 Q244 145 284 129 L309 101 L323 132 Q352 119 375 132 L409 96 L419 139 Q462 168 447 211 Q429 258 358 251 Q282 258 278 185Z');zone('M309 104 L303 142 L328 134Z');zone('M409 96 L390 136 L419 139Z');
eye(319,183);eye(404,183);zone('M327 207 Q355 189 389 207 Q405 231 357 238 Q312 232 327 207Z');oval(344,213,3,4,true);oval(374,213,3,4,true);detail('M345 225 Q359 234 374 225');
oval(302,358,21,28);oval(425,356,21,28);oval(319,391,31,17);oval(406,391,31,17);
for(const [x,y] of [[82,211],[228,75],[513,56]])zone('M'+x+' '+(y-21)+' l6 14 15 7 -15 6 -6 15 -6 -15 -15 -6 15 -7Z');
}
if(key==='rabbit-workshop'){
zone('M20 25 H700 V376 H20Z');zone('M48 46 H248 V222 H48Z');zone('M63 61 H233 V208 H63Z');detail('M148 61 V208 M63 133 H233');
zone('M0 376 H720 V480 H0Z');
zone('M297 154 Q274 99 291 46 Q309 12 330 49 Q353 97 336 149Z');zone('M373 147 Q364 99 389 51 Q412 15 429 50 Q440 101 412 153Z');zone('M309 139 Q292 84 310 62 Q330 87 322 137Z');zone('M385 137 Q389 80 411 63 Q427 90 402 139Z');
zone('M287 246 Q258 285 272 370 H439 Q469 303 422 246Z');zone('M286 170 Q310 129 359 130 Q420 130 439 183 Q457 252 361 269 Q265 263 286 170Z');eye(328,197);eye(396,197);oval(362,222,8,6,true);detail('M362 227 Q349 242 337 230 M362 227 Q375 242 387 230');
zone('M307 274 L323 303 H398 L416 274 L420 368 H302Z');oval(362,337,29,19);detail('M333 332 H391');
zone('M27 355 H693 V381 H27Z');zone('M53 381 H75 V468 H53Z');zone('M647 381 H669 V468 H647Z');
zone('M452 334 L468 194 H622 L637 334Z');zone('M475 220 H613 V313 H475Z');zone('M455 334 H639 V352 H455Z');detail('M503 313 L480 353 M591 313 L612 353');
zone('M502 282 Q520 243 543 275 Q561 243 580 282 Q555 302 542 300 Q525 301 502 282Z');
zone('M115 307 H184 L173 352 H126Z');for(const x of [135,151,167])zone('M'+x+' 307 L'+(x-5)+' 250 L'+(x+4)+' 242 L'+(x+10)+' 307Z');
oval(211,343,17,9);oval(247,342,18,10);oval(306,348,18,11);oval(418,348,18,11);
}
if(key==='squirrel-autumn'){
oval(606,74,29,29);cloud(340,59,1);zone('M0 327 Q175 294 335 332 Q530 292 720 328 V480 H0Z');
zone('M39 331 Q62 220 45 71 L5 15 H98 L124 95 L191 42 L212 77 L131 151 Q111 236 133 330Z');detail('M75 87 Q92 222 78 308');
for(const [x,y,r] of [[190,88,1.1],[133,116,-.7],[222,135,.4],[74,46,-.9],[170,48,.7],[609,260,1.5],[657,179,-1.2],[534,109,.7]])leaf(x,y,r);
zone('M100 396 Q98 372 122 361 L135 326 Q145 304 166 326 L186 360 Q211 372 206 396Z');detail('M126 350 Q155 363 180 349');
zone('M363 368 Q488 386 548 300 Q608 206 529 157 Q466 114 423 177 Q400 224 436 254 Q468 280 495 252 Q478 309 409 310Z');
detail('M510 174 Q563 199 540 253 Q528 299 481 321');
zone('M276 274 Q244 305 268 370 Q313 421 377 380 Q405 346 386 293 Q371 263 343 263Z');oval(326,350,34,43);
zone('M263 226 L245 160 Q239 135 261 143 L293 174 Q325 157 352 170 L390 142 Q409 137 400 168 L383 221 Q390 259 351 276 Q306 291 275 263 Q260 250 263 226Z');zone('M259 156 L273 196 L289 179Z');zone('M389 155 L364 181 L381 194Z');eye(296,224);eye(350,221);oval(326,245,8,6,true);detail('M326 252 Q340 262 350 248');
zone('M281 306 Q300 269 320 299 Q346 270 363 304 L348 344 H299Z');zone('M299 298 Q296 281 319 278 Q343 277 350 298Z');detail('M304 287 L343 287');oval(282,319,16,23);oval(370,318,16,23);oval(286,393,25,13);oval(363,393,25,13);
for(const [x,y,r] of [[178,434,1.1],[217,401,-.9],[564,437,.9],[650,393,-1.2],[481,459,-.4]])leaf(x,y,r);
}
if(key==='owl-observatory'){
oval(607,76,29,29);
for(const [x,y] of [[97,67],[167,122],[334,45],[519,112],[657,151]])zone('M'+x+' '+(y-20)+' l6 14 14 6 -14 6 -6 14 -6 -14 -14 -6 14 -6Z');
zone('M0 366 Q165 288 326 361 Q526 299 720 359 V480 H0Z');
zone('M52 349 Q62 189 203 189 Q342 189 350 349Z');zone('M80 349 H322 V438 H80Z');zone('M168 438 V383 Q201 342 234 383 V438Z');
zone('M184 191 L216 189 L233 335 H194Z');detail('M68 313 Q200 284 336 313');
zone('M482 313 L397 222 L429 193 L519 278Z');zone('M397 222 L380 205 L427 158 L444 176 L429 193Z');zone('M494 304 L509 292 L550 334 L535 347Z');oval(517,331,16,17);zone('M510 345 H525 L577 446 H561 L518 371 L475 446 H458Z');
zone('M402 328 Q378 299 392 273 L386 248 L416 261 Q441 247 467 261 L499 245 L492 279 Q508 319 482 348 Q448 376 413 354Z');
oval(424,294,20,21);oval(467,294,20,21);eye(424,294);eye(467,294);zone('M437 312 L454 312 L445 326Z');zone('M411 331 Q388 320 401 349 Q416 366 433 352Z');zone('M477 330 Q498 318 490 348 Q477 365 460 353Z');detail('M433 337 Q444 327 456 337 M433 349 Q444 339 456 349');
oval(430,369,14,8);oval(463,369,14,8);zone('M389 376 H505 V394 H389Z');
}
if(key==='forest-train'){
cloud(141,59,1);oval(616,68,25,25);cloud(493,72,.8);
zone('M0 336 Q167 292 344 333 Q552 300 720 335 V480 H0Z');
for(const [x,y] of [[49,284],[658,279]]){zone('M'+x+' '+(y-90)+' l-40 61 h20 l-28 42 h38 v36 h20 v-36 h37 l-27 -42 h20Z')}
zone('M0 428 H720 V438 H0Z');zone('M0 457 H720 V467 H0Z');for(const x of [14,92,170,248,326,404,482,560,638])zone('M'+x+' 439 h30 l14 17 h-30Z');
zone('M60 310 H252 V408 H60Z');zone('M60 310 V226 H177 V310Z');zone('M48 212 H189 V230 H48Z');zone('M79 245 H153 V297 H79Z');
oval(115,273,24,23);oval(102,244,10,15);oval(128,244,10,15);eye(106,271);eye(123,271);oval(115,284,4,3,true);
zone('M194 310 V243 H220 V310Z');zone('M185 228 H229 V244 H185Z');zone('M252 353 L282 407 H252Z');oval(116,410,31,31);oval(214,410,31,31);oval(116,410,12,12);oval(214,410,12,12);
for(const [x,k] of [[295,0],[493,1]]){zone('M'+x+' 284 h170 v124 h-170Z');zone('M'+(x-9)+' 269 h188 v17 h-188Z');zone('M'+(x+18)+' 298 h134 v64 h-134Z');oval(x+45,409,24,24);oval(x+128,409,24,24);oval(x+45,409,8,8);oval(x+128,409,8,8);if(k===0){oval(x+85,330,31,26);oval(x+61,309,13,13);oval(x+109,309,13,13);eye(x+73,327);eye(x+98,327);oval(x+85,343,6,4,true)}else{zone('M'+(x+51)+' 335 l-5 -34 32 13 h15 l32 -13 -7 35 q-32 43 -67 -1Z');eye(x+70,331);eye(x+102,331);oval(x+86,343,5,4,true)}}
detail('M282 379 H295 M465 379 H493');cloud(208,165,.52);cloud(252,122,.65);
}
if(key==='duck-pond'){
ctx.save();ctx.scale(2,2);O(180,169,151,53);Z('M98 162 Q92 135 121 131 Q140 129 151 149 Q184 135 217 155 L248 136 Q244 179 197 190 Q129 205 98 162Z');O(126,123,24,24);Z('M105 122 L75 132 L105 141Z');E(118,117);Z('M155 164 Q180 144 202 162 Q181 183 160 175Z');O(52,194,27,10);O(282,195,27,10);F(52,177,.22);F(282,177,.22);C(55,36,.5);O(304,40,17,17);ctx.restore();
}
if(key==='puppy-kite'){
ctx.save();ctx.scale(2,2);Z('M0 182 Q85 145 180 182 T360 182 V240 H0Z');Z('M240 21 L307 62 L245 116 L202 58Z');D('M240 21 L245 116 M202 58 L307 62 M245 116 Q277 161 175 154');O(143,175,39,42);Z('M116 117 Q88 90 94 130 Q98 152 118 142Z');Z('M165 117 Q195 90 191 130 Q185 152 165 142Z');O(141,133,36,31);E(128,126);E(155,126);O(141,144,17,12);O(141,138,6,4,true);D('M141 142 Q137 151 131 146 M141 142 Q147 151 153 146');O(123,208,17,9);O(164,208,17,9);F(45,175,.4);F(310,175,.35);ctx.restore();
}
if(key==='panda-bamboo'){
ctx.save();ctx.scale(2,2);Z('M0 195 Q85 175 180 195 T360 195 V240 H0Z');for(const x of [32,67,282,320]){Z('M'+x+' 5 h11 v205 h-11Z');for(let y=40;y<200;y+=35)D('M'+x+' '+y+' h11');L(x+10,70,1);L(x,122,-1)}O(180,168,55,52);O(138,96,20,20);O(222,96,20,20);O(180,118,56,43);O(156,115,14,17);O(204,115,14,17);E(156,115);E(204,115);O(180,132,7,5,true);D('M180 137 Q174 143 168 140 M180 137 Q186 143 192 140');O(137,173,20,20);O(222,173,20,20);O(151,205,21,12);O(210,205,21,12);Z('M127 185 L226 152 L229 158 L130 191Z');L(230,156,.8);ctx.restore();
}
if(key==='turtle-beach'){
ctx.save();ctx.scale(2,2);O(305,37,18,18);C(76,35,.5);Z('M0 115 Q60 105 125 115 T250 115 T360 115 V240 H0Z');Z('M0 165 Q95 126 193 160 Q280 184 360 146 V240 H0Z');O(152,174,71,38);Z('M90 172 Q97 120 153 118 Q214 120 222 172Z');Z('M117 142 L152 125 L187 142 L174 165 L130 165Z');D('M117 142 L90 172 M187 142 L222 172 M130 165 L122 172 M174 165 L183 172');O(230,157,23,21);E(239,152);D('M235 164 Q241 169 246 162');O(111,196,18,11);O(189,196,18,11);Z('M75 163 L56 156 L65 172Z');Z('M285 205 Q296 185 308 197 Q321 184 333 205 Q309 222 285 205Z');D('M308 197 V213');ctx.restore();
}
if(key==='whale-splash'){
ctx.save();ctx.scale(2,2);C(62,33,.5);O(301,32,16,16);Z('M0 146 Q30 127 60 146 T120 146 T180 146 T240 146 T300 146 T360 146 V240 H0Z');Z('M77 136 Q58 102 97 84 Q152 51 223 95 Q253 119 273 99 Q281 71 316 77 Q305 90 313 108 Q297 126 273 124 Q241 177 163 183 Q94 184 77 136Z');Z('M82 143 Q131 160 176 154 Q214 148 241 134 Q226 180 163 183 Q105 185 82 143Z');E(114,118);D('M94 135 Q110 146 129 136');Z('M163 135 Q186 125 203 146 Q189 160 169 152Z');for(const [x,y] of [[150,52],[167,35],[183,56]])Z('M'+x+' '+(y-13)+' q-15 20 0 22 q15 -2 0 -22Z');ctx.restore();
}
if(key==='octopus-treasure'){
ctx.save();ctx.scale(2,2);Z('M0 197 Q85 180 175 198 T360 197 V240 H0Z');for(const [x,y] of [[31,55],[56,33],[310,51],[332,82]])O(x,y,8,8);Z('M103 143 Q61 149 53 169 Q44 193 67 192 Q87 190 79 176 Q106 200 126 172 Q130 209 151 198 Q171 189 159 173 Q186 206 207 195 Q228 185 203 171 Q243 192 259 167 Q269 152 238 147 Q263 133 245 113 Q217 121 210 132Z');O(161,109,56,49);E(144,108);E(179,108);D('M147 125 Q161 139 176 125');O(134,123,8,5);O(189,123,8,5);Z('M256 177 H335 V222 H256Z');Z('M256 177 Q295 140 335 177 V188 H256Z');Z('M290 185 H302 V205 H290Z');O(296,195,3,4,true);ctx.restore();
}
if(key==='spring-nest'){
ctx.save();ctx.scale(2,2);C(210,33,.5);O(312,40,17,17);Z('M0 0 H48 Q41 60 58 104 L152 141 L142 158 L64 131 Q75 184 55 240 H0Z');for(const [x,y,r] of [[71,48,.5],[95,77,.9],[112,115,1],[52,70,-1]])L(x,y,r);Z('M117 160 Q192 138 267 160 L243 199 Q192 218 141 199Z');D('M130 168 Q192 192 255 168 M137 182 Q192 203 247 183');for(const x of [159,191,222])O(x,162,12,16);Z('M160 132 Q169 81 214 94 Q235 100 240 117 L266 132 L237 139 Q223 162 194 158 Q171 155 160 132Z');E(213,112);Z('M170 130 Q190 108 218 132 Q199 150 175 142Z');F(310,178,.35);ctx.restore();
}
if(key==='rain-boots'){
ctx.save();ctx.scale(2,2);C(95,33,.8);C(270,40,.62);for(const [x,y] of [[45,75],[82,100],[134,77],[279,93],[319,71]])Z('M'+x+' '+(y-12)+' q-12 16 0 20 q12 -4 0 -20Z');Z('M0 177 Q90 159 175 178 T360 177 V240 H0Z');O(177,202,130,27);Z('M81 115 Q107 103 139 115 L132 172 Q160 174 159 196 H76 Q65 189 74 173Z');Z('M82 115 Q109 106 139 115 L137 128 H80Z');Z('M205 106 Q231 95 262 106 L257 165 Q284 171 285 190 H201 Q192 183 198 166Z');Z('M207 106 Q231 97 262 106 L261 120 H204Z');D('M76 186 H155 M201 180 H282');O(103,146,11,11);O(231,140,11,11);ctx.restore();
}
if(key==='sunflower-bee'){
ctx.save();ctx.scale(2,2);Z('M0 193 Q87 177 175 195 T360 193 V240 H0Z');F(115,103,1.3);F(52,168,.4);F(302,157,.45);O(230,80,18,21);O(253,78,18,21);O(240,106,32,22);O(215,107,15,17);E(211,105);D('M209 112 Q216 117 220 111 M211 91 Q205 80 198 82 M218 91 Q222 77 229 82');Z('M232 86 Q238 106 232 126 L241 128 Q246 106 241 85Z');Z('M253 87 Q261 105 254 124 L262 121 Q271 106 263 93Z');O(306,37,17,17);ctx.restore();
}
if(key==='apple-harvest'){
ctx.save();ctx.scale(2,2);Z('M0 182 Q90 160 180 179 T360 182 V240 H0Z');Z('M137 188 Q153 125 139 61 H181 Q168 124 191 188Z');Z('M68 92 Q45 51 92 37 Q119 10 156 31 Q200 4 229 41 Q277 41 275 79 Q294 122 237 138 Q190 149 159 127 Q105 149 68 92Z');for(const [x,y] of [[100,68],[156,50],[223,72],[129,109],[200,112]]){Z('M'+x+' '+y+' q-19 -10 -18 11 q3 17 18 16 q16 1 18 -16 q1 -21 -18 -11Z');D('M'+x+' '+y+' q-2 -10 5 -12');L(x+3,y-2,.9)}Z('M239 181 Q235 137 265 137 Q295 137 291 181 H283 Q287 146 265 146 Q243 146 247 181Z');O(261,175,12,11);O(282,176,12,11);Z('M226 179 H305 L295 220 H237Z');D('M232 192 H301 M235 204 H298 M245 182 L251 220 M274 182 V220');F(46,182,.38);ctx.restore();
}
if(key==='mushroom-house'){
ctx.save();ctx.scale(2,2);C(265,36,.5);Z('M0 190 Q85 170 175 190 T360 190 V240 H0Z');Z('M134 117 Q125 154 123 201 Q175 222 226 200 Q222 156 214 117Z');Z('M61 123 Q71 33 176 25 Q281 26 297 123 Q182 152 61 123Z');for(const [x,y,rx,ry] of [[123,78,20,14],[180,56,21,15],[243,85,21,15],[175,114,16,11]])O(x,y,rx,ry);Z('M160 211 V176 Q175 156 190 176 V211Z');O(184,191,3,3,true);O(144,158,14,14);O(207,158,14,14);D('M130 158 H158 M144 144 V172 M193 158 H221 M207 144 V172');F(58,174,.5);F(298,174,.5);ctx.restore();
}
if(key==='fairy-lantern'){
ctx.save();ctx.scale(2,2);O(305,39,20,20);Z('M0 200 Q90 175 180 200 T360 200 V240 H0Z');Z('M150 121 Q63 28 63 101 Q66 161 148 154Z');Z('M194 121 Q279 28 280 101 Q276 162 198 154Z');D('M78 92 Q122 101 145 140 M265 92 Q223 101 199 140');Z('M158 129 Q141 155 127 195 Q172 216 217 195 Q200 155 187 129Z');O(173,108,29,29);Z('M142 109 Q136 64 173 62 Q214 65 203 110 Q190 90 172 83 Q162 105 142 109Z');E(162,108);E(184,108);D('M164 120 Q173 127 182 120 M159 142 L127 161 M187 139 L240 126');O(173,67,12,10);Z('M235 121 H260 V158 H235Z');Z('M230 121 L248 104 L265 121Z');O(248,139,7,9);F(49,185,.38);F(306,186,.35);ctx.restore();
}
if(key==='unicorn-meadow'){
ctx.save();ctx.scale(2,2);C(60,35,.5);C(300,40,.5);Z('M0 171 Q90 145 180 172 T360 171 V240 H0Z');Z('M202 164 Q276 128 284 173 Q273 196 234 188 L226 179Z');Z('M133 131 Q181 118 224 141 Q243 163 217 182 H138 Q107 172 115 152Z');for(const x of [133,163,201,218])Z('M'+x+' 174 H'+(x+11)+' V212 H'+(x-2)+'Z');Z('M112 154 Q98 130 100 104 Q78 98 77 81 Q86 64 113 69 L128 56 Q157 67 157 105 L149 147Z');Z('M107 72 L103 35 L125 66Z');Z('M125 58 L146 18 L142 68Z');D('M138 35 L143 40 M133 46 L142 52');Z('M143 68 Q176 64 176 103 Q166 124 150 136 L154 108 Q143 86 143 68Z');E(111,89);O(89,90,4,3,true);D('M85 98 Q93 106 100 101');F(46,183,.4);F(312,183,.48);ctx.restore();
}
if(key==='pirate-map'){
ctx.save();ctx.scale(2,2);Z('M32 27 Q74 10 115 23 T200 24 T328 27 L338 205 Q296 224 253 214 T165 215 T24 212Z');Z('M78 150 Q42 126 79 79 Q114 42 158 81 Q178 103 154 126 Q124 154 137 176 Q84 190 78 150Z');Z('M193 62 Q225 42 276 59 Q309 75 286 109 Q258 127 217 115 Q184 96 193 62Z');Z('M212 171 Q233 140 274 158 Q301 180 271 200 Q225 209 212 171Z');D('M100 125 Q121 83 145 103 Q184 139 219 92 Q234 73 257 81');Z('M248 70 L263 85 L248 98 L239 89 L248 84 L239 78Z');Z('M87 109 L100 72 L114 109Z');Z('M105 109 L127 80 L140 109Z');O(53,53,14,14);D('M53 40 V67 M40 53 H67');Z('M239 172 H273 V192 H239Z');Z('M239 172 Q256 152 273 172Z');D('M253 172 V192');ctx.restore();
}
if(key==='moon-rocket'){
ctx.save();ctx.scale(2,2);O(290,49,34,34);O(276,41,7,7);O(303,59,8,8);for(const [x,y] of [[44,41],[79,98],[225,27],[324,151],[49,179]])Z('M'+x+' '+(y-11)+' l4 7 7 4 -7 4 -4 7 -4 -7 -7 -4 7 -4Z');Z('M141 160 Q118 115 134 68 Q146 30 180 12 Q214 30 226 68 Q241 115 219 160Z');Z('M134 68 Q146 30 180 12 Q214 30 226 68Z');O(180,97,28,28);O(180,97,19,19);Z('M135 126 Q91 144 98 184 L141 160Z');Z('M225 126 Q268 144 261 184 L219 160Z');Z('M155 160 H204 L199 175 H161Z');Z('M163 175 Q150 203 180 230 Q209 203 197 175Z');Z('M173 176 Q167 197 180 211 Q192 197 187 176Z');ctx.restore();
}
if(key==='planet-rover'){
ctx.save();ctx.scale(2,2);O(56,42,25,25);O(56,42,34,7);Z('M0 159 Q73 184 143 155 Q229 131 360 159 V240 H0Z');O(55,199,30,9);O(300,211,42,12);Z('M115 139 H245 L263 177 H96Z');Z('M115 139 V123 H245 V139Z');Z('M165 123 V79 H175 V123Z');Z('M143 80 Q170 45 194 80 Q170 97 143 80Z');O(170,75,7,7);Z('M133 150 H227 V168 H133Z');for(const x of [123,180,236]){O(x,182,21,21);O(x,182,8,8)}Z('M187 121 L230 94 H265 L224 121Z');D('M205 110 H243 M225 94 L204 121');ctx.restore();
}
if(key==='space-cat'){
ctx.save();ctx.scale(2,2);O(298,42,24,24);for(const [x,y] of [[47,40],[86,62],[237,32],[324,115]])Z('M'+x+' '+(y-9)+' l3 6 6 3 -6 3 -3 6 -3 -6 -6 -3 6 -3Z');Z('M0 186 Q95 160 180 186 T360 186 V240 H0Z');O(56,209,27,8);O(302,211,30,8);Z('M137 139 Q111 153 115 195 H245 Q248 153 222 139Z');Z('M143 150 H217 V182 H143Z');O(180,102,60,56);O(180,102,49,45);Z('M146 94 L136 62 L166 74 Q180 69 193 74 L224 62 L213 94 Q224 125 180 132 Q136 125 146 94Z');E(165,99);E(195,99);O(180,112,5,4,true);D('M180 116 Q175 121 170 117 M180 116 Q185 121 190 117 M149 113 L137 110 M211 113 L222 110');Z('M115 165 L91 178 L104 203 L126 190Z');Z('M245 165 L268 178 L255 203 L234 190Z');O(152,208,22,10);O(208,208,22,10);ctx.restore();
}
if(key==='sailing-boat'){
ctx.save();ctx.scale(2,2);O(57,35,18,18);C(174,32,.5);Z('M0 153 Q45 137 90 153 T180 153 T270 153 T360 153 V240 H0Z');Z('M255 154 L269 71 H298 L311 154Z');Z('M263 71 H303 L295 55 H273Z');Z('M274 45 H293 V55 H274Z');Z('M270 102 H302 V115 H267Z');Z('M267 129 H306 V142 H265Z');Z('M58 156 H233 L205 189 H87Z');Z('M144 156 V43 H150 V156Z');Z('M140 52 L55 146 H140Z');Z('M153 58 L224 146 H153Z');D('M87 176 H216 M102 167 H195');O(120,175,7,7);O(163,175,7,7);ctx.restore();
}
if(key==='city-bus'){
ctx.save();ctx.scale(2,2);Z('M0 165 H360 V240 H0Z');for(const [x,y,w] of [[17,48,72],[96,21,69],[174,56,57],[239,32,99]]){Z('M'+x+' '+y+' h'+w+' V165 H'+x+'Z');for(let a=x+10;a<x+w-12;a+=22)for(let b=y+11;b<100;b+=30)Z('M'+a+' '+b+' h12 v16 h-12Z')}Z('M47 124 Q47 106 69 106 H273 Q304 106 310 138 V185 H47Z');Z('M57 118 H269 Q286 118 293 136 H57Z');for(const x of [105,157,210])D('M'+x+' 118 V136');Z('M245 144 H295 V178 H245Z');D('M270 144 V178');Z('M49 149 H237 V163 H49Z');for(const x of [96,259]){O(x,186,21,21);O(x,186,8,8)}D('M0 224 H57 M92 224 H150 M185 224 H242 M277 224 H335');ctx.restore();
}
if(key==='garden-bicycle'){
ctx.save();ctx.scale(2,2);C(72,32,.5);O(302,36,16,16);Z('M0 188 Q90 165 180 188 T360 188 V240 H0Z');for(const x of [105,257]){O(x,168,48,48);O(x,168,38,38);D('M'+(x-37)+' 168 H'+(x+37)+' M'+x+' 131 V205');O(x,168,5,5)}Z('M105 168 L147 110 L221 110 L179 168Z');Z('M105 168 L147 110 L179 168Z');Z('M179 168 L221 110 L257 168Z');D('M147 110 L138 91 M126 91 H151 M221 110 L210 79 L231 74');O(179,168,11,11);Z('M229 75 H275 L265 108 H238Z');D('M237 87 H271 M240 98 H268');F(244,60,.22);F(261,57,.25);F(37,165,.33);ctx.restore();
}
if(key==='birthday-cake'){
ctx.save();ctx.scale(2,2);O(180,209,126,16);Z('M71 144 Q180 128 289 144 V201 Q180 224 71 201Z');Z('M71 144 Q94 124 289 144 V159 Q270 174 253 159 Q237 185 221 159 Q204 176 183 159 Q165 185 145 159 Q126 176 110 159 Q92 176 71 159Z');Z('M109 91 Q180 79 250 91 V144 Q180 160 109 144Z');Z('M109 91 Q180 75 250 91 V105 Q235 121 218 105 Q200 121 183 105 Q165 121 147 105 Q126 121 109 105Z');for(const x of [135,165,195,225]){Z('M'+x+' 60 h7 v31 h-7Z');Z('M'+(x+3)+' 38 q-14 18 0 21 q14 -3 0 -21Z');D('M'+x+' 68 l7 4 M'+x+' 77 l7 4')}for(const [x,y] of [[88,184],[125,190],[180,192],[235,190],[271,184]])O(x,y,9,9);for(const [x,y] of [[42,47],[314,55]]){O(x,y,20,26);D('M'+x+' '+(y+26)+' q-11 27 0 56')};ctx.restore();
}
if(key==='holiday-gifts'){
ctx.save();ctx.scale(2,2);Z('M0 206 Q90 191 180 206 T360 206 V240 H0Z');Z('M161 196 H183 V224 H161Z');Z('M172 16 L130 85 H148 L102 144 H126 L76 196 H267 L217 144 H241 L196 85 H213Z');Z('M172 6 l6 14 15 1 -12 10 4 15 -13 -8 -13 8 4 -15 -12 -10 15 -1Z');for(const [x,y] of [[170,71],[143,114],[200,113],[111,166],[175,165],[233,167]])O(x,y,10,10);D('M142 88 Q171 112 202 88 M120 143 Q170 175 225 143');for(const [x,y,w,h] of [[35,194,64,38],[241,187,72,44],[119,205,47,27]]){Z('M'+x+' '+y+' h'+w+' v'+h+' h-'+w+'Z');Z('M'+(x+w/2-4)+' '+y+' h8 v'+h+' h-8Z');Z('M'+x+' '+(y+11)+' h'+w+' v7 h-'+w+'Z');O(x+w/2-10,y-5,11,6);O(x+w/2+10,y-5,11,6)};ctx.restore();
}
if(key==='tea-party'){
ctx.save();ctx.scale(2,2);Z('M0 167 H360 V240 H0Z');Z('M30 16 H115 V97 H30Z');Z('M37 23 H108 V90 H37Z');D('M72 23 V90 M37 56 H108');O(169,122,41,36);O(138,66,15,15);O(201,66,15,15);O(170,86,42,33);E(157,81);E(183,81);O(170,97,16,12);O(170,92,6,4,true);D('M170 96 Q169 104 159 100 M170 96 Q176 104 182 100');Z('M43 145 H317 L339 167 H21Z');Z('M30 167 H329 V185 H30Z');Z('M45 185 H56 V234 H45Z');Z('M304 185 H315 V234 H304Z');O(232,153,31,10);Z('M209 114 Q232 105 256 114 L250 149 Q232 157 214 149Z');Z('M255 122 Q283 115 281 135 Q275 150 250 141 L252 136 Q274 144 275 132 Q275 125 254 128Z');O(232,114,23,6);O(101,153,38,10);Z('M75 139 H126 L119 151 H82Z');ctx.restore();
}
if(key==='bakery-window'){
ctx.save();ctx.scale(2,2);Z('M14 15 H345 V182 H14Z');Z('M25 24 H334 V60 H25Z');for(let x=30;x<330;x+=37)Z('M'+x+' 24 h18 v36 h-18Z');Z('M32 69 H328 V175 H32Z');Z('M42 80 H317 V166 H42Z');D('M42 123 H317');for(const [x,y] of [[79,105],[140,105],[201,105],[262,105]]){O(x,y,23,15);D('M'+(x-11)+' '+(y-8)+' l6 7 M'+x+' '+(y-9)+' l6 7 M'+(x+10)+' '+(y-8)+' l6 7')}for(const x of [79,140,201,262]){Z('M'+(x-16)+' 151 q-10 -22 16 -22 q26 1 16 22Z');Z('M'+(x-13)+' 151 h26 l-4 11 h-18Z');O(x,136,4,4)}Z('M0 182 H360 V240 H0Z');Z('M47 199 H313 L337 226 H22Z');ctx.restore();
}
if(key==='greenhouse'){
ctx.save();ctx.scale(2,2);O(306,30,16,16);C(55,34,.5);Z('M0 198 H360 V240 H0Z');Z('M50 198 V103 Q180 -25 309 103 V198Z');Z('M63 198 V107 Q180 -5 297 107 V198Z');D('M180 51 V198 M120 70 V198 M240 70 V198 M63 107 H297 M63 149 H297');Z('M75 173 H157 L149 216 H84Z');Z('M203 173 H284 L276 216 H211Z');for(const [x,y] of [[99,146],[134,139],[226,140],[261,147]]){Z('M'+(x-2)+' '+y+' h4 v30 h-4Z');L(x,y+14,-.9);L(x,y+21,.9);O(x,y,11,10)}Z('M165 197 V153 Q180 135 194 153 V197Z');D('M180 147 V197');F(26,175,.3);F(333,175,.3);ctx.restore();
}
if(key==='mountain-camp'){
ctx.save();ctx.scale(2,2);O(299,37,20,20);C(56,39,.55);Z('M0 153 L81 40 L138 123 L194 26 L295 154 L337 86 L360 121 V240 H0Z');Z('M51 83 L81 40 L112 86 L97 78 L84 90 L69 75Z');Z('M155 83 L194 26 L238 83 L222 74 L205 89 L190 71 L173 86Z');Z('M0 182 Q90 165 180 182 T360 182 V240 H0Z');Z('M72 203 L164 93 L268 203Z');Z('M164 93 L203 203 H268Z');Z('M164 130 L131 203 H200Z');D('M164 130 V203');Z('M280 205 Q276 190 290 185 L302 165 L310 189 Q329 198 315 212Z');Z('M272 217 L324 215 L327 222 L275 225Z');F(38,187,.32);ctx.restore();
}
if(key==='fox-snowsled'){
ctx.save();ctx.scale(2,2);C(67,29,.5);O(306,35,15,15);Z('M0 138 Q80 107 175 157 Q270 199 360 130 V240 H0Z');Z('M75 196 Q86 212 107 212 H283 Q297 212 300 202 L305 206 Q305 223 282 223 H103 Q74 223 70 202Z');Z('M91 182 H283 V194 H91Z');for(const x of [108,250])Z('M'+x+' 194 h9 v18 h-9Z');Z('M155 146 Q121 143 114 169 Q125 190 170 181 L186 165Z');Z('M114 169 Q128 191 147 180 L137 163Z');O(195,158,37,30);Z('M165 109 L157 75 L185 91 Q195 86 207 91 L237 75 L228 110 Q235 135 197 145 Q159 135 165 109Z');Z('M164 117 Q180 108 197 124 Q214 108 230 117 Q225 135 197 145 Q170 134 164 117Z');E(183,111);E(212,111);O(197,125,5,4,true);Z('M171 140 Q197 151 223 140 V150 Q198 161 172 150Z');Z('M217 149 L236 175 L224 181 L206 155Z');O(181,184,15,7);O(216,184,15,7);ctx.restore();
}
if(key==='butterfly-garden'){
ctx.save();ctx.scale(2,2);Z('M0 194 Q80 180 180 194 T360 194 V240 H0Z');F(52,135,.67);F(299,127,.7);Z('M173 112 Q109 17 72 44 Q39 80 103 132 Q129 148 171 137Z');Z('M187 112 Q250 17 288 44 Q321 80 256 132 Q230 148 188 137Z');Z('M171 137 Q110 119 95 162 Q107 217 158 183 L176 151Z');Z('M189 137 Q250 119 265 162 Q253 217 202 183 L183 151Z');O(180,130,8,45);O(180,83,11,11);D('M176 73 Q163 52 153 61 M184 73 Q197 52 206 61');for(const [x,y] of [[109,81],[251,81],[135,165],[225,165]]){O(x,y,18,21);O(x,y,8,11)}E(176,82);E(184,82);ctx.restore();
}

if(key==='moon-bat-garden'){
cloud(95,63,.85);oval(610,72,38,38);cloud(474,90,.6);
zone('M0 367 Q130 325 245 366 Q475 318 720 369 V480 H0Z');
for(const [x,y,k] of [[68,328,.85],[156,373,.65],[571,323,1],[662,377,.68]])flower(x,y,k);
zone('M319 192 Q248 90 91 112 Q139 155 126 212 Q179 172 203 251 Q242 202 267 274 Q299 237 339 254Z');
zone('M401 192 Q472 90 629 112 Q581 155 594 212 Q541 172 517 251 Q478 202 453 274 Q421 237 381 254Z');
detail('M319 192 Q250 136 126 212 M319 192 Q239 164 203 251 M319 192 Q278 213 267 274 M401 192 Q470 136 594 212 M401 192 Q481 164 517 251 M401 192 Q442 213 453 274');
oval(360,274,52,69);oval(360,290,30,39);
zone('M302 177 Q298 104 320 96 Q342 117 346 158 Q360 151 374 158 Q378 117 400 96 Q422 104 418 177 Q436 237 360 253 Q284 237 302 177Z');
zone('M314 164 Q309 128 321 119 Q331 135 335 160Z');zone('M406 164 Q411 128 399 119 Q389 135 385 160Z');
eye(338,193);eye(382,193);oval(360,210,8,5,true);detail('M360 217 Q350 231 340 220 M360 217 Q370 231 380 220');
oval(340,334,16,11);oval(380,334,16,11);
for(const [x,y] of [[233,57],[535,39],[435,43]])zone('M'+x+' '+(y-12)+' l4 8 10 2 -8 6 2 10 -8 -5 -8 5 2 -10 -8 -6 10 -2Z');
detail('M213 431 Q230 420 250 431 M460 426 Q485 415 505 426');
}
if(key==='nile-cat-voyage'){
oval(594,69,38,38);cloud(92,56,.75);
zone('M0 260 H720 V480 H0Z');
zone('M0 260 L150 89 L300 260Z');zone('M150 89 L208 260 H300Z');
zone('M222 260 L349 134 L476 260Z');zone('M349 134 L409 260 H476Z');
zone('M0 260 Q180 247 326 271 Q520 246 720 260 L720 480 H0Z');
zone('M540 260 Q561 197 553 148 L568 148 Q581 198 573 260Z');
for(const d of ['M560 148 Q500 106 472 153 Q511 143 560 162Z','M560 148 Q509 75 485 105 Q522 117 560 162Z','M560 148 Q568 74 608 98 Q577 125 560 162Z','M560 148 Q621 105 653 148 Q611 139 560 162Z'])zone(d);
zone('M126 344 Q360 368 595 344 L536 421 Q360 447 181 421Z');zone('M145 367 Q360 388 576 367 L557 389 Q360 414 163 389Z');
zone('M346 189 H358 V348 H346Z');zone('M365 193 Q444 231 497 322 H365Z');zone('M338 211 Q262 257 224 320 H338Z');
oval(294,342,44,35);zone('M255 296 L244 253 Q245 242 258 249 L282 266 Q302 259 320 268 L343 249 Q356 241 354 257 L340 295 Q356 333 298 337 Q240 333 255 296Z');
zone('M257 263 L265 286 L278 277Z');zone('M340 263 L319 277 L331 286Z');eye(280,298);eye(316,298);oval(298,311,6,4,true);detail('M298 315 Q289 325 281 317 M298 315 Q307 325 315 317');
oval(276,355,14,8);oval(320,355,14,8);
for(const [x,y] of [[56,410],[648,316],[630,453]]){oval(x,y,30,12);zone('M'+(x-17)+' '+(y-5)+' q-10 -28 17 -13 q26 -15 17 13 q-17 15 -34 0Z')}
detail('M24 302 Q58 292 92 302 M464 285 Q498 275 530 285 M31 451 Q65 441 99 451 M469 456 Q503 446 537 456');
}
ctx.restore();return true
}

const STORY_COLORING_SCENES=[
["Ёжик в цветочном саду","hedgehog-garden","Животные"],
["Лисёнок и сова у ручья","fox-owl-stream","Животные"],
["Медвежонок в библиотеке","bear-library","Дом"],
["Котёнок на воздушном шаре","kitten-balloon","Приключения"],
["Подводный дворец","undersea-palace","Море"],
["Волшебная зимняя деревня","winter-village","Природа"],
["Лесные звери на пикнике","forest-picnic","Животные"],
["Дракончик среди облаков","dragon-clouds","Сказки"],
["Зайчонок в мастерской","rabbit-workshop","Дом"],
["Белочка в осеннем парке","squirrel-autumn","Природа"],
["Совёнок в обсерватории","owl-observatory","Космос"],
["Лесной поезд с друзьями","forest-train","Транспорт"],
["Утёнок среди кувшинок","duck-pond","Животные"],
["Щенок запускает змея","puppy-kite","Животные"],
["Панда в бамбуковой роще","panda-bamboo","Животные"],
["Черепашка на пляже","turtle-beach","Море"],
["Кит и морские волны","whale-splash","Море"],
["Осьминожек нашёл клад","octopus-treasure","Море"],
["Птичка в весеннем гнезде","spring-nest","Природа"],
["Лужи после дождя","rain-boots","Природа"],
["Пчёлка у подсолнуха","sunflower-bee","Природа"],
["Сбор яблок в саду","apple-harvest","Природа"],
["Домик под грибной шляпкой","mushroom-house","Сказки"],
["Фея зажигает фонарик","fairy-lantern","Сказки"],
["Единорог на лугу","unicorn-meadow","Сказки"],
["Карта сокровищ","pirate-map","Сказки"],
["Ракета летит к Луне","moon-rocket","Космос"],
["Луноход на далёкой планете","planet-rover","Космос"],
["Космонавт-котёнок","space-cat","Космос"],
["Парусник и маяк","sailing-boat","Транспорт"],
["Автобус на городской улице","city-bus","Транспорт"],
["Велосипед с корзинкой","garden-bicycle","Транспорт"],
["Торт на день рождения","birthday-cake","Праздники"],
["Подарки под ёлочкой","holiday-gifts","Праздники"],
["Чаепитие с мишкой","tea-party","Дом"],
["Булочки в пекарне","bakery-window","Дом"],
["Теплица с овощами","greenhouse","Дом"],
["Палатка в горах","mountain-camp","Приключения"],
["Лисёнок на санках","fox-snowsled","Приключения"],
["Бабочка в саду","butterfly-garden","Природа"],
["Летучая мышка в лунном саду","moon-bat-garden","Животные"],
["Котёнок путешествует по Нилу","nile-cat-voyage","Приключения"]
];
const referenceColorFamilies = [
  ["Красные", "FDE7E2 F6B5AD EC7C78 D74452 A82241 661B37"],
  ["Оранжевые", "FFF0D7 FFD1A0 F6A652 D97A30 A84B22 69341F"],
  ["Жёлтые", "FFF8CF FCE99A F7D65D D8AB32 A17C24 6F541E"],
  ["Лайм", "E9F5CE C9E59A 9ACA68 69A842 3C7938 244E32"],
  ["Зелёные", "DBF4E4 B0E4C6 78C6A0 43A77E 277B60 184D40"],
  ["Бирюза", "D9F5F2 A0E3DD 62C8C2 299F9F 177577 164A50"],
  ["Голубые", "DDEFFA AED8F4 6CB6E7 3887C4 285C96 213C68"],
  ["Индиго", "E4E8FC BDC9F5 889CED 5669CB 3C469D 2B2E67"],
  ["Фиолетовые", "F1E5FD DCC3F4 BC91E2 9562C6 70449F 4A2C6F"],
  ["Розовые", "FAE3F1 F1BCD9 E28CB9 CA5894 963970 60264D"],
  ["Земляные", "F4E9DE E0C6AA BE9675 936B50 6A4939 412E29"],
  ["Нейтральные", "FFFFFF E6E9E7 C2C9C8 8A9595 4C595D 17262B"]
].map(([name, values]) => ({
  name,
  swatches: values.split(' ').map(hex => ['#' + hex.toLowerCase(), name + ' · #' + hex])
}));
const referenceColors = referenceColorFamilies.flatMap(family => family.swatches);

let projectStoreLoading;
function studioProjectStore(){
  if(projectStoreLoading)return projectStoreLoading;
  projectStoreLoading=new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.src='./studio-project-store.js?v='+APP_RELEASE;
    script.onload=()=>{
      script.remove();
      if(!window.createStudioProjectStore||!window.indexedDB||!crypto.subtle){reject(Error('storage'));return}
      resolve(createStudioProjectStore(indexedDB,crypto.subtle.digest.bind(crypto.subtle),projectIdentity));
    };
    script.onerror=()=>{script.remove();reject(Error('storage'))};
    document.head.append(script);
  }).catch(error=>{projectStoreLoading=null;throw error});
  return projectStoreLoading;
}

function projectIdentity(){return crypto.randomUUID?.()||id()}

function projectDataUrl(blob){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>resolve(reader.result);
    reader.onerror=()=>reject(Error('pixels'));
    reader.readAsDataURL(blob);
  });
}

function projectPng(canvas){
  return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('pixels')),'image/png'));
}

const projectBlends={'source-over':'Обычный',multiply:'Умножение',screen:'Экран',overlay:'Перекрытие',darken:'Затемнение',lighten:'Осветление','soft-light':'Мягкий свет'};

function newLayerCanvas(width,height){
  const canvas=document.createElement('canvas');
  canvas.width=width;canvas.height=height;
  return canvas;
}

async function loadProjectLayers(saved){
  const {detail,pixels}=saved;
  const layers=[];
  for(const layer of detail.layers){
    const source=await projectDataUrl(pixels.get(layer.hash));
    const image=await new Promise((resolve,reject)=>{
      const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('pixels'));img.src=source;
    });
    if(image.naturalWidth!==detail.width||image.naturalHeight!==detail.height)throw Error('dimensions');
    const canvas=newLayerCanvas(detail.width,detail.height);
    canvas.getContext('2d').drawImage(image,0,0);
    layers.push({id:layer.id,name:layer.name||'Слой',visible:layer.visible!==false,locked:layer.locked===true,
      opacity:layer.opacity??1,blend:layer.blend||'source-over',canvas});
  }
  return layers;
}

async function downloadProjectArchive(store,documentId){
  const saved=await store.read(documentId,true);
  if(!saved)throw Error('project');
  const assets=[];
  for(const [hash,blob] of saved.pixels)assets.push({hash,data:await projectDataUrl(blob)});
  const body=JSON.stringify({kind:'skazki-drawing-project',schemaVersion:1,revisions:saved.revisions,assets});
  if(body.length>40000000)throw Error('archive-size');
  const link=document.createElement('a');
  const url=URL.createObjectURL(new Blob([body],{type:'application/json'}));
  link.href=url;
  link.download='risunok-'+documentId.replace(/[^a-z0-9_-]/gi,'').slice(0,80)+'.json';
  document.body.append(link);
  try{link.click()}finally{link.remove();setTimeout(()=>URL.revokeObjectURL(url),500)}
}

async function prepareProjectArchive(store,file){
  if(!file||!file.size||file.size>40000000)throw Error('archive-size');
  const archive=JSON.parse(await readText(file));
  if(archive?.kind!=='skazki-drawing-project'||archive.schemaVersion!==1||!archiveKeysSafe(archive)||
     !Array.isArray(archive.assets)||archive.assets.length>256||!Array.isArray(archive.revisions)||
     archive.revisions.some(item=>item?.width!==720||item.height!==480||!item.layers?.length||item.layers.length>8))throw Error('archive');
  const pixels=new Map();
  for(const item of archive.assets){
    const prefix='data:image/png;base64,';
    if(!item||typeof item.hash!=='string'||pixels.has(item.hash)||typeof item.data!=='string'||!item.data.startsWith(prefix))throw Error('archive');
    const raw=atob(item.data.slice(prefix.length));
    const bytes=Uint8Array.from(raw,character=>character.charCodeAt(0));
    const image=rasterImageHeader(new DataView(bytes.buffer),bytes.byteLength);
    if(!image||image.type!=='image/png'||image.width!==720||image.height!==480)throw Error('archive');
    pixels.set(item.hash,bytes.buffer);
  }
  await store.validateArchive(archive.revisions,pixels);
  return {revisions:archive.revisions,pixels};
}

function setupProjectImport(store,status,visible){
  const field=$('projectArchiveFile'),button=$('projectImport'),preview=$('projectImportPreview'),confirm=$('confirmProjectImport');
  const cancel=$('cancelProjectImport');
  let pending=null,sequence=0;
  button.onclick=()=>field.click();
  cancel.onclick=()=>{pending=null;preview.hidden=true;button.focus()};
  field.onchange=async()=>{
    const file=field.files[0],request=++sequence;
    field.value='';
    pending=null;preview.hidden=true;
    if(!file)return;
    status.textContent='Проверяем архив…';
    try{
      const archive=await prepareProjectArchive(store,file);
      if(!visible()||request!==sequence)return;
      pending=archive;
      const latest=archive.revisions[archive.revisions.length-1];
      $('projectImportSummary').textContent='«'+latest.title+'», '+latest.width+' × '+latest.height+' px. Редакций в архиве '+archive.revisions.length+'.';
      status.textContent='Копия появится в списке проектов.';
      preview.hidden=false;
      confirm.focus();
    }catch(error){if(visible()&&request===sequence)status.textContent='Не удалось проверить архив. Проекты не изменены.'}
  };
  confirm.onclick=async()=>{
    if(!pending||confirm.disabled)return;
    confirm.disabled=button.disabled=cancel.disabled=true;
    try{
      await store.restore(pending.revisions,pending.pixels);
      if(visible()){artProjects();toast('Архив восстановлен отдельной копией.')}
    }catch(error){if(visible())status.textContent='Не удалось добавить копию. Архив остался у тебя.'}
    finally{confirm.disabled=button.disabled=cancel.disabled=false}
  };
}

async function artProjects(){
  openModal('Проекты рисунков','<p id="projectShelfStatus" role="status">Открываем проекты…</p><ul id="projectShelf"></ul><div class="actions"><button type="button" id="projectImport" disabled>Открыть архив</button><input type="file" id="projectArchiveFile" accept="application/json,.json" hidden><button type="button" id="projectShelfBack">В мастерскую</button></div><section id="projectImportPreview" hidden><p id="projectImportSummary"></p><button type="button" id="confirmProjectImport">Добавить копию</button><button type="button" id="cancelProjectImport">Отмена</button></section>','art-projects');
  $('projectShelfBack').onclick=artRoom;
  const list=$('projectShelf'),status=$('projectShelfStatus');
  const visible=()=>list.isConnected&&$('modal').hasAttribute('open');
  try{
    const store=await studioProjectStore();
    const projects=await store.list();
    if(!visible())return;
    $('projectImport').disabled=false;
    setupProjectImport(store,status,visible);
    status.textContent=projects.length?'Открой проект, чтобы продолжить рисунок.':'Здесь появятся рисунки, сохранённые как проекты.';
    for(const item of projects){
      if(typeof item.title!=='string')continue;
      const row=document.createElement('li'),open=document.createElement('button'),backup=document.createElement('button');
      open.type='button';open.textContent=item.title;
      open.onclick=async()=>{
        open.disabled=true;
        try{
          const saved=await store.read(item.documentId);
          if(!saved||saved.detail.layers.length>8||saved.detail.width!==720||saved.detail.height!==480)throw Error('profile');
          const layers=await loadProjectLayers(saved);
          if(visible())renderArtRoom({store,detail:saved.detail,layers});
        }catch(error){if(visible())status.textContent='Не удалось открыть проект. Сохранённый файл остался в списке.'}
        finally{open.disabled=false}
      };
      backup.type='button';backup.textContent='Скачать архив';backup.setAttribute('aria-label','Скачать архив «'+item.title+'»');
      backup.onclick=async()=>{
        backup.disabled=true;
        try{await downloadProjectArchive(store,item.documentId)}
        catch(error){if(visible())status.textContent=error.message==='archive-size'?'Полный архив превышает лимит экспорта. Проект остался сохранён.':'Не удалось скачать архив проекта.'}
        finally{backup.disabled=false}
      };
      row.append(open,backup);list.append(row);
    }
  }catch(error){if(visible())status.textContent='Не удалось открыть проекты. Попробуй вернуться позже.'}
}

function initDrawing(form,insertPicture,openedProject){
const panel=$('drawingPanel'),canvas=$('drawingCanvas'),composite=canvas.getContext('2d',{alpha:false}),start=$('drawStory');
let ctx=composite;
if(!ctx||!window.drawingStorage){start.disabled=true;return}
const palette=[["#25272a","Чёрный"],["#344b3d","Лесной"],["#79564a","Коричневый"],["#a97755","Карамель"],["#d6ab82","Песочный"],["#fffdf7","Белый"],["#bd3948","Красный"],["#e76f60","Коралловый"],["#f18eaa","Розовый"],["#f8bfd3","Нежно-розовый"],["#c24e83","Малиновый"],["#8e416f","Ягодный"],["#e48641","Оранжевый"],["#f1bc48","Золотой"],["#f8df71","Лимонный"],["#f9eabb","Сливочный"],["#f1b297","Персиковый"],["#ba7956","Терракота"],["#609a58","Травяной"],["#a5c76f","Салатовый"],["#d1e7a6","Мятный"],["#2d7b6e","Изумрудный"],["#70bfbd","Бирюзовый"],["#2c92a5","Морской"],["#87bee7","Небесный"],["#487ec3","Синий"],["#375378","Тёмно-синий"],["#b1b9ed","Лавандовый"],["#9b83b9","Сиреневый"],["#785098","Фиолетовый"],["#a7b1b5","Серебристый"],["#687480","Серый"],["#f6c2a5","Светлый персик"],["#a94e39","Кирпичный"],["#f8a24b","Мандариновый"],["#c47127","Медовый"],["#fff4b7","Светлый лимон"],["#d3a82b","Горчичный"],["#ff6981","Клубничный"],["#8c253b","Вишнёвый"],["#ffd9e4","Розовая дымка"],["#ce76b7","Орхидея"],["#6f365d","Сливовый"],["#e3ceff","Светлая сирень"],["#5e4497","Черничный"],["#d7eaff","Ледяной голубой"],["#204e83","Сапфировый"],["#3ba7df","Лазурный"],["#a7e4ed","Аквамарин"],["#106d83","Глубокий бирюзовый"],["#bdecd7","Светлая мята"],["#397f47","Тёмная трава"],["#8eaa42","Оливковый"],["#56713c","Хвойный"],["#eaf5c5","Светлый салат"],["#c6b09b","Светлый беж"],["#9c714c","Ореховый"],["#51382b","Шоколадный"],["#e8d3b0","Ванильный"],["#b1a1a5","Тауп"],["#e4e5e3","Светлый серый"],["#494f5b","Графитовый"],["#fef0e9","Фарфоровый"],["#fae2d0","Телесный светлый"],["#dc966f","Телесный тёплый"],["#af6f51","Телесный глубокий"],["#f6edaa","Бледно-золотой"],["#accbe4","Джинсовый"],["#c1acae","Пыльная роза"],["#86aeb0","Морская дымка"],["#b9b7d9","Сумеречный"],["#39475f","Ночной"]];
let picked=false,color=palette[1][0],width=brushWidths()[1],pointer=null,last=null,dirty=false,undo=[],redo=[],seed=1,fillMode=false,eraser=false,restoring=false,stored=false,lessonStep=0,effect='solid',distance=0,hue=0,opacity=1;
const paper='#fffdf7';
const art=form.storyArt,storage=openedProject?null:drawingStorage(DRAWING_DRAFT,DRAWING_OUTLINE,art,drawingFingerprint);
let project=openedProject?.detail,projectWrite=null,projectGeneration=0;
let layers=openedProject?.layers,activeLayerId=project?.activeLayerId||layers?.[0].id;
const activeLayer=()=>layers.find(layer=>layer.id===activeLayerId);
if(layers)ctx=activeLayer().canvas.getContext('2d');
let layerPanel;
function editableLayer(){
  if(!layers||activeLayer().visible&&!activeLayer().locked)return true;
  $('drawingStatus').textContent='Выбери видимый и разблокированный слой.';
  return false;
}
function renderProject(){
  if(!layers)return;
  composite.save();composite.fillStyle=paper;composite.fillRect(0,0,canvas.width,canvas.height);
  for(const layer of layers){
    if(!layer.visible)continue;
    composite.globalAlpha=layer.opacity;
    composite.globalCompositeOperation=layer.blend;
    composite.drawImage(layer.canvas,0,0);
  }
  composite.restore();
}

function selectLayer(id){activeLayerId=id;ctx=activeLayer().canvas.getContext('2d')}

function updateLayers(action){
  if(restoring)return;
  endStroke();remember();action();dirty=true;changed();showLayerRows();
}

function showLayerRows(){
  const rows=$('projectLayerRows'),previous=document.activeElement?.dataset.layerAction;
  rows.replaceChildren();
  $('projectLayersCount').textContent='Слои · '+layers.length+' из 8';
  $('addProjectLayer').disabled=layers.length>=8;
  for(let index=layers.length-1;index>=0;index--){
    const layer=layers[index],row=document.createElement('li');
    const button=(text,key,action)=>{
      const control=document.createElement('button');
      control.type='button';control.textContent=text;control.dataset.layerAction=layer.id+':'+key;
      control.onclick=action;row.append(control);return control;
    };
    const select=button(layer.name,'select',()=>{if(layer.id!==activeLayerId)updateLayers(()=>selectLayer(layer.id))});
    select.setAttribute('aria-pressed',String(layer.id===activeLayerId));
    button(layer.visible?'Скрыть':'Показать','visible',()=>updateLayers(()=>{layer.visible=!layer.visible}));
    button(layer.locked?'Разблокировать':'Заблокировать','lock',()=>updateLayers(()=>{layer.locked=!layer.locked}));
    if(layer.id===activeLayerId){
      const move=(offset)=>updateLayers(()=>{layers.splice(index,1);layers.splice(index+offset,0,layer)});
      button('Выше','up',()=>move(1)).disabled=index===layers.length-1;
      button('Ниже','down',()=>move(-1)).disabled=index===0;
      button('Переименовать','name',()=>{
        const name=prompt('Название слоя',layer.name)?.trim().slice(0,80);
        if(name&&name!==layer.name)updateLayers(()=>{layer.name=name});
      });
      button('Дублировать','duplicate',()=>updateLayers(()=>{
        const target=newLayerCanvas(canvas.width,canvas.height);
        target.getContext('2d').drawImage(layer.canvas,0,0);
        const duplicate={...layer,id:projectIdentity(),name:layer.name.slice(0,70)+' · копия',canvas:target};
        layers.splice(index+1,0,duplicate);selectLayer(duplicate.id);
      })).disabled=layers.length>=8;
      button('Удалить','remove',()=>{
        if(confirm('Удалить слой «'+layer.name+'»?'))updateLayers(()=>{layers.splice(index,1);selectLayer(layers[Math.max(0,index-1)].id)});
      }).disabled=layers.length===1;
      const opacity=document.createElement('input'),opacityLabel=document.createElement('label');
      opacity.type='range';opacity.min=0;opacity.max=100;opacity.value=String(Math.round(layer.opacity*100));
      opacity.dataset.layerAction=layer.id+':opacity';opacityLabel.textContent='Непрозрачность';opacityLabel.append(opacity);
      opacity.onchange=()=>updateLayers(()=>{layer.opacity=Number(opacity.value)/100});row.append(opacityLabel);
      const blend=document.createElement('select'),blendLabel=document.createElement('label');
      for(const [value,caption] of Object.entries(projectBlends))blend.add(new Option(caption,value));
      blend.value=layer.blend;blend.dataset.layerAction=layer.id+':blend';blendLabel.textContent='Режим смешивания';blendLabel.append(blend);
      blend.onchange=()=>updateLayers(()=>{layer.blend=blend.value});row.append(blendLabel);
    }
    rows.append(row);
  }
  if(previous)Array.from(rows.querySelectorAll('[data-layer-action]')).find(control=>control.dataset.layerAction===previous)?.focus({preventScroll:true});
}

function setupLayerPanel(){
  layerPanel=document.createElement('section');
  layerPanel.className='project-layer-panel';layerPanel.hidden=true;layerPanel.setAttribute('aria-label','Слои');
  layerPanel.innerHTML='<div class="actions"><strong id="projectLayersCount"></strong><button type="button" id="addProjectLayer">Добавить слой</button><button type="button" id="closeProjectLayers">Готово</button></div><ol id="projectLayerRows"></ol>';
  form.querySelector('.studio-workspace').append(layerPanel);
  const open=$('openProjectLayers');open.hidden=false;
  function show(value){
    endStroke();layerPanel.hidden=!value;open.setAttribute('aria-expanded',String(value));
    if(value){if(!pro.hidden)showPro(false);extra(null);$('studioMore').open=false;showLayerRows();$('closeProjectLayers').focus({preventScroll:true})}
    else{$('studioMore').open=true;open.focus({preventScroll:true})}
  }
  open.onclick=()=>show(true);
  $('closeProjectLayers').onclick=()=>show(false);
  layerPanel.onkeydown=event=>{if(event.key==='Escape'){event.preventDefault();show(false)}};
  $('addProjectLayer').onclick=()=>{
    if(layers.length>=8)return;
    updateLayers(()=>{
      const layer={id:projectIdentity(),name:'Слой '+(layers.length+1),visible:true,locked:false,opacity:1,blend:'source-over',canvas:newLayerCanvas(canvas.width,canvas.height)};
      layers.push(layer);selectLayer(layer.id);
    });
  };
}
let outlineKey=null,outlineLayer=null,outlineBarrier=null;
function setOutline(key){if(outlineLayer){outlineLayer.width=0;outlineLayer.height=0}outlineKey=null;outlineLayer=null;outlineBarrier=null;if(!key||!ORIGINAL_COLORING_IDS.includes(key))return;const layer=document.createElement('canvas');layer.width=canvas.width;layer.height=canvas.height;const c=layer.getContext('2d');if(!c||!originalColoring(c,key))return;const img=c.getImageData(0,0,layer.width,layer.height),barrier=new Uint8Array(layer.width*layer.height);for(let i=0;i<barrier.length;i++){const p=i*4,ink=img.data[p]<225||img.data[p+1]<225||img.data[p+2]<215;barrier[i]=ink?1:0;img.data[p+3]=ink?255:0}c.putImageData(img,0,0);outlineKey=key;outlineLayer=layer;outlineBarrier=barrier}
function protectOutline(){if(layers){renderProject();return}if(outlineLayer)ctx.drawImage(outlineLayer,0,0)}
const controls=$('drawingColors'),basicColors=new Set(['#25272a','#344b3d','#79564a','#fffdf7','#bd3948','#f18eaa','#e48641','#f1bc48','#609a58','#87bee7','#487ec3','#785098','#70bfbd','#a5c76f','#f8df71','#9b83b9']);
const pro=$('studioProPane'),proEffect=$('proEffect'),proColor=$('proColor'),proWidth=$('proWidth'),proOpacity=$('proOpacity');
const sets={warm:[6,7,12,13,16,17,33,35],cool:[21,22,23,24,25,26,47,48],pastel:[8,9,15,20,27,43,45,50],nature:[1,2,3,4,18,19,52,53],night:[26,29,42,44,46,49,61,71],bright:[6,12,14,19,22,25,38,41]};
const paletteSelect=$('proPalette');
for(const [index,family] of referenceColorFamilies.entries()){
  paletteSelect.add(new Option(family.name,'reference-'+index));
}
paletteSelect.add(new Option('Привычные цвета','legacy'));
function selectedSwatches(){
  const selected=paletteSelect.value;
  if(selected==='all')return referenceColors;
  if(selected==='legacy')return palette;
  if(selected.startsWith('reference-'))return referenceColorFamilies[Number(selected.slice(10))].swatches;
  return sets[selected].map(index=>palette[index]);
}
function mixColor(a,b,t){return '#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(b.slice(i,i+2),16)*t).toString(16).padStart(2,'0')).join('')}
function choosePro(c){endStroke();color=c;$('drawingCustom').value=c;picked=eraser=fillMode=false;rememberColor(c);toolSync()}
function swatches(host,items){while(host.children.length>items.length)host.lastElementChild.remove();for(let i=0;i<items.length;i++){const [c,name]=items[i];let b=host.children[i];if(!b){b=document.createElement('button');b.type='button';b.className='drawing-color';b.onclick=()=>choosePro(b.dataset.color);host.append(b)}if(b.dataset.color!==c){b.dataset.color=c;b.style.setProperty('--swatch',c)}if(b.getAttribute('aria-label')!==name)b.setAttribute('aria-label',name);const on=String(c===color);if(b.getAttribute('aria-pressed')!==on)b.setAttribute('aria-pressed',on)}}
let previewKey='';
function proSync(){if(pro.hidden)return;proColor.value=color;proEffect.value=effect;proWidth.value=width;proOpacity.value=Math.round(opacity*100);$('proWidthValue').textContent=width;$('proOpacityValue').textContent=Math.round(opacity*100)+'%';const mix=mixColor(color,$('proSecond').value,Number($('proRatio').value)/100);$('proMixSample').style.background=mix;$('proMixSample').title=mix;swatches($('proSwatches'),selectedSwatches());swatches($('proShades'),[[-.75,'Очень тёмный'],[-.4,'Темнее'],[-.2,'Тёмный'],[0,'Текущий'],[.25,'Светлее'],[.5,'Светлый'],[.75,'Очень светлый']].map(([v,n])=>[mixColor(color,v<0?'#000000':'#ffffff',Math.abs(v)),n]));const key=[color,effect,width,opacity].join('|');if(key===previewKey)return;previewKey=key;const c=$('proPreview'),g=c.getContext('2d');g.fillStyle='#fffdf7';g.fillRect(0,0,c.width,c.height);if(stampEffects.has(effect)){for(let i=0;i<4;i++)studioStamp(g,30+i*60,32,Math.min(22,width*.73+5),effect,color,opacity)}else for(let i=0;i<16;i++)studioStroke(g,{x:12+i*13,y:32+Math.sin(i*.5)*5},{x:25+i*13,y:32+Math.sin((i+1)*.5)*5},Math.min(width,50),effect,color,i*24,opacity)}
function showPro(on){endStroke();if(on)extra(null);pro.hidden=!on;$('studioPro').setAttribute('aria-expanded',String(on));if(on)proSync();else $('studioPro').focus({preventScroll:true})}
for(const b of panel.querySelectorAll('[data-effect]')){const o=document.createElement('option');o.value=b.dataset.effect;o.textContent=b.textContent.trim();proEffect.append(o)}
$('studioPro').onclick=()=>showPro(pro.hidden);$('studioProClose').onclick=()=>showPro(false);paletteSelect.onchange=proSync;proColor.oninput=()=>choosePro(proColor.value);$('proSecond').oninput=$('proRatio').oninput=proSync;$('proMix').onclick=()=>choosePro(mixColor(color,$('proSecond').value,Number($('proRatio').value)/100));proEffect.onchange=()=>{effect=proEffect.value;picked=eraser=fillMode=false;toolSync()};proWidth.oninput=()=>{width=Number(proWidth.value);toolSync()};proOpacity.oninput=()=>{opacity=Number(proOpacity.value)/100;toolSync()};
const recentColorKey='skazki-recent-colors-v1';let recentColors=[];try{const a=JSON.parse(fget(recentColorKey)||'[]');if(Array.isArray(a))recentColors=a.filter(c=>/^#[0-9a-f]{6}$/i.test(c)).slice(0,4)}catch(e){}
const recentHost=document.createElement('div');recentHost.id='recentDrawingColors';recentHost.setAttribute('role','group');recentHost.setAttribute('aria-label','Недавние цвета');controls.after(recentHost);
function showRecent(){recentHost.replaceChildren();if(!recentColors.length)return;const label=document.createElement('small');label.textContent='Недавние';recentHost.append(label);for(const c of recentColors){const b=document.createElement('button');b.type='button';b.className='drawing-color';b.style.setProperty('--swatch',c);b.setAttribute('aria-label','Недавний цвет '+c);b.setAttribute('aria-pressed',String(c===color));b.onclick=()=>{color=c;$('drawingCustom').value=c;picked=false;eraser=false;toolSync();showRecent()};recentHost.append(b)}}
function rememberColor(c){recentColors=[c,...recentColors.filter(x=>x!==c)].slice(0,4);fput(recentColorKey,JSON.stringify(recentColors));showRecent()}
showRecent();
$('paletteMore').onclick=()=>{const expanded=$('paletteMore').getAttribute('aria-expanded')!=='true';$('paletteMore').setAttribute('aria-expanded',String(expanded));$('paletteMore').textContent=expanded?'Основные':'Все цвета';controls.classList.toggle('palette-expanded',expanded)};
for(const [c,label] of palette){
const b=document.createElement('button');b.type='button';b.className='drawing-color';b.style.setProperty('--swatch',c);b.setAttribute('aria-label',label);b.setAttribute('aria-pressed',String(c===color));b.textContent=' ';b.dataset.color=c;if(!basicColors.has(c))b.dataset.extended='true';b.onclick=()=>{endStroke();color=c;$('drawingCustom').value=c;picked=false;rememberColor(c);if(eraser){eraser=false;fillMode=false}toolSync()};controls.append(b);
}
function toolSync(){$('drawingFullColor').value=color;proSync();for(const b of panel.querySelectorAll('[data-effect]'))b.setAttribute('aria-pressed',String(!picked&&!eraser&&!fillMode&&b.dataset.effect===effect));for(const b of controls.querySelectorAll('button'))b.setAttribute('aria-pressed',String(!eraser&&b.dataset.color===color));for(const b of panel.querySelectorAll('[data-tool]'))b.setAttribute('aria-pressed',String(b.dataset.tool===(picked?'pick':eraser?'eraser':fillMode?'fill':'brush')));for(const b of panel.querySelectorAll('[data-width]'))b.setAttribute('aria-pressed',String(Number(b.dataset.width)===width))}
for(const b of panel.querySelectorAll('[data-tool]'))b.onclick=()=>{endStroke();picked=b.dataset.tool==='pick';eraser=b.dataset.tool==='eraser';fillMode=b.dataset.tool==='fill';toolSync()};for(const b of panel.querySelectorAll('[data-width]'))b.onclick=()=>{endStroke();width=Number(b.dataset.width);toolSync()};$('drawingCustom').oninput=()=>{const c=$('drawingCustom').value;if(/^#[0-9a-f]{6}$/i.test(c)){color=c;picked=false;eraser=false;rememberColor(c);toolSync()}};for(const b of panel.querySelectorAll('[data-effect]')){b.onclick=()=>{effect=b.dataset.effect;picked=false;eraser=false;fillMode=false;toolSync();extra(null)}};toolSync();
function effectPreviews(show){
for(const b of panel.querySelectorAll('[data-effect]')){
const existing=b.querySelector('canvas');
if(show&&!existing){const c=document.createElement('canvas');c.width=100;c.height=40;c.setAttribute('aria-hidden','true');b.prepend(c);studioEffectPreview(c,b.dataset.effect)}
else if(!show&&existing){existing.width=0;existing.height=0;existing.remove()}
}
}
function extra(which){if(which&&!pro.hidden)showPro(false);effectPreviews(which==='effects');if(which==='lessons')lesson();else $('lessonPicture').textContent='';form.querySelector('.studio-workspace').classList.toggle('lesson-layout',which==='lessons');form.classList.toggle('lesson-active',which==='lessons');if(which)$('studioMore').open=false;if(which==='templates'){const img=$('premiumColoring').querySelector('img');if(!img.hasAttribute('src'))img.src=premiumArt.coloring;renderColorings()}else releaseColoringPreviews();$('studioExtras').hidden=!which;$('studioTemplatePane').hidden=which!=='templates';$('studioLessonPane').hidden=which!=='lessons';$('studioEffectPane').hidden=which!=='effects';$('studioExtraTitle').textContent=which==='lessons'?'Учусь рисовать':which==='effects'?'Волшебные кисти':'Раскраски';$('studioEffects').setAttribute('aria-expanded',String(which==='effects'));$('studioQuickBrush').setAttribute('aria-expanded',String(which==='effects'));$('studioTemplates').setAttribute('aria-expanded',String(which==='templates'));$('studioLessons').setAttribute('aria-expanded',String(which==='lessons'))}
$('studioTemplates').onclick=()=>extra(!$('studioExtras').hidden&&!$('studioTemplatePane').hidden?null:'templates');$('studioLessons').onclick=()=>extra(!$('studioExtras').hidden&&!$('studioLessonPane').hidden?null:'lessons');$('studioExtraClose').onclick=()=>extra(null);$('studioQuickBrush').onclick=()=>extra(!$('studioExtras').hidden&&!$('studioEffectPane').hidden?null:'effects');$('studioEffects').onclick=()=>extra(!$('studioExtras').hidden&&!$('studioEffectPane').hidden?null:'effects');const sceneGallery=$('storyColoringGallery'),catalogSelect=$('coloringCategory'),catalogSearch=$('coloringSearch'),catalogMore=$('coloringMore'),catalogCount=$('coloringCount');
const catalogKey='skazki-coloring-preferences-v1';let prefs={liked:[],recent:[]};try{const p=JSON.parse(fget(catalogKey)||'{}');for(const k of ['liked','recent'])if(Array.isArray(p[k]))prefs[k]=p[k].filter(id=>ORIGINAL_COLORING_IDS.includes(id)).slice(0,80)}catch(e){}
function savePrefs(){fput(catalogKey,JSON.stringify(prefs))}
const matches=()=>{const q=normalizedStorySearch(catalogSearch.value),v=catalogSelect.value;return STORY_COLORING_SCENES.filter((item,i)=>(v==='all'||v==='new'&&i>=12||v==='liked'&&prefs.liked.includes(item[1])||v==='recent'&&prefs.recent.includes(item[1])||item[2]===v)&&(!q||normalizedStorySearch(item[0]+' '+item[2]).includes(q))).sort((a,b)=>v==='recent'?prefs.recent.indexOf(a[1])-prefs.recent.indexOf(b[1]):0)};
for(const cat of [...new Set(STORY_COLORING_SCENES.map(x=>x[2]).filter(Boolean))]){const opt=document.createElement('option');opt.value=cat;opt.textContent=cat;catalogSelect.append(opt)}
let catalogPage=0;
function releaseColoringPreviews(){for(const thumb of sceneGallery.querySelectorAll('canvas')){thumb.width=0;thumb.height=0}sceneGallery.replaceChildren()}
function renderColorings(){const list=matches(),max=Math.max(0,Math.ceil(list.length/8)-1);const source=document.createElement('canvas');source.width=720;source.height=480;const sourceCtx=source.getContext('2d');catalogPage=Math.min(catalogPage,max);releaseColoringPreviews();catalogCount.textContent=list.length?'Раскраски '+(catalogPage*8+1)+'–'+Math.min(list.length,(catalogPage+1)*8)+' из '+list.length:'Здесь пока нет раскрасок';$('coloringPrev').disabled=catalogPage===0;catalogMore.disabled=catalogPage>=max;$('coloringSurprise').disabled=!list.length;
for(const item of list.slice(catalogPage*8,catalogPage*8+8)){const tile=document.createElement('div');tile.className='coloring-tile';const button=document.createElement('button');button.type='button';button.className='story-coloring-choice';button.setAttribute('aria-label','Раскрасить: '+item[0]);const thumb=document.createElement('canvas');thumb.width=240;thumb.height=160;thumb.setAttribute('aria-hidden','true');const preview=thumb.getContext('2d');if(preview&&sourceCtx&&originalColoring(sourceCtx,item[1]))preview.drawImage(source,0,0,240,160);const label=document.createElement('strong');label.textContent=item[0];button.append(thumb,label);button.onclick=()=>{if(generate(item[1],item[2],true)){prefs.recent=[item[1],...prefs.recent.filter(x=>x!==item[1])].slice(0,24);savePrefs();picked=false;fillMode=true;eraser=false;effect='solid';toolSync();extra(null)}};const like=document.createElement('button');like.type='button';like.className='coloring-like';like.setAttribute('aria-label','Любимая раскраска: '+item[0]);const syncLike=()=>{const on=prefs.liked.includes(item[1]);like.textContent=on?'♥':'♡';like.setAttribute('aria-pressed',String(on))};syncLike();like.onclick=()=>{prefs.liked=prefs.liked.includes(item[1])?prefs.liked.filter(x=>x!==item[1]):[...prefs.liked,item[1]];savePrefs();if(catalogSelect.value==='liked')renderColorings();else syncLike()};tile.append(button,like);sceneGallery.append(tile)}
source.width=0;source.height=0;
}
catalogSelect.onchange=catalogSearch.oninput=()=>{catalogPage=0;renderColorings()};catalogMore.onclick=()=>{catalogPage++;renderColorings();sceneGallery.scrollIntoView({block:'nearest'})};$('coloringPrev').onclick=()=>{catalogPage--;renderColorings();sceneGallery.scrollIntoView({block:'nearest'})};$('coloringSurprise').onclick=()=>{const list=matches();if(!list.length)return;const unseen=list.filter(x=>!prefs.recent.includes(x[1]));const pool=unseen.length?unseen:list.filter(x=>x[1]!==prefs.recent[0]);const item=(pool.length?pool:list)[Math.floor(Math.random()*(pool.length||list.length))];if(generate(item[1],item[2],true)){prefs.recent=[item[1],...prefs.recent.filter(x=>x!==item[1])].slice(0,24);savePrefs();picked=false;fillMode=true;eraser=false;effect='solid';toolSync();extra(null)}};
$('premiumColoring').onclick=()=>loadPremiumColoring();for(const b of panel.querySelectorAll('[data-hero]'))b.onclick=()=>{if(generate('forest',b.dataset.hero,true))extra(null)};
function clearPaper(){if(layers){ctx.clearRect(0,0,canvas.width,canvas.height);return}ctx.fillStyle=paper;ctx.fillRect(0,0,canvas.width,canvas.height)}
let unreadableSource=false,sourceLoad=0;
function showUnreadableDrawing(){
const recovery=art?'Новый рисунок можно скачать как PNG.':'Новый рисунок можно сохранить в галерею или скачать как PNG.';
$('drawingStatus').textContent='Рисунок не открылся. Старый черновик сохранён без изменений. '+recovery;
}
async function projectInput(meta,outline){
  const frameLayers=layers||[{id:meta.layers[0].id,name:'Слой 1',canvas}];
  const active=activeLayerId||frameLayers[0].id;
  const captured=await Promise.all(frameLayers.map(async({canvas:source,...fields})=>({...fields,blob:await projectPng(source)})));
  return {schemaVersion:1,documentId:meta.documentId,title:meta.title,width:canvas.width,height:canvas.height,outline,
    activeLayerId:active,layers:captured};
}
function onProjectCanvas(){return $('drawingCanvas')===canvas&&$('modal').hasAttribute('open')}
function persistProject(){
  if(restoring||unreadableSource||stored)return Promise.resolve(stored);
  if(projectWrite)return projectWrite;
  const generation=projectGeneration,currentProject=project,outline=outlineKey;
  let confirmed=false;
  $('drawingStatus').textContent='Сохраняем проект…';
  projectWrite=projectInput(currentProject,outline).then(frame=>openedProject.store.commit(frame,currentProject.revision)).then(saved=>{
    project=saved;
    stored=generation===projectGeneration;
    confirmed=true;
    if(onProjectCanvas()&&stored)$('drawingStatus').textContent='Проект сохранён на этом устройстве.';
    return true;
  },error=>{
    if(onProjectCanvas())$('drawingStatus').textContent=error.message==='conflict'?'Проект изменился в другой вкладке. Сохрани копию проекта.':'Не удалось сохранить проект. Повтори или скачай PNG.';
    return false;
  }).finally(()=>{
    projectWrite=null;
    if(!onProjectCanvas())return;
    sync();
    if(confirmed&&!stored&&pointer===null)persistProject();
  });
  return projectWrite;
}
let projectCopyBusy=false;
$('drawingSaveProject').onclick=async()=>{
  if(projectCopyBusy||restoring||!dirty)return;
  endStroke();
  projectCopyBusy=true;
  sync();
  try{
    const title=project?project.title.slice(0,110)+' · копия':($('storyTitle')?.value.trim()||'Рисунок '+new Date().toLocaleString('ru-RU')).slice(0,120);
    const meta={documentId:projectIdentity(),title,layers:[{id:projectIdentity()}]},outline=outlineKey;
    const [frame,store]=await Promise.all([projectInput(meta,outline),studioProjectStore()]);
    await store.commit(frame,null);
    if(onProjectCanvas()){$('studioMore').open=false;toast('Копия сохранена в «Проекты».')}
  }catch(error){if(onProjectCanvas())toast('Не удалось сохранить копию. Можно скачать PNG.')}
  finally{projectCopyBusy=false;if(onProjectCanvas())sync()}
};
function sync(){
 form.dataset.drawingDirty=!stored&&(project?!restoring:dirty)?'yes':'no';
 $('drawingUndo').disabled=restoring||!undo.length;
 $('drawingRedo').disabled=restoring||!redo.length;
 $('drawingSave').disabled=restoring||(project?unreadableSource:!dirty||!!art&&unreadableSource);
 $('drawingFullSave').disabled=$('drawingSave').disabled;
 $('drawingRescue').disabled=restoring||!dirty;
 $('drawingSaveProject').disabled=restoring||!dirty||projectCopyBusy;
}
function persist(){
 if(project)return persistProject();
 if(restoring||dirty&&stored)return;
 if(unreadableSource){showUnreadableDrawing();return}
 try{stored=storage.store(dirty?(art?canvas.toDataURL():drawingJPEG(canvas)):null,outlineKey)}
 catch(e){stored=false}
 $('drawingStatus').textContent=stored?'Черновик рисунка сохранён на этом устройстве.':'Не сохранено. Повтори или скачай PNG.';sync()
}
function endStroke(){const id=pointer;pointer=null;last=null;if(id!==null){try{canvas.releasePointerCapture(id)}catch(e){}if(dirty&&!stored)persist()}}
form.flushDrawingDraft=()=>{if(restoring)return;endStroke();if((project||dirty)&&!stored)persist()};
function changed(){projectGeneration++;stored=false;renderProject();sync();persist()}
function lesson(){const item=drawingLesson($('lessonSubject').value,lessonStep);$('lessonPicture').innerHTML=item.svg;$('lessonInstruction').textContent=item.instruction;$('lessonPrev').disabled=lessonStep===0;$('lessonNext').disabled=lessonStep===item.total-1;$('lessonNext').textContent=lessonStep===item.total-1?'Урок завершён':'Следующий шаг';$('lessonPicture').setAttribute('aria-label','Образец: шаг '+(lessonStep+1)+' из '+item.total)}
$('lessonSubject').onchange=()=>{lessonStep=0;lesson()};$('lessonPrev').onclick=()=>{lessonStep=Math.max(0,lessonStep-1);lesson()};$('lessonNext').onclick=()=>{const total=drawingLesson($('lessonSubject').value,lessonStep).total;lessonStep=Math.min(total-1,lessonStep+1);lesson()};
const expand=$('drawingExpand'),view=$('studioViewport'),detail=$('drawingDetail'),pan=$('drawingPan'),modal=$('modal');
const zoomLevels=[1,1.4,1.8,2.2],zoomOut=$('drawingZoomOut'),zoomIn=$('drawingZoomIn');let zoom=0;
function panMode(on){modal.classList.toggle('canvas-pan',on);pan.setAttribute('aria-pressed',String(on));pan.setAttribute('aria-label',on?'Вернуться к рисованию':'Двигать лист')}
function setZoom(level){
 const before=canvas.getBoundingClientRect(),frame=view.getBoundingClientRect();
 const x=(frame.left+view.clientWidth/2-before.left)/(before.width||1),y=(frame.top+view.clientHeight/2-before.top)/(before.height||1);
 zoom=Math.max(0,Math.min(zoomLevels.length-1,level));
 view.dataset.scale=zoomLevels[zoom];modal.classList.toggle('canvas-detail',zoom>0);
 detail.setAttribute('aria-pressed',String(zoom>0));detail.setAttribute('aria-label',zoom?'Весь лист':'Увеличить лист');
 detail.textContent=Math.round(zoomLevels[zoom]*100)+'%';zoomOut.disabled=!zoom;zoomIn.disabled=zoom===zoomLevels.length-1;
 if(!zoom)panMode(false);
 drawingFitHandler?.();
 const after=canvas.getBoundingClientRect();
 view.scrollLeft=zoom?view.scrollLeft+after.left+after.width*x-frame.left-view.clientWidth/2:0;
 view.scrollTop=zoom?view.scrollTop+after.top+after.height*y-frame.top-view.clientHeight/2:0;
}
function enlarge(on){endStroke();if(!pro.hidden)showPro(false);const before=canvas.getBoundingClientRect().width;modal.classList.toggle('canvas-full',on);expand.setAttribute('aria-pressed',String(on));expand.textContent=on?'↙ Уменьшить':'⛶ На весь экран';setZoom(zoom);if(on&&!zoom&&canvas.getBoundingClientRect().width<before*1.12)setZoom(1);expand.focus({preventScroll:true})}
detail.onclick=()=>{if(pointer===null)setZoom(zoom?0:1)};
zoomOut.onclick=()=>{if(pointer===null)setZoom(zoom-1)};
zoomIn.onclick=()=>{if(pointer===null)setZoom(zoom+1)};
pan.onclick=()=>{if(pointer===null)panMode(!modal.classList.contains('canvas-pan'))};
let drag=null;view.addEventListener('pointerdown',e=>{if(!modal.classList.contains('canvas-pan')||drag||e.button>0)return;e.preventDefault();drag={id:e.pointerId,x:e.clientX,y:e.clientY,left:view.scrollLeft,top:view.scrollTop};try{view.setPointerCapture(e.pointerId)}catch(err){}});
view.addEventListener('pointermove',e=>{if(drag&&drag.id===e.pointerId){view.scrollLeft=drag.left+drag.x-e.clientX;view.scrollTop=drag.top+drag.y-e.clientY}});
for(const event of ['pointerup','pointercancel','lostpointercapture'])view.addEventListener(event,e=>{if(drag&&drag.id===e.pointerId)drag=null});
expand.onclick=()=>enlarge(expand.getAttribute('aria-pressed')!=='true');$('drawingFullSave').onclick=()=>$('drawingSave').click();
$('drawingFullColor').oninput=()=>{const c=$('drawingFullColor').value;if(/^#[0-9a-f]{6}$/i.test(c)){color=c;$('drawingCustom').value=c;picked=false;eraser=false;fillMode=false;rememberColor(c);toolSync()}};
function capture(){return {pixels:ctx.getImageData(0,0,canvas.width,canvas.height),dirty,outlineKey,
  layers:layers?.map(layer=>({...layer})),activeLayerId}}
function restoreDrawing(frame){
 if(frame.layers){layers=frame.layers;activeLayerId=frame.activeLayerId;ctx=activeLayer().canvas.getContext('2d');}
 ctx.putImageData(frame.pixels,0,0);
 if(frame.outlineKey!==outlineKey)setOutline(frame.outlineKey);
 dirty=frame.dirty;changed();
 if(layerPanel&&!layerPanel.hidden)showLayerRows();
}
function remember(){undo.push(capture());if(undo.length>12)undo.shift();redo=[]}
function point(e,r=canvas.getBoundingClientRect()){if(!r.width||!r.height)return {x:0,y:0};return {x:Math.max(0,Math.min(canvas.width,(e.clientX-r.left)*canvas.width/r.width)),y:Math.max(0,Math.min(canvas.height,(e.clientY-r.top)*canvas.height/r.height))}}
function line(to,pressure=1){const erase=!!layers&&eraser;if(erase){ctx.save();ctx.globalCompositeOperation='destination-out'}const w=eraser?width:Math.max(1,width*pressure),kind=eraser?'solid':effect,dx=to.x-last.x,dy=to.y-last.y,len=Math.hypot(dx,dy);if(!eraser&&stampEffects.has(kind)){const spacing=Math.max(16,w*1.65);if(len===0){studioStamp(ctx,to.x,to.y,Math.max(3,w*.73),kind,color,opacity);distance=0}else{for(let t=spacing-distance;t<=len;t+=spacing)studioStamp(ctx,last.x+dx*t/len,last.y+dy*t/len,Math.max(3,w*.73),kind,color,opacity);distance=(distance+len)%spacing}}else{hue=(hue+Math.max(5,len*2))%360;studioStroke(ctx,last,to,w,kind,eraser?paper:color,hue,eraser?1:opacity)}if(erase)ctx.restore();last=to}
const penWidth=e=>$('proPressure').checked&&e.pointerType==='pen'&&e.pressure>0?Math.max(.2,Math.min(1,e.pressure)):1;
let lastPressure=1;
function appendStrokePoint(event,bounds,ending=false){
  const next=point(event,bounds);
  if(next.x===last.x&&next.y===last.y)return;
  const pressure=ending&&event.pointerType==='pen'&&event.pressure===0?lastPressure:penWidth(event);
  line(next,pressure);
  lastPressure=pressure;
}
canvas.addEventListener('pointerdown',e=>{if(!pro.hidden||layerPanel&&!layerPanel.hidden||modal.classList.contains('canvas-pan')||restoring||e.button>0)return;if(pointer!==null){if(!e.isPrimary)return;endStroke()}e.preventDefault();if(picked){const p=point(e),v=composite.getImageData(Math.min(canvas.width-1,Math.floor(p.x)),Math.min(canvas.height-1,Math.floor(p.y)),1,1).data;color='#'+Array.from(v.slice(0,3)).map(n=>n.toString(16).padStart(2,'0')).join('');$('drawingCustom').value=color;picked=false;eraser=false;fillMode=false;rememberColor(color);toolSync();return}if(!editableLayer())return;if(fillMode){const p=point(e),image=ctx.getImageData(0,0,canvas.width,canvas.height),rgba=[parseInt(color.slice(1,3),16),parseInt(color.slice(3,5),16),parseInt(color.slice(5,7),16),255];if(artFill(image.data,canvas.width,canvas.height,Math.min(canvas.width-1,p.x),Math.min(canvas.height-1,p.y),rgba,layers&&activeLayerId!==layers[0].id?null:outlineBarrier)){remember();ctx.putImageData(image,0,0);protectOutline();dirty=true;changed()}return}remember();distance=0;pointer=e.pointerId;last=point(e);try{canvas.setPointerCapture(pointer)}catch(err){}lastPressure=penWidth(e);line(last,lastPressure);protectOutline();dirty=true;projectGeneration++;stored=false;sync()});
canvas.addEventListener('pointermove',event=>{
  if(pointer!==event.pointerId)return;
  event.preventDefault();
  let samples;
  try{samples=event.getCoalescedEvents?.()}catch(error){}
  const bounds=canvas.getBoundingClientRect();
  for(const sample of samples||[])appendStrokePoint(sample,bounds);
  appendStrokePoint(event,bounds);
  if(layers){if(!previewFrame)previewFrame=requestAnimationFrame(()=>{previewFrame=0;renderProject()})}
  else protectOutline();
});
let previewFrame=0;
function finish(event){
  if(pointer!==event.pointerId)return;
  if(event.type==='pointerup'){
    appendStrokePoint(event,canvas.getBoundingClientRect(),true);
  }
  if(previewFrame){cancelAnimationFrame(previewFrame);previewFrame=0}
  protectOutline();
  endStroke();
}
for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,finish);
$('drawingUndo').onclick=()=>{if(pointer!==null||!undo.length)return;redo.push(capture());restoreDrawing(undo.pop())};
$('drawingRedo').onclick=()=>{if(pointer!==null||!redo.length)return;undo.push(capture());restoreDrawing(redo.pop())};
function loadPremiumColoring(){if(restoring||pointer!==null||!editableLayer())return;if(dirty&&!confirm('Начать новую раскраску? Старую можно вернуть кнопкой отмены.'))return;restoring=true;sync();const img=new Image();img.onload=()=>{if($('drawingCanvas')!==canvas)return;remember();setOutline(null);clearPaper();const f=studioFitImage(canvas.width,canvas.height,img.naturalWidth||img.width,img.naturalHeight||img.height);ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(img,f.x,f.y,f.w,f.h);ctx.restore();dirty=true;restoring=false;picked=false;eraser=false;fillMode=true;effect='solid';toolSync();changed();extra(null)};img.onerror=()=>{restoring=false;sync();toast('Не удалось открыть раскраску. Попробуй с интернетом или выбери другую.')};img.src=premiumArt.coloring}
function generate(place,hero,outline){if(restoring||pointer!==null||!editableLayer())return false;if(dirty&&!confirm('Начать новую картинку? Старую можно вернуть кнопкой отмены.'))return false;remember();if(outline&&originalColoring(ctx,place))setOutline(place);else{setOutline(null);artScene(ctx,place,hero,outline,++seed)}dirty=true;changed();return true}
$('artGenerate').onclick=()=>{if(generate($('artPlace').value,$('artHero').value,$('artMode').value==='outline'))extra(null)};
$('drawingClear').onclick=()=>{if(restoring||!dirty||!editableLayer())return;endStroke();if(!confirm(storage?.current()!==false?'Начать рисунок заново?':'Очистить только этот лист? Другой сохранённый рисунок останется. Можно сначала скачать PNG.'))return;remember();setOutline(null);clearPaper();dirty=false;changed()};
$('drawingCancel').onclick=async()=>{if(restoring)return;endStroke();if(project){await persistProject();if(stored&&onProjectCanvas())artProjects();return}if(dirty){persist();if(!stored){toast('Не сохранено. Повтори или скачай PNG.');return}}extra(null);panel.hidden=true;focusDrawing(false);if(form.id==='standaloneDrawing')closeModal();else form.returnToWords?.(1)};
$('drawingSave').onclick=async()=>{if($('drawingSave').disabled)return;endStroke();if(project){await persistProject();if(stored&&onProjectCanvas())artProjects();return}try{if(!insertPicture(drawingJPEG(canvas),art&&canvas.toDataURL()))return;dirty=false;undo=[];redo=[];setOutline(null);clearPaper();if(!art)persist();extra(null);panel.hidden=true;focusDrawing(false);if(form.id==='standaloneDrawing'){artGallery()}else{form.returnToWords?.(1);toast('Рисунок добавлен в сказку.')}}catch(e){toast('Повтори сохранение или скачай PNG.')}};
$('drawingRescue').onclick=()=>{if(restoring||!dirty)return;endStroke();try{const a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download='moi-risunok.png';document.body.append(a);a.click();a.remove()}catch(e){toast('Не удалось скачать рисунок.')}};
form.openDrawing=()=>{form.classList.remove('keyboard-writing','keyboard-title');panel.hidden=false;focusDrawing(true);setZoom(0);if(art){$('drawingSave').textContent=$('drawingFullSave').textContent=art.editing?'Готово':'Вставить в сказку'}};
form.loadDrawing=(src,outline)=>{
const load=++sourceLoad,hasSource=src!==null&&src!==undefined;
const isCurrent=()=>load===sourceLoad&&$('drawingCanvas')===canvas&&modal.hasAttribute('open');
setOutline(null);clearPaper();undo=[];redo=[];dirty=unreadableSource=stored=false;restoring=hasSource;sync();
$('drawingStatus').textContent=hasSource?'Открываем рисунок…':'Выбери цвет и рисуй.';
if(!hasSource)return;
function failed(){if(!isCurrent())return;restoring=false;unreadableSource=true;sync();showUnreadableDrawing()}
if(!/^data:image\/(?:jpeg|png);base64,/.test(src)){failed();return}
const image=new Image();
image.onload=()=>{
if(!isCurrent())return;
try{
const f=studioFitImage(canvas.width,canvas.height,image.naturalWidth,image.naturalHeight);
ctx.drawImage(image,f.x,f.y,f.w,f.h);setOutline(outline);protectOutline();
}catch(e){setOutline(null);clearPaper();failed();return}
dirty=stored=true;restoring=false;sync();$('drawingStatus').textContent='Продолжай свой сохранённый рисунок.';
};
image.onerror=failed;
image.src=src
};
if(project){$('drawingSave').textContent=$('drawingFullSave').textContent='Сохранить проект';setOutline(project.outline);dirty=stored=true;renderProject();sync();$('drawingStatus').textContent='Продолжай свой сохранённый рисунок.';setupLayerPanel();}
else if(!art){const item=storage.load();form.loadDrawing(item.src,item.outline)}
if(form.id==='standaloneDrawing')focusDrawing(true);else if(!art)$('drawingFullSave').textContent='Вставить в сказку';
}
