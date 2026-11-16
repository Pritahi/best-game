export function render(state) {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#102a32'; ctx.fillRect(0,0,1200,800);
    
    // Grid
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.1)';
    for(let i=0; i<1200; i+=50) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,800); ctx.stroke(); }
    for(let i=0; i<800; i+=50) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(1200,i); ctx.stroke(); }

    // Compass
    ctx.strokeStyle = '#d4af37';
    ctx.beginPath(); ctx.arc(100, 700, 50, 0, Math.PI*2); ctx.stroke();
    ctx.moveTo(100, 650); ctx.lineTo(100, 750); ctx.stroke();
    ctx.moveTo(50, 700); ctx.lineTo(150, 700); ctx.stroke();

    // Sealed
    state.sealedPolygons.forEach(poly => {
        ctx.fillStyle = 'rgba(64, 224, 208, 0.2)';
        ctx.beginPath(); ctx.moveTo(poly[0].x, poly[0].y);
        poly.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.fill();
    });

    // Rifts
    state.rifts.forEach((r, i) => {
        ctx.strokeStyle = r.sealed ? '#40e0d0' : '#d4af37';
        ctx.beginPath(); ctx.arc(r.x, r.y, 20, 0, Math.PI*2); ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.fillText(i+1, r.x, r.y);
    });

    // Skiff
    ctx.fillStyle = '#f4ece1';
    ctx.fillRect(state.player.x-10, state.player.y-10, 20, 20);
}
