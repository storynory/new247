import { load as loadHtml } from 'cheerio';
import imageConfig from '$lib/images/config.json';
import imageMeta from '$lib/image-sizes.json';
import { encodePath } from './core';

type ImageMeta = Record<string, { width: number | null; height: number | null }>;

const metaMap = imageMeta as ImageMeta;

export function transformImagesToPicture(html: string): string {
	const $ = loadHtml(html);

	$('img').each((_, el) => {
		const $img = $(el);

		let src = $img.attr('src');
		if (!src) return;

		src = encodePath(src);
		// 🔴 FIX: normalise relative uploads → absolute
		if (src.startsWith('uploads/')) {
			src = '/' + src;
		}
		// External images stay as-is
		if (/^https?:\/\//i.test(src)) {
			$img.attr('src', src);
			return;
		}

		// Strip extension and size: /uploads/foo.640.jpg → /uploads/foo
		const base = src.replace(/(\.\d+)?\.[^.]+$/, '');

		const alt = $img.attr('alt') ?? '';

		const $picture = $('<picture></picture>');

		// ---- <source> elements (from config) ----
		for (const [format, cfg] of Object.entries(imageConfig.formats)) {
			if (!cfg.enabled) continue;

			const srcset = imageConfig.widths
				.map((w: number) => `${base}.${w}.${format} ${w}w`)
				.join(', ');

			$picture.append(
				$('<source>')
					.attr('type', `image/${format}`)
					.attr('srcset', srcset)
					.attr('sizes', imageConfig.defaultSizes)
			);
		}

		// ---- Fallback <img> ----
		const fallback = imageConfig.fallback;
		const fallbackSrc = `${base}.${fallback.width}.${fallback.format}`;

		const meta =
			metaMap[src] ??
			metaMap[`${base}.jpg`] ??
			metaMap[`${base}.png`] ??
			metaMap[`${base}.webp`] ??
			null;

		const $fallbackImg = $('<img>');

		$fallbackImg.attr('src', fallbackSrc);
		$fallbackImg.attr('alt', alt);
		$fallbackImg.attr('class', 'content-img');
		$fallbackImg.attr('decoding', 'async');
		$fallbackImg.attr('loading', 'lazy');
		$fallbackImg.attr('sizes', imageConfig.defaultSizes);

		if (meta?.width) {
			$fallbackImg.attr('width', String(meta.width));
		}
		if (meta?.height) {
			$fallbackImg.attr('height', String(meta.height));
		}

		$picture.append($fallbackImg);
		$img.replaceWith($picture);
	});

	return $.root().html() ?? '';
}
