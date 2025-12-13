<script lang="ts">
	let { data } = $props();
	let podcasts = data.podcasts;
	// sorted list (reactive, but does NOT mutate the original array)
	let sorted = $derived([...podcasts].sort((a, b) => a.title.localeCompare(b.title)));
</script>

<h1>Podcasts</h1>

<ul>
	{#each sorted as podcast}
		<li class="-p bg-gray -m-y">
			<a href="/podcasts/{podcast.slug}">
				<strong>{podcast.title}</strong>
				{#if podcast.with && podcast.with.length > 0}
					<span> — with {podcast.with.join(', ')}</span>
				{/if}
			</a>
		</li>
	{/each}
</ul>
