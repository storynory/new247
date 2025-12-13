<script lang="ts">
	// @ts-ignore – same pattern as your other project
	let {
		src = '',
		alt = '',
		class: className = '',
		loading = 'lazy'
	} = $props<{
		src?: string;
		alt?: string;
		class?: string;
		loading?: 'lazy' | 'eager';
	}>();

	const base = src.replace(/\.[^.]+$/, '');

	// Use only the smallest generated size in srcset
	const avifSrcset = `${base}.320.avif 320w`;
	const webpSrcset = `${base}.640.webp 6400w`;

	// Fallback JPG – we only have 640.jpg from the script, which is fine for a tiny portrait
	const jpgFallback = `${base}.640.jpg`;

	const sizes = '300px'; // small portrait; tweak to taste
</script>

<picture class={className}>
	<source srcset={avifSrcset} sizes={sizes} type="image/avif">
	<source srcset={webpSrcset} sizes={sizes} type="image/webp">
	<img
		src={jpgFallback}
		alt={alt}
		loading={loading}
		decoding="async"
		sizes={sizes}
	>
</picture>

<style>
img {
    margin-top: 0;
}

</style>