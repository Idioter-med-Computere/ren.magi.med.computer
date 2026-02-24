<script lang="ts">
	import './layout.css';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href="/logo.webp" /></svelte:head>
{@render children()}
