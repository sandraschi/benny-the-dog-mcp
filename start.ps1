param([switch]$Headless, [switch]$NoBrowser)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSCommandPath
$BackendPort = 11142
$FrontendPort = 11143

foreach ($port in @($BackendPort, $FrontendPort)) {
    Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
        ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
}

$backend = Start-Job -Name "benny_the_dog_mcp-backend" -ScriptBlock {
    param($Root, $Port)
    Set-Location $Root
    uv run uvicorn benny_the_dog_mcp.server:app --host 127.0.0.1 --port $Port
} -ArgumentList $Root, $BackendPort

for ($i = 0; $i -lt 60; $i++) {
    try {
        $r = Invoke-WebRequest -Uri "http://127.0.0.1:$BackendPort/api/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
        if ($r.StatusCode -eq 200) { break }
    } catch {}
    Start-Sleep -Seconds 1
}

$frontend = Start-Process -FilePath "bun" -ArgumentList "run", "dev" -WorkingDirectory (Join-Path $Root "webapp") -PassThru -WindowStyle Hidden

if (-not $NoBrowser) {
    $url = "http://127.0.0.1:$FrontendPort"
    Start-Process powershell -ArgumentList "-NoProfile", "-WindowStyle", "Hidden", "-Command",
        "for (`$i = 0; `$i -lt 60; `$i++) { try { `$null = Invoke-WebRequest -Uri '$url' -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop; Start-Process '$url'; exit } catch { Start-Sleep -Seconds 1 } }"
}

Write-Host "Backend: http://127.0.0.1:$BackendPort/docs" -ForegroundColor Green
Write-Host "Frontend: http://127.0.0.1:$FrontendPort" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop." -ForegroundColor Gray

try {
    while ($true) {
        if ($backend.State -eq "Failed") { Receive-Job $backend; break }
        Start-Sleep -Seconds 2
    }
} finally {
    Stop-Job $backend -ErrorAction SilentlyContinue
    Remove-Job $backend -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $frontend.Id -Force -ErrorAction SilentlyContinue
}