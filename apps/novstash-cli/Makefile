.PHONY: install lint format clean test

install:
	uv sync

lint:
	uv run ruff check src/

format:
	uv run ruff format src/

test:
	uv run pytest -v

clean:
	rm -rf .venv __pycache__ .ruff_cache .pytest_cache
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name '*.pyc' -delete
