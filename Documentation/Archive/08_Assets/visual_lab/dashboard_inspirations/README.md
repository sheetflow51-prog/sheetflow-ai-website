# Dashboard Inspirations

> Floating analytics, real-time signals, the surface of an intelligent product.

---

## The reference set

| Source | Lesson |
|---|---|
| **Linear (Insights)** | Dashboards can be quiet. Most data lives in tabular density; the cinematic moments are reserved for "this number changed." |
| **Vercel Analytics** | Live counters with ambient pulses. The page itself feels like it's breathing because the numbers are. |
| **Replit Workspace** | Multi-pane choreography. Status indicators across the top, action surface in the middle, log/output below. |
| **Plausible** | Restraint. Big numbers, single charts, no chrome. Could go further but trusted defaults already feel premium. |
| **Stripe Dashboard (Atlas)** | Composition. Floating filter chips, sticky page header, glass-shadowed primary card. |
| **Posthog** | The opposite — busy, but the busy-ness is communicated through hierarchy (kicker / metric / sub) rather than visual chaos. |

---

## Pattern library (what we've adopted from each)

### From Linear: the calm dashboard
- Numbers on the dashboard don't pulse unless something changed in the last 5 minutes.
- Pulse: 2 second sine on opacity (1 → 0.5 → 1).
- We adopted this in `Footer.tsx` (status dot) and reserved it for `live`-tagged elements only.

### From Vercel: counter-up on scroll-into-view
- Stats animate from 0 to value, ~1.8s, cubic ease-out.
- We adopted this in `AIDashboard.tsx → StatCounter`.

### From Replit: multi-pane choreography
- Top status bar: live indicators
- Middle: primary surface
- Bottom: secondary information / actions
- We adopted this implicitly in `AIDashboard.tsx`'s "main card + floating signal cards" composition.

### From Stripe: glass-elevated primary card
- Primary card has `box-shadow: 0 16px 60px rgba(0,0,0,0.5)`, dropped onto a soft accent gradient backdrop.
- We adopted this via `.glass-strong` (the main dashboard card uses this variant).

---

## The three things our dashboard surface must communicate

1. **It's alive.** A pulse, a counter, a live badge — something moves at all times.
2. **It's intelligent.** A signal arrives that the user didn't request — a callout appears, a number shifts.
3. **It's calm.** No more than one "alarm" element on screen at a time. Nothing flashing red.

---

## What we don't do (yet)

- **Real-time streaming charts.** The hero dashboard render is static. Real-time WebSocket-driven data is in scope for the product UI, not the marketing dashboard. (See `04_3D_Concepts/workflow_universe/workflow_systems.md` for the live-flow concept.)
- **3D dashboard widgets.** Every cell in our dashboard is flat. The *composition* implies depth via Z stacking; the cells themselves remain 2D for clarity.
- **Drag-to-rearrange demo.** A great Awwwards trick but a nightmare on touch — and never necessary on a marketing site. Save for product.

---

## Anti-patterns observed

- **Bloomberg-density dashboards** on marketing sites — communicates complexity, not capability. We chose the opposite: 2 stats + 1 chart + 2 floating cards.
- **Pie charts** — too 2010s; readers can't parse small slices. We use bar/line only.
- **Color-coded everything** — once you have 4+ colors, none of them mean anything. We use exactly: indigo (primary), green (success), amber (warning), red (danger). Used sparingly.

---

*Production hook: `src/components/sections/AIDashboard.tsx`*
