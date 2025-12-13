<script lang="ts">
	// AVIF/WEBP + JPG(640) responsive picture

		let {
		src = '',
		alt = '',
		loading = 'lazy',
		fetchPriority = 'auto',
		class: className = '',
		sizes
	} = $props<{
		src?: string;
		alt?: string;
		loading?: 'lazy' | 'eager';
		fetchPriority?: 'high' | 'low' | 'auto';
		class?: string;
		sizes?: string;
	}>();

	// Strip extension: /uploads/foo.jpg → /uploads/foo
	const base = src.replace(/\.[^.]+$/, '');

	const avifSrcset = [
		`${base}.320.avif 320w`,
		`${base}.640.avif 640w`,
		`${base}.960.avif 960w`
	].join(', ');

	const webpSrcset = [
		`${base}.320.webp 320w`,
		`${base}.640.webp 640w`,
		`${base}.960.webp 960w`
	].join(', ');

	// Fallback JPG (only 640 exists from your script)
	const jpgFallback = `${base}.640.jpg`;

	// Safe default; you can override with `sizes` prop
	const defaultSizes =
		'(min-width: 1200px) 25vw, (min-width: 768px) 33vw, 100vw';
</script>

<picture class={className}>
	<source
		srcset={avifSrcset}
		sizes={sizes ?? defaultSizes}
		type="image/avif"
	>
   
	<source
		srcset={webpSrcset}
		sizes={sizes ?? defaultSizes}
		type="image/webp"
	> 
	<img
		class={className}
		src={jpgFallback}
		alt={alt}
		loading={loading ?? undefined}
		fetchpriority={fetchPriority}
		decoding="async"
		width="640"
		height="360"
		sizes={sizes ?? defaultSizes}
	>
</picture>

<style>
	.img-169 {
		display: block;
		width: 100%;
		aspect-ratio: 16 / 9;
		object-fit: cover;
	}
</style>
