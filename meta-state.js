// meta-state.js — Persistent progression via localStorage
const META_KEY = 'laststand_meta_v1';

GAME.loadMeta = function () {
    try {
        const raw = localStorage.getItem(META_KEY);
        if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { xp: 0, healthLevel: 0, speedLevel: 0, critLevel: 0, adminChanceLevel: 0 };
};

GAME.saveMeta = function (meta) {
    try { localStorage.setItem(META_KEY, JSON.stringify(meta)); } catch (e) {}
};

GAME.getMetaCosts = function () {
    return {
        healthLevel:      [100, 200, 350, 500, 750],
        speedLevel:       [150, 300, 500, 750, 1000],
        critLevel:        [200, 400, 700, 1000, 1500],
        adminChanceLevel: [300, 600, 1000, 1500, 2000]
    };
};

// Apply meta upgrades to starting player state
GAME.applyMeta = function (player, meta) {
    player.maxHp          = 100 + meta.healthLevel * 20;
    player.hp             = player.maxHp;
    player.metaSpeed      = 1 + meta.speedLevel * 0.05;
    player.critChance     = 0.10 + meta.critLevel * 0.05;
    player.adminDropChance = meta.adminChanceLevel * 0.01;
};

// Called at wave start — maybe grant an admin weapon for this wave
GAME.rollAdminWeaponDrop = function (state) {
    const meta = GAME.loadMeta();
    if (meta.adminChanceLevel === 0) return;
    const chance = meta.adminChanceLevel * 0.01;
    if (Math.random() < chance) {
        const adminWeapons = ['railgun', 'nuke', 'gatling', 'swarm', 'cursorbomb'];
        const chosen = adminWeapons[Math.floor(Math.random() * adminWeapons.length)];
        if (!state.player.unlockedWeapons.includes(chosen)) {
            state.player.unlockedWeapons.push(chosen);
        }
        state.player.weapon = chosen;
        state.adminWeaponThisRound = chosen;
        GAME.showNotification('ADMIN DROP!', chosen.toUpperCase() + ' for this wave!');
        GAME.updateHUD(state);
    }
};

// Award XP after a run and save
GAME.awardRunXP = function (wave) {
    const meta = GAME.loadMeta();
    const earned = Math.floor(wave * 25 + (wave * wave * 2));
    meta.xp += earned;
    GAME.saveMeta(meta);
    return earned;
};

// Buy an upgrade in the XP shop
GAME.buyMetaUpgrade = function (key) {
    const meta = GAME.loadMeta();
    const costs = GAME.getMetaCosts();
    const levels = costs[key];
    if (!levels) return;
    const currentLevel = meta[key] || 0;
    if (currentLevel >= levels.length) { GAME.showNotification('MAX LEVEL', 'Already maxed out!'); return; }
    const cost = levels[currentLevel];
    if (meta.xp < cost) { GAME.showNotification('NOT ENOUGH XP', 'Need ' + cost + ' XP'); return; }
    meta.xp -= cost;
    meta[key] = currentLevel + 1;
    GAME.saveMeta(meta);
    GAME.renderXPShop();
};

// Render the XP shop UI dynamically
GAME.renderXPShop = function () {
    const meta = GAME.loadMeta();
    const costs = GAME.getMetaCosts();
    const xpDisplay = document.getElementById('xp-display');
    if (xpDisplay) xpDisplay.innerText = 'XP: ' + meta.xp;

    const upgrades = [
        { key: 'healthLevel',      icon: 'HP',    label: 'Max Health',  desc: '+20 HP per level' },
        { key: 'speedLevel',       icon: 'SPD',   label: 'Move Speed',  desc: '+5% speed per level' },
        { key: 'critLevel',        icon: 'CRIT',  label: 'Crit Chance', desc: 'Base 10% +5%/level' },
        { key: 'adminChanceLevel', icon: 'ADMIN', label: 'Admin Drop',  desc: '+1%/wave per level' },
    ];

    const container = document.getElementById('xp-upgrades');
    if (!container) return;
    container.innerHTML = '';
    upgrades.forEach(function(u) {
        const level = meta[u.key] || 0;
        const maxLevel = costs[u.key].length;
        const nextCost = level < maxLevel ? costs[u.key][level] : null;
        const div = document.createElement('div');
        div.className = 'xp-upgrade-item';
        div.innerHTML =
            '<div class="xp-icon">' + u.icon + '</div>' +
            '<div class="xp-details">' +
                '<span class="xp-name">' + u.label + '</span>' +
                '<span class="xp-desc">' + u.desc + '</span>' +
                '<span class="xp-level">Lv ' + level + '/' + maxLevel + '</span>' +
            '</div>' +
            '<button class="xp-buy-btn" onclick="GAME.buyMetaUpgrade(\'' + u.key + '\')"' +
                (nextCost === null ? ' disabled' : '') + '>' +
                (nextCost !== null ? nextCost + ' XP' : 'MAX') +
            '</button>';
        container.appendChild(div);
    });
};

GAME.openXPShop = function () {
    GAME.renderXPShop();
    const el = document.getElementById('xp-shop');
    if (el) el.classList.remove('hidden');
};

GAME.closeXPShop = function () {
    const el = document.getElementById('xp-shop');
    if (el) el.classList.add('hidden');
};
