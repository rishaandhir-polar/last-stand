import { PLAYER_SPEED, AMMO_CRATE_INTERVAL } from './constants.js';
import { openShop } from './ui.js';
import { spawnZombie } from './physics-spawn.js';
import { updateBullets, updateEnemyBullets } from './physics-collision.js';
import { updateZombies } from './physics-ai.js';

export function updatePhysics(state, timestamp, dt) {
    if (state.gameOver) return;
    const { player, zombies, items, canvas, keys, mobileInput } = state;
    const scale = dt / 16.67;

    if (state.isFiring && (player.weapon === 'ar' || player.weapon === 'flamethrower')) {
        if (timestamp > state.fireCooldown) window.dispatchEvent(new CustomEvent('player-shoot', { detail: { timestamp } }));
    }

    if (state.waveInProgress) {
        if (state.zombiesToSpawn > 0 && timestamp > state.nextSpawnTime) {
            spawnZombie(state); state.zombiesToSpawn--;
            state.nextSpawnTime = timestamp + Math.max(200, 1000 - (state.wave * 50));
        } else if (state.zombiesToSpawn === 0 && zombies.length === 0) {
            state.waveInProgress = false; openShop(state);
        }
    }

    handlePlayerMovement(state, timestamp, scale);
    updateBullets(state, scale);
    updateZombies(state, timestamp, scale);
    updateEnemyBullets(state, scale);
    updateSystemItems(state, timestamp);
}

export function handlePlayerMovement(state, timestamp, scale) {
    const { player, keys, mobileInput, canvas } = state;
    let dx = (keys['d'] || keys['ArrowRight'] ? 1 : 0) - (keys['a'] || keys['ArrowLeft'] ? 1 : 0);
    let dy = (keys['s'] || keys['ArrowDown'] ? 1 : 0) - (keys['w'] || keys['ArrowUp'] ? 1 : 0);
    if (mobileInput.active) { dx = mobileInput.x; dy = mobileInput.y; }

    if (keys[' '] && !player.isDashing && player.stamina >= 30 && (dx !== 0 || dy !== 0)) {
        player.isDashing = true; player.lastDashTime = timestamp; player.stamina -= 30;
    }
    if (!player.isDashing && player.stamina < player.maxStamina) player.stamina += 0.5 * scale;

    let speed = player.isDashing ? PLAYER_SPEED * 4 : PLAYER_SPEED;
    if (dx !== 0 || dy !== 0) {
        let len = Math.hypot(dx, dy);
        player.x += (dx / len) * speed * scale; player.y += (dy / len) * speed * scale;
    }
    player.x = Math.max(50, Math.min(canvas.width - 50, player.x));
    player.y = Math.max(50, Math.min(canvas.height - 50, player.y));
    player.angle = Math.atan2(state.mouseY - player.y, state.mouseX - player.x);
}

export function updateSystemItems(state, timestamp) {
    const { items, canvas } = state;
    if (timestamp - state.lastAmmoSpawn > AMMO_CRATE_INTERVAL) {
        items.push({ x: 50 + Math.random() * (canvas.width - 100), y: 50 + Math.random() * (canvas.height - 100), type: 'ammo' });
        state.lastAmmoSpawn = timestamp;
    }
}
