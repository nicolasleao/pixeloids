(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
    module.exports.default = api;
  } else if (root) {
    root.Pixeloids = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var VERSION = '2.3.1';
  var VIEWBOX_SIZE = 64;
  var GRID_SIZE = 16;
  var CELL = VIEWBOX_SIZE / GRID_SIZE;

  var PALETTES = [
    {
      name: 'mint-chip',
      background: '#dcfce7',
      body: '#0f766e',
      head: '#86efac',
      accent: '#fef08a',
      detail: '#14532d',
      topper: '#1f2937',
      outline: '#172033'
    },
    {
      name: 'grape-soda',
      background: '#efe4ff',
      body: '#7c3aed',
      head: '#c4b5fd',
      accent: '#f9a8d4',
      detail: '#4c1d95',
      topper: '#3f2a56',
      outline: '#18112b'
    },
    {
      name: 'sunny-day',
      background: '#fef3c7',
      body: '#f97316',
      head: '#fdba74',
      accent: '#fb7185',
      detail: '#9a3412',
      topper: '#4b2e1f',
      outline: '#2f1d13'
    },
    {
      name: 'bubblegum',
      background: '#ffe4ef',
      body: '#db2777',
      head: '#f9a8d4',
      accent: '#fde68a',
      detail: '#9d174d',
      topper: '#6b214a',
      outline: '#2b1624'
    },
    {
      name: 'ocean-pop',
      background: '#dbeafe',
      body: '#2563eb',
      head: '#7dd3fc',
      accent: '#a7f3d0',
      detail: '#1d4ed8',
      topper: '#1e3a8a',
      outline: '#10203b'
    },
    {
      name: 'matcha-latte',
      background: '#ecfccb',
      body: '#65a30d',
      head: '#bef264',
      accent: '#fdba74',
      detail: '#3f6212',
      topper: '#44551d',
      outline: '#1c2714'
    }
  ];

  function xmur3(input) {
    var h = 1779033703 ^ input.length;
    for (var i = 0; i < input.length; i += 1) {
      h = Math.imul(h ^ input.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return function () {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      h ^= h >>> 16;
      return h >>> 0;
    };
  }

  function mulberry32(seed) {
    return function () {
      var t = (seed += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function createRng(seedString) {
    return mulberry32(xmur3(seedString)());
  }

  function pick(rng, items) {
    return items[Math.floor(rng() * items.length)];
  }

  function randomInt(rng, min, max) {
    return Math.floor(rng() * (max - min + 1)) + min;
  }

  function escapeXml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalizeSeed(seed) {
    if (seed === undefined || seed === null || seed === '') {
      return 'pixeloid';
    }
    return String(seed);
  }

  function normalizeOptions(options) {
    var source = options || {};
    var size = typeof source.size === 'number' && isFinite(source.size) && source.size > 0 ? source.size : 128;
    var margin = typeof source.margin === 'number' && isFinite(source.margin) && source.margin >= 0 ? source.margin : 0;
    var safeMargin = Math.min(margin, Math.floor(VIEWBOX_SIZE / 2) - 1);

    return {
      size: size,
      background: source.background !== false,
      margin: safeMargin,
      title: source.title ? String(source.title) : '',
      transparentBackground: source.transparentBackground === true
    };
  }

  function createRect(x, y, width, height, fill) {
    return '<rect x="' + x + '" y="' + y + '" width="' + width + '" height="' + height + '" fill="' + fill + '"/>';
  }

  function cellRect(x, y, w, h, fill) {
    return createRect(x * CELL, y * CELL, w * CELL, h * CELL, fill);
  }

  function addPart(parts, x, y, w, h, fill) {
    if (w <= 0 || h <= 0) {
      return;
    }
    parts.push(cellRect(x, y, w, h, fill));
  }

  function buildBackground(traits, palette, options) {
    if (!options.background || options.transparentBackground) {
      return '';
    }

    var accent = traits.backgroundAccent;
    var shapes = [
      createRect(options.margin, options.margin, VIEWBOX_SIZE - options.margin * 2, VIEWBOX_SIZE - options.margin * 2, palette.background)
    ];

    if (accent === 'dots') {
      shapes.push(createRect(16, 16, 4, 4, 'rgba(255,255,255,0.45)'));
      shapes.push(createRect(44, 12, 4, 4, 'rgba(255,255,255,0.45)'));
      shapes.push(createRect(12, 44, 4, 4, 'rgba(255,255,255,0.45)'));
    } else if (accent === 'steps') {
      shapes.push(createRect(8, 12, 12, 4, 'rgba(255,255,255,0.35)'));
      shapes.push(createRect(44, 44, 12, 4, 'rgba(255,255,255,0.35)'));
    } else {
      shapes.push(createRect(8, 8, 12, 12, 'rgba(255,255,255,0.22)'));
      shapes.push(createRect(44, 44, 8, 8, 'rgba(255,255,255,0.22)'));
    }

    return shapes.join('');
  }

  function buildBody(traits, palette) {
    var x = traits.bodyX;
    var y = traits.bodyY;
    var w = traits.bodyWidth;
    var h = traits.bodyHeight;
    var parts = [];

    if (traits.bodyShape === 'block') {
      addPart(parts, x, y, w, h, palette.body);
    } else if (traits.bodyShape === 'taper') {
      addPart(parts, x, y, w, Math.min(2, h), palette.body);
      addPart(parts, x + 1, y + 2, w - 2, h - 2, palette.body);
    } else if (traits.bodyShape === 'chonk') {
      addPart(parts, x + 1, y, w - 2, 1, palette.body);
      addPart(parts, x, y + 1, w, h - 1, palette.body);
    } else {
      addPart(parts, x + 1, y, w - 2, 1, palette.body);
      addPart(parts, x, y + 1, w, h - 2, palette.body);
      addPart(parts, x + 1, y + h - 1, w - 2, 1, palette.body);
    }

    if (traits.bellyStyle === 'panel') {
      addPart(parts, x + 2, y + 2, w - 4, Math.max(2, h - 4), palette.head);
    } else if (traits.bellyStyle === 'stripe') {
      addPart(parts, x + Math.floor(w / 2) - 1, y + 1, 2, h - 2, palette.head);
    } else if (traits.bellyStyle === 'core') {
      addPart(parts, x + Math.floor(w / 2) - 1, y + 2, 2, 2, palette.accent);
      addPart(parts, x + Math.floor(w / 2) - 2, y + 3, 4, 2, palette.accent);
    }

    return parts.join('');
  }

  function buildHead(traits, palette) {
    var x = traits.headX;
    var y = traits.headY;
    var w = traits.headWidth;
    var h = traits.headHeight;
    var parts = [];

    if (traits.headShape === 'square') {
      addPart(parts, x, y, w, h, palette.head);
    } else if (traits.headShape === 'tall') {
      addPart(parts, x + 1, y, w - 2, 1, palette.head);
      addPart(parts, x, y + 1, w, h - 1, palette.head);
    } else if (traits.headShape === 'wide') {
      addPart(parts, x, y, w, h - 1, palette.head);
      addPart(parts, x + 1, y + h - 1, w - 2, 1, palette.head);
    } else {
      addPart(parts, x + 1, y, w - 2, 1, palette.head);
      addPart(parts, x, y + 1, w, h - 2, palette.head);
      addPart(parts, x + 1, y + h - 1, w - 2, 1, palette.head);
    }

    if (traits.cheekStyle === 'dots') {
      addPart(parts, x + 1, traits.mouthTopY, 1, 1, palette.accent);
      addPart(parts, x + w - 2, traits.mouthTopY, 1, 1, palette.accent);
    } else if (traits.cheekStyle === 'bars') {
      var cheekY = traits.eyeY + 1;
      var cheekHeight = Math.max(1, traits.mouthTopY - cheekY);
      addPart(parts, x + 1, cheekY, 1, cheekHeight, palette.accent);
      addPart(parts, x + w - 2, cheekY, 1, cheekHeight, palette.accent);
    }

    return parts.join('');
  }

  function buildTopper(traits, palette) {
    var x = traits.headX;
    var y = traits.headY;
    var w = traits.headWidth;
    var parts = [];

    if (traits.topperStyle === 'none') {
      return '';
    }

    if (traits.topperStyle === 'horns') {
      addPart(parts, x + 1, y - 2, 2, 2, palette.topper);
      addPart(parts, x + w - 3, y - 2, 2, 2, palette.topper);
      addPart(parts, x + 2, y - 1, 1, 1, palette.accent);
      addPart(parts, x + w - 3, y - 1, 1, 1, palette.accent);
    } else if (traits.topperStyle === 'ears') {
      addPart(parts, x, y - 2, 2, 2, palette.topper);
      addPart(parts, x + w - 2, y - 2, 2, 2, palette.topper);
      addPart(parts, x + 1, y - 1, 1, 1, palette.accent);
      addPart(parts, x + w - 2, y - 1, 1, 1, palette.accent);
    } else if (traits.topperStyle === 'antenna') {
      addPart(parts, x + Math.floor(w / 2), y - 1, 1, 1, palette.topper);
      addPart(parts, x + Math.floor(w / 2) - 1, y - 2, 3, 1, palette.accent);
    } else if (traits.topperStyle === 'sprout') {
      addPart(parts, x + Math.floor(w / 2), y - 1, 1, 1, palette.topper);
      addPart(parts, x + Math.floor(w / 2) - 2, y - 2, 2, 1, palette.accent);
      addPart(parts, x + Math.floor(w / 2) + 1, y - 2, 2, 1, palette.accent);
    } else if (traits.topperStyle === 'tuft') {
      addPart(parts, x + 2, y - 1, w - 4, 1, palette.topper);
      addPart(parts, x + Math.floor(w / 2) - 1, y - 2, 2, 1, palette.topper);
    } else {
      addPart(parts, x + 1, y - 2, w - 2, 2, palette.topper);
      addPart(parts, x + 2, y, w - 4, 1, palette.topper);
    }

    return parts.join('');
  }

  function buildFace(traits, palette) {
    var leftX = traits.faceLeftX;
    var rightX = traits.faceRightX;
    var y = traits.eyeY;
    var mouthX = traits.mouthX;
    var mouthY = traits.mouthY;
    var parts = [];

    if (traits.eyeStyle === 'dots') {
      addPart(parts, leftX, y, 1, 1, palette.outline);
      addPart(parts, rightX, y, 1, 1, palette.outline);
    } else if (traits.eyeStyle === 'wide') {
      addPart(parts, leftX, y, 2, 1, '#ffffff');
      addPart(parts, rightX - 1, y, 2, 1, '#ffffff');
      addPart(parts, leftX, y, 1, 1, palette.outline);
      addPart(parts, rightX, y, 1, 1, palette.outline);
    } else if (traits.eyeStyle === 'blink') {
      addPart(parts, leftX, y, 2, 1, palette.outline);
      addPart(parts, rightX - 1, y, 2, 1, palette.outline);
    } else {
      addPart(parts, leftX, y, 1, 2, '#ffffff');
      addPart(parts, rightX, y, 1, 2, '#ffffff');
      addPart(parts, leftX, y, 1, 1, palette.outline);
      addPart(parts, rightX, y, 1, 1, palette.outline);
    }

    if (traits.mouthStyle === 'smile') {
      addPart(parts, mouthX - 1, mouthY, 4, 1, palette.outline);
      addPart(parts, mouthX - 1, mouthY - 1, 1, 1, palette.outline);
      addPart(parts, mouthX + 2, mouthY - 1, 1, 1, palette.outline);
    } else if (traits.mouthStyle === 'flat') {
      addPart(parts, mouthX, mouthY, 2, 1, palette.outline);
    } else if (traits.mouthStyle === 'open') {
      addPart(parts, mouthX, mouthY, 2, 2, palette.outline);
      addPart(parts, mouthX, mouthY + 1, 2, 1, palette.accent);
    } else if (traits.mouthStyle === 'fang') {
      addPart(parts, mouthX, mouthY, 2, 1, palette.outline);
      addPart(parts, mouthX, mouthY + 1, 1, 1, '#ffffff');
      addPart(parts, mouthX + 1, mouthY + 1, 1, 1, '#ffffff');
    } else {
      addPart(parts, mouthX - 1, mouthY, 3, 1, palette.outline);
      addPart(parts, mouthX + 1, mouthY - 1, 1, 1, palette.outline);
    }

    return parts.join('');
  }

  function buildLimbs(traits, palette) {
    var x = traits.bodyX;
    var y = traits.bodyY;
    var w = traits.bodyWidth;
    var h = traits.bodyHeight;
    var parts = [];

    if (traits.armStyle === 'stub') {
      addPart(parts, x - 1, y + 2, 1, 2, palette.body);
      addPart(parts, x + w, y + 2, 1, 2, palette.body);
    } else if (traits.armStyle === 'down') {
      addPart(parts, x - 1, y + 1, 1, 4, palette.body);
      addPart(parts, x + w, y + 1, 1, 4, palette.body);
    } else {
      addPart(parts, x - 2, y + 2, 2, 1, palette.body);
      addPart(parts, x + w, y + 2, 2, 1, palette.body);
      addPart(parts, x - 2, y + 3, 1, 1, palette.body);
      addPart(parts, x + w + 1, y + 3, 1, 1, palette.body);
    }

    if (traits.legStyle === 'short') {
      addPart(parts, x + 1, y + h, 1, 1, palette.body);
      addPart(parts, x + w - 2, y + h, 1, 1, palette.body);
    } else if (traits.legStyle === 'wide') {
      addPart(parts, x + 1, y + h, 2, 1, palette.body);
      addPart(parts, x + w - 3, y + h, 2, 1, palette.body);
    } else {
      addPart(parts, x + 2, y + h, 1, 2, palette.body);
      addPart(parts, x + w - 3, y + h, 1, 2, palette.body);
    }

    return parts.join('');
  }

  /**
   * Vertical extent of the figure in grid rows (0..GRID_SIZE-1), inclusive.
   * Used to translate the character so it is centered in the viewBox.
   */
  function computeVerticalOffsetGrid(traits) {
    var headY = traits.headY;
    var headH = traits.headHeight;
    var bodyY = traits.bodyY;
    var bodyH = traits.bodyHeight;

    var minY = traits.topperStyle === 'none' ? headY : headY - 2;

    var maxY = bodyY + bodyH - 1;

    var legMax = bodyY + bodyH;
    if (traits.legStyle === 'long') {
      legMax = bodyY + bodyH + 1;
    }
    if (legMax > maxY) {
      maxY = legMax;
    }

    var armMax = bodyY;
    if (traits.armStyle === 'stub') {
      armMax = bodyY + 3;
    } else if (traits.armStyle === 'down') {
      armMax = bodyY + 4;
    } else {
      armMax = bodyY + 3;
    }
    if (armMax > maxY) {
      maxY = armMax;
    }

    if (traits.mouthStyle === 'open' && traits.mouthY + 1 > maxY) {
      maxY = traits.mouthY + 1;
    }
    if (traits.eyeStyle === 'tall' && traits.eyeY + 1 > maxY) {
      maxY = traits.eyeY + 1;
    }

    var contentHeight = maxY - minY + 1;
    return Math.floor((GRID_SIZE - contentHeight) / 2) - minY;
  }

  function generateTraits(seed, options) {
    var normalizedSeed = normalizeSeed(seed);
    var normalizedOptions = normalizeOptions(options);
    var rng = createRng(normalizedSeed + '|' + VERSION);
    var palette = pick(rng, PALETTES);
    var headWidth = pick(rng, [8, 9, 10]);
    var headHeight = pick(rng, [6, 7]);
    var bodyWidth = pick(rng, [7, 8, 9, 10]);
    var bodyHeight = pick(rng, [4, 5]);
    var headX = Math.floor((GRID_SIZE - headWidth) / 2);
    var headY = 2;
    var bodyX = Math.floor((GRID_SIZE - bodyWidth) / 2);
    var bodyY = headY + headHeight;
    var eyeStyle = pick(rng, ['dots', 'wide', 'blink', 'tall']);
    var mouthStyle = pick(rng, ['smile', 'flat', 'open', 'fang', 'smirk']);
    var mouthY = headY + headHeight - 2;
    var mouthTopY = mouthY - (mouthStyle === 'smile' || mouthStyle === 'smirk' ? 1 : 0);
    var eyeY = headY + 1;

    if (eyeStyle === 'tall' && mouthTopY <= eyeY + 2) {
      eyeY = Math.max(headY, eyeY - 1);
    }

    var faceLeftX = headX + 2;
    var faceRightX = headX + headWidth - 3;

    if ((eyeStyle === 'wide' || eyeStyle === 'blink') && faceRightX - faceLeftX < 4) {
      faceLeftX = headX + 1;
      faceRightX = headX + headWidth - 2;
    }

    var mouthX = headX + Math.floor(headWidth / 2) - 1;

    return {
      seed: normalizedSeed,
      options: normalizedOptions,
      palette: palette,
      backgroundStyle: 'square',
      backgroundAccent: pick(rng, ['dots', 'steps', 'blocks']),
      headShape: pick(rng, ['square', 'tall', 'wide', 'helmet']),
      headX: headX,
      headY: headY,
      headWidth: headWidth,
      headHeight: headHeight,
      bodyShape: pick(rng, ['block', 'taper', 'chonk', 'tiny']),
      bodyX: bodyX,
      bodyY: bodyY,
      bodyWidth: bodyWidth,
      bodyHeight: bodyHeight,
      topperStyle: pick(rng, ['none', 'horns', 'ears', 'antenna', 'sprout', 'tuft', 'cap']),
      eyeStyle: eyeStyle,
      eyeY: eyeY,
      faceLeftX: faceLeftX,
      faceRightX: faceRightX,
      mouthX: mouthX,
      mouthY: mouthY,
      mouthTopY: mouthTopY,
      mouthStyle: mouthStyle,
      armStyle: pick(rng, ['stub', 'down', 'up']),
      legStyle: pick(rng, ['short', 'wide', 'long']),
      bellyStyle: pick(rng, ['none', 'panel', 'stripe', 'core']),
      cheekStyle: pick(rng, ['none', 'dots', 'bars'])
    };
  }

  function getMetadata(seed, options) {
    var traits = generateTraits(seed, options);
    return {
      seed: traits.seed,
      size: traits.options.size,
      palette: traits.palette.name,
      colors: {
        background: traits.palette.background,
        body: traits.palette.body,
        head: traits.palette.head,
        accent: traits.palette.accent,
        detail: traits.palette.detail,
        topper: traits.palette.topper,
        outline: traits.palette.outline
      },
      traits: {
        backgroundStyle: traits.backgroundStyle,
        backgroundAccent: traits.backgroundAccent,
        headShape: traits.headShape,
        headWidth: traits.headWidth,
        headHeight: traits.headHeight,
        bodyShape: traits.bodyShape,
        bodyWidth: traits.bodyWidth,
        bodyHeight: traits.bodyHeight,
        topperStyle: traits.topperStyle,
        eyeStyle: traits.eyeStyle,
        mouthStyle: traits.mouthStyle,
        armStyle: traits.armStyle,
        legStyle: traits.legStyle,
        bellyStyle: traits.bellyStyle,
        cheekStyle: traits.cheekStyle
      },
      viewBox: '0 0 ' + VIEWBOX_SIZE + ' ' + VIEWBOX_SIZE
    };
  }

  function createSvg(seed, options) {
    var traits = generateTraits(seed, options);
    var normalizedOptions = traits.options;
    var title = normalizedOptions.title || 'Pixeloid: ' + traits.seed;
    var offsetY = computeVerticalOffsetGrid(traits) * CELL;
    var character =
      '<g transform="translate(0,' + offsetY + ')">' +
      buildBody(traits, traits.palette) +
      buildHead(traits, traits.palette) +
      buildTopper(traits, traits.palette) +
      buildFace(traits, traits.palette) +
      buildLimbs(traits, traits.palette) +
      '</g>';

    return '' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + normalizedOptions.size + '" height="' + normalizedOptions.size + '" viewBox="0 0 ' + VIEWBOX_SIZE + ' ' + VIEWBOX_SIZE + '" role="img" aria-label="' + escapeXml(title) + '" shape-rendering="crispEdges">' +
      '<title>' + escapeXml(title) + '</title>' +
      buildBackground(traits, traits.palette, normalizedOptions) +
      character +
      '</svg>';
  }

  function createAvatar(seed, options) {
    return {
      seed: normalizeSeed(seed),
      svg: createSvg(seed, options),
      metadata: getMetadata(seed, options)
    };
  }

  function toDataUri(svg) {
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  return {
    version: VERSION,
    createSvg: createSvg,
    getMetadata: getMetadata,
    createAvatar: createAvatar,
    toDataUri: toDataUri
  };
});
