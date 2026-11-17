const charts=[
  {sea:['#176c5b','#073b35','#001a18'],land:'#102d25',edge:'#9dba82',contour:'rgba(145,204,155,.17)'},
  {sea:['#75442b','#3c2822','#171313'],land:'#30231d',edge:'#d69b5f',contour:'rgba(239,157,91,.18)'},
  {sea:['#463d82','#25204f','#100f2c'],land:'#272343',edge:'#aaa0e0',contour:'rgba(176,155,255,.2)'},
  {sea:['#4e8790','#1d4a58','#091f31'],land:'#234657',edge:'#bbe8ed',contour:'rgba(190,238,248,.2)'}
];
export function drawBackdrop(c,sim,t,w,h){
  const p=charts[Math.max(0,Math.min(3,sim.tide-1))],g=c.createRadialGradient(590,390,60,590,390,820);
  g.addColorStop(0,p.sea[0]);g.addColorStop(.52,p.sea[1]);g.addColorStop(1,p.sea[2]);c.fillStyle=g;c.fillRect(0,0,w,h);
  c.save();c.strokeStyle='rgba(225,207,156,.1)';c.lineWidth=1;c.setLineDash([2,8]);
  for(let x=80;x<w;x+=80){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke();}for(let y=80;y<h;y+=80){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}c.restore();
  for(let i=0;i<86;i++){const x=(i*173+31)%w,y=(i*293+11)%h;c.fillStyle=`rgba(244,233,201,${.15+.25*Math.sin(t*.025+i)})`;c.fillRect(x,y,1.5,1.5);}
  c.save();c.strokeStyle=p.contour;c.lineWidth=1;
  for(let band=0;band<8;band++){c.beginPath();for(let x=0;x<=w;x+=12){const y=135+band*83+Math.sin(x*.008+t*.006+band)*19+Math.sin(x*.021-band)*7;x?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();}c.restore();
  if(sim.tide===1){landmass(c,160,245,.76,p);landmass(c,1035,590,1.3,p);landmass(c,850,272,.55,p);}
  if(sim.tide===2){volcano(c,190,425,.95,p);volcano(c,1030,370,1.25,p);volcano(c,850,635,.72,p);ash(c,t,w,h);}
  if(sim.tide===3){for(let i=0;i<5;i++){c.save();c.translate(585,440);c.rotate(i*.23+t*.001);c.strokeStyle=`rgba(180,164,255,${.27-i*.035})`;c.lineWidth=2;c.beginPath();c.ellipse(0,0,210+i*53,93+i*31,0,0,Math.PI*1.85);c.stroke();c.restore();}landmass(c,145,280,.5,p);landmass(c,1050,600,.6,p);}
  if(sim.tide===4){iceCoast(c,p);c.save();for(let i=0;i<5;i++){c.strokeStyle=`rgba(172,239,255,${.07+i*.025})`;c.lineWidth=18-i*2;c.beginPath();c.moveTo(i*250-60,120);c.bezierCurveTo(220+i*170,200+Math.sin(t*.012+i)*75,650+i*90,40,1260,140+i*12);c.stroke();}c.restore();}
  c.save();c.strokeStyle='rgba(235,197,118,.43)';c.setLineDash([3,9]);c.beginPath();c.moveTo(275,320);c.quadraticCurveTo(440,440,600,545);c.quadraticCurveTo(770,450,930,335);c.stroke();c.restore();
}
function landmass(c,x,y,s,p){c.save();c.translate(x,y);c.scale(s,s);c.fillStyle=p.land;c.strokeStyle=p.edge;c.lineWidth=1.5;c.beginPath();c.moveTo(-55,8);c.quadraticCurveTo(-44,-20,-15,-14);c.quadraticCurveTo(1,-37,23,-13);c.quadraticCurveTo(51,-17,57,5);c.quadraticCurveTo(31,24,0,17);c.quadraticCurveTo(-30,28,-55,8);c.fill();c.stroke();c.strokeStyle=`${p.edge}55`;for(let r=19;r<53;r+=10){c.beginPath();c.ellipse(0,4,r,r*.34,-.12,0,Math.PI*2);c.stroke();}c.restore();}
function volcano(c,x,y,s,p){c.save();c.translate(x,y);c.scale(s,s);c.fillStyle=p.land;c.strokeStyle=p.edge;c.lineWidth=2;c.beginPath();c.moveTo(-95,65);c.lineTo(-20,-22);c.lineTo(3,-9);c.lineTo(27,-53);c.lineTo(100,65);c.closePath();c.fill();c.stroke();c.fillStyle='#e98343';c.beginPath();c.ellipse(25,-48,15,5,-.2,0,7);c.fill();c.strokeStyle='#d89662';c.lineWidth=1;c.beginPath();c.moveTo(27,-43);c.quadraticCurveTo(46,1,68,52);c.stroke();c.restore();}
function ash(c,t,w,h){for(let i=0;i<55;i++){const x=(i*197+t*(.16+i%3*.06))%w,y=(i*107+t*(.3+i%4*.07))%h;c.fillStyle=`rgba(247,171,102,${.2+.4*Math.sin(i+t*.03)**2})`;c.fillRect(x,y,2,2);}}
function iceCoast(c,p){c.save();c.fillStyle=p.land;c.strokeStyle=p.edge;c.lineWidth=2;c.beginPath();c.moveTo(0,665);c.lineTo(130,615);c.lineTo(245,650);c.lineTo(340,585);c.lineTo(445,652);c.lineTo(535,610);c.lineTo(680,680);c.lineTo(815,625);c.lineTo(930,668);c.lineTo(1080,600);c.lineTo(1200,660);c.lineTo(1200,800);c.lineTo(0,800);c.closePath();c.fill();c.stroke();for(let x=160;x<1100;x+=245){c.strokeStyle='rgba(217,250,255,.52)';c.beginPath();c.moveTo(x,650);c.lineTo(x+25,603);c.lineTo(x+51,650);c.stroke();}c.restore();}
