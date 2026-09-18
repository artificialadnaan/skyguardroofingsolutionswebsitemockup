# SEO release and operations

## Scope and verification

Website only: artificialadnaan/skyguardroofingsolutionswebsitemockup. The separate SkyGuard CRM repository/deployment is unchanged. Lead delivery retains its existing contact/careers contract and required name, phone and email; sanitized website context is appended to the existing delivered message field. No real lead emails were sent by tests.

Source baseline: `adf87cebe52eb6ffb1ff01e8ac4e7852069fdedf`, tree `fcde5042b9b6012bab56f83e951105e3f0316e97`. All120 original tracked blobs and authentic signed commit bytes verified. See `docs/source-provenance.json`. Original production deployment: `df2b4969-f7b1-4052-94f9-c95a7b478aa6`.

## Railway target

- Project: SkyGuardWebsite `873e7a61-3649-4ed5-8741-544b3640f3c8`
- Production environment: `db83fba8-c6f4-4480-99b2-5773659d6d7b`
- Service: web `4216dce4-4e3c-43bd-b2fb-5b81d075335e`
- Primary URL: https://www.skyguardrs.com/
- Existing Railway alias: https://web-production-1ad1.up.railway.app/
- Build: Railpack, Node22 from package/.node-version, `npm ci`, `npm run build`
- Existing start override remains `node server.js`. Public output is `dist/`; server source/config/docs/tests are excluded.

## Release gate and rollback

1. `npm ci && npm run build && npm test && npm run check`; `git diff --check`.
2. Local browser QA uses `node tests/preview-server.cjs` and `PLAYWRIGHT_MODULE=<installed playwright module> node tests/browser-qa.cjs`. The preview injects a mock upstream; never point browser submission fixtures at production. Headless Chrome runs in an isolated temporary profile.
3. Review branch/PR diff. Confirm main still derives from the baseline and required checks pass. Release through the existing GitHub-main Railway source; confirm candidate commit appears in the production deployment.
4. Set `CANONICAL_REDIRECTS=true` on this exact production service with `--skip-deploys` before candidate release. Preserve existing `LEAD_API_TOKEN` and `LEAD_API_URL`; do not print secret values.
5. Check live homepage, all55 published pages, new services/cities, sitemap MIME, robots, nonmutating `/api/lead` GET405, `/healthz`, real404, alias redirects, and absence of source/config files. No real lead POST.
6. On regression restore the previous verified deployment using Railway's rollback control; alternatively upload the exact baseline source with `railway up /private/tmp/skyguard-seo-baseline --path-as-root --project 873e7a61-3649-4ed5-8741-544b3640f3c8 --service web --environment production --detach`, after verifying its120file tree. Revert the release commit through GitHub to keep future deploys consistent. The old server ignores the added canonical flag. Do not touch the CRM service.

Actual release commit, PR, deployment ID and live verification will be recorded in `IMPLEMENTATION_RESULTS.md` after completion.

## Domain dependency

Apex skyguardrs.com is already attached to Railway, but authoritative DNS has no usable apex A/AAAA record. Railway reports target `ev4ajccq.up.railway.app`, domain state requires_update and certificate issuing. The canonical www domain works. In the authoritative DNS provider, configure a supported apex ALIAS/ANAME or CNAME flattening to the exact Railway target; preserve MX/TXT/email records. Do not insert a plain apex CNAME that conflicts with other records or guess an IP address. Once DNS resolves, verify valid TLS and an HTTP308 redirect to www. DNS-provider access is still required; no domain purchase or nameserver migration is needed.

## Publication and measurement

The Granbury lakeside article declares September14,2026 and is deliberately withdrawn (404, absent from lists/sitemap/related links) before that date. Rebuild/redeploy after midnight America/Chicago on September14 to publish it. A clock tick alone does not update static dist. Production must not set the test-only BUILD_DATE override. This release supplies a documented manual procedure; it does not claim an unattended scheduler is configured.

Optional GA4 remains disabled. To activate later, provide a real ANALYTICS_MEASUREMENT_ID and verify the property's Enhanced Measurement/automatic user-data features are off; set ANALYTICS_MANUAL_MEASUREMENT_VERIFIED=true only after verification and rebuild. Visitors must still opt in. When enabled, the visitor's consent choice alone is remembered in sessionStorage for at most 24 hours. Disabled analytics makes no provider requests and accesses no analytics storage. See ANALYTICS.md for activation checks, reporting setup and baseline limitations. Never add form content, names, email, phone, addresses or arbitrary URL queries to analytics. Validate provider payloads before enabling. Search Console/GBP access and real traffic data are required to measure indexing, Maps visibility and qualified leads.

Submit the verified sitemap in the actual Search Console property, inspect representative Dallas/Fort Worth/service URLs, and record baseline nonbrand clicks/impressions and qualified leads. Review at30/60/90days. A Lighthouse100SEO is a limited technical check, not a local ranking score.
