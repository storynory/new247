<script lang="ts">
	import { basePath, getMeta } from '$lib/images/image-helpers';

	let { src, alt = '' } = $props<{ src: string; alt?: string }>();

	const meta = $derived(() => getMeta(src));
	const base = $derived(() => basePath(src));
</script>

<img
	src={`${base()}.320.webp`}
	{alt}
	width={meta()?.width}
	height={meta()?.height}
	loading="lazy"
	decoding="async"
	style="width: 200px; height: auto;"
/>
