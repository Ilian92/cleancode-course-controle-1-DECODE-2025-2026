import weaponsData from './weaponList.json';

export type GameStatus = 'round_ready' | 'round_fought' | 'player_won' | 'player_lost';

export interface Weapon {
    name: string;
    description: string;
    rarity: string;
}

export interface GameState {
    playerMaxHealth: number;
    playerCurrentHealth: number;
    enemyMaxHealth: number;
    enemyCurrentHealth: number;
    playerWeapon: Weapon;
    enemyWeapon: Weapon | null;
    status: GameStatus;
    availableWeapons: Weapon[];
    rerollsLeft: number;
}

export interface FightResult {
    playerHealth: number;
    enemyHealth: number;
    enemyWeapon: Weapon;
    status: GameStatus;
}

const MAX_HEALTH = 10;
const MAX_REROLLS = 2;

const weaponDamage: Record<string, () => number> = {
    hatchet: () => 1,
    knife: () => 1,
    spear: () => 1,
    sword: () => 5,
    halberd: () => 5,
    dagger: () => 3,
    bow: () => Math.floor(Math.random() * 5),
    crossbow: () => 2 * Math.floor(Math.random() * 5),
    darts: () => Math.floor(Math.random() * 3),
};

function pickRandomWeapon(weapons: Weapon[]): Weapon {
    return weapons[Math.floor(Math.random() * weapons.length)];
}

function calculateDamage(weapon: Weapon): number {
    const damageFn = weaponDamage[weapon.name];
    if (!damageFn) throw new Error(`Unknown weapon: ${weapon.name}`);
    return damageFn();
}

function preventNegative(value: number): number {
    return Math.max(0, value);
}

function netDamage(attacker: number, defender: number): number {
    return Math.max(0, attacker - defender);
}

function determineStatus(playerHealth: number, enemyHealth: number): GameStatus {
    if (enemyHealth === 0) return 'player_won';
    if (playerHealth === 0) return 'player_lost';
    return 'round_fought';
}

function startRound(): Pick<GameState, 'playerWeapon' | 'enemyWeapon' | 'status' | 'availableWeapons' | 'rerollsLeft'> {
    const playerWeapon = pickRandomWeapon(weaponsData);
    const availableWeapons = weaponsData.filter(weapon => weapon.name !== playerWeapon.name);

    return {
        playerWeapon,
        enemyWeapon: null,
        status: 'round_ready',
        availableWeapons,
        rerollsLeft: MAX_REROLLS,
    };
}

export function init(): GameState {
    return {
        playerMaxHealth: MAX_HEALTH,
        playerCurrentHealth: MAX_HEALTH,
        enemyMaxHealth: MAX_HEALTH,
        enemyCurrentHealth: MAX_HEALTH,
        ...startRound(),
    };
}

export function newRound(): Pick<GameState, 'playerWeapon' | 'enemyWeapon' | 'status' | 'availableWeapons' | 'rerollsLeft'> {
    return startRound();
}

export function rerollWeapon(state: GameState): Pick<GameState, 'playerWeapon' | 'availableWeapons' | 'rerollsLeft'> {
    if (state.rerollsLeft === 0) throw new Error('No rerolls left');

    const playerWeapon = pickRandomWeapon(state.availableWeapons);
    const availableWeapons = state.availableWeapons.filter(weapon => weapon.name !== playerWeapon.name);

    return {
        playerWeapon,
        availableWeapons,
        rerollsLeft: state.rerollsLeft - 1,
    };
}

export function fight(playerHealth: number, enemyHealth: number, playerWeapon: Weapon): FightResult {
    const playerDamage = calculateDamage(playerWeapon);
    const enemyWeapon = pickRandomWeapon(weaponsData);
    const enemyDamage = calculateDamage(enemyWeapon);

    const newPlayerHealth = preventNegative(playerHealth - netDamage(enemyDamage, playerDamage));
    const newEnemyHealth = preventNegative(enemyHealth - netDamage(playerDamage, enemyDamage));

    return {
        playerHealth: newPlayerHealth,
        enemyHealth: newEnemyHealth,
        enemyWeapon,
        status: determineStatus(newPlayerHealth, newEnemyHealth),
    };
}
