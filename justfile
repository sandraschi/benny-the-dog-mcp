# benny-the-dog-mcp - fleet justfile
serve port="11142":
    uv run uvicorn benny_the_dog_mcp.server:app --host 127.0.0.1 --port {{port}}

mcp-stdio:
    uv run benny_the_dog_mcp-server

dev:
    pwsh -NoProfile -File start.ps1

lint:
    uv run ruff check .
    uv run ruff format . --check

fix:
    uv run ruff check . --fix
    uv run ruff format .

test:
    uv run pytest tests/ -q

e2e:
    Set-Location webapp
    npx playwright test

bootstrap:
    uv sync
    Set-Location webapp
    bun install