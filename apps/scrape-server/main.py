"""FastAPI sidecar for running novel scrapes outside the Nuxt process.

POST /scrape  — scrape a novel URL and return the result
GET  /health  — health check
"""

from __future__ import annotations

import sys
from pathlib import Path

# Add the novstash-cli package to the Python path so we can import from it
CLI_PATH = Path(__file__).resolve().parent.parent / "novstash-cli" / "src"
sys.path.insert(0, str(CLI_PATH))

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from novstash.scraper import scrape_novel

app = FastAPI(title="Novstash Scrape Server", version="0.1.0")


class ScrapeRequest(BaseModel):
    url: str
    db_path: str | None = None
    resume: bool = False


@app.post("/scrape")
async def scrape(req: ScrapeRequest) -> dict:
    """Scrape a novel URL and store in the database."""
    try:
        result = scrape_novel(req.url, db_path=req.db_path, resume=req.resume)
        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error", "Unknown error"))
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}
