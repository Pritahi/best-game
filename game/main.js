import { Simulation } from './simulation.js';
import { Renderer } from './render.js';
import { playSound, setMuted } from './sound.js';

const $ = id => document.getElementById(id);
const canvas = $('game-canvas'), sim = new Simulation(), renderer = new Renderer(canvas, sim);
const keys = Object.create(null);
const pointer={x:600,y:470,down:false}; keys.pointer=pointer;
const menus = ['menu-start', 'menu-upgrade', 'menu-gameover', 'menu-win'];
let paused = false, accumulator = 0, last = 0, previous = 'START', shiftWasDown=false, pWasDown=false;
function clearInput(){for(const k of Object.keys(keys))if(k!=='pointer')keys[k]=false;pointer.down=false;shiftWasDown=false;pWasDown=false;}
const setMenu = id => {
  menus.forEach(name => $(name).classList.toggle('hidden', name !== id));
  $('overlay').classList.toggle('hidden', !id);
  $('hud').classList.toggle('hidden', !['PLAY','PAUSE'].includes(sim.state));
  $('pause-overlay').classList.toggle('hidden', !paused);
};
function start() { clearInput();sim.reset(); sim.state='PLAY'; paused=false;previous='PLAY';setMenu(null); playSound('start'); }
function restart() { start(); }
function keyName(e) { return e.key === ' ' ? 'Space' : e.key.length === 1 ? e.key.toLowerCase() : e.key; }
window.addEventListener('keydown', e => {
  const k=keyName(e); if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(k)) e.preventDefault();
  keys[k]=true;
  if (k==='p'&&!pWasDown && ['PLAY','PAUSE'].includes(sim.state)) { paused=!paused; sim.state=paused?'PAUSE':'PLAY'; setMenu(null); }
  if(k==='p')pWasDown=true;
  if (k==='m') setMuted();
  if (k==='r' && ['PLAY','PAUSE','GAMEOVER','WIN'].includes(sim.state)) restart();
}, {passive:false});
window.addEventListener('keyup', e => { const k=keyName(e);keys[k]=false;if(k==='p')pWasDown=false; });
window.addEventListener('blur', () => { clearInput();if(sim.state==='PLAY'){paused=true;sim.state='PAUSE';setMenu(null);} });
function aim(e){const r=canvas.getBoundingClientRect();pointer.x=(e.clientX-r.left)*1200/r.width;pointer.y=(e.clientY-r.top)*800/r.height;}
canvas.addEventListener('pointerdown',e=>{if(sim.state!=='PLAY'||paused)return;aim(e);pointer.down=true;canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(pointer.down)aim(e);});
canvas.addEventListener('pointerup',e=>{if(pointer.down)aim(e);pointer.down=false;});
canvas.addEventListener('pointercancel',()=>{pointer.down=false;});
$('btn-start').addEventListener('click', start);
$('btn-restart-lost').addEventListener('click', restart);
$('btn-restart-won').addEventListener('click', restart);
document.querySelectorAll('[data-upgrade]').forEach(b => b.addEventListener('click', () => {
  clearInput();sim.applyUpgrade(b.dataset.upgrade);previous='PLAY';setMenu(null);playSound('upgrade');
}));
function resize() {
  const scale=Math.min(innerWidth/1200, innerHeight/800);
  canvas.style.width=`${1200*scale}px`; canvas.style.height=`${800*scale}px`;
  const box=$('game-container'); box.style.width=`${1200*scale}px`; box.style.height=`${800*scale}px`;
}
window.addEventListener('resize', resize); resize();
function hud() {
  $('hud-tide').textContent=`${Math.min(sim.tide,3)} / 3`;
  $('hud-rifts').textContent=`${3-sim.rifts.length} / 3`;
  $('hud-score').textContent=sim.score.toLocaleString();
  $('bar-hull').style.width=`${Math.max(0,sim.skiff.hp/sim.skiff.maxHp*100)}%`;
  $('bar-thread').style.width=`${Math.max(0,sim.skiff.thr/sim.skiff.maxThr*100)}%`;
  $('bar-dash').style.width=`${Math.max(0,(1-sim.skiff.dashCd/180)*100)}%`;
  if(sim.state==='GAMEOVER'||sim.state==='WIN') $('hud').classList.add('hidden');
}
function frame(now) {
  const dt=Math.min(.1,(now-last)/1000||0); last=now;
  accumulator+=dt;
  while(accumulator>=1/60) {
    if(!paused) {
      keys.ShiftPressed=!!keys.Shift&&!shiftWasDown;shiftWasDown=!!keys.Shift;
      const hp=sim.skiff.hp, score=sim.score;
      sim.update(keys);
      if(sim.skiff.hp<hp) playSound('hit');
      if(sim.score>score) playSound('seal');
    }
    accumulator-=1/60;
  }
  if(sim.state!==previous) {
    if(sim.state==='UPGRADE') { setMenu('menu-upgrade'); playSound('seal'); }
    if(sim.state==='GAMEOVER') { $('final-score-lost').textContent=sim.score.toLocaleString(); setMenu('menu-gameover'); playSound('end'); }
    if(sim.state==='WIN') { $('final-score-won').textContent=sim.score.toLocaleString(); setMenu('menu-win'); playSound('win'); }
    previous=sim.state;
  }
  if(sim.state==='START') setMenu('menu-start');
  hud(); renderer.draw(); requestAnimationFrame(frame);
}
Object.defineProperty(window,'inkbound',{configurable:false,writable:false,value:Object.freeze({get state(){return structuredClone(sim);}})});
setMenu('menu-start'); requestAnimationFrame(frame);
