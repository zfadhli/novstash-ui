"""Pydantic v2 models for novstash data."""

from pydantic import BaseModel


class NovelModel(BaseModel):
    """Mirrors the Drizzle novels table schema."""

    id: str
    title: str
    author: str | None = None
    cover_url: str | None = None
    synopsis: str | None = None
    status: str | None = None
    source: str | None = None
    source_url: str | None = None
    genres: str | None = None
    rating: float | None = None
    chapter_count: int | None = None
    created_at: str | None = None
    updated_at: str | None = None


class ChapterModel(BaseModel):
    """Mirrors the Drizzle chapters table schema."""

    id: str
    novel_id: str
    number: int
    title: str | None = None
    content: str
    created_at: str | None = None
    updated_at: str | None = None


class ScrapedChapter(BaseModel):
    """A chapter as scraped from a web novel site, before DB insertion."""

    number: int
    title: str | None = None
    content: str


class ScrapedNovel(BaseModel):
    """A novel as scraped from a web novel site, before DB insertion."""

    title: str
    author: str | None = None
    cover_url: str | None = None
    synopsis: str | None = None
    status: str | None = None
    source: str
    source_url: str
    genres: str | None = None
    rating: float | None = None
    chapters: list[ScrapedChapter] = []
