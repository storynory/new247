import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { IMAGE_CONFIG } from '$lib/images/config';

// Keep Marked synchronous
marked.setOptions({ async: false });

export const CONTENT_ROOT = path.resolve('content');

export function collectionPath(collection: string) {
	return path.join(CONTENT_ROOT, collection);
}

export function readMarkdownFile(filePath: string) {
	const raw = fs.readFileSync(filePath, 'utf-8');
	const { data, content } = matter(raw);
	return { data, content };
}

/**
 * Slugs for markdown files in a collection folder.
 * - top-level: people/alice.md -> "alice"
 * - nested: pages/about/mission.md -> "about/mission"
 */
export function listSlugs(collection: string): string[] {
	const dir = collectionPath(collection);
	if (!fs.existsSync(dir)) return [];

	return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		if (entry.isDirectory()) {
			const subdir = path.join(dir, entry.name);
			if (!fs.existsSync(subdir)) return [];

			return fs
				.readdirSync(subdir)
				.filter((f) => f.endsWith('.md') || f.endsWith('.markdown'))
				.map((filename) => path.join(entry.name, filename.replace(/\.(md|markdown)$/, '')));
		}

		if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.markdown'))) {
			return entry.name.replace(/\.(md|markdown)$/, '');
		}

		return [];
	});
}

/**
 * Encode each URL path segment safely.
 * - Safe to run on already-encoded strings (prevents %2520)
 * - Preserves slashes
 */
export function encodeUrlPath(value: unknown): string {
	if (typeof value !== 'string') return '';
	const s = value.trim();
	if (!s) return '';

	return s
		.split('/')
		.map((seg) => {
			try {
				return encodeURIComponent(decodeURIComponent(seg));
			} catch {
				return encodeURIComponent(seg);
			}
		})
		.join('/');
}

/**
 * Convert any /uploads/... image URL to the *generated fallback* variant.
 * This prevents broken links like *.960.jpg or *.320.jpg after the pipeline change.
 */
export function toUploadFallback(src: string): string {
	if (!src.startsWith('/uploads/')) return src;

	// encode only the part after /uploads/
	const rest = src.slice('/uploads/'.length);
	const encoded = '/uploads/' + encodeUrlPath(rest);

	// strip ".{width}.{ext}" OR ".{ext}"
	const base = encoded.replace(/(\.\d+)?\.[^.\/]+$/, '');

	const { width, format } = IMAGE_CONFIG.fallback;
	return `${base}.${width}.${format}`;
}

/**
 * Rewrite <img src="/uploads/..."> in generated HTML to use fallback outputs.
 */
export function normaliseHtmlImages(html: string): string {
	if (!html) return html;

	return html.replace(/<img([^>]*?)\s+src="([^"]+)"([^>]*?)>/g, (_m, a, src, b) => {
		// only rewrite uploads; leave external images alone
		const fixed = src.startsWith('/uploads/') ? toUploadFallback(src) : src;
		return `<img${a} src="${fixed}"${b}>`;
	});
}

export function toHtml(markdown: string): string {
	if (!markdown) return '';
	const html = marked.parse(markdown) as string;
	return normaliseHtmlImages(html);
}

/**
 * Backwards-compatible name (if you already call encodePath elsewhere).
 * You can remove this once you've updated call sites.
 */
export const encodePath = encodeUrlPath;

/**
 * Small convenience to avoid repeating `.find(...)` everywhere.
 */
export function bySlug<T extends { slug: string }>(items: T[], slug: string): T | undefined {
	return items.find((i) => i.slug === slug);
}
