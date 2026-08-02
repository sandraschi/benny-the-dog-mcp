# benny-the-dog-mcp

Benny the dog health and care monitor - water bowls, movement, loneliness detection, sausage deliveries, projector movie time, wake calls. Boomy-robot patrol integration ready.

## Install

Requires Python 3.11+ and uv.

```powershell
uv run python -m benny_the_dog_mcp.server
```

The server starts in stdio mode for MCP clients. For the full webapp experience (dashboard, onboarding wizard, chat), clone the repository and run `start.ps1`.

## Tools

- `dog_ops` — care portmanteau: status, water_refill, bark_event, movement, sausage_delivery, movie_time, wake
- `app_info` — server metadata
- `server_shutdown` — graceful shutdown (requires confirm=True)

See `assets/prompts/` for the full care protocol (system.md, user.md, examples.json).

## Data

Events persist in local SQLite (`data/benny_the_dog_mcp.sqlite3`). No cloud, no telemetry.
