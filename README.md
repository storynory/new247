## Philosophy 247 – How Content & Images Flow Through the Site

This project is a static-first SvelteKit site. Content is edited via Sveltia CMS and stored in the repo as Markdown. Images are processed at build time into predictable, responsive assets and rendered via dedicated Picture components.

The system is designed to be:

easy to understand

deterministic (same inputs → same outputs)

simple to maintain

future-proof (works equally well for static, SSR, or hybrid builds)

## Big picture
A) Content flow

(Sveltia → Markdown → server loaders → pages)

┌──────────────────────────────────────────────────────────┐
│ Editor experience │
└──────────────────────────────────────────────────────────┘
          │
          │ 1) Author edits in browser
          ▼
┌──────────────────────────────────────────────────────────┐
│ Sveltia CMS (static admin UI) │
│ Location: /static/admin/ │
│ - admin HTML │
│ - CMS config │
└──────────────────────────────────────────────────────────┘
          │
          │ 2) Sveltia writes Markdown + front-matter into repo
          ▼
┌──────────────────────────────────────────────────────────┐
│ Content in repo │
│ Location: /content/ │
│ - content/podcasts/*.md │
│ - content/people/*.md │
│ - content/pages/*.md │
└──────────────────────────────────────────────────────────┘
          │
          │ 3) Build/runtime: SvelteKit server reads files
          ▼
┌──────────────────────────────────────────────────────────┐
│ Server content layer │
│ Location: src/lib/server/* │
│ - reads Markdown │
│ - parses front-matter │
│ - Markdown → HTML │
│ - normalises image markup │
│ - returns clean JS objects │
└──────────────────────────────────────────────────────────┘
          │
          │ 4) Page load: +page.server.ts provides data
          ▼
┌──────────────────────────────────────────────────────────┐
│ SvelteKit routes │
│ - src/routes/**/+page.server.ts │
│ - src/routes/**/+page.svelte │
│ │
│ UI renders using returned objects │
└──────────────────────────────────────────────────────────┘
## B) Image flow

(uploads → build script → static assets → Picture components)

┌──────────────────────────────────────────────────────────┐
│ Source images │
└──────────────────────────────────────────────────────────┘
          │
          │ 1) Originals placed here (often large)
          ▼
┌──────────────────────────────────────────────────────────┐
│ Original uploads │
│ Location: content/uploads/ │
│ Purpose: source material only │
└──────────────────────────────────────────────────────────┘
          │
          │ 2) Build-time processing
          ▼
┌──────────────────────────────────────────────────────────┐
│ Image processing script │
│ Location: scripts/process-images.mjs │
│ Reads config: src/lib/images/config.json │
│ │
│ Generates: │
│ - WebP variants (and AVIF if enabled) │
│ - One fallback image (usually JPG) │
│ - Never enlarges images │
│ - Handles tiny images correctly │
│ │
│ Writes manifest: src/lib/image-sizes.json │
│ Uses cache: .image-cache.json │
└──────────────────────────────────────────────────────────┘
          │
          │ 3) Output becomes part of the built site
          ▼
┌──────────────────────────────────────────────────────────┐
│ Processed static assets │
│ Location: /static/uploads/ │
│ Served at: /uploads/... │
│ │
│ Example output for /uploads/foo.jpg: │
│ /uploads/foo.320.webp │
│ /uploads/foo.640.webp │
│ /uploads/foo.960.webp │
│ /uploads/foo.640.jpg (fallback) │
└──────────────────────────────────────────────────────────┘
          │
          │ 4) UI renders images via Picture components
          ▼
┌──────────────────────────────────────────────────────────┐
│ Picture components │
│ Location: src/lib/components/ │
│ - PictureHero.svelte │
│ - PicturePortrait.svelte │
│ - PictureGrid.svelte │
│ │
│ Components read: │
│ - src/lib/image-sizes.json (what actually exists) │
│ - src/lib/images/config.json (fallback defaults) │
│ │
│ Components emit <picture> with correct <source> order │
└──────────────────────────────────────────────────────────┘
## One-sentence mental model

Sveltia writes Markdown into /content.
Server loaders turn it into clean objects.
Images are processed at build time into /static/uploads.
Picture components render images using the manifest — never guessing.

## Key locations (cheat sheet)

/static/admin/ Sveltia CMS UI + config
/content/ Markdown content
/content/uploads/ Original source images (never served)

/scripts/process-images.mjs Build-time image processing
/src/lib/images/config.json Image config (single source of truth)
/src/lib/image-sizes.json Generated image manifest

/src/lib/server/* Content loaders
/src/lib/components/ Picture components
/src/routes/** Pages and server loaders
/static/uploads/ Generated image assets (served)


## Image pipeline details
The single source of truth

Image behaviour is defined in:

src/lib/images/config.json


This controls:

responsive widths

enabled formats (WebP / AVIF)

fallback format and width

default sizes behaviour

Changing this file and rerunning the image script updates the whole site.

The image manifest

The build script writes:

src/lib/image-sizes.json


Each entry records only what actually exists:

"/uploads/example.jpg": {
  "width": 1920,
  "height": 1080,
  "sizes": [320, 640, 960],
  "formats": ["webp"]
}


Paths are URL-encoded (spaces are safe)

Tiny images use their intrinsic width

Components never invent sizes or formats

Runtime helpers

src/lib/images/image-helpers.ts:

reads the manifest

builds srcsets from real data

chooses the correct fallback size

exposes simple helpers:

formatSrcset()

webpSrcset()

fallbackSrc()

getMeta()

## Using Picture components
Hero image (above the fold)
<PictureHero
	src="/uploads/Sacred-Places-and-Traditions-worship-circle.jpg"
	alt="Artwork for Sacred Places and Traditions"
/>


Loads eagerly

High fetch priority

Uses AVIF → WebP → fallback automatically

Grid / list images (first item priority)
{#each images as image, i}
	<PictureGrid
		src={image.src}
		alt={image.alt}
		priority={i === 0}
	/>
{/each}


First image loads eagerly

Others lazy-load

No format logic in the page

Portrait / narrow images
<PicturePortrait
	src="/uploads/anders_sandberg-200.jpg"
	alt="Anders Sandberg"
/>


Uses a single appropriate size

No wasted downloads

Correct fallback for tiny images

Resetting the image pipeline

To rebuild everything from scratch:

rm -f .image-cache.json
rm -rf static/uploads
node scripts/process-images.mjs

Build order

Because images are static assets, the correct order is:

1) node scripts/process-images.mjs
2) vite build


Typically in package.json:

{
  "scripts": {
    "images": "node scripts/process-images.mjs",
    "build": "npm run images && vite build"
  }
}

Notes for future SSR / hybrid use

Content loaders remain server-side

Images remain static and cacheable

No runtime database required

The architecture stays deterministic
