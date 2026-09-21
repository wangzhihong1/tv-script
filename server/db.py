from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
DB_PATH = DATA_DIR / "tvscript.db"


def connect() -> sqlite3.Connection:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            payload TEXT NOT NULL,
            updated_at INTEGER NOT NULL
        )
        """
    )
    conn.commit()
    return conn


def list_projects() -> list[dict[str, Any]]:
    with connect() as conn:
        rows = conn.execute(
            "SELECT payload FROM projects ORDER BY updated_at DESC"
        ).fetchall()
    return [json.loads(row["payload"]) for row in rows]


def get_project(project_id: str) -> dict[str, Any] | None:
    with connect() as conn:
        row = conn.execute(
            "SELECT payload FROM projects WHERE id = ?", (project_id,)
        ).fetchone()
    return json.loads(row["payload"]) if row else None


def upsert_project(project: dict[str, Any]) -> dict[str, Any]:
    project_id = project.get("id")
    if not project_id:
        raise ValueError("剧目缺少 id")
    payload = json.dumps(project, ensure_ascii=False)
    with connect() as conn:
        conn.execute(
            """
            INSERT INTO projects (id, payload, updated_at)
            VALUES (?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                payload = excluded.payload,
                updated_at = excluded.updated_at
            """,
            (project_id, payload, int(project.get("updatedAt") or 0)),
        )
        conn.commit()
    return project


def delete_project(project_id: str) -> None:
    with connect() as conn:
        conn.execute("DELETE FROM projects WHERE id = ?", (project_id,))
        conn.commit()
