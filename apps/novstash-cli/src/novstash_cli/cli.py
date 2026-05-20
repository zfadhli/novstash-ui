"""Typer CLI app for novstash-cli.

Provides three commands:

- ``download`` — scrape and store a web novel
- ``list`` — display all stored novels
- ``info`` — show detailed info for a single novel
"""

import asyncio
import logging
import sqlite3
from typing import Annotated

import typer
from rich.console import Console
from rich.logging import RichHandler
from rich.panel import Panel
from rich.progress import (
    BarColumn,
    Progress,
    SpinnerColumn,
    TextColumn,
    TimeRemainingColumn,
)
from rich.table import Table

from novstash_cli import __version__
from novstash_cli.db import (
    get_connection,
    get_novel_by_id,
    get_novel_by_source_url,
    get_novel_by_title,
    init_db,
    insert_chapters_batch,
    insert_novel,
    list_novels,
)
from novstash_cli.models import ChapterModel, NovelModel
from novstash_cli.scrapers import get_scraper
from novstash_cli.utils import detect_source, generate_id, now_iso

# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------

app = typer.Typer(
    name="novstash",
    help="Download and manage web novels in the novstash local database.",
    no_args_is_help=True,
)

console = Console()
err_console = Console(stderr=True)

logging.basicConfig(
    level=logging.WARNING,
    format="%(message)s",
    datefmt="[%X]",
    handlers=[RichHandler(console=err_console, rich_tracebacks=True)],
)

# ---------------------------------------------------------------------------
# Callbacks
# ---------------------------------------------------------------------------


def _version_callback(value: bool) -> None:
    if value:
        console.print(f"novstash-cli v{__version__}")
        raise typer.Exit()


# ---------------------------------------------------------------------------
# Download command
# ---------------------------------------------------------------------------


@app.command()
def download(
    url: str = typer.Argument(..., help="URL of the web novel to download"),
    source: Annotated[
        str | None,
        typer.Option(
            "--source",
            "-s",
            help="Source name (e.g., 'royalroad'). Auto-detected from URL if omitted.",
        ),
    ] = None,
    db_path: Annotated[
        str | None,
        typer.Option(
            "--db-path",
            help="Override path to local.db.",
        ),
    ] = None,
) -> None:
    """Download a web novel and store it in the local database.

    Scrapes the novel metadata and all chapters from the given URL,
    then writes everything to ``local.db``.
    """
    # Resolve source
    source_name = source or detect_source(url)
    console.print(f"[bold]Source:[/] {source_name}")
    console.print(f"[bold]URL:[/] {url}")

    # DB connection
    conn = get_connection()
    if db_path:
        conn.close()
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA foreign_keys=ON;")

    init_db(conn)

    # Check if already downloaded
    existing = get_novel_by_source_url(conn, url)
    if existing:
        console.print(
            f"[yellow]Already downloaded:[/] '{existing['title']}' (ID: {existing['id']})"
        )
        conn.close()
        raise typer.Exit(code=0)

    # Get scraper and download
    scraper = get_scraper(source_name)

    try:
        scraped = asyncio.run(scraper.scrape_novel(url))
    except Exception as exc:
        err_console.print(f"[red]Error scraping novel:[/] {exc}")
        raise typer.Exit(code=1) from exc

    chapter_count = len(scraped.chapters)
    console.print(f"[green]Scraped[/] '{scraped.title}' — {chapter_count} chapters")

    # Generate IDs and timestamps
    now = now_iso()
    novel_id = generate_id()

    novel_model = NovelModel(
        id=novel_id,
        title=scraped.title,
        author=scraped.author,
        cover_url=scraped.cover_url,
        synopsis=scraped.synopsis,
        status=scraped.status,
        source=scraped.source,
        source_url=scraped.source_url,
        genres=scraped.genres,
        rating=scraped.rating,
        chapter_count=chapter_count,
        created_at=now,
        updated_at=now,
    )

    # Generate chapter models
    chapter_models = [
        ChapterModel(
            id=generate_id(),
            novel_id=novel_id,
            number=ch.number,
            title=ch.title,
            content=ch.content,
            created_at=now,
            updated_at=now,
        )
        for ch in scraped.chapters
    ]

    # Insert with progress
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
        TimeRemainingColumn(),
        console=console,
        transient=False,
    ) as progress:
        task = progress.add_task("[cyan]Saving to database...", total=chapter_count + 1)

        try:
            insert_novel(conn, novel_model)
            progress.advance(task)

            # Batch insert chapters in chunks of 50 for progress reporting
            chunk_size = 50
            for i in range(0, len(chapter_models), chunk_size):
                batch = chapter_models[i : i + chunk_size]
                insert_chapters_batch(conn, batch)
                progress.update(task, advance=len(batch))

            conn.commit()
        except Exception as exc:
            conn.rollback()
            err_console.print(f"[red]Error saving to database:[/] {exc}")
            raise typer.Exit(code=1) from exc

    console.print(
        f"\n[green]✓[/] Downloaded '[bold]{scraped.title}[/]' — "
        f"{chapter_count} chapter{'s' if chapter_count != 1 else ''}"
    )
    conn.close()


# ---------------------------------------------------------------------------
# List command
# ---------------------------------------------------------------------------


@app.command(name="list")
def list_cmd(
    sort: str = typer.Option(
        "title",
        "--sort",
        help="Sort field: title, date, rating, author, status",
    ),
    db_path: Annotated[
        str | None,
        typer.Option("--db-path", help="Override path to local.db."),
    ] = None,
) -> None:
    """List all downloaded novels."""
    conn = get_connection()
    init_db(conn)

    novels = list_novels(conn, sort=sort)

    if not novels:
        console.print(
            "[yellow]No novels in database.[/] Use [bold]novstash download <url>[/] to add one."
        )
        conn.close()
        raise typer.Exit(code=0)

    table = Table(
        title="Novels",
        title_style="bold",
        border_style="blue",
        header_style="bold cyan",
    )
    table.add_column("ID", style="dim", no_wrap=True)
    table.add_column("Title", style="bold")
    table.add_column("Author")
    table.add_column("Chapters", justify="right")
    table.add_column("Rating", justify="center")
    table.add_column("Status")

    for novel in novels:
        rating_str = f"{novel['rating']:.2f}" if novel["rating"] is not None else "—"
        status_str = novel["status"] or "—"
        status_str = status_str.capitalize() if status_str != "—" else status_str
        table.add_row(
            novel["id"][:8] + "…",
            novel["title"],
            novel["author"] or "—",
            str(novel["chapter_count"] or "—"),
            rating_str,
            status_str,
        )

    console.print(table)
    conn.close()


# ---------------------------------------------------------------------------
# Info command
# ---------------------------------------------------------------------------


@app.command()
def info(
    query: str = typer.Argument(
        ...,
        help="Novel ID or title substring to look up",
    ),
    db_path: Annotated[
        str | None,
        typer.Option("--db-path", help="Override path to local.db."),
    ] = None,
) -> None:
    """Show detailed information about a novel."""
    conn = get_connection()
    init_db(conn)

    # Try ID lookup first, then title substring
    novel = get_novel_by_id(conn, query)
    if novel is None:
        novel = get_novel_by_title(conn, query)

    if novel is None:
        console.print(f"[yellow]No novel found matching[/] '[bold]{query}[/]'.")
        conn.close()
        raise typer.Exit(code=1)

    # Build a nice info panel
    info_lines: list[str] = [
        f"[bold]ID:[/] {novel['id']}",
        f"[bold]Title:[/] {novel['title']}",
        f"[bold]Author:[/] {novel['author'] or '—'}",
        f"[bold]Status:[/] {novel['status'] or '—'}",
        f"[bold]Source:[/] {novel['source'] or '—'}",
        f"[bold]Source URL:[/] {novel['source_url'] or '—'}",
        f"[bold]Rating:[/] {f'{novel["rating"]:.2f}' if novel['rating'] is not None else '—'}",
        f"[bold]Chapters:[/] {novel['chapter_count'] or '—'}",
        f"[bold]Genres:[/] {novel['genres'] or '—'}",
        f"[bold]Cover:[/] {novel['cover_url'] or '—'}",
        "",
        "[bold]Synopsis:",
        f"{novel['synopsis'] or '—'}",
        "",
        f"[dim]Created: {novel['created_at'] or '—'}[/]",
        f"[dim]Updated: {novel['updated_at'] or '—'}[/]",
    ]

    panel = Panel(
        "\n".join(info_lines),
        title=f"[bold cyan]{novel['title']}[/]",
        border_style="green",
        padding=(1, 2),
    )

    console.print(panel)
    conn.close()


# ---------------------------------------------------------------------------
# Version callback
# ---------------------------------------------------------------------------


@app.callback()
def main(
    version: Annotated[
        bool | None,
        typer.Option(
            "--version",
            "-v",
            help="Show version and exit.",
            callback=_version_callback,
            is_eager=True,
        ),
    ] = None,
) -> None:
    """novstash-cli — download and manage web novels."""
    pass
