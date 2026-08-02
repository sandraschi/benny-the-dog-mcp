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
