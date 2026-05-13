# brand-os/

Operational layer for the SheetFlow brand. Source-of-truth tokens, motion library, component language, content rules, and governance.

For the master index and reading order, see [`../SHEETFLOW_BRAND_OS.md`](../SHEETFLOW_BRAND_OS.md).
For the foundational philosophy, see [`../SHEETFLOW_VISUAL_DNA.md`](../SHEETFLOW_VISUAL_DNA.md) (the Constitution).

## Phase index

| # | Phase | Doc | Code |
|---|---|---|---|
| 1 | Design Tokens | [TOKENS.md](./01_design-tokens/TOKENS.md) | [tokens.ts](./01_design-tokens/tokens.ts) · [tokens.json](./01_design-tokens/tokens.json) |
| 2 | Motion OS | [MOTION_OS.md](./02_motion-os/MOTION_OS.md) | [motion.ts](./02_motion-os/motion.ts) |
| 3 | Component Language | [COMPONENT_LANGUAGE.md](./03_component-language/COMPONENT_LANGUAGE.md) | (lives in `10_Final_Website/src/components/`) |
| 4 | Content DNA | [SHEETFLOW_CONTENT_DNA.md](./04_content-dna/SHEETFLOW_CONTENT_DNA.md) | — |
| 5 | Social + Video | [SOCIAL_VIDEO_SYSTEM.md](./05_social-video/SOCIAL_VIDEO_SYSTEM.md) | — |
| 6 | Product UI | [PRODUCT_UI_EXPANSION.md](./06_product-ui/PRODUCT_UI_EXPANSION.md) | — |
| 7 | Governance | [EXPERIENCE_GOVERNANCE.md](./07_governance/EXPERIENCE_GOVERNANCE.md) | — |
| 8 | Exportable | [EXPORTABLE_BRAND_SYSTEM.md](./08_exportable/EXPORTABLE_BRAND_SYSTEM.md) | (future package: `@sheetflow/brand-os`) |

## Inheritance chain

```
tokens.ts  →  motion.ts  →  components  →  content  →  surface  →  governance  →  package
```

Read in order. Build in order. Ship in order.
