import { load as loadHtml } from 'cheerio';
import { IMAGE_CONFIG } from '$lib/images/config';
import imageMeta from '$lib/image-sizes.json';

type ManifestEntry = {
	width: number | null;
	height: number | null;
	sizes: number[];
	formats: string[];
};

const manifest = imageMeta as Record<string, ManifestEntry>;

function encodeUrlPath(p: string): string {
	return p
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

function normaliseUploadSrc(src: string): string {
	let s = src.trim();

	// normalise "uploads/foo.jpg" -> "/uploads/foo.jpg"
	if (s.startsWith('uploads/')) s = '/' + s;

	// keep external as-is
	if (/^https?:\/\//i.test(s)) return s;

	// only normalise uploads
	if (!s.startsWith('/uploads/')) return s;

	// encode the path after /uploads/
	const rest = s.slice('/uploads/'.length);
	s = '/uploads/' + encodeUrlPath(rest);

	// IMPORTANT: strip any size suffix BEFORE extension:
	// /uploads/foo.960.jpg -> /uploads/foo.jpg
	s = s.replace(/(\.\d+)(\.[^.\/]+)$/, '$2');

	return s;
}

function basePath(src: string): string {
	// /uploads/foo.jpg or /uploads/foo.640.jpg -> /uploads/foo
	return src.replace(/(\.\d+)?\.[^.\/]+$/, '');
}

function getMetaFor(src: string): ManifestEntry | null {
	return manifest[src] ?? null;
}

function formatSrcset(src: string, format: string, max?: number): string {
	const meta = getMetaFor(src);
	if (!meta) return '';
	if (!meta.formats.includes(format)) return '';

	const base = basePath(src);
	const sizes = meta.sizes.filter((w) => (!max ? true : w <= max));
	return sizes.map((w) => `${base}.${w}.${format} ${w}w`).join(', ');
}

function pickFallbackSize(src: string): { width: number; format: string } {
	const meta = getMetaFor(src);

	// If we have sizes, choose the largest <= configured fallback width.
	if (meta?.sizes?.length) {
		const target = IMAGE_CONFIG.fallback.width;
		const sorted = [...meta.sizes].sort((a, b) => a - b);
		const chosen = sorted.filter((w) => w <= target).pop() ?? sorted[sorted.length - 1];
		return { width: chosen, format: IMAGE_CONFIG.fallback.format };
	}

	// No metadata? fall back to config
	return { width: IMAGE_CONFIG.fallback.width, format: IMAGE_CONFIG.fallback.format };
}

export function transformImagesToPicture(html: string): string {
	const $ = loadHtml(html);

	$('img').each((_, el) => {
		const $img = $(el);

		let src = $img.attr('src');
		if (!src) return;

		src = normaliseUploadSrc(src);

		// external images: leave alone
		if (/^https?:\/\//i.test(src)) {
			$img.attr('src', src);
			return;
		}

		// if it's not /uploads, leave alone
		if (!src.startsWith('/uploads/')) return;

		const alt = $img.attr('alt') ?? '';

		const $picture = $('<picture></picture>');

		// AVIF first, then WebP (browser picks first supported)
		const preferred = ['avif', 'webp'];

		for (const fmt of preferred) {
			const enabled =
				fmt in IMAGE_CONFIG.formats ? Boolean((IMAGE_CONFIG.formats as any)[fmt]?.enabled) : false;
			if (!enabled) continue;

			const srcset = formatSrcset(src, fmt);
			if (!srcset) continue;

			$picture.append(
				$('<source>')
					.attr('type', `image/${fmt}`)
					.attr('srcset', srcset)
					.attr('sizes', IMAGE_CONFIG.defaultSizes)
			);
		}

		// Fallback <img>
		const fb = pickFallbackSize(src);
		const fbSrc = `${basePath(src)}.${fb.width}.${fb.format}`;

		const meta = getMetaFor(src);

		const $fallbackImg = $('<img>');
		$fallbackImg.attr('src', fbSrc);
		$fallbackImg.attr('alt', alt);
		$fallbackImg.attr('class', 'content-img');
		$fallbackImg.attr('decoding', 'async');
		$fallbackImg.attr('loading', 'lazy');

		if (meta?.width) $fallbackImg.attr('width', String(meta.width));
		if (meta?.height) $fallbackImg.attr('height', String(meta.height));

		$picture.append($fallbackImg);
		$img.replaceWith($picture);
	});

	return $.root().html() ?? '';
}
