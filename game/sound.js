let audio=null, muted=false;
function context(){
  if(!audio){const C=window.AudioContext||window.webkitAudioContext;if(C)audio=new C();}
  if(audio?.state==='suspended') audio.resume();
  return audio;
}
export function setMuted(value){ muted=typeof value==='boolean'?value:!muted; return muted; }
export function isMuted(){return muted;}
export function playSound(type='seal'){
  if(muted)return;
  const c=context(); if(!c)return;
  const now=c.currentTime, presets={
    start:[392,523.25,.35,'sine'],seal:[660,990,.7,'sine'],hit:[130,82,.25,'sawtooth'],
    end:[220,110,.8,'triangle'],win:[523,784,1,'sine'],upgrade:[440,660,.45,'triangle']
  }, [from,to,duration,wave]=presets[type]||presets.seal;
  const osc=c.createOscillator(), gain=c.createGain(), filter=c.createBiquadFilter();
  osc.type=wave; osc.frequency.setValueAtTime(from,now); osc.frequency.exponentialRampToValueAtTime(to,now+duration);
  filter.type='lowpass'; filter.frequency.value=2600;
  gain.gain.setValueAtTime(.0001,now); gain.gain.exponentialRampToValueAtTime(type==='hit'?.12:.075,now+.025);
  gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
  osc.connect(filter); filter.connect(gain); gain.connect(c.destination);
  osc.start(now); osc.stop(now+duration+.03);
}
