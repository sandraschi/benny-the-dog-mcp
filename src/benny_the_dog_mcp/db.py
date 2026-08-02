"""SQLite local-first storage for benny-the-dog-mcp (members, products, orders)."""

from __future__ import annotations

import sqlite3
from pathlib import Path

_DB_PATH = Path(__file__).parent.parent.parent / "data" / "benny_the_dog_mcp.sqlite3"
_DB_PATH.parent.mkdir(parents=True, exist_ok=True)


def _conn() -> sqlite3.Connection:
    conn = sqlite3.connect(_DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db() -> None:
    with _conn() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS members (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                role TEXT NOT NULL DEFAULT 'member',
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                price_cents INTEGER NOT NULL,
                description TEXT NOT NULL DEFAULT ''
            );
            CREATE TABLE IF NOT EXISTS dog_profile (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                name TEXT NOT NULL DEFAULT 'Benny',
                breed TEXT NOT NULL DEFAULT '',
                age_years REAL NOT NULL DEFAULT 0,
                weight_kg REAL NOT NULL DEFAULT 0,
                bio TEXT NOT NULL DEFAULT '',
                vet_name TEXT NOT NULL DEFAULT '',
                vet_phone TEXT NOT NULL DEFAULT '',
                allergies TEXT NOT NULL DEFAULT '',
                medications TEXT NOT NULL DEFAULT '',
                last_checkup TEXT NOT NULL DEFAULT '',
                conditions TEXT NOT NULL DEFAULT '',
                energy_level TEXT NOT NULL DEFAULT 'medium',
                temperament TEXT NOT NULL DEFAULT '',
                barkiness TEXT NOT NULL DEFAULT 'medium',
                socialization TEXT NOT NULL DEFAULT '',
                fears TEXT NOT NULL DEFAULT '',
                walk_times TEXT NOT NULL DEFAULT '',
                walk_duration_min INTEGER NOT NULL DEFAULT 30,
                walk_route TEXT NOT NULL DEFAULT '',
                onboarded INTEGER NOT NULL DEFAULT 0
            );
            CREATE TABLE IF NOT EXISTS dog_pics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                mime TEXT NOT NULL DEFAULT 'image/jpeg',
                data_base64 TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS dog_tracks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                track_type TEXT NOT NULL,
                name TEXT NOT NULL,
                lat REAL NOT NULL DEFAULT 0,
                lon REAL NOT NULL DEFAULT 0,
                notes TEXT NOT NULL DEFAULT ''
            );
            CREATE TABLE IF NOT EXISTS dog_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_type TEXT NOT NULL,
                payload TEXT NOT NULL DEFAULT '{}',
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                items TEXT NOT NULL,
                total_cents INTEGER NOT NULL,
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            );
            """
        )


def seed_products() -> None:
    with _conn() as conn:
        count = conn.execute("SELECT COUNT(*) FROM products").fetchone()[0]
        if count == 0:
            conn.executemany(
                "INSERT INTO products (name, price_cents, description) VALUES (?, ?, ?)",
                [
                    ("Robot patrol sticker", 499, "Boomy approved, weatherproof"),
                    ("Fleet keycap", 1299, "Cherry MX, amber accent"),
                    ("MCP mug", 1599, "Hot tools in a hot mug"),
                    ("Scheduler t-shirt", 2499, "Every 5 minutes, on time"),
                ],
            )


def list_members() -> list[dict]:
    with _conn() as conn:
        rows = conn.execute("SELECT * FROM members ORDER BY id").fetchall()
    return [dict(r) for r in rows]


def add_member(name: str, email: str, role: str = "member") -> dict:
    with _conn() as conn:
        cur = conn.execute(
            "INSERT INTO members (name, email, role) VALUES (?, ?, ?)",
            (name, email, role),
        )
        row = conn.execute(
            "SELECT * FROM members WHERE id = ?", (cur.lastrowid,)
        ).fetchone()
    return dict(row)


def delete_member(member_id: int) -> bool:
    with _conn() as conn:
        cur = conn.execute("DELETE FROM members WHERE id = ?", (member_id,))
    return cur.rowcount > 0


def list_products() -> list[dict]:
    with _conn() as conn:
        rows = conn.execute("SELECT * FROM products ORDER BY id").fetchall()
    return [dict(r) for r in rows]


def create_order(items: str, total_cents: int) -> dict:
    with _conn() as conn:
        cur = conn.execute(
            "INSERT INTO orders (items, total_cents) VALUES (?, ?)",
            (items, total_cents),
        )
        row = conn.execute(
            "SELECT * FROM orders WHERE id = ?", (cur.lastrowid,)
        ).fetchone()
    return dict(row)

def log_dog_event(event_type: str, payload: dict | None = None) -> dict:
    """Append a Benny event (water, bark, movement, sausage, movie, wake)."""
    import json

    with _conn() as conn:
        cur = conn.execute(
            "INSERT INTO dog_events (event_type, payload) VALUES (?, ?)",
            (event_type, json.dumps(payload or {})),
        )
        row = conn.execute(
            "SELECT * FROM dog_events WHERE id = ?", (cur.lastrowid,)
        ).fetchone()
    return dict(row)


def dog_events(event_type: str | None = None, limit: int = 20) -> list[dict]:
    import json

    with _conn() as conn:
        if event_type:
            rows = conn.execute(
                "SELECT * FROM dog_events WHERE event_type = ? ORDER BY id DESC LIMIT ?",
                (event_type, limit),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM dog_events ORDER BY id DESC LIMIT ?", (limit,)
            ).fetchall()
    out = []
    for r in rows:
        d = dict(r)
        try:
            d["payload"] = json.loads(d["payload"])
        except Exception:
            pass
        out.append(d)
    return out


def get_dog_profile() -> dict | None:
    with _conn() as conn:
        row = conn.execute("SELECT * FROM dog_profile WHERE id = 1").fetchone()
    return dict(row) if row else None


def save_dog_profile(p: dict) -> dict:
    fields = [
        "name", "breed", "age_years", "weight_kg", "bio", "vet_name",
        "vet_phone", "allergies", "medications", "last_checkup", "conditions",
        "energy_level", "temperament", "barkiness", "socialization", "fears",
        "walk_times", "walk_duration_min", "walk_route", "onboarded",
    ]
    with _conn() as conn:
        conn.execute(
            "INSERT INTO dog_profile (id, " + ", ".join(fields) + ") VALUES (1, " +
            ", ".join(["?"] * len(fields)) + ") " +
            "ON CONFLICT(id) DO UPDATE SET " +
            ", ".join([f"{f} = excluded.{f}" for f in fields]),
            tuple(p.get(f, "" if f in ("name", "breed", "bio", "vet_name", "vet_phone", "allergies", "medications", "last_checkup", "conditions", "energy_level", "temperament", "barkiness", "socialization", "fears", "walk_times", "walk_route") else 0 if f in ("age_years", "weight_kg", "walk_duration_min") else 1) for f in fields),
        )
        row = conn.execute("SELECT * FROM dog_profile WHERE id = 1").fetchone()
    return dict(row)


def add_dog_pic(name: str, mime: str, data_base64: str) -> dict:
    with _conn() as conn:
        cur = conn.execute(
            "INSERT INTO dog_pics (name, mime, data_base64) VALUES (?, ?, ?)",
            (name, mime, data_base64),
        )
        row = conn.execute("SELECT id, name, mime FROM dog_pics WHERE id = ?", (cur.lastrowid,)).fetchone()
    return dict(row)


def list_dog_pics() -> list[dict]:
    with _conn() as conn:
        rows = conn.execute("SELECT id, name, mime, data_base64 FROM dog_pics ORDER BY id").fetchall()
    return [dict(r) for r in rows]


def delete_dog_pic(pic_id: int) -> bool:
    with _conn() as conn:
        cur = conn.execute("DELETE FROM dog_pics WHERE id = ?", (pic_id,))
    return cur.rowcount > 0


def list_tracks(track_type: str | None = None) -> list[dict]:
    with _conn() as conn:
        if track_type:
            rows = conn.execute(
                "SELECT * FROM dog_tracks WHERE track_type = ? ORDER BY id", (track_type,)
            ).fetchall()
        else:
            rows = conn.execute("SELECT * FROM dog_tracks ORDER BY id").fetchall()
    return [dict(r) for r in rows]


def add_track(track_type: str, name: str, lat: float, lon: float, notes: str = "") -> dict:
    with _conn() as conn:
        cur = conn.execute(
            "INSERT INTO dog_tracks (track_type, name, lat, lon, notes) VALUES (?, ?, ?, ?, ?)",
            (track_type, name, lat, lon, notes),
        )
        row = conn.execute("SELECT * FROM dog_tracks WHERE id = ?", (cur.lastrowid,)).fetchone()
    return dict(row)


def delete_track(track_id: int) -> bool:
    with _conn() as conn:
        cur = conn.execute("DELETE FROM dog_tracks WHERE id = ?", (track_id,))
    return cur.rowcount > 0
