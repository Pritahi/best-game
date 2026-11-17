export class Renderer {
  constructor(canvas,sim){this.ctx=canvas.getContext('2d');this.sim=sim;this.w=canvas.width;this.h=canvas.height;this.frame=0;}
  draw(){
    const c=this.ctx,s=this.sim,t=++this.frame;c.clearRect(0,0,this.w,this.h);
    const sea=c.createRadialGradient(590,390,80,590,390,780);sea.addColorStop(0,'#07504d');sea.addColorStop(.52,'#023331');sea.addColorStop(1,'#001716');c.fillStyle=sea;c.fillRect(0,0,this.w,this.h);
    // Fine graticule, stars and drifting soundings
    c.save();c.strokeStyle='rgba(183,183,130,.12)';c.lineWidth=1;c.setLineDash([2,7]);
    for(let x=80;x<this.w;x+=80){c.beginPath();c.moveTo(x,0);c.lineTo(x,this.h);c.stroke();}for(let y=80;y<this.h;y+=80){c.beginPath();c.moveTo(0,y);c.lineTo(this.w,y);c.stroke();}c.restore();
    for(let i=0;i<75;i++){let x=(i*173+31)%this.w,y=(i*293+11)%this.h;c.fillStyle=`rgba(235,228,189,${.18+.24*Math.sin(t*.025+i)})`;c.fillRect(x,y,1.5,1.5);}
    // Flowing chart contours
    c.save();c.strokeStyle='rgba(100,199,175,.13)';c.lineWidth=1;
    for(let band=0;band<8;band++){c.beginPath();for(let x=0;x<=this.w;x+=12){let y=130+band*85+Math.sin(x*.008+t*.007+band)*19+Math.sin(x*.021-band)*7;x?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();}c.restore();
    this.island(1020,590,1.2);this.island(165,245,.7);this.island(840,270,.48);
    // Dotted charted passages between rifts
    c.save();c.strokeStyle='rgba(233,200,115,.34)';c.setLineDash([3,9]);c.beginPath();c.moveTo(270,310);c.quadraticCurveTo(440,440,600,545);c.quadraticCurveTo(770,450,930,335);c.stroke();c.restore();
    // Rifts and danger proximity
    s.rifts.forEach(r=>{c.save();c.translate(r.x,r.y);const pulse=1+Math.sin(t*.07)*.1;c.scale(pulse,pulse);c.shadowColor='#64ffe5';c.shadowBlur=24;c.fillStyle='rgba(72,255,224,.16)';c.beginPath();c.arc(0,0,r.r+10,0,7);c.fill();c.shadowBlur=0;c.strokeStyle='#70f4df';c.lineWidth=2;c.beginPath();c.arc(0,0,r.r,0,7);c.stroke();c.strokeStyle='rgba(211,246,219,.9)';c.lineWidth=2;for(let arm=0;arm<3;arm++){c.save();c.rotate(arm*2.094+t*.018);c.beginPath();c.moveTo(-15,0);c.bezierCurveTo(-13,-16,12,-18,15,-4);c.bezierCurveTo(18,10,2,15,0,5);c.stroke();c.restore();}c.fillStyle='#e8fff0';c.beginPath();c.arc(0,0,3,0,7);c.fill();c.restore();});
    // Luminous drawn chart, origin and closure radius
    if(s.thread.length){const a=s.thread[0],p=s.thread.at(-1),near=Math.hypot(s.skiff.x-a.x,s.skiff.y-a.y)<65;
      c.save();c.beginPath();c.moveTo(a.x,a.y);s.thread.forEach(q=>c.lineTo(q.x,q.y));c.lineTo(s.skiff.x,s.skiff.y);
      if(near&&s.thread.length>8){c.closePath();c.fillStyle='rgba(86,242,218,.14)';c.fill();}
      c.shadowColor='#74fff0';c.shadowBlur=16;c.strokeStyle='#8affed';c.lineWidth=3;c.stroke();c.shadowBlur=0;
      c.setLineDash([5,6]);c.strokeStyle=near?'#e5c574':'rgba(229,197,116,.48)';c.lineWidth=1.5;c.beginPath();c.arc(a.x,a.y,65,0,7);c.stroke();c.setLineDash([]);
      c.fillStyle='#ffe6a0';c.beginPath();c.arc(a.x,a.y,5,0,7);c.fill();c.restore();
    }
    // Ink eels with undulating segmented bodies and red warning halos
    s.enemies.forEach(e=>{let near=Math.hypot(s.skiff.x-e.x,s.skiff.y-e.y)<150;c.save();c.strokeStyle=near?'rgba(255,102,91,.42)':'rgba(175,84,78,.32)';c.lineWidth=1;c.beginPath();c.arc(e.x,e.y,near?43:28,0,7);c.stroke();c.translate(e.x,e.y);const angle=Math.atan2(e.vy,e.vx);c.rotate(angle);c.lineCap='round';for(let i=8;i>=0;i--){c.strokeStyle=`hsl(${5+i*2} 40% ${13+i*1.2}%)`;c.lineWidth=8-i*.55;c.beginPath();c.moveTo(-i*8,Math.sin(t*.1-i*.65)*5);c.lineTo(-(i+1)*8,Math.sin(t*.1-(i+1)*.65)*5);c.stroke();}c.fillStyle='#ff755f';c.shadowColor='#ff493c';c.shadowBlur=9;c.beginPath();c.arc(2,0,3,0,7);c.fill();c.restore();});
    s.particles.forEach(p=>{c.globalAlpha=Math.max(0,p.life/45);c.fillStyle=p.c||'#e9ddaa';c.shadowColor=p.c||'#fff';c.shadowBlur=8;c.beginPath();c.arc(p.x,p.y,2.4,0,7);c.fill();});c.globalAlpha=1;c.shadowBlur=0;
    this.skiff();this.compass();this.frameUI();
  }
  island(x,y,scale){const c=this.ctx;c.save();c.translate(x,y);c.scale(scale,scale);c.fillStyle='rgba(2,24,23,.88)';c.strokeStyle='rgba(208,175,102,.66)';c.lineWidth=1.5;c.beginPath();c.moveTo(-55,8);c.quadraticCurveTo(-44,-20,-15,-14);c.quadraticCurveTo(1,-37,23,-13);c.quadraticCurveTo(51,-17,57,5);c.quadraticCurveTo(31,24,0,17);c.quadraticCurveTo(-30,28,-55,8);c.fill();c.stroke();c.strokeStyle='rgba(224,196,131,.25)';for(let r=19;r<53;r+=10){c.beginPath();c.ellipse(0,4,r,r*.34,-.12,0,Math.PI*2);c.stroke();}c.fillStyle='#c9b986';c.font='italic 12px Georgia';c.fillText('shoals',-19,41);c.restore();}
  skiff(){const c=this.ctx,s=this.sim.skiff;c.save();c.translate(s.x,s.y);c.rotate(Math.atan2(s.vy,s.vx)+Math.PI/2);if(s.invuln>0&&this.frame%8<4)c.globalAlpha=.5;c.shadowColor='#f2d891';c.shadowBlur=10;c.fillStyle='#c3a768';c.strokeStyle='#ffdf91';c.lineWidth=2;c.beginPath();c.moveTo(0,-19);c.quadraticCurveTo(12,-4,7,14);c.lineTo(0,19);c.lineTo(-7,14);c.quadraticCurveTo(-12,-4,0,-19);c.fill();c.stroke();c.shadowBlur=0;c.fillStyle='#f6ebcd';c.beginPath();c.moveTo(-2,-8);c.quadraticCurveTo(13,-2,2,9);c.lineTo(2,-8);c.fill();c.strokeStyle='#f0d795';c.lineWidth=1;c.beginPath();c.moveTo(0,-13);c.lineTo(0,13);c.stroke();c.restore();}
  compass(){const c=this.ctx,x=1135,y=700;c.save();c.translate(x,y);c.strokeStyle='rgba(226,195,123,.7)';c.fillStyle='rgba(226,195,123,.72)';c.lineWidth=1;c.beginPath();c.arc(0,0,34,0,7);c.stroke();for(let i=0;i<8;i++){c.save();c.rotate(i*Math.PI/4);c.beginPath();c.moveTo(0,-30);c.lineTo(4,-4);c.lineTo(0,0);c.lineTo(-4,-4);c.closePath();c.fillStyle=i%2?'rgba(226,195,123,.35)':'rgba(226,195,123,.85)';c.fill();c.restore();}c.font='12px Georgia';c.textAlign='center';c.fillText('N',0,-41);c.restore();}
  frameUI(){const c=this.ctx;c.save();c.strokeStyle='rgba(226,194,123,.72)';c.lineWidth=2;c.strokeRect(12,12,this.w-24,this.h-24);c.strokeStyle='rgba(226,194,123,.44)';c.lineWidth=1;for(let x=30;x<this.w-20;x+=30){let len=x%150===0?11:5;c.beginPath();c.moveTo(x,13);c.lineTo(x,13+len);c.stroke();c.beginPath();c.moveTo(x,this.h-13);c.lineTo(x,this.h-13-len);c.stroke();}c.font='italic 12px Georgia';c.fillStyle='rgba(236,219,168,.65)';c.fillText('PELAGIC SURVEY  ·  CHART 07',35,43);c.textAlign='center';if(this.sim.messageTime>0){c.font='bold 20px Georgia';c.shadowColor='#001';c.shadowBlur=5;c.fillStyle='#f1d78e';c.fillText(this.sim.message,600,106);}c.font='12px Georgia';c.fillStyle='rgba(245,234,204,.8)';c.textAlign='center';c.fillText('HOLD SPACE OR DRAG TO CHART  ·  RETURN TO GOLD ORIGIN  ·  RELEASE TO SEAL',600,775);c.restore();}
}
