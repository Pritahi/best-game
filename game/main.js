import { Simulation } from './simulation.js';
import { Renderer } from './render.js';
import { playSound, setMuted } from './sound.js';
import { loadProgress, recordChart } from './progress.js';
import { renderAtlas } from './atlas.js';
import { CHARTS } from './charts.js';
import {getPurse,grant} from './economy.js';
import {TRACKS,buy,ownedTiers} from './harbor.js';
import {ledger,checkBested,checkInkdeepBested,bestedBonus} from './rivals.js';

const $ = id => document.getElementById(id);
const canvas = $('game-canvas'), sim = new Simulation(), renderer = new Renderer(canvas, sim);
const keys = Object.create(null);
const pointer={x:600,y:470,down:false}; keys.pointer=pointer;
const menus = ['menu-start', 'menu-upgrade', 'menu-gameover', 'menu-win','menu-harbor','menu-ledger'];
let paused = false, accumulator = 0, last = 0, previous = null, shiftWasDown=false, pWasDown=false;
let progress=loadProgress();
let returnMenu='menu-start';
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
  if(k==='h'&&['START','UPGRADE','WIN','GAMEOVER'].includes(sim.state))openHarbor();
  if(k==='l'&&['START','UPGRADE','WIN','GAMEOVER'].includes(sim.state))openLedger();
  if(k==='Enter'&&sim.state==='WIN')continueInkdeep();
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
$('btn-open-harbor').addEventListener('click',()=>openHarbor('menu-start'));
$('btn-open-ledger').addEventListener('click',()=>openLedger('menu-start'));
$('btn-upgrade-harbor').addEventListener('click',()=>openHarbor('menu-upgrade'));
$('btn-upgrade-ledger').addEventListener('click',()=>openLedger('menu-upgrade'));
$('btn-harbor-back').addEventListener('click',()=>setMenu(returnMenu));
$('btn-ledger-back').addEventListener('click',()=>setMenu(returnMenu));
$('btn-continue-inkdeep').addEventListener('click',continueInkdeep);
document.querySelectorAll('[data-upgrade]').forEach(b => b.addEventListener('click', () => {
  clearInput();sim.applyUpgrade(b.dataset.upgrade);previous='PLAY';setMenu(null);playSound('upgrade');
}));
function resize() {
  const scale=Math.min(innerWidth/1200, innerHeight/800);
  canvas.style.width=`${1200*scale}px`; canvas.style.height=`${800*scale}px`;
  const box=$('game-container'); box.style.width=`${1200*scale}px`; box.style.height=`${800*scale}px`;
}
window.addEventListener('resize', resize); resize();
function paintAtlas(){progress=loadProgress();renderAtlas($('atlas-cards'),progress);$('best-record').textContent=`BEST SCORE · ${progress.bestScore.toLocaleString()}`;$('title-purse').textContent=`SOVEREIGNS · ${getPurse().toLocaleString()}`;}
function openHarbor(back){returnMenu=back||(['UPGRADE'].includes(sim.state)?'menu-upgrade':'menu-start');renderHarbor();setMenu('menu-harbor');}
function renderHarbor(message=''){const tiers=ownedTiers(),purse=getPurse();$('harbor-purse').textContent=purse.toLocaleString();$('harbor-status').textContent=message;
  $('harbor-tracks').innerHTML=TRACKS.map(track=>{const tier=tiers[track.id],cost=track.costs[tier];return `<div class="campaign-report"><strong>${track.name} · ${tier}/${track.costs.length}</strong><span>Tier pips · ${'●'.repeat(tier)}${'○'.repeat(track.costs.length-tier)}</span><span>${cost===undefined?'MAXIMUM TIER':`Next cost · ${cost} sovereigns`}</span><button class="btn-gold" data-buy-track="${track.id}" ${cost===undefined?'disabled':''}>${cost===undefined?'Fully Tuned':'Buy Tier '+(tier+1)}</button></div>`;}).join('');
  $('harbor-tracks').querySelectorAll('[data-buy-track]').forEach(button=>button.addEventListener('click',()=>{const result=buy(button.dataset.buyTrack);renderHarbor(result.success?`${TRACKS.find(t=>t.id===result.trackId).name} tuned to tier ${result.tier}.`:result.reason==='insufficient-funds'?`Insufficient funds · need ${result.cost}, purse ${result.purse}.`:result.reason==='max-tier'?'That track is already at maximum tier.':`Purchase failed · ${result.reason}.`);}));}
function openLedger(back){returnMenu=back||(['UPGRADE'].includes(sim.state)?'menu-upgrade':'menu-start');renderLedger();setMenu('menu-ledger');}
function renderLedger(){const rows=ledger(loadProgress());let bested={};try{bested=JSON.parse(localStorage.getItem('inkbound-cartographer-ledger-v1')||'{}')||{};}catch{}
  $('ledger-table').innerHTML=`<div class="campaign-report">${rows.map(row=>{const rival=row.id!=='player',id=row.id,index=rows.indexOf(row),marks=bested.charts?.map(chart=>chart?.includes(id))||[];return `<div><strong>${row.standing}. ${row.name}${row.id==='player'?' · '+row.score.toLocaleString():''}</strong>${rival?`<span>${row.targets.map((score,i)=>`${CHARTS[i].name}: ${score.toLocaleString()} ${marks[i]?'✓':''}`).join(' · ')}</span><span>Inkdeep record · Depth ${row.inkdeepDepth} ${bested.inkdeep?.includes(id)?'✓':''}</span>`:''}</div>`;}).join('')}</div>`;}
function continueInkdeep(){if(sim.continueRun()){previous='WIN';setMenu(null);}}
function queueBests(){const newBests=[];for(let i=0;i<sim.chartResults.length;i++)newBests.push(...checkBested(i+1,sim.chartResults[i].score??sim.score));if(sim.inkDepth)newBests.push(...checkInkdeepBested(sim.inkDepth));if(newBests.length){const bonus=bestedBonus(newBests);grant(bonus);sim.say(`CARTOGRAPHER BESTED · ${newBests.map(r=>r.name).join(' · ')} · +${bonus} SOVEREIGNS`);}}
function medalRow(){return sim.chartResults.map((r,i)=>`<span class="medal ${r.grade.toLowerCase()}">${i+1} ${r.grade}</span>`).join('');}
function formatTime(frames){const sec=Math.floor(frames/60);return `${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`;}
function chartReport(r){return `<strong>${r.name} · ${r.grade}</strong><span>${r.hits} hits · ${formatTime(r.elapsed)} · ${r.seals} seals</span><span>Campaign score ${sim.score.toLocaleString()}</span><div class="medal-row">${medalRow()}</div>`;}
function campaignReport(){const s=sim.stats;return `<strong>Score ${sim.score.toLocaleString()} · Best ${progress.bestScore.toLocaleString()}</strong><span>Time ${formatTime(s.elapsed)} · ${s.hits} hits · ${s.rescues} rescues</span><span>Max combo ${s.maxCombo} · ${s.seals} capture events</span><div class="medal-row">${medalRow()}</div>`;}
function hazardHint(){return ['One slow pursuing eel.','Spitter turret fires slow ink bolts.','Patroller plus rotating currents.','Two-hit wards, spitter and currents.'][sim.tide-1];}
function hud() {
  $('hud-tide').textContent=`${sim.tide} / ${sim.totalCharts}`;
  $('hud-region').textContent=`${sim.chartName.toUpperCase()} · CHART ${sim.tide}/${sim.totalCharts}`;
  $('hud-rifts').textContent=`${sim.chartObjectives-sim.rifts.reduce((n,r)=>n+r.hp,0)} / ${sim.chartObjectives}`;
  $('hud-score').textContent=sim.score.toLocaleString();
  $('hud-purse').textContent=getPurse().toLocaleString();
  $('hud-record').textContent=`${sim.combo} · ${sim.stats.rescues}`;
  $('hazard-hint').textContent=hazardHint();
  $('thread-hint').textContent=sim.skiff.thr<35?'THREAD LOW · release Space to recover or find a rescue buoy':'';
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
      if(sim.chartResults.length&&sim.chartResults.at(-1).score===undefined)sim.chartResults.at(-1).score=sim.score;
      if(sim.skiff.hp<hp) playSound('hit');
      if(sim.score>score) playSound('seal');
    }
    accumulator-=1/60;
  }
  const stateChanged=sim.state!==previous;
  if(stateChanged) {
    if(sim.state==='UPGRADE') {
      const result=sim.chartResults.at(-1);result.score=sim.score;progress=recordChart(sim.tide,result,sim.score);paintAtlas();
      $('chart-clear-report').innerHTML=chartReport(result);
      $('next-chart-intro').textContent=`Next region: ${CHARTS[sim.tide].name} — ${hazardHintFor(sim.tide+1)}`;
      setMenu('menu-upgrade');playSound('seal');
    }
    if(sim.state==='GAMEOVER') {queueBests();$('campaign-result-lost').innerHTML=campaignReport();setMenu('menu-gameover');playSound('end');}
    if(sim.state==='WIN') {const result=sim.chartResults.at(-1);result.score=sim.score;progress=recordChart(sim.tide,result,sim.score);paintAtlas();queueBests();$('campaign-result-won').innerHTML=campaignReport();setMenu('menu-win');playSound('win');}
    if(sim.state==='INKDEEP_START'){const result=sim.chartResults.at(-1);if(result)result.score=sim.score;previous='INKDEEP_START';setMenu(null);}
    if(sim.state==='PLAY'&&previous==='INKDEEP_START')setMenu(null);
  }
  if(stateChanged&&sim.state==='START') {paintAtlas();setMenu('menu-start');}
  previous=sim.state;
  if(sim.inkCycle>0&&['PLAY','INKDEEP_START'].includes(sim.state))$('hud-region').textContent=`INKDEEP · DEPTH ${sim.inkDepth+1} · CYCLE ${sim.inkCycle}`;
  hud(); renderer.draw(); requestAnimationFrame(frame);
}
function hazardHintFor(chart){return ['One slow pursuing eel.','Spitter turret fires slow ink bolts.','Patroller plus rotating currents.','Two-hit wards, spitter and currents.'][chart-1]||'Chart all remaining rifts.';}
Object.defineProperty(window,'inkbound',{configurable:false,writable:false,value:Object.freeze({get state(){const copy=structuredClone(sim);copy.chart=structuredClone(sim.chart);copy.currentChart=structuredClone(sim.currentChart);copy.chartName=sim.chartName;copy.totalCharts=sim.totalCharts;copy.totalRifts=sim.totalRifts;return copy;}})});
setMenu('menu-start'); requestAnimationFrame(frame);
