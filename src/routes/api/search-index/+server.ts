import { json } from '@sveltejs/kit';
import { getAllPeople, getAllPodcasts } from '$lib/server/content';

export const prerender = true; // <- important for static adapter

export function GET() {
	const people = getAllPeople();
	const podcasts = getAllPodcasts();

	// Keep just what you need for search
	const peopleIndex = people.map((p) => ({
		type: 'person' as const,
		slug: p.slug,
		name: p.name,
		bio: p.bio
	}));

	const podcastsIndex = podcasts.map((ep) => ({
		type: 'podcast' as const,
		slug: ep.slug,
		title: ep.title,
		description: ep.description,
		with: ep.with,
        date: ep.date,
        thumb: ep.thumb
	}));

	return json({
		// people: peopleIndex,
		podcasts: podcastsIndex
	});
}
