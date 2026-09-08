# SkyGuard Roofing Solutions website

Website: [SkyGuard Roofing Solutions in Dallas–Fort Worth](https://www.skyguardrs.com/).

This repository contains the public website's source, static build and Node HTTP server. The separate CRM receives contact and careers submissions through the server-only lead proxy.

## Run locally

Use Node22. Run `npm ci`, `npm run build`, then `npm start` (default port3000). The server publishes only `dist/`. Environment variable names and defaults are documented in `.env.example`; provide values through your shell or Railway, keeping credentials out of Git.

Run `npm test` and `npm run check` before a release. `npm run images` regenerates the committed responsive WebP variants from the original images. Business details live in `data/business.json`; publication records live in `data/publication.json`.

## Review and release

- [Reviewed SEO specification](docs/seo/IMPLEMENTATION_SPEC.md)
- [Measured implementation results](docs/seo/IMPLEMENTATION_RESULTS.md)
- [Railway release and rollback procedure](docs/seo/RELEASE.md)
- [Article review and primary sources](docs/editorial-review.md)
- [Existing profile corrections](docs/seo/EXISTING_PROFILE_INVENTORY.md)
- [Local citation and backlink opportunities](docs/seo/BACKLINK_OPPORTUNITIES_2026-09-08.md)

Publication uses the current date in America/Chicago. A future-dated article is omitted from public output and the sitemap until a build on or after its declared date. The documented September14,2026 release requires a fresh build/deployment; the live static files do not change on a clock tick alone.

Analytics is disabled by default. Enable it only after verifying the real property's manual-measurement settings and testing sanitized payloads; visitor consent is still required. Browser submission tests must use the local mock preview server, never production lead delivery.
