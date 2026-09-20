import type { ImageMetadata } from 'astro';

const assetModules = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/*.{svg,png,jpg,jpeg,webp,avif}',
  { eager: true },
);

const assetsByFilename = new Map<string, ImageMetadata>();
for (const [path, mod] of Object.entries(assetModules)) {
  const filename = path.split('/').pop();
  if (filename) assetsByFilename.set(filename, mod.default);
}

// `context` should name the file + field the filename came from (e.g.
// "landing/hero.yaml › visual.src") so a missing asset fails the build
// with a readable message, matching the rest of the content pipeline.
export function resolveAsset(filename: string, context: string): ImageMetadata {
  const asset = assetsByFilename.get(filename);
  if (!asset) {
    throw new Error(
      `${context}: image "${filename}" was not found in src/assets/. Add the file or fix the path.`,
    );
  }
  return asset;
}
