# Blockers

> **Written 2026-08-08 (Phase Z).** Everything on this list stopped *something*
> from happening this session. Nothing on this list stopped the release.
>
> The engineering is done and verified locally. What remains is a domain nobody
> has bought, a branch nobody has reconciled, a deployment nobody has approved,
> and three credentials nobody has rotated. Each is a decision or a purchase,
> not a task that was skipped.
>
> Ordered by what it costs to leave unresolved.

---

## RC1 update — what changed about these blockers

**B2 is cheaper than it looked.** `NEXT_PUBLIC_SITE_URL` is **not set locally**,
so the build falls back to the value hard-coded in `layout.tsx`, `sitemap.ts`,
`robots.ts`, `llms.txt/route.ts` and `structured-data.ts`: **`https://sheetflow.ai`**.

Every canonical, `og:url`, sitemap `<loc>` and JSON-LD `@id` in the production
build already points at the intended domain. **There is no code change in B2** —
it is a domain purchase plus removing or correcting one environment variable on
Vercel. The entity-graph rewrite this document previously implied is not
required.

**The remote preview blocker is now firmer, not softer.** D3 previously rested
on `list_teams` returning empty, which is equally consistent with "wrong
account" and "no teams". RC1 passed the founder's real org ID
(`team_AaJceK7wRwOKqcdhPOo2GrnS`, read from `.vercel/project.json`) directly to
`list_projects` and got `Failed to list projects`. The MCP is authenticated to a
principal that **cannot see this org at all**. No remote preview can be produced
from this session by any route.

---

## B2 — `sheetflow.ai` is not attached, and every canonical points at the wrong host

**Status:** blocked on the founder. **Cost of delay: rising.**

`vercel domains ls` returns **0 domains**. The domain has not been purchased or
attached, so nothing resolves at `sheetflow.ai`.

**Corrected in RC1 — an earlier revision of this section overstated the
problem.** It said `NEXT_PUBLIC_SITE_URL` "resolves to a `vercel.app` subdomain,
and every canonical points at it". That is true of the **Vercel environment**,
where the variable is set. It is **not** true of the code: the variable is unset
locally and every consumer falls back to `https://sheetflow.ai`, so the
production build already emits the intended host in every canonical, `og:url`,
sitemap `<loc>`, `llms.txt` reference and JSON-LD `@id` — including all ten
case-study `@id`s, five of which carry a real third party's name.

**What is actually blocked**, therefore:

- The domain does not exist yet, so those correct canonicals currently point at
  a host that does not resolve.
- The Vercel environment variable **overrides** the correct fallback with a
  `vercel.app` value, so a deploy today would publish the wrong host even though
  the code is right.

**Why it still matters, and gets worse.** The entity graph has gone from 3
case-study `@id`s at Phase K, to 8 at Phase Y, to **10 now**. Inviting indexing
on a `vercel.app` host and attaching the domain afterwards re-hosts the whole
graph and discards whatever authority accrued — the exact cost the `@id`
architecture exists to avoid.

**The good news is the scope.** There is **no code change** in B2. It is a
purchase, a DNS attachment, and one environment variable — possibly just
*deleting* that variable, since the fallback is already correct.

**Possible resolutions**, in order of preference:

1. **Buy `sheetflow.ai`, attach it in Vercel, then delete or correct
   `NEXT_PUBLIC_SITE_URL`, and redeploy.** Deleting it is sufficient and is the
   smaller change: the code's fallback is already `https://sheetflow.ai`.
   Everything else is parameterised off that one value — no code change is
   required, which is deliberate.
2. **Attach any domain the founder already owns** and set the variable to it.
   Less ideal for brand, identical for SEO mechanics. Still far better than a
   `vercel.app` subdomain.
3. **Deploy to the `vercel.app` host with indexing suppressed** — ship, but keep
   `robots.txt` disallowing crawlers until a domain exists. Preserves the option
   to attach later at no cost, at the price of no organic discovery meanwhile.

**Do not** invite indexing on the current host and attach a domain afterwards.
That is the one path that spends the authority and then discards it.

---

## Production deployment — not attempted, and that is deliberate

**Status:** blocked on founder approval. **Unchanged since Phase K.**

Deploying is an outward-facing action. No approval for it exists, so it was not
performed this phase either — the same gate that has held for four phases.

Two prior attempts are worth recording so this is not re-litigated:

- `vercel --prod` was **blocked by the session permission policy** on Phase K and
  Phase L.
- The Vercel MCP alternative was **evaluated and rejected on the merits**:
  `deploy_to_vercel` creates a *new* project from a file tree, so it would fork
  a duplicate rather than deploy the linked project. That is worse than not
  deploying.

**The verified artifact is the local production build** — the same `next build`
output that the whole test suite, every bundle measurement and every Lighthouse
run in this repository were taken against. It is byte-for-byte what a deploy
would upload.

**Resolution:** the founder runs `vercel --prod` from this directory. Settle B2
first if at all possible, for the reason above.

---

## D12 — preview deployments are SSO-protected

**Status:** blocked on a founder security setting.

Vercel preview URLs sit behind SSO, so a preview cannot be audited
anonymously — no external Lighthouse run, no anonymous crawl check, no sharing a
link with someone who is not on the team.

This is **why local verification has been the honest channel for four phases**,
and it is not a workaround: the local production build is the identical
artifact.

**Possible resolutions:**

1. Set a **protection bypass secret** and give it to the audit tooling. Keeps
   previews private, makes them checkable. Recommended.
2. Relax preview protection to public. Simpler, and exposes unreleased work.
3. Leave as is and keep verifying locally. Costs nothing except the ability to
   send someone a link.

---

## D2 — `origin/main` and the release branch have diverged

**Status:** blocked on the founder. **13 ahead, 1 behind, no fast-forward path.**

`feat/m01-foundation` carries everything from M01. `origin/main` has one commit
that is not in it. There is no fast-forward, so reconciling requires either a
merge commit, a rebase, or a force push — and a force push discards whatever
that one commit is.

**Nothing has been attempted**, because every option here is destructive in a
way that is cheap to get right and expensive to get wrong.

**Possible resolutions:**

1. **Inspect the one commit on `origin/main` first** (`git log origin/main
   ^feat/m01-foundation`). If it is trivial or superseded, merge it forward and
   push normally — no force required.
2. Merge `origin/main` into the branch, resolve, then open a PR. Preserves both
   histories. Safest.
3. Force-push the branch over `main`. Fastest, and **discards that commit**.
   Only after (1) establishes it is disposable.

---

## 🔐 Three credentials, still unrotated — and this is a pattern, not three accidents

**Status:** blocked on the founder. **None is public. All three should still be
rotated.**

| Credential | Where | Found |
|---|---|---|
| **Twilio Account SID + Auth Token** | `PMA_Automation_Agency/twilio-demo/call.js`, hardcoded, beside the founder's personal mobile. **A duplicate exists in `Downloads/AI_Projects/`** | Phase Y |
| **Groq API key** | `ai_content_engine/config.json` — in a file whose own comment claims *"All YOUR_\* values are safe placeholders"* | Phase Y |
| **WhatsApp Access Token + n8n webhook URL** | Airtable base `Saraswati Dental Clinic CRM`, `Settings` table, plain `singleLineText` | Phase M |

**There is no live incident.** None of these directories is a git repository, so
nothing was pushed; an anonymous fetch of the Airtable base showed no
token-shaped string.

**They still need rotating**, and the reason is specific: the two file-based
credentials sit **inside OneDrive**, so they are synced to Microsoft's servers
and present in file version history. "Not in git" is not the same as "not
replicated".

**Order of action:** rotate the Twilio auth token → revoke the Groq key → move
both to `.env` → delete the duplicate `PMA_Automation_Agency` copy → move the
WhatsApp token into n8n's credential store.

**The habit worth adopting** — three findings across three phases is a pattern:
no key in any file that is not `.env`, and `.env` in `.gitignore` before the
first key goes in.

---

## 13,822 lines of internal systems have no version control

**Status:** not blocked — nobody has done it. **Highest-value non-website work
available.**

Seven git repositories exist on this machine: five client sites and two vendored
libraries. **None of the five internal systems** — the accounting OS, the lead
engine, the WPC pipeline, the voice receptionist, the bank parser — is under
version control. No history, no branches, no remote. Several live in OneDrive,
where a sync conflict is the closest thing to a backup they have.

This changes nothing about what may be published. It is simply the largest
un-mitigated risk in the workspace, and `git init` plus a private remote is an
afternoon.

---

## Capabilities this session did not have

Recorded so the next session does not rediscover them — and, more usefully,
**re-tests them**, because this phase proved that a recorded unavailability can
be stale.

**Re-tested in RC4 (2026-08-10). Two rows changed, and one of them changed for
the worse — see the note under the table.**

| Capability | State (RC4) | Consequence |
|---|---|---|
| **GitHub MCP** | ⛔ auth | Unchanged. Non-interactive sessions cannot complete OAuth. **Fully substituted** by `gh` CLI and direct HTTP |
| **Netlify MCP** | ✅ available | Still connected. Not needed this phase |
| **Context7 MCP** | ⛔ **did not connect** — *was ✅ in Phase Z* | Configured in `.mcp.json`; no tools surfaced. Substituted by `WebFetch` against the Magic UI shadcn registry, which is how `Safari`'s source was read |
| **21st.dev / Magic MCP** | ⛔ not installed, needs an API key | Unchanged. Nothing was wanted from it |
| **chrome-devtools MCP** | ⛔ **configured, did not connect** | Sharper than the old *"not exposed"*: it **is** in `.mcp.json` and still unavailable. No impact — `npm run trace` / `npm run profile` cover it |
| **playwright MCP** | ⛔ **did not connect** | No impact at all. The repo's own `@playwright/test` ran all 198 tests and every capture this phase |
| **sequential-thinking MCP** | ⛔ did not connect | No impact |
| **filesystem MCP** | ⛔ did not connect | No impact — built-in file tools cover it |
| **Vercel MCP** | ⛔ authenticated to the wrong account (D3) | Unchanged. CLI used instead where needed |
| Figma / Canva / Notion / Slack / Airtable / Calendly / Adobe / ElevenLabs / Google Workspace | ✅ available | **Deliberately unused.** The deliverable is production React and CSS in this repository, not a design file or a message |
| Roboflow / Vaisala / Autodesk | ⛔ need auth | None relevant to this project |

**The finding worth carrying forward: every stdio MCP this project configures is
currently dead** — all five of them, `context7` included, which a previous phase
recorded as working. None blocked anything, because five of the six were already
substituted by tooling that lives in the repo. That is the argument for the
repo's own `scripts/` directory existing, and it is why no phase here has ever
depended on an MCP to verify a claim.

**Standing instruction, reaffirmed:** re-test every row before repeating its
conclusion — in **both** directions. Phase Z proved an unavailable capability can
come back (Netlify). RC4 proved an available one can go away (Context7). A
recorded capability state is a hypothesis with a date on it, not a fact.

---

## Open architecture questions the founder owns

Neither blocks the release. Both block *cleanup*.

**A1 — is the Spline/3D direction still live?** `src/components/three/` is
imported by no rendered code and the bundle contains **zero Three.js symbols**,
yet six dependencies exist for it and their peer conflict forces
`--legacy-peer-deps` on every install. Removing them resolves D6 as well.
Nobody can answer this except whoever knows whether that direction is coming
back.

**A2 — does the homepage's decorative composition survive its measured cost?**
Paint and compositing are **73–91%** of the main thread; the atmosphere costs
~128 ms per 4 s (~9% duty cycle). **Current recommendation: do nothing.** 9%
does not justify weakening the visual signature, and Phase J already proved the
JavaScript arm is not the lever (Mann-Whitney U = 57.5 against a critical 62 —
not significant, and retracted).

---

## What is deliberately *not* on this list

**More pages.** The site has 11 content routes covering services, work, pricing
and booking. Adding a blog or a second tier of service pages is a marketing
decision that needs evidence someone is searching for it — not an engineering
gap, and not a blocker.

**Outcome metrics.** No engagement has a measured, client-confirmed result, so
every case study reads *"Not publicly disclosed."* That is the correct published
state under D24, enforced by the type system and asserted by test. It is not a
gap waiting to be filled; it is a boundary, and it holds until a client confirms
a number in writing.
