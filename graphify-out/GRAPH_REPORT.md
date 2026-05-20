# Graph Report - novstash-ui  (2026-05-20)

## Corpus Check
- 46 files · ~8,189 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 413 nodes · 458 edges · 45 communities (34 shown, 11 thin omitted)
- Extraction: 86% EXTRACTED · 14% INFERRED · 0% AMBIGUOUS · INFERRED: 62 edges (avg confidence: 0.78)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1261368f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 33|Community 33]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 18 edges
2. `RoyalRoadScraper` - 16 edges
3. `scripts` - 14 edges
4. `_make_novel()` - 14 edges
5. `insert_novel()` - 13 edges
6. `download()` - 13 edges
7. `tasks` - 11 edges
8. `style` - 11 edges
9. `_make_chapter()` - 8 edges
10. `test_chapters_cascade_on_delete()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `download()` --calls--> `get_connection()`  [INFERRED]
  apps/novstash-cli/src/novstash_cli/cli.py → apps/novstash-cli/src/novstash_cli/db.py
- `download()` --calls--> `init_db()`  [INFERRED]
  apps/novstash-cli/src/novstash_cli/cli.py → apps/novstash-cli/src/novstash_cli/db.py
- `test_get_novel_by_source_url_not_found()` --calls--> `get_novel_by_source_url()`  [INFERRED]
  apps/novstash-cli/tests/test_db.py → apps/novstash-cli/src/novstash_cli/db.py
- `info()` --calls--> `get_novel_by_id()`  [INFERRED]
  apps/novstash-cli/src/novstash_cli/cli.py → apps/novstash-cli/src/novstash_cli/db.py
- `test_get_novel_by_id_not_found()` --calls--> `get_novel_by_id()`  [INFERRED]
  apps/novstash-cli/tests/test_db.py → apps/novstash-cli/src/novstash_cli/db.py

## Communities (45 total, 11 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (51): download(), Download a web novel and store it in the local database.      Scrapes the novel, delete_novel(), get_chapters_by_novel(), get_novel_by_id(), get_novel_by_source_url(), get_novel_by_title(), insert_chapter() (+43 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (26): BaseModel, BaseScraper, ChapterModel, NovelModel, Pydantic v2 models for novstash data., Mirrors the Drizzle chapters table schema., A chapter as scraped from a web novel site, before DB insertion., A novel as scraped from a web novel site, before DB insertion. (+18 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (29): dependsOn, inputs, outputs, dependsOn, cache, cache, cache, persistent (+21 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (23): dependencies, dotenv, libsql, @libsql/client, @novstash-ui/db, @novstash-ui/env, nuxt, @nuxt/ui (+15 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (23): dotenv, libsql, @libsql/client, @types/node, typescript, zod, dependencies, dotenv (+15 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (22): source, assist, actions, css, parser, files, ignoreUnknown, includes (+14 more)

### Community 6 - "Community 6"
Cohesion: 0.09
Nodes (23): useExhaustiveDependencies, linter, enabled, rules, useSortedClasses, functions, correctness, nursery (+15 more)

### Community 7 - "Community 7"
Cohesion: 0.09
Nodes (21): default, dependencies, dotenv, drizzle-orm, libsql, @libsql/client, @novstash-ui/env, zod (+13 more)

### Community 8 - "Community 8"
Cohesion: 0.09
Nodes (21): Architecture, code:bash (cd apps/novstash-cli), code:bash (cd apps/novstash-cli), code:bash (novstash download <novel-url>), code:bash (novstash list), code:bash (novstash info <novel-id-or-title>), code:bash (python -m novstash_cli download <url>), code:bash (# Install dependencies) (+13 more)

### Community 9 - "Community 9"
Cohesion: 0.10
Nodes (19): info(), list_cmd(), main(), Typer CLI app for novstash-cli.  Provides three commands:  - ``download`` — scra, List all downloaded novels., Show detailed information about a novel., novstash-cli — download and manage web novels., get_connection() (+11 more)

### Community 10 - "Community 10"
Cohesion: 0.10
Nodes (19): compilerOptions, allowSyntheticDefaultImports, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules, lib, module, moduleResolution (+11 more)

### Community 11 - "Community 11"
Cohesion: 0.14
Nodes (14): scripts, build, check, check-types, cli:format, cli:lint, cli:test, db:generate (+6 more)

### Community 12 - "Community 12"
Cohesion: 0.15
Nodes (12): Available Scripts, code:bash (bun install), code:bash (bun run db:local), code:bash (bun run db:push), code:bash (bun run dev), code:block5 (novstash-ui/), Database Setup, Features (+4 more)

### Community 13 - "Community 13"
Cohesion: 0.25
Nodes (7): compilerOptions, composite, declaration, declarationMap, outDir, sourceMap, extends

### Community 14 - "Community 14"
Cohesion: 0.29
Nodes (6): ABC, BaseScraper, get_scraper(), Scraper base classes and registry., Return a scraper instance for the given source name.      Raises:         ValueE, Abstract base class for web novel scrapers.      Each subclass must set ``source

### Community 15 - "Community 15"
Cohesion: 0.33
Nodes (4): defaults, ReaderFont, ReaderSettings, ReaderTheme

### Community 16 - "Community 16"
Cohesion: 0.33
Nodes (5): Chapter, ChapterNavigation, ChapterWithNav, Novel, PaginatedResponse

### Community 17 - "Community 17"
Cohesion: 0.33
Nodes (3): chapters, novels, db

### Community 18 - "Community 18"
Cohesion: 0.40
Nodes (4): { id }, limit, page, query

### Community 19 - "Community 19"
Cohesion: 0.50
Nodes (3): limit, page, query

### Community 20 - "Community 20"
Cohesion: 0.50
Nodes (3): name, private, version

## Knowledge Gaps
- **188 isolated node(s):** `name`, `private`, `packages`, `dotenv`, `zod` (+183 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `download()` connect `Community 0` to `Community 9`, `Community 14`, `Community 1`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `RoyalRoadScraper` connect `Community 1` to `Community 14`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `NovelModel` connect `Community 1` to `Community 0`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `RoyalRoadScraper` (e.g. with `ScrapedChapter` and `ScrapedNovel`) actually correct?**
  _`RoyalRoadScraper` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `_make_novel()` (e.g. with `generate_id()` and `now_iso()`) actually correct?**
  _`_make_novel()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 11 inferred relationships involving `insert_novel()` (e.g. with `download()` and `test_insert_novel()`) actually correct?**
  _`insert_novel()` has 11 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `private`, `packages` to the rest of the system?**
  _242 weakly-connected nodes found - possible documentation gaps or missing edges._