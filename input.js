GAME.setupInput = function (state) {
    window.addEventListener('keydown', e => {
        if (e.repeat) return;
        state.keys[e.key] = true;
        if (e.key === 'r' || e.key === 'R') {
            state.buildRotation = ((state.buildRotation || 0) + Math.PI / 2);
        }
        if (e.key === '1') { state.player.weapon = 'pistol'; GAME.updateHUD(state); }
        if (e.key === '2' && state.player.unlockedWeapons.includes('shotgun')) { state.player.weapon = 'shotgun'; GAME.updateHUD(state); }
        if (e.key === '3' && state.player.unlockedWeapons.includes('ar')) { state.player.weapon = 'ar'; GAME.updateHUD(state); }
        if (e.key === '4' && state.player.unlockedWeapons.includes('sniper')) { state.player.weapon = 'sniper'; GAME.updateHUD(state); }
        if (e.key === '5' && state.player.unlockedWeapons.includes('flamethrower')) { state.player.weapon = 'flamethrower'; GAME.updateHUD(state); }
        if (e.key === 'x' || e.key === 'X') {
            if (state.controlMode === 'keyboard' && !state.buildMode) {
                state.isFiring = true;
                window.dispatchEvent(new CustomEvent('player-shoot', { detail: { timestamp: e.timeStamp } }));
            }
        }
        if (e.key === 'g' || e.key === 'G') window.dispatchEvent(new CustomEvent('throw-grenade'));
        if (e.key === 'b' || e.key === 'B') {
            if (state.waveInProgress) {
                GAME.forfeit(state);
            } else {
                const shop = document.getElementById('shop-menu');
                if (shop.classList.contains('hidden')) GAME.openShop(state);
                else GAME.closeShop();
            }
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
        dashBtn.addEventListener('touchstart', (e) => { e.preventDefault(); state.keys[' '] = true; });
        dashBtn.addEventListener('touchend', (e) => { e.preventDefault(); state.keys[' '] = false; });
    }
    const shootBtn = document.getElementById('mobile-shoot-btn');
    if (shootBtn) {
        shootBtn.addEventListener('touchstart', (e) => { e.preventDefault(); state.isFiring = true; });
        shootBtn.addEventListener('touchend', (e) => { e.preventDefault(); state.isFiring = false; });
    }
    const shopBtn = document.getElementById('mobile-shop-btn');
    if (shopBtn) {
        shopBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (state.waveInProgress) GAME.forfeit(state);
            else {
                const shop = document.getElementById('shop-menu');
                if (shop.classList.contains('hidden')) GAME.openShop(state);
                else GAME.closeShop();
            }
        });
    }
    const grenadeBtn = document.getElementById('mobile-grenade-btn');
    if (grenadeBtn) {
        grenadeBtn.addEventListener('touchstart', (e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('throw-grenade')); });
    }

    // Joystick Logic
    const joyArea = document.getElementById('joystick-area');
    const joyStick = document.getElementById('joystick-stick');
    const joyBase = document.getElementById('joystick-base');
    if (joyArea && joyStick && joyBase) {
        const handleJoy = (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = joyBase.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            let dx = touch.clientX - centerX;
            let dy = touch.clientY - centerY;
            const dist = Math.hypot(dx, dy);
            const maxDist = rect.width / 2;
            if (dist > maxDist) { dx *= maxDist / dist; dy *= maxDist / dist; }
            joyStick.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
            state.mobileInput.active = true;
            state.mobileInput.x = dx / maxDist;
            state.mobileInput.y = dy / maxDist;
        };
        joyArea.addEventListener('touchstart', handleJoy);
        joyArea.addEventListener('touchmove', handleJoy);
        joyArea.addEventListener('touchend', (e) => {
            e.preventDefault();
            joyStick.style.transform = `translate(-50%, -50%)`;
            state.mobileInput.active = false;
        });
    }
};
