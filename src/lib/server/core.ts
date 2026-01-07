import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

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

export function toHtml(markdown: string): string {
	return markdown ? (marked.parse(markdown) as string) : '';
}

// ---- SAFETY HELPER: URL-encode spaces in media paths ----
export function encodePath(value: unknown): string {
	if (typeof value !== 'string') return '';
	return value.trim().replace(/ /g, '%20');
}

/**
 * Small convenience to avoid repeating `.find(...)` everywhere.
 */
export function bySlug<T extends { slug: string }>(items: T[], slug: string): T | undefined {
	return items.find((i) => i.slug === slug);
}
