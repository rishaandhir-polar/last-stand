import { state } from './state.js';
import { updatePhysics } from './physics.js';
import { draw, drawLighting, drawStaminaUI } from './renderer.js';
import { setupInput } from './input.js';
import { openShop, updateHUD, openTurretMenu, closeTurretMenu, toggleSettings, updateControlDesc } from './ui.js';
import { shoot, buy, nextWave, placeBuild, throwGrenade, upgradeTurret } from './actions.js';
import { soundManager } from './sound-manager.js';

let lastTime = 0;

function init() {
    state.canvas = document.getElementById('game-canvas');
    state.ctx = state.canvas.getContext('2d');

    window.addEventListener('resize', resize);
    resize();

    setupInput(state);

    openShop(state);
    updateHUD(state);

    window.addEventListener('player-shoot', (e) => shoot(state, e.detail?.timestamp || performance.now()));
    window.addEventListener('place-build', () => placeBuild(state));
    window.addEventListener('throw-grenade', () => throwGrenade(state));
    window.addEventListener('open-turret-menu', (e) => openTurretMenu(state, e.detail.turret));

    requestAnimationFrame(update);
}

function resize() {
    state.canvas.width = window.innerWidth;
    state.canvas.height = window.innerHeight;
}

function update(timestamp) {
    if (state.gameOver) return;

    if (!lastTime) lastTime = timestamp;
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    updatePhysics(state, timestamp, dt);

    draw(state);
    drawLighting(state);
    drawStaminaUI(state);

    requestAnimationFrame(update);
}

// Global functions for HTML onclicks
window.buy = (type) => buy(state, type);
window.nextWave = () => nextWave(state);
window.openShop = () => openShop(state);
window.upgradeTurret = (type) => upgradeTurret(state, type);
window.closeTurretMenu = () => closeTurretMenu(state);
window.toggleSettings = () => toggleSettings();
window.toggleMusic = () => {
    const muted = soundManager.toggleMusic();
    document.getElementById('music-btn').innerText = muted ? "Unmute Music" : "Mute Music";
};
window.toggleSFX = () => {
    const muted = soundManager.toggleSFX();
    document.getElementById('sfx-btn').innerText = muted ? "Unmute SFX" : "Mute SFX";
};
window.cycleControlMode = () => {
    state.controlMode = state.controlMode === 'mouse' ? 'keyboard' : 'mouse';
    updateControlDesc(state.controlMode);
};

window.addEventListener('load', init);
