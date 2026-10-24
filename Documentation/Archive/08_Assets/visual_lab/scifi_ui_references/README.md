# Sci-Fi UI References

> Cinema-grade fictional interfaces. We borrow the vocabulary, not the visuals.

---

## The reference set

| Source | What we study | What we don't copy |
|---|---|---|
| **Blade Runner 2049** (Joi interface, replicant scanner) | Translucent volumetric panels; vertical/horizontal axis emphasis; teal-violet light interplay | The aggressive Japanese typography & saturated color casts |
| **Iron Man HUD** (Tony's helmet, FRIDAY UI) | Per-panel data hierarchy; ring-of-text framing; depth via overlapping translucent layers | Spinning gyroscopic frenzy, busy detail-for-detail's-sake |
| **Foundation** (Apple TV+) — Empire interface | Calm authority; serif-meets-tech contrast; gold/black palette restraint | The royal/mythological connotations |
| **The Expanse** — UN Mars hybrid HUDs | Functional density; numeric truth-telling; "this is a working tool" feel | The grungy, low-grade-monitor look |
| **Westworld** — host diagnostic UI | Live-data hand-edits; cinematic monospace typography; restraint in motion | The medical/violation undertone |

---

## The three things sci-fi UI gets right

### 1. Hierarchy via depth, not weight
Sci-fi UIs put primary data in the front plane (no blur, full opacity), secondary data slightly back (8% opacity drop, blur 4px), tertiary data far back (15% opacity, blur 8px).

**Translation**: Our holographic dashboard uses transformZ stacking (40px / -20px / -40px) with corresponding opacity. It's what makes the AIDashboard section feel like a real holographic surface.

### 2. Information has weight
A number that *means something* is rendered larger and brighter than its label. Not by 10% — by 3-4×.

**Translation**: Our `StatCounter` renders the value at 5xl with the label at 12px below it. The 4× ratio reads as "this is the data; that is the chrome."

### 3. Motion as confirmation
When something happens in a sci-fi UI, the system *responds*. A read-out arrives, a panel resolves, a status indicator flashes. Nothing happens silently.

**Translation**: Every intelligence event in our UI has a paired motion (signal arrival → green pulse; threshold breach → amber dot; resolution → check-mark stamp).

---

## The three things sci-fi UI gets wrong (for us)

- **Too much chrome.** Half a sci-fi HUD is decorative ticks, ranges, calibration marks. We strip all of it; only data and frame remain.
- **Constant motion.** Sci-fi UIs hum. Ours can hum but must *quiet* under attention — the moment a user focuses on a card, ambient motion within it should pause.
- **Audio.** Iron Man's UI is half-sound. We have none. All meaning must communicate visually.

---

## Specific patterns adopted

### Scan line overlay (very subtle)
```css
.holographic::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(
    0deg,
    rgba(255, 255, 255, 0.04) 0px,
    rgba(255, 255, 255, 0.04) 1px,
    transparent 1px,
    transparent 4px
  );
  pointer-events: none;
}
```

The 0.04 alpha is critical — anything higher reads as "old monitor," anything lower is invisible. Used in `AIDashboard.tsx`.

### HUD callout (label + leader line)
```
[label]  ────────  [data point]
```
Used in workflow nodes (`WorkflowUniverse.tsx`) — each node has a kicker label, an icon, and a font-mono sub-label, separated by horizontal rhythm.

### Live indicator (corner badge)
```
●  UNIVERSE ONLINE
```
A green dot with `animate-pulse-live` + uppercase mono label. Sci-fi grammar; warm enough that it doesn't feel cold.

---

## Anti-patterns we reject hard

- Brackets framing every panel: `[ DATA ]` → reads as cosplay
- Glitch text on hover (RGB offset jitter) → 2010s cyberpunk; not our brand
- Large rotating ring with no purpose → decoration, not communication
- Schematics of fake circuits → fan-art aesthetic; rejected
- Random binary in the background (010101...) → loud, lazy, embarrassing
