<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { fade, fly, slide, scale } from 'svelte/transition';
	import BgDarkTiles from "$lib/BgDarkTiles.svelte"
	import getRandomCharacter, { getUserdata, updateUserdata } from '$lib/supabase';

	let loading = $state(true);

	let messages: Array<{
		content: string;
		role: string;
		timestamp: Date;
	}> = $state([]);

	let character = $state({
		name: '',
		series: '',
		avatar: ''
	});

	let myPoints = $state(0)

	let preloadedImage: HTMLImageElement | null = $state(null);

	let textareaElement: HTMLTextAreaElement;

	let fun_message = $state('How about a who are you question?');

	let messageInput = $state('');
	let chatContainer: HTMLElement;
	let hasGuessed = $state(false);

	// Simulate bot typing
	let isTyping = $state(false);

	let shouldAutoScroll = true;
    let toast = $state({ show: false, message: '', type: '' });
    function showToast(message: string, type: 'success' | 'error') {
		toast = { show: true, message, type };
		setTimeout(() => toast = { ...toast, show: false }, 3000);
	}
	// Function to scroll to bottom
	const scrollToBottom = (type = 'smooth') => {
		if (!chatContainer) return;

		const shouldSmooth = document.body.clientHeight - window.innerHeight > 100;
		chatContainer.scrollTo({
			top: chatContainer.scrollHeight,
			behavior: shouldSmooth ? 'smooth' : 'auto'
		});
	};

	// Handle scroll events to determine if user has manually scrolled up
	const handleScroll = () => {
		if (!chatContainer) return;

		const bottom =
			Math.abs(chatContainer.scrollHeight - chatContainer.clientHeight - chatContainer.scrollTop) <
			100;
		shouldAutoScroll = bottom;
	};
	$effect(() => {
		if (messages.length > 0 && shouldAutoScroll) {
			scrollToBottom('auto');
		}
	});

	function adjustTextareaHeight() {
		if (textareaElement) {
			// Reset height to auto to get proper scrollHeight
			textareaElement.style.height = 'auto';
			
			// Get computed styles
			const computedStyle = window.getComputedStyle(textareaElement);
			const lineHeight = parseInt(computedStyle.lineHeight);
			const paddingTop = parseInt(computedStyle.paddingTop);
			const paddingBottom = parseInt(computedStyle.paddingBottom);
			
			const minHeight = lineHeight + paddingTop + paddingBottom;
			const maxHeight = lineHeight * 6 + paddingTop + paddingBottom;
			
			// Create temporary div to measure text
			const measureDiv = document.createElement('div');
			measureDiv.style.cssText = `
				visibility: hidden;
				position: absolute;
				width: ${textareaElement.clientWidth - parseInt(computedStyle.paddingLeft) - parseInt(computedStyle.paddingRight)}px;
				font-family: ${computedStyle.fontFamily};
				font-size: ${computedStyle.fontSize};
				line-height: ${computedStyle.lineHeight};
				white-space: pre-wrap;
				word-wrap: break-word;
				padding: ${computedStyle.padding};
				border: ${computedStyle.border};
				box-sizing: border-box;
			`;
			
			// Measure either the input text or placeholder
			measureDiv.textContent = messageInput || fun_message;
			document.body.appendChild(measureDiv);
			
			// Calculate and set the new height
			const contentHeight = measureDiv.scrollHeight;
			const newHeight = Math.max(minHeight, Math.min(contentHeight, maxHeight));
			textareaElement.style.height = `${newHeight}px`;
			
			// Clean up
			document.body.removeChild(measureDiv);
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			if (e.ctrlKey) {
				// Add new line on Ctrl+Enter
				const start = textareaElement.selectionStart;
				const end = textareaElement.selectionEnd;
				messageInput = messageInput.substring(0, start) + '\n' + messageInput.substring(end);
				// Set cursor position after the new line
				setTimeout(() => {
					textareaElement.selectionStart = textareaElement.selectionEnd = start + 1;
				}, 0);
				adjustTextareaHeight();
			} else {
				// Submit on Enter if the input is not empty
				if (messageInput.trim()) {
					e.preventDefault();
					handleSubmit(e);
				}
			}
		}
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!messageInput.trim()) return;

		// Add user message
		messages = [
			...messages,
			{
				content: messageInput,
				role: 'user',
				timestamp: new Date()
			}
		];
		shouldAutoScroll = true; // Force scroll on user message
		scrollToBottom();
		messageInput = '';
		if (textareaElement) {
			const lineHeight = parseInt(window.getComputedStyle(textareaElement).lineHeight);
			textareaElement.style.height = `${lineHeight}px`;
		}

		isTyping = true;

		let res = await fetch('/game', {
			body: JSON.stringify({
				character: character.name,
				series: character.series,
				messages: messages.map(({ timestamp, ...rest }) => {
					return rest;
				})
			}),

			method: 'POST'
		});
		
		const { response, fun_text, did_guess } = await res.json();
		// console.log(json)
		
		fun_message = fun_text;
		
		adjustTextareaHeight();
		
		
		messages = [
			...messages,
			{
				content: `${response} `,
				role: 'assistant',
				timestamp: new Date()
			}
		];
		
		scrollToBottom();
		isTyping = false;
		hasGuessed = did_guess;
		if (did_guess) {
			let { username, points, solved } = await getUserdata()
			let res2 = await updateUserdata({
				points: myPoints + Math.max(100-(messages.length/2), 0),
				solved: [...solved, {
					'name': character.name,
					"series": character.series,
					"avatar": character.avatar
				}]
			}) 
			console.log(res2)
		}
		
		
	}

	async function preloadImage(url: string): Promise<void> {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => {
				preloadedImage = img;
				resolve();
			};
			img.onerror = reject;
			img.src = url;
		});
	}

	async function reset() {
		loading = true;
		
		let { username, points, solved } = await getUserdata()
		myPoints = points
		let char = await getRandomCharacter()
		character = char;

		// Preload the image before finishing reset
		try {
			await preloadImage(character.avatar);
		} catch (error) {
			console.error('Failed to preload image:', error);
		}

		messages = [];
		hasGuessed = false;
		loading = false;
	}

	onMount(async () => {
		await reset();
		showHowToPlay = localStorage.getItem('howToPlayShown') !== 'true'
		if (showHowToPlay) {
			localStorage.setItem('howToPlayShown', 'true');
		}

		if (textareaElement) {
			const lineHeight = parseInt(window.getComputedStyle(textareaElement).lineHeight);
			console.log(lineHeight)
			textareaElement.style.height = `${lineHeight}px`;

			textareaElement.focus({
				preventScroll: true
			});
		}

		console.log(character)
	});

	let showHowToPlay = $state(false);
    let showHint = $state(false)

	

    function toggleHowToPlay() {
        showHowToPlay = !showHowToPlay;
        if (showHowToPlay) {
            localStorage.setItem('howToPlayShown', 'true');
        }
    }
    let showPointLoss = $state(false);
    let pointLossPosition = $state({ x: 0, y: 0 });

    async function toggleHint(e: MouseEvent) {
		if (!showHint && myPoints<100) {
			showToast('Insufficent points!', "error")
			return
		}
        showHint = !showHint;

		if (showHint) {
			pointLossPosition = { x: e.clientX, y: e.clientY };
            showPointLoss = true;
            setTimeout(() => showPointLoss = false, 1000);
            
			myPoints -= 100
			let res = await updateUserdata({
				points: myPoints
			})
		}
    }
</script>
{#if toast.show}
	<div
		transition:fly={{ y: 50, duration: 300 }}
		class="fixed top-4 right-4 px-4 py-2 rounded-lg text-white z-50 {toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}"
	>
		{toast.message}
	</div>
{/if}
{#if showPointLoss}
    <div
        transition:scale={{ duration: 700, start: 1, opacity: 1 }}
        class="fixed text-red-500 font-bold text-xl pointer-events-none z-50"
        style="left: {pointLossPosition.x}px; top: {pointLossPosition.y - 20}px; transform: translate(-50%, -50%); animation: floatUp 1s ease-out forwards;"
    >
        -100
    </div>
{/if}

	{#if showHowToPlay}
		<div class="pointer-events-none fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" transition:slide={{axis: 'y'}}>
			<div class="bg-[#0a0a0a] p-6 rounded-lg max-w-md border border-white/30">
				<h2 class="text-2xl font-bold mb-4 text-white">How to Play</h2>
				<ul class="list-disc list-inside text-white space-y-2">
					<li>You'll be chatting with an AI character from anime.</li>
					<li>Ask questions to figure out who they are.</li>
					<li>Try to guess their identity as quickly as possible.</li>
					<li>The fewer questions you ask, the more points you earn!</li>
					<li>Hints remove 100 points!</li>
				</ul>
				<button onclick={toggleHowToPlay} class="mt-6 bg-white text-black px-4 py-2 rounded hover:bg-gray-200">
					Close
				</button>
			</div>
		</div>
	{/if}


<div class="relative flex h-screen flex-col bg-black" class:opacity-50={loading || hasGuessed}>
	<div class="relative z-10 border-b border-white/10 backdrop-blur-sm">
		<!-- Fixed header -->
		<div class="mx-auto max-w-6xl px-4 py-4 flex justify-between items-center">
			<button onclick={() => goto('/home')} class="text-2xl font-bold text-white">Who Am AI?</button>
			<button onclick={toggleHowToPlay} class="flex items-center text-white hover:text-gray-300">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				How to Play
			</button>
		</div>
	</div>
	<div class="pointer-events-none absolute top-0 left-0 h-full w-full opacity-30">
		<BgDarkTiles r={20} c={10} />
	</div>
	<!-- Chat container -->
	<div
		bind:this={chatContainer}
		onscroll={handleScroll}
		class="flex-1 overflow-y-auto px-4 py-6"
	>
		<div class="mx-auto max-w-3xl space-y-4">
			{#each messages as message, i (i)}
				<div
					transition:fade={{ duration: 150 }}
					class="flex items-start gap-4 {message.role === 'assistant'
						? 'justify-start'
						: 'justify-end'}"
				>
					<div
						class="max-w-[80%] rounded-lg {message.role === 'assistant'
							? 'bg-white/10 text-white'
							: 'bg-white text-black'} px-4 py-3 shadow-lg"
					>
						<p class="whitespace-pre-wrap md:text-md">{message.content}</p>
						<span class="mt-1 block text-[10px] opacity-50">
							{new Date(message.timestamp).toLocaleTimeString()}
						</span>
					</div>
				</div>
			{/each}
			{#if isTyping}
				<div class="flex items-center gap-2 text-white/50" transition:fade>
					<div class="h-2 w-2 animate-bounce rounded-full bg-current" ></div>	
					<div class="h-2 w-2 animate-bounce rounded-full bg-current" style="animation-delay: 0.2s;" ></div>
					<div class="h-2 w-2 animate-bounce rounded-full bg-current" style="animation-delay: 0.4s;" ></div>
				</div>
			{/if}
		</div>
	</div>
	<div class="mx-auto  px-3">
		<button onclick={(e) => toggleHint(e)}  class="hover:cursor-pointer font-semibold flex items-center bg-black border p-3  border-white/40 rounded-t-xl text-white hover:text-gray-300 text-sm">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
			</svg>
			Need a hint?
		</button>
	</div>
	<!-- Input area -->
	<div class="relative z-10 border-t border-white/10 bg-black/50 backdrop-blur-sm">
		<div class="mx-auto max-w-3xl px-4 py-4">

			<div class="relative">
				<textarea
					bind:this={textareaElement}
					bind:value={messageInput}
					oninput={adjustTextareaHeight}
					onkeydown={handleKeyDown}
					placeholder={fun_message}
					disabled={hasGuessed || isTyping || loading}
					class="h-[24px] w-full resize-none rounded-lg border border-white/20 bg-white/5 px-4 pr-[4.5rem] py-3 text-white placeholder-white/50 focus:border-white/40 focus:outline-none focus:ring-0"
					style="min-height: 3rem; transition: height 0.1s ease-out;"
				></textarea>
				<button
					onclick={handleSubmit}
					class="absolute top-1/2  -translate-y-1/2 right-3 rounded-md bg-white px-3 py-1 text-md font-medium text-black transition-colors hover:bg-white/90 disabled:opacity-50"
					disabled={!messageInput.trim() || isTyping || hasGuessed || loading}
				>
					Send
				</button>
			</div>
		</div>
	</div>
</div>
{#if loading}
	<div
		class="pointer-events-none fixed inset-0 flex items-center justify-center"
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

{#if hasGuessed}
	<div
		class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
		transition:slide={{ axis: 'y', duration: 300 }}
	>
		<div class="text-center text-white">
			<div class="mb-4">
				<img
					src={character.avatar}
					alt={character.name}
					class="mx-auto h-32 w-32 rounded-xl object-cover shadow-lg shadow-white/30"
				/>
			</div>
			<span class="text-2xl"
				>You guessed it! It was {character.name} from {character.series}</span
			>
			<div class="mt-4 space-y-2">
				<button onclick={reset} class="w-full hover:shadow-lg transition duration-300 hover:shadow-white/30 rounded-lg bg-white px-4 py-2 text-black shadow-lg">
					Play Again
				</button>
				<button onclick={() => goto('/home')} class="w-full hover:shadow-lg transition duration-300 hover:shadow-white/30 rounded-lg bg-white/10 px-4 py-2 text-white shadow-lg">
					Go Back Home
				</button>
			</div>
		</div>
	</div>
{/if}
{#if showHint}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" transition:slide={{axis: 'y'}}>
        <div class="bg-[#0a0a0a] p-6 rounded-lg max-w-md border border-white/30">
            <h2 class="text-2xl font-bold mb-4 text-white">Hint</h2>
            <p class="text-white mb-4">This character is from <bold>  {character.series}</bold></p>
			<p class="text-white mb-4">Points left: {myPoints}</p>
            <button onclick={toggleHint} class="mt-6 bg-white text-black px-4 py-2 rounded hover:bg-gray-200">
                Close
            </button>
        </div>
    </div>
{/if}
<style>
	/* Custom scrollbar for Webkit browsers */
	::-webkit-scrollbar {
		width: 6px;
	}

	::-webkit-scrollbar-track {
		background: black;
	}

	::-webkit-scrollbar-thumb {
		background: #27272a;
		border-radius: 3px;
	}

	::-webkit-scrollbar-thumb:hover {
		background: #3f3f46;
	}

	@keyframes floatUp {
        0% {
            transform: translate(-50%, -50%);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -150%);
            opacity: 0;
        }
    }
</style>
