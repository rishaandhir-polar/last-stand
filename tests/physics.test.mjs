import { describe, it, expect, beforeEach } from 'vitest';

describe('Physics Engine', () => {
    beforeEach(() => {
        global.GAME = {
            TILE_SIZE: 64,
            PLAYER_SPEED: 4,
            AMMO_CRATE_INTERVAL: 30000
        };
        // Load dependencies in order
        global.loadScript('ui.js');
        global.loadScript('physics-spawn.js');
        global.loadScript('physics-core.js');
        global.loadScript('physics-collision.js');
        global.loadScript('physics-ai.js');
        global.loadScript('physics.js');
    });

    it('should move the player when WASD keys are pressed', () => {
        const mockState = {
            player: { x: 100, y: 100, hp: 100, stamina: 100, maxStamina: 100, angle: 0, isDashing: false },
            keys: { 'd': true },
            mobileInput: { active: false },
            canvas: { width: 800, height: 600 }
        };

        GAME.handlePlayerMovement(mockState, 1000, 1.0);
        expect(mockState.player.x).toBeGreaterThan(100);
    });

    it('should consume stamina when dashing', () => {
        const mockState = {
            player: { x: 100, y: 100, hp: 100, stamina: 100, maxStamina: 100, angle: 0, isDashing: false },
            keys: { ' ': true, 'd': true },
            mobileInput: { active: false },
            canvas: { width: 800, height: 600 }
        };

        GAME.handlePlayerMovement(mockState, 1000, 1.0);
        expect(mockState.player.isDashing).toBe(true);
        expect(mockState.player.stamina).toBeLessThan(100);
    });
});
