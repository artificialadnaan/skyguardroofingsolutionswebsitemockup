# SkyGuard Roofing Solutions website

Website: [SkyGuard Roofing Solutions in Dallas–Fort Worth](https://www.skyguardrs.com/).

This repository contains the public website's source, static build and Node HTTP server. The separate CRM receives contact and careers submissions through the server-only lead proxy.

## Run locally

Use Node22. Run `npm ci`, `npm run build`, then `npm start` (default port3000). The server publishes only `dist/`. Environment variable names and defaults are documented in `.env.example`; provide values through your shell or Railway, keeping credentials out of Git.

Run `npm test`, `npm run check` and `python3 scripts/check-crawlers.py` before a release. The crawler check uses Python 3.9+ standard-library XML and robots parsers. `npm run images` regenerates the committed responsive WebP variants from the original images. Business details live in `data/business.json`; publication records live in `data/publication.json`.

## Review and release

- [Reviewed SEO specification](docs/seo/IMPLEMENTATION_SPEC.md)
- [Measured implementation results](docs/seo/IMPLEMENTATION_RESULTS.md)
- [Railway release and rollback procedure](docs/seo/RELEASE.md)
- [Article review and primary sources](docs/editorial-review.md)
- [Existing profile corrections](docs/seo/EXISTING_PROFILE_INVENTORY.md)
- [Local citation and backlink opportunities](docs/seo/BACKLINK_OPPORTUNITIES_2026-09-08.md)

Publication uses the current date in America/Chicago. A future-dated article is omitted from public output and the sitemap until a build on or after its declared date. The documented September14,2026 release requires a fresh build/deployment; the live static files do not change on a clock tick alone.

Analytics is disabled by default. Enable it only after verifying the real property's manual-measurement settings and testing sanitized payloads; visitor consent is still required. Browser submission tests must use the local mock preview server, never production lead delivery.

## Search and AI discovery

The build generates the authoritative `dist/robots.txt` and `dist/sitemap.xml`; Railway serves these generated files. The wildcard crawler policy permits public pages and assets, including AI search/retrieval and training agents, while excluding operational API and health paths. Source-file access remains controlled by the server, not robots.txt. The sitemap includes full-resolution informative gallery images and excludes decorative images and scheduled unpublished pages. This permits discovery; it does not promise indexing, AI citations or rankings.

### Fort Worth specialty content and legacy URLs

Stone-coated-steel and metal-selection pages use the existing `/pages/*.html` architecture; `scripts/build.js` adds their navigation, canonical and Service graph. Update `data/business.json` for owner-confirmed identity changes: Contact and Fort Worth main content use `{{businessAddress}}` / `{{businessHours}}`, matching generated footer/schema. Keep the human-readable hours and `openingHoursSpecification` consistent.

`data/legacy-redirects.json` contains only evidenced old paths with relevant successors. The server redirects only when the target is present in the public build. Preserve unknown-path 404s rather than adding a catch-all homepage redirect. Evidence: `docs/seo/TEK_MANUFACTURER_AND_LEGACY_RESEARCH.md`.

Optional browser verification: `PLAYWRIGHT_MODULE=/absolute/path/to/playwright node tests/specialty-review-qa.cjs` against the mock preview on port 4173. Set `QA_ORIGIN` for read-only live checks; the script blocks all POSTs.
