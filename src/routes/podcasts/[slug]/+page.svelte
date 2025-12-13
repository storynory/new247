<script lang="ts">
	
	import Picture from '$lib/components/PictureWithSizes.svelte';
	import PortraitPicture from '$lib/components/PortraitPicture.svelte';

	let { data } = $props();
	let podcast = data.podcast;
</script>

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
			<p>
				<Picture
					src={podcast.thumb}
					alt={`Artwork for ${podcast.title}`}
					loading="eager"
					fetchPriority="high"
					class="episode-art"
				></Picture>
			</p>
		{/if}

		{#if podcast.mp3}
			<p>
				<audio
					controls
					src={`https://traffic.libsyn.com/philosophy247/${podcast.mp3}`}
				></audio>
			</p>
		{/if}

		{#if podcast.bodyHtml}
			{@html podcast.bodyHtml}
		{/if}
	</article>

	<section
class="guests side">
		{#if podcast.people && podcast.people.length > 0}

			<h2 class="txt-center">
				About the guest{podcast.people.length > 1 ? 's' : ''}
			</h2>

			{#each podcast.people as person}
				<aside class="guest small">
					{#if person.portrait}
					
							<PortraitPicture
								src={person.portrait}
								alt={person.name}
								class="guest-portrait"
								loading="lazy"
							></PortraitPicture>
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


  