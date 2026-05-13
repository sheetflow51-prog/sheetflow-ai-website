import { Logo } from '@/components/ui/Logo';

const FOOTER_GROUPS = [
  {
    title: 'Product',
    links: [
      { label: 'Workflows', href: '#workflow' },
      { label: 'Intelligence', href: '#intelligence' },
      { label: 'Reports', href: '#reports' },
      { label: 'Integrations', href: '#integrations' },
      { label: 'Pricing', href: '#pricing' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'For Operations', href: '#solutions-ops' },
      { label: 'For Finance', href: '#solutions-finance' },
      { label: 'For Founders', href: '#solutions-founders' },
      { label: 'For Enterprise', href: '#solutions-enterprise' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '#docs' },
      { label: 'Changelog', href: '#changelog' },
      { label: 'Customers', href: '#customers' },
      { label: 'Security', href: '#security' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#about' },
      { label: 'Manifesto', href: '#manifesto' },
      { label: 'Careers', href: '#careers' },
      { label: 'Contact', href: '#contact' },
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
              The intelligence layer for the world's most important data — your spreadsheets.
            </p>
            <div className="mt-2 flex items-center gap-2 text-[11px] uppercase tracking-widest text-ink-400">
              <span className="h-1.5 w-1.5 rounded-full bg-signal-success animate-pulse-live" />
              All systems operational
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
          <span>© 2026 SheetFlow AI. The intelligence layer.</span>
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
