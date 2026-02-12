import { describe, it, expect, beforeEach } from 'vitest';
import { updateState, state } from '../state.js';

describe('State Management', () => {
    beforeEach(() => {
        // Reset state properties manually since it's a singleton export
        state.wave = 0;
        state.player.money = 0;
    });

    it('should update state properties correctly', () => {
        updateState({ wave: 5 });
        expect(state.wave).toBe(5);
    });

    it('should partially update nested objects', () => {
        const initialMoney = state.player.money;
        updateState({ player: { ...state.player, money: initialMoney + 100 } });
        expect(state.player.money).toBe(initialMoney + 100);
    });
});
