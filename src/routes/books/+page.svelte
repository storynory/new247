<script lang="ts">
	let { data } = $props();
</script>

<h1>Books</h1>

<ul>
	{#each data.books as book}
		<li class="card">
			<h2>{book.title}</h2>
			<img src={book.cover} alt={book.title} />
			<p>{@html book.summary}</p>
			<p>{book.author}</p>
		</li>
	{/each}
</ul>
