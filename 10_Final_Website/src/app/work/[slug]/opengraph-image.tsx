import { renderServiceCard, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-card';
import { getProject } from '@/content/work';

export const runtime = 'edge';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/**
 * One static `alt`, card rendered on demand — the same shape as the service
 * card route, and for the same build constraint: *"Edge runtime is not
 * supported with `generateStaticParams`."* Keeping edge and dropping the
 * enumeration means every card on the site behaves identically.
 */
export const alt = 'SheetFlow AI — client work';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);

  // Unreachable from a rendered page — `dynamicParams = false` 404s first — so
  // this only covers a direct request for the image URL.
  return renderServiceCard({
    kicker: project?.kicker ?? 'Work',
    title: project?.client ?? 'Client work',
    // The case-study lede rather than the meta description: the card is read as
    // a caption, and the lede is written to be read that way.
    description:
      project?.lede ??
      'Production websites and automation systems, with the architecture behind each.',
    path: project ? `/work/${project.slug}` : '/work',
  });
}
