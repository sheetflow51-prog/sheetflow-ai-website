# SheetFlow AI — Push Positioning Pivot & Trigger Vercel Deploy
# Run from: C:\Users\pc\OneDrive\Desktop\AI_MASTER_WORKSPACE\SheetFlow_AI_Website\
# Or double-click this file (PowerShell must be allowed to run scripts)

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "  SheetFlow AI — Agency Pivot Deploy" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Go one level up from 10_Final_Website to the repo root
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDir
Set-Location $repoRoot
Write-Host "Repo root: $repoRoot" -ForegroundColor Gray

# Verify git
if (-not (Test-Path ".git")) {
    Write-Host "WARNING: No .git found at $repoRoot. Trying $scriptDir..." -ForegroundColor Red
    Set-Location $scriptDir
    if (-not (Test-Path ".git")) {
        Write-Host "ERROR: Could not find git repo." -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host ""
Write-Host "--- Files changed in this pivot ---" -ForegroundColor Yellow
Write-Host "  Hero, Workflows, Reports, How-We-Work, Results, FinalCTA" -ForegroundColor White
Write-Host "  Navigation, Footer, layout metadata, LoadingScreen" -ForegroundColor White
Write-Host ""

# Stage every change inside 10_Final_Website (covers all rewrites)
git add "10_Final_Website/src/components/sections/Hero.tsx"
git add "10_Final_Website/src/components/sections/WorkflowUniverse.tsx"
git add "10_Final_Website/src/components/sections/AIDashboard.tsx"
git add "10_Final_Website/src/components/sections/AIInfrastructure.tsx"
git add "10_Final_Website/src/components/sections/FeatureStorytelling.tsx"
git add "10_Final_Website/src/components/sections/CaseStudy.tsx"
git add "10_Final_Website/src/components/sections/FinalCTA.tsx"
git add "10_Final_Website/src/components/layout/Navigation.tsx"
git add "10_Final_Website/src/components/layout/Footer.tsx"
git add "10_Final_Website/src/components/providers/LoadingScreen.tsx"
git add "10_Final_Website/src/app/layout.tsx"
git add "10_Final_Website/PUSH_AND_DEPLOY.ps1"

Write-Host "--- Staged ---" -ForegroundColor Yellow
git status --short
Write-Host ""

# Commit (positioning pivot from AGI infra → AI automation agency)
git commit -m "pivot: reposition SheetFlow as an AI automation agency

Site previously read as an enterprise/AGI intelligence layer.
Repositioned to a premium AI automation agency for SMBs,
agencies, clinics, coaches and service businesses.

Copy + layout changes:
- Hero: 'We automate the busywork running your business.'
  CTA -> 'Book a free automation audit'
  Trust strip -> growing SMB-style brands
- WorkflowUniverse: replaced abstract floating-node graph with a
  clean 3-col grid of 6 real automations: Missed Lead Alerts,
  WhatsApp Follow-Ups, Appointment Booking, Daily Business
  Reports, CRM Auto-Updates, Invoice Reminders. No more 700px
  forced horizontal scroll on mobile.
- AIDashboard: now 'Reporting Dashboards' - lead/booking/revenue
  metrics instead of MRR/anomaly/intelligence-core language.
- FeatureStorytelling: 6 outcome-anchored pillars (Capture,
  Respond, Book, Sync, Report, Trust).
- CaseStudy: clinic/realty/coaching with believable SMB metrics.
- AIInfrastructure: SMB integrations (WhatsApp, Calendly,
  Pipedrive, GoHighLevel, Twilio, Mailchimp...).
- FinalCTA: 'Book a free automation audit. No commitment.'
- Navigation/Footer: Services / Who it's for / Results structure.
- Metadata + LoadingScreen copy aligned with new positioning.

Cinematic visual system preserved (Brackets, Trace, Particle
field, Spline core, ambient atmosphere) - just less jargon."

Write-Host ""
Write-Host "--- Pushing to GitHub (triggers Vercel auto-deploy) ---" -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "===========================================" -ForegroundColor Green
    Write-Host "  PUSHED! Vercel is now building." -ForegroundColor Green
    Write-Host "  Monitor:  https://vercel.com/dashboard" -ForegroundColor Green
    Write-Host "  Preview:  https://sheetflow-ai-website.vercel.app" -ForegroundColor Green
    Write-Host "===========================================" -ForegroundColor Green
} else {
    Write-Host "Push failed. Try: git pull --rebase, then git push origin main" -ForegroundColor Red
}
Write-Host ""
Read-Host "Press Enter to close"
