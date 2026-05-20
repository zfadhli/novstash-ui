"""SQLite database access module for novstash-cli.

Resolves the database path using the NOVSTASH_DATABASE_URL environment
variable, or falls back to ../../local.db relative to this file's location
(the monorepo root).
"""

import os
import sqlite3
from pathlib import Path

from novstash_cli.models import ChapterModel, NovelModel

# ---------------------------------------------------------------------------
# Schema
# ---------------------------------------------------------------------------

CREATE_NOVELS_TABLE = """
CREATE TABLE IF NOT EXISTS novels (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT,
    cover_url TEXT,
    synopsis TEXT,
    status TEXT,
    source TEXT,
    source_url TEXT,
    genres TEXT,
    rating REAL,
    chapter_count INTEGER,
    created_at TEXT,
    updated_at TEXT
);
"""

CREATE_CHAPTERS_TABLE = """
CREATE TABLE IF NOT EXISTS chapters (
    id TEXT PRIMARY KEY,
    novel_id TEXT NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
    number INTEGER NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    created_at TEXT,
    updated_at TEXT
);
"""

CREATE_CHAPTERS_NOVEL_ID_INDEX = """
CREATE INDEX IF NOT EXISTS idx_chapters_novel_id ON chapters(novel_id);
"""

# ---------------------------------------------------------------------------
# Path resolution
# ---------------------------------------------------------------------------


def _resolve_db_path() -> str:
    """Resolve the path to local.db.

    Priority:
    1. NOVSTASH_DATABASE_URL env var (strip ``file:`` prefix).
    2. Default: ``../../local.db`` relative to ``src/novstash_cli/``.
    """
    env_url = os.environ.get("NOVSTASH_DATABASE_URL")
    if env_url:
        return env_url.removeprefix("file:")

    # Default: relative to this file's location
    # src/novstash_cli/db.py -> src/novstash_cli/ -> novstash_cli/ -> apps/ -> monorepo root
    here = Path(__file__).resolve().parent  # src/novstash_cli/
    repo_root = here.parents[3]  # up to monorepo root
    db_path = repo_root / "local.db"
    return str(db_path)


# ---------------------------------------------------------------------------
# Connection
# ---------------------------------------------------------------------------

_db_path: str | None = None


def get_db_path() -> str:
    """Return the resolved database path (cached after first call)."""
    global _db_path
    if _db_path is None:
        _db_path = _resolve_db_path()
    return _db_path


def get_connection() -> sqlite3.Connection:
    """Create and return a new SQLite connection.

    The connection uses ``sqlite3.Row`` as the row factory and enables
    WAL mode for better concurrent access.
    """
    db_path = get_db_path()
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA foreign_keys=ON;")
    return conn


# ---------------------------------------------------------------------------
# Initialization
# ---------------------------------------------------------------------------


def init_db(conn: sqlite3.Connection) -> None:
    """Create tables and indexes if they don't exist (idempotent)."""
    conn.execute(CREATE_NOVELS_TABLE)
    conn.execute(CREATE_CHAPTERS_TABLE)
    conn.execute(CREATE_CHAPTERS_NOVEL_ID_INDEX)
    conn.commit()


# ---------------------------------------------------------------------------
# CRUD — novels
# ---------------------------------------------------------------------------


def insert_novel(conn: sqlite3.Connection, novel: NovelModel) -> str:
    """Insert a single novel row. Returns the novel ID."""
    conn.execute(
        """
        INSERT INTO novels (id, title, author, cover_url, synopsis, status,
                            source, source_url, genres, rating, chapter_count,
                            created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            novel.id,
            novel.title,
            novel.author,
            novel.cover_url,
            novel.synopsis,
            novel.status,
            novel.source,
            novel.source_url,
            novel.genres,
            novel.rating,
            novel.chapter_count,
            novel.created_at,
            novel.updated_at,
        ),
    )
    return novel.id


def get_novel_by_source_url(conn: sqlite3.Connection, source_url: str) -> dict | None:
    """Look up a novel by its source URL.

    Returns a dict (row) or None if not found.
    """
    row = conn.execute("SELECT * FROM novels WHERE source_url = ?", (source_url,)).fetchone()
    if row is None:
        return None
    return dict(row)


def get_novel_by_id(conn: sqlite3.Connection, novel_id: str) -> dict | None:
    """Look up a novel by its ID.

    Returns a dict (row) or None if not found.
    """
    row = conn.execute("SELECT * FROM novels WHERE id = ?", (novel_id,)).fetchone()
    if row is None:
        return None
    return dict(row)


def get_novel_by_title(conn: sqlite3.Connection, title_substr: str) -> dict | None:
    """Look up a novel by a case-insensitive title substring.

    Returns the first matching dict (row) or None.
    """
    row = conn.execute(
        "SELECT * FROM novels WHERE LOWER(title) LIKE ?",
        (f"%{title_substr.lower()}%",),
    ).fetchone()
    if row is None:
        return None
    return dict(row)


def list_novels(
    conn: sqlite3.Connection,
    sort: str = "title",
) -> list[dict]:
    """Return all novels, ordered by the given sort key.

    Supported sort keys: ``title`` (default), ``date``, ``rating``,
    ``author``, ``status``.
    """
    sort_column = {
        "title": "title COLLATE NOCASE",
        "date": "created_at DESC",
        "rating": "rating DESC",
        "author": "author COLLATE NOCASE",
        "status": "status",
    }.get(sort, "title COLLATE NOCASE")

    rows = conn.execute(f"SELECT * FROM novels ORDER BY {sort_column}").fetchall()
    return [dict(row) for row in rows]


def delete_novel(conn: sqlite3.Connection, novel_id: str) -> bool:
    """Delete a novel and its chapters (via ON DELETE CASCADE).

    Returns True if a row was deleted.
    """
    cursor = conn.execute("DELETE FROM novels WHERE id = ?", (novel_id,))
    return cursor.rowcount > 0


# ---------------------------------------------------------------------------
# CRUD — chapters
# ---------------------------------------------------------------------------


def insert_chapter(conn: sqlite3.Connection, chapter: ChapterModel) -> str:
    """Insert a single chapter row. Returns the chapter ID."""
    conn.execute(
        """
        INSERT INTO chapters (id, novel_id, number, title, content,
                              created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            chapter.id,
            chapter.novel_id,
            chapter.number,
            chapter.title,
            chapter.content,
            chapter.created_at,
            chapter.updated_at,
        ),
    )
    return chapter.id


def insert_chapters_batch(conn: sqlite3.Connection, chapters: list[ChapterModel]) -> list[str]:
    """Insert multiple chapters in a single transaction.

    Returns a list of inserted chapter IDs.
    """
    ids: list[str] = []
    data: list[tuple] = []
    for ch in chapters:
        ids.append(ch.id)
        data.append(
            (
                ch.id,
                ch.novel_id,
                ch.number,
                ch.title,
                ch.content,
                ch.created_at,
                ch.updated_at,
            )
        )

    conn.executemany(
        """
        INSERT INTO chapters (id, novel_id, number, title, content,
                              created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        data,
    )
    return ids


def get_chapters_by_novel(conn: sqlite3.Connection, novel_id: str) -> list[dict]:
    """Return all chapters for a given novel, ordered by number."""
    rows = conn.execute(
        "SELECT * FROM chapters WHERE novel_id = ? ORDER BY number ASC",
        (novel_id,),
    ).fetchall()
    return [dict(row) for row in rows]
