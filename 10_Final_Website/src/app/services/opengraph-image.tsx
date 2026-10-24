import { renderServiceCard, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-card';

export const runtime = 'edge';
export const alt = 'SheetFlow AI — AI automation services';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderServiceCard({
    kicker: 'Services',
    title: 'The busywork, handed over.',
    description:
      'Lead capture, WhatsApp follow-ups, appointment booking and CRM automation — built inside the tools your business already runs, and owned by you.',
    path: '/services',
  });
}
