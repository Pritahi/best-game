const KEY='inkbound-cartographer-sovereign-purse-v1';
export const RATES=Object.freeze({seal:10,comboCapture:25,rescue:15,medal:{BRONZE:50,SILVER:100,GOLD:200}});

const amount=value=>Number.isFinite(value)?Math.max(0,Math.floor(value)):0;
export function loadPurse(){
  try{
    const value=JSON.parse(localStorage.getItem(KEY)||'0');
    return Number.isFinite(value)?amount(value):0;
  }catch{return 0;}
}
export function getPurse(){return loadPurse();}
export function grant(value){
  const purse=loadPurse()+amount(value);
  try{localStorage.setItem(KEY,JSON.stringify(purse));}catch{}
  return purse;
}

export function earnSeals(count=1){return amount(count)*RATES.seal;}
export function earnCombo(multiCaptures=1){return amount(multiCaptures)*RATES.comboCapture;}
export function earnRescues(count=1){return amount(count)*RATES.rescue;}
export function earnMedal(grade){return RATES.medal[grade]||0;}

export function bankRun(state={}){
  const stats=state.stats||{};
  const charts=Array.isArray(state.chartResults)?state.chartResults:[];
  const medals=Array.isArray(state.medals)?state.medals:charts.map(chart=>chart?.grade);
  const multiCaptures=stats.multiCaptures??stats.comboCaptures??state.multiCaptures??0;
  const earned=earnSeals(stats.seals)+earnCombo(multiCaptures)+earnRescues(stats.rescues)+
    medals.reduce((total,grade)=>total+earnMedal(typeof grade==='string'?grade:grade?.grade),0);
  const purse=loadPurse()+earned;
  try{localStorage.setItem(KEY,JSON.stringify(purse));}catch{}
  return purse;
}
