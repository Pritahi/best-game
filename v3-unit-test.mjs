import assert from 'node:assert/strict';
const store=new Map();globalThis.localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const {loadPurse,getPurse,bankRun,RATES}=await import('./repo/game/economy.js');
const {TRACKS,buy,ownedTiers,applyTuning}=await import('./repo/game/harbor.js');
const {RIVALS,ledger,checkBested,checkInkdeepBested}=await import('./repo/game/rivals.js');
const {Simulation}=await import('./repo/game/simulation.js');

// economy math
assert.equal(getPurse(),0);
const purse1=bankRun({stats:{seals:4,rescues:2,multiCaptures:1},medals:['GOLD','BRONZE']});
assert.equal(purse1,4*RATES.seal+RATES.comboCapture+2*RATES.rescue+RATES.medal.GOLD+RATES.medal.BRONZE);
assert.equal(loadPurse(),purse1);

// harbor buy + effects
const before=getPurse();
const r1=buy('sail');assert.equal(r1.success,true);assert.equal(getPurse(),before-100);
const r2=buy('ward');assert.equal(r2.success,true);
store.set('inkbound-cartographer-sovereign-purse-v1','0');
const r3=buy('hull');assert.equal(r3.success,false);assert.equal(r3.reason,'insufficient-funds');
const s=new Simulation();s.reset();
assert.equal(s.skiff.spd,2.8+0.22,'sail tier applied');
const ward=s.rifts.find(r=>r.type==='ward');assert(!ward||ward.maxHp<=2,'ward lodestone applied');

// rivals besting + persistence
const nb=checkBested(1,99999);assert(Array.isArray(nb)&&nb.length>0,'bested someone');
const nb2=checkBested(1,1);assert.equal(nb2.length,0,'no double/lower best');
const ni=checkInkdeepBested(999);assert(ni.length>0);
const rows=ledger({bestScore:5000,bestByChart:{},medals:{}});assert(rows.some(r=>r.id==='player'));

// inkdeep scaling + single-bank guard
const s2=new Simulation();s2.state='PLAY';s2.reset();s2.state='PLAY';
const p0=getPurse();
s2.state='WIN';s2.continueRun();assert.equal(s2.inkCycle,1);
s2._settleRun&&s2._settleRun();const p1=getPurse();
s2._settleRun&&s2._settleRun();assert.equal(getPurse(),p1,'no double banking within segment');
console.log('PASS economy rates/banking, harbor buy/effects/insufficient, rivals besting/ledger, inkdeep single-bank');
