<script lang="ts">
	import { goto } from '$app/navigation';
	import BgDarkTiles from "$lib/BgDarkTiles.svelte";
	import { fade, fly } from 'svelte/transition';

	let email = $state('');
	let password = $state('');
	let username = $state('');
	let loading = $state(false);
	let isRegistering = $state(false);
	let toast = $state({ show: false, message: '', type: '' });

	function showToast(message: string, type: 'success' | 'error') {
		toast = { show: true, message, type };
		setTimeout(() => toast = { ...toast, show: false }, 3000);
	}

	async function handleAuth(e: Event) {
		e.preventDefault();
		loading = true;
		let mode = isRegistering ? "sign" : "login";

		try {
			if (password.length < 8) {
				throw new Error(isRegistering ? 'Password must be 8 characters long' : 'Invalid email or password');
			}
			const response = await fetch('/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ mode, email, username, password })
			});

			const js = await response.json()

			if (js.success==="unconfirmed") {
				throw new Error('Email adress not confirmed');
			} 
			
			if (!js.success) {
				throw new Error(isRegistering ? 'Registration failed' : 'Invalid email or password');
			}
			
			if (isRegistering) {
				showToast('Registration successful. Please confirm your email address.', 'success');
			} else {
				showToast('Login successful!', 'success');
				goto('/home');
			}
		} catch (err) {
			showToast(err.message, 'error');
		} finally {
			loading = false;
		}
	}

	function toggleMode() {
		isRegistering = !isRegistering;
	}
</script>

<div class="relative flex h-screen flex-col bg-black">
	<div class="absolute top-0 left-0 h-full w-full opacity-30">
		<BgDarkTiles r={20} c={10} />
	</div>
	<div class="relative z-10 flex-1 flex items-center justify-center px-4">
		<div class="w-full max-w-md space-y-8">
			<div class="text-center">
				<h2 class="text-3xl font-bold text-white">
					{isRegistering ? 'Register for' : 'Login to'} Who Am AI?
				</h2>
			</div>
			<form onsubmit={handleAuth} class="mt-8 space-y-6">
				<div class="space-y-4">
					{#if isRegistering}
						<div>
							<label for="username" class="sr-only">Username</label>
							<input id="username" name="username" type="text" required
								class="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/50 focus:border-white/40 focus:outline-none"
								placeholder="Username"
								bind:value={username}
								disabled={loading}
							>
						</div>
					{/if}
					<div>
						<label for="email" class="sr-only">Email address</label>
						<input id="email" name="email" type="email" required
							class="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/50 focus:border-white/40 focus:outline-none"
							placeholder="Email address"
							bind:value={email}
							disabled={loading}
						>
					</div>
					<div>
						<label for="password" class="sr-only">Password</label>
						<input id="password" name="password" type="password" required
							class="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/50 focus:border-white/40 focus:outline-none"
							placeholder="Password"
							bind:value={password}
							disabled={loading}
						>
					</div>
				</div>

				<div>
					<button type="submit"
						class="w-full rounded-lg bg-white px-4 py-3 text-lg font-medium text-black transition-colors hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
						disabled={loading}
						
					>
						{loading ? 'Processing...' : (isRegistering ? 'Register' : 'Log in')}
					</button>
				</div>
				<div class="text-center">
					<button type="button" onclick={toggleMode} class="text-white hover:underline">
						{isRegistering ? 'Already have an account? Log in' : 'Need an account? Register'}
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
{#if loading}
	<div
		class="fixed inset-0 flex items-center justify-center bg-black/80 z-[100]"
		transition:fly={{ duration: 300 }}
	>
		<div class="text-center text-white">
			<div class="mb-4">
				<svg class="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
				</svg>
			</div>
		</div>
	</div>
{/if}
{#if toast.show}
	<div
		transition:fly={{ y: 50, duration: 300 }}
		class="fixed top-4 right-4 px-4 py-2 rounded-lg text-white {toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}"
	>
		{toast.message}
	</div>
{/if}

<style>
	:global(body) {
		background-color: black;
	}
</style>
