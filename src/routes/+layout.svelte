<script>
	import '../app.css';
	let { children } = $props();

	import BgDarkTiles from "$lib/BgDarkTiles.svelte";
  </script>
  

		{@render children()}
		<!-- <div class="text-xl md:text-3xl capitalize font-bold">Hello Amazing Svelte Developer </div> -->


   
<style>
	:global(body) {
		background-color: black;
	}
</style>