GAME.setupInput = function (state) {
    let cheatBuffer = "";
    window.addEventListener('keydown', e => {
        // Cheat Code Logic
        cheatBuffer += e.key.toLowerCase();
        if (cheatBuffer.endsWith("idkfa")) {
            state.player.money = 999999;
            state.player.ammo = 999;
            state.player.hp = state.player.maxHp;
            state.player.grenades = state.player.maxGrenades;
            state.player.unlockedWeapons = ['pistol', 'shotgun', 'ar', 'sniper', 'flamethrower'];
            GAME.showNotification("CHEAT ACTIVATED", "All Weapons & Max Resources!");
            GAME.soundManager.playFile('laser', 0.8);
            GAME.updateHUD(state);
            cheatBuffer = "";
        }
        if (cheatBuffer.length > 10) cheatBuffer = cheatBuffer.substring(1);

        state.keys[e.key] = true;
        if (e.key === 'r' || e.key === 'R') {
            state.buildRotation = ((state.buildRotation || 0) + Math.PI / 2);
        }
        if (e.key === '1') state.player.weapon = 'pistol';
        if (e.key === '2' && state.player.unlockedWeapons.includes('shotgun')) state.player.weapon = 'shotgun';
        if (e.key === '3' && state.player.unlockedWeapons.includes('ar')) state.player.weapon = 'ar';
        if (e.key === '4' && state.player.unlockedWeapons.includes('sniper')) state.player.weapon = 'sniper';
        if (e.key === '5' && state.player.unlockedWeapons.includes('flamethrower')) state.player.weapon = 'flamethrower';
        if (e.key === 'x' || e.key === 'X') {
            if (state.controlMode === 'keyboard' && !state.buildMode) {
                state.isFiring = true;
                window.dispatchEvent(new CustomEvent('player-shoot', { detail: { timestamp: e.timeStamp } }));
            }
        }
        if (e.key === 'g' || e.key === 'G') window.dispatchEvent(new CustomEvent('throw-grenade'));
        if (e.key === 'b' || e.key === 'B') {
            const shop = document.getElementById('shop-menu');
            if (shop.classList.contains('hidden')) GAME.openShop(state);
            else GAME.closeShop();
        }
        if (e.key === 'Escape') {
            state.buildMode = null;
            GAME.closeShop();
            GAME.closeTurretMenu(state);
            document.getElementById('settings-menu').classList.add('hidden');
        }
    });

    window.addEventListener('keyup', e => {
        state.keys[e.key] = false;
        if (e.key === 'x' || e.key === 'X') state.isFiring = false;
    });
    window.addEventListener('mousemove', e => { state.mouseX = e.clientX; state.mouseY = e.clientY; });

    window.addEventListener('mousedown', e => {
        const isMenuOpen = !document.getElementById('shop-menu').classList.contains('hidden') ||
            !document.getElementById('settings-menu').classList.contains('hidden') ||
            !document.getElementById('turret-menu').classList.contains('hidden');

        if (e.button === 0) {
            if (isMenuOpen) return;

            let clickedTurret = null;
            state.turrets.forEach(t => { if (Math.hypot(e.clientX - t.x, e.clientY - t.y) < 30) clickedTurret = t; });

            if (clickedTurret) window.dispatchEvent(new CustomEvent('open-turret-menu', { detail: { turret: clickedTurret } }));
            else if (state.buildMode) window.dispatchEvent(new CustomEvent('place-build'));
            else {
                state.isFiring = true;
                window.dispatchEvent(new CustomEvent('player-shoot'));
            }
        }
        if (e.button === 2) {
            if (state.buildMode) {
                state.buildMode = null;
                GAME.openShop(state);
            }
        }
    });

    window.addEventListener('mouseup', e => { if (e.button === 0) state.isFiring = false; });
    window.addEventListener('contextmenu', e => e.preventDefault());

    if ('ontouchstart' in window) {
        state.isMobile = true;
        const mobileControls = document.getElementById('mobile-controls');
        if (mobileControls) mobileControls.classList.remove('hidden');
        GAME.setupMobileControls(state);
    }
};

GAME.setupMobileControls = function (state) {
    const dashBtn = document.getElementById('mobile-dash-btn');
    if (dashBtn) {
        dashBtn.addEventListener('touchstart', () => state.keys[' '] = true);
        dashBtn.addEventListener('touchend', () => state.keys[' '] = false);
    }
    const shootBtn = document.getElementById('mobile-shoot-btn');
    if (shootBtn) {
        shootBtn.addEventListener('touchstart', () => state.isFiring = true);
        shootBtn.addEventListener('touchend', () => state.isFiring = false);
    }
};
