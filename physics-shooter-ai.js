// physics-shooter-ai.js — Enemy weapon logic for ranged zombies and boss phases

GAME.handleShooterAI = function (state, z, angle) {
    const { enemyBullets, player, particles } = state;
    const now = Date.now();
    const dToP = Math.hypot(player.x - z.x, player.y - z.y);

    if (z.type === 'shooter' && (!z.lastShot || now - z.lastShot > 2000)) {
        enemyBullets.push({ x: z.x, y: z.y, vx: Math.cos(angle) * 10, vy: Math.sin(angle) * 10, dmg: 10, radius: 5 });
        GAME.soundManager.playFile('pistol', 0.2); z.lastShot = now;
    }
    if (z.type === 'shotgunner' && (!z.lastShot || now - z.lastShot > 3000)) {
        for (let k = -2; k <= 2; k++) {
            enemyBullets.push({ x: z.x, y: z.y, vx: Math.cos(angle + k * 0.15) * 10, vy: Math.sin(angle + k * 0.15) * 10, dmg: 4, radius: 4 });
        }
        GAME.soundManager.playFile('shotgun', 0.3); z.lastShot = now;
    }
    if (z.type === 'ar_gunner') {
        if (z.isReloading) {
            if (now - z.reloadStart > 5000) { z.ammo = 75; z.isReloading = false; }
        } else if (z.ammo <= 0) {
            z.isReloading = true; z.reloadStart = now;
        } else if (!z.lastShot || now - z.lastShot > 100) {
            enemyBullets.push({ x: z.x, y: z.y, vx: Math.cos(angle + (Math.random() - 0.5) * 0.1) * 12, vy: Math.sin(angle + (Math.random() - 0.5) * 0.1) * 12, dmg: 5, radius: 3 });
            z.ammo--; GAME.soundManager.playFile('rifle', 0.1); z.lastShot = now;
        }
    }
    if (z.type === 'flamethrower' && dToP < 120) {
        if (!z.lastShot || now - z.lastShot > 50) {
            for (let k = 0; k < 3; k++) {
                particles.push({
                    x: z.x + Math.cos(angle) * 20, y: z.y + Math.sin(angle) * 20,
                    vx: Math.cos(angle + (Math.random() - 0.5) * 0.5) * 6, vy: Math.sin(angle + (Math.random() - 0.5) * 0.5) * 6,
                    life: 30, color: '#e67e22'
                });
            }
            if (dToP < 110) { player.hp -= 0.3; GAME.updateHUD(state); }
            z.lastShot = now;
        }
    }
    if (z.type === 'boss') {
        const hpPct = z.hp / z.maxHp;
        if (z.isTelegraphing || z.isDashingBoss) return;

        if (hpPct >= 0.7) {
            // Phase 1: Sniper Mode
            if (!z.lastShot || now - z.lastShot > 2000) {
                enemyBullets.push({ x: z.x, y: z.y, vx: Math.cos(angle) * 16, vy: Math.sin(angle) * 16, dmg: 30, radius: 6 });
                GAME.soundManager.playFile('rifle', 0.4);
                state.screenShake = Math.max(state.screenShake, 3);
                z.lastShot = now;
            }
        } else if (hpPct >= 0.3) {
            // Phase 2: Shotgun Mode
            if (!z.lastShot || now - z.lastShot > 2500) {
                for (let k = -2; k <= 2; k++) {
                    enemyBullets.push({ x: z.x, y: z.y, vx: Math.cos(angle + k * 0.15) * 10, vy: Math.sin(angle + k * 0.15) * 10, dmg: 12, radius: 4 });
                }
                GAME.soundManager.playFile('shotgun', 0.4);
                state.screenShake = Math.max(state.screenShake, 6);
                z.lastShot = now;
            }
        } else {
            // Phase 3: Flamethrower Mode
            if (!z.lastShot || now - z.lastShot > 60) {
                for (let k = 0; k < 2; k++) {
                    particles.push({
                        x: z.x + Math.cos(angle) * 35, y: z.y + Math.sin(angle) * 35,
                        vx: Math.cos(angle + (Math.random() - 0.5) * 0.5) * 6, vy: Math.sin(angle + (Math.random() - 0.5) * 0.5) * 6,
                        life: 25, color: Math.random() > 0.4 ? '#e67e22' : '#f1c40f'
                    });
                }
                if (dToP < 130) { player.hp -= 0.6; GAME.updateHUD(state); }
                z.lastShot = now;
            }
        }
    }
};
