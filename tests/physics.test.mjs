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
        global.loadScript('physics-hazards.js');
        global.loadScript('physics-collision.js');
        global.loadScript('physics-shooter-ai.js');
        global.loadScript('physics-ai.js');
        global.loadScript('physics-entities.js');
        global.loadScript('physics.js');
    });

    it('should move the player when WASD keys are pressed', () => {
        const mockState = {
            player: { x: 100, y: 100, hp: 100, stamina: 100, maxStamina: 100, angle: 0, isDashing: false },
            keys: { 'd': true },
            mobileInput: { active: false },
            canvas: { width: 800, height: 600 },
            walls: [],
            turrets: []
        };

        GAME.handlePlayerMovement(mockState, 1000, 1.0);
        expect(mockState.player.x).toBeGreaterThan(100);
    });

    it('should consume stamina when dashing', () => {
        const mockState = {
            player: { x: 100, y: 100, hp: 100, stamina: 100, maxStamina: 100, angle: 0, isDashing: false },
            keys: { ' ': true, 'd': true },
            mobileInput: { active: false },
            canvas: { width: 800, height: 600 },
            walls: [],
            turrets: []
        };

        GAME.handlePlayerMovement(mockState, 1000, 1.0);
        expect(mockState.player.isDashing).toBe(true);
        expect(mockState.player.stamina).toBeLessThan(100);
    });

    it('should shield nearby normal zombies if close to a Shield Charger', () => {
        const charger = { x: 100, y: 100, hp: 10, radius: 20, type: 'shield_charger', speed: 1 };
        const normalZombie = { x: 120, y: 100, hp: 10, radius: 20, type: 'normal', speed: 1 };
        const mockState = {
            zombies: [charger, normalZombie],
            player: { x: 500, y: 500, hp: 100, maxHp: 100 },
            walls: [],
            worldOpacity: 1
        };

        GAME.updateZombies(mockState, Date.now(), 1.0);
        expect(normalZombie.isShielded).toBe(true);
        expect(normalZombie.shieldedBy).toBe(charger);
    });

    it('should prevent bullet damage to shielded zombies', () => {
        const shieldedZombie = { x: 100, y: 100, hp: 10, radius: 20, type: 'normal', isShielded: true };
        const bullet = { x: 100, y: 100, vx: 0, vy: 0, dmg: 5, type: 'pistol' };
        
        global.GAME.spawnShieldSpark = () => {};
        global.GAME.soundManager = { playSynth: () => {} };

        const mockState = {
            bullets: [bullet],
            zombies: [shieldedZombie],
            canvas: { width: 800, height: 600 },
            player: { money: 0 }
        };

        GAME.updateBullets(mockState, 1.0);
        expect(shieldedZombie.hp).toBe(10); // HP preserved
    });

    it('should increase Boss speed and change color to red when HP is under 50%', () => {
        const boss = { x: 100, y: 100, hp: 400, maxHp: 1000, radius: 60, speed: 1.5, baseSpeed: 1.5, color: '#2c3e50', type: 'boss' };
        const mockState = {
            zombies: [boss],
            player: { x: 500, y: 500, hp: 100, maxHp: 100 },
            walls: [],
            worldOpacity: 1
        };

        GAME.updateZombies(mockState, Date.now(), 1.0);
        expect(boss.color).toBe('#c0392b');
        expect(boss.speed).toBeGreaterThan(1.5);
    });

    it('should detect when line of sight is blocked by a wall and when unblocked', () => {
        const wall = { x: 200, y: 200, rotation: 0, hp: 100, maxHp: 100 };
        // Segment going through wall (100,200) to (300,200)
        expect(GAME.isPathBlocked(100, 200, 300, 200, [wall])).toBe(true);
        // Segment clear of wall (100,100) to (300,100)
        expect(GAME.isPathBlocked(100, 100, 300, 100, [wall])).toBe(false);
    });

    it('should damage walls when zombies collide with them', () => {
        const wall = { x: 100, y: 100, rotation: 0, hp: 100, maxHp: 100 };
        const zombie = { x: 100, y: 100, radius: 20, speed: 1, type: 'normal', hp: 50 };
        const mockState = {
            zombies: [zombie],
            player: { x: 500, y: 500, hp: 100, maxHp: 100 },
            walls: [wall],
            worldOpacity: 1
        };

        GAME.updateZombies(mockState, Date.now(), 1.0);
        expect(wall.hp).toBeLessThan(100);
    });
});
