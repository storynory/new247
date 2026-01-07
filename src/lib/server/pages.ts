import fs from 'fs';
import path from 'path';
import { collectionPath, readMarkdownFile, toHtml, encodePath, bySlug } from './core';
import { transformImagesToPicture } from './html';

export interface Page {
	slug: string;
	title: string;
	body: string;
	featuredImage?: string;
	bodyHtml?: string;
}

export function getAllPages(): Page[] {
	const folder = collectionPath('pages');
	if (!fs.existsSync(folder)) return [];

	const entries = fs.readdirSync(folder, { withFileTypes: true });
	const pages: Page[] = [];

	for (const entry of entries) {
		const filePath = entry.isDirectory()
			? path.join(folder, entry.name, 'index.md')
			: path.join(folder, entry.name);

		if (!filePath.endsWith('.md') || !fs.existsSync(filePath)) continue;

		const slug = entry.isDirectory() ? entry.name : entry.name.replace(/\.md$/, '');
		const { data, content } = readMarkdownFile(filePath);

		pages.push({
			slug,
			title: data.title ?? slug,
			body: content,
			featuredImage: data.featuredImage ? encodePath(data.featuredImage) : undefined,
			bodyHtml: transformImagesToPicture(toHtml(content))
		});
	}

	return pages;
}

export function getPageBySlug(slug: string): Page | undefined {
	return bySlug(getAllPages(), slug);
}
