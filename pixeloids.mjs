import './pixeloids.js';

const Pixeloids = globalThis.Pixeloids;

export default Pixeloids;

export const {
  version,
  createSvg,
  getMetadata,
  createAvatar,
  toDataUri,
  registerVariant,
  AvatarProvider,
  MonsterAvatarProvider,
  MinimalAvatarProvider
} = Pixeloids;
