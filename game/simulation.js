export class Simulation {
  constructor(w=1200,h=800){this.w=w;this.h=h;this.reset();}
  reset(){
    this.skiff={x:600,y:470,vx:0,vy:0,hp:100,maxHp:100,spd:2.8,thr:100,maxThr:100,reg:.25,dash:0,dashCd:0,invuln:0};
    this.rifts=[];this.enemies=[];this.thread=[];this.particles=[];this.score=0;this.tide=1;this.state='START';this.stats={};this.message='';this.messageTime=0;this.ticks=0;this.spawnTide();
  }
  spawnTide(){
    const layouts=[[[270,310],[600,545],[930,335]],[[245,360],[600,590],[955,345]],[[260,345],[600,555],[940,360]]];
    this.rifts=layouts[this.tide-1].map(([x,y])=>({x,y,r:34}));
    this.enemies=Array.from({length:this.tide},(_,i)=>({x:[150,1050,610][i],y:[680,690,710][i],phase:i*2.4,vx:0,vy:0}));
  }
  say(text){this.message=text;this.messageTime=150;}
  update(keys={}){
    if(this.state!=='PLAY')return;
    this.ticks++;const s=this.skiff, pointer=keys.pointer;
    let ax=(keys.d||keys.ArrowRight?1:0)-(keys.a||keys.ArrowLeft?1:0), ay=(keys.s||keys.ArrowDown?1:0)-(keys.w||keys.ArrowUp?1:0);
    if(pointer?.down){const dx=pointer.x-s.x,dy=pointer.y-s.y,d=Math.hypot(dx,dy);if(d>12){ax=dx/d;ay=dy/d;}}
    const m=Math.hypot(ax,ay)||1;
    s.vx+=(ax/m)*.52;s.vy+=(ay/m)*.52;
    const speed=Math.hypot(s.vx,s.vy), cap=s.spd*(s.dash>0?2.2:(pointer&&pointer.down?.92:1));
    if(speed>cap){s.vx=s.vx/speed*cap;s.vy=s.vy/speed*cap;}
    const drag=s.dash>0?.975:.89;s.vx*=drag;s.vy*=drag;s.x+=s.vx;s.y+=s.vy;
    if(keys.ShiftPressed&&s.dashCd<=0&&s.thr>=18){const d=Math.hypot(s.vx,s.vy)||1;s.vx=s.vx/d*s.spd*2.2;s.vy=s.vy/d*s.spd*2.2;s.dash=30;s.dashCd=180;s.invuln=30;s.thr-=18;}
    if(s.dash>0)s.dash--;if(s.dashCd>0)s.dashCd--;if(s.invuln>0)s.invuln--;
    s.x=Math.max(30,Math.min(this.w-30,s.x));s.y=Math.max(175,Math.min(this.h-35,s.y));
    const drawing=!!(keys.Space||pointer?.down);
    if(drawing&&s.thr>0){
      const last=this.thread[this.thread.length-1],dist=last?Math.hypot(s.x-last.x,s.y-last.y):Infinity;
      if(!last||dist>=6){const cost=last?dist/12:0;if(s.thr>=cost){this.thread.push({x:s.x,y:s.y});s.thr-=cost;}else{this.say('THREAD SPENT — release to recover');this.thread=[];}}
      if(this.thread.length>1&&this.thread.reduce((n,p,i,a)=>i?n+Math.hypot(p.x-a[i-1].x,p.y-a[i-1].y):0,0)>1200){this.thread=[];this.say('LOOP TOO LONG — thread reeled in');}
    }else s.thr=Math.min(s.maxThr,s.thr+s.reg);
    if(!drawing&&this.thread.length){const origin=this.thread[0],closed=this.thread.length>8&&Math.hypot(s.x-origin.x,s.y-origin.y)<=65; if(closed)this.seal();else{this.thread=[];this.say('LOOP OPEN — return to the gold origin before release');}}
    this.enemies.forEach(e=>{
      e.phase+=.035;const dx=s.x-e.x,dy=s.y-e.y,d=Math.hypot(dx,dy)||1;
      e.vx+=(dx/d)*.012;e.vy+=(dy/d)*.012;
      const wobble=Math.sin(e.phase)*.24;e.x+=e.vx+wobble;e.y+=e.vy+Math.cos(e.phase*1.3)*.18;
      e.vx*=.985;e.vy*=.985;e.x=Math.max(20,Math.min(this.w-20,e.x));e.y=Math.max(165,Math.min(this.h-20,e.y));
      if(d<28&&s.invuln<=0){s.hp=Math.max(0,s.hp-20);s.invuln=90;this.say('EEL STRIKE — hull damaged');if(s.hp<=0)this.state='GAMEOVER';}
    });
    this.particles=this.particles.filter(p=>p.life-->0);this.particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vx*=.98;p.vy*=.98;});
    if(this.messageTime>0)this.messageTime--;
  }
  seal(){
    const poly=this.thread,captured=this.rifts.filter(r=>this.isInside(r,poly));
    if(!captured.length){this.say('NO RIFT ENCLOSED — chart a wider loop');this.thread=[];return;}
    this.score+=captured.length*100*this.tide;
    captured.forEach(r=>{for(let i=0;i<32;i++)this.particles.push({x:r.x,y:r.y,vx:(Math.random()-.5)*8,vy:(Math.random()-.5)*8,life:45,c:'#bffff4'});});
    this.rifts=this.rifts.filter(r=>!captured.includes(r));this.say(`RIFT SEALED  +${captured.length*100*this.tide} CHARTING`);
    if(!this.rifts.length)this.state=this.tide<3?'UPGRADE':'WIN';
    this.thread=[];
  }
  isInside(p,poly){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){if((poly[i].y>p.y)!==(poly[j].y>p.y)&&p.x<(poly[j].x-poly[i].x)*(p.y-poly[i].y)/(poly[j].y-poly[i].y)+poly[i].x)inside=!inside;}return inside;}
  applyUpgrade(type){if(type==='hull'){this.skiff.maxHp*=1.25;this.skiff.hp=this.skiff.maxHp;}if(type==='speed')this.skiff.spd*=1.15;if(type==='thread'){this.skiff.reg*=1.4;this.skiff.maxThr+=20;this.skiff.thr=this.skiff.maxThr;}this.tide++;this.state='PLAY';this.spawnTide();this.say('NEW TIDE — chart the rifts');}
}
