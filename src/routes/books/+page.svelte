<script lang="ts">
	let { data } = $props();
</script>

<h1>Books</h1>

<ul>
	{#each data.people as person}
		{#if person.name == 'David Edmonds'}
			{#each person.books as book}
				<li class="card txt-center">
					<header class="full -p">
						<h2>{book.title}</h2>
					</header>
					<img src={book.cover} alt={book.title} />
					<p>{@html book.summary}</p>
					<p class="small">Published: {new Date(book.date).toLocaleDateString('en-GB')}</p>
					<p class="small">{book.publisher}</p>
				</li>
			{/each}
		{/if}
	{/each}
</ul>

<style>
	.card {
		max-width: 400px;
		margin: auto;
		background-color: white;
		padding: 1em;
	}
	.card img {
		border: 1px solid grey;
	}
</style>
