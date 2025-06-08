<script lang="ts">
	import { PUBLIC_CONVEX_URL } from '$env/static/public';
	import { setupConvex } from 'convex-svelte';
	import '../app.css';

	let { children } = $props();

	setupConvex(PUBLIC_CONVEX_URL);
</script>

{@render children()}
