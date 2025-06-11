<script lang="ts">
	import type { Snippet } from 'svelte';
	import * as Card from '$lib/components/ui/card/index.js';

	let {}: {} = $props();
</script>

<Card.Root>
	<textarea name="chat-input" id="chat-input"></textarea>
</Card.Root>
