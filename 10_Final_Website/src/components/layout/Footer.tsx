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
      { label: 'Pricing', href: '#pricing' },
      { label: 'FAQ', href: '#faq' },
      { label: 'Integrations', href: '#integrations' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
      { label: 'Book an Audit', href: '#contact' },
    ],
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
          <div className="flex items-center gap-6">
            <a href="#" className="transition-colors hover:text-white" data-cursor="hover">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-white" data-cursor="hover">
              Terms
            </a>
            <a href="#" className="transition-colors hover:text-white" data-cursor="hover">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
