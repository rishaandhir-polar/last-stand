GAME.buy = function (state, type) {
    const { player } = state;
    let cost = 0;
    let name = "";

    if (type === 'medkit') { cost = 50; name = "Medkit"; }
    else if (type === 'ammo') { cost = 20; name = "Ammo"; }
    else if (type === 'shotgun') { cost = 200; name = "Shotgun"; }
    else if (type === 'ar') { cost = 400; name = "AR Rifle"; }
    else if (type === 'sniper') { cost = 600; name = "Sniper Rifle"; }
    else if (type === 'flamethrower') { cost = 800; name = "Flamethrower"; }
    else if (type === 'turret') { cost = 350; name = "Turret"; }
    else if (type === 'wall_wood') { cost = 50; name = "Wood Wall"; }
    else if (type === 'wall_stone') { cost = 150; name = "Stone Wall"; }
    else if (type === 'wall_metal') { cost = 300; name = "Metal Wall"; }
    else if (type === 'landmine') { cost = 80; name = "Landmine"; }
    else if (type === 'spike') { cost = 40; name = "Spike Trap"; }
    else if (type === 'grenade') { cost = 500; name = "Grenade"; }
    else if (type === 'drone') { cost = 250; name = "Drone"; }

    if (player.money < cost) {
        GAME.showNotification("INSUFFICIENT FUNDS", `You need $${cost} for ${name}!`);
        GAME.soundManager.playSynth(200, 0.2, 'sawtooth'); // Error sound
        return;
    }

    if (type === 'medkit') { player.hp = Math.min(player.maxHp, player.hp + 50); player.money -= cost; }
    else if (type === 'ammo') { player.ammo += 50; player.money -= cost; }
    else if (type === 'shotgun') { player.weapon = 'shotgun'; if (!player.unlockedWeapons.includes('shotgun')) player.unlockedWeapons.push('shotgun'); player.money -= cost; }
    else if (type === 'ar') { player.weapon = 'ar'; if (!player.unlockedWeapons.includes('ar')) player.unlockedWeapons.push('ar'); player.money -= cost; }
    else if (type === 'sniper') { player.weapon = 'sniper'; if (!player.unlockedWeapons.includes('sniper')) player.unlockedWeapons.push('sniper'); player.money -= cost; }
    else if (type === 'flamethrower') { player.weapon = 'flamethrower'; if (!player.unlockedWeapons.includes('flamethrower')) player.unlockedWeapons.push('flamethrower'); player.money -= cost; }
    else if (type === 'turret') { state.buildMode = 'turret'; GAME.closeShop(); }
    else if (type === 'wall_wood') { state.buildMode = 'wood'; GAME.closeShop(); }
    else if (type === 'wall_stone') { state.buildMode = 'stone'; GAME.closeShop(); }
    else if (type === 'wall_metal') { state.buildMode = 'metal'; GAME.closeShop(); }
    else if (type === 'landmine') { state.buildMode = 'landmine'; GAME.closeShop(); }
    else if (type === 'spike') { state.buildMode = 'spike'; GAME.closeShop(); }
    else if (type === 'grenade') { player.grenades = Math.min(player.maxGrenades, player.grenades + 1); player.money -= cost; }
    else if (type === 'drone') { state.buildMode = 'drone'; GAME.closeShop(); }

    GAME.soundManager.click();
    GAME.updateHUD(state);
};

GAME.nextWave = function (state) {
    if (state.waveInProgress) return;
    GAME.closeShop();
    state.wave++;
    state.waveInProgress = true;
    GAME.soundManager.click();

    // Break the 5-wave pattern with dynamic boss spawning
    const bossChance = Math.min(0.5, (state.wave - 4) * 0.1);
    const isBossWave = state.wave > 4 && Math.random() < bossChance;

    if (isBossWave) {
        GAME.spawnBoss(state);
        GAME.showNotification("DANGER", "APEX THREAT DETECTED!");
        GAME.screenShake = 20;
    } else {
        // Varied zombie counts (80% to 120% of base)
        const base = 5 + Math.floor(state.wave * 1.5);
        state.zombiesToSpawn = Math.floor(base * (0.8 + Math.random() * 0.4));
        
        const type = state.zombiesToSpawn > base * 1.1 ? "LARGE SWARM" : "INCOMING";
        GAME.showNotification(`WAVE ${state.wave}`, `${type} DETECTED!`);
    }
    
    GAME.updateHUD(state);
};

GAME.forfeit = function (state) {
    state.zombies = [];
    state.bullets = [];
    state.enemyBullets = [];
    state.particles = [];
    state.zombiesToSpawn = 0;
    state.waveInProgress = false;
    state.player.hp = state.player.maxHp;
    if (state.lastWaveMoney !== undefined) state.player.money = state.lastWaveMoney;
    GAME.closeShop();
    GAME.openShop(state);
    GAME.updateHUD(state);
    GAME.showNotification("FORFEIT", "Wave cancelled. Money reset.");
};

GAME.placeBuild = function (state) {
    const { player, mouseX, mouseY, buildRotation } = state;
    let cost = 0;
    if (state.buildMode === 'turret') cost = 350;
    else if (state.buildMode === 'landmine') cost = 80;
    else if (state.buildMode === 'spike') cost = 40;
    else if (state.buildMode === 'drone') cost = 250;
    else cost = (state.buildMode === 'wood' ? 50 : state.buildMode === 'stone' ? 150 : 300);

    if (player.money >= cost) {
        if (state.buildMode === 'turret') state.turrets.push({ x: mouseX, y: mouseY, ammo: 50, maxAmmo: 50, cooldown: 500, range: 300, damage: 15, level: 1, lastShot: 0, ammoRegen: 0 });
        else if (state.buildMode === 'landmine') state.mines.push({ x: mouseX, y: mouseY });
        else if (state.buildMode === 'spike') state.spikes.push({ x: mouseX, y: mouseY });
        else if (state.buildMode === 'drone') state.drones.push({ x: mouseX, y: mouseY, tx: mouseX, ty: mouseY, damage: 10, mode: 'follow', lastShot: 0, range: 250 });
        else state.walls.push({ x: mouseX, y: mouseY, hp: cost, maxHp: cost, type: state.buildMode, rotation: buildRotation });

        player.money -= cost;
        GAME.soundManager.click();
        GAME.updateHUD(state);

        if (player.money < cost) {
            state.buildMode = null;
        }
    }
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

GAME.upgradeDrone = function (state, type) {
    const d = state.selectedDrone;
    if (!d) return;
    const { player } = state;

    if (type === 'mode_follow') d.mode = 'follow';
    else if (type === 'mode_stay') { d.mode = 'stay'; d.tx = d.x; d.ty = d.y; }
    else if (type === 'mode_manual') d.mode = 'manual';
    else if (type === 'upgrade_damage' && player.money >= 150) { d.damage += 5; player.money -= 150; }

    GAME.soundManager.click();
    GAME.updateHUD(state);
    const stats = document.getElementById('drone-stats');
    if (stats) stats.innerText = `Mode: ${d.mode.toUpperCase()} | Dmg: ${d.damage}`;
};
