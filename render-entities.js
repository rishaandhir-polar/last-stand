GAME.drawEntities = function (ctx, state) {
    const { player, zombies, bullets, enemyBullets } = state;

    // 1. Draw shield links underneath
    zombies.forEach(z => {
        if (z && z.isShielded && z.shieldedBy && zombies.includes(z.shieldedBy)) {
            ctx.save();
            ctx.strokeStyle = 'rgba(52, 152, 219, 0.45)';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(z.shieldedBy.x, z.shieldedBy.y);
            ctx.lineTo(z.x, z.y);
            ctx.stroke();
            ctx.restore();
        }
    });

    zombies.forEach(z => {
        if (!z) return;
        
        let angle = Math.atan2(player.y - z.y, player.x - z.x);

        // 2. Draw Shield Charger aura
        if (z.type === 'shield_charger') {
            ctx.save();
            ctx.strokeStyle = 'rgba(52, 152, 219, 0.3)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([6, 6]);
            ctx.beginPath();
            ctx.arc(z.x, z.y, 150, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // 3. Draw Boss Telegraph Warning
        if (z.type === 'boss' && z.isTelegraphing) {
            ctx.save();
            ctx.strokeStyle = 'rgba(231, 76, 60, 0.6)';
            ctx.lineWidth = 3;
            ctx.setLineDash([8, 8]);
            ctx.beginPath();
            ctx.moveTo(z.x, z.y);
            ctx.lineTo(z.x + Math.cos(angle) * 700, z.y + Math.sin(angle) * 700);
            ctx.stroke();
            ctx.restore();
        }

        // 4. Draw Zombie Body
        ctx.fillStyle = z.color;
        ctx.beginPath(); ctx.arc(z.x, z.y, z.radius, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.stroke();

        // 5. Draw Shield bubble on top of body
        if (z.isShielded) {
            ctx.save();
            ctx.strokeStyle = 'rgba(52, 152, 219, 0.85)';
            ctx.lineWidth = 3;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#3498db';
            ctx.beginPath();
            ctx.arc(z.x, z.y, z.radius + 4, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // 6. Draw HP Bar
        let hpPct = z.hp / z.maxHp;
        ctx.fillStyle = '#e74c3c'; ctx.fillRect(z.x - 20, z.y - z.radius - 10, 40, 5);
        ctx.fillStyle = '#2ecc71'; ctx.fillRect(z.x - 20, z.y - z.radius - 10, 40 * hpPct, 5);

        // 7. Draw weapon barrels
        if (z.type === 'shooter' || z.type === 'shotgunner' || z.type === 'ar_gunner' || z.type === 'boss') {
            ctx.save(); ctx.translate(z.x, z.y); ctx.rotate(angle);
            if (z.type === 'shooter') { ctx.fillStyle = '#555'; ctx.fillRect(10, -3, 25, 6); }
            if (z.type === 'shotgunner') { ctx.fillStyle = '#333'; ctx.fillRect(10, -5, 20, 10); }
            if (z.type === 'ar_gunner') { ctx.fillStyle = '#111'; ctx.fillRect(10, -2, 25, 4); }
            if (z.type === 'boss') {
                const hpPct = z.hp / z.maxHp;
                if (hpPct >= 0.7) {
                    ctx.fillStyle = '#555'; ctx.fillRect(40, -4, 45, 8);
                } else if (hpPct >= 0.3) {
                    ctx.fillStyle = '#222'; ctx.fillRect(40, -12, 35, 24);
                } else {
                    ctx.fillStyle = '#e67e22'; 
                    ctx.fillRect(40, -10, 30, 8);
                    ctx.fillRect(40, 2, 30, 8);
                }
            }
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
