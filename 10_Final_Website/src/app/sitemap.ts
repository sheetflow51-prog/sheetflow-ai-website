import type { MetadataRoute } from 'next';
import { services } from '@/content/services';
import { projects } from '@/content/work';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sheetflow.click';

/**
 * Generated from the content modules rather than listed by hand — a sitemap
 * maintained separately from the routes is a sitemap that goes stale, and a
 * page missing from it is a page that waits on discovery.
 *
 * Priority is relative within the site, not an absolute score: the homepage is
 * the entry point, `/pricing` and `/book` are the commercial surfaces, the
 * service and case-study pages are the substance, and the two indexes are hubs.
 *
 * **`/book/confirmed` is deliberately absent.** A post-booking confirmation has
 * no search intent behind it, and indexing one lands people on "You're booked"
 * without a booking. It is `noindex` at the page level too; this is the second
 * half of the same decision.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      // The page a visitor is sent to by every CTA on the site.
      url: `${SITE_URL}/book`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      // Carries real published prices, so it is the page most likely to answer
      // a "how much does this cost" query outright.
      url: `${SITE_URL}/pricing`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/services`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    ...services.map((s) => ({
      url: `${SITE_URL}/services/${s.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    {
      url: `${SITE_URL}/work`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...projects.map((p) => ({
      url: `${SITE_URL}/work/${p.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
