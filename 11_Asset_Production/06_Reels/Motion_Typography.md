# Motion Typography Reels

Type-driven shorts, 8–15s. The cheapest reel to produce, the easiest to
get wrong.

## When to use

- Quote cards from founder/team
- Brand statements
- Section openers in longer videos
- Quiet announcements (no product to show yet)

## Structure

```
0.0–0.6s   Frame is empty — pure atmospheric background, no type yet
0.6–1.4s   Display headline enters by mass (scale 0.96 → 1.0, opacity 0 → 100)
1.4–6.0s   Hold. Subtle subhead may enter at 3.0s with stagger
6.0–8.0s   Type drifts up 24px and fades to 0 over 800ms
8.0–10.0s  Final atmospheric frame holds, sound resolves
```

Total: 10s sweet spot.

## Background plate

Use one of:
- A static atmospheric still (from
  [Luxury_Atmospheres](../02_Midjourney_Prompts/Luxury_Atmospheres.md))
  with subtle parallax / push-in
- A Spline scene capture rendered to MP4
- A loopable cinematic plate from `_archive/plates/`

**Never a flat color background.** That's a lyric video, not SheetFlow.

## Type behavior

- Display weight, single weight per reel
- Tracking -0.02em on display, +0.04em on caps
- White at 92% opacity, never pure white
- Stagger lines by 80ms
- One headline + optional one subhead. Never three lines.

## Forbidden type effects

- Character-by-character typewriter
- Bouncing letters
- Color cycling
- Skewing on entrance
- Dropping in with rotation
- Wave / wobble on body text

## Sound

- Single sustained pad tone
- One subtle "whoosh" on type entrance (designed, not stock)
- One subtle "tail" on type exit
- Mastered at -14 LUFS

## Aspect

9:16 default. 1:1 for LinkedIn.
