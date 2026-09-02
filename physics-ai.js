// physics-ai.js — Zombie movement, detour pathfinding, edge sliding, and boss behavior

GAME.updateZombies = function (state, timestamp, scale) {
    const { zombies, player, walls, worldOpacity } = state;

    // 1. Reset and apply shield charger auras
    zombies.forEach(z => { if (z) { z.isShielded = false; z.shieldedBy = null; } });
    zombies.forEach(charger => {
        if (charger && charger.type === 'shield_charger' && charger.hp > 0) {
            zombies.forEach(z => {
                if (z && z !== charger && z.type !== 'shield_charger' && z.type !== 'boss') {
                    if (Math.hypot(z.x - charger.x, z.y - charger.y) < 150) {
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

        const directAngle = Math.atan2(player.y - z.y, player.x - z.x);
        let angle = directAngle;
        const distToPlayer = Math.hypot(player.x - z.x, player.y - z.y);

        // Track position to detect stuck states
        const movedDist = Math.hypot(z.x - (z.lastX || z.x), z.y - (z.lastY || z.y));
        z.lastX = z.x; z.lastY = z.y;
        if (movedDist < 0.15) z.stuckTicks = (z.stuckTicks || 0) + 1;
        else z.stuckTicks = Math.max(0, (z.stuckTicks || 0) - 1);

        // 2. Line of sight & detour pathfinding
        if (!GAME.isPathBlocked(z.x, z.y, player.x, player.y, walls, 6)) {
            angle = directAngle;
        } else {
            // Test feeler rays to find open flank around walls
            const feelerDist = Math.min(160, distToPlayer);
            const offsets = [0.35, -0.35, 0.7, -0.7, 1.05, -1.05, 1.4, -1.4, 1.75, -1.75];
            let foundDetour = false;

            for (let off of offsets) {
                const testAngle = directAngle + off;
                const fx = z.x + Math.cos(testAngle) * feelerDist;
                const fy = z.y + Math.sin(testAngle) * feelerDist;
                if (!GAME.isPathBlocked(z.x, z.y, fx, fy, walls, 6)) {
                    angle = testAngle;
                    foundDetour = true;
                    break;
                }
            }
            if (!foundDetour) {
                // Boxed in or no clear path: head directly at wall
                angle = directAngle;
            }
        }

        let moveX = 0, moveY = 0, isDashingNow = false;

        // 3. Boss logic
        if (z.type === 'boss') {
            const hpPct = z.hp / z.maxHp;
            const baseSpeed = z.baseSpeed || 1.5;
            z.speed = hpPct < 0.5 ? baseSpeed * 1.3 : baseSpeed;
            z.color = hpPct < 0.5 ? '#c0392b' : '#2c3e50';

            const now = Date.now();
            if (hpPct < 0.5) {
                if (z.isDashingBoss) {
                    if (now - z.dashStart > 400) {
                        z.isDashingBoss = false; z.lastChargeTime = now;
                        moveX = Math.cos(angle) * z.speed * scale; moveY = Math.sin(angle) * z.speed * scale;
                    } else {
                        moveX = Math.cos(z.dashAngle) * 12 * scale; moveY = Math.sin(z.dashAngle) * 12 * scale;
                        isDashingNow = true;
                    }
                } else if (z.isTelegraphing) {
                    if (now - z.telegraphStart > 1000) {
                        z.isTelegraphing = false; z.isDashingBoss = true; z.dashStart = now; z.dashAngle = directAngle;
                        moveX = Math.cos(z.dashAngle) * 12 * scale; moveY = Math.sin(z.dashAngle) * 12 * scale;
                        isDashingNow = true;
                    }
                } else if (!z.lastChargeTime || now - z.lastChargeTime > 6000) {
                    z.isTelegraphing = true; z.telegraphStart = now;
                } else {
                    moveX = Math.cos(angle) * z.speed * scale; moveY = Math.sin(angle) * z.speed * scale;
                }
            } else {
                moveX = Math.cos(angle) * z.speed * scale; moveY = Math.sin(angle) * z.speed * scale;
            }
        } else {
            moveX = Math.cos(angle) * z.speed * scale;
            moveY = Math.sin(angle) * z.speed * scale;
        }

        z.x += moveX;
        z.y += moveY;

        // Knockback decay
        if (z.kbVx) { z.x += z.kbVx * scale; z.kbVx *= 0.85; if (Math.abs(z.kbVx) < 0.1) z.kbVx = 0; }
        if (z.kbVy) { z.y += z.kbVy * scale; z.kbVy *= 0.85; if (Math.abs(z.kbVy) < 0.1) z.kbVy = 0; }

        // 4. Wall collision resolution & smart tangential edge-sliding
        let slideX = 0, slideY = 0;
        walls.forEach(w => {
            const rot = w.rotation || 0;
            const cos = Math.cos(rot), sin = Math.sin(rot);
            const dx = z.x - w.x, dy = z.y - w.y;
            const lx = dx * cos + dy * sin, ly = -dx * sin + dy * cos;
            const tx = Math.max(-40, Math.min(lx, 40)), ty = Math.max(-10, Math.min(ly, 10));
            const dist = Math.hypot(lx - tx, ly - ty);

            if (dist < z.radius) {
                const overlap = z.radius - dist;
                const nx = dist > 0.001 ? (lx - tx) / dist : 0;
                const ny = dist > 0.001 ? (ly - ty) / dist : 1;
                const wnx = nx * cos - ny * sin;
                const wny = nx * sin + ny * cos;

                // Push out along normal
                z.x += wnx * overlap;
                z.y += wny * overlap;

                // Smooth tangential sliding around corners
                const t1x = -wny, t1y = wnx;
                const t2x = wny, t2y = -wnx;
                const toPlayerX = player.x - z.x, toPlayerY = player.y - z.y;
                const bestTx = (t1x * toPlayerX + t1y * toPlayerY >= 0) ? t1x : t2x;
                const bestTy = (t1x * toPlayerX + t1y * toPlayerY >= 0) ? t1y : t2y;
                slideX += bestTx * (z.speed || 1) * 0.8 * scale;
                slideY += bestTy * (z.speed || 1) * 0.8 * scale;

                // Deal damage to wall
                const stuckDmgBoost = (z.stuckTicks && z.stuckTicks > 10) ? 2.5 : 1.0;
                w.hp -= (isDashingNow ? 4.0 : 1.0 * stuckDmgBoost) * scale;
                if (w.hp <= 0) {
                    const idx = walls.indexOf(w);
                    if (idx !== -1) walls.splice(idx, 1);
                }
            }
        });

        // Apply edge slide
        if (slideX !== 0 || slideY !== 0) {
            z.x += slideX;
            z.y += slideY;
        }

        // 5. Solid hazard collision
        if (state.hazards) {
            state.hazards.forEach(hz => {
                if (hz.solid) {
                    const hd = Math.hypot(z.x - hz.x, z.y - hz.y);
                    if (hd < z.radius + hz.radius) {
                        const hOverlap = (z.radius + hz.radius) - hd;
                        z.x += ((z.x - hz.x) / (hd || 1)) * hOverlap;
                        z.y += ((z.y - hz.y) / (hd || 1)) * hOverlap;
                    }
                }
            });
        }

        // 6. Player contact damage
        if (distToPlayer < 30) {
            player.hp -= (worldOpacity > 0.5 ? 0.75 : 0.5) * scale;
            if (z.isShielded) {
                GAME.spawnShieldSpark(state, z.x, z.y, 2);
                GAME.soundManager.playSynth(440, 0.05, 'triangle');
            } else {
                z.hp -= (isDashingNow ? 1.0 : 0.5) * scale;
                GAME.spawnBlood(state, player.x, player.y, 1);
                if (z.hp <= 0) zombies.splice(i, 1);
            }
            if (player.hp <= 0) GAME.doGameOver(state);
            GAME.updateHUD(state);
        }

        // 7. Ranged AI & distance keeping
        const isBossBacking = z.type === 'boss' && (z.hp / z.maxHp >= 0.3) && !z.isTelegraphing && !z.isDashingBoss;
        if (z.type === 'shooter' || z.type === 'shotgunner' || z.type === 'ar_gunner' || z.type === 'flamethrower' || isBossBacking || z.type === 'shield_charger') {
            const keepDist = z.type === 'boss' ? 400 : 300;
            if (distToPlayer < keepDist) {
                z.x -= Math.cos(directAngle) * z.speed * scale;
                z.y -= Math.sin(directAngle) * z.speed * scale;
            }
            if (z.type !== 'shield_charger' && GAME.handleShooterAI) {
                GAME.handleShooterAI(state, z, directAngle);
            }
        }
        if (z.type === 'exploder' && distToPlayer < 50) {
            zombies.splice(i, 1);
            GAME.explodeGeneric(state, z.x, z.y, 30, 200, true);
        }
    }
};
