import './pixeloids.js';
import './animations.js';

const PixeloidsAnimations = globalThis.PixeloidsAnimations;

export default PixeloidsAnimations;

export const {
  version,
  createAnimatedSvg,
  createAnimatedAvatar,
  getAnimationMetadata
} = PixeloidsAnimations;
