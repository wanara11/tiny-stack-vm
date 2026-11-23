// tiny-stack-vm: exact interpreter for make.fun's tiny stack ISA v1 (ISA.md in the bounty kit).
// Runs each /input/<id>/program.bin on its input.bin; writes /output/<id>/stdout.bin and exit.txt.
import{mkdirSync,readdirSync,readFileSync,writeFileSync}from'node:fs';
import{join}from'node:path';
// Decode tables by opcode byte: immediate length, values popped, values pushed (-1 = no such opcode).
const IM=new Int8Array(256).fill(-1),PO=new Int8Array(256),PU=new Int8Array(256);
const d=(o,i,p,u)=>{IM[o]=i;PO[o]=p;PU[o]=u};
d(0,0,0,0);d(1,1,0,1);d(2,4,0,1);d(3,0,1,0);d(4,0,1,2);d(5,0,2,2);d(6,0,2,3);d(7,0,3,3);
for(let o=16;o<31;o++)d(o,0,o===23||o===27?1:2,1);
for(let o=32;o<35;o++)d(o,0,2,1);
d(48,2,0,0);d(49,2,1,0);d(50,2,1,0);d(51,2,0,0);d(52,0,0,0);d(64,0,1,1);d(65,0,2,0);
d(80,0,1,0);d(81,0,1,0);d(82,0,0,1);d(83,0,1,0);
function run(p,inp){
const n=p.length,D=new Int32Array(256),C=new Int32Array(64),M=new Int32Array(256),out=new Uint8Array(65536);
let sp=0,cp=0,ol=0,ip=0,pc=0,st=0;
const end=(code)=>({out:out.subarray(0,ol),code});
for(;;){
if(st===1000000)return end(10);
if(pc<0||pc>=n)return end(9);
const op=p[pc],im=IM[op];
if(im<0)return end(5);
if(pc+im>=n)return end(9);
st++;
const pops=PO[op];
if(sp<pops)return end(2);
if(sp-pops+PU[op]>256)return end(3);
const nx=pc+1+im;
pc=nx;
switch(op){
case 0:return end(0);
case 1:D[sp++]=(p[nx-1]<<24)>>24;break;
case 2:D[sp++]=p[nx-4]|(p[nx-3]<<8)|(p[nx-2]<<16)|(p[nx-1]<<24);break;
case 3:sp--;break;
case 4:D[sp]=D[sp-1];sp++;break;
case 5:{const t=D[sp-1];D[sp-1]=D[sp-2];D[sp-2]=t;break}
case 6:D[sp]=D[sp-2];sp++;break;
case 7:{const a=D[sp-3];D[sp-3]=D[sp-2];D[sp-2]=D[sp-1];D[sp-1]=a;break}
case 23:D[sp-1]=-D[sp-1]|0;break;
case 27:D[sp-1]=~D[sp-1];break;
case 16:case 17:case 18:case 19:case 20:case 21:case 22:
case 24:case 25:case 26:case 28:case 29:case 30:
case 32:case 33:case 34:{
const b=D[sp-1],a=D[sp-2];
let r;
if(op===16)r=(a+b)|0;
else if(op===17)r=(a-b)|0;
else if(op===18)r=Math.imul(a,b);
else if(op===19){if(!b)return end(4);r=a===-2147483648&&b===-1?a:(a/b)|0}
else if(op===20){if(!b)return end(4);r=b===-1?0:a%b|0}
else if(op===21){if(!b)return end(4);r=Math.floor((a>>>0)/(b>>>0))|0}
else if(op===22){if(!b)return end(4);r=(a>>>0)%(b>>>0)|0}
else if(op===24)r=a&b;
else if(op===25)r=a|b;
else if(op===26)r=a^b;
else if(op===28)r=a<<(b&31);
else if(op===29)r=a>>(b&31);
else if(op===30)r=(a>>>(b&31))|0;
else if(op===32)r=a===b?1:0;
else if(op===33)r=a<b?1:0;
else r=(a>>>0)<(b>>>0)?1:0;
D[sp-2]=r;sp--;
break}
case 48:case 49:case 50:{
const rel=((p[nx-2]|(p[nx-1]<<8))<<16)>>16;
if(op===48||(op===49)===(D[--sp]===0))pc=nx+rel;
break}
case 51:
if(cp===64)return end(7);
C[cp++]=nx;
pc=p[nx-2]|(p[nx-1]<<8);
break;
case 52:
if(cp===0)return end(8);
pc=C[--cp];
break;
case 64:{
const ad=D[sp-1];
if(ad<0||ad>255)return end(6);
D[sp-1]=M[ad];
break}
case 65:{
const ad=D[sp-1];
if(ad<0||ad>255)return end(6);
M[ad]=D[sp-2];
sp-=2;
break}
case 80:{
const s=String(D[sp-1]);
if(ol+s.length>65536)return end(11);
sp--;
for(let i=0;i<s.length;i++)out[ol++]=s.charCodeAt(i);
break}
case 81:
if(ol>=65536)return end(11);
out[ol++]=D[--sp]&255;
break;
case 82:D[sp++]=ip<inp.length?inp[ip++]:-1;break;
case 83:return end(D[sp-1]&255);
}
}
}
const I=process.env.MAKEFUN_INPUT_DIR??'/input';
const O=process.env.MAKEFUN_OUTPUT_DIR??'/output';
for(const id of readdirSync(I).sort()){
let r;
try{r=run(readFileSync(join(I,id,'program.bin')),readFileSync(join(I,id,'input.bin')))}
catch{r={out:new Uint8Array(0),code:0}}
mkdirSync(join(O,id),{recursive:true});
writeFileSync(join(O,id,'stdout.bin'),r.out);
writeFileSync(join(O,id,'exit.txt'),r.code+'\n');
}
