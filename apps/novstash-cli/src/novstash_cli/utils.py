"""Helper utilities for novstash-cli."""

import re
import uuid
from datetime import UTC, datetime
from urllib.parse import urlparse


def generate_id() -> str:
    """Generate a 32-character hex string ID (uuid4 hex)."""
    return uuid.uuid4().hex


def now_iso() -> str:
    """Return current UTC timestamp as ISO 8601 string."""
    return datetime.now(UTC).isoformat()


def detect_source(url: str) -> str:
    """Detect source name from a novel URL.

    Examples:
        https://www.royalroad.com/fiction/12345 -> "royalroad"
        https://www.scribblehub.com/series/12345 -> "scribblehub"
        https://www.novelupdates.com/series/abc -> "novelupdates"
    """
    parsed = urlparse(url)
    domain = parsed.netloc.lower()

    # Remove www. prefix
    domain = domain.removeprefix("www.")

    # Match known domains to source names
    source_map: dict[str, str] = {
        "royalroad.com": "royalroad",
        "royalroadl.com": "royalroad",
        "scribblehub.com": "scribblehub",
        "novelupdates.com": "novelupdates",
        "wuxiaworld.com": "wuxiaworld",
        "lightnovelworld.com": "lightnovelworld",
        "lightnovelpub.com": "lightnovelpub",
        "novelbin.com": "novelbin",
        "novelhall.com": "novelhall",
    }

    # Exact match
    if domain in source_map:
        return source_map[domain]

    # Check subdomains of known domains
    for known_domain, source_name in source_map.items():
        if domain.endswith(f".{known_domain}"):
            return source_name

    # Fallback: extract the main domain name
    parts = domain.split(".")
    if len(parts) >= 2:
        return parts[-2]

    return domain


def sanitize_html(html: str) -> str:
    """Basic cleaning of scraped HTML content.

    Removes excessive whitespace, empty paragraphs, and normalizes
    line breaks.
    """
    if not html:
        return ""

    # Remove zero-width characters
    html = re.sub(r"[\u200b\u200c\u200d\ufeff]", "", html)

    # Collapse multiple whitespace (but preserve block-level spacing)
    html = re.sub(r"[ \t]+", " ", html)

    # Remove empty <p> tags (with optional whitespace)
    html = re.sub(r"<p>\s*</p>", "", html)

    # Remove <br> tags followed by whitespace (normalize breaks)
    html = re.sub(r"<br\s*/?>\s*", "\n", html)

    # Trim leading/trailing whitespace per line
    lines = [line.strip() for line in html.split("\n")]
    lines = [line for line in lines if line]

    return "\n\n".join(lines)
