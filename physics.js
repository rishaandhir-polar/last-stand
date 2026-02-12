GAME.updatePhysics = function (state, timestamp, dt) {
    if (state.gameOver) return;
    const { player, zombies, items, canvas, keys, mobileInput } = state;
    const scale = dt / 16.67;

    // Prevent shooting and movement if in a menu
    const isMenuOpen = !document.getElementById('shop-menu').classList.contains('hidden') ||
        !document.getElementById('settings-menu').classList.contains('hidden') ||
        !document.getElementById('turret-menu').classList.contains('hidden');

    // Auto-fire for certain weapons
    if (!isMenuOpen && !state.buildMode && state.isFiring && (player.weapon === 'ar' || player.weapon === 'flamethrower')) {
        if (timestamp > state.fireCooldown) window.dispatchEvent(new CustomEvent('player-shoot', { detail: { timestamp } }));
    }

    if (state.waveInProgress) {
        if (state.zombiesToSpawn > 0 && timestamp > state.nextSpawnTime) {
            GAME.spawnZombie(state); state.zombiesToSpawn--;
            state.nextSpawnTime = timestamp + Math.max(200, 1000 - (state.wave * 50));
        } else if (state.zombiesToSpawn === 0 && zombies.length === 0) {
            state.waveInProgress = false;
            state.lastWaveMoney = player.money; // Save money after successful wave
            GAME.openShop(state);
        }
    }

    GAME.handlePlayerMovement(state, timestamp, scale, isMenuOpen);
    GAME.updateBullets(state, scale);
    GAME.updateZombies(state, timestamp, scale);
    GAME.updateEnemyBullets(state, scale);
    GAME.updateItems(state, scale);
    GAME.updateTurrets(state, timestamp, scale);
    GAME.updateGrenades(state, timestamp, scale);
    GAME.updateTraps(state, scale);
    GAME.updateSystemItems(state, timestamp);
    GAME.updateFX(state, scale);
};

GAME.handlePlayerMovement = function (state, timestamp, scale, isMenuOpen) {
    if (isMenuOpen) return;
    const { player, keys, mobileInput, canvas } = state;
    const PLAYER_SPEED = GAME.PLAYER_SPEED;

    let dx = (keys['d'] || keys['ArrowRight'] ? 1 : 0) - (keys['a'] || keys['ArrowLeft'] ? 1 : 0);
    let dy = (keys['s'] || keys['ArrowDown'] ? 1 : 0) - (keys['w'] || keys['ArrowUp'] ? 1 : 0);
    if (mobileInput.active) { dx = mobileInput.x; dy = mobileInput.y; }

    const dashKey = state.controlMode === 'keyboard' ? 'Shift' : ' ';
    if (keys[dashKey] && !player.isDashing && player.stamina >= 30 && (dx !== 0 || dy !== 0)) {
        player.isDashing = true;
        player.lastDashTime = timestamp;
        player.stamina -= 30;
    }

    if (player.isDashing && timestamp - player.lastDashTime > 200) {
        player.isDashing = false;
    }

    if (!player.isDashing && player.stamina < player.maxStamina) player.stamina += 0.5 * scale;

    let speed = player.isDashing ? PLAYER_SPEED * 4 : PLAYER_SPEED;
    if (dx !== 0 || dy !== 0) {
        let len = Math.hypot(dx, dy);
        player.x += (dx / len) * speed * scale; player.y += (dy / len) * speed * scale;
    }
    player.x = Math.max(50, Math.min(canvas.width - 50, player.x));
    player.y = Math.max(50, Math.min(canvas.height - 50, player.y));

    if (state.controlMode === 'keyboard') {
        const rotationSpeed = 0.05 * scale;
        if (state.keys['z'] || state.keys['Z']) player.angle -= rotationSpeed;
        if (state.keys['c'] || state.keys['C']) player.angle += rotationSpeed;

        // Shoot with X in keyboard mode (Space is for Dashing)
        if ((state.keys['x'] || state.keys['X']) && !player.isDashing && !state.buildMode) {
            if (timestamp > state.fireCooldown) {
                window.dispatchEvent(new CustomEvent('player-shoot', { detail: { timestamp } }));
            }
        }
    } else {
        player.angle = Math.atan2(state.mouseY - player.y, state.mouseX - player.x);
    }
};

GAME.updateItems = function (state, scale) {
    const { items, player } = state;
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        if (Math.hypot(player.x - item.x, player.y - item.y) < 40) {
            if (item.type === 'ammo') player.ammo += 100;
            if (item.type === 'medkit') player.hp = Math.min(player.maxHp, player.hp + 50);
            items.splice(i, 1);
            GAME.soundManager.click();
            GAME.updateHUD(state);
        }
    }
};

GAME.updateTurrets = function (state, timestamp, scale) {
    const { turrets, zombies, bullets } = state;
    turrets.forEach(t => {
        if (t.ammoRegen > 0) t.ammo = Math.min(t.maxAmmo, t.ammo + (t.ammoRegen / 60) * scale);
        if (t.ammo < 1) return;

        let target = null, minDist = t.range;
        zombies.forEach(z => {
            let d = Math.hypot(z.x - t.x, z.y - t.y);
            if (d < minDist) { minDist = d; target = z; }
        });

        if (target && timestamp - t.lastShot > (t.type === 'shotgun' ? 1000 : 500)) {
            let angle = Math.atan2(target.y - t.y, target.x - t.x);
            if (t.type === 'shotgun') {
                for (let k = -2; k <= 2; k++) bullets.push({ x: t.x, y: t.y, vx: Math.cos(angle + k * 0.15) * 12, vy: Math.sin(angle + k * 0.15) * 12, dmg: t.damage, life: 30 });
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
        if (d > 5) {
            let angle = Math.atan2(g.ty - g.y, g.tx - g.x);
            g.x += Math.cos(angle) * 10 * scale;
            g.y += Math.sin(angle) * 10 * scale;
            g.rotation += 0.2 * scale;
        } else {
            GAME.explodeGeneric(state, g.x, g.y, 100, 200, false);
            thrownGrenades.splice(i, 1);
        }
    }
};

GAME.updateTraps = function (state, scale) {
    const { mines, spikes, zombies } = state;
    for (let i = mines.length - 1; i >= 0; i--) {
        let m = mines[i];
        for (let j = zombies.length - 1; j >= 0; j--) {
            if (Math.hypot(zombies[j].x - m.x, zombies[j].y - m.y) < 30) {
                GAME.explodeGeneric(state, m.x, m.y, 80, 150, false);
                mines.splice(i, 1);
                break;
            }
        }
    }
    spikes.forEach(s => {
        zombies.forEach(z => {
            if (Math.hypot(z.x - s.x, z.y - s.y) < 40) {
                z.hp -= 0.5 * scale;
                if (z.hp <= 0) { /* Handled in updateZombies usually but spikes work continuously */ }
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
