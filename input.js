export function setupInput(state) {
    window.addEventListener('keydown', e => {
        state.keys[e.key] = true;
        if (e.key === 'r' || e.key === 'R') state.buildRotation = (state.buildRotation + Math.PI / 2) % Math.PI;
        if (e.key === '1') state.player.weapon = 'pistol';
        if (e.key === '2' && state.player.unlockedWeapons.includes('shotgun')) state.player.weapon = 'shotgun';
        if (e.key === '2' && state.player.unlockedWeapons.includes('ar')) state.player.weapon = 'ar';
        if (e.key === '3' && state.player.unlockedWeapons.includes('sniper')) state.player.weapon = 'sniper';
        if (e.key === '4' && state.player.unlockedWeapons.includes('flamethrower')) state.player.weapon = 'flamethrower';
        if (e.key === 'g' || e.key === 'G') window.dispatchEvent(new CustomEvent('throw-grenade'));
    });

    window.addEventListener('keyup', e => { state.keys[e.key] = false; });
    window.addEventListener('mousemove', e => { state.mouseX = e.clientX; state.mouseY = e.clientY; });

    window.addEventListener('mousedown', e => {
        if (e.button === 0) {
            let clickedTurret = null;
            state.turrets.forEach(t => { if (Math.hypot(e.clientX - t.x, e.clientY - t.y) < 30) clickedTurret = t; });
            if (clickedTurret) window.dispatchEvent(new CustomEvent('open-turret-menu', { detail: { turret: clickedTurret } }));
            else if (state.buildMode) window.dispatchEvent(new CustomEvent('place-build'));
            else { state.isFiring = true; window.dispatchEvent(new CustomEvent('player-shoot')); }
        }
        if (e.button === 2) state.buildMode = null;
    });

    window.addEventListener('mouseup', e => { if (e.button === 0) state.isFiring = false; });
    window.addEventListener('contextmenu', e => e.preventDefault());

    if ('ontouchstart' in window) {
        state.isMobile = true;
        document.getElementById('mobile-controls').classList.remove('hidden');
        setupMobileControls(state);
    }
}

export function setupMobileControls(state) {
    document.getElementById('mobile-dash-btn').addEventListener('touchstart', () => state.keys[' '] = true);
    document.getElementById('mobile-dash-btn').addEventListener('touchend', () => state.keys[' '] = false);
    document.getElementById('mobile-shoot-btn').addEventListener('touchstart', () => state.isFiring = true);
    document.getElementById('mobile-shoot-btn').addEventListener('touchend', () => state.isFiring = false);
}
