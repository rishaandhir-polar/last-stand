import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Meta Progression & Biomes', () => {
    beforeEach(() => {
        global.GAME = {
            TILE_SIZE: 64,
            PLAYER_SPEED: 4
        };
        localStorage.clear();
        global.loadScript('meta-state.js');
        global.loadScript('render-map.js');
    });

    it('should initialize with default meta stats', () => {
        const meta = GAME.loadMeta();
        expect(meta.xp).toBe(0);
        expect(meta.critLevel).toBe(0);
        expect(meta.healthLevel).toBe(0);
        expect(meta.speedLevel).toBe(0);
        expect(meta.adminChanceLevel).toBe(0);
    });

    it('should apply meta upgrades to player (10% default crit)', () => {
        const player = {};
        const meta = { healthLevel: 2, speedLevel: 1, critLevel: 0, adminChanceLevel: 1 };
        GAME.applyMeta(player, meta);

        expect(player.maxHp).toBe(140); // 100 + 2*20
        expect(player.hp).toBe(140);
        expect(player.metaSpeed).toBe(1.05); // 1 + 1*0.05
        expect(player.critChance).toBe(0.10); // Base 10%
        expect(player.adminDropChance).toBe(0.01); // 1%
    });

    it('should award XP correctly based on waves survived', () => {
        const earned = GAME.awardRunXP(5);
        expect(earned).toBeGreaterThan(0);
        const meta = GAME.loadMeta();
        expect(meta.xp).toBe(earned);
    });

    it('should buy upgrade when sufficient XP is available', () => {
        GAME.saveMeta({ xp: 500, healthLevel: 0, speedLevel: 0, critLevel: 0, adminChanceLevel: 0 });
        GAME.buyMetaUpgrade('healthLevel');

        const updated = GAME.loadMeta();
        expect(updated.healthLevel).toBe(1);
        expect(updated.xp).toBe(400); // 500 - 100
    });

    it('should cycle biomes every 5 waves (Lab -> Desert -> Alien -> Lab)', () => {
        expect(GAME.getBiome(1)).toBe('lab');
        expect(GAME.getBiome(5)).toBe('lab');
        expect(GAME.getBiome(6)).toBe('desert');
        expect(GAME.getBiome(10)).toBe('desert');
        expect(GAME.getBiome(11)).toBe('alien');
        expect(GAME.getBiome(15)).toBe('alien');
        expect(GAME.getBiome(16)).toBe('lab');
        expect(GAME.getBiome(21)).toBe('desert');
    });
});
