<script lang="ts">
	import ChatInput from './chat-input.svelte';

	let {} = $props();
</script>

<div class="flex-grow w-full max:h-screen overflow-hidden flex justify-center">
	<div class="flex-grow w-full overflow-hidden flex flex-col pb-0 -mb-2">
		<div class="flex-grow w-full flex justify-center max-h-screen overflow-x-scroll">
			<div class="max-w-3xl w-full px-4">
				<div class="h-8"></div>

				<div class="flex justify-end pt-8">
					<div class="text-right bg-secondary/50 max-w-[80%] px-4 py-3 rounded-xl">Hello World</div>
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
				<div class="flex justify-end pt-8">
					<div class="text-right bg-secondary/50 max-w-[80%] px-4 py-3 rounded-xl">Hello World</div>
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
				<div class="flex justify-end pt-8">
					<div class="text-right bg-secondary/50 max-w-[80%] px-4 py-3 rounded-xl">Hello World</div>
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
				<div class="flex justify-end pt-8">
					<div class="text-right bg-secondary/50 max-w-[80%] px-4 py-3 rounded-xl">Hello World</div>
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
				<div class="flex justify-end pt-8">
					<div class="text-right bg-secondary/50 max-w-[80%] px-4 py-3 rounded-xl">Hello World</div>
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
				<div class="h-32"></div>
			</div>
		</div>
		<div class="w-full flex justify-center">
			<div class="relative w-full max-w-3xl">
				<div class="absolute -bottom-2 w-full px-4">
					<ChatInput />
				</div>
			</div>
		</div>
	</div>
</div>
