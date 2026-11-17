import {CHARTS} from './charts.js';
const notes=['One slow pursuing eel. Learn to close a loop.','A buoy turret fires a slow ink bolt every three seconds.','A patroller and gentle rotating currents cross the gyre.','Two reinforced wards guard the final sovereign rift.'];
export function renderAtlas(root,progress){
  if(!root)return;root.replaceChildren();
  CHARTS.forEach((chart,i)=>{
    const card=document.createElement('article'),open=i<progress.maxChart,medal=progress.medals[i];
    card.className=`atlas-card${open?'':' locked'}`;card.style.setProperty('--chart-tone',chart.tone);
    const thumb=document.createElement('div');thumb.className=`atlas-thumb atlas-${i+1}`;thumb.setAttribute('aria-hidden','true');
    const head=document.createElement('header'),name=document.createElement('strong'),status=document.createElement('span');
    name.textContent=`0${i+1} · ${chart.name}`;status.textContent=medal|| (open?'OPEN':'LOCKED');status.className=`atlas-status${medal?' '+medal.toLowerCase():''}`;head.append(name,status);
    const body=document.createElement('p');body.textContent=open?notes[i]:'Chart this region to reveal its hazards.';
    card.append(thumb,head,body);root.append(card);
  });
}
