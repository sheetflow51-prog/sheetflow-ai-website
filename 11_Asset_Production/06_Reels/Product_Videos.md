# Product Videos

30–60s 16:9 cinematic product films. Used on:
- Site hero (silent loop, 6s segment)
- YouTube (full version)
- Sales / investor decks
- Trade show backdrops

## Structure

```
0.0–3.0s    Atmospheric open — Spline scene or environmental shot
3.0–8.0s    Establish — product on screen, lit cinematically, no UI yet
8.0–18.0s   Demonstrate — three core capabilities (no more), shown
            sequentially, type cards between
18.0–25.0s  Implication — the change in the user's day, shown not told
25.0–32.0s  Resolve — back to atmosphere, end card
```

Total: 30–32s default. Stretch to 45s only for major capabilities.

## Visual rules

- **No fake UI.** All product shots are real product, captured 4K, color-graded.
- **No talking heads.** This is cinema, not a webinar.
- **No bullet point overlays.** Type cards only, full screen, one idea each.
- **No screen recordings.** We re-shoot the product properly with a screen
  capture rig and treat it like a film plate.

## Rhythm

Pulse rhythm. 1.5–2.0s cuts on a hidden tempo (90 BPM is the sweet spot).

## Sound

- Score: low, breathing, no melody until 18s mark, then a single rising line
- Ambient: subtle UI sound design (real product sounds, processed)
- No voice unless brief explicitly requires it

## Type cards

- Set in display weight, white at 92% opacity
- Centered (acceptable here — product video is editorial)
- Hold 1.4s minimum
- One idea per card. Never two.
- Maximum five type cards in a 30s video. Maximum eight in a 45s video.

## Final encode

| Surface             | Codec  | Resolution   | Bitrate | LUFS |
|---------------------|--------|--------------|---------|------|
| Master              | ProRes | 3840×2160    | n/a     | -16  |
| YouTube             | H.265  | 3840×2160    | 35 Mbps | -16  |
| Site hero loop      | H.265  | 1920×1080    | 4 Mbps  | mute |
| Sales deck          | H.264  | 1920×1080    | 12 Mbps | -16  |
