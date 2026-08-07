'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { BOOKING_URL } from '@/lib/contact';

/**
 * Root-relative, not bare fragments.
 *
 * `#faq` resolves against whatever page you are on, so on `/services/...` every
 * one of these silently pointed at a section that route does not contain. The
 * leading `/` makes them resolve against the homepage from anywhere. On the
 * homepage itself the browser still treats `/#faq` as a same-document
 * fragment, so nothing about the scroll behaviour there changes.
 */
const NAV_LINKS = [
  { label: 'Services', href: '/services' },
  { label: 'How we work', href: '/#product' },
  { label: 'Reports', href: '/#reports' },
  { label: 'Integrations', href: '/#integrations' },
  { label: 'Results', href: '/#customers' },
  { label: 'FAQ', href: '/#faq' },
];

export function Navigation() {
  const navScrolled = useStore((s) => s.navScrolled);
  const setNavScrolled = useStore((s) => s.setNavScrolled);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [setNavScrolled]);

  // Lock scroll when the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Close menu on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <header
        className={cn(
          'fixed left-0 top-0 z-50 flex h-16 w-full items-center transition-[background-color,backdrop-filter,border-color] duration-300',
          navScrolled || open
            ? 'border-b border-white/[0.06] bg-void/70 backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        <div className="container-edge flex w-full items-center justify-between gap-4 md:gap-8">
          <div className="flex items-center gap-10">
            <Logo />
            <nav className="hidden items-center gap-1 md:flex">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-md px-3 py-1.5 text-[13px] font-normal text-white/55 transition-colors duration-150 hover:bg-white/[0.06] hover:text-white/95"
                  data-cursor="hover"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              href={BOOKING_URL}
              className="hidden sm:inline-flex"
            >
              Book free audit
            </Button>
            {/* Mobile menu trigger */}
            <button
              type="button"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.03] text-white/80 backdrop-blur transition-colors hover:bg-white/[0.06] md:hidden"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-4 w-4" strokeWidth={2} /> : <Menu className="h-4 w-4" strokeWidth={2} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu — full-screen cinematic overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="fixed inset-0 z-40 flex flex-col bg-void/95 pt-20 backdrop-blur-2xl md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Aurora wash to keep the brand atmosphere on mobile too */}
            <div
              className="pointer-events-none absolute inset-0 -z-10"
              aria-hidden="true"
              style={{
                background:
                  'radial-gradient(ellipse 100% 60% at 20% 0%, rgba(59, 130, 246,0.2), transparent 60%), radial-gradient(ellipse 80% 50% at 100% 100%, rgba(233, 162, 59,0.14), transparent 65%)',
              }}
            />
            <nav className="container-edge flex flex-1 flex-col">
              <ul className="mt-4 flex flex-col">
                {NAV_LINKS.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.05 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <a
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="block border-b border-white/[0.06] py-5 text-[28px] font-semibold tracking-tight text-white/90 transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  </motion.li>
                ))}
              </ul>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="mt-auto flex flex-col gap-3 pb-10"
              >
                <Button
                  variant="primary"
                  size="lg"
                  href={BOOKING_URL}
                  className="w-full justify-center"
                  onClick={() => setOpen(false)}
                >
                  Book free audit
                </Button>
                <p className="mt-2 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-ink-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-signal-success animate-pulse-live" />
                  Free 30-min audit · No commitment
                </p>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
