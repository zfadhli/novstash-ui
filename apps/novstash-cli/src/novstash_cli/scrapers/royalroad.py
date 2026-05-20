"""RoyalRoad.com web novel scraper.

Uses ``httpx.AsyncClient`` for HTTP requests and ``BeautifulSoup`` for
HTML parsing.
"""

import logging
import re

import httpx
from bs4 import BeautifulSoup

from novstash_cli.models import ScrapedChapter, ScrapedNovel
from novstash_cli.scrapers import BaseScraper
from novstash_cli.utils import sanitize_html

logger = logging.getLogger(__name__)

# Default headers to mimic a real browser
DEFAULT_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

CHAPTER_CONTENT_SELECTORS = [
    "div.chapter-inner",
    "div.chapter-content",
    "div.entry-content",
    "div.description",
    "div#chapter-content",
    "div.content",
]

# Pattern to extract fiction ID from RR URLs
FICTION_ID_PATTERN = re.compile(r"/fiction/(\d+)")


class RoyalRoadScraper(BaseScraper):
    """Scraper for royalroad.com."""

    source = "royalroad"

    async def scrape_novel(self, url: str) -> ScrapedNovel:
        """Scrape a RoyalRoad novel page and all its chapters."""
        url = url.rstrip("/")

        async with httpx.AsyncClient(
            headers=DEFAULT_HEADERS,
            timeout=httpx.Timeout(30.0, connect=15.0, read=30.0),
            follow_redirects=True,
        ) as client:
            logger.info("Fetching novel page: %s", url)
            response = await client.get(url)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "lxml")

            # --- Extract novel metadata ---
            title = self._extract_title(soup)
            author = self._extract_author(soup)
            cover_url = self._extract_cover_url(soup)
            synopsis = self._extract_synopsis(soup)
            status = self._extract_status(soup)
            genres = self._extract_genres(soup)
            rating = self._extract_rating(soup)

            logger.info("Novel: %s | Author: %s", title, author)

            # --- Extract chapter links ---
            chapter_links = self._extract_chapter_links(soup, url)
            logger.info("Found %d chapter links", len(chapter_links))

            # --- Scrape each chapter ---
            chapters: list[ScrapedChapter] = []
            for i, (chapter_url, chapter_title) in enumerate(chapter_links, start=1):
                logger.debug(
                    "Fetching chapter %d/%d: %s",
                    i,
                    len(chapter_links),
                    chapter_url,
                )
                chapter_response = await client.get(chapter_url)
                chapter_response.raise_for_status()
                chapter_soup = BeautifulSoup(chapter_response.text, "lxml")

                content = self._extract_chapter_content(chapter_soup)
                content = sanitize_html(content)

                chapters.append(
                    ScrapedChapter(
                        number=i,
                        title=chapter_title,
                        content=content,
                    )
                )

            return ScrapedNovel(
                title=title,
                author=author,
                cover_url=cover_url,
                synopsis=synopsis,
                status=status,
                source=self.source,
                source_url=url,
                genres=genres,
                rating=rating,
                chapters=chapters,
            )

    # ------------------------------------------------------------------
    # Extraction helpers
    # ------------------------------------------------------------------

    def _extract_title(self, soup: BeautifulSoup) -> str:
        """Extract the novel title."""
        # Try h1 with fic-title class first
        h1 = soup.select_one("h1.fic-title")
        if h1:
            return h1.get_text(strip=True)

        # Fallback: any h1 on the page
        h1 = soup.select_one("h1")
        if h1:
            return h1.get_text(strip=True)

        # Last resort: og:title meta tag
        og = soup.select_one('meta[property="og:title"]')
        if og and og.get("content"):
            return str(og["content"]).strip()

        return "Unknown Title"

    def _extract_author(self, soup: BeautifulSoup) -> str | None:
        """Extract the author name."""
        # Try author link
        author_el = soup.select_one("span.author a, a.author-name")
        if author_el:
            return author_el.get_text(strip=True)

        # Try profile link
        profile = soup.select_one('a[href*="/profile/"]')
        if profile:
            return profile.get_text(strip=True)

        return None

    def _extract_cover_url(self, soup: BeautifulSoup) -> str | None:
        """Extract the cover image URL."""
        # Try og:image
        og = soup.select_one('meta[property="og:image"]')
        if og and og.get("content"):
            return str(og["content"])

        # Try the cover image on the page
        img = soup.select_one("div.fic-header img.img-fluid, img.cover-image")
        if img and img.get("src"):
            src = str(img["src"])
            if src.startswith("//"):
                src = "https:" + src
            elif src.startswith("/"):
                src = "https://www.royalroad.com" + src
            return src

        return None

    def _extract_synopsis(self, soup: BeautifulSoup) -> str | None:
        """Extract the novel synopsis/description."""
        # Try description div
        desc = soup.select_one("div.description, div.synopsis")
        if desc:
            text = desc.get_text("\n", strip=True)
            return text if text else None

        # Try meta description
        meta = soup.select_one('meta[name="description"]')
        if meta and meta.get("content"):
            return str(meta["content"]).strip()

        return None

    def _extract_status(self, soup: BeautifulSoup) -> str | None:
        """Extract the novel's status (ongoing/completed/hiatus)."""
        # Look for status badge or text
        status_el = soup.select_one("span.label.status, span.badge-status, div.status span")
        if status_el:
            text = status_el.get_text(strip=True).lower()
            if "ongoing" in text:
                return "ongoing"
            if "completed" in text:
                return "completed"
            if "hiatus" in text:
                return "hiatus"
            return text

        # Try stats list
        for item in soup.select("li, span"):
            text = item.get_text(strip=True).lower()
            if text in ("ongoing", "completed", "hiatus"):
                return text

        return None

    def _extract_genres(self, soup: BeautifulSoup) -> str | None:
        """Extract genre tags as a comma-separated string."""
        genres: list[str] = []

        # Try genre tags in a tags div
        for tag in soup.select("span.tags a, div.tags a"):
            text = tag.get_text(strip=True)
            if text:
                genres.append(text)

        if genres:
            return ", ".join(genres)

        return None

    def _extract_rating(self, soup: BeautifulSoup) -> float | None:
        """Extract the numeric rating."""
        rating_el = soup.select_one("meta[itemprop=ratingValue], span.rate-avg, div.rating-value")
        if rating_el:
            content = rating_el.get("content") or rating_el.get_text(strip=True)
            if content:
                try:
                    return float(content)
                except ValueError:
                    pass

        # Try star rating
        star = soup.select_one("div.star-rating")
        if star:
            match = re.search(r"([\d.]+)", star.get("style", ""))
            if match:
                try:
                    # style like "width: 85%" -> 4.25
                    pct = float(match.group(1))
                    return round(pct / 20, 2)
                except ValueError:
                    pass

        return None

    def _extract_chapter_links(
        self, soup: BeautifulSoup, base_url: str
    ) -> list[tuple[str, str | None]]:
        """Extract (url, title) pairs for all chapters.

        RoyalRoad has a chapter listing table with ``<tr>`` rows. Each row
        contains a link to the chapter page.
        """
        links: list[tuple[str, str | None]] = []

        # Try the chapter table
        table = soup.select_one("table#chapters, table.chapter-table")
        if table:
            for row in table.select("tbody tr"):
                link_tag = row.select_one("a")
                if link_tag and link_tag.get("href"):
                    href = str(link_tag["href"])
                    if href.startswith("//"):
                        href = "https:" + href
                    elif href.startswith("/"):
                        href = "https://www.royalroad.com" + href
                    elif not href.startswith("http"):
                        href = f"{base_url.rstrip('/')}/{href.lstrip('/')}"
                    title = link_tag.get_text(strip=True) or None
                    links.append((href, title))

        # Fallback: look for any links containing "/chapter/"
        if not links:
            for a_tag in soup.select("a[href*='/chapter/']"):
                href = str(a_tag["href"])
                if href.startswith("//"):
                    href = "https:" + href
                elif href.startswith("/"):
                    href = "https://www.royalroad.com" + href
                elif not href.startswith("http"):
                    href = f"https://www.royalroad.com{href}"
                title = a_tag.get_text(strip=True) or None
                links.append((href, title))

        # Deduplicate by URL while preserving order
        seen: set[str] = set()
        unique_links: list[tuple[str, str | None]] = []
        for href, title in links:
            if href not in seen:
                seen.add(href)
                unique_links.append((href, title))

        return unique_links

    def _extract_chapter_content(self, soup: BeautifulSoup) -> str:
        """Extract the chapter body HTML from a chapter page."""
        for selector in CHAPTER_CONTENT_SELECTORS:
            content_div = soup.select_one(selector)
            if content_div is not None:
                return str(content_div)

        # Fallback: try the <article> tag
        article = soup.select_one("article")
        if article is not None:
            return str(article)

        # Last resort: return the body text
        body = soup.select_one("body")
        if body is not None:
            return body.get_text("\n", strip=True)

        return ""
