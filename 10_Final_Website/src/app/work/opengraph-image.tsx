import { renderServiceCard, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-card';

export const runtime = 'edge';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'SheetFlow AI — client work';

/**
 * The social card for `/work`.
 *
 * Next's `opengraph-image` convention applies to the declaring segment and is
 * **not inherited by children**, which is how the service routes shipped with
 * `summary_large_image` and no image behind it (see `lib/og-card.tsx`). This
 * file and its sibling in `[slug]/` exist so the same defect cannot recur here.
 */
export default function Image() {
  return renderServiceCard({
    kicker: 'Work',
    title: 'Built, deployed, running.',
    description:
      'Production websites and automation systems, with the architecture and engineering decisions behind each.',
    path: '/work',
  });
}
