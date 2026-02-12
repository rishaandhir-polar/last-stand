GAME.shoot = function (state, timestamp) {
    const { player, bullets, muzzleFlashes } = state;
    if (player.ammo <= 0) return;
    let angle = player.angle;
    const BULLET_SPEED = GAME.BULLET_SPEED;

    if (player.weapon === 'ar') {
        state.fireCooldown = timestamp + 100;
        muzzleFlashes.push({ x: player.x + Math.cos(angle) * 30, y: player.y + Math.sin(angle) * 30, life: 3 });
        bullets.push({ x: player.x, y: player.y, vx: Math.cos(angle + (Math.random() - 0.5) * 0.1) * BULLET_SPEED, vy: Math.sin(angle + (Math.random() - 0.5) * 0.1) * BULLET_SPEED, dmg: 20, color: '#f39c12' });
        player.ammo -= 0.5; player.ammo = Math.floor(player.ammo);
    } else if (player.weapon === 'sniper') {
        if (timestamp < state.fireCooldown) return;
        state.fireCooldown = timestamp + 1500;
        muzzleFlashes.push({ x: player.x + Math.cos(angle) * 40, y: player.y + Math.sin(angle) * 40, life: 10 });
        bullets.push({ x: player.x, y: player.y, vx: Math.cos(angle) * (BULLET_SPEED * 2), vy: Math.sin(angle) * (BULLET_SPEED * 2), dmg: 100, type: 'sniper', color: '#fff', life: 100 });
        player.ammo -= 5;
    } else if (player.weapon === 'flamethrower') {
        state.fireCooldown = timestamp + 50;
        for (let i = 0; i < 3; i++) state.particles.push({ x: player.x + Math.cos(angle) * 20, y: player.y + Math.sin(angle) * 20, vx: Math.cos(angle + (Math.random() - 0.5) * 0.5) * 5, vy: Math.sin(angle + (Math.random() - 0.5) * 0.5) * 5, life: 30 + Math.random() * 20, color: '#e67e22' });
        bullets.push({ x: player.x, y: player.y, vx: Math.cos(angle + (Math.random() - 0.5) * 0.3) * 10, vy: Math.sin(angle + (Math.random() - 0.5) * 0.3) * 10, dmg: 5, life: 20, color: 'rgba(0,0,0,0)' });
        player.ammo -= 0.5;
    } else if (player.weapon === 'shotgun') {
        if (timestamp < state.fireCooldown) return;
        state.fireCooldown = timestamp + 800;
        if (player.ammo < 2) return;
        muzzleFlashes.push({ x: player.x + Math.cos(angle) * 30, y: player.y + Math.sin(angle) * 30, life: 5 });
        for (let i = -2; i <= 2; i++) bullets.push({ x: player.x, y: player.y, vx: Math.cos(angle + i * 0.15) * BULLET_SPEED, vy: Math.sin(angle + i * 0.15) * BULLET_SPEED, dmg: 15, life: 30 });
        player.ammo -= 2;
    } else {
        if (timestamp < state.fireCooldown) return;
        state.fireCooldown = timestamp + 50;
        muzzleFlashes.push({ x: player.x + Math.cos(angle) * 30, y: player.y + Math.sin(angle) * 30, life: 5 });
        bullets.push({ x: player.x, y: player.y, vx: Math.cos(angle) * BULLET_SPEED, vy: Math.sin(angle) * BULLET_SPEED, dmg: 25 });
        player.ammo--;
    }
    GAME.soundManager.shoot(player.weapon);
    GAME.updateHUD(state);
};

GAME.buy = function (state, type) {
    const { player } = state;
    if (type === 'medkit' && player.money >= 50) { player.hp = Math.min(player.maxHp, player.hp + 50); player.money -= 50; }
    else if (type === 'ammo' && player.money >= 20) { player.ammo += 50; player.money -= 20; }
    else if (type === 'shotgun' && player.money >= 200) { player.weapon = 'shotgun'; player.unlockedWeapons.push('shotgun'); player.money -= 200; }
    else if (type === 'turret' && player.money >= 350) { state.buildMode = 'turret'; GAME.closeShop(); }
    else if (type === 'wall_wood' && player.money >= 50) { state.buildMode = 'wood'; GAME.closeShop(); }
    else if (type === 'wall_stone' && player.money >= 150) { state.buildMode = 'stone'; GAME.closeShop(); }
    else if (type === 'wall_metal' && player.money >= 300) { state.buildMode = 'metal'; GAME.closeShop(); }
    else if (type === 'landmine' && player.money >= 80) { state.buildMode = 'landmine'; GAME.closeShop(); }
    else if (type === 'spike' && player.money >= 40) { state.buildMode = 'spike'; GAME.closeShop(); }
    else if (type === 'grenade' && player.money >= 500) { player.grenades = Math.min(player.maxGrenades, player.grenades + 1); player.money -= 500; }
    GAME.soundManager.click();
    GAME.updateHUD(state);
};

GAME.nextWave = function (state) {
    GAME.closeShop();
    state.wave++;
    state.waveInProgress = true;
    GAME.soundManager.click();
    if (state.wave % 5 === 0) GAME.spawnBoss(state);
    else state.zombiesToSpawn = 5 + Math.floor(state.wave * 1.5);
    GAME.updateHUD(state);
};

GAME.placeBuild = function (state) {
    const { player, mouseX, mouseY, buildRotation } = state;
    let cost = 0;
    if (state.buildMode === 'turret') cost = 350;
    else if (state.buildMode === 'landmine') cost = 80;
    else if (state.buildMode === 'spike') cost = 40;
    else cost = (state.buildMode === 'wood' ? 50 : state.buildMode === 'stone' ? 150 : 300);

    if (player.money >= cost) {
        if (state.buildMode === 'turret') state.turrets.push({ x: mouseX, y: mouseY, ammo: 50, maxAmmo: 50, cooldown: 500, range: 300, damage: 15, level: 1, lastShot: 0, ammoRegen: 0 });
        else if (state.buildMode === 'landmine') state.mines.push({ x: mouseX, y: mouseY });
        else if (state.buildMode === 'spike') state.spikes.push({ x: mouseX, y: mouseY });
        else state.walls.push({ x: mouseX, y: mouseY, hp: cost, maxHp: cost, type: state.buildMode, rotation: buildRotation });
        player.money -= cost;
        state.buildMode = null;
        GAME.soundManager.click();
        GAME.updateHUD(state);
    }
};

GAME.throwGrenade = function (state) {
    if (state.player.grenades <= 0) return;
    let dx = state.mouseX - state.player.x, dy = state.mouseY - state.player.y;
    let dist = Math.hypot(dx, dy);
    if (dist > 300) { dx *= 300 / dist; dy *= 300 / dist; }
    state.thrownGrenades.push({ x: state.player.x, y: state.player.y, tx: state.player.x + dx, ty: state.player.y + dy, rotation: 0 });
    state.player.grenades--;
    GAME.updateHUD(state);
};

GAME.upgradeTurret = function (state, type) {
    const t = state.selectedTurret;
    if (!t) return;
    const { player } = state;
    if (type === 'capacity' && player.money >= 100) { t.maxAmmo += 50; t.ammo += 50; player.money -= 100; }
    else if (type === 'damage' && player.money >= 150) { t.damage += 5; t.level++; player.money -= 150; }
    else if (type === 'regen' && player.money >= 300) { t.ammoRegen += 1; player.money -= 300; }
    else if (type === 'shotgun' && player.money >= 500) { t.type = 'shotgun'; player.money -= 500; }
    GAME.soundManager.click();
    GAME.updateHUD(state);
    const stats = document.getElementById('turret-stats');
    if (stats) stats.innerText = `Level: ${t.level} | Ammo: ${t.ammo}/${t.maxAmmo}`;
};
