import { getAllPodcasts } from '$lib/server/content';
   export const prerender = true
export function load() {
    const podcasts = getAllPodcasts();

    return {
        podcasts
    };
}
