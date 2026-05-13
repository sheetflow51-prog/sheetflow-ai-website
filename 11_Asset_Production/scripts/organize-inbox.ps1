<#
.SYNOPSIS
  Triage files dropped in 11_Asset_Production/_inbox/ into the correct
  category folder based on extension and filename hints.

.DESCRIPTION
  - Images → 03_Reference_Collection/_unsorted/ (or named category if hint matches)
  - MP4/MOV → 06_Reels/_inbox/
  - Spline files → 01_Spline_Scenes/_inbox/
  - Figma exports → folder matched by filename prefix
  Unknown files stay in _inbox/_unknown/ for manual handling.

.EXAMPLE
  ./organize-inbox.ps1
  ./organize-inbox.ps1 -DryRun
#>

[CmdletBinding()]
param(
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

$Root   = Split-Path -Parent $PSScriptRoot
$Inbox  = Join-Path $Root '_inbox'
$LogDir = Join-Path $Root '15_Production_Workflows\_logs'

if (-not (Test-Path $Inbox)) {
    Write-Host "No _inbox/ directory at $Inbox. Nothing to do."
    return
}

if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }
$LogFile = Join-Path $LogDir ("organize-inbox-{0}.log" -f (Get-Date -Format 'yyyyMMdd-HHmmss'))

function Write-Log([string]$Message) {
    $stamp = (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
    "$stamp  $Message" | Tee-Object -FilePath $LogFile -Append | Out-Null
    Write-Host $Message
}

# Routing rules: ordered. First match wins.
$Routes = @(
    @{ Match = '\.(spline|splinecode)$';     Dest = '01_Spline_Scenes\_inbox' },
    @{ Match = '\.(mp4|mov|webm|prores)$';   Dest = '06_Reels\_inbox' },
    @{ Match = '\.(fig|sketch)$';            Dest = '15_Production_Workflows\_inbox' },
    @{ Match = 'poster';                     Dest = '05_Launch_Posters\_inbox' },
    @{ Match = 'thumb';                      Dest = '07_Thumbnails\_inbox' },
    @{ Match = 'og[-_]?image';               Dest = '11_OG_Images\_inbox' },
    @{ Match = 'founder|portrait';           Dest = '09_Founder_Imagery\_inbox' },
    @{ Match = 'case[-_]?study';             Dest = '10_Case_Study_Assets\_inbox' },
    @{ Match = 'social|linkedin|twitter';    Dest = '08_Social_Posts\_inbox' },
    @{ Match = '\.(png|jpg|jpeg|webp|tiff|tif)$'; Dest = '03_Reference_Collection\_unsorted' }
)

$Files = Get-ChildItem -Path $Inbox -File -Recurse -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notmatch '\\_unknown\\' }

if (-not $Files) {
    Write-Log "Inbox is empty. Done."
    return
}

$movedCount = 0
$unknownCount = 0

foreach ($file in $Files) {
    $name = $file.Name.ToLower()
    $matched = $false

    foreach ($route in $Routes) {
        if ($name -match $route.Match) {
            $destDir = Join-Path $Root $route.Dest
            if (-not (Test-Path $destDir)) {
                if (-not $DryRun) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }
            }
            $destPath = Join-Path $destDir $file.Name

            if ($DryRun) {
                Write-Log "[DRY] Would move: $($file.Name) -> $($route.Dest)"
            } else {
                Move-Item -Path $file.FullName -Destination $destPath -Force
                Write-Log "Moved: $($file.Name) -> $($route.Dest)"
            }

            $movedCount++
            $matched = $true
            break
        }
    }

    if (-not $matched) {
        $unknownDir = Join-Path $Inbox '_unknown'
        if (-not (Test-Path $unknownDir)) {
            if (-not $DryRun) { New-Item -ItemType Directory -Path $unknownDir -Force | Out-Null }
        }
        if ($DryRun) {
            Write-Log "[DRY] Would shelve unknown: $($file.Name)"
        } else {
            Move-Item -Path $file.FullName -Destination (Join-Path $unknownDir $file.Name) -Force
            Write-Log "Unknown (shelved): $($file.Name)"
        }
        $unknownCount++
    }
}

Write-Log ""
Write-Log "Summary:"
Write-Log "  Routed:  $movedCount"
Write-Log "  Unknown: $unknownCount"
Write-Log "Log: $LogFile"
