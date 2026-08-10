/**
 * Device Mockup Engine.
 *
 * ## Object-mimicry, and the line it does not cross
 *
 * `SHEETFLOW_VISUAL_DNA.md` § 9 rejects *"Skeuomorphism 2.0 — faux 3D buttons,
 * wood textures, leather"* as regressive, and `VISUAL_DNA_V2.md` § 10 keeps
 * that rejection. Drawing a recognisable object is **not** the same thing: what
 * § 9 rejects is the imitated *surface*, not the imitated *silhouette*.
 *
 * So this frame has a phone's proportions, its rounded corners and its notch —
 * the silhouette a visitor recognises without a caption — and none of the
 * gloss, bevel, chrome bezel or drop-shadowed 3D body that would make it a
 * pastiche. It is drawn flat, in brand tokens, in one border and two fills.
 *
 * ## Why a phone here at all
 *
 * `VISUAL_DNA_V2.md` § 3.2 assigns one silhouette per object class, and
 * "an artifact the system produced" is a framed rectangle. A stage whose
 * published copy says *"answers on WhatsApp"* is showing a phone; showing that
 * same content in a browser window would be the wrong object, and showing it in
 * a bare card would be no object at all.
 *
 * ## Not yet extracted
 *
 * `BrowserFrame` belongs in this module and currently lives inline in
 * `sections/DigitalCraft.tsx`. It is not moved here in this pass because that
 * section is out of scope for this iteration — see `VISUAL_OPERATING_SYSTEM.md`
 * § "Migration", where it is the first item.
 *
 * Server component. Zero JavaScript.
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface DeviceFrameProps {
  children: React.ReactNode;
  className?: string;
}

export function DeviceFrame({ children, className }: DeviceFrameProps) {
  return (
    <div className={cn('vos-device', className)}>
      <span className="vos-device-notch" aria-hidden="true" />
      <div className="vos-device-screen">{children}</div>
    </div>
  );
}
