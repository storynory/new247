import { getAllBooks } from '$lib/server/content';

export function load() {
	const books = getAllBooks();

	return {
		books
	};
}
