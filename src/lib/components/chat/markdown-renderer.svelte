<script lang="ts">
	import Markdown from 'svelte-exmarkdown';
	import remarkMath from 'remark-math';
	import rehypeKatex from 'rehype-katex';
	import rehypeHighlight from 'rehype-highlight';
	import { common } from 'lowlight';
	import { gfmPlugin } from 'svelte-exmarkdown/gfm';
	import type { Plugin } from 'svelte-exmarkdown';
	import 'katex/dist/katex.min.css';
	import 'highlight.js/styles/github-dark.min.css';
	import throttle from 'lodash-es/throttle';
	import { browser } from '$app/environment';

	interface Props {
		md: string;
	}

	let { md }: Props = $props();

	let markdown = $state(md);

	const plugins: Plugin[] = [
		{ remarkPlugin: [remarkMath], rehypePlugin: [rehypeKatex] },
		{ rehypePlugin: [rehypeHighlight, { ignoreMissing: true, languages: { ...common } }] },
		gfmPlugin()
	];

	const update = throttle((newMd: string) => (markdown = newMd), 80);
	$effect(() => {
		if (browser) update(md);
	});
</script>

<div class="prose dark:prose-invert">
	<Markdown md={markdown} {plugins} />
</div>

<style>
</style>
