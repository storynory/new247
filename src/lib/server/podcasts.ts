import type { Podcast } from '$lib/types';
import { loadMarkdownRecords, getBySlug } from './_loader';
import { encodePath } from './_images';

export function getAllPodcasts(): Podcast[] {
	return loadMarkdownRecords('podcasts', { skipMissing: true }).map((r) => {
		const d = r.data ?? {};
		const length = (d.length ?? '').toString().replace(/,/g, '');

		return {
			slug: r.slug,
			title: d.title ?? r.slug,
			description: d.description ?? '',
			date: d.date ?? '',
			thumb: encodePath(d.thumb),
			mp3: encodePath(d.mp3),
			duration: d.duration ?? '',
			length: length ?? '',
			with: Array.isArray(d.with) ? d.with : d.with ? [d.with] : [],
			body: r.body,
			bodyHtml: r.bodyHtml
		};
	});
}

export function getPodcastBySlug(slug: string): Podcast | undefined {
	return getBySlug(getAllPodcasts(), slug);
}
