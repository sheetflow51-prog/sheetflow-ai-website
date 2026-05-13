<#
.SYNOPSIS
  Print a summary of in-flight assets across the production pipeline.

.DESCRIPTION
  Counts files in each significant folder and prints a single-screen
  dashboard. Read-only; never modifies anything.

.EXAMPLE
  ./production-status.ps1
#>

[CmdletBinding()] param()

$ErrorActionPreference = 'Stop'

$Root = Split-Path -Parent $PSScriptRoot

function Count-Files([string]$relPath, [string]$filter = '*') {
    $p = Join-Path $Root $relPath
    if (-not (Test-Path $p)) { return 0 }
    return (Get-ChildItem -Path $p -File -Recurse -Filter $filter -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -notmatch '^_' -and $_.Name -notmatch '^\.' }).Count
}

function Show-Section([string]$title, [hashtable]$rows) {
    Write-Host ""
    Write-Host $title -ForegroundColor Cyan
    Write-Host ('-' * 50)
    foreach ($k in $rows.Keys) {
        $val = $rows[$k]
        Write-Host ("  {0,-32} {1,5}" -f $k, $val)
    }
}

Write-Host ""
Write-Host "SheetFlow Asset Production — Status" -ForegroundColor Yellow
Write-Host ("=" * 50)
Write-Host ("Generated: {0}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm'))

Show-Section "Inbox (untriaged)" @{
    '_inbox total'   = Count-Files '_inbox'
    '_inbox/unknown' = Count-Files '_inbox\_unknown'
}

Show-Section "Generation pipelines" @{
    'Spline scenes (working)' = Count-Files '01_Spline_Scenes' '*.spline'
    'Midjourney prompts (md)' = Count-Files '02_Midjourney_Prompts' '*.md'
    'References collected'    = Count-Files '03_Reference_Collection'
    'Moodboards (md)'         = Count-Files '04_Moodboards' '*.md'
}

Show-Section "Asset categories (in-flight)" @{
    'Launch posters'   = Count-Files '05_Launch_Posters'
    'Reels'            = Count-Files '06_Reels'
    'Thumbnails'       = Count-Files '07_Thumbnails'
    'Social posts'     = Count-Files '08_Social_Posts'
    'Founder imagery'  = Count-Files '09_Founder_Imagery'
    'Case study'       = Count-Files '10_Case_Study_Assets'
    'OG images'        = Count-Files '11_OG_Images'
}

Show-Section "Review gate" @{
    'Pending review'   = Count-Files '13_Asset_Review\pending'
    'Rejected'         = Count-Files '13_Asset_Review\rejected'
}

Show-Section "Shipped (12_Final_Exports)" @{
    'Stills'           = Count-Files '12_Final_Exports\stills'
    'Reels'            = Count-Files '12_Final_Exports\reels'
    'Posters'          = Count-Files '12_Final_Exports\posters'
    'OG images'        = Count-Files '12_Final_Exports\og'
    'Thumbnails'       = Count-Files '12_Final_Exports\thumbnails'
    'Spline (final)'   = Count-Files '12_Final_Exports\spline'
}

Write-Host ""
Write-Host ("=" * 50)
Write-Host "Tip: ./organize-inbox.ps1   to triage  _inbox/"
Write-Host "Tip: ./lock-asset.ps1 -AssetPath ...  to ship a reviewed asset"
Write-Host ""
