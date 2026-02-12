GAME.drawFX = function (ctx, state) {
    const { muzzleFlashes, particles, items, turrets } = state;

    muzzleFlashes.forEach(f => {
        ctx.fillStyle = `rgba(255, 255, 0, ${f.life / 20})`;
        ctx.beginPath(); ctx.arc(f.x, f.y, 10 + Math.random() * 10, 0, Math.PI * 2); ctx.fill();
        if (f.radius) {
            ctx.strokeStyle = `rgba(255, 100, 0, ${f.life / 20})`; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(f.x, f.y, f.radius * (1 - f.life / 20), 0, Math.PI * 2); ctx.stroke();
        }
    });

    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life / 30);
        ctx.fillRect(p.x, p.y, 4, 4);
    });
    ctx.globalAlpha = 1.0;

    items.forEach(item => {
        ctx.fillStyle = item.type === 'ammo' ? '#f39c12' : '#3498db';
        ctx.fillRect(item.x - 15, item.y - 15, 30, 30);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
        ctx.fillText(item.type.toUpperCase(), item.x, item.y + 5);
    });

    turrets.forEach(t => {
        ctx.fillStyle = '#7f8c8d'; ctx.fillRect(t.x - 10, t.y - 10, 20, 20);
        ctx.fillStyle = '#3498db'; ctx.beginPath(); ctx.arc(t.x, t.y, 8, 0, Math.PI * 2); ctx.fill();
    });
};
