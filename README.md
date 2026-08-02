# benny-the-dog-mcp

[![Python](https://img.shields.io/badge/python-3.11%2B-blue.svg)](https://www.python.org/)
[![FastMCP](https://img.shields.io/badge/fastmcp-3.4.4-blueviolet.svg)](https://github.com/jlowin/fastmcp)
[![Ruff](https://img.shields.io/badge/lint-ruff-black.svg)](https://github.com/astral-sh/ruff)
[![uv](https://img.shields.io/badge/pkg-uv-black.svg)](https://docs.astral.sh/uv/)

Benny the dog health and care monitor - water bowls, movement, loneliness detection, sausage deliveries, projector movie time, wake calls. Boomy-robot patrol integration ready.

Fleet-standard fullstack app: FastMCP 3.4 backend, React + Vite + Tailwind frontend, Bun, optional Tauri 2.0 desktop wrapper.

## Quick start

```powershell
uv sync
bun --prefix webapp install
.\start.ps1          # clears ports, starts backend + frontend, opens browser
```

- Backend API + Swagger: http://127.0.0.1:11142/docs
- Frontend: http://127.0.0.1:11143
- MCP endpoint (when enabled): http://127.0.0.1:11142/mcp

## What it does

- **Care events**: log water refills, barks, movement, sausage deliveries, projector movie time, and wake calls via the `dog_ops` MCP tool.
- **Loneliness detection**: the 5-minute patrol job (APScheduler) flags barks with no subsequent movement and suggests a sausage delivery.
- **Dog profile**: 6-step onboarding wizard (bio, photos, vet & health, behaviour, walking, dogparks/fountains).
- **Webapp**: Dashboard, Tools, Skills, Chat (local LLM), Settings, Help, Logs, ApiDocs, Jobs, Members, Shop, Cart, Onboarding.
- **Robot-ready**: `actor="boomy"` on every event for the Boomy robot patrol.

## Tools

| Tool | Description |
|------|-------------|
| `dog_ops` | Care portmanteau: `status`, `water_refill`, `bark_event`, `movement`, `sausage_delivery`, `movie_time`, `wake` |
| `app_info` | Server metadata (name, version, tool count) |
| `server_shutdown` | Graceful shutdown (`confirm=True` required) |

Full reference: [docs/TOOLS.md](docs/TOOLS.md) | [llms-full.txt](llms-full.txt)

## Claude Desktop config

```json
{
  "mcpServers": {
    "benny": {
      "command": "uv",
      "args": ["run", "--directory", "D:/Dev/repos/benny-the-dog-mcp", "python", "-m", "benny_the_dog_mcp.server"]
    }
  }
}
```

## Environment

Copy `.env.example` to `.env`. See [docs/CONFIGURATION.md](docs/CONFIGURATION.md) for the full table.

| Variable | Default | Purpose |
|----------|---------|---------|
| `WEB_PORT` | `11142` | Backend port |
| `OLLAMA_URL` | `http://127.0.0.1:11434` | Chat LLM endpoint |
| `ENABLE_SCHEDULER` | `1` | Patrol job (5 min) |

## Ports

Registered in the fleet reservoir: backend 11142, frontend 11143 (see `mcp-central-docs/operations/WEBAPP_PORTS.md`).

## Tests

```powershell
uv run pytest tests/        # backend (73% coverage)
bun --prefix webapp run e2e # Playwright
```

## Documentation

- [docs/CONFIGURATION.md](docs/CONFIGURATION.md) — env vars, ports, storage
- [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) — stack, layout, commands, gates
- [docs/TOOLS.md](docs/TOOLS.md) — MCP tools + REST API reference
- [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) — common issues
- [docs/ONBOARDING.md](docs/ONBOARDING.md) — dog onboarding wizard
- [llms.txt](llms.txt) / [llms-full.txt](llms-full.txt) — LLM reference
- [CHANGELOG.md](CHANGELOG.md)
