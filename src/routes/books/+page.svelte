<script lang="ts">
	import Picture from '$lib/components/PictureThumb.svelte';
	import '$lib/types.ts';
	let { data } = $props();
</script>

<h1>Books</h1>

<ul class="grid">
	{#each data.people as person}
		{#if person.name === 'David Edmonds'}
			{#each person.books as book}
				<li class="book txt-center">
					<header class="full txt-white -p">
						<h2 class="txt-white">{book.title}</h2>
					</header>
					<div><Picture src={book.cover} alt={book.title} /></div>

					<p>{@html book.summary}</p>
					<p class="small txt-white">
						Published:
						{book.date ? new Date(book.date).toLocaleDateString('en-GB') : ''}
					</p>
					<p class="small txt-white">{book.publisher}</p>

					{#if book.amazon}
						<p class="-p">
							<a class="-p btn bg-white" href={book.amazon}>Buy on Amazon UK</a>
						</p>
						<p class="-p">
							<a class="-p btn" href={book.amazon.replace('amazon.co.uk', 'amazon.com')}
								>Buy on Amazon USA</a
							>
						</p>
					{/if}
				</li>
			{/each}
		{/if}
	{/each}
</ul>

<style>
	.book {
		max-width: 400px;
		padding: 1em;
		background: var(--frog-dark);
		color: ivory;
		border-radius: 4px;
		overflow: hidden;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
		color: ivory;
	}
</style>
