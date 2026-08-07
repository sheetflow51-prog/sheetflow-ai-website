'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles, Play } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Magnetic } from '@/components/motion/Magnetic';
import { Parallax } from '@/components/motion/Parallax';
import { Brackets } from '@/components/signature/Brackets';
import { Trace } from '@/components/signature/Trace';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import { prefersReducedMotion } from '@/lib/utils';
import { publishedTrustLogos } from '@/content/proof';

const reveal = {
  hidden: { opacity: 0, y: 32, filter: 'blur(8px)' },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 + i * 0.12 },
  }),
};

export function Hero() {
  const { track } = useAnalytics();

  /* Client logos require written usage permission from each business. Until
     that exists the strip does not render at all — an empty or placeholder
     logo row in the hero reads as a broken asset, not as honesty. */
  const logos = publishedTrustLogos();

  // Continuous ambient motion mounts only after hydration and only when the
  // visitor hasn't requested reduced motion.
  const [runMotion, setRunMotion] = useState(false);

  /**
   * The ambient core video is desktop-only. This helps real phones and **does
   * not move the Lighthouse score** — the distinction is the point.
   *
   * `/videos/cta-core.mp4` is 2,716,480 bytes, the largest asset the site owns
   * by two orders of magnitude. The obvious inference — that mobile pays 2.7 MB
   * and that removing it is the mobile fix — was measured and is **wrong**. In
   * the mobile Lighthouse run the request completes with **627 bytes
   * transferred** (HTTP 206, a metadata range against a 134 kB moov). Two things
   * hold it there: `preload="metadata"`, and `autoPlay` being applied after
   * hydration rather than in the server HTML, so playback never begins inside
   * the measured window. Total page transfer is 591 KiB, video included.
   *
   * **What the metric misses is still real.** Lighthouse stops observing at
   * load; a phone does not. Once the page settles, autoplay begins and the clip
   * streams and `loop`s — 2.7 MB against a metered mobile plan, for decoration
   * sitting behind a radial mask at 50% opacity, blurred 2px and dimmed to 60%.
   * That cost belongs to the visitor rather than to the audit, which is exactly
   * why no score will argue for fixing it.
   *
   * So this is kept on its own merits and **must not be cited as the reason any
   * mobile number improved.** The levers that move the number are the font and
   * the atmosphere gate; see `layout.tsx` and `DeferredAtmosphere`.
   *
   * Nothing leaves the composition: the poster (`spline_hero_v1.0.svg`, 2,282
   * bytes) is the same artwork this element already renders under reduced motion
   * and before the first frame decodes. Mobile loses the drift inside the blur.
   * Desktop is unchanged. Save-Data and 2G land on the poster at any width.
   */
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const motionOk = !prefersReducedMotion();
    setRunMotion(motionOk);

    // `connection` is Chromium-only; absent elsewhere, which reads as "no
    // reason to hold back" rather than as a reason to assume the worst.
    const conn = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    const thrifty = conn?.saveData === true || /(^|-)2g$/.test(conn?.effectiveType ?? '');

    setShowVideo(
      motionOk && !thrifty && window.matchMedia('(min-width: 768px)').matches,
    );
  }, []);

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden pt-24 pb-20 md:pt-36 md:pb-32">
      {/* Layered backgrounds */}
      <div className="absolute inset-0 -z-10 signature-grid opacity-50" aria-hidden="true" />

      {/* Signature L-bracket frame — recurring brand motif (see VISUAL_DNA § 10.2) */}
      <Brackets inset={32} size={22} animate />

      {/* AI core — placed behind the headline, full-bleed, with subtle scroll parallax */}
      <Parallax
        range={120}
        scale={1.04}
        className="pointer-events-none absolute inset-0 -z-10 mx-auto flex items-center justify-center opacity-90"
      >
        {/* The core is masked to a soft radial falloff rather than clipped to a
            rounded rectangle. At 1440px the container's straight edges sat well
            inside the viewport and the vignette above did not reach them, so the
            "ambient glow" terminated in a visible seam across the headline. A
            mask makes it dissolve into the void instead — the intended effect,
            and the reason no `rounded` radius is needed any more. */}
        <div
          className="aspect-square h-[80vh] max-h-[820px] w-auto max-w-[820px] overflow-hidden opacity-50"
          style={{
            maskImage: 'radial-gradient(ellipse at center, #000 38%, transparent 72%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, #000 38%, transparent 72%)',
          }}
        >
          {/* Reduced motion, a narrow viewport, Save-Data or a 2G link all land
              here: the poster alone, which is what the video element rendered
              for those visitors anyway. Rendering it as an <img> rather than as
              a paused <video poster> is the part that saves the bytes — a
              <video> with a src still opens a media fetch. WCAG 2.2.2 is
              satisfied by construction, since there is no moving content to
              pause rather than a clip we remembered to stop. */}
          {showVideo ? (
            <video
              className="h-full w-full object-cover blur-[2px] brightness-[0.6]"
              src="/videos/cta-core.mp4"
              poster="/posters/spline_hero_v1.0.svg"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              aria-hidden="true"
            />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element --
               next/image would rewrite this through the optimiser; the source is
               a 2.3 kB SVG that is already smaller than any raster it could
               produce, and it is decorative rather than content. */
            <img
              className="h-full w-full object-cover blur-[2px] brightness-[0.6]"
              src="/posters/spline_hero_v1.0.svg"
              alt=""
              aria-hidden="true"
            />
          )}
        </div>
      </Parallax>

      {/* Cinematic vignette */}
      <div
        className="pointer-events-none absolute inset-0 -z-[5]"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 72% 78% at 50% 48%, rgba(6,6,8,0.58) 0%, rgba(6,6,8,0.4) 42%, rgba(6,6,8,0.82) 76%, rgba(6,6,8,0.97) 100%)',
        }}
      />

      <div className="container-edge relative z-10 mx-auto flex flex-col items-center text-center">
        <motion.div initial="hidden" animate="show" variants={reveal} custom={0}>
          <Badge variant="ai" className="mb-7">
            <Sparkles className="h-3 w-3" strokeWidth={2.4} aria-hidden="true" />
            AI Automation Agency
          </Badge>
        </motion.div>

        <motion.h1
          className="headline-monument text-fade text-balance max-w-[20ch]"
          initial="hidden"
          animate="show"
          variants={reveal}
          custom={1}
        >
          We automate the busywork{' '}
          <span className="text-accent-gradient text-glow">running your business.</span>
        </motion.h1>

        <motion.p
          className="mx-auto mt-6 max-w-2xl text-balance text-[17px] leading-[1.55] text-ink-200 [text-shadow:0_2px_16px_rgba(6,6,8,0.85)] md:mt-7 md:text-xl"
          initial="hidden"
          animate="show"
          variants={reveal}
          custom={2}
        >
          SheetFlow builds AI systems that capture leads, follow up on WhatsApp, book
          appointments, and keep your CRM updated — so you stop losing customers to
          slow replies and forgotten tasks.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
          initial="hidden"
          animate="show"
          variants={reveal}
          custom={3}
        >
          <Magnetic strength={10} inner={1.6}>
            <span className="relative inline-flex">
              <Button
                variant="primary"
                size="lg"
                href="/book"
                onClick={() => track('hero_cta_click', { variant: 'audit' })}
              >
                Book a free automation audit
              </Button>
              {runMotion && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg"
                >
                  <motion.span
                    className="absolute inset-y-0 left-0 w-1/2 -skew-x-12"
                    style={{
                      background:
                        'linear-gradient(90deg, transparent, rgba(147, 197, 253,0.28) 38%, rgba(255,255,255,0.42) 50%, rgba(244, 192, 99,0.34) 62%, transparent)',
                    }}
                    initial={{ x: '-160%' }}
                    animate={{ x: ['-160%', '260%'] }}
                    transition={{
                      duration: 1.15,
                      ease: 'easeInOut',
                      repeat: Infinity,
                      repeatDelay: 4.5,
                    }}
                  />
                </span>
              )}
            </span>
          </Magnetic>
          <Magnetic strength={8} inner={1.4}>
            <Button variant="secondary" size="lg" trailing={<Play className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true" />} onClick={() => track('hero_demo_click')}>
              See our work
            </Button>
          </Magnetic>
        </motion.div>

        <motion.div
          className="mt-8 flex items-center gap-2 text-[12px] text-ink-400"
          initial="hidden"
          animate="show"
          variants={reveal}
          custom={4}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-signal-success animate-pulse-live" />
          Free 30-min audit. No commitment. Built for SMBs, agencies & service businesses.
        </motion.div>

        {/* Trust strip — renders only for logos with granted permission. */}
        {logos.length > 0 && (
          <motion.div
            className="mt-14 flex w-full max-w-3xl flex-col items-center gap-4 md:mt-20"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 1.2 }}
          >
            <p className="text-[10px] uppercase tracking-[0.18em] text-ink-400">
              Trusted by growing businesses
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 sm:gap-x-10">
              {logos.map((logo) => (
                <Image
                  key={logo.slug}
                  src={logo.src}
                  alt={logo.name}
                  width={logo.width}
                  height={logo.height}
                  /* 60% → 90% over 240ms per FINAL_EXECUTION_LAYER §2.3. */
                  className="h-5 w-auto opacity-60 transition-opacity duration-[240ms] hover:opacity-90"
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Signature Trace — recurring memory motif under the trust strip */}
        <motion.div
          className={logos.length > 0 ? 'mt-8 md:mt-10' : 'mt-14 md:mt-20'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.6 }}
        >
          <Trace orientation="horizontal" length={180} nodes={5} active={3} />
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="mt-10 flex flex-col items-center gap-2 text-[11px] uppercase tracking-widest text-ink-400 md:mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
          aria-hidden="true"
        >
          <span>See what we automate</span>
          <div className="relative h-12 w-px overflow-hidden bg-white/10">
            <motion.div
              className="absolute left-0 top-0 h-1/3 w-full bg-gradient-to-b from-transparent via-accent-bright to-transparent"
              animate={{ y: ['-100%', '300%'] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      </div>

      {/* Continuous signal beam traveling the hero's bottom edge — the
          "alive, running" pipeline motif as a full-bleed boundary. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-[4] h-px"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/25 to-transparent" />
        {runMotion && (
          <motion.span
            className="absolute inset-y-0 left-0 w-40 rounded-full"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(96, 165, 250,0.9) 42%, rgba(244, 192, 99,0.85) 58%, transparent)',
              boxShadow: '0 0 12px 1px rgba(96, 165, 250,0.5)',
            }}
            initial={{ x: '-20vw', opacity: 0 }}
            animate={{ x: ['-20vw', '120vw'], opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 5.5,
              ease: 'easeInOut',
              repeat: Infinity,
              repeatDelay: 1.4,
            }}
          />
        )}
      </div>
    </section>
  );
}
