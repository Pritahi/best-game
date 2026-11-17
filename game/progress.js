const KEY='inkbound-cartographer-progress-v1';
const empty=()=>({bestScore:0,maxChart:1,medals:[null,null,null,null]});
export function loadProgress(){
  try{const x=JSON.parse(localStorage.getItem(KEY)||'null');if(!x||typeof x!=='object')return empty();
    return {bestScore:Number.isFinite(x.bestScore)?Math.max(0,x.bestScore):0,maxChart:Math.max(1,Math.min(4,Number.isInteger(x.maxChart)?x.maxChart:1)),medals:Array.from({length:4},(_,i)=>['GOLD','SILVER','BRONZE'].includes(x.medals?.[i])?x.medals[i]:null)};
  }catch{return empty();}
}
const rank={BRONZE:1,SILVER:2,GOLD:3};
export function recordChart(index,result,score){
  const p=loadProgress();if(!Number.isInteger(index)||index<1||index>4||!result)return p;
  p.maxChart=Math.max(p.maxChart,Math.min(4,index+1));p.bestScore=Math.max(p.bestScore,Math.floor(score)||0);
  const old=p.medals[index-1];if(rank[result.grade]>(rank[old]||0))p.medals[index-1]=result.grade;
  try{localStorage.setItem(KEY,JSON.stringify(p));}catch{}
  return p;
}
