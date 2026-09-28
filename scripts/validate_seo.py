#!/usr/bin/env python3
"""Validate the technical SEO contract for the seven canonical pages."""

from __future__ import annotations

import json
import sys
import threading
import xml.etree.ElementTree as ET
from functools import partial
from html.parser import HTMLParser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit
from urllib.request import urlopen


ROOT = Path(__file__).resolve().parents[1]
ROBOTS = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"

PAGES = {
    "index.html": (
        "https://alonsopizarro.cl/",
        "Alonso Pizarro | Hydrology & Complex Hydrosystems",
        "Academic website of Dr. Alonso Pizarro, Assistant Professor at Universidad del Bío-Bío. Research in hydrology, stochastic processes, hydrological modelling, flood risk and river monitoring.",
        "ProfilePage",
    ),
    "research/index.html": (
        "https://alonsopizarro.cl/research/",
        "Research & Publications | Alonso Pizarro",
        "Publications and research by Dr. Alonso Pizarro in hydrology, stochastic hydrology, rainfall-runoff modelling, bridge scour, flood risk and river monitoring.",
        "CollectionPage",
    ),
    "projects/index.html": (
        "https://alonsopizarro.cl/projects/",
        "Hydrology Research Projects | Alonso Pizarro",
        "Explore research projects led by and involving Dr. Alonso Pizarro in hydrology, flood risk, bridge scour, river monitoring, drought and hydrological modelling.",
        "CollectionPage",
    ),
    "projects/flood-resilience/index.html": (
        "https://alonsopizarro.cl/projects/flood-resilience/",
        "Flood Resilience & Bridge Scour | Alonso Pizarro",
        "FONDECYT Flood Resilience project led by Dr. Alonso Pizarro on bridge scour, flood-induced damage, hydrological modelling and probabilistic risk assessment in Chile.",
        "WebPage",
    ),
    "students-collaborators/index.html": (
        "https://alonsopizarro.cl/students-collaborators/",
        "Students & Research Collaborators | Alonso Pizarro",
        "Students, thesis supervision and national and international research collaborators working with Dr. Alonso Pizarro in hydrology and water-related engineering.",
        "CollectionPage",
    ),
    "teaching/index.html": (
        "https://alonsopizarro.cl/teaching/",
        "Hydrology Teaching & Thesis Supervision | Alonso Pizarro",
        "Hydrology and hydrological modelling courses taught by Dr. Alonso Pizarro at Universidad del Bío-Bío, plus thesis supervision and research training.",
        "WebPage",
    ),
    "contact/index.html": (
        "https://alonsopizarro.cl/contact/",
        "Contact Alonso Pizarro | Research & Thesis Supervision",
        "Contact Dr. Alonso Pizarro at Universidad del Bío-Bío for research collaboration, thesis supervision, academic coordination and speaking invitations.",
        "ContactPage",
    ),
}

REDIRECTS = {
    "research.html": ("https://alonsopizarro.cl/research/", "research/"),
    "investigacion.html": ("https://alonsopizarro.cl/research/", "research/"),
    "projects.html": ("https://alonsopizarro.cl/projects/", "projects/"),
    "proyectos.html": ("https://alonsopizarro.cl/projects/", "projects/"),
    "flood-resilience.html": ("https://alonsopizarro.cl/projects/flood-resilience/", "projects/flood-resilience/"),
    "proyecto.html": ("https://alonsopizarro.cl/projects/flood-resilience/", "projects/flood-resilience/"),
    "students-collaborators.html": ("https://alonsopizarro.cl/students-collaborators/", "students-collaborators/"),
    "colaboradores.html": ("https://alonsopizarro.cl/students-collaborators/", "students-collaborators/"),
    "teaching.html": ("https://alonsopizarro.cl/teaching/", "teaching/"),
    "contact.html": ("https://alonsopizarro.cl/contact/", "contact/"),
    "contacto.html": ("https://alonsopizarro.cl/contact/", "contact/"),
}


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.title = ""
        self.in_title = False
        self.metas: list[dict[str, str]] = []
        self.links: list[dict[str, str]] = []
        self.anchors: list[dict[str, str]] = []
        self.images: list[dict[str, str]] = []
        self.scripts: list[tuple[dict[str, str], str]] = []
        self.in_jsonld = False
        self.jsonld_attrs: dict[str, str] = {}
        self.jsonld_data: list[str] = []
        self.headings: list[int] = []
        self.anchor_stack: list[dict[str, object]] = []
        self.empty_anchors: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        data = {key: value or "" for key, value in attrs}
        if tag == "title":
            self.in_title = True
        elif tag == "meta":
            self.metas.append(data)
        elif tag == "link":
            self.links.append(data)
        elif tag == "img":
            self.images.append(data)
            if self.anchor_stack and data.get("alt", "").strip():
                self.anchor_stack[-1]["content"] = True
        elif tag == "script" and data.get("type") == "application/ld+json":
            self.in_jsonld = True
            self.jsonld_attrs = data
            self.jsonld_data = []
        elif tag in {f"h{number}" for number in range(1, 7)}:
            self.headings.append(int(tag[1]))
        elif tag == "a":
            self.anchors.append(data)
            self.anchor_stack.append(
                {
                    "href": data.get("href", ""),
                    "content": bool(data.get("aria-label", "").strip() or data.get("title", "").strip()),
                }
            )

    def handle_data(self, data: str) -> None:
        if self.in_title:
            self.title += data
        if self.in_jsonld:
            self.jsonld_data.append(data)
        if self.anchor_stack and data.strip():
            self.anchor_stack[-1]["content"] = True

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self.in_title = False
        elif tag == "script" and self.in_jsonld:
            self.scripts.append((self.jsonld_attrs, "".join(self.jsonld_data)))
            self.in_jsonld = False
        elif tag == "a" and self.anchor_stack:
            anchor = self.anchor_stack.pop()
            if not anchor["content"]:
                self.empty_anchors.append(str(anchor["href"]))


def meta_value(page: PageParser, key: str, value: str) -> str | None:
    for meta in page.metas:
        if meta.get(key) == value:
            return meta.get("content")
    return None


def canonical(page: PageParser) -> str | None:
    for link in page.links:
        if link.get("rel") == "canonical":
            return link.get("href")
    return None


def schema_types(node: object) -> set[str]:
    found: set[str] = set()
    if isinstance(node, dict):
        value = node.get("@type")
        if isinstance(value, str):
            found.add(value)
        elif isinstance(value, list):
            found.update(item for item in value if isinstance(item, str))
        for child in node.values():
            found.update(schema_types(child))
    elif isinstance(node, list):
        for child in node:
            found.update(schema_types(child))
    return found


def local_target(page_path: Path, raw_url: str) -> Path | None:
    parsed = urlsplit(raw_url)
    if parsed.scheme in {"mailto", "tel", "javascript", "data"}:
        return None
    if parsed.scheme in {"http", "https"}:
        if parsed.netloc not in {"alonsopizarro.cl", "www.alonsopizarro.cl"}:
            return None
        relative = unquote(parsed.path.lstrip("/"))
        target = ROOT / relative
    elif parsed.netloc:
        return None
    elif parsed.path.startswith("/"):
        target = ROOT / unquote(parsed.path.lstrip("/"))
    else:
        target = page_path.parent / unquote(parsed.path)
    if not parsed.path:
        return None
    if parsed.path.endswith("/"):
        target = target / "index.html"
    return target.resolve()


def validate() -> list[str]:
    errors: list[str] = []
    social_required = [
        ("property", "og:type"),
        ("property", "og:site_name"),
        ("property", "og:title"),
        ("property", "og:description"),
        ("property", "og:url"),
        ("property", "og:image"),
        ("property", "og:image:alt"),
        ("property", "og:locale"),
        ("property", "og:locale:alternate"),
        ("name", "twitter:card"),
        ("name", "twitter:title"),
        ("name", "twitter:description"),
        ("name", "twitter:image"),
        ("name", "twitter:image:alt"),
    ]

    for relative, (expected_url, expected_title, expected_description, expected_type) in PAGES.items():
        path = ROOT / relative
        parser = PageParser()
        parser.feed(path.read_text(encoding="utf-8"))

        checks = {
            "title": parser.title.strip() == expected_title,
            "description": meta_value(parser, "name", "description") == expected_description,
            "canonical": canonical(parser) == expected_url,
            "robots": meta_value(parser, "name", "robots") == ROBOTS,
            "theme-color": meta_value(parser, "name", "theme-color") == "#033066",
            "one h1": parser.headings.count(1) == 1,
        }
        for label, ok in checks.items():
            if not ok:
                errors.append(f"{relative}: invalid {label}")

        if any(level > previous + 1 for previous, level in zip(parser.headings, parser.headings[1:])):
            errors.append(f"{relative}: heading level jump detected")
        for image in parser.images:
            if "alt" not in image:
                errors.append(f"{relative}: image missing alt: {image.get('src', '')}")
        for href in parser.empty_anchors:
            errors.append(f"{relative}: link has no accessible text: {href}")

        for key, value in social_required:
            if meta_value(parser, key, value) is None:
                errors.append(f"{relative}: missing {value}")
        if meta_value(parser, "property", "og:url") != expected_url:
            errors.append(f"{relative}: og:url differs from canonical")
        if meta_value(parser, "name", "twitter:site") is not None:
            errors.append(f"{relative}: twitter:site must be omitted")

        jsonld: list[object] = []
        for _, source in parser.scripts:
            try:
                jsonld.append(json.loads(source))
            except json.JSONDecodeError as exc:
                errors.append(f"{relative}: invalid JSON-LD: {exc}")
        types = schema_types(jsonld)
        if expected_type not in types:
            errors.append(f"{relative}: missing schema type {expected_type}")
        if relative == "index.html":
            for required in {"WebSite", "Person", "ProfilePage"}:
                if required not in types:
                    errors.append(f"{relative}: missing schema type {required}")
        elif "BreadcrumbList" not in types:
            errors.append(f"{relative}: missing BreadcrumbList")
        if relative == "projects/flood-resilience/index.html" and "ResearchProject" not in types:
            errors.append(f"{relative}: missing ResearchProject")

        references = [link.get("href", "") for link in parser.links]
        references += [anchor.get("href", "") for anchor in parser.anchors]
        references += [image.get("src", "") for image in parser.images]
        for raw_url in references:
            if not raw_url or raw_url.startswith("#"):
                continue
            if raw_url.startswith("http://"):
                errors.append(f"{relative}: insecure URL: {raw_url}")
            target = local_target(path, raw_url)
            if target is not None and not target.exists():
                errors.append(f"{relative}: missing local target: {raw_url}")

        social_image = meta_value(parser, "property", "og:image") or ""
        image_target = local_target(path, social_image)
        if image_target is None or not image_target.is_file():
            errors.append(f"{relative}: missing social image: {social_image}")

    for relative, (expected_canonical, expected_target) in REDIRECTS.items():
        source = (ROOT / relative).read_text(encoding="utf-8")
        parser = PageParser()
        parser.feed(source)
        if canonical(parser) != expected_canonical:
            errors.append(f"{relative}: redirect canonical is incorrect")
        if meta_value(parser, "name", "robots") != "noindex, follow":
            errors.append(f"{relative}: redirect must be noindex, follow")
        refresh = meta_value(parser, "http-equiv", "refresh") or ""
        if f"url={expected_target}" not in refresh:
            errors.append(f"{relative}: refresh target is incorrect")
        if "window.location.replace" not in source or f'const cleanTarget = "{expected_target}"' not in source:
            errors.append(f"{relative}: JavaScript redirect target is incorrect")
        if f'const localTarget = "{expected_target}index.html"' not in source:
            errors.append(f"{relative}: local file redirect target is incorrect")

    expected_sitemap = [item[0] for item in PAGES.values()]
    try:
        root = ET.parse(ROOT / "sitemap.xml").getroot()
        namespace = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        sitemap_urls = [node.text or "" for node in root.findall("s:url/s:loc", namespace)]
        if sitemap_urls != expected_sitemap:
            errors.append("sitemap.xml: URL set or order differs from the seven canonical routes")
        for forbidden in ["lastmod", "changefreq", "priority"]:
            if root.findall(f"s:url/s:{forbidden}", namespace):
                errors.append(f"sitemap.xml: forbidden optional field {forbidden}")
    except (ET.ParseError, OSError) as exc:
        errors.append(f"sitemap.xml: {exc}")

    expected_robots = "User-agent: *\nAllow: /\n\nSitemap: https://alonsopizarro.cl/sitemap.xml\n"
    if (ROOT / "robots.txt").read_text(encoding="utf-8") != expected_robots:
        errors.append("robots.txt: content differs from the required policy")
    if (ROOT / "CNAME").read_text(encoding="utf-8").strip() != "alonsopizarro.cl":
        errors.append("CNAME: apex domain is not configured")

    site_html = "\n".join(path.read_text(encoding="utf-8") for path in ROOT.rglob("*.html"))
    if "https://www.alonsopizarro.cl" in site_html:
        errors.append("sitewide: www canonical-domain reference remains")
    if 'name="keywords"' in site_html.lower():
        errors.append("sitewide: meta keywords found")
    if "hreflang" in site_html.lower():
        errors.append("sitewide: hreflang found without separate language URLs")

    main_js = (ROOT / "assets/js/main.js").read_text(encoding="utf-8")
    for marker in ("enableLocalFileNavigation", 'window.location.protocol !== "file:"', 'path.endsWith("/")'):
        if marker not in main_js:
            errors.append(f"main.js: local file navigation marker is missing: {marker}")

    class QuietHandler(SimpleHTTPRequestHandler):
        def log_message(self, format: str, *args: object) -> None:
            return

    handler = partial(QuietHandler, directory=str(ROOT))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    worker = threading.Thread(target=server.serve_forever, daemon=True)
    worker.start()
    try:
        port = server.server_address[1]
        for _, (route, _, _, _) in PAGES.items():
            path = urlsplit(route).path
            with urlopen(f"http://127.0.0.1:{port}{path}", timeout=5) as response:
                if response.status != 200:
                    errors.append(f"local HTTP navigation: {path} returned {response.status}")
    except OSError as exc:
        errors.append(f"local HTTP navigation test failed: {exc}")
    finally:
        server.shutdown()
        server.server_close()
    return errors


if __name__ == "__main__":
    problems = validate()
    if problems:
        print(f"SEO validation failed with {len(problems)} issue(s):")
        for problem in problems:
            print(f"- {problem}")
        sys.exit(1)
    checklist = [
        "Seven unique titles and descriptions match the specification",
        "Seven self-referencing apex-domain canonicals are exact",
        "No canonical contains www, HTTP, GitHub Pages or .html",
        "Sitemap contains only the seven canonical routes",
        "Canonical pages are indexable with the full robots directive",
        "Legacy redirect bridges are noindex, follow",
        "No meta keywords or unsupported hreflang markup exists",
        "Open Graph metadata is complete on every canonical page",
        "Twitter Card metadata is complete and twitter:site is omitted",
        "All seven social-image files exist",
        "JSON-LD parses as valid JSON",
        "Required page-level schema types are present",
        "BreadcrumbList is present on every internal page",
        "All local links and assets resolve to repository targets",
        "Canonical pages point directly to canonical destinations",
        "Redirect bridges point directly to final clean routes",
        "Every canonical page has exactly one H1",
        "No heading-level jump remains",
        "No anchor lacks accessible text",
        "No canonical-page image lacks an alt attribute",
        "No insecure HTTP external anchor remains",
        "All seven clean routes return 200 in a local HTTP test",
        "Local file navigation compatibility remains in main.js and bridges",
    ]
    for item in checklist:
        print(f"[PASS] {item}")
    print(f"SEO validation passed: {len(checklist)}/{len(checklist)} checks.")
