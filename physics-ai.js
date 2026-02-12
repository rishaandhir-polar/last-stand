GAME.updateZombies = function (state, timestamp, scale) {
    const { zombies, player, walls, worldOpacity } = state;
    for (let i = zombies.length - 1; i >= 0; i--) {
        let z = zombies[i];
        let angle = Math.atan2(player.y - z.y, player.x - z.x);
        z.x += Math.cos(angle) * z.speed * scale; z.y += Math.sin(angle) * z.speed * scale;

        walls.forEach(w => {
            let halfW = Math.abs((w.rotation || 0) - Math.PI / 2) < 0.1 ? 10 : 40;
            let halfH = Math.abs((w.rotation || 0) - Math.PI / 2) < 0.1 ? 40 : 10;
            let testX = Math.max(w.x - halfW, Math.min(z.x, w.x + halfW));
            let testY = Math.max(w.y - halfH, Math.min(z.y, w.y + halfH));
            if (Math.hypot(z.x - testX, z.y - testY) < z.radius) {
                z.x -= Math.cos(angle) * z.speed * scale; z.y -= Math.sin(angle) * z.speed * scale;
                w.hp -= 0.5 * scale; if (w.hp <= 0) walls.splice(walls.indexOf(w), 1);
            }
        });

        let dToP = Math.hypot(player.x - z.x, player.y - z.y);
        if (dToP < 30) {
            player.hp -= (worldOpacity > 0.5 ? 0.75 : 0.5) * scale;
            z.hp -= 0.5 * scale; GAME.spawnBlood(state, player.x, player.y, 1);
            if (z.hp <= 0) zombies.splice(i, 1);
            if (player.hp <= 0) GAME.doGameOver(state);
            GAME.updateHUD(state);
        }

        if (z.type === 'shooter' || z.type === 'shotgunner' || z.type === 'ar_gunner' || z.type === 'flamethrower') {
            if (dToP < 250) { z.x -= Math.cos(angle) * z.speed * scale; z.y -= Math.sin(angle) * z.speed * scale; }
            GAME.handleShooterAI(state, z, angle);
        }
        if (z.type === 'exploder' && dToP < 50) { zombies.splice(i, 1); GAME.explodeGeneric(state, z.x, z.y, 30, 200, true); }
    }
};

GAME.handleShooterAI = function (state, z, angle) {
    const { enemyBullets, player, particles } = state;
    const now = Date.now();
    const dToP = Math.hypot(player.x - z.x, player.y - z.y);

    if (z.type === 'shooter' && (!z.lastShot || now - z.lastShot > 2000)) {
        enemyBullets.push({ x: z.x, y: z.y, vx: Math.cos(angle) * 10, vy: Math.sin(angle) * 10, dmg: 10, radius: 5 });
        GAME.soundManager.playFile('pistol', 0.2); z.lastShot = now;
    }
    if (z.type === 'shotgunner' && (!z.lastShot || now - z.lastShot > 3000)) {
        for (let k = -2; k <= 2; k++) enemyBullets.push({ x: z.x, y: z.y, vx: Math.cos(angle + k * 0.15) * 10, vy: Math.sin(angle + k * 0.15) * 10, dmg: 4, radius: 4 });
        GAME.soundManager.playFile('shotgun', 0.3); z.lastShot = now;
    }
    if (z.type === 'ar_gunner') {
        if (z.isReloading) { if (now - z.reloadStart > 5000) { z.ammo = 75; z.isReloading = false; } }
        else if (z.ammo <= 0) { z.isReloading = true; z.reloadStart = now; }
        else if (!z.lastShot || now - z.lastShot > 100) {
            enemyBullets.push({ x: z.x, y: z.y, vx: Math.cos(angle + (Math.random() - 0.5) * 0.1) * 12, vy: Math.sin(angle + (Math.random() - 0.5) * 0.1) * 12, dmg: 5, radius: 3 });
            z.ammo--; GAME.soundManager.playFile('rifle', 0.1); z.lastShot = now;
        }
    }
    if (z.type === 'flamethrower' && dToP < 120) {
        if (!z.lastShot || now - z.lastShot > 50) {
            for (let k = 0; k < 3; k++) particles.push({ x: z.x + Math.cos(angle) * 20, y: z.y + Math.sin(angle) * 20, vx: Math.cos(angle + (Math.random() - 0.5) * 0.5) * 6, vy: Math.sin(angle + (Math.random() - 0.5) * 0.5) * 6, life: 30, color: '#e67e22' });
            if (dToP < 110) { player.hp -= 0.3; GAME.updateHUD(state); }
            z.lastShot = now;
        }
    }
};
