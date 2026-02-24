<script lang="ts">
	import { onMount } from 'svelte';
	import { uploadHandImage, getAllHandImages } from '$lib/supabase';
	import { generateReading, shouldWashHands } from '$lib/palmistry';

	type Phase = 'welcome' | 'camera' | 'reading' | 'collage';

	let phase = $state<Phase>('welcome');
	let videoEl = $state<HTMLVideoElement | null>(null);
	let canvasEl = $state<HTMLCanvasElement | null>(null);
	let stream = $state<MediaStream | null>(null);
	let capturedImage = $state<string | null>(null);
	let uploading = $state(false);
	let uploadError = $state<string | null>(null);
	let cameraReady = $state(false);
	let cameraFailed = $state(false);
	let fileInputEl = $state<HTMLInputElement | null>(null);

	let reading = $state<ReturnType<typeof generateReading> | null>(null);
	let washResult = $state<ReturnType<typeof shouldWashHands> | null>(null);
	let readingVisible = $state(false);

	let collageImages = $state<string[]>([]);
	let loadingCollage = $state(false);

	// Stars background
	let stars = $state<Array<{ x: number; y: number; duration: number; delay: number; brightness: number }>>([]);

	onMount(() => {
		stars = Array.from({ length: 80 }, () => ({
			x: Math.random() * 100,
			y: Math.random() * 100,
			duration: 2 + Math.random() * 4,
			delay: Math.random() * 3,
			brightness: 0.3 + Math.random() * 0.7,
		}));
	});

	async function startCamera() {
		phase = 'camera';
		capturedImage = null;
		uploadError = null;
		cameraReady = false;
		cameraFailed = false;

		await new Promise((r) => setTimeout(r, 100));

		if (!navigator.mediaDevices?.getUserMedia) {
			cameraFailed = true;
			uploadError = 'Thy device lacks the Oracle\'s eye. Upload a photo instead.';
			return;
		}

		try {
			stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 960 } },
			});
		} catch (err) {
			console.error('Camera error:', err);
			cameraFailed = true;
			uploadError = 'The Oracle\'s eye cannot see. Grant camera permission in your browser settings, or upload a photo instead.';
			return;
		}

		// getUserMedia succeeded — now wire up the video element
		// Wait an extra tick in case Svelte hasn't rendered it yet after permission grant
		if (!videoEl) await new Promise((r) => setTimeout(r, 100));

		if (videoEl) {
			videoEl.srcObject = stream;
			videoEl.onplaying = () => {
				requestAnimationFrame(() => { cameraReady = true; });
			};
			// Don't await play() — the autoplay attribute handles it,
			// and awaiting it can throw on first-time permission grants
			videoEl.play().catch(() => {});
		}
	}

	function capturePhoto() {
		if (!videoEl || !canvasEl || !cameraReady) return;
		const ctx = canvasEl.getContext('2d');
		if (!ctx) return;

		const w = videoEl.videoWidth || videoEl.clientWidth;
		const h = videoEl.videoHeight || videoEl.clientHeight;
		canvasEl.width = w;
		canvasEl.height = h;

		// Draw in a rAF to guarantee we have a rendered frame
		requestAnimationFrame(() => {
			ctx.drawImage(videoEl!, 0, 0, w, h);
			capturedImage = canvasEl!.toDataURL('image/jpeg', 0.85);
			stopCamera();
		});
	}

	function stopCamera() {
		if (stream) {
			stream.getTracks().forEach((t) => t.stop());
			stream = null;
		}
	}

	function handleFileUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = () => {
			capturedImage = reader.result as string;
			stopCamera();
		};
		reader.readAsDataURL(file);
	}

	function retakePhoto() {
		capturedImage = null;
		cameraFailed = false;
		startCamera();
	}

	async function submitHand() {
		if (!capturedImage) return;
		uploading = true;
		uploadError = null;

		try {
			const res = await fetch(capturedImage);
			const blob = await res.blob();
			const url = await uploadHandImage(blob);

			if (!url) {
				uploadError = 'The spirits could not receive your offering. Please try again.';
				uploading = false;
				return;
			}

			reading = generateReading();
			washResult = shouldWashHands();
			phase = 'reading';

			setTimeout(() => {
				readingVisible = true;
			}, 300);
		} catch (err) {
			console.error(err);
			uploadError = 'A dark force interfered with the transmission. Try again.';
		} finally {
			uploading = false;
		}
	}

	async function showCollage() {
		phase = 'collage';
		loadingCollage = true;
		readingVisible = false;
		collageImages = await getAllHandImages();
		loadingCollage = false;
	}

	function backToStart() {
		phase = 'welcome';
		capturedImage = null;
		reading = null;
		washResult = null;
		readingVisible = false;
		stopCamera();
	}
</script>

<svelte:head>
	<title>Ren Magi - The Hand Oracle</title>
</svelte:head>

<!-- Stars background -->
<div class="stars">
	{#each stars as star}
		<div
			class="star"
			style="left: {star.x}%; top: {star.y}%; --duration: {star.duration}s; --delay: {star.delay}s; --brightness: {star.brightness};"
		></div>
	{/each}
</div>

<main class="relative z-10 min-h-screen px-4 py-8">
	<!-- ═══════════════ WELCOME PHASE ═══════════════ -->
	{#if phase === 'welcome'}
		<div class="mx-auto max-w-2xl text-center animate-fade-in">
			<img src="/logo.webp" alt="Ren Magi" class="mx-auto mb-6 w-64 md:w-80 drop-shadow-[0_0_30px_rgba(107,33,168,0.5)]" />

			<p class="shimmer-text text-2xl md:text-3xl font-cinzel mb-8">
				Reveal Your Destiny
			</p>

			<div class="gothic-border rounded-lg p-8 mb-8 bg-black/40 backdrop-blur-sm">
				<p class="font-garamond text-xl leading-relaxed text-gray-300 mb-4">
					Present thy hand before the Oracle's eye. The ancient spirits shall peer into the lines
					upon thy palm and reveal what fate has inscribed therein.
				</p>
				<p class="font-garamond text-lg text-purple-300 italic">
					Also, they will tell you if you need to wash your hands.
				</p>
			</div>

			<button class="gothic-btn rounded-lg text-lg" onclick={startCamera}>
				&#9764; Consult the Oracle &#9764;
			</button>

			<div class="mt-12">
				<button
					class="text-purple-400 hover:text-pink-400 transition-colors font-cinzel text-sm uppercase tracking-widest"
					onclick={showCollage}
				>
					&#9734; View the Sacred Collage of Hands &#9734;
				</button>
			</div>
		</div>

	<!-- ═══════════════ CAMERA PHASE ═══════════════ -->
	{:else if phase === 'camera'}
		<div class="mx-auto max-w-2xl text-center animate-fade-in">
			<img src="/logo.webp" alt="Ren Magi" class="mx-auto mb-4 w-32 md:w-40 drop-shadow-[0_0_20px_rgba(107,33,168,0.4)]" />
			<h2 class="font-fraktur text-3xl md:text-4xl text-purple-400 glow-text mb-6">
				Present Thy Hand
			</h2>

			<canvas bind:this={canvasEl} class="hidden"></canvas>
			<input bind:this={fileInputEl} type="file" accept="image/*" capture="environment" class="hidden" onchange={handleFileUpload} />

			{#if !capturedImage}
				{#if cameraFailed}
					<div class="gothic-border rounded-lg p-8 mb-6 bg-black/60">
						<p class="text-red-400 font-garamond text-xl mb-6 glow-text">
							{uploadError}
						</p>
						<button class="gothic-btn rounded-lg" onclick={() => fileInputEl?.click()}>
							&#128247; Upload a Photo
						</button>
					</div>
				{:else}
					<div class="gothic-border rounded-lg overflow-hidden mb-6 bg-black/60">
						<video
							bind:this={videoEl}
							autoplay
							playsinline
							class="w-full max-h-[60vh] object-cover"
						></video>
					</div>
				{/if}

				<div class="flex gap-4 justify-center flex-wrap">
					{#if !cameraFailed}
						<button class="gothic-btn rounded-lg" onclick={capturePhoto} disabled={!cameraReady}>
							{#if cameraReady}
								&#128064; Capture Thy Hand
							{:else}
								&#9764; Awakening the eye...
							{/if}
						</button>
					{/if}
					<button
						class="gothic-btn rounded-lg !bg-gray-800 !border-gray-600"
						onclick={() => fileInputEl?.click()}
					>
						&#128247; Upload Instead
					</button>
					<button
						class="gothic-btn rounded-lg !bg-gray-800 !border-gray-600"
						onclick={backToStart}
					>
						Return
					</button>
				</div>
			{:else}
				<div class="gothic-border rounded-lg overflow-hidden mb-6 bg-black/60">
					<img src={capturedImage} alt="Your captured hand" class="w-full max-h-[60vh] object-cover" />
				</div>

				{#if uploadError}
					<p class="text-red-400 font-garamond text-lg mb-4 glow-text">{uploadError}</p>
				{/if}

				<div class="flex gap-4 justify-center flex-wrap">
					<button class="gothic-btn rounded-lg" onclick={submitHand} disabled={uploading}>
						{#if uploading}
							<span class="animate-pulse-glow">&#9764; The spirits are reading...</span>
						{:else}
							&#9764; Submit to the Oracle
						{/if}
					</button>
					<button
						class="gothic-btn rounded-lg !bg-gray-800 !border-gray-600"
						onclick={retakePhoto}
						disabled={uploading}
					>
						Retake
					</button>
				</div>
			{/if}
		</div>

	<!-- ═══════════════ READING PHASE ═══════════════ -->
	{:else if phase === 'reading'}
		<div class="mx-auto max-w-3xl animate-fade-in">
			<img src="/logo.webp" alt="Ren Magi" class="mx-auto mb-6 w-28 md:w-36 drop-shadow-[0_0_20px_rgba(107,33,168,0.4)]" />
			<!-- Wash Hands Verdict -->
			{#if washResult}
				<div
					class="mb-10 text-center gothic-border rounded-lg p-8 bg-black/50 backdrop-blur-sm"
					class:!border-red-500={washResult.verdict}
					class:!border-emerald-500={!washResult.verdict}
					style={washResult.verdict
						? 'box-shadow: 0 0 30px rgba(220,38,38,0.4), inset 0 0 20px rgba(220,38,38,0.1)'
						: 'box-shadow: 0 0 30px rgba(16,185,129,0.4), inset 0 0 20px rgba(16,185,129,0.1)'}
				>
					<div class="text-5xl mb-4">
						{washResult.verdict ? '\u{1F4A7}' : '\u{2728}'}
					</div>
					<h2
						class="font-fraktur text-3xl md:text-4xl mb-4"
						class:text-red-400={washResult.verdict}
						class:text-emerald-400={!washResult.verdict}
					>
						{washResult.verdict ? 'Wash Thy Hands!' : 'Thy Hands Are Pure'}
					</h2>
					<p class="font-garamond text-xl text-gray-300 italic">
						{washResult.reason}
					</p>
				</div>
			{/if}

			<!-- The Reading -->
			{#if reading && readingVisible}
				<div class="space-y-8">
					<div class="text-center mb-8">
						<h2 class="font-fraktur text-4xl md:text-5xl text-purple-400 glow-text">
							Thy Reading
						</h2>
					</div>

					<!-- Life Path -->
					<div class="gothic-border rounded-lg p-6 bg-black/40 backdrop-blur-sm animate-fade-in" style="animation-delay: 0.2s">
						<h3 class="font-cinzel text-lg text-cyan-400 uppercase tracking-widest mb-3">
							&#9733; The Life Path &#9733;
						</h3>
						<p class="font-garamond text-xl text-gray-200 leading-relaxed">
							{reading.lifePath}
						</p>
					</div>

					<!-- Love -->
					<div class="gothic-border rounded-lg p-6 bg-black/40 backdrop-blur-sm animate-fade-in" style="animation-delay: 0.5s">
						<h3 class="font-cinzel text-lg text-pink-400 uppercase tracking-widest mb-3">
							&#9829; Matters of the Heart &#9829;
						</h3>
						<p class="font-garamond text-xl text-gray-200 leading-relaxed">
							{reading.love}
						</p>
					</div>

					<!-- Career -->
					<div class="gothic-border rounded-lg p-6 bg-black/40 backdrop-blur-sm animate-fade-in" style="animation-delay: 0.8s">
						<h3 class="font-cinzel text-lg text-amber-400 uppercase tracking-widest mb-3">
							&#9878; Worldly Pursuits &#9878;
						</h3>
						<p class="font-garamond text-xl text-gray-200 leading-relaxed">
							{reading.career}
						</p>
					</div>

					<!-- Warning -->
					<div
						class="gothic-border rounded-lg p-6 bg-black/40 backdrop-blur-sm animate-fade-in"
						style="animation-delay: 1.1s; border-color: var(--gothic-crimson); box-shadow: 0 0 15px rgba(220,38,38,0.3), inset 0 0 15px rgba(220,38,38,0.1)"
					>
						<h3 class="font-cinzel text-lg text-red-400 uppercase tracking-widest mb-3">
							&#9888; A Warning from Beyond &#9888;
						</h3>
						<p class="font-garamond text-xl text-gray-200 leading-relaxed">
							{reading.warning}
						</p>
					</div>

					<!-- Actions -->
					<div class="text-center pt-6 space-y-4 animate-fade-in" style="animation-delay: 1.4s">
						<button class="gothic-btn rounded-lg" onclick={backToStart}>
							&#9764; Consult Again &#9764;
						</button>
						<br />
						<button
							class="text-purple-400 hover:text-pink-400 transition-colors font-cinzel text-sm uppercase tracking-widest"
							onclick={showCollage}
						>
							&#9734; View the Sacred Collage &#9734;
						</button>
					</div>
				</div>
			{/if}
		</div>

	<!-- ═══════════════ COLLAGE PHASE ═══════════════ -->
	{:else if phase === 'collage'}
		<div class="mx-auto max-w-6xl animate-fade-in">
			<div class="text-center mb-8">
				<img src="/logo.webp" alt="Ren Magi" class="mx-auto mb-4 w-32 md:w-40 drop-shadow-[0_0_20px_rgba(107,33,168,0.4)]" />
				<h2 class="font-fraktur text-4xl md:text-5xl text-purple-400 glow-text mb-4">
					The Sacred Collage
				</h2>
				<p class="font-garamond text-xl text-gray-400 italic">
					All hands that have sought the Oracle's wisdom
				</p>
			</div>

			{#if loadingCollage}
				<div class="text-center py-20">
					<p class="font-cinzel text-2xl text-purple-400 animate-pulse-glow">
						&#9764; Summoning the hands from the void... &#9764;
					</p>
				</div>
			{:else if collageImages.length === 0}
				<div class="text-center py-20 gothic-border rounded-lg bg-black/40">
					<p class="font-garamond text-xl text-gray-400">
						No hands have been offered yet. Be the first to present thy hand to the Oracle.
					</p>
				</div>
			{:else}
				<div class="collage-grid">
					{#each collageImages as img}
						<img src={img} alt="A hand offered to the Oracle" loading="lazy" />
					{/each}
				</div>
			{/if}

			<div class="text-center mt-8">
				<button class="gothic-btn rounded-lg" onclick={backToStart}>
					&#9764; Return to the Oracle &#9764;
				</button>
			</div>
		</div>
	{/if}
</main>
