# Changelog

All notable changes to benny-the-dog-mcp are documented here.

## [0.1.0] - 2026-08-03

### Added

- **Vaccination schedule** on the Vet page (`/vet`) — log vaccine name, administered date, next due date, notes; due/overdue badges (`GET/POST/DELETE /api/dog/vaccinations`).
- **Vet visit log** on the Vet page — date, reason, findings, cost; full history (`GET/POST/DELETE /api/dog/vet-visits`).
- **Vet & health page** (`/vet`) — vet contact (name, phone), breed/age/weight, last checkup, allergies, medications, conditions, and a recent care-event timeline via `GET /api/dog/events`.
- Initial scaffold: FastMCP 3.4 server with `dog_ops` portmanteau (status, water_refill, bark_event, movement, sausage_delivery, movie_time, wake), `app_info`, `server_shutdown`.
- SQLite storage (members, products, orders, dog_profile, dog_pics, dog_tracks, dog_events) with WAL.
- FastAPI REST surface: /api/health, /api/v1/diagnostics, /api/tools, /api/capabilities, /api/skills, /api/logs, /api/jobs, /api/members, /api/products, /api/orders, /api/dog/*.
- APScheduler patrol job (5-min interval, loneliness flag on bark-without-movement).
- React + Vite + Tailwind webapp: Dashboard (hero + KPIs), Tools, Skills, Chat (skill-first, 4 personalities incl. Custom, localStorage history), Settings (LLM provider glom-on), Help, Logs, ApiDocs, Jobs, Members, Shop, Cart, Onboarding wizard.
- CORS fleet standard (tauri origins + unconditional Tailscale/LAN regex).
- Skill resource `skill://benny_the_dog_mcp/SKILL.md` + REST `/skill/{name}`.
- Backend tests (12, 73% coverage) + Playwright fleet-audit e2e (3 specs).
- CI: ruff, ruff format, pyright, pytest on windows-latest; tsc, biome, build on frontend.
- Session context injection: `.claude-plugin/`, `.cursorrules`, `.windsurfrules`, `.opencode/skills/`, `copilot-instructions.md`.
- Onboarding wizard (bio, photos, vet, behaviour, walking, parks/fountains) + dashboard dog card.

### Fixed

- `__APPNAME__` template leak in Onboarding localStorage keys (banner never cleared).
- Ruff F811 (get_skill redefinition), E402 (mid-file import), E714 (is-not) — all gates green.
- Health poll now uses exponential backoff (1s → 16s) instead of fixed 10s.
