<#
.SYNOPSIS
  Append a prompt run to 14_Prompt_Library/prompt-log.md.

.DESCRIPTION
  Captures: date, tool (midjourney/runway/spline/...), prompt text,
  parameters, output filename, and a 1-line outcome note. Used so every
  generated asset has a traceable prompt origin.

.PARAMETER Tool
  Generation tool used (midjourney, runway, kling, spline, sora, etc.)

.PARAMETER Prompt
  The exact prompt text. Quote multi-line.

.PARAMETER Params
  Parameters used (e.g. "--ar 16:9 --stylize 200 --style raw")

.PARAMETER Output
  Output filename written to disk.

.PARAMETER Outcome
  Short note: shipped | iterate | reject | reference-only

.EXAMPLE
  ./prompt-log.ps1 -Tool midjourney `
    -Prompt "matte ceramic core, two-temperature light" `
    -Params "--ar 16:9 --stylize 200 --style raw" `
    -Output "still-hero-core-v1-20260512.png" `
    -Outcome "shipped"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory)] [string]$Tool,
    [Parameter(Mandatory)] [string]$Prompt,
    [string]$Params  = '',
    [string]$Output  = '',
    [string]$Outcome = 'reference-only'
)

$ErrorActionPreference = 'Stop'

$Root    = Split-Path -Parent $PSScriptRoot
$LibDir  = Join-Path $Root '14_Prompt_Library'
$LogFile = Join-Path $LibDir 'prompt-log.md'

if (-not (Test-Path $LibDir)) { New-Item -ItemType Directory -Path $LibDir -Force | Out-Null }

if (-not (Test-Path $LogFile)) {
    @"
# Prompt Log

Every generation run, in reverse chronological order. New entries
appended to the top. Do not edit existing entries — append corrections
as new entries instead.

"@ | Out-File -FilePath $LogFile -Encoding utf8
}

$date  = Get-Date -Format 'yyyy-MM-dd HH:mm'
$entry = @"

---

## $date  ·  $Tool  ·  $Outcome

**Prompt**
> $Prompt

**Params:** ``$Params``
**Output:** ``$Output``

"@

# Prepend by reading + rewriting (small file, fine)
$existing = Get-Content -Path $LogFile -Raw
$header, $rest = $existing -split '(?ms)(?=^---)', 2

$new = $header + $entry + $(if ($rest) { $rest })
$new | Out-File -FilePath $LogFile -Encoding utf8

Write-Host "Logged $Tool prompt → $LogFile"
