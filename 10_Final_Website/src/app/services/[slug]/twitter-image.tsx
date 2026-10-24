import Image, {
  alt as ogAlt,
  size as ogSize,
  contentType as ogContentType,
} from './opengraph-image';

// Next.js requires these exports to be statically analyzable per-file, so they
// are re-declared rather than spread. Same pattern as the root twitter-image.
export const runtime = 'edge';
export const alt = ogAlt;
export const size = ogSize;
export const contentType = ogContentType;

export default Image;
