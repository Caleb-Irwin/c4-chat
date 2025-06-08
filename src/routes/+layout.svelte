<script lang="ts">
	import { PUBLIC_CONVEX_URL } from '$env/static/public';
	import { setupConvex } from 'convex-svelte';
	import '../app.css';
	import AuthProvider from './AuthProvider.svelte';

	let { children, data } = $props();

	setupConvex(PUBLIC_CONVEX_URL);
</script>

<h1 class="text-2xl text-center p-2">C4 Chat</h1>

{#await data.authState then authState}
	<AuthProvider {authState}>
		{@render children()}
	</AuthProvider>
{/await}
