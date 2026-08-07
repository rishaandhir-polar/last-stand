GAME.isPlacementValid = function (state) {
    const { player, mouseX, mouseY, buildMode, buildRotation, walls, turrets, canvas } = state;
    if (!canvas) return true;

    // 1. Boundary check
    if (mouseX < 20 || mouseX > canvas.width - 20 || mouseY < 20 || mouseY > canvas.height - 20) return false;

    // 2. Player proximity check (radius 35)
    if (Math.hypot(player.x - mouseX, player.y - mouseY) < 35) return false;

    // 3. Entity overlap checks
    if (buildMode === 'turret') {
        for (let t of turrets) {
            if (Math.hypot(t.x - mouseX, t.y - mouseY) < 40) return false;
        }
    }

    // Overlap with existing walls
    for (let w of walls) {
        const rot = w.rotation || 0;
        const cos = Math.cos(rot);
        const sin = Math.sin(rot);
        const dx = mouseX - w.x;
        const dy = mouseY - w.y;
        const lx = dx * cos + dy * sin;
        const ly = -dx * sin + dy * cos;
        const tx = Math.max(-40, Math.min(lx, 40));
        const ty = Math.max(-10, Math.min(ly, 10));
        
        if (buildMode === 'turret' || buildMode === 'drone' || buildMode === 'landmine' || buildMode === 'spike') {
            if (Math.hypot(lx - tx, ly - ty) < 15) return false;
        } else {
            // Wall vs Wall
            if (Math.hypot(w.x - mouseX, w.y - mouseY) < 30) return false;
        }
    }
    return true;
};

GAME.updateItems = function (state, scale) {
    const { items, player } = state;
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        if (Math.hypot(player.x - item.x, player.y - item.y) < 40) {
            if (item.type === 'ammo') player.ammo = Math.min(999, player.ammo + 50);
            if (item.type === 'medkit') player.hp = Math.min(player.maxHp, player.hp + 50);
            items.splice(i, 1);
            GAME.soundManager.click();
            GAME.updateHUD(state);
        }
    }
};

GAME.updateTurrets = function (state, timestamp, scale) {
    const { turrets, bullets } = state;
    turrets.forEach(t => {
        if (t.ammoRegen > 0) t.ammo = Math.min(t.maxAmmo, t.ammo + (t.ammoRegen / 60) * scale);
        if (t.ammo < 1) return;
        
        let target = null;
        let minDist = t.range;
        const zombies = state.zombies;
        zombies.forEach(z => {
            if (!z) return;
            let d = Math.hypot(z.x - t.x, z.y - t.y);
            if (d < minDist) { minDist = d; target = z; }
        });
        
        if (target && timestamp - (t.lastShot || 0) > (t.type === 'shotgun' ? 1000 : 500)) {
            let angle = Math.atan2(target.y - t.y, target.x - t.x);
            if (t.type === 'shotgun') {
                for (let k = -2; k <= 2; k++) {
                    bullets.push({ x: t.x, y: t.y, vx: Math.cos(angle + k * 0.15) * 12, vy: Math.sin(angle + k * 0.15) * 12, dmg: t.damage, life: 30 });
                }
                t.ammo -= 2;
            } else {
                bullets.push({ x: t.x, y: t.y, vx: Math.cos(angle) * 15, vy: Math.sin(angle) * 15, dmg: t.damage });
                t.ammo--;
            }
            t.lastShot = timestamp;
            GAME.soundManager.playFile('pistol', 0.1);
        }
    });
};

GAME.updateGrenades = function (state, timestamp, scale) {
    const { thrownGrenades } = state;
    for (let i = thrownGrenades.length - 1; i >= 0; i--) {
        let g = thrownGrenades[i];
        let d = Math.hypot(g.tx - g.x, g.ty - g.y);
        if (d > 10) {
            let angle = Math.atan2(g.ty - g.y, g.tx - g.x);
            g.x += Math.cos(angle) * 8 * scale;
            g.y += Math.sin(angle) * 8 * scale;
            g.rotation += 0.2 * scale;
        } else {
            GAME.explodeGeneric(state, g.tx, g.ty, 100, 200, false);
            thrownGrenades.splice(i, 1);
        }
    }
};

GAME.updateDrones = function (state, timestamp, scale) {
    const { drones, player, zombies, bullets, keys } = state;

    drones.forEach(d => {
        // Movement Logic
        if (d.mode === 'follow') {
            d.tx = player.x; d.ty = player.y;
            let distToPlayer = Math.hypot(player.x - d.x, player.y - d.y);
            if (distToPlayer > 80) {
                let angle = Math.atan2(player.y - d.y, player.x - d.x);
                d.x += Math.cos(angle) * 5 * scale;
                d.y += Math.sin(angle) * 5 * scale;
            }
        } else if (d.mode === 'manual') {
            let dx = (keys['l'] ? 1 : 0) - (keys['j'] ? 1 : 0);
            let dy = (keys['k'] ? 1 : 0) - (keys['i'] ? 1 : 0);
            d.x += dx * 6 * scale;
            d.y += dy * 6 * scale;
        } else if (d.mode === 'stay') {
            let distToTarget = Math.hypot(d.tx - d.x, d.ty - d.y);
            if (distToTarget > 5) {
                let angle = Math.atan2(d.ty - d.y, d.tx - d.x);
                d.x += Math.cos(angle) * 4 * scale;
                d.y += Math.sin(angle) * 4 * scale;
            }
        }

        // Combat Logic
        let target = null;
        let minDist = d.range;
        zombies.forEach(z => {
            if (!z) return;
            let dist = Math.hypot(z.x - d.x, z.y - d.y);
            if (dist < minDist) { minDist = dist; target = z; }
        });

        if (target && timestamp - (d.lastShot || 0) > 600) {
            let angle = Math.atan2(target.y - d.y, target.x - d.x);
            bullets.push({ x: d.x, y: d.y, vx: Math.cos(angle) * 12, vy: Math.sin(angle) * 12, dmg: d.damage, color: '#f1c40f' });
            d.lastShot = timestamp;
            GAME.soundManager.playFile('pistol', 0.1);
        }

        // Bounce effect
        d.y += Math.sin(timestamp / 200) * 0.5;
    });
};

GAME.updateTraps = function (state, scale) {
    const { mines, spikes } = state;
    for (let i = mines.length - 1; i >= 0; i--) {
        let m = mines[i];
        for (let j = state.zombies.length - 1; j >= 0; j--) {
            let z = state.zombies[j];
            if (!z) continue;
            if (Math.hypot(z.x - m.x, z.y - m.y) < 30) {
                GAME.explodeGeneric(state, m.x, m.y, 80, 150, false);
                mines.splice(i, 1);
                break;
            }
        }
    }
    spikes.forEach(s => {
        state.zombies.forEach(z => {
            if (!z) return;
            if (Math.hypot(z.x - s.x, z.y - s.y) < 40) {
                if (z.isShielded) {
                    if (Math.random() < 0.1) {
                        GAME.spawnShieldSpark(state, z.x, z.y, 1);
                        GAME.soundManager.playSynth(350, 0.03, 'triangle');
                    }
                } else {
                    z.hp -= 0.5 * scale;
                }
            }
        });
    });
};

GAME.updateSystemItems = function (state, timestamp) {
    const { items, canvas } = state;
    if (timestamp - state.lastAmmoSpawn > GAME.AMMO_CRATE_INTERVAL) {
        items.push({ x: 50 + Math.random() * (canvas.width - 100), y: 50 + Math.random() * (canvas.height - 100), type: 'ammo' });
        state.lastAmmoSpawn = timestamp;
    }
};
