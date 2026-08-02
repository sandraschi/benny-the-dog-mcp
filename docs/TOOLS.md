# Tools

## MCP tools

### dog_ops (portmanteau)

Benny care operations - the fleet dog is monitored here.

| operation | purpose | actor |
|-----------|---------|-------|
| `status` | Current state: water refills, barks, movement, sausage deliveries, loneliness flag | any |
| `water_refill` | Log a water bowl refill (`detail` = amount/notes) | human / boomy |
| `bark_event` | Log a bark; flags loneliness when no movement/interaction | sensor / human |
| `movement` | Log movement detection (`actor` = boomy|sensor|human) | boomy / sensor |
| `sausage_delivery` | Log an emergency sausage delivery | boomy / human |
| `movie_time` | Play White Fang on the projector (`detail` = title) | human |
| `wake` | Wake Benny with a sound cue (`detail` = cue) | human / boomy |

```python
dog_ops(operation="status")
dog_ops(operation="water_refill", detail="bowl topped up, 2L")
dog_ops(operation="sausage_delivery", actor="boomy", detail="emergency sausage dropped")
```

### app_info

Server metadata: name, version, tool count.

### server_shutdown

Gracefully shut down the server (requires `confirm=True`).

## REST API

| Endpoint | Purpose |
|----------|---------|
| `GET /api/health` | Liveness: server, version, tool_count |
| `GET /api/v1/diagnostics` | Tool list + system info (CUA smoke testing) |
| `GET /api/capabilities` | Feature flags + tool count |
| `GET /api/tools` | Registered MCP tools |
| `GET /api/skills` | Skill names |
| `GET /skill/{name}` | Raw SKILL.md content |
| `GET /api/logs?limit=N` | In-memory log ring buffer |
| `GET /api/jobs`, `POST /api/jobs/{id}/run` | Scheduler jobs (patrol) |
| `GET/POST /api/members`, `DELETE /api/members/{id}` | Membership roster |
| `GET /api/products`, `POST /api/orders` | Webshop |
| `GET/PUT /api/dog/profile` | Dog profile (onboarding) |
| `GET/POST /api/dog/pics`, `DELETE /api/dog/pics/{id}` | Dog photos (base64) |
| `GET/POST /api/dog/tracks`, `DELETE /api/dog/tracks/{id}` | Dogparks & fountains |
| `GET /api/dog/events?limit=N&event_type=T` | Care event timeline (Vet page; max 200) |
| `GET/POST /api/dog/vaccinations`, `DELETE /api/dog/vaccinations/{id}` | Vaccination schedule (name, administered date, next due, notes) |
| `GET/POST /api/dog/vet-visits`, `DELETE /api/dog/vet-visits/{id}` | Vet visit log (date, reason, findings, cost cents) |
| `/mcp` | MCP streamable HTTP endpoint |
| `/docs` | FastAPI Swagger UI |
| `/ws` | Echo WebSocket (only when `ENABLE_REALTIME=1`) |

## Skills

- `skill://benny_the_dog_mcp/SKILL.md` — care protocol + tool usage guide. Fetch via `GET /skill/benny_the_dog_mcp` or the MCP resource.
