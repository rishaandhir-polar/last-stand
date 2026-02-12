GAME.drawTopFX = function (ctx, state) {
    const { muzzleFlashes, particles, turrets, thrownGrenades } = state;

    // Draw Particles
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life / 30);
        ctx.fillRect(p.x, p.y, 4, 4);
    });
    ctx.globalAlpha = 1.0;

    // Draw Muzzle Flashes
    muzzleFlashes.forEach(f => {
        ctx.fillStyle = `rgba(255, 255, 0, ${f.life / 20})`;
        ctx.beginPath(); ctx.arc(f.x, f.y, 10 + Math.random() * 10, 0, Math.PI * 2); ctx.fill();
        if (f.radius) {
            ctx.strokeStyle = `rgba(255, 100, 0, ${f.life / 20})`; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(f.x, f.y, f.radius * (1 - f.life / 20), 0, Math.PI * 2); ctx.stroke();
        }
    });

    // Draw Turrets
    turrets.forEach(t => {
        ctx.fillStyle = '#7f8c8d'; ctx.fillRect(t.x - 10, t.y - 10, 20, 20);
        ctx.fillStyle = '#3498db'; ctx.beginPath(); ctx.arc(t.x, t.y, 8, 0, Math.PI * 2); ctx.fill();
    });

    // Draw Thrown Grenades
    thrownGrenades.forEach(g => {
        ctx.save(); ctx.translate(g.x, g.y); ctx.rotate(g.rotation);
        ctx.fillStyle = '#2d5a27'; ctx.fillRect(-6, -8, 12, 16);
        ctx.restore();
    });
};

GAME.drawGroundTraps = function (ctx, state) {
    const { items, mines, spikes } = state;

    // Items
    items.forEach(item => {
        ctx.fillStyle = item.type === 'ammo' ? '#f39c12' : '#3498db';
        ctx.fillRect(item.x - 15, item.y - 15, 30, 30);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
        ctx.fillText(item.type.toUpperCase(), item.x, item.y + 5);
    });

    // Landmines
    mines.forEach(m => {
        ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(m.x, m.y, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'red'; ctx.beginPath(); ctx.arc(m.x, m.y, 3, 0, Math.PI * 2); ctx.fill();
    });

    // Spikes
    spikes.forEach(s => {
        ctx.fillStyle = '#555';
        ctx.fillRect(s.x - 20, s.y - 20, 40, 40);
        ctx.strokeStyle = '#333';
        ctx.strokeRect(s.x - 20, s.y - 20, 40, 40);

        ctx.fillStyle = '#999';
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        const positions = [[-12, -12], [0, -12], [12, -12], [-12, 0], [0, 0], [12, 0], [-12, 12], [0, 12], [12, 12]];
        positions.forEach(pos => {
            ctx.beginPath();
            ctx.moveTo(s.x + pos[0], s.y + pos[1] - 8);
            ctx.lineTo(s.x + pos[0] - 4, s.y + pos[1] + 4);
            ctx.lineTo(s.x + pos[0] + 4, s.y + pos[1] + 4);
            ctx.closePath();
            ctx.fill(); ctx.stroke();
        });
    });
};
