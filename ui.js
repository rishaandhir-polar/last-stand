GAME.updateHUD = function (state) {
    const { player, wave } = state;
    const waveNum = document.getElementById('wave-num');
    if (waveNum) waveNum.innerText = wave;
    const hpVal = document.getElementById('hp-val');
    if (hpVal) hpVal.innerText = Math.ceil(player.hp);
    const ammoVal = document.getElementById('ammo-val');
    if (ammoVal) ammoVal.innerText = Math.floor(player.ammo);
    const moneyVal = document.getElementById('money-val');
    if (moneyVal) moneyVal.innerText = player.money;
    const weaponVal = document.getElementById('weapon-val');
    if (weaponVal) weaponVal.innerText = player.weapon.toUpperCase();
    const grenadeVal = document.getElementById('grenade-val');
    if (grenadeVal) grenadeVal.innerText = `${player.grenades}/${player.maxGrenades}`;
};

GAME.showNotification = function (title, message) {
    const area = document.getElementById('notification-area');
    if (!area) return;
    const titleEl = document.getElementById('notif-title');
    const msgEl = document.getElementById('notif-message');
    if (titleEl) titleEl.innerText = title;
    if (msgEl) msgEl.innerText = message;
    area.classList.remove('hidden');
    setTimeout(() => area.classList.add('hidden'), 2000);
};

GAME.openShop = function (state) {
    const shop = document.getElementById('shop-menu');
    if (shop) shop.classList.remove('hidden');
    const waveTitle = document.getElementById('wave-title');
    if (waveTitle) waveTitle.innerText = "WAVE " + (state.wave + 1) + " READY";
};

GAME.closeShop = function () {
    const shop = document.getElementById('shop-menu');
    if (shop) shop.classList.add('hidden');
};

GAME.doGameOver = function (state) {
    const gameOverEl = document.getElementById('game-over');
    if (gameOverEl) gameOverEl.classList.remove('hidden');
    const finalWave = document.getElementById('final-wave');
    if (finalWave) finalWave.innerText = state.wave;
    state.gameOver = true;
    if (state.lastWaveMoney !== undefined) state.player.money = state.lastWaveMoney;
};

GAME.toggleSettings = function () {
    const settings = document.getElementById('settings-menu');
    if (settings) settings.classList.toggle('hidden');
};

GAME.openTurretMenu = function (state, turret) {
    state.selectedTurret = turret;
    const menu = document.getElementById('turret-menu');
    if (menu) menu.classList.remove('hidden');
    const stats = document.getElementById('turret-stats');
    if (stats) stats.innerText = `Level: ${turret.level} | Ammo: ${turret.ammo}/${turret.maxAmmo}`;
};

GAME.closeTurretMenu = function (state) {
    state.selectedTurret = null;
    const menu = document.getElementById('turret-menu');
    if (menu) menu.classList.add('hidden');
};

GAME.updateControlDesc = function (mode) {
    const desc = document.getElementById('control-desc');
    const btn = document.getElementById('control-mode-btn');
    if (mode === 'mouse') {
        if (btn) btn.innerText = "WASD + Mouse (Computer Only)";
        if (desc) desc.innerText = "Move: WASD | Aim: Mouse | Shoot: Click (Computer Only)";
    } else {
        if (btn) btn.innerText = "Keyboard Only (Z/C to Aim)";
        if (desc) desc.innerText = "Move: WASD | Aim: Z / C | Shoot: X | Dash: Shift (Computer Only)";
    }
};
