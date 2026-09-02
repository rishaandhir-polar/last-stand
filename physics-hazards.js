// physics-hazards.js — Environmental interactive objects and hazards

GAME.generateHazards = function (state) {
    const biome = GAME.getBiome(state.wave);
    const w = state.canvas ? state.canvas.width : 800;
    const h = state.canvas ? state.canvas.height : 600;
    state.hazards = [];

    const getSafePos = () => {
        for (let tries = 0; tries < 20; tries++) {
            const x = 80 + Math.random() * (w - 160);
            const y = 80 + Math.random() * (h - 160);
            if (Math.hypot(x - state.player.x, y - state.player.y) > 150) {
                return { x, y };
            }
        }
        return { x: w * 0.25, y: h * 0.25 };
    };

    if (biome === 'lab') {
        const countBarrels = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < countBarrels; i++) {
            const pos = getSafePos();
            state.hazards.push({ type: 'barrel_explosive', x: pos.x, y: pos.y, radius: 18, hp: 25, maxHp: 25, solid: true });
        }
        const posCryo = getSafePos();
        state.hazards.push({ type: 'cryo_tank', x: posCryo.x, y: posCryo.y, radius: 18, hp: 20, maxHp: 20, solid: true });
    } else if (biome === 'desert') {
        const countBoulders = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < countBoulders; i++) {
            const pos = getSafePos();
            state.hazards.push({ type: 'boulder', x: pos.x, y: pos.y, radius: 26, hp: 9999, maxHp: 9999, solid: true });
        }
        const posBarrel = getSafePos();
        state.hazards.push({ type: 'barrel_explosive', x: posBarrel.x, y: posBarrel.y, radius: 18, hp: 25, maxHp: 25, solid: true });
        const posSand = getSafePos();
        state.hazards.push({ type: 'quicksand', x: posSand.x, y: posSand.y, radius: 45, hp: 9999, maxHp: 9999, solid: false });
    } else if (biome === 'alien') {
        const countPods = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < countPods; i++) {
            const pos = getSafePos();
            state.hazards.push({ type: 'spore_pod', x: pos.x, y: pos.y, radius: 20, hp: 30, maxHp: 30, solid: true });
        }
        const countAcid = 2;
        for (let i = 0; i < countAcid; i++) {
            const pos = getSafePos();
            state.hazards.push({ type: 'acid_pool', x: pos.x, y: pos.y, radius: 36, hp: 9999, maxHp: 9999, solid: false });
        }
    }
};

GAME.updateHazards = function (state, scale) {
    if (!state.hazards) state.hazards = [];
    const { hazards, bullets, player, zombies } = state;

    for (let i = hazards.length - 1; i >= 0; i--) {
        const hz = hazards[i];

        // 1. Bullet collision with destructible hazards
        if (hz.hp < 9999) {
            for (let bIdx = bullets.length - 1; bIdx >= 0; bIdx--) {
                const b = bullets[bIdx];
                if (Math.hypot(b.x - hz.x, b.y - hz.y) < hz.radius + 5) {
                    hz.hp -= b.dmg;
                    bullets.splice(bIdx, 1);
                    if (hz.hp <= 0) {
                        GAME.detonateHazard(state, hz, i);
                        break;
                    }
                }
            }
        }

        // 2. Hazard ground triggers (Acid / Quicksand)
        if (hz.type === 'acid_pool') {
            if (Math.hypot(player.x - hz.x, player.y - hz.y) < hz.radius) {
                player.hp -= 0.25 * scale;
                if (player.hp <= 0) GAME.doGameOver(state);
                GAME.updateHUD(state);
            }
            zombies.forEach(z => {
                if (z && Math.hypot(z.x - hz.x, z.y - hz.y) < hz.radius) {
                    z.hp -= 0.5 * scale;
                }
            });
        }
    }
};

GAME.detonateHazard = function (state, hz, idx) {
    state.hazards.splice(idx, 1);

    if (hz.type === 'barrel_explosive') {
        GAME.explodeGeneric(state, hz.x, hz.y, 140, 160, true);
    } else if (hz.type === 'cryo_tank') {
        GAME.soundManager.explode();
        state.screenShake = Math.max(state.screenShake, 8);
        for (let i = 0; i < 25; i++) {
            state.particles.push({
                x: hz.x, y: hz.y,
                vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8,
                life: 35, color: '#3498db'
            });
        }
        state.zombies.forEach(z => {
            if (z && Math.hypot(z.x - hz.x, z.y - hz.y) < 180) {
                z.hp -= 50;
                z.speed *= 0.4;
                setTimeout(() => { if (z) z.speed /= 0.4; }, 4000);
            }
        });
        GAME.updateHUD(state);
    } else if (hz.type === 'spore_pod') {
        GAME.soundManager.explode();
        for (let i = 0; i < 30; i++) {
            state.particles.push({
                x: hz.x, y: hz.y,
                vx: (Math.random() - 0.5) * 9, vy: (Math.random() - 0.5) * 9,
                life: 40, color: '#8e44ad'
            });
        }
        state.zombies.forEach(z => {
            if (z && Math.hypot(z.x - hz.x, z.y - hz.y) < 160) {
                z.hp -= 60;
            }
        });
        GAME.updateHUD(state);
    }
};
