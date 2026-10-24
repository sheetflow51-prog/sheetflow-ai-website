import Image, {
  alt as ogAlt,
  size as ogSize,
  contentType as ogContentType,
} from './opengraph-image';

// Next requires these exports to be statically analyzable per-file, so they are
// re-declared rather than spread. Same pattern as the other twitter-image routes.
export const runtime = 'edge';
export const alt = ogAlt;
export const size = ogSize;
export const contentType = ogContentType;

export default Image;
