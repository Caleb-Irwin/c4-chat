<script lang="ts">
	import ChatInput from './chat-input.svelte';

	let {} = $props();
</script>

<div class="flex-grow w-full overflow- max:h-screen flex justify-center">
	<div class="flex-grow w-full overflow-hidden flex flex-col pb-0">
		<div class="flex-grow w-full flex justify-center max-h-screen overflow-x-scroll px-2">
			<div class="max-w-3xl w-full px-2">
				<div class="h-8"></div>

				{#each Array(20) as _}
					<div class="flex justify-end pt-8">
						<div class="text-right bg-secondary/50 max-w-[80%] px-4 py-3 rounded-xl">
							Hello World
						</div>
					</div>
					<div>
						<p>Hello World from AI</p>
					</div>
					<div class="flex justify-end pt-8">
						<div class="text-right bg-secondary/50 max-w-[80%] px-4 py-3 rounded-xl">
							Who are you?
						</div>
					</div>
					<div>
						<p>I'm C4 Chat.</p>
					</div>
				{/each}

				<div class="h-[188px]"></div>
			</div>
		</div>
		<div class="w-full flex justify-center px-2">
			<div class="relative w-full max-w-3xl">
				<div class="absolute bottom-0 w-full">
					<ChatInput />
				</div>
			</div>
		</div>
	</div>
</div>
