import { getAllPeople } from '$lib/server/content';

export function load() {
	const people = getAllPeople();

	return {
		people
	};
}
