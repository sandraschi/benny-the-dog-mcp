# Configuration

## Environment variables

Copy `.env.example` to `.env` and adjust. Never commit `.env`.

| Variable | Default | Purpose |
|----------|---------|---------|
| `WEB_PORT` | `11142` | Backend port (fleet registry). |
| `WEB_HOST` | `127.0.0.1` | Backend bind host. |
| `LLM_PROVIDER` | `ollama` | Preferred local LLM provider. |
| `OLLAMA_URL` | `http://127.0.0.1:11434` | Ollama endpoint for chat. |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | empty | Mail relay for `/api/contact` (only when `ENABLE_EMAIL=1`). |
| `ENABLE_SCHEDULER` | `1` | Run the APScheduler patrol job (5-min interval). |
| `ENABLE_UPLOAD` | `0` | Enable multipart upload endpoint. |
| `ENABLE_EMAIL` | `0` | Enable `/api/contact` stub. |
| `ENABLE_REALTIME` | `0` | Enable `/ws` echo WebSocket. |

## Ports

| Port | Service |
|------|---------|
| 11142 | Backend (FastAPI + MCP HTTP `/mcp`), Swagger at `/docs` |
| 11143 | Frontend (Vite dev, proxies `/api`, `/mcp`, `/docs`, `/ws`) |

Both ports are registered in `mcp-central-docs/operations/WEBAPP_PORTS.md`. Do not change them.

## Storage

SQLite at `data/benny_the_dog_mcp.sqlite3` (WAL mode). Tables: members, products, orders, dog_profile, dog_pics, dog_tracks, dog_events. The `data/` directory is gitignored.

## CORS

Fleet standard: explicit origins (localhost, tauri) + unconditional regex for Tailscale `*.ts.net`, LAN `192.168.x.x` / `10.x.x.x`, Tailscale CGNAT `100.x.x.x`. No wildcard origins.
