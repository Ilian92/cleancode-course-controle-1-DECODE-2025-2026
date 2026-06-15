import { describe, it, expect } from 'vitest';
import { init, newRound, rerollWeapon } from '$lib';
import type { GameState } from '$lib';

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

