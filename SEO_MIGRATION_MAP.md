# SEO Migration Map

Canonical host: `https://alonsopizarro.cl` (HTTPS, apex domain, no `www`).

## Implemented URL bridges

| OLD URL | NEW URL | ACTION | IMPLEMENTATION | NOTES |
|---|---|---|---|---|
| `/index.html` | `/` | Canonical consolidation | Canonical on the home document; HTTP 301 still recommended at the edge | The physical file is the home document, so an HTML self-redirect was not added. |
| `/research.html` | `/research/` | Preserve and forward | Existing `noindex, follow` HTML bridge with `window.location.replace`, meta refresh and a fallback link | Not an HTTP 301. |
| `/investigacion.html` | `/research/` | Preserve Spanish legacy alias | Existing `noindex, follow` HTML bridge with JS/meta fallback | One EN/ES page remains canonical. |
| `/projects.html` | `/projects/` | Preserve and forward | Existing `noindex, follow` HTML bridge with JS/meta fallback | Not an HTTP 301. |
| `/proyectos.html` | `/projects/` | Preserve Spanish legacy alias | Existing `noindex, follow` HTML bridge with JS/meta fallback | One EN/ES page remains canonical. |
| `/flood-resilience.html` | `/projects/flood-resilience/` | Preserve and forward | Existing `noindex, follow` HTML bridge with JS/meta fallback | Direct destination; no intermediate hop. |
| `/proyecto.html` | `/projects/flood-resilience/` | Preserve Spanish legacy alias | Existing `noindex, follow` HTML bridge with JS/meta fallback | Direct destination; no intermediate hop. |
| `/students-collaborators.html` | `/students-collaborators/` | Preserve and forward | Existing `noindex, follow` HTML bridge with JS/meta fallback | Not an HTTP 301. |
| `/colaboradores.html` | `/students-collaborators/` | Preserve Spanish legacy alias | Existing `noindex, follow` HTML bridge with JS/meta fallback | One EN/ES page remains canonical. |
| `/teaching.html` | `/teaching/` | Preserve and forward | Existing `noindex, follow` HTML bridge with JS/meta fallback | Not an HTTP 301. |
| `/contact.html` | `/contact/` | Preserve and forward | Existing `noindex, follow` HTML bridge with JS/meta fallback | Not an HTTP 301. |
| `/contacto.html` | `/contact/` | Preserve Spanish legacy alias | Existing `noindex, follow` HTML bridge with JS/meta fallback | One EN/ES page remains canonical. |

All bridge canonicals use the apex host. Their JavaScript preserves local `file://` preview behavior by targeting the physical `index.html` file locally and the clean directory URL online.

## Audit of old internal references

- The seven canonical pages do not link internally to the legacy `.html` bridge files.
- Navigation and contextual links use clean directory URLs.
- No internal GitHub Pages URLs were found.
- No local legacy publication-detail or project-detail paths were found that could be mapped safely beyond the known Flood Resilience aliases above.
- External DOI, journal, conference and institutional URLs are source links, not internal legacy routes; they were retained.
- Unknown historical publication URLs must not be redirected to the home page. Map them individually only after evidence from Search Console, analytics, backlinks or server logs establishes the correct destination.

## SERVER_REDIRECTS_RECOMMENDED

The repository can provide HTML/JavaScript/meta-refresh bridges, but those are not HTTP redirects. Configure the following as permanent **301 redirects** in Cloudflare, the origin server or the hosting platform:

1. `http://alonsopizarro.cl/*` → `https://alonsopizarro.cl/$1`
2. `https://www.alonsopizarro.cl/*` → `https://alonsopizarro.cl/$1`
3. Each legacy alias in the table above → its exact clean destination.
4. `/index.html` → `/`
5. `/research/index.html` → `/research/`
6. `/projects/index.html` → `/projects/`
7. `/projects/flood-resilience/index.html` → `/projects/flood-resilience/`
8. `/students-collaborators/index.html` → `/students-collaborators/`
9. `/teaching/index.html` → `/teaching/`
10. `/contact/index.html` → `/contact/`

Rules must be exact or narrowly patterned, must preserve query strings when useful and must point directly to the final URL. Test each rule for a single hop, no loop and a final `200` response. Once server-side 301s are confirmed, the HTML bridge files may remain as a defensive fallback unless the hosting platform requires their removal.

