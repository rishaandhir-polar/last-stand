GAME.updateZombies = function (state, timestamp, scale) {
    const { zombies, player, walls, worldOpacity } = state;

    // Reset shield status on all zombies
    zombies.forEach(z => {
        if (z) {
            z.isShielded = false;
            z.shieldedBy = null;
        }
    });

    // Apply shield logic from shield chargers
    zombies.forEach(charger => {
        if (charger && charger.type === 'shield_charger' && charger.hp > 0) {
            zombies.forEach(z => {
                if (z && z !== charger && z.type !== 'shield_charger' && z.type !== 'boss') {
                    const dist = Math.hypot(z.x - charger.x, z.y - charger.y);
                    if (dist < 150) {
                        z.isShielded = true;
                        z.shieldedBy = charger;
                    }
                }
            });
        }
    });

    for (let i = zombies.length - 1; i >= 0; i--) {
        let z = zombies[i];
        if (!z) continue;
        let angle = Math.atan2(player.y - z.y, player.x - z.x);

        // Smart wall-steering: sample nearby walls and deflect angle away from them
        let steerX = 0, steerY = 0;
        walls.forEach(w => {
            const rot = w.rotation || 0;
            const cos = Math.cos(rot), sin = Math.sin(rot);
            const dx = z.x - w.x, dy = z.y - w.y;
            const lx = dx * cos + dy * sin, ly = -dx * sin + dy * cos;
            const tx = Math.max(-55, Math.min(lx, 55)), ty = Math.max(-20, Math.min(ly, 20));
            const dist = Math.hypot(lx - tx, ly - ty);
            if (dist < 70 && dist > 0.1) {
                const pushStr = (70 - dist) / 70;
                const locPushX = ((lx - tx) / dist) * pushStr;
                const locPushY = ((ly - ty) / dist) * pushStr;
                steerX += locPushX * cos - locPushY * sin;
                steerY += locPushX * sin + locPushY * cos;
            }
        });
        if (steerX !== 0 || steerY !== 0) {
            const dirX = Math.cos(angle) + steerX * 2.0;
            const dirY = Math.sin(angle) + steerY * 2.0;
            angle = Math.atan2(dirY, dirX);
        }

        let moveX = 0;
        let moveY = 0;
        let isDashingNow = false;
        
        // Custom Boss movement and enraged charger dash state machine
        if (z.type === 'boss') {
            const hpPct = z.hp / z.maxHp;
            const baseSpeed = z.baseSpeed || 1.5;
            
            if (hpPct < 0.5) {
                z.speed = baseSpeed * 1.3;
                z.color = '#c0392b'; // Dark Red enraged color
            } else {
                z.speed = baseSpeed;
                z.color = '#2c3e50';
            }
            
            const now = Date.now();
            if (hpPct < 0.5) {
                if (z.isDashingBoss) {
                    if (now - z.dashStart > 400) {
                        z.isDashingBoss = false;
                        z.lastChargeTime = now;
                        moveX = Math.cos(angle) * z.speed * scale;
                        moveY = Math.sin(angle) * z.speed * scale;
                    } else {
                        moveX = Math.cos(z.dashAngle) * 12 * scale;
                        moveY = Math.sin(z.dashAngle) * 12 * scale;
                        isDashingNow = true;
                    }
                } else if (z.isTelegraphing) {
                    if (now - z.telegraphStart > 1000) {
                        z.isTelegraphing = false;
                        z.isDashingBoss = true;
                        z.dashStart = now;
                        z.dashAngle = angle;
                        moveX = Math.cos(z.dashAngle) * 12 * scale;
                        moveY = Math.sin(z.dashAngle) * 12 * scale;
                        isDashingNow = true;
                    } else {
                        // Stands still during telegraph
                        moveX = 0;
                        moveY = 0;
                    }
                } else if (!z.lastChargeTime || now - z.lastChargeTime > 6000) {
                    z.isTelegraphing = true;
                    z.telegraphStart = now;
                    moveX = 0;
                    moveY = 0;
                } else {
                    moveX = Math.cos(angle) * z.speed * scale;
                    moveY = Math.sin(angle) * z.speed * scale;
                }
            } else {
                moveX = Math.cos(angle) * z.speed * scale;
                moveY = Math.sin(angle) * z.speed * scale;
            }
        } else {
            moveX = Math.cos(angle) * z.speed * scale;
            moveY = Math.sin(angle) * z.speed * scale;
        }

        z.x += moveX;
        z.y += moveY;

        // Apply knockback
        if (z.kbVx) {
            z.x += z.kbVx * scale;
            z.kbVx *= 0.85;
            if (Math.abs(z.kbVx) < 0.1) z.kbVx = 0;
        }
        if (z.kbVy) {
            z.y += z.kbVy * scale;
            z.kbVy *= 0.85;
            if (Math.abs(z.kbVy) < 0.1) z.kbVy = 0;
        }

        // Wall collisions
        walls.forEach(w => {
            const rot = w.rotation || 0;
            const cos = Math.cos(rot);
            const sin = Math.sin(rot);
            const dx = z.x - w.x;
            const dy = z.y - w.y;
            const lx = dx * cos + dy * sin;
            const ly = -dx * sin + dy * cos;
            const tx = Math.max(-40, Math.min(lx, 40));
            const ty = Math.max(-10, Math.min(ly, 10));
            if (Math.hypot(lx - tx, ly - ty) < z.radius) {
                z.x -= moveX; z.y -= moveY;
                w.hp -= (isDashingNow ? 2.5 : 0.5) * scale;
                if (w.hp <= 0) {
                    const idx = walls.indexOf(w);
                    if (idx !== -1) walls.splice(idx, 1);
                }
            }
        });

        let dToP = Math.hypot(player.x - z.x, player.y - z.y);
        if (dToP < 30) {
            player.hp -= (worldOpacity > 0.5 ? 0.75 : 0.5) * scale;
            if (z.isShielded) {
                GAME.spawnShieldSpark(state, z.x, z.y, 2);
                GAME.soundManager.playSynth(440, 0.05, 'triangle');
            } else {
                z.hp -= (isDashingNow ? 1.0 : 0.5) * scale; // Boss takes minor self-damage if hitting player during charge
                GAME.spawnBlood(state, player.x, player.y, 1);
                if (z.hp <= 0) zombies.splice(i, 1);
            }
            if (player.hp <= 0) GAME.doGameOver(state);
            GAME.updateHUD(state);
        }

        // Move away from player if weapon distance applies
        // Boss keeps distance if HP >= 30%. Flamethrower phase (< 30%) and Charge phases don't back away.
        const isBossBackingAway = z.type === 'boss' && (z.hp / z.maxHp >= 0.3) && !z.isTelegraphing && !z.isDashingBoss;
        if (z.type === 'shooter' || z.type === 'shotgunner' || z.type === 'ar_gunner' || z.type === 'flamethrower' || isBossBackingAway || z.type === 'shield_charger') {
            const keepDist = z.type === 'boss' ? 400 : 300;
            if (dToP < keepDist) {
                z.x -= Math.cos(angle) * z.speed * scale; z.y -= Math.sin(angle) * z.speed * scale;
            }
            if (z.type !== 'shield_charger') {
                GAME.handleShooterAI(state, z, angle);
            }
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
    if (z.type === 'boss') {
        const hpPct = z.hp / z.maxHp;

        // If telegraphing or dashing, do not shoot standard weapons
        if (z.isTelegraphing || z.isDashingBoss) {
            return;
        }

        if (hpPct >= 0.7) {
            // Phase 1: Sniper Mode (Fires single high-dmg bullet every 2s)
            if (!z.lastShot || now - z.lastShot > 2000) {
                enemyBullets.push({ x: z.x, y: z.y, vx: Math.cos(angle) * 16, vy: Math.sin(angle) * 16, dmg: 30, radius: 6 });
                GAME.soundManager.playFile('rifle', 0.4);
                state.screenShake = Math.max(state.screenShake, 3);
                z.lastShot = now;
            }
        } else if (hpPct >= 0.3) {
            // Phase 2: Shotgun Mode (Fires 5-bullet spread every 2.5s)
            if (!z.lastShot || now - z.lastShot > 2500) {
                for (let k = -2; k <= 2; k++) {
                    enemyBullets.push({ x: z.x, y: z.y, vx: Math.cos(angle + k * 0.15) * 10, vy: Math.sin(angle + k * 0.15) * 10, dmg: 12, radius: 4 });
                }
                GAME.soundManager.playFile('shotgun', 0.4);
                state.screenShake = Math.max(state.screenShake, 6);
                z.lastShot = now;
            }
        } else {
            // Phase 3: Flamethrower Mode (Fires flames continuously every 60ms)
            if (!z.lastShot || now - z.lastShot > 60) {
                for (let k = 0; k < 2; k++) {
                    particles.push({
                        x: z.x + Math.cos(angle) * 35,
                        y: z.y + Math.sin(angle) * 35,
                        vx: Math.cos(angle + (Math.random() - 0.5) * 0.5) * 6,
                        vy: Math.sin(angle + (Math.random() - 0.5) * 0.5) * 6,
                        life: 25,
                        color: Math.random() > 0.4 ? '#e67e22' : '#f1c40f'
                    });
                }
                if (dToP < 130) {
                    player.hp -= 0.6;
                    GAME.updateHUD(state);
                }
                z.lastShot = now;
            }
        }
    }
}
