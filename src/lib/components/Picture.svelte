<script lang="ts">
	/**
	 * Picture.svelte
	 * ---------------
	 * One image component for the whole site.
	 *
	 * Variants (intent-based, not technical):
	 *
	 * - hero     → large, top-of-page images (LCP candidates)
	 * - card     → grid / card layouts
	 * - sidebar  → narrow columns
	 * - avatar   → portraits
	 * - icon     → small list/search icons (ALWAYS uses 320 image, renders at 160px)
	 * - auto     → sensible default
	 */

	import cfg from '$lib/images/config.json';
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	import imageMeta from '$lib/image-sizes.json';

	type ImageMetaMap = Record<string, { width: number | null; height: number | null }>;
	const metaMap: ImageMetaMap = imageMeta as ImageMetaMap;

	// -----------------------------
	// Props
	// -----------------------------
	let {
		src = '',
		alt = '',
		class: className = '',
		priority = false,
		loading,
		fetchPriority,
		sizes,
		variant = 'auto',
		max = 400
	} = $props<{
		src?: string;
		alt?: string;
		class?: string;
		priority?: boolean;
		loading?: 'lazy' | 'eager';
		fetchPriority?: 'high' | 'low' | 'auto';
		sizes?: string;
		variant?: 'auto' | 'hero' | 'card' | 'sidebar' | 'avatar' | 'icon';
		max?: number;
	}>();

	// -----------------------------
	// Helpers
	// -----------------------------
	function stripToBase(s: string): string {
		return s.replace(/(\.\d+)?\.[^.]+$/, '');
	}

	function numOrU(n: number | null | undefined): number | undefined {
		return typeof n === 'number' ? n : undefined;
	}

	// -----------------------------
	// Base path
	// -----------------------------
	const base = $derived(src ? stripToBase(src) : '');

	// -----------------------------
	// Widths offered in srcset
	// -----------------------------
	const widths = $derived(
		variant === 'icon' ? [320] : Array.isArray(cfg.widths) ? cfg.widths : [320, 640, 960]
	);

	// -----------------------------
	// Srcset
	// -----------------------------
	const webpSrcset = $derived(base ? widths.map((w) => `${base}.${w}.webp ${w}w`).join(', ') : '');

	// -----------------------------
	// Fallback <img>
	// -----------------------------
	const fallbackWidth = cfg.fallback?.width ?? 640;
	const fallbackFormat = cfg.fallback?.format ?? 'jpg';
	const fallbackSrc = $derived(base ? `${base}.${fallbackWidth}.${fallbackFormat}` : '');

	// -----------------------------
	// Intrinsic dimensions (CLS prevention)
	// -----------------------------
	const intrinsic = $derived(() => {
		if (!src) return null;
		return (
			metaMap[src] ??
			metaMap[`${base}.jpg`] ??
			metaMap[`${base}.png`] ??
			metaMap[`${base}.webp`] ??
			null
		);
	});

	const width = $derived(numOrU(intrinsic()?.width));
	const height = $derived(numOrU(intrinsic()?.height));

	// -----------------------------
	// Sizes attribute
	// -----------------------------

	const finalSizes = $derived(
		typeof sizes === 'string' && sizes.length
			? sizes
			: variant === 'icon'
				? '160px'
				: variant === 'sidebar' || variant === 'avatar'
					? `(min-width: 1024px) ${max}px, 100vw`
					: variant === 'hero'
						? '(min-width: 1200px) 900px, 100vw'
						: variant === 'card'
							? '(min-width: 1200px) 33vw, (min-width: 768px) 50vw, 100vw'
							: defaultSizes
	);

	// -----------------------------
	// Loading priority
	// -----------------------------
	const finalLoading = $derived(priority ? 'eager' : (loading ?? 'lazy'));
	const finalFetchPriority = $derived(priority ? 'high' : (fetchPriority ?? 'auto'));
</script>

{#if src}
	<picture class={className}>
		{#if webpSrcset}
			<source srcset={webpSrcset} sizes={finalSizes} type="image/webp" />
		{/if}

		<img
			class={className}
			src={fallbackSrc}
			{alt}
			loading={finalLoading}
			fetchpriority={finalFetchPriority}
			decoding="async"
			{width}
			{height}
			sizes={finalSizes}
		/>
	</picture>
{/if}
