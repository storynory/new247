<script lang="ts">
	let { data } = $props();

	let person = data.person;
</script>

<article>
	<h1>{person.name}</h1>

	{#if person.portrait}
		<p>
			<img src={person.portrait} alt={`Portrait of ${person.name}`} />
		</p>
	{/if}

	{#if person.bio}
		<p>{person.bio}</p>
	{/if}


</article>
