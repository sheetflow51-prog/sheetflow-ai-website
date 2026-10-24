/**
 * Device & Browser Mockup Engine.
 *
 * ## Object-mimicry, and the line it does not cross
 *
 * `SHEETFLOW_VISUAL_DNA.md` § 9 rejects *"Skeuomorphism 2.0 — faux 3D buttons,
 * wood textures, leather"* as regressive, and `VISUAL_DNA_V2.md` § 10 keeps
 * that rejection. Drawing a recognisable object is **not** the same thing: what
 * § 9 rejects is the imitated *surface*, not the imitated *silhouette*.
 *
 * So these frames carry the proportions, corner radius, notch and window chrome
 * a visitor recognises without a caption — and none of the gloss, bevel, chrome
 * bezel or drop-shadowed 3D body that would make them a pastiche. They are
 * drawn flat, in brand tokens, in one border and two fills.
 *
 * ## One silhouette per object class
 *
 * `VISUAL_DNA_V2.md` § 3.2 assigns one silhouette per object class, and both
 * frames here belong to *"an artifact the system produced"*. Which frame is
 * correct is decided by the published copy, not by preference: a stage whose
 * copy says *"answers on WhatsApp"* is showing a phone, and a section about
 * websites and dashboards is showing a browser window. Swapping them would draw
 * the wrong object with the right pixels.
 *
 * ## What was taken from Magic UI's `Safari`, and what was not
 *
 * Its full registry source was retrieved and read (RC4). The structural ideas
 * worth keeping: a screen box derived from constants rather than hand-tuned
 * offsets, and an `aspect-ratio` wrapper so the frame scales without measuring.
 *
 * Dropped: the mask punch (`safariPunch`), which exists so injected media can
 * sit *behind* SVG chrome — nothing is injected here, the screens are drawn, so
 * the mask solves a problem this component does not have. Also dropped: macOS
 * traffic lights and a photoreal toolbar, per § 9 above. The three window dots
 * are rendered flat and unlit for exactly that reason.
 *
 * Server components. Zero JavaScript.
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface DeviceFrameProps {
  children: React.ReactNode;
  className?: string;
}

/** A phone. Proportions, corner radius and notch; no bezel, no gloss. */
export function DeviceFrame({ children, className }: DeviceFrameProps) {
  return (
    <div className={cn('vos-device', className)}>
      <span className="vos-device-notch" aria-hidden="true" />
      <div className="vos-device-screen">{children}</div>
    </div>
  );
}

export interface BrowserFrameProps {
  /**
   * What the address bar reads.
   *
   * A `ReactNode` rather than a `string` because the one caller that needed
   * this engine first needed **four** addresses swapped in place by a CSS
   * `:checked ~` selector, with no JavaScript. A `string` prop would have
   * forced that caller to re-implement the frame — which is how the frame came
   * to live inline in a section in the first place.
   */
  url: React.ReactNode;
  /**
   * One sweep across the glass, so the frame reads as a screen that is *on*
   * rather than as a picture of one. A single element on the compositor, and
   * removed entirely under `prefers-reduced-motion`.
   */
  sheen?: boolean;
  /** Screen aspect, as a CSS `aspect-ratio` value. Defaults to 640/380. */
  ratio?: string;
  className?: string;
  children: React.ReactNode;
}

/** A browser window. Chrome is CSS so it stays crisp at any width. */
export function BrowserFrame({
  url,
  sheen = false,
  ratio,
  className,
  children,
}: BrowserFrameProps) {
  return (
    <div className={cn('vos-browser', className)}>
      <div className="vos-browser-chrome">
        <span className="vos-browser-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="vos-browser-omnibox" aria-hidden="true">
          {url}
        </span>
      </div>

      <div
        className="vos-browser-screen"
        style={ratio ? ({ '--vos-browser-ratio': ratio } as React.CSSProperties) : undefined}
      >
        {children}
        {sheen ? <span className="vos-browser-sheen" aria-hidden="true" /> : null}
      </div>
    </div>
  );
}
