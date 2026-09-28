#!/usr/bin/env python3
"""Best-effort live check of external links used by the seven canonical pages."""

from __future__ import annotations

import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
PAGES = [
    "index.html",
    "research/index.html",
    "projects/index.html",
    "projects/flood-resilience/index.html",
    "students-collaborators/index.html",
    "teaching/index.html",
    "contact/index.html",
]


class LinkParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.urls: set[str] = set()

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag != "a":
            return
        href = dict(attrs).get("href") or ""
        if href.startswith(("http://", "https://")):
            self.urls.add(href)


def probe(url: str) -> tuple[str, str, int | None]:
    headers = {"User-Agent": "Mozilla/5.0 (compatible; AlonsoPizarroLinkAudit/1.0)"}
    for method in ("HEAD", "GET"):
        try:
            request = Request(url, headers=headers, method=method)
            with urlopen(request, timeout=20) as response:
                status = response.status
                if 200 <= status < 400:
                    return url, "ok", status
                if status in {401, 403, 405, 429, 999}:
                    return url, "restricted", status
        except HTTPError as exc:
            if exc.code in {401, 403, 405, 429, 999}:
                if method == "HEAD" and exc.code == 405:
                    continue
                return url, "restricted", exc.code
            if method == "HEAD":
                continue
            return url, "broken", exc.code
        except (URLError, TimeoutError, OSError):
            if method == "HEAD":
                continue
            return url, "unverified", None
    return url, "unverified", None


def main() -> int:
    parser = LinkParser()
    for relative in PAGES:
        parser.feed((ROOT / relative).read_text(encoding="utf-8"))

    results: list[tuple[str, str, int | None]] = []
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(probe, url) for url in sorted(parser.urls)]
        for future in as_completed(futures):
            results.append(future.result())

    groups = {"ok": [], "restricted": [], "unverified": [], "broken": []}
    for result in sorted(results):
        groups[result[1]].append(result)
    print(
        f"Checked {len(results)} external URLs: "
        f"{len(groups['ok'])} OK, {len(groups['restricted'])} bot-restricted, "
        f"{len(groups['unverified'])} unverified, {len(groups['broken'])} broken."
    )
    for label in ("broken", "unverified", "restricted"):
        if groups[label]:
            print(f"\n{label.upper()}")
            for url, _, status in groups[label]:
                suffix = f" [{status}]" if status else ""
                print(f"- {url}{suffix}")
    return 1 if groups["broken"] else 0


if __name__ == "__main__":
    sys.exit(main())
