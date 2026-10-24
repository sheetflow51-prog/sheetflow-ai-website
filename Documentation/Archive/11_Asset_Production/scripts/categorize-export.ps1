<#
.SYNOPSIS
  Sort raw exports into 12_Final_Exports/{category}/ subfolders.

.DESCRIPTION
  Categories:
    stills/        — png, jpg, webp, tiff
    reels/         — mp4, mov, webm, prores
    spline/        — spline, splinecode
    posters/       — anything with "poster" in the name
    og/            — anything with "og-image" in the name
    thumbnails/    — anything with "thumb" in the name
    social/        — anything with "social|linkedin|twitter" in the name

  Files must already be normalized via normalize-filenames.ps1.

.EXAMPLE
  ./categorize-export.ps1 -Source ../_inbox/ready-to-ship
  ./categorize-export.ps1 -Source . -DryRun
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [string]$Source,
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

$Root        = Split-Path -Parent $PSScriptRoot
$FinalRoot   = Join-Path $Root '12_Final_Exports'
$LogDir      = Join-Path $Root '15_Production_Workflows\_logs'
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }
$LogFile     = Join-Path $LogDir ("categorize-export-{0}.log" -f (Get-Date -Format 'yyyyMMdd-HHmmss'))

function Write-Log([string]$Message) {
    "$((Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))  $Message" |
        Tee-Object -FilePath $LogFile -Append | Out-Null
    Write-Host $Message
}

if (-not (Test-Path $Source)) {
    Write-Log "Source not found: $Source"
    return
}

$Categories = @(
    @{ Match = 'poster';                          Dest = 'posters' },
    @{ Match = 'og[-_]?image|^og-';               Dest = 'og' },
    @{ Match = 'thumb';                           Dest = 'thumbnails' },
    @{ Match = 'social|linkedin|twitter';         Dest = 'social' },
    @{ Match = '\.(spline|splinecode)$';          Dest = 'spline' },
    @{ Match = '\.(mp4|mov|webm|prores)$';        Dest = 'reels' },
    @{ Match = '\.(png|jpg|jpeg|webp|tiff|tif)$'; Dest = 'stills' }
)

$Files = Get-ChildItem -Path $Source -File -ErrorAction SilentlyContinue
if (-not $Files) {
    Write-Log "No files to categorize in $Source"
    return
}

$moved = 0
$unmatched = 0

foreach ($file in $Files) {
    $name = $file.Name.ToLower()
    $matched = $false

    foreach ($cat in $Categories) {
        if ($name -match $cat.Match) {
            $destDir = Join-Path $FinalRoot $cat.Dest
            if (-not (Test-Path $destDir)) {
                if (-not $DryRun) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }
            }
            $destPath = Join-Path $destDir $file.Name

            if ($DryRun) {
                Write-Log "[DRY] $($file.Name) -> 12_Final_Exports/$($cat.Dest)/"
            } else {
                Move-Item -Path $file.FullName -Destination $destPath -Force
                Write-Log "Categorized: $($file.Name) -> $($cat.Dest)/"
            }
            $moved++
            $matched = $true
            break
        }
    }

    if (-not $matched) {
        Write-Log "Unmatched (left in place): $($file.Name)"
        $unmatched++
    }
}

Write-Log ""
Write-Log "Summary:"
Write-Log "  Categorized: $moved"
Write-Log "  Unmatched:   $unmatched"
Write-Log "Log: $LogFile"
