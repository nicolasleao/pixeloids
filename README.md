# Agent Faces

Static, framework-agnostic SVG avatar generator for minimal quirky monster characters.

## Files

- `agent-faces.js` — zero-dependency library file
- `index.html` — single-page demo and live previewer

## Browser

```html
<script src="./agent-faces.js"></script>
<script>
  const svg = AgentFaces.createSvg('demo-seed', { size: 160 });
</script>
```

## CommonJS

```js
const AgentFaces = require('./agent-faces.js');
const avatar = AgentFaces.createAvatar('demo-seed');
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
