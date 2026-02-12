GAME.updatePhysics = function (state, timestamp, dt) {
    if (state.gameOver) return;
    const { player, zombies, items, canvas, keys, mobileInput } = state;
    const scale = dt / 16.67;

    // Auto-fire for certain weapons
    if (state.isFiring && (player.weapon === 'ar' || player.weapon === 'flamethrower')) {
        if (timestamp > state.fireCooldown) window.dispatchEvent(new CustomEvent('player-shoot', { detail: { timestamp } }));
    }

    if (state.waveInProgress) {
        if (state.zombiesToSpawn > 0 && timestamp > state.nextSpawnTime) {
            GAME.spawnZombie(state); state.zombiesToSpawn--;
            state.nextSpawnTime = timestamp + Math.max(200, 1000 - (state.wave * 50));
        } else if (state.zombiesToSpawn === 0 && zombies.length === 0) {
            state.waveInProgress = false; GAME.openShop(state);
        }
    }

    GAME.handlePlayerMovement(state, timestamp, scale);
    GAME.updateBullets(state, scale);
    GAME.updateZombies(state, timestamp, scale);
    GAME.updateEnemyBullets(state, scale);
    GAME.updateSystemItems(state, timestamp);
    GAME.updateFX(state, scale);
};

GAME.handlePlayerMovement = function (state, timestamp, scale) {
    const { player, keys, mobileInput, canvas } = state;
    const PLAYER_SPEED = GAME.PLAYER_SPEED;

    // Movement Logic
    let dx = (keys['d'] || keys['ArrowRight'] ? 1 : 0) - (keys['a'] || keys['ArrowLeft'] ? 1 : 0);
    let dy = (keys['s'] || keys['ArrowDown'] ? 1 : 0) - (keys['w'] || keys['ArrowUp'] ? 1 : 0);
    if (mobileInput.active) { dx = mobileInput.x; dy = mobileInput.y; }

    // Dash Logic
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

    // Control Mode Angle Logic
    if (state.controlMode === 'keyboard') {
        const rotationSpeed = 0.04 * scale;
        // Check both lowercase and uppercase for robust key detection
        if (state.keys['z'] || state.keys['Z']) player.angle -= rotationSpeed;
        if (state.keys['c'] || state.keys['C']) player.angle += rotationSpeed;

        // Shoot with Space in keyboard mode
        if (state.keys[' '] && !player.isDashing) {
            if (timestamp > state.fireCooldown) {
                window.dispatchEvent(new CustomEvent('player-shoot', { detail: { timestamp } }));
            }
        }
    } else {
        // Only update angle via mouse if NOT in keyboard mode
        player.angle = Math.atan2(state.mouseY - player.y, state.mouseX - player.x);
    }
};

GAME.updateSystemItems = function (state, timestamp) {
    const { items, canvas } = state;
    if (timestamp - state.lastAmmoSpawn > GAME.AMMO_CRATE_INTERVAL) {
        items.push({ x: 50 + Math.random() * (canvas.width - 100), y: 50 + Math.random() * (canvas.height - 100), type: 'ammo' });
        state.lastAmmoSpawn = timestamp;
    }
};
