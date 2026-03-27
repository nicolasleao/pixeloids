# Pixeloids

Static, framework-agnostic SVG avatar generator for minimal quirky monster characters.

## Files

- `pixeloids.js` — zero-dependency library file
- `index.html` — single-page demo and live previewer

## Browser

```html
<script src="./pixeloids.js"></script>
<script>
  const svg = Pixeloids.createSvg('demo-seed', { size: 160 });
</script>
```

## CommonJS

```js
const Pixeloids = require('./pixeloids.js');
const avatar = Pixeloids.createAvatar('demo-seed');
```

## API

- `createSvg(seed, options)`
- `getMetadata(seed, options)`
- `createAvatar(seed, options)`
- `toDataUri(svg)`

Options: `size`, `background`, `margin`, `title`, `transparentBackground`.

Deterministic trait output is based on a stable hash of `seed + version` and a Mulberry32 PRNG.
Render options like `size`, `margin`, and `title` change presentation without changing the underlying character.

Each avatar is rendered as a sharp pixel-art-inspired monster with a separate head and body, a guaranteed readable face, and a small curated trait set for stronger silhouettes.
