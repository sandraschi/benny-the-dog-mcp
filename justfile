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
    uv run python scripts/cua-smoke.py

bootstrap:
    uv sync
    Set-Location webapp; bun install

gates-green: lint types test

mcpb-pack:
    powershell.exe -NoProfile -File scripts/build-mcpb.ps1
