"""Scraper base classes and registry."""

from abc import ABC, abstractmethod

from novstash_cli.models import ScrapedNovel


class BaseScraper(ABC):
    """Abstract base class for web novel scrapers.

    Each subclass must set ``source`` to a unique identifier (e.g.
    ``"royalroad"``) and implement :meth:`scrape_novel`.
    """

    source: str = ""

    @abstractmethod
    async def scrape_novel(self, url: str) -> ScrapedNovel:
        """Scrape a novel and all its chapters from the given URL.

        Args:
            url: The full URL to the novel's main page.

        Returns:
            A :class:`ScrapedNovel` with all chapter data populated.
        """
        ...


def get_scraper(source: str) -> BaseScraper:
    """Return a scraper instance for the given source name.

    Raises:
        ValueError: If no scraper is registered for the source.
    """
    from novstash_cli.scrapers.royalroad import RoyalRoadScraper

    _registry: dict[str, type[BaseScraper]] = {
        "royalroad": RoyalRoadScraper,
    }

    cls = _registry.get(source)
    if cls is None:
        raise ValueError(
            f"Unknown source: {source!r}. Available sources: {', '.join(sorted(_registry))}"
        )
    return cls()
