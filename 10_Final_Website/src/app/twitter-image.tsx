import OpengraphImage, {
  alt as ogAlt,
  size as ogSize,
  contentType as ogContentType,
} from './opengraph-image';

// Next.js requires these exports to be statically analyzable per-file.
export const runtime = 'edge';
export const alt = ogAlt;
export const size = ogSize;
export const contentType = ogContentType;

export default OpengraphImage;
