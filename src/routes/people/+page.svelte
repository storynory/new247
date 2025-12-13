<script lang="ts">
	let { data } = $props();

	let people = data.people;
</script>

<h1>People</h1>

<ul>
	{#each people as person}
		<li>
			<a href={`/people/${person.slug}`}>
				{person.name}
			</a>
		</li>
	{/each}
</ul>
