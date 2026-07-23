import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SheetFlow AI',
    short_name: 'SheetFlow',
    description:
      'SheetFlow builds AI automations that capture leads, follow up on WhatsApp, book appointments, and keep your CRM updated — so your business runs itself.',
    start_url: '/',
    display: 'standalone',
    background_color: '#060608',
    theme_color: '#060608',
    // Actual source file is 248x252 — declaring 512x512 here would be a
    // false claim that fails Lighthouse/browser manifest-icon validation.
    icons: [{ src: '/logo.png', sizes: '248x252', type: 'image/png', purpose: 'any' }],
  };
}
