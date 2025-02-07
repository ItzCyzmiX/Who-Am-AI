<script lang="ts">
	import { goto } from '$app/navigation';
	import BgDarkTiles from "$lib/BgDarkTiles.svelte";
</script>

<div class="relative flex h-screen flex-col items-center justify-center bg-black text-white">
	<div class="absolute top-0 left-0 h-full w-full opacity-30">
		<BgDarkTiles r={20} c={10} />
	</div>
	<div class="z-10 text-center">
		<h1 class="text-4xl font-bold mb-4">Email Confirmed!</h1>
		<p class="text-xl mb-8">Your email has been successfully confirmed.</p>
		<button
			on:click={() => goto('/home')}
			class="bg-white text-black font-semibold py-2 px-6 rounded-lg hover:bg-opacity-90 transition-colors"
		>
			Start Now!
		</button>
	</div>
</div>
