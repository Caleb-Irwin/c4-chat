<script lang="ts">
	import Paperclip from '@lucide/svelte/icons/paperclip';
	import Button from '../ui/button/button.svelte';

	let props: {
		disabled: boolean;
		setUploading?: (uploading: boolean) => void;
		acceptImages: boolean;
	} = $props();

	let file = $state<File | null>(null);
	let inputElement: HTMLInputElement | null = null;
	let uploading = $state(false);

	function uploadAttachment() {
		if (file) {
			uploading = true;
			fetch(`/chat/uploadAttachment?filename=${encodeURIComponent(file?.name ?? '')}`, {
				method: 'POST',
				headers: { 'Content-Type': file.type },
				body: file
			})
				.catch((error) => {
					console.error('Error uploading attachment:', error);
					alert(`Failed to upload attachment. Please try again. (Error: ${error.message})`);
				})
				.finally(() => {
					uploading = false;
					file = null;
					if (inputElement) {
						inputElement.value = '';
					}
				});
		}
	}
	$effect(() => {
		if (props.setUploading) {
			props.setUploading(uploading);
		}
	});
</script>

<Button
	variant="outline"
	size="sm"
	class="ml-1 rounded-full w-8 sm:w-auto flex-shrink-0 bg-transparent dark:bg-transparent border-accent-foreground/20 dark:border-accent-foreground/20 hover:bg-accent/80 dark:hover:bg-accent/80"
	disabled={props.disabled || uploading}
	onclick={() => inputElement?.click()}
>
	<Paperclip />
	<span class="hidden sm:inline"> Attach </span>
</Button>

<input
	class="hidden"
	type="file"
	accept="application/pdf{props.acceptImages ? ',image/jpeg,image/png' : ''}"
	bind:this={inputElement}
	onchange={(event: any) => {
		file = event?.target?.files?.[0] ?? null;
		uploadAttachment();
	}}
/>
