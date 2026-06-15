<script lang="ts">
    import { fight, init, newRound, rerollWeapon } from "$lib";
    import type { GameState } from "$lib";

    let state: GameState | null = null;

    function triggerInit() {
        state = init();
    }

    function triggerNewRound() {
        if (!state) return;
        state = { ...state, ...newRound() };
    }

    function triggerReroll() {
        if (!state) return;
        state = { ...state, ...rerollWeapon(state) };
    }

    function triggerFight() {
        if (!state) return;
        const result = fight(state.playerCurrentHealth, state.enemyCurrentHealth, state.playerWeapon);
        state = {
            ...state,
            playerCurrentHealth: result.playerHealth,
            enemyCurrentHealth: result.enemyHealth,
            enemyWeapon: result.enemyWeapon,
            status: result.status,
        };
    }
</script>


<section id="player" class="w-1/3">
    {#if state !== null}
        <div class="flex flex-col items-center justify-center w-full">
            <h1 class="text-2xl font-bold">Player</h1>
            <p class="text-lg">Health: {state.playerCurrentHealth} / {state.playerMaxHealth}</p>
            <p class="text-lg">Weapon name: {state.playerWeapon.name}</p>
            <p class="text-lg">Weapon description: {state.playerWeapon.description}</p>
        </div>
    {/if}
</section>

<section id="action">
    {#if state === null}
        <button class="btn btn-xl variant-filled-primary" on:click={triggerInit}>Start</button>

    {:else if state.status === 'round_ready'}
        {#if state.rerollsLeft > 0}
            <button class="btn btn-xl variant-filled-secondary" on:click={triggerReroll}>
                Reroll ({state.rerollsLeft} left)
            </button>
        {/if}
        <button class="btn btn-xl variant-filled-error" on:click={triggerFight}>Fight</button>

    {:else if state.status === 'round_fought'}
        <button class="btn btn-xl variant-filled-warning" on:click={triggerNewRound}>Next Round</button>

    {:else if state.status === 'player_won'}
        <p class="p">You won!</p>
        <button class="btn btn-xl variant-filled-primary" on:click={triggerInit}>Play again</button>

    {:else if state.status === 'player_lost'}
        <p class="p">You lost...</p>
        <button class="btn btn-xl variant-filled-primary" on:click={triggerInit}>Play again</button>
    {/if}
</section>

<section id="enemy" class="w-1/3">
    {#if state !== null}
        <div class="flex flex-col items-center justify-center w-full">
            <h1 class="text-2xl font-bold">Enemy</h1>
            <p class="text-lg">Health: {state.enemyCurrentHealth} / {state.enemyMaxHealth}</p>
            {#if state.enemyWeapon !== null}
                <p class="text-lg">Weapon name: {state.enemyWeapon.name}</p>
                <p class="text-lg">Weapon description: {state.enemyWeapon.description}</p>
            {/if}
        </div>
    {/if}
</section>
