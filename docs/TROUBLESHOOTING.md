# Troubleshooting

## Backend won't start / port in use

Ports 11142 (backend) and 11143 (frontend) are fleet-registered. `start.ps1` clears zombies before binding, but if a process is stuck:

```powershell
Get-NetTCPConnection -LocalPort 11142,11143 -ErrorAction SilentlyContinue |
    ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
```

Then rerun `.\start.ps1`.

## Backend starts but webapp shows "Offline" / "Failed to fetch"

1. Check the backend is up: `Invoke-WebRequest http://127.0.0.1:11142/api/health` — expect `{"status":"ok"}`.
2. Check the frontend is up: `Invoke-WebRequest http://127.0.0.1:11143`.
3. CORS is fleet-standard; if you changed ports, update `WEB_PORT` in `.env` **and** `webapp/src/lib/api.ts` + `webapp/vite.config.ts` — all three must agree.
4. Restart both; the health dot uses exponential backoff (1s → 16s), so give it ~30s after backend boot.

## Chat says "Ollama not detected"

The chat and Settings probe Ollama on `:11434`, LM Studio on `:1234`, vLLM on `:8000`. Start Ollama (`ollama serve`) or set `OLLAMA_URL` in `.env` if it runs elsewhere. The send button stays disabled without a provider.

## Tests fail with coverage < 60%

The pytest gate requires >= 60% coverage. Add tests for the uncovered paths (see `docs/DEVELOPMENT.md` — "Adding a tool" step 4) or run `uv run pytest tests/ --no-cov` to debug quickly (not for CI).

## Ruff / pyright / biome gates fail

```powershell
uv run ruff check . --fix && uv run ruff format .
uv run pyright src/
bun --prefix webapp run lint:fix   # biome --write
bunx tsc --noEmit                  # in webapp/
```

## Scheduler jobs not visible on Jobs page

The APScheduler patrol job only registers when `ENABLE_SCHEDULER=1` (default). If you set it to `0`, the Jobs page shows the empty state — that is expected.

## Dog events / profile not persisting

SQLite lives at `data/benny_the_dog_mcp.sqlite3` (gitignored). Deleting the file resets everything (products re-seed, events/profile/orders lost). Make a copy first if the data matters.

## Known issues

- `/api/contact` (email) is a stub that returns "queued" without sending unless SMTP is configured and `ENABLE_EMAIL=1`.
- `/api/upload` requires multipart bodies; the webapp uploads photos via base64 JSON instead, so the endpoint is rarely used.
- FastAPI emits an `on_event` deprecation warning for the scheduler shutdown hook; scheduled for migration to lifespan handlers.
