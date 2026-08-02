# benny-the-dog-mcp

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

## Tests

```powershell
uv run pytest tests/        # backend
bun --prefix webapp run e2e # Playwright
```

## Ports

Registered in the fleet reservoir: backend 11142, frontend 11143 (see `mcp-central-docs/operations/WEBAPP_PORTS.md`).