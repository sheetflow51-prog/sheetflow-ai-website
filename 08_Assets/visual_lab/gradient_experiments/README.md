# Gradient Experiments

> Tested recipes for ambient light, hero atmosphere, and signal accents.

---

## The aurora background (page-wide)

```css
background:
  radial-gradient(ellipse 80% 60% at 20% 20%, rgba(99, 102, 241, 0.18), transparent 60%),
  radial-gradient(ellipse 60% 50% at 80% 30%, rgba(139, 92, 246, 0.12), transparent 60%),
  radial-gradient(ellipse 100% 60% at 50% 100%, rgba(6, 182, 212, 0.06), transparent 70%);
```

**What works**: Three radial blobs at different positions create asymmetry. The 0.18/0.12/0.06 alpha cascade creates a clear hierarchy — indigo dominates, violet supports, cyan whispers.

**What didn't work**: Equal-alpha blobs (0.15/0.15/0.15) → muddy, no focal point. Rejected.

**Production**: `AmbientBackground.tsx` makes the first two blob centers track the cursor (smoothed lerp 0.04). The third blob (cyan, bottom) stays fixed because horizon-line cues are about composition, not interaction.

---

## The accent halo (around CTA buttons)

```css
box-shadow:
  0 0 0 1px rgba(99, 102, 241, 0.5),
  0 4px 16px rgba(99, 102, 241, 0.35),
  inset 0 1px 0 rgba(255, 255, 255, 0.15);
```

**Why three layers**:
1. The 1px halo (0,0,0,1) prevents edge softness at small sizes.
2. The drop glow (0,4,16) does the brand work.
3. The inner highlight (inset) sells "this surface catches light" — without it, the button looks flat.

**On hover**: same recipe, alphas pushed +20%, drop glow pushed to (0,8,24).

---

## Mesh gradient experiments (rejected for now)

Tried React Three Fiber `MeshGradient` shader with two color stops drifting on a sine wave.
- **Visually**: Stunning.
- **Cost**: ~6ms/frame on M-series Macs, ~14ms on midrange laptops.
- **Verdict**: Not worth it given a CSS aurora gets 80% of the visual win at 0% cost.
- **Re-evaluate when**: WebGPU adoption is mainstream and we can offload to a single non-blocking pass.

---

## Conic gradient (specialty use)

Used for the "intelligence ring" around the AI core idle state:

```css
background: conic-gradient(
  from 0deg,
  transparent 0deg,
  rgba(99, 102, 241, 0.4) 60deg,
  transparent 120deg,
  transparent 360deg
);
animation: rotate 8s linear infinite;
```

**Where adopted**: Loading screen ring, around floating dashboard cards on hover.

**Where rejected**: Hero. The rotation read as "loading," not "alive."

---

## The "do not use" list

- **Pure black → pure white gradients** → looks like a generic SaaS design template. Always introduce hue.
- **Hard color stops** (no transparency) → reads as 2018 fluent design. Always include `transparent` waypoints.
- **Saturation > 0.7** in any backdrop blob → competes with content. Cap at 0.6.
- **Animated mesh gradients on scroll** → makes the page feel like Vegas. Animate position only, not colors.

---

*Production CSS lives in `src/app/globals.css` under `.aurora-bg` and `tailwind.config.ts → backgroundImage`.*
