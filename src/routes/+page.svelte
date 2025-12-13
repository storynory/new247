<script lang="ts">
	import Picture from '$lib/components/PictureWithSizes.svelte';

	// front page
	let { data } = $props();
	let podcasts = data.podcasts;
	let visible = $state(12);

	function loadMore() {
		visible = Math.min(visible + 12, podcasts.length);
	}
</script>

<p class="txt-center small">
	<b class="brand-font">
		Leading thinkers interviewed by David Edmonds
		<a href="https://x.com/davidedmonds100">@DavidEdmonds100</a>
	</b>
</p>

<ul class="grid">
	{#each podcasts.slice(0, visible) as podcast, i}
		<li class="card bg-white">
			{#if podcast.thumb}
				<a href={`/podcasts/${podcast.slug}`}>
					<Picture
						src={podcast.thumb}
						alt={podcast.title}
						loading={i === 0 ? 'eager' : 'lazy'}
						fetchPriority={i === 0 ? 'high' : 'auto'}
						sizes="(min-width: 1200px) 25vw, (min-width: 768px) 33vw, 100vw"
						maxWidth={640}
						class="card-image"
					></Picture>
				</a>
			{/if}

			<a href="/podcasts/{podcast.slug}">
				<h2 class="capitol txt-center">{podcast.title}</h2>
			</a>

			<p class="brand-font txt-center small">
				With {podcast.with.join(', ')}.
			</p>

			<p class="txt-center">
				<a href="/podcasts/{podcast.slug}">
					{@html podcast.description}
				</a>
			</p>
		</li>
	{/each}
</ul>
{#if visible < podcasts.length}
	<div class="page txt-center">
		<button class="btn" onclick={loadMore}>Load More</button>
	</div>
{/if}

<style>
	h2 {
		color: var(--frog-dark);
	}
</style>
