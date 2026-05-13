# Midjourney Prompt Library

Cinematic prompts engineered for SheetFlow's luxury futurism. Every prompt
in this library has been designed to **avoid the cliché trap** of generic AI art.

---

## Categories

| File                                          | Use case                                |
|-----------------------------------------------|-----------------------------------------|
| [Hero_Scenes.md](Hero_Scenes.md)              | Homepage hero stills                    |
| [Intelligence_Systems.md](Intelligence_Systems.md) | Abstract AI / system imagery       |
| [Luxury_Atmospheres.md](Luxury_Atmospheres.md) | Background plates, brand atmosphere    |
| [Cinematic_Dashboards.md](Cinematic_Dashboards.md) | Product/dashboard inspiration       |
| [Sci_Fi_Environments.md](Sci_Fi_Environments.md) | Premium spaces, no cyberpunk          |
| [Launch_Posters.md](Launch_Posters.md)         | Key art, announcement compositions     |
| [Typography_Compositions.md](Typography_Compositions.md) | Type-driven visuals          |
| [Futuristic_Portraits.md](Futuristic_Portraits.md) | Founder & team imagery             |
| [AI_Infrastructure.md](AI_Infrastructure.md)   | Server/network/architecture stills     |
| [Prompt_Guidelines.md](Prompt_Guidelines.md)   | Rules every prompt must follow         |

---

## Universal SheetFlow prompt suffix

Every prompt ends with this style anchor unless explicitly overridden:

```
shot on ARRI Alexa 65, Roger Deakins lighting, Greig Fraser composition,
volumetric atmosphere, deep negative space, cool sapphire and warm amber
two-temperature lighting, matte ceramic and brushed graphite materials,
85mm shallow depth of field, ultra-restrained color, no neon, no rgb,
no glow, no lens flare, editorial cinematography, Apple keynote restraint
--ar 16:9 --style raw --stylize 200 --v 6
```

For verticals (reels, posters, social): swap `--ar 16:9` for `--ar 9:16` or `--ar 4:5`.

---

## What we never write into prompts

- "cyberpunk", "neon", "rgb", "glowing", "futuristic city"
- "AI brain", "neural network", "data points"
- "holographic UI" (use "depth-layered glass panels" instead)
- "highly detailed", "8k", "octane render" — these don't help v6
- "trending on artstation" — instant generic

If a prompt contains any of these, it's rejected at intake.

---

## Prompt versioning

Each prompt logs:

- **Variant ID** (e.g. `hero-core-v3`)
- The exact prompt string
- Best seed(s)
- Best generation IDs (Midjourney link or `_archive/midjourney/{id}.png`)
- One-line note on what worked

See [Prompt_Guidelines.md](Prompt_Guidelines.md) for the full protocol.
