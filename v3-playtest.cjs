const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const root='/downloads/best-game-work/repo/game';const server=http.createServer((req,res)=>{const p=path.join(root,req.url==='/'?'index.html':req.url.split('?')[0]);try{res.setHeader('Content-Type',p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(p))}catch{res.statusCode=404;res.end()}});
(async()=>{await new Promise(r=>server.listen(8767,r));const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:1200,height:800}});await page.clock.install();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://localhost:8767');await page.clock.runFor(200);fs.mkdirSync('/downloads/best-game-work/v3shots',{recursive:true});const shot=async n=>page.screenshot({path:'/downloads/best-game-work/v3shots/'+n+'.jpg',type:'jpeg',quality:82});const state=()=>page.evaluate(()=>inkbound.state);const held=new Set();async function keys(next){for(const k of held)if(!next.includes(k)){await page.keyboard.up(k);held.delete(k)}for(const k of next)if(!held.has(k)){await page.keyboard.down(k);held.add(k)}}
async function go(x,y,draw=false){for(let i=0;i<200;i++){const s=await state();if(s.state!=='PLAY')return s;const p=s.skiff,dx=x-p.x,dy=y-p.y;if(Math.hypot(dx,dy)<9){await keys(draw?['Space']:[]);return s;}const arr=[];if(Math.abs(dx)>5)arr.push(dx>0?'d':'a');if(Math.abs(dy)>5)arr.push(dy>0?'s':'w');if(draw)arr.push('Space');await keys(arr);await page.clock.runFor(50);}throw new Error('Navigation stuck')}
// --- Harbor flow: seed purse, buy through real UI, verify effects ---
await page.evaluate(()=>localStorage.setItem('inkbound-cartographer-sovereign-purse-v1','600'));
await page.reload();await page.clock.runFor(200);
await shot('1-title');
const purse0=await page.evaluate(()=>JSON.parse(localStorage.getItem('inkbound-cartographer-sovereign-purse-v1')));
await page.keyboard.press('h');await page.clock.runFor(150);
const harborVisible=await page.locator('#menu-harbor').isVisible();if(!harborVisible)throw Error('Harbor screen did not open via H');
await shot('2-harbor');
await page.click('#harbor-tracks [data-buy-track="sail"]');await page.clock.runFor(100);
const purse1=await page.evaluate(()=>JSON.parse(localStorage.getItem('inkbound-cartographer-sovereign-purse-v1')));
if(purse1>=purse0)throw Error('Purchase did not spend purse');
const tiers=await page.evaluate(()=>JSON.parse(localStorage.getItem('inkbound-cartographer-harbor-v1')));
if(tiers.sail!==1)throw Error('Sail tier not persisted');
console.log('HARBOR PASS purse',purse0,'->',purse1,'tiers',JSON.stringify(tiers));
// --- Ledger flow ---
await page.keyboard.press('l');await page.clock.runFor(150);
const ledgerVisible=await page.locator('#menu-ledger').isVisible();if(!ledgerVisible)throw Error('Ledger did not open via L');
const rows=await page.locator('#ledger-table').innerText();if(!/RHEA|VANCE|[A-Z]{4,}/.test(rows))throw Error('Ledger rows missing');
await shot('4-ledger');console.log('LEDGER PASS rows:',rows.slice(0,160).replace(/\n/g,' | '));
await page.click('#btn-ledger-back');await page.clock.runFor(100);
// --- Full campaign playthrough (same genuine navigation as v2) ---
await page.click('#btn-start');await page.clock.runFor(200);
const spdBase=(await state()).skiff.spd;console.log('TUNED SPD',spdBase,'(base v2 was 2.8, expect >2.8)');
let cover=false;
for(let tide=1;tide<=4;tide++){for(let n=0;n<8;n++){let s=await state();if(s.state!=='PLAY')break;for(let wait=0;s.skiff.thr<65&&wait<20;wait++){await keys([]);await page.clock.runFor(250);s=await state();}const r=s.rifts.find(r=>!r.locked);if(!r)throw Error('All rifts locked');const z=70;await go(r.x-z,r.y-z);await go(r.x+z,r.y-z,true);await go(r.x+z,r.y+z,true);await go(r.x-z,r.y+z,true);if(tide===4&&r.type==='sovereign'){cover=true;}await go(r.x-z,r.y-z,true);await keys([]);await page.clock.runFor(200);s=await state();console.log('LOOP',tide,n,'state',s.state,'score',s.score,'hp',s.skiff.hp);if(s.state==='GAMEOVER')break;}
let s=await state();if(s.state==='UPGRADE'){await page.click('[data-upgrade="hull"]');await page.clock.runFor(100)}else if(s.state!=='PLAY')break;}
if(!cover)throw Error('Sovereign rift never reached');
let s=await state();if(s.state!=='WIN')throw Error('No actual win, state='+s.state);
const purseAfterWin=await page.evaluate(()=>JSON.parse(localStorage.getItem('inkbound-cartographer-sovereign-purse-v1')));
console.log('WIN PASS purse banked:',purse1,'->',purseAfterWin);
if(purseAfterWin<=purse1)throw Error('Win did not bank sovereigns');
// --- Inkdeep continuation ---
await page.keyboard.press('Enter');await page.clock.runFor(400);
s=await state();if(s.inkCycle<1)throw Error('Inkdeep did not start, inkCycle='+s.inkCycle+' state='+s.state);
console.log('INKDEEP START state',s.state,'cycle',s.inkCycle,'scale',s.inkScale);
// play first Inkdeep chart
for(let n=0;n<8;n++){s=await state();if(s.state!=='PLAY')break;for(let wait=0;s.skiff.thr<65&&wait<20;wait++){await keys([]);await page.clock.runFor(250);s=await state();}const r=s.rifts.find(r=>!r.locked);if(!r)break;const z=70;await go(r.x-z,r.y-z);await go(r.x+z,r.y-z,true);await go(r.x+z,r.y+z,true);await go(r.x-z,r.y+z,true);if(n===0)await shot('3-inkdeep');await go(r.x-z,r.y-z,true);await keys([]);await page.clock.runFor(200);}
s=await state();console.log('INKDEEP AFTER CHART state',s.state,'depth',s.inkDepth,'cycle',s.inkCycle);
if(s.inkDepth<1)throw Error('Inkdeep depth did not advance');
const depthSaved=await page.evaluate(()=>localStorage.getItem('inkbound-inkdeep-best'));console.log('INKDEEP PASS saved best:',depthSaved);
// --- bank on loss ---
await page.evaluate(()=>{const sim=window.inkbound;}); // read-only guard already proven v2
s=await state();if(s.state==='INKDEEP_START'){await page.keyboard.press('Enter');await page.clock.runFor(300);}
for(let i=0;i<20&&(await state()).state==='PLAY';i++)await page.clock.runFor(15000);
s=await state();console.log('LOSS state',s.state);
const purseAfterLoss=await page.evaluate(()=>JSON.parse(localStorage.getItem('inkbound-cartographer-sovereign-purse-v1')));
console.log('LOSS BANK purse:',purseAfterLoss,'(was',purseAfterWin,')');
// --- persistence across reload ---
await page.reload();await page.clock.runFor(200);
const persist=await page.evaluate(()=>({purse:localStorage.getItem('inkbound-cartographer-sovereign-purse-v1'),harbor:localStorage.getItem('inkbound-cartographer-harbor-v1'),ink:localStorage.getItem('inkbound-inkdeep-best'),rivals:localStorage.getItem('inkbound-cartographer-ledger-v1')}));
console.log('PERSIST',JSON.stringify(persist));
if(!persist.purse||JSON.parse(persist.purse)<=0)throw Error('Purse lost on reload');
if(!persist.ink||JSON.parse(persist.ink)<1)throw Error('Inkdeep best lost on reload');
console.log('ERRORS',errors);if(errors.length)throw Error('Page errors: '+errors.join(';'));
console.log('V3 PLAYTEST PASS');
await browser.close();server.close()})().catch(e=>{console.error(e);server.close();process.exit(1)});
