GAME.drawEntities = function (ctx, state) {
    const { player, zombies, bullets, enemyBullets } = state;

    zombies.forEach(z => {
        ctx.fillStyle = z.color;
        ctx.beginPath(); ctx.arc(z.x, z.y, z.radius, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.stroke();
        let hpPct = z.hp / z.maxHp;
        ctx.fillStyle = '#e74c3c'; ctx.fillRect(z.x - 20, z.y - z.radius - 10, 40, 5);
        ctx.fillStyle = '#2ecc71'; ctx.fillRect(z.x - 20, z.y - z.radius - 10, 40 * hpPct, 5);
        if (z.type === 'shooter' || z.type === 'shotgunner' || z.type === 'ar_gunner' || z.type === 'boss') {
            ctx.save(); ctx.translate(z.x, z.y); ctx.rotate(Math.atan2(player.y - z.y, player.x - z.x));
            if (z.type === 'shooter') { ctx.fillStyle = '#555'; ctx.fillRect(10, -3, 25, 6); }
            if (z.type === 'shotgunner') { ctx.fillStyle = '#333'; ctx.fillRect(10, -5, 20, 10); }
            if (z.type === 'ar_gunner') { ctx.fillStyle = '#111'; ctx.fillRect(10, -2, 25, 4); }
            if (z.type === 'boss') { ctx.fillStyle = '#000'; ctx.fillRect(50, -10, 50, 20); ctx.strokeStyle = '#444'; ctx.strokeRect(50, -10, 50, 20); }
            ctx.restore();
        }
    });

    ctx.save(); ctx.translate(player.x, player.y); ctx.rotate(player.angle);
    ctx.fillStyle = '#2980b9'; ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillRect(8, -4, 25, 8); // Barrel
    ctx.restore();

    bullets.forEach(b => { ctx.fillStyle = b.color || '#f1c40f'; ctx.beginPath(); ctx.arc(b.x, b.y, 4, 0, Math.PI * 2); ctx.fill(); });
    enemyBullets.forEach(b => { ctx.fillStyle = '#e74c3c'; ctx.beginPath(); ctx.arc(b.x, b.y, b.radius || 5, 0, Math.PI * 2); ctx.fill(); });
};
