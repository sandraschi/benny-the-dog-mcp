# Development

## Stack

- Backend: Python 3.11+, FastMCP 3.4.4, FastAPI, uvicorn, APScheduler, SQLite.
- Frontend: React 18 + Vite 6 + TailwindCSS 4 + Zustand + Lucide, managed with Bun.
- Testing: pytest (backend, 73% coverage), Playwright (e2e).

## Layout

```
src/benny_the_dog_mcp/
  server.py   # MCP tools + FastAPI app + CORS + scheduler + log ring
  db.py       # SQLite access layer
  skills/     # SKILL.md exposed as skill:// resource
webapp/
  src/pages/  # Dashboard, Tools, Skills, Chat, Settings, Help, Logs, ApiDocs, Jobs, Members, Shop, Cart, Onboarding
  src/store/  # zustand: llm.ts, cart.ts
  src/lib/    # api.ts (API_BASE), provider.ts (Ollama/LM Studio/vLLM probing)
  e2e/        # Playwright fleet-audit specs
tests/        # pytest backend tests
```

## Commands

```powershell
uv sync                          # install backend deps
bun --prefix webapp install      # install frontend deps
.\start.ps1                      # clear ports, start backend+frontend, open browser
.\start.ps1 -NoBrowser           # no auto-open
just serve                       # backend only (port 11142)
just lint / just fix             # ruff
just types                       # pyright src/
just test                        # pytest
just e2e                         # Playwright (needs stack running)
just gates-green                 # lint + types + test
just bootstrap                   # uv sync + bun install
```

## Gates (CI parity)

```powershell
uv run ruff check .
uv run ruff format . --check
uv run pyright src/
uv run pytest tests/ -q          # requires >=60% coverage
bun --prefix webapp run lint     # biome check src/
bunx tsc --noEmit                # in webapp/
bun --prefix webapp run build
```

## Adding a tool

1. Add `@mcp.tool()` in `server.py` (or extend the `dog_ops` portmanteau).
2. Docstring: 1-line summary, `## Return Format`, `## Examples` (see `mcp-central-docs/standards/rules/docstrings_sota.md`).
3. Use `Annotated[..., Field(description=...)]` for params and `Literal` for operation enums.
4. Add a pytest covering it; keep coverage >= 60%.
5. Update `llms-full.txt`, `SKILL.md`, and `docs/TOOLS.md`.

## Session context injection

Tool-awareness prompts live in `.cursorrules`, `.windsurfrules`, `.claude-plugin/hooks/hooks.json`, `.opencode/skills/`, `.github/copilot-instructions.md`. If you rename a `dog_ops` operation, update all five.
