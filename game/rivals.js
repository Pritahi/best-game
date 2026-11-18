import {CHARTS} from './charts.js';

const KEY='inkbound-cartographer-ledger-v1';
export const BESTED_BONUS=75;
export const RIVALS=Object.freeze([
  {id:'rhea-vance',name:'RHEA VANCE',targets:[900,1800,3000,4800],inkdeepDepth:12},
  {id:'silas-tide',name:'SILAS TIDE',targets:[1100,2100,3400,5200],inkdeepDepth:18},
  {id:'mara-quell',name:'MARA QUELL',targets:[1300,2400,3800,5700],inkdeepDepth:24},
  {id:'orin-blackwake',name:'ORIN BLACKWAKE',targets:[1550,2750,4300,6300],inkdeepDepth:31},
  {id:'vesper-reef',name:'VESPER REEF',targets:[1800,3200,4900,7000],inkdeepDepth:40}
].map(rival=>Object.freeze({...rival,targets:Object.freeze(rival.targets)})));

const empty=()=>({charts:Array.from({length:CHARTS.length},()=>[]),inkdeep:[]});
function load(){
  try{
    const saved=JSON.parse(localStorage.getItem(KEY)||'null'),state=empty();
    if(saved&&typeof saved==='object'){
      state.charts=state.charts.map((_,i)=>Array.isArray(saved.charts?.[i])?saved.charts[i].filter(id=>RIVALS.some(r=>r.id===id)):[]);
      state.inkdeep=Array.isArray(saved.inkdeep)?saved.inkdeep.filter(id=>RIVALS.some(r=>r.id===id)):[];
    }
    return state;
  }catch{return empty();}
}
function save(state){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}}

export function ledger(progress={}){
  const player={id:'player',name:'YOU',score:Number.isFinite(progress.bestScore)?Math.max(0,progress.bestScore):0,targets:[]};
  const rows=[player,...RIVALS.map(r=>({id:r.id,name:r.name,score:r.targets.reduce((sum,n)=>sum+n,0),targets:[...r.targets],inkdeepDepth:r.inkdeepDepth}))];
  return rows.sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name)).map((row,index)=>({...row,standing:index+1}));
}

function chartIndex(chartId){
  if(Number.isInteger(chartId))return chartId>=1&&chartId<=CHARTS.length?chartId-1:-1;
  return CHARTS.findIndex(chart=>chart.name===chartId);
}
export function checkBested(chartId,score){
  const index=chartIndex(chartId);if(index<0||!Number.isFinite(score))return [];
  const state=load(),known=new Set(state.charts[index]);
  const newly=RIVALS.filter(r=>score>r.targets[index]&&!known.has(r.id));
  if(newly.length){state.charts[index].push(...newly.map(r=>r.id));save(state);}
  return newly.map(r=>({...r,chartId:index+1,score:r.targets[index]}));
}
export function checkInkdeepBested(depth){
  if(!Number.isFinite(depth))return [];
  const state=load(),known=new Set(state.inkdeep);
  const newly=RIVALS.filter(r=>depth>r.inkdeepDepth&&!known.has(r.id));
  if(newly.length){state.inkdeep.push(...newly.map(r=>r.id));save(state);}
  return newly.map(r=>({...r,depth:r.inkdeepDepth}));
}
export function bestedBonus(newBests=[]){return (Array.isArray(newBests)?newBests.length:0)*BESTED_BONUS;}
