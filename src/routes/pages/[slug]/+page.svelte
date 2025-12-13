<script lang="ts">
	import Picture from '$lib/components/PictureWithSizes.svelte';
	import { marked } from 'marked';
	let data = $props();
	let pg = data.data.page;
	const html = marked.parse(pg.body);
	console.log(pg);
</script>

<div class="page">
	<article>
		<h1>{pg.title}</h1>
		{#if pg.featuredImage}
			<Picture
				src={pg.featuredImage}
				alt={`Artwork for ${pg.featuredImage.title}`}
				loading="eager"
				fetchPriority="high"
				class="episode-art"
			></Picture>
		{/if}

		{@html html}
	</article>
</div>

<style>
	.page {
		display: block;
		position: relative;
		margin: auto;
		max-width: 800px;
		padding: 1em;
	}
</style>
