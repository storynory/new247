// src/routes/podcasts/[slug]/+page.server.ts
import { error } from '@sveltejs/kit';
import { getPodcastBySlug, getAllPeople } from '$lib/server/content';
import type { Person } from '$lib/types';

export function load({ params }: { params: { slug: string } }) {
	const podcast = getPodcastBySlug(params.slug);

	if (!podcast) {
		throw error(404, 'Podcast not found');
	}

	const allPeople = getAllPeople();

	const people: Person[] =
		(podcast.with ?? [])
			.map((name) => allPeople.find((p) => p.name === name))
			.filter((p): p is Person => Boolean(p)) || [];

	return {
		podcast: {
			...podcast,
			people
		}
	};
}
