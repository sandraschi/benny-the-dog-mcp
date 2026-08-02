# benny-the-dog-mcp — Agent Map

Benny the dog health and care monitor: water bowls, movement, loneliness detection, sausage deliveries, projector movie time, wake calls. Boomy-robot patrol integration ready.

## Reading order

1. `src/benny_the_dog_mcp/server.py` — FastMCP 3.4 server + FastAPI app. Tools: `app_info`, `dog_ops` (portmanteau: status/water_refill/bark_event/movement/sausage_delivery/movie_time/wake), `server_shutdown`. REST: /api/health, /api/v1/diagnostics, /api/tools, /api/capabilities, /api/skills, /skill/{name}, /api/logs, /api/members, /api/products, /api/orders, /api/dog/* (profile/pics/tracks), /api/jobs, /mcp.
2. `src/benny_the_dog_mcp/db.py` — SQLite (members, products, orders, dog_profile, dog_pics, dog_tracks, dog_events). Local-first, WAL.
3. `webapp/src/` — React + Vite + Tailwind. Pages: Dashboard, Tools, Skills, Chat, Settings, Help, Logs, ApiDocs, Jobs, Members, Shop, Cart, Onboarding. Stores: `store/llm.ts`, `store/cart.ts`. API base: `lib/api.ts` (11142).
4. `tests/` — pytest (backend REST + coverage).

## Key facts

- Ports: backend 11142, frontend 11143 (fleet registry).
- Scheduler: APScheduler `patrol` job every 5 min (ENABLE_SCHEDULER=1 default).
- CORS: fleet standard (tauri origins + unconditional regex).
- Session context injection: `.cursorrules`, `.windsurfrules`, `.claude-plugin/`, `.opencode/skills/`.

## Gates

`just gates-green` (ruff + pyright + pytest) and `bunx biome check webapp/src/` + `bunx tsc --noEmit` in webapp/.
