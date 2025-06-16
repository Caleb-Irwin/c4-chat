<script lang="ts">
	import { useChatManager } from '$lib/chats.svelte';
	import { useUser } from '$lib/user.svelte';

	let {} = $props();

	const user = useUser();
	const chatManager = useChatManager();
	$effect(() => {
		if (chatManager.threadId !== null) chatManager.setup(null, null);
	});
</script>

<div class="h-full grid place-content-center">
	<h2 class="text-center text-3xl font-semibold mt-8">
		How can I help you{user.row?.name ? `, ${user.row.name.split(' ')[0]}` : ''}?
	</h2>
</div>
