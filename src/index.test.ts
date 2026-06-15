import { describe, it, expect, vi } from 'vitest';
import { init, newRound, rerollWeapon, fight } from '$lib/index';
import type { GameState } from '$lib/index';

const SWORD = { name: 'sword', description: 'Deals 5 damage.', rarity: 'rare' };
const HATCHET = { name: 'hatchet', description: 'Deals 1 damage.', rarity: 'common' };

describe('rerollWeapon', () => {
    it('never picks a weapon already used this round', () => {
        const state = init();
        const usedWeapons = new Set([state.playerWeapon.name]);

        const after1 = { ...state, ...rerollWeapon(state) };
        expect(usedWeapons.has(after1.playerWeapon.name)).toBe(false);
        usedWeapons.add(after1.playerWeapon.name);

        const after2 = { ...after1, ...rerollWeapon(after1) };
        expect(usedWeapons.has(after2.playerWeapon.name)).toBe(false);
    });

    it('decrements rerollsLeft', () => {
        const state = init();
        const after = { ...state, ...rerollWeapon(state) };
        expect(after.rerollsLeft).toBe(1);
    });

    it('throws when no rerolls remain', () => {
        const state = init();
        const after1 = { ...state, ...rerollWeapon(state) };
        const after2 = { ...after1, ...rerollWeapon(after1) };
        expect(() => rerollWeapon(after2)).toThrow('No rerolls left');
    });
});

describe('newRound', () => {
    it('resets rerollsLeft to 2', () => {
        const state = init();
        const depleted: GameState = { ...state, ...rerollWeapon(state) };
        expect({ ...depleted, ...newRound() }.rerollsLeft).toBe(2);
    });
});

describe('fight', () => {
    it('returns non-negative health values', () => {
        const state = init();
        const result = fight(state.playerCurrentHealth, state.enemyCurrentHealth, state.playerWeapon);
        expect(result.playerHealth).toBeGreaterThanOrEqual(0);
        expect(result.enemyHealth).toBeGreaterThanOrEqual(0);
    });

    it('returns player_won when enemy health reaches 0', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        const result = fight(10, 5, SWORD);
        expect(result.status).toBe('player_won');
        vi.restoreAllMocks();
    });

    it('returns player_lost when player health reaches 0', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.95);
        const result = fight(4, 10, HATCHET);
        expect(result.status).toBe('player_lost');
        vi.restoreAllMocks();
    });
});
