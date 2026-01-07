// $lib/images/config.ts
export const IMAGE_CONFIG = {
	widths: [320, 640, 960],

	// modern formats
	formats: ['webp'] as const,

	// single, capped fallback
	fallback: {
		format: 'jpg' as const,
		width: 640,
		quality: 82
	},

	defaultSizes: '(min-width: 1200px) 25vw, (min-width: 768px) 33vw, 100vw'
};
