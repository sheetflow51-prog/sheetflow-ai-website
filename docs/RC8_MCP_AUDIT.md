# RC8 — MCP Ecosystem Audit & Authorization

**Date:** 2026-08-11 · **Host:** Windows 10 Pro 19045 · **Session:** `4a29acdc` (claude-vscode)
**Rule applied throughout:** nothing is called "working" unless it was invoked and returned. Configured, running, and usable are three different facts and are never merged.

---

## 0. The headline

Five local MCP servers are configured correctly and **all five connect fine when launched by the CLI** (11–15 s). **All five failed in this agent session**, each timing out at exactly 30 000 ms. That is not a configuration fault — it is a startup-latency fault, and it has a measured cause and a concrete fix.

GitHub MCP is broken for a different, unrelated reason, and its fix is verified end-to-end.

---

## 1. Working MCPs

### 1a. Remote connectors — transport verified via `claude mcp list`

| Server | Endpoint | Transport |
|---|---|---|
| Adobe for creativity | `adobe-creativity.adobe.io/mcp` | ✅ Connected |
| Airtable | `mcp.airtable.com/mcp` | ✅ Connected |
| Autodesk Product Help | `developer.api.autodesk.com/…/mcp` | ✅ Connected *(see §5)* |
| Calendly | `mcp.calendly.com` | ✅ Connected |
| Canva | `mcp.canva.com/mcp` | ✅ Connected |
| ElevenLabs | `api.us.elevenlabs.io/v1/mcp` | ✅ Connected |
| Emergent | `mcp.emergent.sh` | ✅ Connected |
| Figma | `mcp.figma.com/mcp` | ✅ Connected |
| Gmail | `gmailmcp.googleapis.com/mcp/v1` | ✅ Connected |
| Google Calendar | `calendarmcp.googleapis.com/mcp/v1` | ✅ Connected |
| Google Drive | `drivemcp.googleapis.com/mcp/v1` | ✅ Connected |
| Netlify | `netlify-mcp.netlify.app/mcp` | ✅ Connected |
| Notion | `mcp.notion.com/mcp` | ✅ Connected |
| Slack | `mcp.slack.com/mcp` | ✅ Connected |
| Trimble SketchUp | `api.sketchup.com/mcp/v1/…` | ✅ Connected |
| Vercel | `mcp.vercel.com` | ✅ Connected |

**16 connected.** Transport-level only — a successful handshake is not proof a tool call succeeds.

### 1b. Proven usable — an actual tool was called and returned data

| Server | Call | Result |
|---|---|---|
| **Vercel** | `list_teams` | `{"teams": []}` — authorized, personal scope, no teams |
| **Figma** | `whoami` | `Sheet Flow` / `sheetflow51@gmail.com` / tier `starter` / **seat `View`** |
| **Adobe** | `get_account_type` | `{"account_type":"auth"}` — full account, Express export permitted |
| **GitHub** | `tools/list` over raw HTTP | **44 tools** returned using the `gh` CLI token (see §4) |

> ⚠️ **Figma is a `View` seat.** Reads (`get_design_context`, `get_screenshot`, `get_variable_defs`, `get_metadata`) are available. Writes — `use_figma`, `create_new_file`, `generate_diagram`, `upload_assets` — will fail on permissions. Design-to-code works; code-to-design does not.

---

## 2. Broken MCPs

### 2a. The five local stdio servers — root cause identified

Every one of them timed out in this session. Log evidence from
`%LOCALAPPDATA%\claude-cli-nodejs\Cache\c--…-SheetFlow-AI-Website\mcp-logs-*`:

| Server | This session (`4a29acdc`) | Standalone CLI run |
|---|---|---|
| context7 | ❌ timeout @ 30 105 ms | ✅ connected in **15 171 ms** |
| chrome-devtools | ❌ timeout @ 30 109 ms | ✅ connected |
| sequential-thinking | ❌ timeout @ 30 130 ms | ✅ connected |
| playwright | ❌ timeout @ 30 137 ms | ✅ connected in **11 219 ms** |
| filesystem | ❌ timeout @ 30 109 ms | ✅ connected |

**Root cause.** Every server is launched as `npx -y <pkg>@latest`. The `@latest` tag forces a registry round-trip on *every* launch before the process even starts. Measured cold start standalone is 11–15 s. In-session, all five launch concurrently under heavy memory pressure (0.36–2.09 GB physical free of 7.88 GB across this session) and every one crosses the 30 s ceiling.

**The feedback loop.** A timed-out connection does *not* reap its child. Each failure leaks an `npx` + server process pair. 13 orphaned node processes were counted mid-audit; the supervisor reported `server-filesystem ×3.5, context7 ×1.5, sequential-thinking ×1.5` holding up to 555 MB. Those orphans consume the memory that causes the next round of timeouts. It is self-reinforcing, and it explains why the problem worsens the longer the machine stays up.

This confirms and extends the observation already recorded in `engineering/MCPHealth.ts` — "during RC6.1, context7 and chrome-devtools had healthy npx processes and had still never completed a connection that session."

### 2b. GitHub MCP — hard failure, different cause

```
HTTP Connection failed after 3663ms:
Incompatible auth server: does not support dynamic client registration
```

Claude Code discovers `https://github.com/login/oauth` as the auth server, finds no stored client info, attempts RFC 7591 dynamic client registration — which GitHub does not implement — and aborts. It never reaches the API. This is not a token problem and no amount of `gh auth login` will fix it, because the current `.mcp.json` entry declares no credential at all.

---

## 3. Missing MCPs

Searched the entire user tree (`C:\Users\pc`, depth 4, including both Desktop roots), every `.mcp.json` on the machine, the npx cache, and global npm.

| Named in request | Status |
|---|---|
| **UI/UX Pro Max** | ✅ **Present — but it is a *skill*, not an MCP.** Installed, tested, working (§7) |
| 21st.dev MCP | ❌ Not present anywhere |
| Magic MCP | ❌ Not present anywhere |
| Context7 | ⚠️ Configured, connects standalone, timed out in-session |
| Playwright MCP | ⚠️ Same |
| Chrome DevTools MCP | ⚠️ Same |
| Filesystem MCP | ⚠️ Same |
| GitHub MCP | ❌ Configured, auth-broken |
| Sequential Thinking | ⚠️ Same as Context7 |
| Browser tools (`@agentdeskai`) | ❌ Not present |
| Design skills | ✅ 7 installed (§7) |
| Claude Memory | ✅ Present as the built-in file memory at `~/.claude/projects/…/memory/` — not an MCP |
| ClaudeMem | ❌ Not present |
| Task Observer | ❌ Not present |
| OmniRoute | ❌ Not present |
| Headroom | ❌ Not present |

**Other MCP configs found on this machine** (not active here):
- `C:\Users\pc\Claude_Skills\repo\stack\.mcp.json` → playwright, chrome-devtools, **shadcn** ← the shadcn MCP is genuinely useful for this project and is not configured here
- `C:\Users\pc\Desktop\whatsapp-accounting-os\.mcp.json` → supabase

---

## 4. Authorized / Unauthorized

### Authorized
- **16 claude.ai connectors** — OAuth complete, tokens valid at transport level
- **Adobe** — `auth` (full account, not guest)
- **Figma** — authorized, View seat
- **Vercel** — authorized, personal scope
- **GitHub via `gh` CLI** — `sheetflow51-prog`, keyring-stored, scopes `gist, read:org, repo, workflow`

### Unauthorized
| Server | State |
|---|---|
| claude.ai Roboflow | Needs authentication — cached in `mcp-needs-auth-cache.json` |
| claude.ai Vaisala Xweather | Needs authentication — same |
| claude.ai Autodesk Product Help | **Conflicting evidence:** session start reported it as needing auth; `claude mcp list` reports Connected; it is *not* in the auth-needed cache. Transport is up; a tool call may still 401. Untested. |
| github (MCP) | Unauthorized — cannot complete OAuth by design (§2b) |

### GitHub authorization — **verified working**

I tested the endpoint directly rather than assuming. Using the existing `gh` CLI token as a bearer header:

```
POST https://api.githubcopilot.com/mcp/   →  HTTP 200
tools/list                                →  44 tools
   add_comment_to_pending_review, add_issue_comment, create_branch,
   create_or_update_file, create_pull_request, create_repository,
   delete_file, fork_repository, get_commit, get_file_contents, …
```

The fix is a header, not an OAuth flow. `claude mcp add --header` is confirmed supported by the installed CLI's own help output.

**No OAuth flow needed from you, and no new token required** — the credential already exists in your keyring.

---

## 5. Design tooling — actually tested, not just detected

| Skill | Test run | Result |
|---|---|---|
| **ui-ux-pro-max** | `search.py "dark cinematic AI automation saas" --domain style` | ✅ Returned "Modern Dark (Cinema Mobile)" with full palette, easing curves, CSS variables. Exit 0 |
| **ui-ux-pro-max** | `search.py "scroll animation" --stack nextjs` | ✅ Returned Next.js `<Link scroll>` guidance. Exit 0 |
| **design** (logo) | `logo/search.py "technology"` | ✅ Returned industry record: styles, `#6366F1 #0EA5E9 #10B981`, typography. Exit 0 |
| **design-system** | `node generate-tokens.cjs --help` | ✅ CLI responds, css/tailwind formats. Exit 0 |
| **ui-styling** | `requirements.txt` inspected | ✅ Stdlib only. Node 24.13.0 + npm 11.6.2 present. Scripts present |
| **banner-design** | Content inspected | ⚠️ Reference-only (SKILL.md + 1 reference doc). No executable. Depends on the `design` skill for generation |
| **slides** | Content inspected | ⚠️ Reference-only (6 markdown files). Authoring guidance, no executable |
| **brand** | Content inspected | ✅ 4 `.cjs` scripts + templates present. Not invoked |

**Blocked capability — image generation.** The `design` skill's logo / icon / CIP-mockup generators call Gemini and are **not usable**:
- `GEMINI_API_KEY` / `GOOGLE_API_KEY` — **not set** (full env scan; `.env.local` contains only `VERCEL_OIDC_TOKEN`)
- `google.genai` Python package — **NOT installed** (`PIL` ✅, `requests` ✅, `google.genai` ❌)

Search, data lookup, token generation, and all reference guidance work. Only AI *image synthesis* is blocked.

Python 3.12.10 present. `py` launcher absent — use `python`, and note the SKILL.md fallback chain `python3` → `py -3` will not work on this host.

---

## 6. Tool inventory

**MCPs** — 16 remote connected · 2 need auth · 1 ambiguous (Autodesk) · 5 local configured-but-timing-out · 1 local auth-broken (github)

**Skills (user-installed, `~/.claude/skills`)** — `ui-ux-pro-max` (1.8 MB, 35 CSV datasets, 22 stacks) · `ui-styling` (5.6 MB, largest) · `design` (241 KB) · `design-system` (180 KB) · `brand` (90 KB) · `slides` (19 KB) · `banner-design` (13 KB)

**Skills (built-in)** — dataviz, artifact-design, artifact-diagramming, artifact-capabilities, code-review, simplify, security-review, run, init, loop, schedule, claude-api, update-config, keybindings-help, fewer-permission-prompts

**Plugins** — `gitkraken-inline`, `pdf-viewer-inline` (both empty data dirs) · `blocklist.json` · Adobe-for-creativity and docusign registered as plugin-sourced connectors

**Agents** — claude · claude-code-guide · Explore · general-purpose · Plan · statusline-setup

**Engineering scripts (`10_Final_Website/scripts`, 12)** — session-supervisor (24 KB) · profile-main-thread (21 KB) · build-brand-assets (21 KB) · trace-paint (14.5 KB) · probe-reduced-motion (9 KB) · capture-narrative (8.3 KB) · audit-lighthouse (7.3 KB) · capture-release-preview (6.9 KB) · capture-work-shots (5 KB) · capture-screens (4.4 KB) · audit-bundle (3.5 KB) · probe-cls (2.1 KB)

**QA systems (`10_Final_Website/engineering`, 16 files, ~330 KB TypeScript)** — VisualRegression (42 KB) · EngineeringSupervisor (38 KB) · ResourceMonitor (31 KB) · BuildCoordinator (29 KB) · TaskPlanner (27 KB) · PageProbe (22 KB) · AnimationProfiler (22 KB) · ReleaseManager (21 KB) · MemoryGuard (17 KB) · MCPHealth (15 KB) · PerformanceWatcher (15 KB) · paths · types

Tested live:
- `node scripts/session-supervisor.mjs --check --verbose` → **exit 0**
- `node engineering/EngineeringSupervisor.ts report` → **exit 1, verdict RED** (regenerated ENGINEERING_STATUS / VISUAL_STATUS / SYSTEM_HEALTH / BUILD_STATUS / QUALITY_GATE as a side effect)

**Browser automation** — Playwright 1.62.1 + @axe-core/playwright installed as devDeps; `test:e2e`, `test:a11y` wired. Playwright MCP configured but not connecting. `.playwright-mcp/` holds captures from 2026-08-10, so it has worked before.

**AI design systems** — ui-ux-pro-max (local DB) · Adobe Firefly/Express via connector (auth ✅) · Canva (connected) · Figma (read-only seat) · Gemini image generation (blocked, §5)

---

## 7. VS Code & Claude Code

| Item | Value |
|---|---|
| VS Code | 1.132.0 x64 |
| `anthropic.claude-code` extension | **2.1.226** |
| Claude Code CLI | **2.1.224** ← version skew |
| Agent SDK | 0.3.223 |
| Entrypoint | `claude-vscode`, `CLAUDE_CODE_CHILD_SESSION=1` |
| Node / npm / git / gh | 24.13.0 / 11.6.2 / 2.52.0 / 2.96.0 |
| Python | 3.12.10 (no `py` launcher) |
| Other extensions | containers, python ×4, powershell, `openai.chatgpt` |
| Global npm | claude-code, n8n@2.8.3, openclaw@2026.3.2, vercel@58.7.0 |
| Model settings | `effortLevel: xhigh`, `model: opus`, `enableWorkflows: true` |

**CLI auto-update is failing.** `~/.claude/.last-update-result.json`:
```json
{"outcome":"failed","status":"install_failed","version_from":"2.1.220",
 "version_to":"2.1.224","error_code":"update_apply_exe_locked"}
```
The 272 MB `claude.exe` cannot be replaced while a session holds it. This will recur on every update as long as a session is running.

**No `CLAUDE.md` exists anywhere in this project** — despite ~470 KB of root-level markdown (PROJECT_HEALTH 47 KB, TOOLING_MANIFEST 44 KB, CHANGELOG 89 KB…). None of it is auto-loaded into context.

---

## 8. Non-MCP blockers found

1. **GPU is software rasterisation.** `ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)), SwiftShader driver)`. Every `backdrop-filter` in the VOS surface ladder becomes a CPU blur. **No paint or animation measurement taken on this host is trustworthy.** This is the single `FAIL` driving the RED verdict.
2. **Memory floor breached repeatedly** — 0.36 GB free at one point, 2.09 GB at best, against a 0.8 GB floor. Chromium launches abort with `0xE0000008`.
3. **`.next` is locked** by `next start` (pid 14576, port 3013) — `npm run build` will fail EPERM until it is stopped.
4. **Duplicate project entries** in `~/.claude.json` differing only by drive-letter case (`c:/…` and `C:/…`), plus the same duplication for `whatsapp-accounting-os`. The file is not strictly valid JSON as a result. Per-project MCP state is split across two entries.

---

## 9. Recommended additions

Maintenance verified against the npm registry today — publish dates are real, not assumed.

| Package | Version | Last published | Verdict |
|---|---|---|---|
| **shadcn** (`npx shadcn@latest mcp`) | 4.16.2 | 2026-08-06 | ✅ **Recommended.** Official. Directly serves this Next.js + Tailwind + Radix stack. You already run it in `Claude_Skills\repo\stack` |
| `@21st-dev/magic` | 0.2.2 | 2026-07-31 | ⚠️ Maintained, but needs an API key and adds a sixth cold-start process. **Add only after §10 is done** |
| `@playwright/mcp` | 0.0.79 | **2026-08-11** | ✅ Already configured — fix, don't replace |
| `chrome-devtools-mcp` | 1.7.0 | 2026-08-10 | ✅ Already configured — fix, don't replace |
| `@upstash/context7-mcp` | 4.0.1 | **2026-08-11** | ✅ Already configured — fix, don't replace |
| `@modelcontextprotocol/server-github` | 2025.4.8 | — | ❌ **DEPRECATED** — "Package no longer supported." Confirms the hosted endpoint you already use is the correct path |

**For animation** — no MCP is worth adding. GSAP/Framer docs come through Context7, and `ui-ux-pro-max` already ships 16 GSAP motion presets. Fixing Context7 delivers this.

**For QA / browser** — you are not short of tooling. Playwright + Chrome DevTools + Lighthouse 13.4.1 + axe-core + 330 KB of purpose-built engineering modules is more than most teams run. The gap is reliability, not coverage.

**Blunt recommendation: add nothing until §10 is complete.** Every added server is another concurrent cold start on a host that is already losing five of them to a 30-second timeout.

---

## 10. Exact commands — NOT executed

Nothing below was run. No config was created, overwritten, or deleted during this audit.

### Fix A — GitHub MCP *(highest value, verified working, ~30 seconds)*

```powershell
# Remove the OAuth-based entry that cannot authenticate
claude mcp remove github

# Re-add with the credential that already exists in your keyring.
# --scope local writes to .claude/settings.local.json, which IS gitignored
# (confirmed via ~/.config/git/ignore) — the token will not be committed.
claude mcp add --transport http github https://api.githubcopilot.com/mcp/ `
  --header "Authorization: Bearer $(gh auth token)" `
  --scope local
```

Then remove the now-dead `"github"` block from `.mcp.json` (lines 49–52).
Verify with `claude mcp list` → expect `github … ✓ Connected`.

> A dedicated fine-grained PAT is cleaner long-term than the `gho_` CLI token, which rotates on `gh auth refresh`. Current scopes (`repo, workflow, read:org, gist`) are sufficient for all 44 tools.

### Fix B — stop the local MCP timeouts *(the main event)*

**B1 — minimum-risk, no installs.** Pin versions so npx resolves from cache instead of the registry, and raise the ceiling above the measured 15 s worst case. Edit `.mcp.json`, replacing `@latest` with the versions verified today:

```
@upstash/context7-mcp@4.0.1
chrome-devtools-mcp@1.7.0
@modelcontextprotocol/server-sequential-thinking@2026.7.4
@playwright/mcp@0.0.79
@modelcontextprotocol/server-filesystem@2026.7.10
```

Then add to `.claude/settings.json` (an addition alongside the existing `hooks` block — **not** a replacement):

```json
"env": { "MCP_TIMEOUT": "60000" }
```

`MCP_TIMEOUT` and `MCP_TOOL_TIMEOUT` are both real, recognized variables — verified by string-scanning the installed `claude.exe` v2.1.224 (9 and 13 occurrences respectively). This was checked, not recalled.

**B2 — durable fix.** Remove npx from the hot path entirely:

```powershell
npm i -g `
  @upstash/context7-mcp@4.0.1 `
  chrome-devtools-mcp@1.7.0 `
  @modelcontextprotocol/server-sequential-thinking@2026.7.4 `
  @playwright/mcp@0.0.79 `
  @modelcontextprotocol/server-filesystem@2026.7.10

# Then confirm the installed bin names before editing .mcp.json:
Get-ChildItem "$env:APPDATA\npm" -Filter "*.cmd" | Select-Object Name
```

Point each `command` at the resolved global binary. Startup drops from 11–15 s to roughly 1 s and the timeout stops being reachable. **Confirm the bin names from that listing — do not guess them.**

### Fix C — reclaim the orphaned processes

```powershell
# Inspect first — nothing is killed by this
node 10_Final_Website/scripts/session-supervisor.mjs --check --verbose
```
Then restart the VS Code Claude Code client. Neither the supervisor nor `MCPHealth` will kill MCP processes by design — they are the agent's own tooling.

### Fix D — unlock `.next`

```powershell
cd 10_Final_Website
npm run env:release-next     # or stop pid 14576 by hand
```

### Fix E — optional, shadcn MCP

```powershell
claude mcp add shadcn --scope project -- npx -y shadcn@4.16.2 mcp
```
Pin the version for the same reason as B1. **Do this only after B is verified.**

---

## 11. Manual actions required from you

| # | Action | Why |
|---|---|---|
| 1 | **Approve Fix A + Fix B.** I will not modify `.mcp.json` or `settings.json` without your go-ahead | Step 8: never overwrite configs |
| 2 | **Authorize Roboflow + Vaisala Xweather**, or tell me to drop them | Interactive OAuth cannot run in this session. claude.ai → Settings → Connectors. Neither is relevant to SheetFlow — dropping is reasonable |
| 3 | **Upgrade the Figma seat** if code-to-design matters | `View` seat is read-only. Design-to-code works today |
| 4 | **Provide `GEMINI_API_KEY`** *(optional)* and install `google-genai` | Only needed for AI logo/icon/mockup generation. Everything else in the design skills works now |
| 5 | **Free memory before any visual QA** — `wsl --shutdown`, close ChatGPT Classic (791 MB) | Below 0.8 GB free, Chromium aborts with `0xE0000008` |
| 6 | **Decide about the GPU.** SwiftShader means no paint measurement on this host is valid | Either enable hardware acceleration or accept that visual perf work must move to CI |
| 7 | **Update the CLI with no session running** | `update_apply_exe_locked` will keep failing otherwise. CLI 2.1.224 vs extension 2.1.226 |
| 8 | **Confirm whether to create a `CLAUDE.md`** | ~470 KB of project markdown is currently never auto-loaded |

---

## 12. Verdict

The environment is **substantially healthier than it looks** — the local MCP failures are one latency bug with one fix, not five broken servers, and the GitHub failure is a missing header with a credential you already hold.

**Do not resume website work until Fix A and Fix B are applied and `claude mcp list` is clean in-session.** Until then the agent is running without Context7 (docs), Playwright and Chrome DevTools (browser QA), Sequential Thinking (reasoning), and GitHub (repo ops) — and the GPU state means any visual measurement taken now is not admissible as evidence.
