# benny-the-dog-mcp - fleet justfile
serve port="11142":
    uv run uvicorn benny_the_dog_mcp.server:app --host 127.0.0.1 --port {{port}}

mcp-stdio:
    uv run benny_the_dog_mcp-server

dev:
    powershell.exe -NoProfile -File start.ps1

lint:
    uv run ruff check .
    uv run ruff format . --check

fix:
    uv run ruff check . --fix
    uv run ruff format .

types:
    uv run pyright src/

test:
    uv run pytest tests/ -q

e2e:
    Set-Location webapp; npx playwright test

cua-webapp-test:
    uv run python scripts/cua-webapp-test.py

build-native:
    powershell.exe -NoProfile -File src-tauri/build.ps1

cua-nsis-test:
    uv run python scripts/cua-smoke.py --config scripts/cua-nsis-config.json

# Catches the two most common ways a build/test looks fine but proves nothing:
# pyinstaller resolving to the wrong (global uv-tool) environment, and pywinauto
# missing so every CUA GUI phase silently no-ops while the script still prints
# a full pass. Fails loud and fast (seconds) instead of after a multi-minute
# Rust compile. See tauri_nsis_building.md justfile recipes section.
tauri-preflight:
    @echo "== Tauri pre-flight checks =="
    uv run python -c "import pywinauto"; if ($LASTEXITCODE -ne 0) { Write-Error "FATAL: pywinauto not importable -- run: uv add --dev pywinauto pillow pytesseract"; exit 1 }
    if (-not (Test-Path '.venv\Scripts\pyinstaller.exe')) { Write-Error "FATAL: pyinstaller missing from project venv -- run: uv add --dev pyinstaller pefile altgraph"; exit 1 }
    $gi = Get-Content .gitignore -Raw -ErrorAction SilentlyContinue; if ($gi -notmatch 'src-tauri.*\.exe') { Write-Warning "gitignore may not cover src-tauri/resources/*.exe -- verify before committing" }; if ($gi -notmatch 'cua-reports') { Write-Warning "gitignore may not cover cua-reports/" }
    @echo "== Pre-flight OK =="

# One command: pre-flight checks -> build -> genuine CUA verification.
tauri: tauri-preflight build-native cua-nsis-test

bootstrap:
    uv sync
    Set-Location webapp; bun install

gates-green: lint types test

mcpb-pack:
    powershell.exe -NoProfile -File scripts/build-mcpb.ps1
