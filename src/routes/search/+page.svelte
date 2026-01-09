<script lang="ts">
	import Picture from '$lib/components/PictureThumb.svelte';
	import Fuse from 'fuse.js';
	import IconSearch from '$lib/icons/IconSearch.svelte';
	import type { SearchResult } from '$lib/types';

	// -----------------------------
	// Local state
	// -----------------------------
	let query = $state('');
	let loading = $state(true);
	let errorMessage = $state('');
	let results: SearchResult[] = $state([]);
	let allItems: SearchResult[] = $state([]);
	let index = $state<Fuse<SearchResult> | null>(null);
	let inputEl = $state<HTMLInputElement | null>(null);
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

				const items: SearchResult[] = [...(data.people ?? []), ...(data.podcasts ?? [])];

				allItems = items; // <- keep full list

				index = new Fuse(items, {
					keys: ['name', 'bio', 'title', 'description', 'with'],
					threshold: 0.3,
					distance: 400
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

	function onKeydown(e: KeyboardEvent) {
		// Ignore if typing in another input/textarea
		if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

		if (e.key === '/') {
			e.preventDefault();
			inputEl?.focus();
		}

		if (e.key === 'Escape') {
			inputEl?.blur();
		}
	}
</script>

<svelte:head>
	<title>Search Philosophy 247</title>
	<meta name="description" content="Search Podcasts on ethics and issues of our times" />
</svelte:head>
<svelte:window onkeydown={onKeydown} />
{#if errorMessage}
	<p>{errorMessage}</p>
{:else if loading}
	<p>Loading search index…</p>
{:else}
	<div class="search">
		<span class="search-icon">
			<IconSearch></IconSearch>
		</span>

		<input
			bind:this={inputEl}
			type="search"
			class="search-input"
			placeholder="Search…"
			bind:value={query}
			autocomplete="off"
		/>
	</div>

	{#if results.length === 0}
		<p>No results found.</p>
	{:else}
		<section class="-m -p">
			<ul class="search-results">
				{#each results as item}
					<li class="search-row">
						{#if item.type === 'person'}
							<a class="search-link" href={`/people/${item.slug}`}>
								<span class="search-icon">👤</span>

								<span class="search-text">
									<strong>{item.name}</strong>
									{#if item.bio}
										<span class="snippet">{item.bio}</span>
									{/if}
								</span>
							</a>
						{:else if item.type === 'podcast'}
							<a class="search-link" href={`/podcasts/${item.slug}`}>
								<span class="search-thumb">
									{#if item.thumb}
										<Picture src={item.thumb} alt={item.title} />
									{:else}
										🎧
									{/if}
								</span>

								<span class="search-text">
									<strong>{item.title}</strong>

									{#if item.with?.length}
										<span class="meta">
											With {item.with.join(', ')}
										</span>
									{/if}

									{#if item.description}
										<span class="snippet">{item.description}</span>
									{/if}
								</span>
							</a>
						{/if}
					</li>
				{/each}
			</ul>
		</section>
	{/if}
{/if}

<style>
	.search {
		position: relative;
		width: 100%;
	}

	.search-icon {
		position: absolute;
		left: 0.75rem;
		top: 50%;
		transform: translateY(-50%);
		color: #777;
		pointer-events: none;
		display: flex;
		align-items: center;
	}

	.search-input {
		width: 100%;
		padding: 0.5em;
		padding-left: 2.5em;
		border: 1px solid gray;
		border-radius: 3px;
	}

	.search-input::placeholder {
		color: #333;
	}

	.search-results {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.search-row {
		border-bottom: 1px solid #eee;
	}

	.search-link {
		display: flex;
		gap: 0.75rem;
		padding: 0.75rem 0;
		text-decoration: none;
	}

	.search-link:hover strong {
		text-decoration: underline;
	}

	.search-icon,
	.search-thumb {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.search-text {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.meta {
		font-size: 0.85em;
		color: #666;
	}

	.snippet {
		font-size: 0.9em;
		color: #444;
	}

	@media (max-width: 500px) {
		li {
			padding-right: 1em;
		}
		.search-thumb {
			max-width: 200px;
		}
	}
</style>
