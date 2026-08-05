<#
.SYNOPSIS
  Enforce SheetFlow naming convention across a folder.

.DESCRIPTION
  Pattern: {type}-{slug}-v{n}-{YYYYMMDD}.{ext}
  Examples:
    still-hero-core-v2-20260512.png
    reel-launch-teaser-v1-20260512.mp4
    poster-quiet-intelligence-v3-20260512.png

  - Detects type from folder name (still/reel/spline/poster/og/thumb/social/portrait)
  - Slugifies remaining tokens (lowercase, hyphens, no special chars)
  - Auto-increments version if file with same base already exists
  - Uses today's date if no date token present

.PARAMETER Path
  Folder to normalize. Defaults to current directory.

.PARAMETER Type
  Override auto-detected type prefix.

.EXAMPLE
  ./normalize-filenames.ps1 -Path ../05_Launch_Posters/_inbox
  ./normalize-filenames.ps1 -Path . -Type still -DryRun
#>

[CmdletBinding()]
param(
    [string]$Path = (Get-Location).Path,
    [string]$Type,
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

$Root   = Split-Path -Parent $PSScriptRoot
$LogDir = Join-Path $Root '15_Production_Workflows\_logs'
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }
$LogFile = Join-Path $LogDir ("normalize-filenames-{0}.log" -f (Get-Date -Format 'yyyyMMdd-HHmmss'))

function Write-Log([string]$Message) {
    "$((Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))  $Message" |
        Tee-Object -FilePath $LogFile -Append | Out-Null
    Write-Host $Message
}

if (-not (Test-Path $Path)) {
    Write-Log "Path not found: $Path"
    return
}

$TypeMap = @{
    '01_Spline_Scenes'        = 'spline'
    '05_Launch_Posters'       = 'poster'
    '06_Reels'                = 'reel'
    '07_Thumbnails'           = 'thumb'
    '08_Social_Posts'         = 'social'
    '09_Founder_Imagery'      = 'portrait'
    '10_Case_Study_Assets'    = 'case'
    '11_OG_Images'            = 'og'
    '03_Reference_Collection' = 'ref'
}

function Resolve-Type([string]$folderPath) {
    if ($Type) { return $Type }
    foreach ($key in $TypeMap.Keys) {
        if ($folderPath -match [Regex]::Escape($key)) { return $TypeMap[$key] }
    }
    return 'still'
}

function Convert-ToSlug([string]$text) {
    $s = $text.ToLower()
    $s = $s -replace '[^a-z0-9]+', '-'
    $s = $s.Trim('-')
    return $s
}

$datePattern    = '(\d{8})'
$versionPattern = 'v(\d+)'
$today          = Get-Date -Format 'yyyyMMdd'
$folderType     = Resolve-Type -folderPath (Resolve-Path $Path)

$Files = Get-ChildItem -Path $Path -File -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -notmatch '^_' }

if (-not $Files) {
    Write-Log "No files to normalize in $Path"
    return
}

$renamed = 0
$skipped = 0

foreach ($file in $Files) {
    $ext  = $file.Extension.ToLower().TrimStart('.')
    $base = [IO.Path]::GetFileNameWithoutExtension($file.Name)

    if ($base -match "^$folderType-.+-v\d+-\d{8}$") {
        Write-Log "OK (already normalized): $($file.Name)"
        $skipped++
        continue
    }

    $date = if ($base -match $datePattern) { $matches[1] } else { $today }
    $ver  = if ($base -match $versionPattern) { [int]$matches[1] } else { 1 }

    $core = $base -replace $datePattern, ''
    $core = $core -replace $versionPattern, ''
    $core = $core -replace '^[\-_\s]+|[\-_\s]+$', ''
    $slug = Convert-ToSlug $core
    if (-not $slug) { $slug = 'asset' }

    $newName = "$folderType-$slug-v$ver-$date.$ext"
    $newPath = Join-Path $file.DirectoryName $newName

    while ((Test-Path $newPath) -and ($newPath -ne $file.FullName)) {
        $ver++
        $newName = "$folderType-$slug-v$ver-$date.$ext"
        $newPath = Join-Path $file.DirectoryName $newName
    }

    if ($newName -eq $file.Name) {
        $skipped++
        continue
    }

    if ($DryRun) {
        Write-Log "[DRY] $($file.Name) -> $newName"
    } else {
        Rename-Item -Path $file.FullName -NewName $newName
        Write-Log "Renamed: $($file.Name) -> $newName"
    }
    $renamed++
}

Write-Log ""
Write-Log "Summary:"
Write-Log "  Renamed: $renamed"
Write-Log "  Skipped: $skipped"
Write-Log "Log: $LogFile"
