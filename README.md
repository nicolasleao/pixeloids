# Pixeloids
Procedural SVG avatar generator for minimal quirky monster characters.

### variant: monster
![monster](assets/pixeloids-monster-demo.gif)

### variant: minimal
![minimal](assets/pixeloids-minimal-demo.gif)


## Install

Until the package is on the npm registry, install from GitHub:

```bash
npm install github:nicolasleao/pixeloids
```

## Usage (Node)

```js
const Pixeloids = require('pixeloids');

const svg = Pixeloids.createSvg('demo-seed', { size: 160 });
const avatar = Pixeloids.createAvatar('demo-seed');

console.log(avatar.svg);
console.log(avatar.metadata);
```

## Usage (Browser)

```html
<script src="./pixeloids.js"></script>
<script>
  const svg = Pixeloids.createSvg('demo-seed', { size: 160 });
</script>
```

## Core Options

Choose avatar style with `variant`:

```js
const monsterSvg = Pixeloids.createSvg('demo-seed', { variant: 'monster' }); // default
const minimalSvg = Pixeloids.createSvg('demo-seed', { variant: 'minimal' });
```

Toggle background with `background`:

```js
const withBackground = Pixeloids.createSvg('demo-seed', { background: true }); // default
const transparent = Pixeloids.createSvg('demo-seed', { background: false });
```

Use both together:

```js
const svg = Pixeloids.createSvg('demo-seed', {
  variant: 'minimal',
  background: false,
  size: 160
});
```

If you are working from a clone without installing it as a dependency, use `require('./pixeloids.js')` instead.

## Files

- `pixeloids.js` — zero-dependency library file (this is what the installable package contains)

### Repository files
- `assets/style.css` — demo page styles
- `assets/pixeloids-monster-demo.gif` — README monster preview (regenerate with `npm run generate:readme-gif`)
- `assets/pixeloids-minimal-demo.gif` — README minimal preview (regenerate with `npm run generate:readme-gif`)
- `index.html` — single-page demo and live previewer

## API

- `createSvg(seed, options)`
- `getMetadata(seed, options)`
- `createAvatar(seed, options)`
- `toDataUri(svg)`

`createSvg` returns only the SVG string.  
`createAvatar` returns `{ seed, svg, metadata }` for when you also need structured avatar data.

```js
const svg = Pixeloids.createSvg('demo-seed', { variant: 'monster' });
const avatar = Pixeloids.createAvatar('demo-seed', { variant: 'monster' });
// avatar.seed, avatar.svg, avatar.metadata
```

Options: `variant` (`monster` | `minimal`), `background`, `size`, `margin`, `title`, `transparentBackground`.

Deterministic trait output is based on a stable hash of `seed + version` and a Mulberry32 PRNG.
Render options like `size`, `margin`, and `title` change presentation without changing the underlying character.

Each avatar is rendered as a sharp pixel-art-inspired monster with a separate head and body, a guaranteed readable face, and a small curated trait set for stronger silhouettes.
