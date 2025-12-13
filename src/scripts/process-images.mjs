// scripts/process-images.mjs
import fs from 'node:fs/promises';
import { watch as fsWatch } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import crypto from 'node:crypto';

// ----------------------------------------------------
// CONFIG – tweak these and almost nothing else
// ----------------------------------------------------
const CONFIG = {
	// Where original uploads live (Sveltia static repo)
	SRC: './uploads',

	// Where processed images go (Svelte app static)
	OUT: './static/uploads',

	// Input extensions we accept
	INPUT_EXTS: new Set(['.jpg', '.jpeg', '.png', '.webp']),

	// Responsive widths
	SIZES: [320, 640, 960],

	// Per-format settings
	FORMATS: {
		avif: {
			enabled: true,
			sizes: [320, 640, 960], // you can trim if needed
			options: { quality: 70 } // AVIF can usually be a bit lower
		},
		webp: {
			enabled: true,
			sizes: [320, 640, 960],
			options: { quality: 80 }
		},
		jpg: {
			enabled: true,
			sizes: [640], // only one fallback size
			options: { quality: 82, mozjpeg: true }
		}
	},

	// Cache + metadata
	CACHE_FILE: '.image-cache.json',
	META_FILE: './src/lib/image-sizes.json' // intrinsic sizes for Svelte
};
// ----------------------------------------------------
// END CONFIG
// ----------------------------------------------------

const { SRC, OUT, INPUT_EXTS, SIZES, FORMATS, CACHE_FILE, META_FILE } = CONFIG;

// load existing cache (hashes)
let cache = {};
try {
	cache = JSON.parse(await fs.readFile(CACHE_FILE, 'utf8'));
} catch {
	cache = {};
}

// load existing image metadata (if any)
let metaMap = {};
try {
	metaMap = JSON.parse(await fs.readFile(META_FILE, 'utf8'));
} catch {
	metaMap = {};
}

function sha1(buf) {
	return crypto.createHash('sha1').update(buf).digest('hex').slice(0, 10);
}

async function* walk(dir) {
	for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			yield* walk(full);
		} else {
			yield full;
		}
	}
}

function stripExt(file) {
	return file.replace(/\.[^.]+$/, '');
}

function outPath(base, width, ext) {
	const name = stripExt(base);
	return path.join(OUT, `${name}.${width}.${ext}`);
}

let built = 0;
let skipped = 0;

async function processOne(file) {
	const rel = path.relative(SRC, file);
	const buf = await fs.readFile(file);
	const digest = sha1(buf);

	// skip if hash hasn't changed
	if (cache[rel] === digest) {
		skipped++;
		return;
	}

	// 1) copy original file unchanged into OUT
	const originalOut = path.join(OUT, rel);
	await fs.mkdir(path.dirname(originalOut), { recursive: true });
	await fs.writeFile(originalOut, buf);

	// 2) prepare sharp pipeline (auto-rotate)
	const img = sharp(buf).rotate();

	// 3) get intrinsic width/height and store them
	const metadata = await img.metadata();
	const width = metadata.width ?? null;
	const height = metadata.height ?? null;

	// store under the web path, e.g. /uploads/foo/bar.jpg
	const webPath = '/uploads/' + rel.replace(/\\/g, '/');
	metaMap[webPath] = { width, height };

	// 4) generate responsive variants
	for (const widthPx of SIZES) {
		for (const [ext, cfg] of Object.entries(FORMATS)) {
			if (!cfg.enabled) continue;
			if (!cfg.sizes.includes(widthPx)) continue;

			const pipeline = img.clone().resize({ width: widthPx, withoutEnlargement: true });

			const out = outPath(rel, widthPx, ext);
			const tmp = out + '.tmp';

			await fs.mkdir(path.dirname(out), { recursive: true });

			if (ext === 'webp') {
				await pipeline.webp(cfg.options).toFile(tmp);
			} else if (ext === 'avif') {
				await pipeline.avif(cfg.options).toFile(tmp);
			} else if (ext === 'jpg' || ext === 'jpeg') {
				await pipeline.jpeg(cfg.options).toFile(tmp);
			} else {
				// unknown format in CONFIG – skip gracefully
				continue;
			}

			// atomic rename
			await fs.rename(tmp, out);
		}
	}

	cache[rel] = digest;
	built++;
	console.log('built:', rel);
}

async function saveState() {
	await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
	await fs.writeFile(META_FILE, JSON.stringify(metaMap, null, 2));
}

async function runOnce() {
	for await (const file of walk(SRC)) {
		if (INPUT_EXTS.has(path.extname(file).toLowerCase())) {
			await processOne(file);
		}
	}
	await saveState();
	console.log(`done — built ${built}, skipped ${skipped}`);
}

async function runWatch() {
	console.log(`watching ${SRC} for new or changed images…`);

	// Initial pass, just in case
	await runOnce();
	built = 0;
	skipped = 0;

	fsWatch(SRC, { recursive: true }, async (eventType, filename) => {
		if (!filename) return;

		const full = path.join(SRC, filename);
		const ext = path.extname(full).toLowerCase();
		if (!INPUT_EXTS.has(ext)) return;

		try {
			// Small debounce: sometimes editors write temp files etc.
			await new Promise((r) => setTimeout(r, 100));
			await processOne(full);
			await saveState();
		} catch (err) {
			console.error('Error processing', full, err);
		}
	});
}

// ---- CLI mode ----
if (process.argv.includes('--watch')) {
	await runWatch();
} else {
	await runOnce();
}
