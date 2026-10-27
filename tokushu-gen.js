// 特殊算パズルの問題をつくる部品（ゲームのページと、有料ステージづくりの両方で使います）
var TokushuGen=(function(){
const ri=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
// 10ずつ・1ずつの操作で、差 d をうめる最少の手数
const steps=d=>{d=Math.abs(d);const t=Math.floor(d/10),o=d%10;return o?Math.min(t+o,t+1+(10-o)):t;};

function tsuru(lv){
  let lo,hi,n,k;
  if(lv===1){n=ri(6,12);k=ri(1,n-1);lo={nm:'つる',v:2};hi={nm:'かめ',v:4};
    return {t:'tsuru',lv,n,k,lo,hi,unit:'本',cnt:'ひき',
      story:`つるとかめが合わせて${n}ひきいます。足の数は全部で${2*(n-k)+4*k}本です。`,ask:'かめは何びき？',goal:2*(n-k)+4*k,opt:k};}
  if(lv===2){n=ri(8,14);k=ri(2,n-2);lo={nm:'10円',v:10};hi={nm:'50円',v:50};
    const M=10*(n-k)+50*k;
    return {t:'tsuru',lv,n,k,lo,hi,unit:'円',cnt:'まい',story:`10円玉と50円玉が合わせて${n}まいあり、全部で${M}円です。`,ask:'50円玉は何まい？',goal:M,opt:k};}
  const p=pick([60,80,90]),q=p+pick([20,30,40,50]);n=ri(10,16);k=ri(2,n-2);
  lo={nm:'みかん',v:p};hi={nm:'りんご',v:q};const M=p*(n-k)+q*k;
  return {t:'tsuru',lv,n,k,lo,hi,unit:'円',cnt:'こ',story:`1こ${p}円のみかんと1こ${q}円のりんごを合わせて${n}こ買い、代金は${M}円でした。`,ask:'りんごは何こ？',goal:M,opt:k};
}
function wasa(lv){
  const B=lv===1?ri(4,12):lv===2?ri(15,35):ri(30,70), D=lv===1?ri(2,8):lv===2?ri(4,20):ri(10,40), S=2*B+D;
  const [A,Bn,obj,u]=pick([['兄','弟','おはじき','こ'],['姉','妹','ビーズ','こ'],['赤ぐみ','白ぐみ','玉','こ']]);
  return {t:'wasa',lv,S,D,B,A,Bn,obj,u,story:`${A}と${Bn}の${obj}は、合わせて${S}${u}です。${A}は${Bn}より${D}${u}多くもっています。`,ask:`${Bn}は何${u}？`,opt:steps(B)};
}
function ueki(lv){
  let mode,d,m;
  if(lv===1){mode=pick(['both','none']);d=pick([2,3,4,5]);m=ri(4,8);}
  else if(lv===2){mode=pick(['both','circle','none']);d=pick([3,4,5,6]);m=ri(7,12);}
  else {mode=pick(['two','circle','none']);d=pick([4,5,6,8]);m=mode==='two'?ri(5,8):ri(9,12);}
  const L=d*m;
  const req=mode==='both'?m+1:mode==='none'?m-1:mode==='circle'?m:2*(m+1);
  const story=mode==='both'?`長さ${L}mのまっすぐな道に、${d}mおきに木を植えます。道の両はしにも植えます。`
    :mode==='none'?`長さ${L}mのまっすぐな道に、${d}mおきに旗を立てます。道の両はしには立てません。`
    :mode==='circle'?`まわりの長さが${L}mの池のまわりに、${d}mおきに木を植えます。`
    :`長さ${L}mのまっすぐな道の両がわに、${d}mおきに木を植えます。道の両はしにも植えます。`;
  return {t:'ueki',lv,mode,d,m,L,req,story,ask:mode==='none'?'旗は何本？':'木は何本？',opt:req};
}
function kabu(lv){
  let a,b,p,r1,r2;
  if(lv===1){p=ri(3,6);a=ri(2,4);b=a+1;const r=ri(1,p-1);r1=r;r2=-(p-r);}
  else if(lv===2){p=ri(5,10);a=ri(2,5);const g=pick([1,2]);b=a+g;const r=ri(1,g*p-1);r1=r;r2=-(g*p-r);}
  else {p=ri(6,12);a=ri(3,5);const g=pick([1,2]);b=a+g;
    if(Math.random()<.5){r2=ri(1,4);r1=r2+g*p;} else {const s1=ri(1,4);r1=-s1;r2=-(s1+g*p);}}
  const N=a*p+r1;
  const tx=(x,r)=>r>0?`${r}こあまります`:`${-r}こたりません`;
  return {t:'kabu',lv,a,b,p,r1,r2,N,story:`あめを子どもに配ります。1人${a}こずつ配ると${tx(a,r1)}。1人${b}こずつ配ると${tx(b,r2)}。`,ask:'子どもは何人？',opt:steps(p-1)};
}
function bun(lv){
  let k,c,e;
  if(lv===1){k=pick([2,3]);c=ri(4,15);e=0;}
  else if(lv===2){k=pick([2,3,4]);c=ri(8,25);e=ri(2,12);}
  else {k=pick([2,3,4]);c=ri(12,40);e=Math.random()<.5?-ri(2,Math.min(15,c-1)):ri(10,30);}
  const T=c*(k+1)+e;
  const rel=e===0?`兄のまい数は弟の${k}倍です。`:e>0?`兄は弟の${k}倍より${e}まい多くもっています。`:`兄は弟の${k}倍より${-e}まい少ないです。`;
  return {t:'bun',lv,k,c,e,T,story:`兄と弟のカードは合わせて${T}まいです。${rel}`,ask:'弟は何まい？',opt:steps(c-1)};
}
const GEN={tsuru,wasa,ueki,kabu,bun};
return {gen:(t,lv)=>GEN[t](lv),steps};
})();
if(typeof module!=='undefined')module.exports=TokushuGen;
