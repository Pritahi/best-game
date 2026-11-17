const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function createHazards(chart,w,h,skiff){
  const enemies=[];
  for(let i=0;i<chart.eels;i++)enemies.push({type:'eel',x:i? w-145:145,y:h-115-i*35,vx:0,vy:0,phase:i*2.4,radius:29});
  if(chart.spitter)enemies.push({type:'spitter',x:w/2,y:225,phase:0,radius:62,fireEvery:180});
  for(let i=0;i<chart.sentinel;i++)enemies.push({type:'sentinel',x:i? w-210:210,y:280,phase:i*2.1,originX:i?w-210:210,originY:280,radius:42});
  return {enemies,bolts:[],currents:chart.currents.map(([x,y,r],i)=>({x,y,r,phase:i*.9})),rescues:chart.rescues.map(([x,y],i)=>({x,y,r:19,phase:i*.8})),tick:0};
}
export function updateHazards(h,skiff,damage,heal){
  h.tick++;
  h.enemies.forEach(e=>{
    e.phase+=e.type==='spitter'?.018:.026;
    if(e.type==='eel'){
      const dx=skiff.x-e.x,dy=skiff.y-e.y,d=Math.hypot(dx,dy)||1;e.vx+=dx/d*.009;e.vy+=dy/d*.009;
      const speed=Math.hypot(e.vx,e.vy);if(speed>1.05){e.vx=e.vx/speed*1.05;e.vy=e.vy/speed*1.05;}e.x+=e.vx+Math.sin(e.phase)*.22;e.y+=e.vy+Math.cos(e.phase*1.3)*.16;e.vx*=.99;e.vy*=.99;
      e.x=clamp(e.x,25,1175);e.y=clamp(e.y,170,775);if(Math.hypot(skiff.x-e.x,skiff.y-e.y)<27)damage(15,'EEL STRIKE — hull damaged');
    }else if(e.type==='sentinel'){
      e.x=e.originX+Math.cos(e.phase*.65)*115;e.y=e.originY+Math.sin(e.phase)*65;
      if(Math.hypot(skiff.x-e.x,skiff.y-e.y)<31)damage(15,'SENTINEL STRIKE — hull damaged');
    }else if(h.tick%e.fireEvery===0){const dx=skiff.x-e.x,dy=skiff.y-e.y,d=Math.hypot(dx,dy)||1;h.bolts.push({x:e.x,y:e.y,vx:dx/d*1.8,vy:dy/d*1.8,r:7});}
  });
  h.currents.forEach(c=>{c.phase+=.012;const dx=skiff.x-c.x,dy=skiff.y-c.y,d=Math.hypot(dx,dy);if(d<c.r){const a=c.phase+Math.atan2(dy,dx);skiff.vx+=Math.cos(a)*.035;skiff.vy+=Math.sin(a)*.035;}});
  h.bolts=h.bolts.filter(b=>{b.x+=b.vx;b.y+=b.vy;if(Math.hypot(skiff.x-b.x,skiff.y-b.y)<22){damage(10,'INK BOLT STRIKE — hull damaged');return false;}return b.x>-20&&b.x<1220&&b.y>-20&&b.y<820;});
  h.rescues=h.rescues.filter(b=>{b.phase+=.04;if(Math.hypot(skiff.x-b.x,skiff.y-b.y)<27){heal(15,20);return false;}return true;});
}
