# Fleet pre-commit Biome hook - lints the webapp when JS/TS files change.
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Webapp = Join-Path $Root "webapp"

if (-not (Test-Path (Join-Path $Webapp "biome.json"))) {
    exit 0
}

Push-Location $Webapp
try {
    bunx biome check src/ 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Biome check failed - run 'bunx biome check --write src/' in webapp/" -ForegroundColor Red
        exit 1
    }
}
finally {
    Pop-Location
}
exit 0
