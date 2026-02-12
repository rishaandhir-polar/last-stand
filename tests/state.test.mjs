import { describe, it, expect, beforeEach } from 'vitest';

describe('Global State', () => {
    beforeEach(() => {
        // Reset GAME and load state
        global.GAME = {};
        global.loadScript('state.js');
    });

    it('should initialize with default values', () => {
        expect(GAME.state.player.hp).toBe(100);
        expect(GAME.state.wave).toBe(0);
    });

    it('should update state correctly via updateState', () => {
        GAME.updateState({ wave: 5 });
        expect(GAME.state.wave).toBe(5);

        GAME.updateState({ player: { hp: 50 } });
        expect(GAME.state.player.hp).toBe(50);
        expect(GAME.state.player.maxHp).toBe(100); // Should preserve other keys
    });
});
