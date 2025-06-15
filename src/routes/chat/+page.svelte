<script lang="ts">
	import { useChat } from '$lib/chats.svelte';

	let {} = $props();

	useChat()._addInitialData(null);
</script>
