GAME.updatePhysics = function (state, timestamp, dt) {
    if (state.gameOver) return;
    const { player, zombies, items, canvas } = state;
    const scale = dt / 16.67;

    if (player && player.isAdmin) {
        player.hp = player.maxHp;
        player.ammo = 9999;
        player.money = 999999;
    }

    const isMenuOpen = !document.getElementById('shop-menu').classList.contains('hidden') ||
        !document.getElementById('settings-menu').classList.contains('hidden') ||
        !document.getElementById('turret-menu').classList.contains('hidden') ||
        !document.getElementById('drone-menu').classList.contains('hidden') ||
        !document.getElementById('field-manual').classList.contains('hidden');

    // Auto-fire logic
    if (!isMenuOpen && !state.buildMode && state.isFiring && (player.weapon === 'ar' || player.weapon === 'flamethrower' || player.weapon === 'gatling' || player.weapon === 'railgun')) {
        if (timestamp > state.fireCooldown) window.dispatchEvent(new CustomEvent('player-shoot', { detail: { timestamp } }));
    }

    if (state.waveInProgress) {
        if (state.zombiesToSpawn > 0 && timestamp > state.nextSpawnTime) {
            GAME.spawnZombie(state); state.zombiesToSpawn--;
            state.nextSpawnTime = timestamp + Math.max(200, 1000 - (state.wave * 50));
        } else if (state.zombiesToSpawn === 0 && zombies.length === 0) {
            state.waveInProgress = false;
            state.lastWaveMoney = player.money;
            GAME.openShop(state);
        }
    }

    GAME.handlePlayerMovement(state, timestamp, scale, isMenuOpen);
    GAME.updateBullets(state, scale);
    GAME.updateZombies(state, timestamp, scale);
    GAME.updateEnemyBullets(state, scale);
    GAME.updateItems(state, scale);
    GAME.updateTurrets(state, timestamp, scale);
    GAME.updateDrones(state, timestamp, scale);
    GAME.updateGrenades(state, timestamp, scale);
    GAME.updateTraps(state, scale);
    GAME.updateBlackHoles(state, scale);
    GAME.updateSystemItems(state, timestamp);
    GAME.updateFX(state, scale);
};

GAME.handlePlayerMovement = function (state, timestamp, scale, isMenuOpen) {
    if (isMenuOpen) return;
    const { player, keys, mobileInput, canvas, walls, turrets } = state;
    const PLAYER_SPEED = GAME.PLAYER_SPEED;

    let dx = (keys['d'] || keys['ArrowRight'] ? 1 : 0) - (keys['a'] || keys['ArrowLeft'] ? 1 : 0);
    let dy = (keys['s'] || keys['ArrowDown'] ? 1 : 0) - (keys['w'] || keys['ArrowUp'] ? 1 : 0);
    if (mobileInput.active) { dx = mobileInput.x; dy = mobileInput.y; }

    const dashKey = state.controlMode === 'keyboard' ? 'Shift' : ' ';
    if (keys[dashKey] && !player.isDashing && player.stamina >= 30 && (dx !== 0 || dy !== 0)) {
        player.isDashing = true; player.lastDashTime = timestamp; player.stamina -= 30;
    }
    if (player.isDashing && timestamp - player.lastDashTime > 200) player.isDashing = false;
    if (!player.isDashing && player.stamina < player.maxStamina) player.stamina += 0.5 * scale;

    let speed = player.isDashing ? PLAYER_SPEED * 3 : PLAYER_SPEED;
    if (dx !== 0 || dy !== 0) {
        let len = Math.hypot(dx, dy);
        let moveX = (dx / len) * speed * scale;
        let moveY = (dy / len) * speed * scale;

        // Collision with walls and turrets
        let canMoveX = true, canMoveY = true;
        const checkColl = (nx, ny) => {
            for (let w of walls) {
                const rot = w.rotation || 0;
                const cos = Math.cos(rot);
                const sin = Math.sin(rot);
                const dx = nx - w.x;
                const dy = ny - w.y;
                const lx = dx * cos + dy * sin;
                const ly = -dx * sin + dy * cos;
                const tx = Math.max(-40, Math.min(lx, 40));
                const ty = Math.max(-10, Math.min(ly, 10));
                if (Math.hypot(lx - tx, ly - ty) < 15) return true;
            }
            for (let t of turrets) if (Math.hypot(nx - t.x, ny - t.y) < 25) return true;
            return false;
        };

        if (checkColl(player.x + moveX, player.y)) canMoveX = false;
        if (checkColl(player.x, player.y + moveY)) canMoveY = false;

        if (canMoveX) player.x += moveX;
        if (canMoveY) player.y += moveY;
    }

    player.x = Math.max(20, Math.min(canvas.width - 20, player.x));
    player.y = Math.max(20, Math.min(canvas.height - 20, player.y));

    if (state.controlMode === 'keyboard') {
        const rotationSpeed = 0.05 * scale;
        if (keys['z'] || keys['Z']) player.angle -= rotationSpeed;
        if (keys['c'] || keys['C']) player.angle += rotationSpeed;
    } else {
        player.angle = Math.atan2(state.mouseY - player.y, state.mouseX - player.x);
    }
};
