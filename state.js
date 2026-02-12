GAME.state = {
    canvas: null,
    ctx: null,
    player: {
        x: 400, y: 300, hp: 100, maxHp: 100, ammo: 100, money: 100,
        weapon: 'pistol', unlockedWeapons: ['pistol'], grenades: 3, maxGrenades: 5,
        stamina: 100, maxStamina: 100, isDashing: false, lastDashTime: 0,
        angle: 0, radius: 20, carrying: null
    },
    zombies: [], bullets: [], enemyBullets: [], items: [], turrets: [],
    walls: [], mines: [], spikes: [], thrownGrenades: [],
    muzzleFlashes: [], particles: [],
    keys: {},
    mouseY: 0, mouseX: 0,
    isFiring: false, fireCooldown: 0,
    wave: 0, waveInProgress: false, zombiesToSpawn: 0, nextSpawnTime: 0,
    lastAmmoSpawn: 0, lastTurretAmmoSpawn: 0,
    worldOpacity: 0,
    gameOver: false,
    isMobile: false, mobileInput: { x: 0, y: 0, active: false },
    controlMode: 'mouse',
    selectedTurret: null
};

GAME.updateState = function (updates) {
    if (!updates || typeof updates !== 'object') return;
    for (const key in updates) {
        if (Object.prototype.hasOwnProperty.call(updates, key)) {
            if (key === 'player' && typeof updates.player === 'object') {
                Object.assign(GAME.state.player, updates.player);
            } else {
                GAME.state[key] = updates[key];
            }
        }
    }
};
