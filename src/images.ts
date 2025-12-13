import manifest from '$lib/image-manifest.json';

type ImageEntry = {
	width: number | null;
	height: number | null;
	sizes: number[];
	formats: string[];
};

export function getImage(src: string): ImageEntry | null {
	return (manifest as Record<string, ImageEntry>)[src] ?? null;
}

export function srcset(src: string, widthList: number[], format: string) {
	const base = src.replace(/\.[^.]+$/, '');
	return widthList.map((w) => `${base}.${w}.${format} ${w}w`).join(', ');
}
