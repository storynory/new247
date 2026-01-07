import imageMeta from '$lib/image-manifest.json';
import { IMAGE_CONFIG } from '$lib/images/config';

type ManifestEntry = {
	width: number;
	height: number;
	sizes: number[];
	formats: string[];
};

const manifest = imageMeta as Record<string, ManifestEntry>;

export function basePath(src: string): string {
	return src.replace(/(\.\d+)?\.[^.]+$/, '');
}

export function getMeta(src: string) {
	return manifest[src] ?? null;
}

export function webpSrcset(src: string, max?: number) {
	const base = basePath(src);
	const sizes = IMAGE_CONFIG.widths.filter((w) => !max || w <= max);
	return sizes.map((w) => `${base}.${w}.webp ${w}w`).join(', ');
}

export function fallbackSrc(src: string) {
	const base = basePath(src);
	const { width, format } = IMAGE_CONFIG.fallback;
	return `${base}.${width}.${format}`;
}
