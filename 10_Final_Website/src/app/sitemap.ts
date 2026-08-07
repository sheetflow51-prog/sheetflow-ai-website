import type { MetadataRoute } from 'next';
import { services } from '@/content/services';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sheetflow.ai';

/**
 * Generated from `content/services.ts` rather than listed by hand — a sitemap
 * maintained separately from the routes is a sitemap that goes stale, and a
 * page missing from it is a page that waits on discovery.
 *
 * Priority is relative within the site, not an absolute score: the homepage is
 * the entry point, the service pages are the substance, the index is a hub.
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
  ];
}
