# Spline Optimization Checklist

Run this before any scene exports to `12_Final_Exports/`.

## Geometry

- [ ] All meshes decimated to target poly budget
- [ ] No hidden geometry left in scene tree
- [ ] No duplicate meshes occupying the same space
- [ ] LODs defined for any object > 5k polys
- [ ] All boolean operations baked, not live

## Materials

- [ ] No more materials than the brief allows
- [ ] All textures ≤ 1024×1024 (2048 only for hero focal surface)
- [ ] Textures compressed (Basis / KTX2 where supported)
- [ ] No PNG textures larger than 400 KB
- [ ] No identical materials duplicated under different names

## Lighting

- [ ] Light count within brief limit
- [ ] Shadows enabled only on lights that need them
- [ ] Shadow map resolution capped at 1024 (2048 only for hero key)
- [ ] No real-time GI unless explicitly required

## Performance

- [ ] Bundle size measured and recorded in brief
- [ ] FPS measured on M1 baseline machine: 60 sustained
- [ ] FPS measured on mid-tier Windows laptop: 45+ sustained
- [ ] Mobile fallback exists and is < 1.5 MB

## Export

- [ ] Web embed exported with correct DPR cap (2.0)
- [ ] MP4 fallback rendered at 1920×1080 H.265, 6s loop
- [ ] Static PNG snapshot for `<noscript>` fallback
- [ ] Filenames follow: `{scene-slug}-v{n}-{YYYYMMDD}.{ext}`

## Hand-off

- [ ] Files in `12_Final_Exports/spline/{scene}-v{n}/`
- [ ] [Production Status](../15_Production_Workflows/Production_Status.md) updated
- [ ] Diff against previous version logged
