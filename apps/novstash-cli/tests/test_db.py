"""Tests for the SQLite database layer.

Uses an in-memory SQLite database to avoid touching the real local.db.
"""

import os
import sqlite3
from pathlib import Path

import pytest

from novstash_cli.db import (
    CREATE_CHAPTERS_TABLE,
    CREATE_NOVELS_TABLE,
    delete_novel,
    get_chapters_by_novel,
    get_connection,
    get_novel_by_id,
    get_novel_by_source_url,
    get_novel_by_title,
    init_db,
    insert_chapter,
    insert_chapters_batch,
    insert_novel,
    list_novels,
)
from novstash_cli.models import ChapterModel, NovelModel
from novstash_cli.utils import generate_id, now_iso


@pytest.fixture
def conn(tmp_path: Path) -> sqlite3.Connection:
    """Create an in-memory SQLite connection with the schema applied."""
    # Use a temp file so WAL pragma works
    db_file = tmp_path / "test.db"
    c = sqlite3.connect(str(db_file))
    c.row_factory = sqlite3.Row
    c.execute("PRAGMA journal_mode=WAL;")
    c.execute("PRAGMA foreign_keys=ON;")
    init_db(c)
    yield c
    c.close()


# ---------------------------------------------------------------------------
# Schema tests
# ---------------------------------------------------------------------------


def test_init_db_creates_tables(conn: sqlite3.Connection) -> None:
    """Verify that init_db creates both tables."""
    tables = conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    ).fetchall()
    table_names = [row["name"] for row in tables]
    assert "novels" in table_names
    assert "chapters" in table_names


def test_init_db_is_idempotent(conn: sqlite3.Connection) -> None:
    """Calling init_db twice should not raise."""
    init_db(conn)  # second call
    tables = conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    ).fetchall()
    assert len(tables) >= 2


# ---------------------------------------------------------------------------
# Novel CRUD tests
# ---------------------------------------------------------------------------


def _make_novel(**overrides: str | float | int | None) -> NovelModel:
    defaults: dict[str, str | float | int | None] = {
        "id": generate_id(),
        "title": "Test Novel",
        "author": "Test Author",
        "cover_url": "https://example.com/cover.jpg",
        "synopsis": "A test novel synopsis.",
        "status": "ongoing",
        "source": "royalroad",
        "source_url": "https://royalroad.com/fiction/12345",
        "genres": "Fantasy, Adventure",
        "rating": 4.5,
        "chapter_count": 10,
        "created_at": now_iso(),
        "updated_at": now_iso(),
    }
    defaults.update(overrides)
    return NovelModel(**defaults)  # type: ignore[arg-type]


def test_insert_novel(conn: sqlite3.Connection) -> None:
    novel = _make_novel()
    novel_id = insert_novel(conn, novel)
    conn.commit()

    assert novel_id == novel.id


def test_get_novel_by_source_url_found(conn: sqlite3.Connection) -> None:
    novel = _make_novel()
    insert_novel(conn, novel)
    conn.commit()

    result = get_novel_by_source_url(conn, novel.source_url)
    assert result is not None
    assert result["title"] == novel.title


def test_get_novel_by_source_url_not_found(conn: sqlite3.Connection) -> None:
    result = get_novel_by_source_url(conn, "https://example.com/nonexistent")
    assert result is None


def test_get_novel_by_id_found(conn: sqlite3.Connection) -> None:
    novel = _make_novel()
    insert_novel(conn, novel)
    conn.commit()

    result = get_novel_by_id(conn, novel.id)
    assert result is not None
    assert result["title"] == novel.title


def test_get_novel_by_id_not_found(conn: sqlite3.Connection) -> None:
    result = get_novel_by_id(conn, "nonexistent-id")
    assert result is None


def test_get_novel_by_title_found(conn: sqlite3.Connection) -> None:
    novel = _make_novel(title="The Great Adventure")
    insert_novel(conn, novel)
    conn.commit()

    result = get_novel_by_title(conn, "great")
    assert result is not None
    assert result["title"] == "The Great Adventure"


def test_get_novel_by_title_not_found(conn: sqlite3.Connection) -> None:
    result = get_novel_by_title(conn, "nonexistent")
    assert result is None


def test_list_novels_empty(conn: sqlite3.Connection) -> None:
    novels = list_novels(conn)
    assert novels == []


def test_list_novels_returns_all(conn: sqlite3.Connection) -> None:
    novel1 = _make_novel(title="Alpha", source_url="https://a.com/1")
    novel2 = _make_novel(title="Beta", source_url="https://b.com/2")
    insert_novel(conn, novel1)
    insert_novel(conn, novel2)
    conn.commit()

    novels = list_novels(conn)
    assert len(novels) == 2


def test_list_novels_sorted_by_title(conn: sqlite3.Connection) -> None:
    novel_b = _make_novel(title="Beta", source_url="https://b.com/1")
    novel_a = _make_novel(title="Alpha", source_url="https://a.com/1")
    insert_novel(conn, novel_b)
    insert_novel(conn, novel_a)
    conn.commit()

    novels = list_novels(conn, sort="title")
    assert novels[0]["title"] == "Alpha"
    assert novels[1]["title"] == "Beta"


def test_delete_novel(conn: sqlite3.Connection) -> None:
    novel = _make_novel()
    insert_novel(conn, novel)
    conn.commit()

    deleted = delete_novel(conn, novel.id)
    conn.commit()
    assert deleted is True

    result = get_novel_by_id(conn, novel.id)
    assert result is None


# ---------------------------------------------------------------------------
# Chapter CRUD tests
# ---------------------------------------------------------------------------


def _make_chapter(
    novel_id: str, number: int = 1, **overrides: str | int | None
) -> ChapterModel:
    defaults: dict[str, str | int | None] = {
        "id": generate_id(),
        "novel_id": novel_id,
        "number": number,
        "title": f"Chapter {number}",
        "content": f"<p>Content of chapter {number}.</p>",
        "created_at": now_iso(),
        "updated_at": now_iso(),
    }
    defaults.update(overrides)
    return ChapterModel(**defaults)  # type: ignore[arg-type]


def test_insert_chapter(conn: sqlite3.Connection) -> None:
    novel = _make_novel()
    insert_novel(conn, novel)
    conn.commit()

    chapter = _make_chapter(novel_id=novel.id)
    chapter_id = insert_chapter(conn, chapter)
    conn.commit()

    assert chapter_id == chapter.id


def test_insert_chapters_batch(conn: sqlite3.Connection) -> None:
    novel = _make_novel()
    insert_novel(conn, novel)
    conn.commit()

    chapters = [
        _make_chapter(novel_id=novel.id, number=1, title="Ch1"),
        _make_chapter(novel_id=novel.id, number=2, title="Ch2"),
        _make_chapter(novel_id=novel.id, number=3, title="Ch3"),
    ]
    ids = insert_chapters_batch(conn, chapters)
    conn.commit()

    assert len(ids) == 3

    stored = get_chapters_by_novel(conn, novel.id)
    assert len(stored) == 3
    assert stored[0]["number"] == 1
    assert stored[2]["number"] == 3


def test_get_chapters_by_novel_empty(conn: sqlite3.Connection) -> None:
    chapters = get_chapters_by_novel(conn, "nonexistent")
    assert chapters == []


def test_chapters_cascade_on_delete(conn: sqlite3.Connection) -> None:
    """When a novel is deleted, its chapters should cascade delete."""
    novel = _make_novel()
    insert_novel(conn, novel)
    conn.commit()

    chapter = _make_chapter(novel_id=novel.id)
    insert_chapter(conn, chapter)
    conn.commit()

    # Verify chapter exists
    stored = get_chapters_by_novel(conn, novel.id)
    assert len(stored) == 1

    # Delete the novel
    delete_novel(conn, novel.id)
    conn.commit()

    # Chapters should be gone
    stored_after = get_chapters_by_novel(conn, novel.id)
    assert stored_after == []


def test_foreign_key_violation(conn: sqlite3.Connection) -> None:
    """Inserting a chapter with a non-existent novel_id should fail."""
    chapter = _make_chapter(novel_id="nonexistent")
    with pytest.raises(sqlite3.IntegrityError):
        insert_chapter(conn, chapter)
        conn.commit()
