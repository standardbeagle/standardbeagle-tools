#!/usr/bin/env node
// One-shot fixture generator for image-optimize tests.
// Produces deterministic, public-domain test images:
//   - photo.jpg     : 320x240 photo-like JPEG with EXIF metadata (~50KB)
//   - diagram.png   : 320x240 PNG diagram with flat-color shapes (~30KB)
//   - vector-ref.svg: tiny inline SVG reference (no raster encode)
//
// Run: node scripts/generate-fixtures.mjs
// Output is committed under test/fixtures/.

import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, '..', 'test', 'fixtures');

const W = 320;
const H = 240;

// Photo-like content: smooth gradients + low-frequency noise so JPEG compresses
// well at q=80 but WebP at q=80 compresses noticeably better (>30% target).
function buildPhotoBuffer() {
  const channels = 3;
  const buf = Buffer.alloc(W * H * channels);
  let seed = 1337;
  const rand = () => {
    // xorshift32 — deterministic
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return ((seed >>> 0) % 1000) / 1000;
  };
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * channels;
      // Sky-to-ground vertical gradient + horizontal warm gradient + grain
      const g = y / H;
      const h = x / W;
      const noise = (rand() - 0.5) * 30;
      buf[i + 0] = clamp(40 + h * 180 + noise + (1 - g) * 40);   // R
      buf[i + 1] = clamp(80 + (1 - g) * 120 + noise * 0.6);      // G
      buf[i + 2] = clamp(180 - g * 120 + noise * 0.4 + h * 20);  // B
    }
  }
  return buf;
}

// Diagram: 8x6 grid of cells where each cell contains a smooth radial
// gradient (not flat color). PNG can't palette-compress smooth gradients, so
// the resulting PNG is large enough (~50KB) that AVIF@q60 wins decisively
// (>50%). Grid lines preserve the "diagram" visual character.
function buildDiagramBuffer() {
  const channels = 3;
  const buf = Buffer.alloc(W * H * channels);
  buf.fill(0xff); // white background

  const cols = 8;
  const rows = 6;
  const cw = Math.floor(W / cols);
  const rh = Math.floor(H / rows);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const baseR = (idx * 41) % 256;
      const baseG = (idx * 73) % 256;
      const baseB = (idx * 113) % 256;
      // Radial gradient inside the cell (center bright, edges base color)
      const cx = c * cw + cw / 2;
      const cy = r * rh + rh / 2;
      const maxR = Math.hypot(cw / 2, rh / 2);
      for (let y = r * rh + 1; y < (r + 1) * rh - 1 && y < H; y++) {
        for (let x = c * cw + 1; x < (c + 1) * cw - 1 && x < W; x++) {
          const dist = Math.hypot(x - cx, y - cy) / maxR;
          const t = Math.max(0, 1 - dist); // 1 at center, 0 at corner
          const i = (y * W + x) * 3;
          buf[i + 0] = clamp(baseR + (255 - baseR) * t);
          buf[i + 1] = clamp(baseG + (255 - baseG) * t);
          buf[i + 2] = clamp(baseB + (255 - baseB) * t);
        }
      }
    }
  }
  // Grid lines (sharp edges)
  for (let c = 0; c <= cols; c++) {
    fillRect(buf, c * cw, 0, 1, H, 0, 0, 0);
  }
  for (let r = 0; r <= rows; r++) {
    fillRect(buf, 0, r * rh, W, 1, 0, 0, 0);
  }
  return buf;
}

function fillRect(buf, x0, y0, w, h, r, g, b) {
  for (let y = y0; y < Math.min(y0 + h, H); y++) {
    for (let x = x0; x < Math.min(x0 + w, W); x++) {
      const i = (y * W + x) * 3;
      buf[i + 0] = r;
      buf[i + 1] = g;
      buf[i + 2] = b;
    }
  }
}

function clamp(v) {
  return Math.max(0, Math.min(255, Math.round(v)));
}

async function main() {
  // photo.jpg with EXIF — sharp's withMetadata() inserts a default EXIF block
  // when keepExif/withExif is supplied. We attach a tiny synthetic EXIF blob
  // so strip-metadata tests can assert it disappears.
  const photoRaw = buildPhotoBuffer();
  const photoPath = join(fixturesDir, 'photo.jpg');
  await sharp(photoRaw, { raw: { width: W, height: H, channels: 3 } })
    .withExif({
      IFD0: {
        ImageDescription: 'standardbeagle-tools test fixture',
        Software: 'image-processing test fixtures',
      },
    })
    .jpeg({ quality: 92, mozjpeg: false })
    .toFile(photoPath);

  const diagramRaw = buildDiagramBuffer();
  const diagramPath = join(fixturesDir, 'diagram.png');
  await sharp(diagramRaw, { raw: { width: W, height: H, channels: 3 } })
    .png({ compressionLevel: 9 })
    .toFile(diagramPath);

  // Tiny reference SVG (vector — not exercised by image_optimize, but kept
  // alongside fixtures per task spec for downstream svg-related tools).
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <rect width="100" height="100" fill="#1e88e5"/>
  <circle cx="50" cy="50" r="30" fill="#ffffff"/>
  <text x="50" y="56" font-family="sans-serif" font-size="14" text-anchor="middle" fill="#1e88e5">SBT</text>
</svg>
`;
  writeFileSync(join(fixturesDir, 'vector-ref.svg'), svg);

  console.log(`Wrote fixtures to ${fixturesDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
