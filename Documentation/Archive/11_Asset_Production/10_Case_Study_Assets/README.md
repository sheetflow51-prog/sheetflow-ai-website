# Case Study Assets

Imagery for customer/partner case studies. Editorial documentary feel:
how the work is actually done, what the team actually looks at, what the
output actually is.

## What lives here

- Customer environment photography (workspace, hardware, ambient)
- Anonymized dashboard captures (real data, blurred sensitive)
- Process artifacts (whiteboards, screens-mid-flow, sticky notes)
- Before / after pairs (with permission)

## Tone

Documentary, not promotional. We're not selling — we're showing. If a
photograph looks staged, retake. If a screenshot looks idealized, swap
in a messier real one.

## Composition

- **Wide environmental:** room, desk, hardware — subject reads context
- **Medium working:** hands + screen + notebook visible
- **Tight detail:** one focused element (a chart, a label, a callout)

Always shoot the trio. A case study with only hero-wides is too neat.

## Anonymization

- Faces blurred only with permission; otherwise frame around them
- Logos of unrelated brands: blurred or cloned out
- Sensitive data: replaced with realistic dummy values, never blacked out
- Real names: replaced consistently across all assets in the study

## File naming

`case-{customer-slug}-{shot-type}-v{n}-{YYYYMMDD}.{ext}`

Examples:
- `case-northgate-environmental-v1-20260512.png`
- `case-northgate-detail-chart-v2-20260512.png`
- `case-northgate-tight-screen-v1-20260512.png`

## Story structure

Most case studies use this asset sequence:
1. Environmental hero (the room)
2. Person at work (medium)
3. Screen detail (the SheetFlow surface)
4. Output artifact (the deliverable)
5. Outcome moment (the meeting, the calm, the result)

## Workflow

1. Field shoot OR remote capture via customer
2. Cull, anonymize, color-correct
3. Drop final selects in `_inbox/` with the case slug
4. Review via `13_Asset_Review/`
5. Lock into `12_Final_Exports/case-studies/{customer-slug}/`
