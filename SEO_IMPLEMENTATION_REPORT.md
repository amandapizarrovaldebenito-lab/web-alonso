# SEO Implementation Report

## 1. Scope and baseline

Phase 2 technical SEO was implemented for the seven canonical pages without redesigning the site or changing its academic content. The pre-existing clean directory routes and local `file://` navigation compatibility were preserved. The baseline had `www` canonicals, no page-level robots directive on canonical pages, no Open Graph/Twitter metadata, no JSON-LD, no sitemap and no robots file.

## 2. Canonical domain and preferred URLs

The preferred origin is now consistently `https://alonsopizarro.cl`:

- Every canonical page uses one self-referencing apex-domain canonical.
- Every Open Graph URL equals its canonical URL.
- Every JSON-LD page URL and `@id` uses the same apex origin.
- Every redirect bridge canonical uses the final apex URL.
- `CNAME` now contains `alonsopizarro.cl`.
- No `www`, GitHub Pages, HTTP or `.html` canonical remains.

The DNS record, HTTPS certificate and host-level `www` → apex redirect are external deployment responsibilities.

## 3. Exact page titles

The requested unique English titles were installed verbatim for Home, Research, Projects, Flood Resilience, Students & Collaborators, Teaching and Contact. The visible EN/ES interface remains unchanged; titles are stable crawlable metadata rather than client-side language variants.

## 4. Meta descriptions

Each canonical page now has its requested unique description. Descriptions summarize only visible subject matter already present on the page and do not introduce unsupported claims.

## 5. Robots meta directives

All seven canonical pages use:

`index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1`

Legacy bridges remain `noindex, follow`. No canonical page is blocked from indexing.

## 6. XML sitemap

`sitemap.xml` was created with exactly the seven canonical HTTPS/apex/clean URLs. It contains no redirect aliases, no `.html` URLs, no `lastmod`, no `changefreq` and no `priority` values.

## 7. Robots file

`robots.txt` was created with an allow-all policy and the absolute sitemap URL:

```text
User-agent: *
Allow: /

Sitemap: https://alonsopizarro.cl/sitemap.xml
```

## 8. Open Graph

All canonical pages now include `og:type`, `og:site_name`, `og:title`, `og:description`, `og:url`, `og:image`, `og:image:alt`, `og:locale=en_US` and `og:locale:alternate=es_CL`. The profile home uses `profile`; the Flood Resilience detail uses `article`; collection/general pages use `website`.

## 9. Twitter Cards

All canonical pages use `summary_large_image` with page-specific title, description, absolute image URL and image alt text. `twitter:site` was intentionally omitted because no verified account handle was provided.

## 10. Theme color and favicons

`theme-color` is `#033066` on every canonical page. The existing favicon and Apple touch icon declarations were retained; no icon path or design was changed.

## 11. Social images

Each social image is the real hero asset already used by that page:

- Home: `hero_home.png`
- Research: `hero_investigacion.png`
- Projects: `hero_proyectos.png`
- Flood Resilience: `hero_flood_resilience.png`
- Students & Collaborators: `hero_students_adn_collaborators.jpeg`
- Teaching: `hero_teaching.png`
- Contact: `hero_contacto.png`

All seven files exist at the exact case-sensitive repository paths. Width/height metadata was not added because it was optional and unnecessary for correctness.

## 12. Home structured data

The home page has one JSON-LD `@graph` containing:

- `WebSite` with `https://alonsopizarro.cl/#website`.
- `Person` with `https://alonsopizarro.cl/#person`.
- `ProfilePage` with `https://alonsopizarro.cl/#webpage`.

The Person includes the requested full alternate name, job title, Universidad del Bío-Bío affiliation, seven evidence-based `knowsAbout` topics and only the five real profiles already present on the site: Google Scholar, ResearchGate, ORCID, OSF and LinkedIn.

## 13. Internal-page structured data and breadcrumbs

- Research: `CollectionPage` + `BreadcrumbList`.
- Projects: `CollectionPage` + `BreadcrumbList`.
- Flood Resilience: `WebPage` + `ResearchProject` + `BreadcrumbList`, including identifier `FONDECYT 11240171`.
- Students & Collaborators: `CollectionPage` + `BreadcrumbList`.
- Teaching: `WebPage` + `BreadcrumbList`.
- Contact: `ContactPage` + `BreadcrumbList`.

Each page references the site `WebSite` and the same canonical `Person` entity by `@id`. Breadcrumbs are schema-only; no visual breadcrumb component was added.

## 14. Migration map and legacy-reference audit

`SEO_MIGRATION_MAP.md` records each known `.html` and Spanish alias, its exact final route, current bridge behavior and recommended server action. The canonical pages contain no internal links to legacy bridge files, GitHub Pages URLs or old internal HTTP URLs. No unsupported publication-detail mapping was invented.

## 15. Current redirect implementation

The eleven existing redirect pages were retained. They provide:

- `noindex, follow`.
- Canonical to the exact final route.
- `window.location.replace` online.
- Meta-refresh fallback.
- A normal fallback anchor.
- A physical `index.html` target under `file://`.

These are HTML/JavaScript redirects, not HTTP 301 responses. They point directly to the final route and do not form internal redirect chains.

## 16. Recommended server redirects

Permanent 301 rules are still required outside the static HTML for HTTP → HTTPS, `www` → apex, `.html` aliases → clean routes and explicit `/index.html` variants → directory routes. Exact recommendations and the distinction between implemented bridges and server configuration are documented under `SERVER_REDIRECTS_RECOMMENDED` in `SEO_MIGRATION_MAP.md`.

## 17. Clean internal navigation and route tests

Internal navigation remains directory-based and compatible with the clean URL architecture. The local preview adapter at the top of `assets/js/main.js` remains intact and converts trailing-slash links to physical `index.html` files only for `file://` sessions.

An automated local HTTP server requested all seven clean routes; all returned `200`. The validator also confirmed that referenced internal HTML pages, CSS, JavaScript, images, icons and local documents exist.

## 18. H1 and heading hierarchy

Each canonical page has exactly one H1. An existing H2 → H4 jump in the Thesis Students cards was corrected to H3, and the CSS selector was updated from `.student-profile-head h4` to `.student-profile-head h3` so the visual styling remains the same. No other visible heading copy changed.

## 19. Anchors, alternative text and preliminary accessibility

Automated parsing found:

- No empty anchor without accessible text, image alt, `aria-label` or title.
- No canonical-page image missing an `alt` attribute.
- Decorative icon images continue to use empty alt text where appropriate.
- No heading-level jump after the semantic fix.
- No insecure `http://` external anchor after one Revista Médica de Chile URL was upgraded to HTTPS.

This is a preliminary structural/WCAG-oriented audit, not a full manual accessibility conformance assessment with keyboard, screen-reader, zoom and contrast testing.

## 20. Internal and external link audit

The deterministic validator reports no missing internal target or insecure external URL. A best-effort live check inspected 106 unique external URLs:

- 63 returned a successful/redirect status.
- 42 returned known bot-restriction responses (`403` or LinkedIn `999`) and cannot be classified as broken by an automated agent.
- 1 DOI endpoint was inconclusive during the live request; its bibliographic identifier was retained because it is consistently cited in the publication record.
- 0 were classified as broken after anti-bot responses were separated from actual failures.

`scripts/check_external_links.py` is intentionally best effort: external availability can change and protected sites may continue to block automated checks.

## 21. Analytics and Search Console

No analytics tool or real measurement ID existed, so none was invented. `ANALYTICS_SETUP.md` documents GA4 Enhanced Measurement, future events and the exact post-EmailJS-success point for a `generate_lead` event. `SEARCH_CONSOLE_SETUP.md` documents apex Domain property creation, DNS TXT verification, sitemap submission and inspection of all seven canonical URLs. These actions require external accounts/DNS access and are not implemented by repository code.

## 22. FUTURE_PUBLICATION_SEO

Phase 3 should add individual publication pages only for high-value works with enough unique visible content. Do not generate dozens of thin pages merely to attach `ScholarlyArticle` markup.

Recommended pattern:

- Route: `/research/publications/descriptive-slug/`.
- One self-canonical URL and a unique, human-readable title/description.
- Visible citation, authors, year, venue, abstract/summary, DOI and relevant supplementary links.
- `ScholarlyArticle` JSON-LD only when those facts are present and verified, referencing `https://alonsopizarro.cl/#person` for Alonso Pizarro.
- `sameAs` or an appropriate identifier for the verified DOI; no invented citation counts, dates, affiliations or authors.
- Page-specific Open Graph/Twitter image where a rights-cleared asset exists.
- A breadcrumb back to Research & Publications.
- Inclusion in the sitemap only when the page is substantial, indexable and linked internally.
- Exact 301 mapping if a prior publication URL existed.

Start with a small editorially selected set of publications that have strong search demand, external links or strategic relevance. Measure impressions/clicks before expanding.

## 23. Verification, deployment limits and final status

Automated verification is reproducible with:

```powershell
python scripts/validate_seo.py
python scripts/check_external_links.py
```

The first script validates exact titles/descriptions/canonicals, robots directives, social tags, JSON-LD parsing/types, H1 count, heading hierarchy, anchors, alt attributes, internal targets, social assets, redirect bridges, sitemap, robots, CNAME, absence of `www`, absence of meta keywords/hreflang and local HTTP responses. It passes for all seven pages.

Code implemented in this repository: metadata, social tags, JSON-LD, sitemap, robots, CNAME target, legacy-canonical normalization, semantic heading correction, HTTPS link normalization, documentation and validators.

External configuration still required: apex DNS, HTTPS readiness, host/Cloudflare 301 rules, Search Console verification/submission, Rich Results Test/Schema Markup Validator checks against the deployed URLs, analytics property/tag activation and post-deployment social-card previews. Static hosting cannot emit a true 301 through an HTML file alone.

| Page URL | Title | Canonical | Schema | Indexable | Status |
|---|---|---|---|---|---|
| `https://alonsopizarro.cl/` | Alonso Pizarro \| Hydrology & Complex Hydrosystems | Self | WebSite + Person + ProfilePage | Yes | Pass |
| `https://alonsopizarro.cl/research/` | Research & Publications \| Alonso Pizarro | Self | CollectionPage + BreadcrumbList | Yes | Pass |
| `https://alonsopizarro.cl/projects/` | Hydrology Research Projects \| Alonso Pizarro | Self | CollectionPage + BreadcrumbList | Yes | Pass |
| `https://alonsopizarro.cl/projects/flood-resilience/` | Flood Resilience & Bridge Scour \| Alonso Pizarro | Self | WebPage + ResearchProject + BreadcrumbList | Yes | Pass |
| `https://alonsopizarro.cl/students-collaborators/` | Students & Research Collaborators \| Alonso Pizarro | Self | CollectionPage + BreadcrumbList | Yes | Pass |
| `https://alonsopizarro.cl/teaching/` | Hydrology Teaching & Thesis Supervision \| Alonso Pizarro | Self | WebPage + BreadcrumbList | Yes | Pass |
| `https://alonsopizarro.cl/contact/` | Contact Alonso Pizarro \| Research & Thesis Supervision | Self | ContactPage + BreadcrumbList | Yes | Pass |

