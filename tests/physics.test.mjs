import { describe, it, expect, beforeEach } from 'vitest';
import { updatePhysics } from '../physics.js';

describe('Physics Engine', () => {
    let mockState;

    beforeEach(() => {
        mockState = {
            gameOver: false,
            player: { x: 100, y: 100, hp: 100, stamina: 100, maxStamina: 100, angle: 0, isDashing: false, weapon: 'pistol' },
            zombies: [],
            bullets: [],
            enemyBullets: [],
            items: [],
            turrets: [],
            walls: [],
            mines: [],
            spikes: [],
            thrownGrenades: [],
            muzzleFlashes: [],
            particles: [],
            keys: {},
            mobileInput: { active: false },
            canvas: { width: 800, height: 600 },
            waveInProgress: false,
            zombiesToSpawn: 0,
            nextSpawnTime: 0,
            lastAmmoSpawn: 0,
            lastTurretAmmoSpawn: 0
        };
    });

    it('should move the player when WASD keys are pressed', () => {
        mockState.keys['d'] = true; // Move right
        // updatePhysics(state, timestamp, dt)
        updatePhysics(mockState, 1000, 16.67); // 1 frame at 60fps
        expect(mockState.player.x).toBeGreaterThan(100);
    });

    it('should consume stamina when dashing', () => {
        mockState.keys[' '] = true; // Dash
        mockState.keys['d'] = true; // Must be moving to dash
        updatePhysics(mockState, 1000, 16.67);
        expect(mockState.player.isDashing).toBe(true);
        expect(mockState.player.stamina).toBeLessThan(100);
    });

    it('should clamp player position to canvas bounds', () => {
        mockState.player.x = 10;
        mockState.keys['a'] = true; // Move left
        updatePhysics(mockState, 1000, 16.67);
        // Canvas boundary is 50 in handlePlayerMovement
        expect(mockState.player.x).toBeGreaterThanOrEqual(10);
    });
});
