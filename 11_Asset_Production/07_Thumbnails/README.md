# Thumbnails

YouTube, Loom, podcast, and case-study cover images. The hardest small
format — must compress to a clear read at 240 × 135 px and still hold
SheetFlow's restraint at full size.

## Format

- **Aspect:** 16:9
- **Resolution:** 1920 × 1080 px
- **Format:** PNG (working), JPEG-92 (publish)
- **File size:** < 2MB for upload, < 500KB for embed

## Composition rules

1. **One subject, one idea.** No collage thumbnails.
2. **Type optional.** If used: 3 words max, sits in lower 25%.
3. **Face thumbnails:** subject occupies left third, eyes on upper third line.
4. **Object thumbnails:** subject occupies right third (mirror).
5. **No arrows, no circles, no red rectangles.** Ever.

## The 240px test

Resize to 240 × 135. If you can't tell what the video is about, the
thumbnail is wrong. Fix the composition, not the contrast.

## Type style (when used)

- GT America or Söhne, semibold
- White at 92% opacity, 1px subtle shadow at 30% black
- Never outlined, never gradient
- Tracking -0.01em on display sizes

## Forbidden

- Mouth-open reaction faces
- Red/yellow color blocks
- "MUST WATCH" / "INSANE" copy
- Arrow overlays pointing at things
- Multiple subjects with versus framing
- Faux-handwritten scribbles

## Workflow

1. Pick frame from the reel/video at 50% mark or hero moment
2. Drop into Figma `thumbnails.fig` template
3. Add type if needed
4. Export PNG to `_inbox/` as `thumb-{video-slug}-v{n}-{YYYYMMDD}.png`
5. Test at 240px before review
