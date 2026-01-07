import path from 'path';
import type { Person } from '$lib/types';
import { collectionPath, listSlugs, readMarkdownFile, toHtml, encodePath, bySlug } from './core';
import { transformImagesToPicture } from './html';

export function getAllPeople(): Person[] {
	const folder = collectionPath('people');
	const slugs = listSlugs('people');

	return slugs.map((slug) => {
		const fullPath = path.join(folder, `${slug}.md`);
		const { data, content } = readMarkdownFile(fullPath);

		const bodyHtml = transformImagesToPicture(toHtml(content));

		const books = Array.isArray(data.books) ? data.books : [];

		return {
			slug,
			name: data.name ?? slug,
			bio: data.bio ?? '',
			portrait: encodePath(data.portrait),
			body: content,
			bodyHtml,
			books: books.map((b: any) => ({
				title: b.title ?? '',
				author: b.author ?? '',
				publisher: b.publisher ?? '',
				date: b.date ?? null,
				amazon: b.amazon ?? '',
				summary: b.summary ?? '',
				cover: encodePath(b.cover)
			}))
		};
	});
}

export function getPersonBySlug(slug: string): Person | undefined {
	return bySlug(getAllPeople(), slug);
}
