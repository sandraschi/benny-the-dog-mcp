"""FastMCP 3.4 server with FastAPI HTTP app for benny-the-dog-mcp.

Run: uv run uvicorn benny_the_dog_mcp.server:app --host 127.0.0.1 --port 11142
"""

from __future__ import annotations

import os
import threading
from collections import deque
from datetime import datetime
from typing import Annotated, Any, Literal

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastmcp import Context, FastMCP
from pydantic import Field

from . import db as _db

_db.init_db()
_db.seed_products()

mcp = FastMCP(
    "benny-the-dog-mcp",
    instructions="Fleet-standard benny-the-dog-mcp MCP server.",
)

_tauri_desktop = os.environ.get("benny_the_dog_mcp_TAURI", "").lower() in ("1", "true", "yes")

_README_ONLY = {"readonly": True}
_MUTATING = {}


@mcp.tool(annotations=_README_ONLY)
async def app_info(ctx: Context | None = None) -> dict:
    """Return metadata about this server.

    ## Return Format
    {"success": bool, "name": str, "version": str, "tool_count": int}

    ## Examples
    app_info()
    """
    tools = await mcp.list_tools()
    return {
        "success": True,
        "name": "benny-the-dog-mcp",
        "version": "0.1.0",
        "tool_count": len(tools),
    }


@mcp.tool()
async def example_op(
    operation: str = "hello",
    name: str = "world",
    ctx: Context | None = None,
) -> dict:
    """Example portmanteau tool - demonstrates the fleet operation pattern.

    ## Return Format
    {"success": bool, "message": str, "data": dict}

    ## Examples
    example_op(operation="hello", name="Sandra")
    example_op(operation="echo", name="ping")
    """
    if operation == "hello":
        return {"success": True, "message": f"Hello, {name}!", "data": {"name": name}}
    if operation == "echo":
        return {"success": True, "message": name, "data": {"echo": name}}
    return {"success": False, "error": f"Unknown operation: {operation}"}


@mcp.tool(annotations=_MUTATING)
async def dog_ops(
    operation: Annotated[
        Literal[
            "status",
            "water_refill",
            "bark_event",
            "movement",
            "sausage_delivery",
            "movie_time",
            "wake",
        ],
        Field(description="The dog care operation to perform."),
    ],
    detail: Annotated[str, Field(description="Amount, notes, or cue text for the operation.")] = "",
    actor: Annotated[
        str, Field(description="Who performed the operation (boomy|sensor|human).")
    ] = "human",
    ctx: Context | None = None,
) -> dict:
    """Benny care operations - the fleet dog is monitored here.

    [RATIONALE]
    Consolidates all dog care ops into one tool so the Boomy robot patrol,
    human caretakers, and agents share a single state machine.

    ## Operations
    - status: current state (water, movement, barks, sausage deliveries, mood)
    - water_refill: log a water bowl refill (detail = amount/notes)
    - bark_event: log a bark; flags loneliness when no movement/interaction
    - movement: log movement detection (actor = boomy|sensor|human)
    - sausage_delivery: log an emergency sausage delivery (actor, detail)
    - movie_time: play White Fang on the projector (detail = title)
    - wake: wake Benny with a sound cue (detail = cue)

    ## Return Format
    {"success": bool, "operation": str, "message": str, "data": dict}

    ## Examples
    dog_ops(operation="status")
    dog_ops(operation="water_refill", detail="bowl topped up, 2L")
    dog_ops(operation="sausage_delivery", actor="boomy", detail="emergency sausage dropped")
    """
    if operation == "status":
        events = _db.dog_events(limit=50)
        water = [e for e in events if e["event_type"] == "water_refill"]
        barks = [e for e in events if e["event_type"] == "bark_event"]
        movement = [e for e in events if e["event_type"] == "movement"]
        sausages = [e for e in events if e["event_type"] == "sausage_delivery"]
        last_movement = movement[0]["created_at"] if movement else None
        lonely = bool(barks) and (not last_movement or barks[0]["created_at"] > last_movement)
        return {
            "success": True,
            "operation": "status",
            "message": (
                "Benny is "
                + (
                    "possibly lonely - last movement was " + str(last_movement)
                    if lonely
                    else "fine"
                )
            ),
            "data": {
                "water_refills": len(water),
                "barks": len(barks),
                "movements": len(movement),
                "sausage_deliveries": len(sausages),
                "last_movement": last_movement,
                "loneliness_flag": lonely,
                "events": events[:10],
            },
        }
    if operation == "water_refill":
        _db.log_dog_event("water_refill", {"actor": actor, "detail": detail})
        ring_log("benny", "INFO", f"water refilled by {actor}: {detail}")
        return {
            "success": True,
            "operation": operation,
            "message": "Water bowl topped up.",
            "data": {},
        }
    if operation == "bark_event":
        _db.log_dog_event("bark_event", {"actor": actor, "detail": detail})
        ring_log("benny", "WARNING", f"bark logged: {detail}")
        return {
            "success": True,
            "operation": operation,
            "message": "Bark logged - check on Benny.",
            "data": {},
        }
    if operation == "movement":
        _db.log_dog_event("movement", {"actor": actor, "detail": detail})
        ring_log("benny", "INFO", f"movement detected by {actor}")
        return {"success": True, "operation": operation, "message": "Movement logged.", "data": {}}
    if operation == "sausage_delivery":
        _db.log_dog_event("sausage_delivery", {"actor": actor, "detail": detail})
        ring_log("benny", "INFO", f"emergency sausage delivered by {actor}")
        return {
            "success": True,
            "operation": operation,
            "message": "Sausage delivered. Good boy points awarded.",
            "data": {},
        }
    if operation == "movie_time":
        _db.log_dog_event("movie_time", {"actor": actor, "detail": detail or "White Fang"})
        ring_log("benny", "INFO", f"projector: {detail or 'White Fang'}")
        return {
            "success": True,
            "operation": operation,
            "message": f"Playing {detail or 'White Fang'} on the projector.",
            "data": {"host_command": "ffplay -autoexit -nodisp movie.mp4"},
        }
    if operation == "wake":
        _db.log_dog_event("wake", {"actor": actor, "detail": detail})
        ring_log("benny", "INFO", f"wake call issued: {detail}")
        return {"success": True, "operation": operation, "message": "Wake call issued.", "data": {}}
    return {"success": False, "operation": operation, "error": f"Unknown operation: {operation}"}


@mcp.tool(annotations={"destructive": True})
async def server_shutdown(confirm: bool = False, ctx: Context | None = None) -> dict:
    """Gracefully shut down the benny-the-dog-mcp server.

    Requires confirm=True to prevent accidental termination.

    ## Return Format
    {"success": bool, "message": str}

    ## Examples
    server_shutdown(confirm=True)
    """
    if not confirm:
        return {"success": False, "message": "Pass confirm=True to shut down the server."}
    ring_log("benny", "WARNING", "server shutdown requested by agent")
    threading.Timer(1.0, lambda: os._exit(0)).start()
    return {"success": True, "message": "Server shutting down."}


@mcp.resource("skill://benny_the_dog_mcp/SKILL.md")
def get_skill() -> str:
    """Expose the bundled skill as an MCP resource."""
    from pathlib import Path

    skill_path = Path(__file__).parent / "skills" / "benny_the_dog_mcp" / "SKILL.md"
    return skill_path.read_text(encoding="utf-8") if skill_path.exists() else ""


# ---------------------------------------------------------------------------
# FastAPI app (webapp backend + CORS + health endpoints)
# ---------------------------------------------------------------------------
_mcp_http = mcp.http_app(path="/")
app = FastAPI(title="benny-the-dog-mcp", version="0.1.0", lifespan=_mcp_http.lifespan)


@app.get("/api/health")
async def health() -> dict[str, Any]:
    tools = await mcp.list_tools()
    return {
        "status": "ok",
        "server": "benny-the-dog-mcp",
        "version": "0.1.0",
        "uptime_seconds": 0,
        "tool_count": len(tools),
    }


@app.get("/api/v1/diagnostics")
async def diagnostics() -> dict[str, Any]:
    tools = await mcp.list_tools()
    return {
        "status": "ok",
        "server": "benny-the-dog-mcp",
        "version": "0.1.0",
        "uptime_seconds": 0,
        "tool_count": len(tools),
        "tools": [{"name": t.name} for t in tools],
        "system": {"windows": os.name == "nt"},
        "errors": [],
    }


@app.get("/api/capabilities")
async def capabilities() -> dict[str, Any]:
    tools = await mcp.list_tools()
    return {
        "success": True,
        "server": "benny-the-dog-mcp",
        "features": [
            "dog_ops",
            "scheduler",
            "members",
            "shop",
            "onboarding",
            "llm_chat",
            "skills",
        ],
        "tool_count": len(tools),
        "transport": ["stdio", "http"],
    }


@app.get("/api/tools")
async def api_tools() -> dict[str, Any]:
    tools = await mcp.list_tools()
    return {
        "success": True,
        "tools": [
            {
                "name": t.name,
                "description": (t.description or "").splitlines()[0],
            }
            for t in tools
        ],
    }


@app.get("/api/skills")
async def api_skills() -> dict[str, Any]:
    return {"success": True, "skills": ["benny_the_dog_mcp"]}


@app.get("/skill/{skill_name}")
async def api_skill_content(skill_name: str) -> str:
    """Return the raw SKILL.md content for a skill name."""
    from pathlib import Path

    skill_path = Path(__file__).parent / "skills" / skill_name / "SKILL.md"
    if skill_path.exists():
        return skill_path.read_text(encoding="utf-8")
    return "not found"


# ---------------------------------------------------------------------------
# In-memory log ring buffer (fleet UiLog pattern)
# ---------------------------------------------------------------------------
_LOG_RING: deque[dict] = deque(maxlen=200)


def ring_log(source: str, level: str, message: str) -> None:
    _LOG_RING.appendleft(
        {
            "ts": datetime.now().isoformat(timespec="seconds"),
            "source": source,
            "level": level,
            "message": message,
        }
    )


@app.get("/api/logs")
async def api_logs(limit: int = 50) -> dict[str, Any]:
    return {
        "success": True,
        "entries": list(_LOG_RING)[:limit],
        "count": min(limit, len(_LOG_RING)),
    }


# ---------------------------------------------------------------------------
# Membership roster (SQLite)
# ---------------------------------------------------------------------------
@app.get("/api/members")
async def api_members() -> dict[str, Any]:
    members = _db.list_members()
    return {"success": True, "members": members, "count": len(members)}


@app.post("/api/members")
async def api_members_add(payload: dict[str, Any]) -> dict[str, Any]:
    name = (payload.get("name") or "").strip()
    email = (payload.get("email") or "").strip()
    if not name or not email:
        return {"success": False, "error": "name and email required"}
    try:
        member = _db.add_member(name, email, (payload.get("role") or "member").strip())
    except Exception as exc:
        return {"success": False, "error": str(exc)}
    ring_log("roster", "INFO", f"member added: {name} <{email}>")
    return {"success": True, "member": member}


@app.delete("/api/members/{member_id}")
async def api_members_delete(member_id: int) -> dict[str, Any]:
    ok = _db.delete_member(member_id)
    if ok:
        ring_log("roster", "INFO", f"member removed: id {member_id}")
    return {"success": ok, "id": member_id}


# ---------------------------------------------------------------------------
# Webshop (products + orders, SQLite)
# ---------------------------------------------------------------------------
@app.get("/api/products")
async def api_products() -> dict[str, Any]:
    return {"success": True, "products": _db.list_products()}


@app.post("/api/orders")
async def api_orders_create(payload: dict[str, Any]) -> dict[str, Any]:
    items = payload.get("items")
    total = payload.get("total_cents")
    if not isinstance(items, str) or not isinstance(total, int):
        return {"success": False, "error": "items (str) and total_cents (int) required"}
    order = _db.create_order(items, total)
    ring_log("shop", "INFO", f"order {order['id']} placed for {total / 100:.2f} EUR")
    return {"success": True, "order": order}


# ---------------------------------------------------------------------------


# ---------------------------------------------------------------------------
# Dog profile, pics, and tracks (onboarding data)
# ---------------------------------------------------------------------------
@app.get("/api/dog/profile")
async def api_dog_profile() -> dict[str, Any]:
    profile = _db.get_dog_profile()
    if profile is None:
        return {"success": True, "profile": None}
    return {"success": True, "profile": profile}


@app.put("/api/dog/profile")
async def api_dog_profile_save(payload: dict[str, Any]) -> dict[str, Any]:
    profile = _db.save_dog_profile(payload)
    ring_log("benny", "INFO", f"dog profile saved for {profile.get('name', '?')}")
    return {"success": True, "profile": profile}


@app.get("/api/dog/pics")
async def api_dog_pics() -> dict[str, Any]:
    return {"success": True, "pics": _db.list_dog_pics()}


@app.post("/api/dog/pics")
async def api_dog_pics_add(payload: dict[str, Any]) -> dict[str, Any]:
    name = (payload.get("name") or "benny.jpg").strip()
    mime = (payload.get("mime") or "image/jpeg").strip()
    data = (payload.get("data") or "").strip()
    if not data:
        return {"success": False, "error": "data (base64) required"}
    pic = _db.add_dog_pic(name, mime, data)
    return {"success": True, "pic": pic}


@app.delete("/api/dog/pics/{pic_id}")
async def api_dog_pics_delete(pic_id: int) -> dict[str, Any]:
    return {"success": _db.delete_dog_pic(pic_id), "id": pic_id}


@app.get("/api/dog/tracks")
async def api_dog_tracks(track_type: str = "") -> dict[str, Any]:
    tracks = _db.list_tracks(track_type or None)
    return {"success": True, "tracks": tracks, "count": len(tracks)}


@app.post("/api/dog/tracks")
async def api_dog_tracks_add(payload: dict[str, Any]) -> dict[str, Any]:
    track_type = (payload.get("track_type") or "").strip()
    name = (payload.get("name") or "").strip()
    if track_type not in ("park", "fountain") or not name:
        return {"success": False, "error": "track_type (park|fountain) and name required"}
    track = _db.add_track(
        track_type,
        name,
        float(payload.get("lat") or 0),
        float(payload.get("lon") or 0),
        (payload.get("notes") or "").strip(),
    )
    return {"success": True, "track": track}


@app.delete("/api/dog/tracks/{track_id}")
async def api_dog_tracks_delete(track_id: int) -> dict[str, Any]:
    return {"success": _db.delete_track(track_id), "id": track_id}


# Scheduler (APScheduler periodic jobs) - the robot patrol foundation
# ---------------------------------------------------------------------------
if os.environ.get("ENABLE_SCHEDULER", "1") == "1":
    from apscheduler.schedulers.background import BackgroundScheduler

    _JOBS: dict[str, dict] = {}
    _scheduler = BackgroundScheduler()

    def _patrol_tick() -> None:
        events = _db.dog_events(limit=10)
        movement = [e for e in events if e["event_type"] == "movement"]
        barks = [e for e in events if e["event_type"] == "bark_event"]
        message = "patrol completed - Benny checked"
        if barks and (
            not movement or barks[0]["created_at"] > (movement[0]["created_at"] if movement else "")
        ):
            message = (
                "patrol: Benny barked with no recent movement - loneliness flag, consider sausage"
            )
            ring_log("benny", "WARNING", "patrol flags possible loneliness")
        _JOBS["patrol"] = {
            "name": "patrol",
            "last_run": datetime.now().isoformat(timespec="seconds"),
            "status": "ok",
            "message": message,
        }
        ring_log("scheduler", "INFO", "patrol tick - " + message)

    _scheduler.add_job(_patrol_tick, "interval", minutes=5, id="patrol")
    _scheduler.start()
    ring_log("scheduler", "INFO", "scheduler started")

    @app.get("/api/jobs")
    async def api_jobs() -> dict[str, Any]:
        jobs = [
            {
                "id": j.id,
                "next_run": str(j.next_run_time or ""),
                "enabled": j.next_run_time is not None,
            }
            for j in _scheduler.get_jobs()
        ]
        return {"success": True, "jobs": jobs, "runs": _JOBS}

    @app.post("/api/jobs/{job_id}/run")
    async def run_job(job_id: str) -> dict[str, Any]:
        if job_id == "patrol":
            _patrol_tick()
            return {"success": True, "message": "patrol dispatched"}
        return {"success": False, "error": f"unknown job: {job_id}"}

    @app.on_event("shutdown")
    async def _stop_scheduler() -> None:
        _scheduler.shutdown(wait=False)


# ---------------------------------------------------------------------------
# Optional feature endpoints
# ---------------------------------------------------------------------------
if os.environ.get("ENABLE_UPLOAD", "0") == "1":
    from pathlib import Path

    _UPLOAD_DIR = Path(os.environ.get("UPLOAD_DIR", "data/uploads"))
    _UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    @app.post("/api/upload")
    async def upload(file: Any = None) -> dict[str, Any]:
        return {"success": False, "error": "multipart body expected"}


if os.environ.get("ENABLE_EMAIL", "0") == "1":

    @app.post("/api/contact")
    async def contact(subject: str = "", body: str = "") -> dict[str, Any]:
        if not subject or not body:
            return {"success": False, "error": "subject and body required"}
        return {"success": True, "message": "email queued (configure SMTP in .env)"}


if os.environ.get("ENABLE_REALTIME", "0") == "1":
    from fastapi import WebSocket

    @app.websocket("/ws")
    async def websocket_endpoint(websocket: WebSocket) -> None:
        await websocket.accept()
        try:
            while True:
                data = await websocket.receive_text()
                await websocket.send_text(f"echo: {data}")
        except Exception:
            pass


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        f"http://localhost:{os.environ.get('WEB_PORT', '11143')}",
        f"http://127.0.0.1:{os.environ.get('WEB_PORT', '11143')}",
        "http://tauri.localhost",
        "https://tauri.localhost",
        "tauri://localhost",
    ],
    allow_origin_regex=(
        r"https?://(?:[a-zA-Z0-9-]+\.ts\.net|.*?\.tail-[a-f0-9]+\.ts\.net|"
        r"tauri\.localhost|localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|"
        r"10\.\d{1,3}\.\d{1,3}\.\d{1,3}|100\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::\d+)?$"
        r"|^tauri://localhost$"
    ),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/mcp", _mcp_http)


def main() -> None:
    import uvicorn

    port = int(os.environ.get("WEB_PORT", "11142"))
    host = os.environ.get("WEB_HOST", "127.0.0.1")
    uvicorn.run(app, host=host, port=port, log_level="info")


if __name__ == "__main__":
    main()
