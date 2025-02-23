<script lang="ts">
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import { goto } from '$app/navigation';
    import BgDarkTiles from "$lib/BgDarkTiles.svelte"
	import { getUserdata } from '$lib/supabase';

    let totalCharacters = $state(748);
    let guessedCharacters = $state([]);
    let userName = $state('')
    let loading = $state(true);
    let myPoints = $state(0)
    async function wait(seconds: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }

    onMount(async () => {
        let { username, points, solved } = await getUserdata()
        guessedCharacters = solved
        myPoints = points 
        userName = username 

        loading = false;
    });

    function startNewGame() {
        goto('/game');
    }
</script>

<div class="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
    <div class="absolute top-0 left-0 h-full w-full opacity-30 -z-1 pointer-events-none">
        <BgDarkTiles r={20} c={10} />
    </div>
    <h1 class="text-4xl font-bold mb-2">Who Am AI?</h1>
    <p class="text-gray-400 mb-8">Test your knowledge of characters from across anime</p>

    {#if loading}
        <div class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
    {:else}
        <div class="w-full max-w-5xl flex space-x-6" in:fade={{ duration: 300 }}>

            
            <div class="w-2/3 space-y-6">
                <div class="bg-[#0a0a0a] rounded-lg p-6 border border-white/20">
                    <h2 class="text-xl font-semibold mb-6">Welcome back, {userName}!</h2>

                    <h2 class="text-md font-semibold mb-4">Your Progress:</h2>
                    <div class="flex justify-between text-sm mb-2">
                        <span>Characters Guessed</span>
                        <span class="transition-all duration-300">{guessedCharacters.length} / {totalCharacters}</span>
                    </div>
                    <div class="bg-white/10 rounded-full h-2">
                        <div class="bg-white h-2 rounded-full transition-all duration-300" style="width: {(guessedCharacters.length / totalCharacters) * 100}%"></div>
                    </div>
                    <div class="flex justify-between text-sm mt-4">
                        <span>Total Points</span>
                        <span class="transition-all duration-300">{myPoints}</span>
                    </div>
                </div>

                <div class="bg-[#0a0a0a] rounded-lg p-6 border border-white/20">
                    <h2 class="text-lg font-semibold mb-4">How to Play</h2>
                    <ul class="text-sm text-gray-400 space-y-2">
                        <li>• You'll be presented with an AI character</li>
                        <li>• Ask questions to figure out who they are</li>
                        <li>• Try to guess their identity</li>
                        <li>• The faster you guess, the more points you earn!</li>
                    </ul>
                </div>

                <button
                    onclick={startNewGame}
                    class="w-full bg-white text-black font-semibold py-2 px-4 rounded-xl hover:shadow-lg hover:shadow-gray-800 transition-all duration-300"
                >
                    Start New Game
                </button>
            </div>
            <div class="w-1/3 bg-[#0a0a0a] rounded-lg p-6 border border-white/20">
                <h2 class="text-lg font-semibold mb-4">Characters You've Guessed</h2>
                <div class="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                    {#each guessedCharacters as character}
                        <div class="flex flex-col items-center text-center">
                            <img src={character.avatar} alt={character.name} class="w-16 h-16 rounded-full object-cover mb-2" />
                            <span class="text-sm font-medium">{character.name}</span>
                            <span class="text-xs text-gray-400">{character.series}</span>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    {/if}
</div>