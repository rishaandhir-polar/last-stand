GAME.spawnBlood = function (state, x, y, count) {
    for (let i = 0; i < count; i++) state.particles.push({ x, y, vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5, life: 20 + Math.random() * 20, color: '#c0392b' });
};

GAME.checkBossDrop = function (state, z) {
    if (z.type === 'boss') {
        const waves = { 5: ['ar', 'Assault Rifle'], 10: ['sniper', 'Sniper Rifle'], 15: ['flamethrower', 'Flamethrower'] };
        if (waves[state.wave] && !state.player.unlockedWeapons.includes(waves[state.wave][0])) {
            state.player.unlockedWeapons.push(waves[state.wave][0]);
            GAME.showNotification("WEAPON UNLOCKED", `${waves[state.wave][1]}! Press ${state.wave / 5 + 1}.`);
        }
    }
};

GAME.explodeGeneric = function (state, x, y, maxDmg, maxRadius, hurtPlayer) {
    GAME.soundManager.explode(); state.muzzleFlashes.push({ x, y, life: 20, radius: maxRadius });
    for (let i = 0; i < 20; i++) state.particles.push({ x, y, vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10, life: 30 + Math.random() * 20, color: Math.random() > 0.5 ? '#f39c12' : '#c0392b' });
    for (let i = state.zombies.length - 1; i >= 0; i--) {
        let t = state.zombies[i]; let d = Math.hypot(t.x - x, t.y - y); let fd = d < 50 ? 30 : d < 100 ? 25 : d < 150 ? 10 : d < 200 ? 5 : 0;
        if (fd > 0) { t.hp -= fd; if (t.hp <= 0) { state.zombies.splice(i, 1); state.player.money += t.reward; GAME.checkBossDrop(state, t); GAME.updateHUD(state); } }
    }
    if (hurtPlayer) {
        let d = Math.hypot(state.player.x - x, state.player.y - y); let fd = d < 50 ? 30 : d < 100 ? 25 : d < 150 ? 10 : d < 200 ? 5 : 0;
        if (fd > 0) { state.player.hp -= fd; if (state.player.hp <= 0) GAME.doGameOver(state); GAME.updateHUD(state); }
    }
};
