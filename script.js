(function () {
    let lastTime = 0;

    function init() {
        const state = GAME.state;
        state.canvas = document.getElementById('game-canvas');
        state.ctx = state.canvas.getContext('2d');

        window.addEventListener('resize', resize);
        resize();

        GAME.setupInput(state);
        GAME.soundManager.loadAllSounds();

        GAME.openShop(state);
        GAME.updateHUD(state);

        // Auto-Update Logic
        GAME.currentVersion = "1.0.2";
        const checkForUpdates = async () => {
            try {
                const response = await fetch('app-version.json?t=' + Date.now());
                const data = await response.json();
                if (data.version !== GAME.currentVersion) {
                    GAME.showNotification("UPDATE FOUND", "Installing new version...");
                    setTimeout(() => location.reload(), 2000);
                }
            } catch (e) { /* silent fail */ }
        };
        setInterval(checkForUpdates, 30000); // Check every 30s

        window.addEventListener('player-shoot', (e) => GAME.shoot(state, e.detail?.timestamp || performance.now()));
        window.addEventListener('place-build', () => GAME.placeBuild(state));
        window.addEventListener('throw-grenade', () => GAME.throwGrenade(state));
        window.addEventListener('open-turret-menu', (e) => GAME.openTurretMenu(state, e.detail.turret));

        // Safari Mobile: Resume AudioContext on first interaction
        const resumeAudio = () => {
            GAME.soundManager.resume();
            GAME.soundManager.startMusic();
            window.removeEventListener('touchstart', resumeAudio);
            window.removeEventListener('mousedown', resumeAudio);
        };
        window.addEventListener('touchstart', resumeAudio);
        window.addEventListener('mousedown', resumeAudio);

        requestAnimationFrame(update);
    }

    function resize() {
        if (GAME.state.canvas) {
            GAME.state.canvas.width = window.innerWidth;
            GAME.state.canvas.height = window.innerHeight;
        }
    }

    function update(timestamp) {
        const state = GAME.state;
        if (state.gameOver) return;

        if (!lastTime) lastTime = timestamp;
        const dt = timestamp - lastTime;
        lastTime = timestamp;

        GAME.updatePhysics(state, timestamp, dt);

        GAME.draw(state);
        GAME.drawLighting(state);
        GAME.drawStaminaUI(state);

        requestAnimationFrame(update);
    }

    // Global functions for HTML onclicks
    window.buy = (type) => GAME.buy(GAME.state, type);
    window.nextWave = () => GAME.nextWave(GAME.state);
    window.forfeit = () => { GAME.forfeit(GAME.state); GAME.toggleSettings(); };
    window.openShop = () => { GAME.openShop(GAME.state); document.getElementById('settings-menu').classList.add('hidden'); };
    window.upgradeTurret = (type) => GAME.upgradeTurret(GAME.state, type);
    window.closeTurretMenu = () => GAME.closeTurretMenu(GAME.state);
    window.toggleSettings = () => GAME.toggleSettings();
    window.toggleMusic = () => {
        const muted = GAME.soundManager.toggleMusic();
        const btn = document.getElementById('music-btn');
        if (btn) btn.innerText = muted ? "Unmute Music" : "Mute Music";
    };
    window.toggleSFX = () => {
        const muted = GAME.soundManager.toggleSFX();
        const btn = document.getElementById('sfx-btn');
        if (btn) btn.innerText = muted ? "Unmute SFX" : "Mute SFX";
    };
    window.cycleControlMode = () => {
        GAME.state.controlMode = GAME.state.controlMode === 'mouse' ? 'keyboard' : 'mouse';
        GAME.updateControlDesc(GAME.state.controlMode);
    };

    window.addEventListener('load', init);
})();
