GAME.spawnBlood = function (state, x, y, count) {
    for (let i = 0; i < count; i++) state.particles.push({ x, y, vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5, life: 20 + Math.random() * 20, color: '#c0392b' });
};

GAME.checkBossDrop = function (state, z) {
    if (z.type === 'boss') {
        const waves = { 5: ['ar', 'Assault Rifle'], 10: ['sniper', 'Sniper Rifle'], 15: ['flamethrower', 'Flamethrower'] };
        if (waves[state.wave] && !state.player.unlockedWeapons.includes(waves[state.wave][0])) {
            state.player.unlockedWeapons.push(waves[state.wave][0]);
            const keyMap = { 'ar': 3, 'sniper': 4, 'flamethrower': 5 };
            GAME.showNotification("WEAPON UNLOCKED", `${waves[state.wave][1]}! Press ${keyMap[waves[state.wave][0]]}.`);
        }
    }
};

GAME.explodeGeneric = function (state, x, y, maxDmg, maxRadius, hurtPlayer) {
    GAME.soundManager.explode(); state.muzzleFlashes.push({ x, y, life: 20, radius: maxRadius });
    for (let i = 0; i < 20; i++) state.particles.push({ x, y, vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10, life: 30 + Math.random() * 20, color: Math.random() > 0.5 ? '#f39c12' : '#c0392b' });

    state.zombies.forEach((t, i) => {
        let d = Math.hypot(t.x - x, t.y - y);
        if (d < maxRadius) {
            let dmg = ((maxRadius - d) / maxRadius) * maxDmg;
            t.hp -= dmg;
            if (t.hp <= 0) {
                state.player.money += t.reward;
                GAME.checkBossDrop(state, t);
                state.zombies[i] = null; // Mark for removal
            }
        }
    });
    state.zombies = state.zombies.filter(z => z !== null);
    GAME.updateHUD(state);

    if (hurtPlayer) {
        let d = Math.hypot(state.player.x - x, state.player.y - y);
        if (d < maxRadius) {
            let dmg = ((maxRadius - d) / maxRadius) * (maxDmg / 2); // Half damage to player
            state.player.hp -= dmg;
            if (state.player.hp <= 0) GAME.doGameOver(state);
            GAME.updateHUD(state);
        }
    }
};

GAME.updateFX = function (state, scale) {
    // Update Muzzle Flashes
    for (let i = state.muzzleFlashes.length - 1; i >= 0; i--) {
        state.muzzleFlashes[i].life -= scale;
        if (state.muzzleFlashes[i].life <= 0) state.muzzleFlashes.splice(i, 1);
    }

    // Update Particles (Blood, Fire, Smoke)
    for (let i = state.particles.length - 1; i >= 0; i--) {
        let p = state.particles[i];
        p.x += p.vx * scale;
        p.y += p.vy * scale;
        p.life -= scale;
        if (p.life <= 0) state.particles.splice(i, 1);
    }
};
