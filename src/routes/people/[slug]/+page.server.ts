import { error } from '@sveltejs/kit';
import { getPersonBySlug } from '$lib/server/content';

export function load({ params }: { params: { slug: string } }) {
	const person = getPersonBySlug(params.slug);

	if (!person) {
		throw error(404, 'Person not found');
	}

	return {
		person
	};
}
