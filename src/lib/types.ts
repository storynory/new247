export type Person = {
	slug: string;
	name: string;
	bio: string;
	portrait: string;
	body: string;
	bodyHtml: string;
	// optional – if you want books too:
	books?: {
		title: string;
		author?: string;
		publisher?: string;
		cover?: string;
		amazon_uk?: string;
		amazon_us?: string;
		summary?: string;
	}[];
};

export type Podcast = {
	slug: string;
	title: string;
	description: string;
	date: string;
	thumb: string;
	mp3: string;
	duration: string;
	length: string;
	with: string[];
	body: string;
	bodyHtml: string;
	people?: Person[]; // 👈 new
};
