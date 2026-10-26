import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sheetflow.click';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/'] },
      /**
       * AI crawlers are named explicitly and allowed.
       *
       * They are already covered by the wildcard, so this changes no access.
       * It is a stated position: SheetFlow wants to be readable by answer
       * engines, and naming them means a future decision to restrict one is a
       * visible edit rather than a silent side effect of tightening `*`.
       *
       * GPTBot / OAI-SearchBot — ChatGPT training and browsing
       * ClaudeBot / Claude-User — Anthropic
       * PerplexityBot, Google-Extended (Gemini/AI Overviews), Applebot-Extended
       */
      {
        userAgent: [
          'GPTBot',
          'OAI-SearchBot',
          'ChatGPT-User',
          'ClaudeBot',
          'Claude-User',
          'anthropic-ai',
          'PerplexityBot',
          'Google-Extended',
          'Applebot-Extended',
          'CCBot',
          'Bingbot',
        ],
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
