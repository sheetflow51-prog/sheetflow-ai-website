<#
.SYNOPSIS
  Move a reviewed asset from 13_Asset_Review/pending/ to 12_Final_Exports/
  and log it in the production ledger.

.DESCRIPTION
  This is the only sanctioned path into 12_Final_Exports/. The script:
    1. Verifies the asset is in 13_Asset_Review/pending/
    2. Verifies a review-notes file accompanies it (Pass outcome)
    3. Determines target category folder via filename type prefix
    4. Moves asset + review notes into 12_Final_Exports/{category}/
    5. Appends a row to 15_Production_Workflows/production-ledger.csv

.PARAMETER AssetPath
  Path to the asset to lock (in pending/).

.EXAMPLE
  ./lock-asset.ps1 -AssetPath ../13_Asset_Review/pending/still-hero-core-v2-20260512/
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [string]$AssetPath,
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

$Root      = Split-Path -Parent $PSScriptRoot
$Pending   = Join-Path $Root '13_Asset_Review\pending'
$FinalRoot = Join-Path $Root '12_Final_Exports'
$LogDir    = Join-Path $Root '15_Production_Workflows\_logs'
$Ledger    = Join-Path $Root '15_Production_Workflows\production-ledger.csv'

if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }
$LogFile = Join-Path $LogDir ("lock-asset-{0}.log" -f (Get-Date -Format 'yyyyMMdd-HHmmss'))

function Write-Log([string]$Message) {
    "$((Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))  $Message" |
        Tee-Object -FilePath $LogFile -Append | Out-Null
    Write-Host $Message
}

if (-not (Test-Path $AssetPath)) {
    Write-Log "ERROR: Asset path not found: $AssetPath"
    exit 1
}

$item = Get-Item $AssetPath
if ($item.FullName -notmatch [Regex]::Escape($Pending)) {
    Write-Log "ERROR: Asset must live under 13_Asset_Review/pending/."
    Write-Log "Current path: $($item.FullName)"
    exit 1
}

# Type prefix → category folder
$TypeFolders = @{
    'still'    = 'stills'
    'reel'     = 'reels'
    'spline'   = 'spline'
    'poster'   = 'posters'
    'thumb'    = 'thumbnails'
    'og'       = 'og'
    'social'   = 'social'
    'portrait' = 'portraits'
    'case'     = 'case-studies'
}

$name = $item.Name
$prefix = ($name -split '-')[0]
if (-not $TypeFolders.ContainsKey($prefix)) {
    Write-Log "ERROR: Unknown type prefix '$prefix' in '$name'."
    Write-Log "Expected one of: $($TypeFolders.Keys -join ', ')"
    exit 1
}

$category = $TypeFolders[$prefix]
$destDir  = Join-Path $FinalRoot $category

# Find review notes
$reviewNotes = Get-ChildItem -Path $item.FullName -Filter 'review-*.md' -ErrorAction SilentlyContinue |
    Select-Object -First 1
if (-not $reviewNotes -and $item.PSIsContainer) {
    Write-Log "WARNING: No review-*.md found in asset folder. Locking without notes."
}

if ($DryRun) {
    Write-Log "[DRY] Would move $($item.Name) -> 12_Final_Exports/$category/"
    Write-Log "[DRY] Would append ledger row."
    return
}

if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
}

Move-Item -Path $item.FullName -Destination $destDir -Force
Write-Log "Locked: $name -> 12_Final_Exports/$category/"

# Append to ledger
if (-not (Test-Path $Ledger)) {
    "date,asset,category,reviewer,notes_file" | Out-File -FilePath $Ledger -Encoding utf8
}

$reviewerName = if ($reviewNotes) {
    (Select-String -Path $reviewNotes.FullName -Pattern '^Reviewer:\s*(.+)$' |
        Select-Object -First 1).Matches.Groups[1].Value
} else { '' }

$row = @(
    (Get-Date -Format 'yyyy-MM-dd'),
    $name,
    $category,
    $reviewerName,
    $(if ($reviewNotes) { $reviewNotes.Name } else { '' })
) -join ','

Add-Content -Path $Ledger -Value $row -Encoding utf8
Write-Log "Ledger updated: $Ledger"
Write-Log "Log: $LogFile"
