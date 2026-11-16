export const WORLD = { w: 1200, h: 800 };
export const state = {
    player: { x: 600, y: 450, hull: 3, thread: 200, maxThread: 200, dashTimer: 0, dashCd: 0, invuln: 0, speed: 170, damageCd: 0 },
    tide: 1, rifts: [], trail: [], sealedPolygons: [], enemies: [], sealedCount: 0,
    time: 0, active: false, paused: false, phase: 'START', events: [], score: 0, grace: 10
};

export function reset() {
    Object.assign(state, {
        player: { x: 600, y: 450, hull: 3, thread: 200, maxThread: 200, dashTimer: 0, dashCd: 0, invuln: 0, speed: 170, damageCd: 0 },
        tide: 1, rifts: [], trail: [], sealedPolygons: [], enemies: [], sealedCount: 0,
        time: 0, active: false, paused: false, phase: 'START', events: [], score: 0, grace: 10
    });
}

export function initTide(t) {
    state.tide = t; state.grace = 10; state.trail = [];
    const base = [[350,300],[850,300],[600,530]];
    state.rifts = base.map(p => ({ x: p[0] + Math.random()*20, y: p[1] + Math.random()*20, sealed: false }));
    state.enemies = Array.from({ length: 3 }, () => ({
        x: Math.random() * WORLD.w, y: Math.random() * WORLD.h, speed: 42 + t * 7
    }));
}

export function applyUpgrade(type) {
    if (type === 'hull') state.player.hull = Math.min(5, state.player.hull + 1);
    else state.player.maxThread += 60;
    state.player.thread = state.player.maxThread;
    if (state.tide < 3) initTide(state.tide + 1);
    else state.phase = 'RESULT';
    state.phase = 'PLAY';
}

function isInside(p, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        if (((poly[i].y > p.y) !== (poly[j].y > p.y)) && (p.x < (poly[j].x - poly[i].x) * (p.y - p.y) / (poly[j].y - poly[i].y) + poly[i].x)) inside = !inside;
    }
    return inside;
}

export function update(dt, keys) {
    if (!state.active || state.paused || state.phase !== 'PLAY') return;
    state.time += dt; state.grace = Math.max(0, state.grace - dt);
    if (state.time > 180) { state.phase = 'RESULT'; return; }
    const p = state.player;
    let ax = 0, ay = 0;
    if (keys.ArrowUp || keys.w) ay -= 1; if (keys.ArrowDown || keys.s) ay += 1;
    if (keys.ArrowLeft || keys.a) ax -= 1; if (keys.ArrowRight || keys.d) ax += 1;

    if (keys.Shift && p.dashCd <= 0) {
        p.dashTimer = 0.25; p.dashCd = 2; p.invuln = 0.6;
        state.enemies = state.enemies.filter(e => Math.hypot(e.x - p.x, e.y - p.y) > 60);
        state.events.push('dash');
    }

    const speed = p.dashTimer > 0 ? p.speed * 3 : p.speed;
    const mag = Math.hypot(ax, ay) || 1;
    p.x = Math.max(50, Math.min(1150, p.x + (ax / mag) * speed * dt));
    p.y = Math.max(110, Math.min(690, p.y + (ay / mag) * speed * dt));

    p.dashTimer -= dt; p.dashCd -= dt; p.invuln -= dt; p.damageCd -= dt;

    if (keys.Space && p.thread > 0) {
        const last = state.trail[state.trail.length - 1];
        if (!last || Math.hypot(p.x - last.x, p.y - last.y) > 6) {
            state.trail.push({ x: p.x, y: p.y }); p.thread -= Math.hypot(p.x - (last?last.x:p.x), p.y - (last?last.y:p.y)) / 6;
        }
    } else if (state.trail.length > 0) {
        const first = state.trail[0], last = state.trail[state.trail.length - 1];
        const perim = state.trail.reduce((acc, pt, i, arr) => i === 0 ? 0 : acc + Math.hypot(pt.x - arr[i-1].x, pt.y - arr[i-1].y), 0);
        if (Math.hypot(last.x - first.x, last.y - first.y) < 55 && state.trail.length >= 8 && perim > 100) {
            let sealed = false;
            state.rifts.forEach(r => { if (!r.sealed && isInside(r, state.trail)) { r.sealed = true; state.sealedCount++; sealed = true; } });
            if (sealed) { state.sealedPolygons.push([...state.trail]); state.events.push('seal'); }
            else state.events.push('fail');
        }
        state.trail = [];
    } else p.thread = Math.min(p.maxThread, p.thread + 12 * dt);

    state.enemies.forEach(e => {
        const d = Math.hypot(p.x - e.x, p.y - e.y);
        if (d > 5) { e.x += ((p.x - e.x) / d) * e.speed * dt; e.y += ((p.y - e.y) / d) * e.speed * dt; }
        if (d < 30 && p.invuln <= 0 && p.damageCd <= 0 && state.grace <= 0) {
            p.hull--; p.damageCd = 2; state.events.push('hit');
            if (p.hull <= 0) state.phase = 'RESULT';
        }
    });

    if (state.rifts.every(r => r.sealed)) {
        if (state.tide < 3) state.phase = 'UPGRADE';
        else { state.phase = 'RESULT'; state.score = state.sealedCount * 1000 + Math.floor(180 - state.time); }
    }
}
