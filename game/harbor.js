import {getPurse} from './economy.js';

const KEY='inkbound-cartographer-harbor-v1';
const PURSE_KEY='inkbound-cartographer-sovereign-purse-v1';
export const TRACKS=Object.freeze([
  Object.freeze({id:'hull',name:'Hull Plating',costs:[100,200,350]}),
  Object.freeze({id:'sail',name:'Sail Trim',costs:[100,200,350]}),
  Object.freeze({id:'thread',name:'Thread Spool',costs:[100,200,350]}),
  Object.freeze({id:'dash',name:'Dash Coil',costs:[125,250,400]}),
  Object.freeze({id:'ward',name:'Ward Lodestone',costs:[200,400]})
]);

const empty=()=>Object.fromEntries(TRACKS.map(track=>[track.id,0]));
function load(){
  try{
    const saved=JSON.parse(localStorage.getItem(KEY)||'null'),tiers=empty();
    for(const track of TRACKS){const value=saved?.[track.id];tiers[track.id]=Number.isInteger(value)?Math.max(0,Math.min(track.costs.length,value)):0;}
    return tiers;
  }catch{return empty();}
}
function save(tiers){try{localStorage.setItem(KEY,JSON.stringify(tiers));}catch{}}
export function ownedTiers(){return load();}

export function buy(trackId){
  const track=TRACKS.find(item=>item.id===trackId),tiers=load();
  if(!track)return {success:false,reason:'unknown-track',purse:getPurse()};
  const tier=tiers[trackId];
  if(tier>=track.costs.length)return {success:false,reason:'max-tier',trackId,tier,purse:getPurse()};
  const cost=track.costs[tier],purse=getPurse();
  if(purse<cost)return {success:false,reason:'insufficient-funds',trackId,tier,cost,purse};
  try{localStorage.setItem(PURSE_KEY,JSON.stringify(purse-cost));}catch{return {success:false,reason:'storage-error',trackId,tier,cost,purse};}
  tiers[trackId]++;save(tiers);
  return {success:true,trackId,tier:tiers[trackId],cost,purse:purse-cost};
}

export function applyTuning(sim){
  if(!sim?.skiff)return sim;
  const tiers=load();
  if(!sim._harborHooks){
    const reset=sim.reset.bind(sim),spawn=sim.spawnTide.bind(sim),update=sim.update.bind(sim);
    const hooks={
      spawnTide:function(...args){const result=spawn(...args);tuneWards(this);return result;},
      reset:function(...args){const result=reset(...args);applyStats(this);tuneWards(this);return result;},
      update:function(keys={}){
      const s=this.skiff,active=this.state==='PLAY'&&keys.ShiftPressed&&s.dashCd<=0&&s.thr>=18;
      const result=update(keys);
      if(active){const t=this._harborTiers; s.dash+=8*t.dash;s.dashCd=Math.max(1,180-25*t.dash)-1;}
      return result;
      }
    };
    for(const [key,value] of Object.entries(hooks))Object.defineProperty(sim,key,{value,writable:true,configurable:true,enumerable:false});
    Object.defineProperty(sim,'_harborHooks',{value:true,writable:true,configurable:true,enumerable:false});
  }
  sim._harborTiers=tiers;
  applyStats(sim);tuneWards(sim);
  return sim;
}
function applyStats(sim){
  const s=sim.skiff,t=sim._harborTiers||empty();
  s.maxHp=100+20*t.hull;s.hp=s.maxHp;s.spd=2.8+.22*t.sail;
  s.maxThr=100+20*t.thread;s.thr=s.maxThr;s.reg=.35+.1*t.thread;
}
function tuneWards(sim){
  const reduction=sim._harborTiers?.ward||0;
  for(const rift of sim.rifts||[])if(rift.type==='ward'){
    if(!Number.isFinite(rift.harborBaseHp))rift.harborBaseHp=rift.maxHp;
    rift.maxHp=Math.max(1,rift.harborBaseHp-reduction);
    rift.hp=Math.min(rift.hp,rift.maxHp);
  }
}
