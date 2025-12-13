import { getAllPodcasts } from '$lib/server/content';

export function load() {
	const podcasts = getAllPodcasts();

	return {
		podcasts
	};
}
