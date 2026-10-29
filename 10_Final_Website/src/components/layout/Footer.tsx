import { Logo } from '@/components/ui/Logo';
import { services } from '@/content/services';
import { projects } from '@/content/work';

/**
 * The Services group points at the four real pages rather than sending every
 * label to the same anchor — several links to one destination is a dark
 * pattern for a crawler and useless for a reader.
 *
 * **That same defect was still present in the old "Who it's for" group**, whose
 * five labels all resolved to `/#customers`, and in "Case Studies", which was a
 * sixth link to it. The group is now Work, and every entry is a distinct page
 * that exists. Fixing it in one place and leaving it in another is how the
 * pattern survives a review.
 *
 * Every remaining fragment is root-relative. A bare `#faq` resolves against
 * the current page, so from `/services/...` it pointed at nothing.
 */
const FOOTER_GROUPS = [
  {
    title: 'Services',
    links: [
      ...services.map((s) => ({ label: s.shortLabel, href: `/services/${s.slug}` })),
      { label: 'Reporting Dashboards', href: '/#reports' },
      { label: 'All services', href: '/services' },
    ],
  },
  {
    title: 'Work',
    links: [
      ...projects.map((p) => ({ label: p.shortLabel, href: `/work/${p.slug}` })),
      { label: 'All work', href: '/work' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Pricing', href: '/pricing' },
      { label: 'Integrations', href: '/#integrations' },
      { label: 'FAQ', href: '/#faq' },
      // Machine-readable brief for language models. Linked rather than left
      // to discovery so crawlers that never guess at /llms.txt still find it.
      { label: 'For AI assistants', href: '/llms.txt' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Book 20 minutes', href: '/book' },
      { label: 'Contact', href: '/#contact' },
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
  /* No GitHub link since D39: the profile lists public repositories named
     after former clients, which would undo the anonymization one click away.
     Restore it once those repositories are private or renamed. */
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
              {/* h3, not h4: the nearest preceding heading is the section h2,
                  and skipping a level breaks screen-reader outline navigation. */}
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-ink-400">
                {group.title}
              </h3>
              <ul className="flex flex-col">
                {group.links.map((l) => (
                  <li key={l.label}>
                    {/* inline-flex + min-h-[24px] gives the link a 24px pointer
                        target (WCAG 2.2 SC 2.5.8). At 13px the text box alone
                        is 16px tall, which is under the floor on touch. */}
                    <a
                      href={l.href}
                      className="inline-flex min-h-[24px] items-center text-[13px] text-ink-300 transition-colors hover:text-white"
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
