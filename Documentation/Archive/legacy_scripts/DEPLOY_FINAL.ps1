# =====================================================================
#  SheetFlow AI — Final Cinematic Polish Deploy
#  One-shot, non-interactive. Run from anywhere.
#
#  Usage (from PowerShell):
#    powershell -ExecutionPolicy Bypass -File "<path to this file>"
#
#  Or right-click this file → Run with PowerShell.
#  No prompts, no pauses. Logs to DEPLOY_FINAL.log next to this script.
# =====================================================================

$ErrorActionPreference = 'Continue'
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$logFile   = Join-Path $scriptDir 'DEPLOY_FINAL.log'

function Log {
  param([string]$msg, [string]$color = 'Gray')
  $line = "[{0}] {1}" -f (Get-Date -Format 'HH:mm:ss'), $msg
  Write-Host $line -ForegroundColor $color
  Add-Content -Path $logFile -Value $line
}

"" | Out-File $logFile  # truncate
Log "==========================================" 'Cyan'
Log " SheetFlow AI - Final Polish Deploy"        'Cyan'
Log "==========================================" 'Cyan'

# ---- Locate git root (walk up from script dir) -----------------------
$searchDir = $scriptDir
$gitRoot = $null
for ($i = 0; $i -lt 6; $i++) {
  if (Test-Path (Join-Path $searchDir '.git')) { $gitRoot = $searchDir; break }
  $searchDir = Split-Path -Parent $searchDir
}
if (-not $gitRoot) {
  Log "ERROR: .git repo not found above $scriptDir" 'Red'
  exit 1
}
Set-Location $gitRoot
Log "Repo root: $gitRoot" 'Gray'

# ---- Optional: repair eslint-config-next if its install was interrupted
$eslintNextPath = Join-Path $gitRoot '10_Final_Website/node_modules/eslint-config-next/package.json'
if (-not (Test-Path $eslintNextPath)) {
  Log "Detected eslint-config-next install gap. Reinstalling..." 'Yellow'
  Push-Location (Join-Path $gitRoot '10_Final_Website')
  & npm install eslint-config-next@16.2.6 --no-audit --no-fund --prefer-offline 2>&1 | Tee-Object -FilePath $logFile -Append | Out-Host
  Pop-Location
}

# ---- Stage all polish files (new + modified, plus untracked configs) -
$stage = @(
  '10_Final_Website/src/app/globals.css',
  '10_Final_Website/src/components/sections/Hero.tsx',
  '10_Final_Website/src/components/sections/WorkflowUniverse.tsx',
  '10_Final_Website/src/components/sections/AIInfrastructure.tsx',
  '10_Final_Website/src/components/sections/AIDashboard.tsx',
  '10_Final_Website/src/components/sections/FeatureStorytelling.tsx',
  '10_Final_Website/src/components/sections/CaseStudy.tsx',
  '10_Final_Website/src/components/sections/FinalCTA.tsx',
  '10_Final_Website/src/components/ui/SectionHeader.tsx',
  '10_Final_Website/public/posters/spline_hero_v1.0.svg',
  '10_Final_Website/public/posters/spline_workflow_v1.0.svg',
  '10_Final_Website/public/posters/spline_dashboard_v1.0.svg',
  '10_Final_Website/public/posters/spline_cta_v1.0.svg',
  '10_Final_Website/public/posters/cinematic-gradient.svg',
  '10_Final_Website/eslint.config.mjs',
  '10_Final_Website/next.config.mjs',
  '10_Final_Website/package.json',
  '10_Final_Website/package-lock.json'
)

Log "--- Staging files ---" 'Yellow'
foreach ($f in $stage) {
  $abs = Join-Path $gitRoot $f
  if (Test-Path $abs) {
    & git add -- $f 2>&1 | Out-Null
    Log "  staged: $f" 'Green'
  }
}

# ---- Sanity: anything to commit? -------------------------------------
$status = & git status --porcelain
if (-not $status) {
  Log "No changes to commit. Nothing to push." 'Yellow'
} else {
  $commitMsg = @"
fix(cinematic): production-grade polish + stabilization pass

Section-level mobile rhythm refinements:
- Hero: pt-24 mobile (was pt-32); trust-strip mt-14 md:mt-20; smaller
  trust labels on mobile; description text-[17px] mobile / xl desktop;
  scroll indicator + Trace tightened on mobile
- WorkflowUniverse + AIInfrastructure: scroll-fade-edge mask on the
  mobile horizontal-scroll wrapper (cinematic right-edge hint)
- AIDashboard: lg:gap-20 (was 24); md:pl-12 (was 14); mobile pb-6
- FeatureStorytelling: section-header mb-14 md:mb-20; gap-3.5 grid;
  H3 size 20px mobile / 24px desktop with leading-[1.18]
- CaseStudy: gap-3.5 grid; mb-12 md:mb-16 header
- FinalCTA: py-24 mobile (was 32); description 16px mobile / 18px
  desktop; Trace mt-10 md:mt-12

Design tokens (globals.css):
- .section padding: clamp(64px, 9.5vw, 160px) - tighter on mobile
- .headline-monument: clamp(52px, 11vw, 128px) - smoother responsive
- .headline-cinematic: clamp(42px, 7.5vw, 96px)
- .headline-section: clamp(32px, 5.6vw, 64px) + line-height 1.02
- .scroll-fade-edge utility - right-edge mask on mobile scroll wrappers
- SectionHeader: gap-4 md:gap-5; description 16px / md:17px

Visual assets (public/posters/):
- spline_hero_v1.0.svg, spline_workflow_v1.0.svg,
  spline_dashboard_v1.0.svg, spline_cta_v1.0.svg
  (cinematic SVG poster placeholders for reduced-motion users)
- cinematic-gradient.svg (atmosphere fallback)

Preserves: R3F fallback, reduced-motion handling, performance budget,
SEO + analytics wiring, signature primitives, brand OS inheritance.
"@

  Log "--- Committing ---" 'Yellow'
  & git commit -m $commitMsg 2>&1 | Tee-Object -FilePath $logFile -Append | Out-Host

  Log "--- Pushing to origin/main ---" 'Yellow'
  & git push origin main 2>&1 | Tee-Object -FilePath $logFile -Append | Out-Host
  $pushExit = $LASTEXITCODE
  if ($pushExit -ne 0) {
    Log "git push exited with code $pushExit" 'Red'
    exit $pushExit
  }
}

Log ""                                                          'Gray'
Log "==========================================" 'Green'
Log " Done. Vercel will auto-deploy from main." 'Green'
Log "==========================================" 'Green'
Log ""                                                          'Gray'
Log "Watch deployment at:" 'Cyan'
Log "  https://vercel.com/dashboard"            'White'
Log ""                                          'Gray'
Log "Preview URL (once built):"                 'Cyan'
Log "  https://sheetflow-ai-website-git-main-sheetflow51-progs-projects.vercel.app/" 'White'
Log ""                                          'Gray'
Log "Log written to: $logFile"                  'Gray'

exit 0
