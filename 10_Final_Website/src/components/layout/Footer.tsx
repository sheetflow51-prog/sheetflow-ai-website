import { Logo } from '@/components/ui/Logo';

const FOOTER_GROUPS = [
  {
    title: 'Services',
    links: [
      { label: 'Lead Capture', href: '#workflows' },
      { label: 'WhatsApp Automation', href: '#workflows' },
      { label: 'Appointment Booking', href: '#workflows' },
      { label: 'CRM Automation', href: '#workflows' },
      { label: 'Reporting Dashboards', href: '#reports' },
    ],
  },
  {
    title: 'Who it’s for',
    links: [
      { label: 'Clinics', href: '#customers' },
      { label: 'Agencies', href: '#customers' },
      { label: 'Coaches', href: '#customers' },
      { label: 'Real Estate', href: '#customers' },
      { label: 'Service Businesses', href: '#customers' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Case Studies', href: '#customers' },
      { label: 'Integrations', href: '#integrations' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Contact', href: '#contact' },
      { label: 'Book an Audit', href: '#contact' },
    ],
  },
];

const SOCIALS = [
  {
    label: 'SheetFlow on X',
    href: 'https://x.com/sheetflow51',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'SheetFlow on Instagram',
    href: 'https://www.instagram.com/sheetflow51',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-[18px] w-[18px]" aria-hidden="true">
        <rect x="2.5" y="2.5" width="19" height="19" rx="5.2" />
        <circle cx="12" cy="12" r="4.2" />
        <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'SheetFlow on LinkedIn',
    href: 'https://www.linkedin.com/in/sheet-flow-1173563a7',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]" aria-hidden="true">
        <path d="M4.98 3.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM3 9h4v12H3zM10 9h3.8v1.71h.05c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.86V21h-4z" />
      </svg>
    ),
  },
  {
    label: 'SheetFlow on GitHub',
    href: 'https://github.com/sheetflow51-prog',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.05 0-1.12.39-2.03 1.03-2.74-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.36 9.36 0 015 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.71 1.03 1.62 1.03 2.74 0 3.92-2.34 4.79-4.57 5.04.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.6.69.49A10.02 10.02 0 0022 12.25C22 6.58 17.52 2 12 2z" />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06]">
      <div className="container-edge py-20">
        <div className="grid grid-cols-2 gap-12 md:grid-cols-6">
          <div className="col-span-2 flex flex-col gap-5">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-ink-300">
              We build AI automation systems that capture leads, follow up, book clients, and run the busywork — so your business runs itself.
            </p>
            <div className="mt-2 flex items-center gap-2 text-[11px] uppercase tracking-widest text-ink-400">
              <span className="h-1.5 w-1.5 rounded-full bg-signal-success animate-pulse-live" />
              Now taking new clients
            </div>

            {/* Social links */}
            <div className="mt-4 flex items-center gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  data-cursor="hover"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-ink-300 transition-all hover:border-accent/50 hover:bg-accent/10 hover:text-white"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {FOOTER_GROUPS.map((group) => (
            <div key={group.title}>
              <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-ink-400">
                {group.title}
              </h4>
              <ul className="flex flex-col gap-3">
                {group.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-[13px] text-ink-300 transition-colors hover:text-white"
                      data-cursor="hover"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/[0.06] pt-8 text-xs text-ink-400 md:flex-row md:items-center">
          <span>© 2026 SheetFlow AI · AI Automation Agency</span>
        </div>
      </div>
    </footer>
  );
}
