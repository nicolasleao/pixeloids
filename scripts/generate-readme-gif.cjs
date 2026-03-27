/**
 * One-off / CI helper: rasterizes Pixeloids SVG frames and writes an animated GIF
 * for the README. Same avatar logic as index.html (Pixeloids.createSvg).
 *
 * Run: npm run generate:readme-gif
 * Requires devDependencies: sharp, gifenc
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { GIFEncoder, quantize, applyPalette } = require('gifenc');

const Pixeloids = require(path.join(__dirname, '..', 'pixeloids.js'));

/** Same word list as index.html `randomSeed()` — paired with distinct numbers for variety. */
const SEEDS = [
  'gob-4821',
  'moss-103',
  'zap-7700',
  'blob-333',
  'sprout-9001',
  'fang-42',
  'bloop-7',
  'glitch-404',
  'gob-2',
  'moss-5555',
  'zap-88',
  'blob-6000'
];

const FRAME_SIZE = 320;
const FRAME_DELAY_MS = 450;
const OUT = path.join(__dirname, '..', 'assets', 'pixeloids-demo.gif');

async function frameToIndexed(svg) {
  const { data, info } = await sharp(Buffer.from(svg))
    .resize(FRAME_SIZE, FRAME_SIZE)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const rgba = new Uint8ClampedArray(data);
  const palette = quantize(rgba, 256);
  const index = applyPalette(rgba, palette);
  return { index, width: info.width, height: info.height, palette };
}

async function main() {
  const gif = GIFEncoder();
  let i = 0;

  for (const seed of SEEDS) {
    const svg = Pixeloids.createSvg(seed, {
      size: FRAME_SIZE,
      background: true
    });
    const { index, width, height, palette } = await frameToIndexed(svg);
    var opts = { palette: palette, delay: FRAME_DELAY_MS };
    if (i === 0) {
      opts.repeat = 0;
    }
    gif.writeFrame(index, width, height, opts);
    i += 1;
  }

  gif.finish();
  fs.writeFileSync(OUT, Buffer.from(gif.bytes()));
  console.log('Wrote', OUT, '(' + SEEDS.length + ' frames)');
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
