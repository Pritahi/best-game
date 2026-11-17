import {CHARTS,TOTAL_CHARTS,TOTAL_RIFTS} from './charts.js';
import {createHazards,updateHazards} from './hazards.js';

export class Simulation {
  constructor(w=1200,h=800){this.w=w;this.h=h;this.reset();}
  get totalCharts(){return TOTAL_CHARTS;}
  get totalRifts(){return TOTAL_RIFTS;}
  get currentChart(){return this.chart;}
  get chart(){return CHARTS[this.tide-1];}
  get chartName(){return this.chart?.name||'';}
  reset(){
    this.skiff={x:600,y:470,vx:0,vy:0,hp:100,maxHp:100,spd:2.8,thr:100,maxThr:100,reg:.35,dash:0,dashCd:0,invuln:0};
    this.rifts=[];this.enemies=[];this.bolts=[];this.currents=[];this.rescues=[];this.thread=[];this.particles=[];this.score=0;this.tide=1;this.state='START';this.stats={elapsed:0,seals:0,rescues:0,hits:0,maxCombo:0};this.combo=0;this.chartResults=[];this.message='';this.messageTime=0;this.ticks=0;this.spawnTide();
  }
  spawnTide(){
    const chart=this.chart;this.rifts=chart.rifts.map(([name,x,y,hp=1])=>({name,x,y,r:33,hp,maxHp:hp,type:hp>1?'ward':'rift'}));
    if(chart.sovereign)this.rifts.push({name:chart.sovereign[0],x:chart.sovereign[1],y:chart.sovereign[2],r:39,hp:1,maxHp:1,type:'sovereign',locked:true});
    const hazards=createHazards(chart,this.w,this.h,this.skiff);this.enemies=hazards.enemies;this.bolts=hazards.bolts;this.currents=hazards.currents;this.rescues=hazards.rescues;this.hazardTick=hazards.tick;
    this.chartStart=this.stats.elapsed;this.chartHits=this.stats.hits;this.chartSealStart=this.stats.seals;this.chartObjectives=this.rifts.reduce((n,r)=>n+r.hp,0);this.thread=[];
  }
  say(text){this.message=text;this.messageTime=150;}
  update(keys={}){
    if(this.state!=='PLAY')return;
    this.ticks++;this.stats.elapsed++;const s=this.skiff,pointer=keys.pointer;
    let ax=(keys.d||keys.ArrowRight?1:0)-(keys.a||keys.ArrowLeft?1:0),ay=(keys.s||keys.ArrowDown?1:0)-(keys.w||keys.ArrowUp?1:0);
    if(pointer?.down){const dx=pointer.x-s.x,dy=pointer.y-s.y,d=Math.hypot(dx,dy);if(d>12){ax=dx/d;ay=dy/d;}}
    const m=Math.hypot(ax,ay)||1;s.vx+=(ax/m)*.52;s.vy+=(ay/m)*.52;
    const speed=Math.hypot(s.vx,s.vy),cap=s.spd*(s.dash>0?2.2:(pointer&&pointer.down?.92:1));if(speed>cap){s.vx=s.vx/speed*cap;s.vy=s.vy/speed*cap;}
    const drag=s.dash>0?.975:.89;s.vx*=drag;s.vy*=drag;s.x+=s.vx;s.y+=s.vy;
    if(keys.ShiftPressed&&s.dashCd<=0&&s.thr>=18){const d=Math.hypot(s.vx,s.vy)||1;s.vx=s.vx/d*s.spd*2.2;s.vy=s.vy/d*s.spd*2.2;s.dash=30;s.dashCd=180;s.invuln=30;s.thr-=18;}
    if(s.dash>0)s.dash--;if(s.dashCd>0)s.dashCd--;if(s.invuln>0)s.invuln--;
    s.x=Math.max(30,Math.min(this.w-30,s.x));s.y=Math.max(175,Math.min(this.h-35,s.y));
    const drawing=!!(keys.Space||pointer?.down);
    if(drawing&&s.thr>0){const last=this.thread.at(-1),dist=last?Math.hypot(s.x-last.x,s.y-last.y):Infinity;if(!last||dist>=6){const cost=last?dist/12:0;if(s.thr>=cost){this.thread.push({x:s.x,y:s.y});s.thr-=cost;}else{this.combo=0;this.say('THREAD SPENT — release to recover');this.thread=[];}}
      if(this.thread.length>1&&this.thread.reduce((n,p,i,a)=>i?n+Math.hypot(p.x-a[i-1].x,p.y-a[i-1].y):0,0)>1200){this.combo=0;this.thread=[];this.say('LOOP TOO LONG — thread reeled in');}}
    else s.thr=Math.min(s.maxThr,s.thr+s.reg);
    if(!drawing&&this.thread.length){const a=this.thread[0],closed=this.thread.length>8&&Math.hypot(s.x-a.x,s.y-a.y)<=65;if(closed)this.seal();else{this.thread=[];this.combo=0;this.say('LOOP OPEN — return to the gold origin');}}
    const hazards={enemies:this.enemies,bolts:this.bolts,currents:this.currents,rescues:this.rescues,tick:this.hazardTick};
    updateHazards(hazards,s,(amount,text)=>this.damage(amount,text),(hp,thread)=>this.rescue(hp,thread));this.hazardTick=hazards.tick;this.bolts=hazards.bolts;this.rescues=hazards.rescues;
    this.particles=this.particles.filter(p=>p.life-->0);this.particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vx*=.98;p.vy*=.98;});if(this.messageTime>0)this.messageTime--;
  }
  damage(amount,text){const s=this.skiff;if(s.invuln>0||this.state!=='PLAY')return;s.hp=Math.max(0,s.hp-amount);s.invuln=90;this.stats.hits++;this.combo=0;this.say(text);if(!s.hp)this.state='GAMEOVER';}
  rescue(hp,thread){const s=this.skiff;s.hp=Math.min(s.maxHp,s.hp+hp);s.thr=Math.min(s.maxThr,s.thr+thread);this.stats.rescues++;this.say(`RESCUE BUOY — +${hp} HULL · +${thread} THREAD`);}
  seal(){
    const captured=this.rifts.filter(r=>!r.locked&&this.isInside(r,this.thread));if(!captured.length){this.combo=0;this.say('NO RIFT ENCLOSED — chart a wider loop');this.thread=[];return;}
    let count=0,fractured=false;captured.forEach(r=>{r.hp--;count++;if(r.hp<=0)this.rifts.splice(this.rifts.indexOf(r),1);else fractured=true;for(let i=0;i<30;i++)this.particles.push({x:r.x,y:r.y,vx:(Math.random()-.5)*8,vy:(Math.random()-.5)*8,life:45,c:this.chart.tone});});this.stats.seals+=count;
    this.skiff.thr=Math.min(this.skiff.maxThr,this.skiff.thr+20*count);
    this.combo++;this.stats.maxCombo=Math.max(this.stats.maxCombo,this.combo);const bonus=Math.max(0,count-1)*75*this.tide+Math.max(0,this.combo-1)*25*this.tide;this.score+=count*100*this.tide+bonus;
    const wards=this.rifts.filter(r=>r.type==='ward');let unbound=false;if(this.tide===4&&wards.length===0){const sovereign=this.rifts.find(r=>r.type==='sovereign');if(sovereign?.locked){sovereign.locked=false;unbound=true;}}
    this.say(unbound?'THE SOVEREIGN RIFT IS UNBOUND — SEAL IT':fractured?'WARD FRACTURED — ONE SEAL REMAINS':`${count>1?`${count} RIFTS SEALED · `:''}SEAL ${this.combo}  +${count*100*this.tide+bonus}`);this.thread=[];
    if(!this.rifts.length)this.completeChart();
  }
  completeChart(){const elapsed=this.stats.elapsed-this.chartStart,hits=this.stats.hits-this.chartHits;const grade=hits<=0&&elapsed<15000?'GOLD':hits<=2?'SILVER':'BRONZE';this.chartResults.push({name:this.chart.name,grade,elapsed,hits,seals:this.stats.seals-this.chartSealStart});this.say(`${this.chart.name.toUpperCase()} CHARTED · ${grade}`);this.state=this.tide<TOTAL_CHARTS?'UPGRADE':'WIN';if(this.state==='WIN')this.stats.grade=this.chartResults.every(c=>c.grade==='GOLD')?'GOLD':this.chartResults.filter(c=>c.grade==='GOLD'||c.grade==='SILVER').length>=3?'SILVER':'BRONZE';}
  isInside(p,poly){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){if((poly[i].y>p.y)!==(poly[j].y>p.y)&&p.x<(poly[j].x-poly[i].x)*(p.y-poly[i].y)/(poly[j].y-poly[i].y)+poly[i].x)inside=!inside;}return inside;}
  applyUpgrade(type){if(this.state!=='UPGRADE')return;if(type==='hull'){this.skiff.maxHp*=1.25;this.skiff.hp=this.skiff.maxHp;}if(type==='speed')this.skiff.spd*=1.15;if(type==='thread'){this.skiff.reg*=1.4;this.skiff.maxThr+=20;}this.tide++;this.skiff.x=600;this.skiff.y=470;this.skiff.vx=0;this.skiff.vy=0;this.skiff.hp=Math.min(this.skiff.maxHp,this.skiff.hp+10);this.skiff.thr=this.skiff.maxThr;this.skiff.invuln=60;this.thread=[];this.particles=[];this.spawnTide();this.state='PLAY';this.say(`${this.chart.name.toUpperCase()} — NEW CHART`);}
}
