<script>
	import '../app.css';
	
	import { dev } from '$app/environment';
    import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	
	let { children } = $props();
	
	onMount(() => {
		// Set up auth state listener
		const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
			if (event === 'SIGNED_OUT') {
				// Redirect to login page if not already there
				if (!$page.url.pathname.includes('/login')) {
					goto('/login');
				}
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	});

	// Inject the Analytics functionality
    injectAnalytics({ mode: dev ? 'development' : 'production' });
  </script>
  

		{@render children()}
		<!-- <div class="text-xl md:text-3xl capitalize font-bold">Hello Amazing Svelte Developer </div> -->


   
<style>
	:global(body) {
		background-color: black;
	}
</style>