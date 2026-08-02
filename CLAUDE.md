# benny-the-dog-mcp — CLAUDE.md

Per-repo agent instructions. Loaded by Claude Code and opencode at session start.

## What this repo is

FastMCP 3.4 server + FastAPI backend + React/Vite webapp for monitoring Benny, the fleet dog. Care events (water, movement, barks, sausages, movies, wake calls) persist in SQLite. APScheduler patrol job flags loneliness.

## Entry points

- `src/benny_the_dog_mcp/server.py` — MCP tools (`dog_ops` portmanteau, `app_info`, `server_shutdown`), FastAPI REST, CORS, scheduler, log ring buffer.
- `src/benny_the_dog_mcp/db.py` — all SQLite access (members, products, orders, dog_profile, dog_pics, dog_tracks, dog_events).
- `webapp/src/` — React SPA: Dashboard, Tools, Skills, Chat, Settings, Help, Logs, ApiDocs, Jobs, Members, Shop, Cart, Onboarding.

## Standards that apply

- FastMCP 3.4.4+, dialogic returns `{success, message, data}`, `## Return Format` + `## Examples` in docstrings, `Annotated[Field(description=...)]` for params, portmanteau `Literal` operation enums.
- Ports 11142/11143 are fleet-registered — never change.
- Session context injection lives in `.cursorrules` / `.windsurfrules` / `.claude-plugin/` / `.opencode/skills/` — keep tool names in sync with `dog_ops`.
- Dark theme webapp, Zustand stores (`store/llm.ts`, `store/cart.ts`), `data-testid` on controls.

## Commands

- Backend: `uv run uvicorn benny_the_dog_mcp.server:app --port 11142`
- Frontend: `bun --prefix webapp run dev`
- Tests: `uv run pytest tests/` | e2e: `bun --prefix webapp run e2e`
- Gates: `just gates-green` + biome/tsc in webapp/
