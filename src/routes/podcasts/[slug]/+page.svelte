<script lang="ts">
	import Picture from '$lib/components/PictureHero.svelte';
	import Player from '$lib/components/AudioPlayer.svelte';

	let { data } = $props();

	const podcast = $derived(data.podcast);
</script>

<svelte:head>
	<title>{podcast.title}</title>
	<meta name="description" content={podcast.description} />
</svelte:head>
<div class="articleLayout">
	<article>
		<div class="txt-center-mob">
			<h1>{podcast.title}</h1>

			{#if podcast.with && podcast.with.length > 0}
				<p class="brand-font">
					With {podcast.with.join(', ')}
				</p>
			{/if}
		</div>

		{#if podcast.thumb}
			<Picture src={podcast.thumb} alt="Artwork for {podcast.title}" />
		{/if}

		{#if podcast.mp3}
			<Player mp3="https://traffic.libsyn.com/philosophy247/{podcast.mp3}" />
		{/if}

		{#if podcast.bodyHtml}
			{@html podcast.bodyHtml}
		{/if}
	</article>

	<section class="guests side">
		{#if podcast.people && podcast.people.length > 0}
			<h2 class="txt-center">
				About the guest{podcast.people.length > 1 ? 's' : ''}
			</h2>

			{#each podcast.people as person}
				<aside class="guest small">
					{#if person.portrait}
						<Picture
							src={person.portrait}
							alt={person.name}
							class="guest-portrait"
							variant="sidebar"
						/>
					{/if}

					{#if person.bio}
						{@html person.bio}
					{/if}

					{#if person.books && person.books.length > 0}
						<h4>Books</h4>
						<ul>
							{#each person.books as book}
								<li>
									<strong>{book.title}</strong>
									{#if book.author}
										<span> by {book.author}</span>
									{/if}
									{#if book.publisher}
										<span> — {book.publisher}</span>
									{/if}
								</li>
							{/each}
						</ul>
					{/if}
				</aside>
			{/each}
		{/if}
	</section>
</div>
