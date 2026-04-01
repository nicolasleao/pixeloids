(function (root, factory) {
  var api = factory(
    root && root.Pixeloids ? root.Pixeloids : typeof module === 'object' && module.exports ? require('./pixeloids.js') : null
  );

  if (typeof module === 'object' && module.exports) {
    module.exports = api;
    module.exports.default = api;
  }
  if (typeof define === 'function' && define.amd) {
    define(function () {
      return api;
    });
  }
  if (root) {
    root.PixeloidsAnimations = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this, function (Pixeloids) {
  'use strict';

  if (!Pixeloids) {
    throw new Error('PixeloidsAnimations requires Pixeloids to be loaded first.');
  }

  var VERSION = '1.0.0';
  var MOTIONS = ['calm', 'curious', 'sleepy', 'playful', 'smug'];

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

  function normalizeSeed(seed) {
    if (seed === undefined || seed === null || seed === '') {
      return 'pixeloid';
    }
    return String(seed);
  }

  function escapeXml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  var STYLE_BLOCK = [
    '<style>',
    '@keyframes pxa-bob{0%,100%{transform:translateY(var(--px-base-y,0px))}50%{transform:translateY(calc(var(--px-base-y,0px) - .6px))}}',
    '@keyframes pxa-tilt{0%,100%{transform:rotate(0deg)}50%{transform:rotate(1.6deg)}}',
    '@keyframes pxa-wobble{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-1.4deg)}}',
    '@keyframes pxa-blink{0%,86%,100%{transform:scaleY(1)}90%{transform:scaleY(.08)}92%{transform:scaleY(1)}}',
    '@keyframes pxa-look{0%,42%,100%{transform:translateX(0)}50%{transform:translateX(1px)}58%{transform:translateX(-1px)}}',
    '@keyframes pxa-wiggle{0%,100%{transform:translate(0,0)}25%{transform:translate(-.45px,.2px)}75%{transform:translate(.45px,-.2px)}}',
    '@keyframes pxa-smirk{0%,100%{transform:translateX(0)}50%{transform:translateX(.8px)}}',
    '.pixeloids-animated .pixeloids-avatar,.pixeloids-animated .pixeloids-head,.pixeloids-animated .pixeloids-topper,.pixeloids-animated .pixeloids-limbs,.pixeloids-animated .pixeloids-face,.pixeloids-animated .pixeloids-eye,.pixeloids-animated .pixeloids-mouth,.pixeloids-animated .pixeloids-brows,.pixeloids-animated .pixeloids-cheeks{transform-box:fill-box;transform-origin:center}',
    '.pixeloids-animated .pixeloids-avatar{transform:translateY(var(--px-base-y,0px))}',
    '.pixeloids-animated{overflow:visible}',
    '.pixeloids-animated .pixeloids-topper{transform-origin:center bottom}',
    '.pixeloids-animated .pixeloids-limbs{transform-origin:center top}',
    '.pixeloids-animated .pixeloids-eye-left{animation-delay:calc(var(--px-blink-delay,0s) + .18s)}',
    '.pixeloids-animated .pixeloids-eye-right{animation-delay:calc(var(--px-blink-delay,0s) + .82s)}',
    '.pixeloids-animated.pixeloids-motion-calm .pixeloids-avatar{animation:pxa-bob var(--px-bob-duration,5.2s) ease-in-out infinite;animation-delay:var(--px-bob-delay,0s)}',
    '.pixeloids-animated.pixeloids-motion-calm .pixeloids-eye{animation:pxa-blink var(--px-blink-duration,6.8s) steps(1,end) infinite;animation-delay:var(--px-blink-delay,0s)}',
    '.pixeloids-animated.pixeloids-motion-curious .pixeloids-avatar{animation:pxa-bob var(--px-bob-duration,5s) ease-in-out infinite;animation-delay:var(--px-bob-delay,0s)}',
    '.pixeloids-animated.pixeloids-motion-curious .pixeloids-variant-monster .pixeloids-head,.pixeloids-animated.pixeloids-motion-curious .pixeloids-variant-minimal .pixeloids-face{animation:pxa-tilt var(--px-tilt-duration,6.4s) ease-in-out infinite;animation-delay:var(--px-tilt-delay,0s)}',
    '.pixeloids-animated.pixeloids-motion-curious .pixeloids-eye{animation:pxa-look var(--px-look-duration,7.8s) ease-in-out infinite;animation-delay:var(--px-look-delay,0s)}',
    '.pixeloids-animated.pixeloids-motion-sleepy .pixeloids-avatar{animation:pxa-bob var(--px-bob-duration,6.2s) ease-in-out infinite;animation-delay:var(--px-bob-delay,0s)}',
    '.pixeloids-animated.pixeloids-motion-sleepy .pixeloids-eye{animation:pxa-blink var(--px-blink-duration,8.8s) steps(1,end) infinite;animation-delay:var(--px-blink-delay,0s)}',
    '.pixeloids-animated.pixeloids-motion-sleepy .pixeloids-mouth{animation:pxa-smirk var(--px-mouth-duration,9.2s) ease-in-out infinite;animation-delay:var(--px-mouth-delay,0s)}',
    '.pixeloids-animated.pixeloids-motion-playful .pixeloids-avatar{animation:pxa-bob var(--px-bob-duration,4.4s) ease-in-out infinite;animation-delay:var(--px-bob-delay,0s)}',
    '.pixeloids-animated.pixeloids-motion-playful .pixeloids-variant-monster .pixeloids-limbs,.pixeloids-animated.pixeloids-motion-playful .pixeloids-variant-minimal .pixeloids-brows{animation:pxa-wiggle var(--px-limb-duration,2.8s) ease-in-out infinite;animation-delay:var(--px-limb-delay,0s)}',
    '.pixeloids-animated.pixeloids-motion-playful .pixeloids-eye-left{animation:pxa-blink var(--px-blink-duration,7.4s) steps(1,end) infinite;animation-delay:var(--px-blink-delay,0s)}',
    '.pixeloids-animated.pixeloids-motion-playful .pixeloids-eye-right{animation:pxa-blink var(--px-blink-duration,7.4s) steps(1,end) infinite;animation-delay:calc(var(--px-blink-delay,0s) + .9s)}',
    '.pixeloids-animated.pixeloids-motion-playful .pixeloids-mouth{animation:pxa-smirk var(--px-mouth-duration,5.8s) ease-in-out infinite;animation-delay:var(--px-mouth-delay,0s)}',
    '.pixeloids-animated.pixeloids-motion-smug .pixeloids-avatar{animation:pxa-bob var(--px-bob-duration,5.4s) ease-in-out infinite;animation-delay:var(--px-bob-delay,0s)}',
    '.pixeloids-animated.pixeloids-motion-smug .pixeloids-variant-monster .pixeloids-head,.pixeloids-animated.pixeloids-motion-smug .pixeloids-variant-minimal .pixeloids-face{animation:pxa-tilt var(--px-tilt-duration,7.2s) ease-in-out infinite;animation-delay:var(--px-tilt-delay,0s)}',
    '.pixeloids-animated.pixeloids-motion-smug .pixeloids-eye-left{animation:pxa-blink var(--px-blink-duration,9.4s) steps(1,end) infinite;animation-delay:var(--px-blink-delay,0s)}',
    '.pixeloids-animated.pixeloids-motion-smug .pixeloids-eye-right{animation:pxa-blink var(--px-blink-duration,9.4s) steps(1,end) infinite;animation-delay:calc(var(--px-blink-delay,0s) + 1.6s)}',
    '.pixeloids-animated.pixeloids-motion-smug .pixeloids-mouth{animation:pxa-smirk var(--px-mouth-duration,6.3s) ease-in-out infinite;animation-delay:var(--px-mouth-delay,0s)}',
    '.pixeloids-animated.pixeloids-motion-smug .pixeloids-topper{animation:pxa-wobble var(--px-topper-duration,6.8s) ease-in-out infinite;animation-delay:var(--px-topper-delay,0s)}',
    '@media (prefers-reduced-motion: reduce){.pixeloids-animated *{animation:none !important}}',
    '</style>'
  ].join('');

  function buildMotion(seed, metadata) {
    var normalizedSeed = normalizeSeed(seed);
    var rng = createRng(normalizedSeed + '|' + (metadata.variant || 'variant') + '|pixeloids-animations|' + VERSION);
    return {
      profile: pick(rng, MOTIONS),
      vars: [
        '--px-base-y:' + (-0.25 + rng() * 0.5).toFixed(2) + 'px',
        '--px-bob-duration:' + (4.2 + rng() * 2.1).toFixed(2) + 's',
        '--px-bob-delay:-' + (rng() * 2.6).toFixed(2) + 's',
        '--px-blink-duration:' + (4.9 + rng() * 3.1).toFixed(2) + 's',
        '--px-blink-delay:-' + (rng() * 3.5).toFixed(2) + 's',
        '--px-look-duration:' + (5.6 + rng() * 3.4).toFixed(2) + 's',
        '--px-look-delay:-' + (rng() * 3.2).toFixed(2) + 's',
        '--px-tilt-duration:' + (5.5 + rng() * 3.1).toFixed(2) + 's',
        '--px-tilt-delay:-' + (rng() * 2.1).toFixed(2) + 's',
        '--px-limb-duration:' + (2.4 + rng() * 1.4).toFixed(2) + 's',
        '--px-limb-delay:-' + (rng() * 1.8).toFixed(2) + 's',
        '--px-mouth-duration:' + (4.6 + rng() * 2.8).toFixed(2) + 's',
        '--px-mouth-delay:-' + (rng() * 2.3).toFixed(2) + 's',
        '--px-topper-duration:' + (5.6 + rng() * 2.6).toFixed(2) + 's',
        '--px-topper-delay:-' + (rng() * 1.7).toFixed(2) + 's'
      ].join(';')
    };
  }

  function injectRoot(svg, profile, styleVars) {
    var rootClass = 'pixeloids-animated pixeloids-motion-' + profile;
    var injected = svg.replace('<svg ', '<svg class="' + rootClass + '" style="overflow:visible;' + escapeXml(styleVars) + '" ');
    return injected.replace('</title>', '</title>' + STYLE_BLOCK);
  }

  function createAnimatedAvatar(seed, options) {
    var avatar = Pixeloids.createAvatar(seed, options);
    var motion = buildMotion(avatar.seed, avatar.metadata);
    var svg = injectRoot(avatar.svg, motion.profile, motion.vars);

    return {
      seed: avatar.seed,
      svg: svg,
      metadata: {
        avatar: avatar.metadata,
        motion: motion
      }
    };
  }

  function createAnimatedSvg(seed, options) {
    return createAnimatedAvatar(seed, options).svg;
  }

  function getAnimationMetadata(seed, options) {
    var avatar = Pixeloids.createAvatar(seed, options);
    return buildMotion(avatar.seed, avatar.metadata);
  }

  return {
    version: VERSION,
    createAnimatedSvg: createAnimatedSvg,
    createAnimatedAvatar: createAnimatedAvatar,
    getAnimationMetadata: getAnimationMetadata
  };
});
