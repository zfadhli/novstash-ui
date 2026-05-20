# novstash-cli

A Python 3.13+ CLI tool for downloading and managing web novels into the novstash local database.

## Installation

```bash
cd apps/novstash-cli
uv sync
```

Or install in development mode:

```bash
cd apps/novstash-cli
uv pip install -e .
```

## Usage

### Download a novel

```bash
novstash download <novel-url>

# Or specify the source explicitly:
novstash download <novel-url> --source royalroad
```

### List downloaded novels

```bash
novstash list

# Sort by date added or rating:
novstash list --sort date
novstash list --sort rating
```

### Show novel info

```bash
novstash info <novel-id-or-title>
```

### Run via Python module

```bash
python -m novstash_cli download <url>
```

## Database

The CLI writes to the same `local.db` SQLite database at the monorepo root. The database path is resolved as follows:

1. **Environment variable:** `NOVSTASH_DATABASE_URL=file:/path/to/local.db` (takes priority)
2. **Default relative path:** `../../local.db` from the CLI's installed location, which resolves to the monorepo root

The schema matches the Drizzle ORM schema defined in `packages/db/src/schema/`.

## Development

```bash
# Install dependencies
make install

# Lint
make lint

# Format
make format

# Run tests
uv run pytest

# Clean artifacts
make clean
```

## Architecture

```
apps/novstash-cli/
├── pyproject.toml          # Project config (uv/Python 3.13+)
├── Makefile                # Dev convenience targets
├── README.md               # This file
├── src/
│   └── novstash_cli/
│       ├── __init__.py     # Package init
│       ├── __main__.py     # python -m entry point
│       ├── cli.py          # Typer CLI (download, list, info)
│       ├── db.py           # SQLite access layer
│       ├── models.py       # Pydantic v2 models
│       ├── utils.py        # Helpers (ID gen, source detection, timestamps)
│       └── scrapers/
│           ├── __init__.py # BaseScraper abstract class
│           └── royalroad.py # RoyalRoad scraper implementation
└── tests/
    ├── __init__.py
    └── test_db.py          # DB integration tests
```

## Supported Sources

- **RoyalRoad** (`royalroad.com`) — full support

## Monorepo Integration

This tool lives in the Turborepo workspace at `apps/novstash-cli/`. The `apps/*` glob in `package.json` workspaces will scan this directory, but since it's a Python project, `bun install` will simply skip it (no crash, minor warning).

To run lint from the monorepo root:

```bash
cd apps/novstash-cli && uv run ruff check src/
```
