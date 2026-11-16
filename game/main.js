import { state, initTide, update } from './simulation.js';
import { render } from './render.js';
import { playSound } from './sound.js';

const keys = {};
window.addEventListener('keydown', e => {
    if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
    keys[e.key === ' ' ? 'Space' : e.key] = true;
    if (e.key.toLowerCase() === 'p') state.paused = !state.paused;
    if (e.key.toLowerCase() === 'r') restart();
});
window.addEventListener('keyup', e => keys[e.key === ' ' ? 'Space' : e.key] = false);

function applyUpgrade(idx) {
    state.upgrades[idx].fn();
    state.phase = 'PLAY';
    initTide(state.tide + 1);
}

function restart() {
    state.active = true; state.phase = 'PLAY'; state.sealedCount = 0; state.time = 0;
    state.player.hull = 3; state.player.thread = 160; initTide(1);
    playSound('start');
}

function updateHUD() {
    document.getElementById('rifts-sealed').innerText = state.sealedCount;
    document.getElementById('current-tide').innerText = state.tide;
    document.getElementById('hull-integrity').innerText = Math.max(0, state.player.hull * 33);
    document.getElementById('thread-bar').style.width = `${(state.player.thread / state.player.maxThread) * 100}%`;
    document.getElementById('dash-bar').style.width = `${Math.max(0, (1 - state.player.dashCd / 2) * 100)}%`;
    document.getElementById('game-time').innerText = `${Math.floor(state.time/60)}:${Math.floor(state.time%60).toString().padStart(2,'0')}`;

    document.getElementById('screen-start').classList.toggle('hidden', state.active);
    document.getElementById('screen-pause').classList.toggle('hidden', !state.paused);
    document.getElementById('screen-result').classList.toggle('hidden', state.phase !== 'RESULT');
}

let last = 0;
function loop(t) {
    const dt = Math.min(0.1, (t - last) / 1000);
    last = t;
    update(dt, keys);
    updateHUD();
    render(state);
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
