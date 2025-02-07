<script>
	import '../app.css';
	
	import { dev } from '$app/environment';
    import { inject } from '@vercel/analytics';
	
	let { children } = $props();
    // Inject the Analytics functionality
    inject({ mode: dev ? 'development' : 'production' });
  </script>
  

		{@render children()}
		<!-- <div class="text-xl md:text-3xl capitalize font-bold">Hello Amazing Svelte Developer </div> -->


   
<style>
	:global(body) {
		background-color: black;
	}
</style>