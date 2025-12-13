<script lang="ts">
	import Fuse from 'fuse.js';

	// -----------------------------
	// Types
	// -----------------------------
	type PersonIndexItem = {
		type: 'person';
		slug: string;
		name: string;
		bio?: string;
	};

	type PodcastIndexItem = {
		type: 'podcast';
		slug: string;
		title: string;
		description?: string;
		with?: string[];
		date?: string;
        thumb?: string;
	};

	type SearchItem = PersonIndexItem | PodcastIndexItem;

	// -----------------------------
	// Local state
	// -----------------------------
	let query = $state('');
	let results = $state<SearchItem[]>([]);
	let allItems = $state<SearchItem[]>([]);          // <- keep original list
	let index = $state<Fuse<SearchItem> | null>(null);
	let loading = $state(true);
	let errorMessage = $state('');

	// -----------------------------
	// Load static search index.json
	// -----------------------------
	$effect(() => {
		// don't run again if already loaded
		if (index !== null) return;

		(async () => {
			try {
				const res = await fetch('/api/search-index');

				if (!res.ok) {
					throw new Error('Failed to load search index');
				}

				const data = await res.json();

				const items: SearchItem[] = [
					...(data.people ?? []),
					...(data.podcasts ?? [])
				];

				allItems = items; // <- keep full list

				index = new Fuse(items, {
					keys: ['name', 'bio', 'title', 'description', 'with'],
					threshold: 0.3
				});

				// Show all items initially
				results = items;
			} catch (err: any) {
				errorMessage = err?.message ?? 'Could not load search index';
			} finally {
				loading = false;
			}
		})();
	});

	// -----------------------------
	// Run search when query changes
	// -----------------------------
	$effect(() => {
		if (!index) return;

		const trimmed = query.trim();

		if (trimmed === '') {
			// show everything when no search term
			results = allItems;
		} else {
			results = index.search(trimmed).map((r) => r.item);
		}
	});
</script>

<h1 class="txt-center">Search</h1>

{#if errorMessage}
	<p>{errorMessage}</p>
{:else}
	{#if loading}
		<p>Loading search index…</p>
	{:else}
		<form class="form -m -p p-lg">
			<input
				type="search"
                class="input -p -m p-lrg"
				placeholder="Search people & podcasts…"
				bind:value={query}
				autocomplete="off"
			>
	</form>

		{#if results.length === 0}
			<p>No results found.</p>
		{:else}
        <section class="-m -p">
			<ul>
				{#each results as item}
					<li>
						{#if item.type === 'person'}
							<a href={`/people/${item.slug}`}>
								<strong>Person — {item.name}</strong>
							</a>
							{#if item.bio}
								<div>{item.bio}</div>
							{/if}

						{:else if item.type === 'podcast'}
                        <article class="card -p">
							<a href={`/podcasts/${item.slug}`}>
								<h2>Podcast — {item.title}</h2>
							</a>
							{#if item.with && item.with.length > 0}
								<div>With {item.with.join(', ')}</div>
							{/if}
                            {#if item.thumb}
								 <img src={item.thumb} alt="{item.title}" width="640" height="300"/>
							{/if}
							{#if item.description}
								<div>{item.description}</div>
							{/if}
                            </article>
						{/if}
                        
					</li>
				{/each}
			</ul>
            </section>
		{/if}
	{/if}
{/if}
