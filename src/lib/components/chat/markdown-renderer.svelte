<script lang="ts">
	import Markdown from 'svelte-exmarkdown';
	import remarkMath from 'remark-math';
	import rehypeKatex from 'rehype-katex';
	import 'highlight.js/styles/github.css';
	import rehypeHighlight from 'rehype-highlight';
	import { common } from 'lowlight';
	import 'katex/dist/katex.min.css'; // KaTeX styling :contentReference[oaicite:2]{index=2}
	import type { Plugin } from 'svelte-exmarkdown';

	interface Props {
		md: string;
	}

	let { md }: Props = $props();

	// import { onMount } from 'svelte';
	// import throttle from 'lodash-es/throttle';
	// export let stream = async (push: (chunk: string) => void) => {};
	// const update = throttle((delta: string) => (md += delta), 80); // ~12 fps
	// onMount(() => { stream(update); });
	// let md = $state('');            // full markdown so far

	const plugins: Plugin[] = [
		{ remarkPlugin: [remarkMath], rehypePlugin: [rehypeKatex] },
		{ rehypePlugin: [rehypeHighlight, { ignoreMissing: true, languages: { ...common } }] }
	];
</script>

<div class="prose dark:prose-invert">
	<Markdown {md} {plugins} />
</div>
