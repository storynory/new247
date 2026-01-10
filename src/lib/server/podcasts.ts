import fs from 'fs';
import path from 'path';

import type { Podcast } from '$lib/types';
import { CONTENT_ROOT, listSlugs, readMarkdownFile, toHtml, bySlug, encodePath } from './core';

/**
 * If front-matter accidentally contains width-suffixed URLs like:
 *   /uploads/foo.960.jpg
 * normalise back to the original:
 *   /uploads/foo.jpg
 *
 * Also keeps your existing "spaces to %20" behaviour (encodePath),
 * but avoids double-encoding by NOT encoding % signs etc here.
 */
function normaliseUploadOriginal(value: unknown): string {
	if (typeof value !== 'string') return '';
	let s = value.trim();
	if (!s) return '';

	// keep external URLs untouched
	if (!s.startsWith('/uploads/')) return encodePath(s);

	// normalise: remove ".{number}" before extension
	// /uploads/foo.960.jpg -> /uploads/foo.jpg
	s = s.replace(/(\.\d+)(\.[^.\/]+)$/, '$2');

	// encode spaces only (your current behaviour)
	return encodePath(s);
}

function filePathForPodcastSlug(slug: string): string {
	// listSlugs can return nested slugs like "series/episode-1"
	return path.join(CONTENT_ROOT, 'podcasts', `${slug}.md`);
}

export function getAllPodcasts(): Podcast[] {
	const slugs = listSlugs('podcasts');

	return slugs
		.map((slug) => {
			const filePath = filePathForPodcastSlug(slug);
			if (!fs.existsSync(filePath)) return null; // skipMissing: true behaviour

			const { data, content } = readMarkdownFile(filePath);
			const d: any = data ?? {};

			const length = (d.length ?? '').toString().replace(/,/g, '');
			const body = content ?? '';
			const bodyHtml = toHtml(body);

			return {
				slug,
				title: d.title ?? slug,
				description: d.description ?? '',
				date: d.date ?? '',
				thumb: normaliseUploadOriginal(d.thumb),
				mp3: encodePath(d.mp3), // keep your existing mp3 encoding behaviour
				duration: d.duration ?? '',
				length: length ?? '',
				with: Array.isArray(d.with) ? d.with : d.with ? [d.with] : [],
				body,
				bodyHtml
			} satisfies Podcast;
		})
		.filter(Boolean) as Podcast[];
}

export function getPodcastBySlug(slug: string): Podcast | undefined {
	return bySlug(getAllPodcasts(), slug);
}
