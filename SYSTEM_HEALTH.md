# SYSTEM_HEALTH

**RC7 — Engineering Supervisor** · generated 2026-08-11 13:43:05 UTC

The host, as it was at the moment of this run. Every figure below was read from
the OS, not inferred.

---

## 1. Machine

- RAM: 1.93 GB free of 7.88 GB (5.42 GB commit available)
- Disk C:: 7.01 GB free of 96.55 GB
- GPU adapters: NVIDIA GeForce 940MX — 2048 MB, OK · Intel(R) HD Graphics 620 — 1024 MB, OK
- Chromium renderer (last observed): ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)
- Top consumers: Code 1147 MB, claude 976 MB, svchost 642 MB, ChatGPT Classic 366 MB, MsMpEng 332 MB
- Node processes matched: 18 · listening sockets: 18
- Event log (last 12 h): 0 app crash(es), 0 low-memory diagnosis(es), 0 display-driver reset(s)
- Probe cost: 4162 ms

## 2. Environment

| | Check | Detail | Where |
|---|---|---|---|
| ✅ | `memory` | 1.92 GB physical free of 7.88 GB | — |
| ⚠️ | `stale-servers` | 2 project server(s) on unsanctioned ports: pid 14576 :3013; pid 16060 :3013 | — |
| ✅ | `browsers` | no headless Chrome or Playwright runner processes | — |
| ⚠️ | `next-lock` | .next is held by next start (pid 14576) — 'npm run build' will fail EPERM on unlink | — |
| ✅ | `ports` | 3000, 3001, 9222 all free | — |
| ✅ | `duplicate-node` | 2 project node process(es) | — |
| ⚠️ | `duplicate-mcp` | duplicated MCP sessions holding 28 MB: server-filesystemx3 | — |
| ✅ | `forensics` | no stale test-results/ | — |
| ✅ | `disk` | 7.01 GB free on C: of 96.55 GB | — |
| ❌ | `gpu-render` | Chromium last rendered through SOFTWARE rasterisation: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver) | — |
| ✅ | `event-log` | no application crashes, exhaustion diagnoses or driver resets in the last 12 h | — |
| ✅ | `playwright-contention` | 0 runner(s), 0 shell(s), 0 MCP browser process(es) — no contention | — |
| ✅ | `build:lock` | no coordinator lock held | — |


## 3. Capabilities — MCP servers, connectors and skills

Three separate facts are tracked and never conflated: **configured** (present in
`.mcp.json`), **running** (a live process), and **observed** (the agent recorded
a working call). A server can be configured and running and still unusable —
that was exactly the state of `context7` and `chrome-devtools` during the RC6.1
recovery. Only `observed` claims usability, and it expires after six hours.

| | Check | Detail | Where |
|---|---|---|---|
| ❔ | `mcp:playwright` | Playwright MCP — configured, no process seen and no connection observed | — |
| ❔ | `mcp:chrome-devtools` | Chrome DevTools MCP — 3 process(es) alive holding 8 MB, but no connection observed this session — a live process is not a completed handshake | — |
| ❔ | `mcp:filesystem` | Filesystem MCP — 6 process(es) alive holding 12 MB, but no connection observed this session — a live process is not a completed handshake | — |
| ❔ | `mcp:context7` | Context7 — 2 process(es) alive holding 8 MB, but no connection observed this session — a live process is not a completed handshake | — |
| ❔ | `mcp:sequential-thinking` | Sequential Thinking MCP — 2 process(es) alive holding 7 MB, but no connection observed this session — a live process is not a completed handshake | — |
| ❔ | `mcp:github` | GitHub MCP — configured, no process seen and no connection observed | — |
| ❔ | `mcp:adobe` | Adobe for creativity — claude.ai connector — runs remotely, so no local process exists to observe; state is only knowable from a call — font recommendation, image adjustment and vectorisation for brand assets | — |
| ❔ | `mcp:figma` | Figma — claude.ai connector — runs remotely, so no local process exists to observe; state is only knowable from a call — design-system tokens and screenshots to diff the built page against | — |
| ❔ | `mcp:vercel` | Vercel — claude.ai connector — runs remotely, so no local process exists to observe; state is only knowable from a call — deployment state, runtime errors and web analytics for ReleaseManager | — |
| ❔ | `mcp:ui-ux-pro-max` | UI/UX Pro Max — installed as a Claude Code skill; usability is only knowable when the agent invokes it — style, palette, typography-pairing and GSAP motion references for visual work | — |
| ❔ | `mcp:ui-styling` | ui-styling — installed as a Claude Code skill; usability is only knowable when the agent invokes it — shadcn/Radix component and accessibility patterns | — |
| ❔ | `mcp:design-system` | design-system — installed as a Claude Code skill; usability is only knowable when the agent invokes it — three-layer token architecture, which the VOS surface ladder already follows | — |
| ❔ | `mcp:dataviz` | dataviz — installed as a Claude Code skill; usability is only knowable when the agent invokes it — any chart or metric tile added to a page | — |
| ❔ | `mcp:code-review` | code-review — installed as a Claude Code skill; usability is only knowable when the agent invokes it — the correctness pass the automated gates cannot perform | — |
| ⏭️ | `mcp:21st-dev` | 21st.dev — not configured in .mcp.json — component generation — named in RC7 but not present in this workspace | — |
| ⏭️ | `mcp:magic-mcp` | Magic MCP — not configured in .mcp.json — component generation — named in RC7 but not present in this workspace | — |
| ⚠️ | `mcp:duplicates` | duplicated MCP sessions: server-filesystem 6 processes (2 expected), chrome-devtools-mcp 3 processes (2 expected) — ~10 MB of 36 MB reclaimable | — |


## 4. Recovery actions

_None needed._


## 5. Standing risks

These do not change between runs. They are properties of the host, not of any
one build.

1. **The box is the bottleneck.** 4 cores, 7.88 GB. The RC6 crash was capacity,
   and capacity has not changed. Serialise: build → test → capture, never
   concurrently, and never with the Playwright MCP browser open alongside the
   runner (measured: 16.4 s becomes >90 s).
2. **`next start` locks `.next`.** A rebuild while the server runs fails with
   `EPERM: unlink`. `npm run preflight` releases it first.
3. **The workspace is inside OneDrive**, which holds file handles during sync
   and is a plausible contributor to the same `EPERM` class of failure.
4. **The discrete GPU is idle.** Chromium renders on the integrated adapter,
   whose memory comes from the same pool the OOM exhausted.
