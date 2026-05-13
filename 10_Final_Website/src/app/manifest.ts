import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SheetFlow AI',
    short_name: 'SheetFlow',
    description:
      'The operational intelligence layer for spreadsheets. Watch your data, catch what matters, act before you have to ask.',
    start_url: '/',
    display: 'standalone',
    background_color: '#060608',
    theme_color: '#060608',
    icons: [
      { src: '/icon.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
