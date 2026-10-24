# SheetFlow AI — QA Polish Push
# Commits all cinematic QA fixes from the post-deploy audit and pushes to GitHub.
# Vercel auto-deploys on push (git integration).
#
# Run from ANYWHERE — script resolves the repo root automatically.
# Double-click or: Right-click → "Run with PowerShell"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  SheetFlow AI — Cinematic QA Deploy" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# ── Resolve paths ──────────────────────────────────────────────────────────────
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path           # 10_Final_Website/
$websiteDir = $scriptDir                                                # project root
$repoRoot   = Split-Path -Parent (Split-Path -Parent $scriptDir)       # AI_MASTER_WORKSPACE\SheetFlow_AI_Website\..
# Try to find .git walking up
$searchDir = $scriptDir
$gitRoot = $null
for ($i = 0; $i -lt 6; $i++) {
    if (Test-Path (Join-Path $searchDir ".git")) {
        $gitRoot = $searchDir
        break
    }
    $searchDir = Split-Path -Parent $searchDir
}

if (-not $gitRoot) {
    Write-Host "ERROR: No .git repository found walking up from:" -ForegroundColor Red
    Write-Host "  $scriptDir" -ForegroundColor White
    Write-Host ""
    Write-Host "Please run from inside the repo:" -ForegroundColor Yellow
    Write-Host "  cd <your-repo-root>" -ForegroundColor White
    Write-Host "  git add 10_Final_Website/src/..." -ForegroundColor White
    Write-Host "  git commit -m 'fix: post-deploy cinematic QA polish'" -ForegroundColor White
    Write-Host "  git push origin main" -ForegroundColor White
    Read-Host "Press Enter to exit"
    exit 1
}

Set-Location $gitRoot
Write-Host "Repo root: $gitRoot" -ForegroundColor Gray
Write-Host ""

# ── Stage fixed files ──────────────────────────────────────────────────────────
$filesToStage = @(
    "10_Final_Website/src/app/globals.css",
    "10_Final_Website/src/components/sections/WorkflowUniverse.tsx",
    "10_Final_Website/src/components/sections/AIInfrastructure.tsx",
    "10_Final_Website/src/components/sections/AIDashboard.tsx",
    "10_Final_Website/src/components/sections/FeatureStorytelling.tsx",
    "10_Final_Website/src/components/sections/Hero.tsx"
)

Write-Host "--- Staging QA fixes ---" -ForegroundColor Yellow
foreach ($f in $filesToStage) {
    git add $f
    Write-Host "  staged: $f" -ForegroundColor Green
}
Write-Host ""

# ── Commit ─────────────────────────────────────────────────────────────────────
$commitMsg = @"
fix: post-deploy cinematic QA polish

- WorkflowUniverse: mobile horizontal scroll wrapper (min-w-[700px]),
  scrollbar-none, md:min-w-0 fallback
- AIInfrastructure: same mobile scroll wrapper; clamped extreme integration
  node y-positions (88/92 → 78/80) to prevent edge clipping
- AIDashboard: floating signal + alert cards hidden on mobile (md:block),
  added responsive bottom/left padding to parent wrapper
- FeatureStorytelling: last bento card changed col-span-2 → col-span-4
  to fill orphaned half-row
- globals.css: .section now uses overflow:clip instead of overflow:hidden
  (allows -mx-6/px-6 mobile scroll bleed without clipping sticky children);
  added .scrollbar-none utility
- Hero: pt-32 → pt-28 for tighter mobile top clearance
"@

git commit -m $commitMsg
Write-Host ""

# ── Push ───────────────────────────────────────────────────────────────────────
Write-Host "--- Pushing to origin/main ---" -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Done! Vercel will auto-deploy." -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Watch deployment at:" -ForegroundColor Cyan
Write-Host "  https://vercel.com/dashboard" -ForegroundColor White
Write-Host ""
Write-Host "Preview URL (once built):" -ForegroundColor Cyan
Write-Host "  https://sheetflow-ai-website-git-main-sheetflow51-progs-projects.vercel.app/" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to close"
