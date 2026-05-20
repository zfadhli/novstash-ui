# novstash-ui

A web novel reading platform — browse, read, and collect your favorite web novels.

Built with **Nuxt 4**, **Drizzle ORM**, **SQLite/Turso**, and a **Python CLI** for scraping novels.

## Features

### Reading
- **Chapter reader** with markdown rendering (`marked` + DOMPurify), customizable font/size/line-height/theme (sepia, light, dark), keyboard shortcuts, progress bar, and chapter drawer
- **Reading history** — DB-backed, per-user progress tracking via Google OAuth
- **Continue Reading** — automatically resumes from your last position across sessions

### Browse & Discover
- **Home page** with search, Continue Reading section, and paginated novel grid
- **Search page** with genre filters, status pills, and sort options
- **Library page** — shows recently-read novels sorted by last-read date
- **Novel detail pages** with cover, synopsis, metadata, and chapter list

### Auth
- **Google OAuth** via `nuxt-auth-utils` — sign in with Google, avatar dropdown with logout

### CLI
- **novstash-cli** (Python submodule) — scrape novels from supported sites and store in the shared SQLite database

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Nuxt 4 + Nitro server |
| UI | @nuxt/ui v4 (shadcn-vue / Reka UI) |
| Styling | Tailwind CSS v4 |
| Database | SQLite via Turso/libSQL |
| ORM | Drizzle ORM v0.45 |
| Auth | nuxt-auth-utils (Google OAuth) |
| Markdown | marked + isomorphic-dompurify |
| CLI | Python 3.13+ with httpx, selectolax, typer |
| Monorepo | Turborepo + Bun |

## Getting Started

```bash
bun install
```

## Database Setup

```bash
# Push schema to local.db
bun run db:push

# Or generate + run migrations
bun run db:generate
bun run db:migrate

# View database with Datasette
bun run db:view
# Opens http://localhost:8001

# Or use Drizzle Studio
bun run db:studio
```

## Development

```bash
# Start the web app
bun run dev:web
# Opens http://localhost:3001

# Run all apps in dev mode
bun run dev
```

## Environment Variables

Create `apps/web/.env`:

```env
DATABASE_URL=file:../../local.db
CORS_ORIGIN=http://localhost:3001

# Google OAuth (create at https://console.cloud.google.com/apis/credentials)
NUXT_OAUTH_GOOGLE_CLIENT_ID=your-client-id
NUXT_OAUTH_GOOGLE_CLIENT_SECRET=your-client-secret
NUXT_SESSION_PASSWORD=a-secure-random-string-at-least-32-chars-long
```

## CLI (novstash-cli)

The Python CLI lives in `apps/novstash-cli` (git submodule).

```bash
# Scrape a novel
cd apps/novstash-cli
NOVSTASH_DB=../../local.db uv run novstash scrape <novel-url>

# List all novels in the database
NOVSTASH_DB=../../local.db uv run novstash list-novels

# Show novel info
NOVSTASH_DB=../../local.db uv run novstash info <slug>
```

Or use the root scripts:

```bash
bun run cli:download -- <url>
bun run cli:list
```

## Project Structure

```
novstash-ui/
├── apps/
│   ├── web/                    # Nuxt 4 web app
│   │   ├── app/
│   │   │   ├── components/     # Vue components (NovelCard, Pagination, Header, etc.)
│   │   │   ├── composables/    # useNovels, useChapter, useReadingHistory, etc.
│   │   │   ├── pages/          # index, search, library, novels/[id], read/[slug]/[chapterId]
│   │   │   └── types/          # TypeScript interfaces
│   │   └── server/
│   │       ├── api/            # REST endpoints (novels, chapters, reading, genres, search)
│   │       └── routes/         # Auth route (Google OAuth)
│   └── novstash-cli/           # Python CLI (git submodule)
├── packages/
│   └── db/                     # Drizzle schema, migrations, DB client
└── graphify-out/               # Knowledge graph (dev-only, gitignored after initial commit)
```

## Available Scripts

| Script | Description |
|---|---|
| `bun run dev` | Start all apps in dev mode |
| `bun run dev:web` | Start the web app only |
| `bun run build` | Build all apps |
| `bun run db:push` | Push schema changes to database |
| `bun run db:generate` | Generate Drizzle migration files |
| `bun run db:migrate` | Run database migrations |
| `bun run db:studio` | Open Drizzle Kit Studio |
| `bun run db:view` | Open Datasette web UI for the database |
| `bun run db:local` | Start local SQLite dev server |
| `bun run check` | Run Biome linting and formatting |
| `bun run check-types` | Check TypeScript types |
| `bun run cli:download` | Scrape a novel via the CLI |
| `bun run cli:list` | List novels via the CLI |

## Supported Novel Sites

The CLI supports scraping from:
- [freewebnovel.com](https://freewebnovel.com)
- [novelgarden.us](https://novelgarden.us)
- [novellunar.com](https://novellunar.com)

## License

MIT
