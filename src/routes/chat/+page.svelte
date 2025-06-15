<script lang="ts">
	import { useChat } from '$lib/chats.svelte';

	let {} = $props();

	useChat().changeThread(null);
</script>
