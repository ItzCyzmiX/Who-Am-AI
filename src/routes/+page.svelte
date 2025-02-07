<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import BgDarkTiles from "$lib/BgDarkTiles.svelte";

  let visible = false;

  onMount(() => {
    visible = true;
  });
</script>

<div class="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 overflow-hidden">
  <div class="absolute top-0 left-0 h-full w-full opacity-30 -z-1 pointer-events-none">
    <BgDarkTiles r={20} c={10} />
  </div>
  {#if visible}
    <h1 in:fly="{{ y: -50, duration: 1000 }}" class="text-6xl font-extrabold mb-4 text-center">
      <span class="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">Who Am AI?</span>
    </h1>
    <p in:fade="{{ delay: 500, duration: 1000 }}" class="text-2xl text-gray-400 mb-8 text-center max-w-2xl">
      Embark on an AI-powered journey through the anime universe. Can you outsmart the machine?
    </p>
    <button
      on:click={() => goto('/home')}
      in:fly="{{ y: 50, delay: 1000, duration: 1000 }}"
      class="bg-white text-black font-bold py-4 px-8 rounded-full hover:bg-opacity-90 transition duration-300 transform hover:scale-105 shadow-lg"
    >
      Begin Your Quest
    </button>
    <p in:fade="{{ delay: 1500, duration: 1000 }}" class="mt-12 text-sm text-gray-500 text-center max-w-md">
      Challenge yourself with characters from classics to the latest hits. How many can you identify?
    </p>
  {/if}
</div>

