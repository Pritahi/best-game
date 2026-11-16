const ctx = new (window.AudioContext || window.webkitAudioContext)();
let muted = false;
window.addEventListener('keydown', e => { if (e.key.toLowerCase() === 'm') muted = !muted; });

export function playSound(type) {
    if (muted) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    if (type === 'start') { osc.frequency.value = 440; gain.gain.setValueAtTime(0.1, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1); }
    osc.start(); osc.stop(ctx.currentTime + 1);
}
