# Philosophy 247 – How Content & Images Flow Through the Site

This project is a **static-first SvelteKit site**. Content is edited via **Sveltia CMS** and stored in the repo as Markdown. Images are processed at **build time** into predictable responsive files.

The whole system is designed to be:
- easy to understand
- deterministic (same inputs → same outputs)
- simple to maintain
- ready for future SSR/hybrid use without redesigning the content model

---

## Big picture diagram

### A) Content flow (Sveltia → Markdown → server loaders → pages)

```text
┌──────────────────────────────────────────────────────────┐
│                     Editor experience                     │
└──────────────────────────────────────────────────────────┘
          │
          │ 1) Author edits in browser
          ▼
┌──────────────────────────────────────────────────────────┐
│ Sveltia CMS (static admin UI)                             │
│ Location: /static/admin/                                  │
│  - admin HTML                                              │
│  - config file                                              │
└──────────────────────────────────────────────────────────┘
          │
          │ 2) Sveltia writes Markdown + front-matter into repo
          ▼
┌──────────────────────────────────────────────────────────┐
│ Content in repo                                            │
│ Location: /content/                                        │
│  - content/podcasts/*.md                                   │
│  - content/people/*.md                                     │
│  - content/pages/*.md                                      │
└──────────────────────────────────────────────────────────┘
          │
          │ 3) Build/runtime: SvelteKit server-side reads files
          ▼
┌──────────────────────────────────────────────────────────┐
│ Server content layer                                       │
│ Location: src/lib/server/*                                 │
│  - reads Markdown                                           │
│  - parses front-matter                                      │
│  - Markdown → HTML                                          │
│  - normalises image markup in HTML                          │
│  - returns clean JS objects (Podcast, Person, Page...)       │
└──────────────────────────────────────────────────────────┘
          │
          │ 4) Page load: +page.server.ts provides "data"
          ▼
┌──────────────────────────────────────────────────────────┐
│ SvelteKit routes                                            │
│  - src/routes/**/+page.server.ts                            │
│  - src/routes/**/+page.svelte                               │
│                                                           │
│ UI renders using returned objects                           │
└──────────────────────────────────────────────────────────┘
B) Image flow (uploads → build script → static assets → Picture component)

┌──────────────────────────────────────────────────────────┐
│                     Source images                          │
└──────────────────────────────────────────────────────────┘
          │
          │ 1) Originals placed here (often large)
          ▼
┌──────────────────────────────────────────────────────────┐
│ Original uploads                                            │
│ Location: /uploads/                                        │
│ Purpose: source material only                               │
└──────────────────────────────────────────────────────────┘
          │
          │ 2) Build-time processing (run before vite build)
          ▼
┌──────────────────────────────────────────────────────────┐
│ Image processing script                                     │
│ Location: scripts/process-images.mjs                        │
│ Reads config: src/lib/images/config.json                    │
│                                                           │
│ Generates:                                                  │
│  - WebP variants (e.g. .320.webp .640.webp .960.webp)       │
│  - One fallback (e.g. .640.jpg)                             │
│ Writes metadata: src/lib/image-sizes.json                   │
│ Uses cache: .image-cache.json                               │
└──────────────────────────────────────────────────────────┘
          │
          │ 3) Output becomes part of the built site
          ▼
┌──────────────────────────────────────────────────────────┐
│ Processed static assets                                     │
│ Location: /static/uploads/                                  │
│ Served at: /uploads/...                                     │
│                                                           │
│ Example output for /uploads/foo.jpg:                        │
│  /uploads/foo.320.webp                                     │
│  /uploads/foo.640.webp                                     │
│  /uploads/foo.960.webp                                     │
│  /uploads/foo.640.jpg   (fallback)                          │
└──────────────────────────────────────────────────────────┘
          │
          │ 4) UI uses one component for consistent markup
          ▼
┌──────────────────────────────────────────────────────────┐
│ Picture component                                           │
│ Location: src/lib/components/Picture.svelte                 │
│ Reads:                                                      │
│  - src/lib/images/config.json (widths, defaults, fallback)  │
│  - src/lib/image-sizes.json (intrinsic width/height)        │
│ Emits <picture> with <source> + <img> fallback              │
└──────────────────────────────────────────────────────────┘
One-sentence mental model

Sveltia writes Markdown into /content.

Server loaders in src/lib/server read it and return clean objects to pages.

Images are processed at build time from /uploads to /static/uploads.

<Picture> is the one consistent way to render images across the site.

Key locations (cheat sheet)
/static/admin/                  Sveltia CMS UI + config
/content/                       Markdown content (podcasts/people/pages)
/uploads/                       Original (often large) images (source only)

/scripts/process-images.mjs      Build-time image processing
/src/lib/images/config.json      Image widths, fallback, default sizes (source of truth)
/src/lib/image-sizes.json        Generated intrinsic w/h map (written by script)

/src/lib/server/*                Content loaders (file system + parsing)
/src/lib/components/Picture.svelte  Consistent responsive image output
/src/routes/**                   Pages and server load functions

Content pipeline details
What’s in a content file?

Content files in /content are Markdown with front-matter:

---
title: Example Episode
date: 2026-01-01
thumb: /uploads/example.jpg
mp3: /uploads/example.mp3
---
Markdown body...

What the server layer does

The modules under src/lib/server typically:

list files in a collection

read Markdown

parse front-matter

convert Markdown → HTML

normalise image tags inside HTML so images behave consistently

return typed objects (Podcast / Person / Page)

Pages access the results via data from +page.server.ts.

Image pipeline details
The single source of truth

Image behaviour is set in:

src/lib/images/config.json

This defines:

responsive widths

WebP settings

fallback (format + width)

default sizes behaviour for typical layouts

Change this file and rerun the image script to update the whole site.

Output strategy

WebP variants for modern browsers

One JPG fallback (capped width) for safety and predictable size

Avoid serving huge originals

Resetting the pipeline

To rebuild from scratch:

rm .image-cache.json
rm -rf static/uploads
npm run images

Using the Picture component
Top image on a page (above the fold)

Use priority so it loads eagerly and gets high fetch priority:

<Picture
  src={podcast.thumb}
  alt={`Artwork for ${podcast.title}`}
  priority={true}
  variant="hero"
  class="episode-art"
/>

Cards / list views
<Picture
  src={podcast.thumb}
  alt={podcast.title}
  priority={i === 0}
  variant="card"
  class="card-image img-169"
/>

Sidebar / narrow portrait containers
<Picture
  src={person.portrait}
  alt={person.name}
  variant="sidebar"
  max={360}
/>


If you need full manual control, you can pass sizes="..." and it will override the variant preset.

Build order

Because the site serves processed images from /static/uploads, the correct build order is:

1) npm run images
2) vite build


In package.json this is typically:

{
  "scripts": {
    "images": "node scripts/process-images.mjs",
    "build": "npm run images && vite build"
  }
}

Notes for future SSR / hybrid use

This architecture still works if you later enable SSR for some routes:

content loaders remain server-side

images remain static assets (fast, cacheable)

the site stays deterministic and easy to deploy

Nothing in this setup requires a runtime database.
