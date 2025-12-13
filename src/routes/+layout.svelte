<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	import '../app.css';
	let { children } = $props();
	import Header from '$lib/components/header/header.svelte';
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Header />

<div class="page">
	<main class="bg-light">
		{@render children()}
	</main>
	<footer class="page bg-light brd-tp clr-accent">
		<a href="/podcasts/">All Podcasts</a> *
		<a href="/feed.rss">RSS Feed for Podcast</a>
	</footer>
</div>
