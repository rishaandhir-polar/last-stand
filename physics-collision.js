GAME.updateBullets = function (state, scale) {
    const { bullets, zombies, canvas, player } = state;
    for (let i = bullets.length - 1; i >= 0; i--) {
        let b = bullets[i];
        if (b.life) { b.life -= scale; if (b.life <= 0) { bullets.splice(i, 1); continue; } }
        b.x += b.vx * scale; b.y += b.vy * scale;
        if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) { bullets.splice(i, 1); continue; }
        for (let j = zombies.length - 1; j >= 0; j--) {
            let z = zombies[j];
            if (!z) continue;
            if (Math.hypot(b.x - z.x, b.y - z.y) < z.radius) {
                if (z.isShielded) {
                    GAME.spawnShieldSpark(state, z.x, z.y, 4);
                    GAME.soundManager.playSynth(300 + Math.random() * 100, 0.05, 'triangle');
                } else {
                    z.hp -= b.dmg; GAME.spawnBlood(state, z.x, z.y, 5);
                    if (z.hp <= 0) { zombies.splice(j, 1); player.money += z.reward; GAME.checkBossDrop(state, z); GAME.updateHUD(state); }
                }
                if (b.type !== 'sniper') { bullets.splice(i, 1); break; }
            }
        }
    }
};

GAME.updateEnemyBullets = function (state, scale) {
    const { enemyBullets, walls, player, canvas } = state;
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        let b = enemyBullets[i]; b.x += b.vx * scale; b.y += b.vy * scale;
        if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) { enemyBullets.splice(i, 1); continue; }
        let hit = false;
        for (let j = walls.length - 1; j >= 0; j--) {
            let w = walls[j];
            const rot = w.rotation || 0;
            const cos = Math.cos(rot);
            const sin = Math.sin(rot);
            const dx = b.x - w.x;
            const dy = b.y - w.y;
            const lx = dx * cos + dy * sin;
            const ly = -dx * sin + dy * cos;
            const tx = Math.max(-40, Math.min(lx, 40));
            const ty = Math.max(-10, Math.min(ly, 10));
            if (Math.hypot(lx - tx, ly - ty) < 5) {
                w.hp -= b.dmg; 
                if (w.hp <= 0) walls.splice(j, 1); 
                enemyBullets.splice(i, 1); 
                hit = true; 
                break;
            }
        }
        if (hit) continue;
        if (Math.hypot(player.x - b.x, player.y - b.y) < (20 + (b.radius || 0))) {
            player.hp -= b.dmg; GAME.spawnBlood(state, player.x, player.y, 3); enemyBullets.splice(i, 1);
            GAME.updateHUD(state); if (player.hp <= 0) GAME.doGameOver(state);
        }
    }
};
