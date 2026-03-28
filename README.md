# Pixeloids
Procedural SVG avatar generator for minimal quirky monster characters.

### variant: monster (940,584,960 combinations)
![monster](assets/pixeloids-monster-demo.gif)

### variant: minimal (116,640 combinations)
![minimal](assets/pixeloids-minimal-demo.gif)


## Install

Until the package is on the npm registry, install from GitHub:

```bash
npm install github:nicolasleao/pixeloids
```

## Usage (ESM / React / Next.js)

### Static

```jsx
import { createSvg } from 'pixeloids';

export default function Avatar({ seed }) {
  const svg = createSvg(seed, { size: 128, background: true });
  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
}
```

Default import works too:

```js
import Pixeloids from 'pixeloids';

const svg = Pixeloids.createSvg('demo-seed', { size: 160 });
```

### Animated

```jsx
import PixeloidsAnimations from 'pixeloids/animations.mjs';

export default function Avatar({ seed }) {
  const svg = PixeloidsAnimations.createAnimatedSvg(seed, {
    size: 128,
    variant: 'monster',
    background: true
  });

  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
}
```

## Usage (Node / CommonJS)

### Static

```js
const Pixeloids = require('pixeloids');

const avatar = Pixeloids.createAvatar('demo-seed', { size: 160 });

// avatar.seed     → 'demo-seed'
// avatar.svg      → '<svg …>…</svg>'
// avatar.metadata → { variant, palette, colors, traits }
```

### Animated

```js
const PixeloidsAnimations = require('pixeloids/animations.js');

const avatar = PixeloidsAnimations.createAnimatedAvatar('demo-seed', {
  size: 160,
  variant: 'minimal',
  background: true
});

// avatar.metadata.avatar → base Pixeloids metadata
// avatar.metadata.motion → { profile, vars }
```

## Usage (Browser)

### Static (global build)

```html
<script src="./pixeloids.js"></script>
<script>
  const svg = Pixeloids.createSvg('demo-seed', { size: 160 });
  document.querySelector('#slot').innerHTML = svg;
</script>
```

### Animated (global build)

```html
<script src="./pixeloids.js"></script>
<script src="./animations.js"></script>
<script>
  const svg = PixeloidsAnimations.createAnimatedSvg('demo-seed', {
    size: 160,
    variant: 'monster',
    background: true
  });

  document.querySelector('#slot').innerHTML = svg;
</script>
```

### Static (ES module)

```html
<script type="module">
  import { createSvg } from './pixeloids.mjs';

  document.querySelector('#slot').innerHTML = createSvg('demo-seed', { size: 160 });
</script>
```

### Animated (ES module)

```html
<script type="module">
  import PixeloidsAnimations from './animations.mjs';

  document.querySelector('#slot').innerHTML = PixeloidsAnimations.createAnimatedSvg('demo-seed', {
    size: 160,
    variant: 'minimal',
    background: true
  });
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

- `pixeloids.js` — UMD build (CommonJS, AMD, browser global)
- `pixeloids.mjs` — ES module wrapper with named exports
- `animations.js` — UMD idle-animation layer built on top of Pixeloids
- `animations.mjs` — ES module wrapper for the animation layer

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

### Idle animations

If you want subtle seeded motion, use the companion animation layer:

- `createAnimatedSvg(seed, options)`
- `createAnimatedAvatar(seed, options)`
- `getAnimationMetadata(seed, options)`

```js
import PixeloidsAnimations from 'pixeloids/animations.mjs';

const svg = PixeloidsAnimations.createAnimatedSvg('demo-seed', {
  variant: 'monster',
  size: 128,
  background: true
});

const info = PixeloidsAnimations.getAnimationMetadata('demo-seed', {
  variant: 'monster'
});

// info.profile -> 'calm' | 'curious' | 'sleepy' | 'playful' | 'smug'
// info.vars    -> CSS custom properties used by the generated SVG
```

Animation output is deterministic too: the same seed picks the same idle motion profile.
The base avatar identity still comes from Pixeloids itself, so the same seed produces the same creature with the same idle behavior.

`createSvg` returns only the SVG string.  
`createAvatar` returns `{ seed, svg, metadata }` for when you also need structured avatar data.

```js
const svg = Pixeloids.createSvg('demo-seed', { variant: 'monster' });
const avatar = Pixeloids.createAvatar('demo-seed', { variant: 'monster' });
// avatar.seed     → 'demo-seed'
// avatar.svg      → '<svg …>…</svg>'
// avatar.metadata → { variant, palette, colors, traits }
```

Options: `variant` (`monster` | `minimal`), `background`, `size`, `margin`, `title`, `transparentBackground`.

Deterministic trait output is based on a stable hash of `seed + version` and a Mulberry32 PRNG.
Render options like `size`, `margin`, and `title` change presentation without changing the underlying character.

Each avatar is rendered as a sharp pixel-art-inspired monster with a separate head and body, a guaranteed readable face, and a small curated trait set for stronger silhouettes.
