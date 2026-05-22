/**
 * Generates WebP variants under src/assets/optimized/ and a manifest for Eleventy.
 * Not part of `npm run build` — run only when source images change:
 *   npm run optimize:images
 * Then commit src/assets/optimized/ and src/_data/optimized-images.json.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SRC_DIR = path.join(ROOT, "src", "assets", "images");
const OUT_DIR = path.join(ROOT, "src", "assets", "optimized");
const MANIFEST_PATH = path.join(ROOT, "src", "_data", "optimized-images.json");
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png"]);
const DEFAULT_WIDTHS = [360, 520, 800, 1200, 1600, 1920];

function walkImages(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkImages(fullPath);
    if (!entry.isFile()) return [];
    return IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()) ? [fullPath] : [];
  });
}

function assetKey(file) {
  return `images/${file.split(path.sep).join("/")}`;
}

function outBaseName(file) {
  const parsed = path.parse(file);
  return path
    .join(parsed.dir, parsed.name)
    .split(path.sep)
    .join("-")
    .replace(/[^a-z0-9_-]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function widthsForImage(metadata) {
  const originalWidth = metadata.width || DEFAULT_WIDTHS[0];
  const widths = DEFAULT_WIDTHS.filter((width) => width <= originalWidth);
  if (!widths.length) return [originalWidth];
  if (widths[widths.length - 1] !== originalWidth && originalWidth < DEFAULT_WIDTHS[DEFAULT_WIDTHS.length - 1]) {
    widths.push(originalWidth);
  }
  return [...new Set(widths)];
}

async function main() {
  let sharp;
  try {
    sharp = require("sharp");
  } catch {
    console.error("Missing sharp. Run: npm install --save-dev sharp");
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  /** @type {Record<string, { width: number, height: number, url: string }[]>} */
  const manifest = { images: {} };
  const imagePaths = walkImages(SRC_DIR).sort();

  for (const inputPath of imagePaths) {
    const file = path.relative(SRC_DIR, inputPath);
    const key = assetKey(file);
    const metadata = await sharp(inputPath).metadata();
    const widths = widthsForImage(metadata);
    manifest.images[key] = [];

    for (const width of widths) {
      const outName = `${outBaseName(file)}-${width}w.webp`;
      const outPath = path.join(OUT_DIR, outName);
      const { width: w, height: h } = await sharp(inputPath)
        .rotate()
        .resize({
          width,
          withoutEnlargement: true,
        })
        .webp({ quality: 82, effort: 4 })
        .toFile(outPath);

      const url = `/assets/optimized/${outName}`;
      manifest.images[key].push({ width: w, height: h, url });
      const kb = (fs.statSync(outPath).size / 1024).toFixed(1);
      console.log(`  ${outName} (${kb} KiB)`);
    }
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`\nWrote ${MANIFEST_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
