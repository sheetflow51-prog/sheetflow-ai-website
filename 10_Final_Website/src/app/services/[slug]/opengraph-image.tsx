import { renderServiceCard, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-card';
import { getService } from '@/content/services';

export const runtime = 'edge';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/**
 * A single static `alt`, and the card itself is rendered on demand.
 *
 * The first version enumerated the four slugs with `generateStaticParams` and
 * gave each card its own alt via `generateImageMetadata`. The build rejected
 * it: *"Edge runtime is not supported with `generateStaticParams`."* Keeping
 * edge and dropping the enumeration matches how the root card already works
 * (`ƒ /opengraph-image`), so both cards behave the same way rather than one
 * being a special case.
 *
 * The cost is this generic alt in place of a per-service one. Worth naming: an
 * image alt on a social card is read by far fewer things than page alt text,
 * and the card itself carries the service name at 76px.
 */
export const alt = 'SheetFlow AI — AI automation service';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getService(slug);

  // An unknown slug cannot reach a rendered page — `dynamicParams = false` on
  // the route 404s first — so this fallback only covers a direct request for
  // the image URL. It returns the generic card rather than throwing.
  return renderServiceCard({
    kicker: service?.kicker ?? 'Services',
    title: service?.name ?? 'AI automation services',
    description:
      service?.metaDescription ??
      'AI automations for lead capture, WhatsApp follow-ups, appointment booking and CRM.',
    path: service ? `/services/${service.slug}` : '/services',
  });
}
