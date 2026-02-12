export function updateHUD(state) {
    const { player, wave } = state;
    document.getElementById('wave-num').innerText = wave;
    document.getElementById('hp-val').innerText = Math.ceil(player.hp);
    document.getElementById('ammo-val').innerText = Math.floor(player.ammo);
    document.getElementById('money-val').innerText = player.money;
    document.getElementById('weapon-val').innerText = player.weapon.toUpperCase();
    document.getElementById('grenade-val').innerText = `${player.grenades}/${player.maxGrenades}`;
}

export function showNotification(title, message) {
    const area = document.getElementById('notification-area');
    document.getElementById('notif-title').innerText = title;
    document.getElementById('notif-message').innerText = message;
    area.classList.remove('hidden');
    setTimeout(() => area.classList.add('hidden'), 5000);
}

export function openShop(state) {
    document.getElementById('shop-menu').classList.remove('hidden');
    document.getElementById('wave-title').innerText = "WAVE " + (state.wave + 1) + " READY";
}

export function closeShop() {
    document.getElementById('shop-menu').classList.add('hidden');
}

export function doGameOver(state) {
    document.getElementById('game-over').classList.remove('hidden');
    document.getElementById('final-wave').innerText = state.wave;
    state.gameOver = true;
}

export function toggleSettings() {
    document.getElementById('settings-menu').classList.toggle('hidden');
}

export function openTurretMenu(state, turret) {
    state.selectedTurret = turret;
    const menu = document.getElementById('turret-menu');
    menu.classList.remove('hidden');
    document.getElementById('turret-stats').innerText = `Level: ${turret.level} | Ammo: ${turret.ammo}/${turret.maxAmmo}`;
}

export function closeTurretMenu(state) {
    state.selectedTurret = null;
    document.getElementById('turret-menu').classList.add('hidden');
}

export function updateControlDesc(mode) {
    const desc = document.getElementById('control-desc');
    const btn = document.getElementById('control-mode-btn');
    if (mode === 'mouse') {
        btn.innerText = "WASD + Mouse (Computer Only)";
        desc.innerText = "Move: WASD | Aim: Mouse | Shoot: Click (Computer Only)";
    } else {
        btn.innerText = "Keyboard Only (Z/C to Aim)";
        desc.innerText = "Move: WASD | Aim: Z / C | Shoot: Space (Computer Only)";
    }
}
