import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import type { Person, Podcast } from '$lib/types';
import { load as loadHtml } from 'cheerio';

const CONTENT_ROOT = path.resolve('content');

function getCollectionFolder(collection: string): string {
  return path.join(CONTENT_ROOT, collection);
}

function readMarkdownFile(fullPath: string): { data: any; content: string } {
  const file = fs.readFileSync(fullPath, 'utf-8');
  const { data, content } = matter(file);
  return { data, content };
}

function getSlugsInCollection(collection: string): string[] {
  const folder = getCollectionFolder(collection);

  if (!fs.existsSync(folder)) {
    return [];
  }

  return fs
    .readdirSync(folder, { withFileTypes: true })
    .flatMap((entry) => {
      if (entry.isDirectory()) {
        // support nested files inside folders (eg pages/about/mission.md)
        const nested = fs.readdirSync(path.join(folder, entry.name))
          .filter((f) => f.endsWith('.md'))
          .map((filename) => path.join(entry.name, filename.replace(/\.md$/, '')));
        return nested;
      }
      if (entry.isFile() && entry.name.endsWith('.md')) {
        return entry.name.replace(/\.md$/, '');
      }
      return [];
    });
}

// ---- SAFETY HELPER: URL-encode spaces in media paths ----
function encodePath(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/ /g, '%20');
}

function transformImagesToPicture(html: string): string {
  const $ = loadHtml(html);

  $('img').each((_, el) => {
    const $img = $(el);
    let src = $img.attr('src') ?? '';
    const alt = $img.attr('alt') ?? '';

    if (!src) return;

    src = encodePath(src);
    $img.attr('src', src);

    if (/^https?:\/\//i.test(src)) {
      return;
    }

    const match = src.match(/^(.*?)(?:\.(\d+))?\.(\w+)$/);
    if (!match) return;

    const baseWithoutSize = match[1];
    const $picture = $('<picture></picture>');

    for (const format of ['avif', 'webp']) {
      const srcset = [320, 640, 960]
        .map((w) => `${baseWithoutSize}.${w}.${format} ${w}w`)
        .join(', ');

      const mime = `image/${format}`;
      const $source = $('<source>');
      $source.attr('srcset', srcset);
      $source.attr('type', mime);
      $picture.append($source);
    }

    const $fallbackImg = $('<img>');
    const attrs = $img.attr() ?? {};
    for (const [name, value] of Object.entries(attrs)) {
      if (value != null) $fallbackImg.attr(name, value);
    }
    $fallbackImg.attr('alt', alt);
    $picture.append($fallbackImg);
    $img.replaceWith($picture);
  });

  return $.root().html() ?? '';
}

// ========== PEOPLE ==========

export function getAllPeople(): Person[] {
  const folder = getCollectionFolder('people');
  const slugs = getSlugsInCollection('people');

  return slugs.map((slug) => {
    const fullPath = path.join(CONTENT_ROOT, 'people', `${slug}.md`);
    const { data, content } = readMarkdownFile(fullPath);

    const rawHtml = marked.parse(content) as string;
    const bodyHtml = transformImagesToPicture(rawHtml);

    return {
      slug,
      name: data.name ?? slug,
      bio: data.bio ?? '',
      portrait: encodePath(data.portrait),
      body: content,
      bodyHtml,
      books: Array.isArray(data.books) ? data.books : []
    };
  });
}

export function getPersonBySlug(slug: string): Person | undefined {
  return getAllPeople().find((p) => p.slug === slug);
}


// ========== PODCASTS ==========

export function getAllPodcasts(): Podcast[] {
  const slugs = getSlugsInCollection('podcasts');

  const folder = path.join(CONTENT_ROOT, 'podcasts'); // ✅ correct folder

  const podcasts = slugs.map((slug) => {
    const fullPath = path.join(folder, `${slug}.md`); // ✅ loads from content/podcasts

    if (!fs.existsSync(fullPath)) return undefined; // safety for missing paths

    const { data, content } = readMarkdownFile(fullPath);

    const rawHtml = marked.parse(content) as string;
    const bodyHtml = transformImagesToPicture(rawHtml);
    const length = (data.length ?? '').toString().replace(/,/g, '');
    return {
      slug,
      title: data.title ?? slug,
      description: data.description ?? '',
      date: data.date ?? '',
      thumb: encodePath(data.thumb),
      mp3: encodePath(data.mp3),
      duration: data.duration ?? '',
      length: length ?? '',
      with: Array.isArray(data.with) ? data.with : data.with ? [data.with] : [],
      body: content,
      bodyHtml
    };
  }).filter(Boolean) as Podcast[];

  return podcasts;
}

export function getPodcastBySlug(slug: string): Podcast | undefined {
  return getAllPodcasts().find((p) => p.slug === slug);
}


export function getPersonByPodcast(slug: string): Podcast | undefined {
  return getAllPodcasts().find((p) => p.slug === slug);
}

// ========== PAGES ==========

export interface Page {
  slug: string;
  title: string;
  body: string;
  featuredImage?: string;
  bodyHtml?: string;
}

export function getAllPages(): Page[] {
  const folder = getCollectionFolder('pages');

  if (!fs.existsSync(folder)) return [];

  const files = fs.readdirSync(folder, { withFileTypes: true });

  const pages: Page[] = [];

  for (const entry of files) {
    const filePath = entry.isDirectory()
      ? path.join(folder, entry.name, 'index.md')
      : path.join(folder, entry.name);

    if (!filePath.endsWith('.md') || !fs.existsSync(filePath)) continue;

    const slug = entry.name.replace(/\.md$/, '');
    const { data, content } = readMarkdownFile(filePath);

    const rawHtml = marked.parse(content) as string;
    const bodyHtml = transformImagesToPicture(rawHtml);

    pages.push({
      slug,
      title: data.title ?? slug,
      body: content,
      featuredImage: data.featuredImage ? encodePath(data.featuredImage) : undefined,
      bodyHtml
    });
  }

  return pages;
}

export function getPageBySlug(slug: string): Page | undefined {
  return getAllPages().find((p) => p.slug === slug);
}



