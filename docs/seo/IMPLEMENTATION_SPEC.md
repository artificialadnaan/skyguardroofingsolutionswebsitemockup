# SkyGuard SEO implementation specification

Status: Reviewed and revised for implementation. Date: 2026-09-08. Independent review: SPEC_REVIEW.md, pass with required changes; R1–R10 incorporated below.

## Objective and scope

Improve discoverability and lead conversion for Dallas–Fort Worth roofing by correcting the confirmed audit defects and implementing the website improvements that can be supported by existing evidence. Retain the public site's static HTML/Node architecture, branding, existing useful URLs, and working CRM lead delivery. Website repository: artificialadnaan/skyguardroofingsolutionswebsitemockup. The current workspace is the separate CRM repository.

Deliver reviewed specification, website changes, meaningful automated tests, before/after technical measurements, release documentation, and an actionable local citation/backlink plan. Complete connected infrastructure changes only against verified account/service/domain targets. Never claim a ranking improvement or live backlink without evidence.

## Constraints and assumptions

- Primary origin remains https://www.skyguardrs.com. Keep existing /pages/*.html URLs; normalize aliases with permanent redirects preserving attribution query parameters.
- Assume balanced residential repair/replacement/storm demand across DFW. Fort Worth is the documented base; Dallas is a service area, not an invented office.
- Use primary public business details from Contact: name SkyGuard Roofing Solutions, phone +1-682-330-5088, office@skyguardrs.com, 4500 Mercantile Plaza Suite 300 Fort Worth TX 76137, weekdays 8–18 and Saturday 9–14. Treat these as existing published facts rather than newly verified business records. Do not silently create a public GBP listing from this address without eligibility verification.
- Remove unsupported aggregate review counts, absolute satisfaction/project claims, unspecified manufacturer/state credentials, settlement guarantees, and unverified 24/7 promises. Preserve established service capabilities with restrained wording. Do not invent projects, reviews, licenses, warranty terms, price quotes, dates, staff biographies or customer permissions.
- Additional evidence needed for authentic case studies, claimed certifications, exact coordinates, GBP ownership, and an analytics property is recorded as an operational dependency. Implement reusable data/template support and improve existing gallery presentation without publishing fabricated records.
- Paid directory/membership opportunities may be researched. No purchase, binding agreement, external account creation, or outreach message is authorized by this spec. Paid placements must be judged for real local reach/credibility and applicable sponsored/nofollow treatment, not ranking promises.
- Preserve unrelated existing CRM workspace modifications. Changes to CRM must be isolated and backward compatible; website release must work with the currently deployed CRM.

## Requirements and acceptance tests

### T1 Serving and canonicalization

Serve only an explicit public output directory. Build static HTML and copied assets into dist/ (or public/ consistently); source, tests, dotfiles, package metadata, environment and configuration must not be publicly served. Preserve POST /api/lead and its secret-only server forwarding. Harden malformed URL decoding and traversal without breaking normal encoded URLs.

Build sets a canonical on every indexable HTML page. /index.html redirects to /. Known extensionless aliases redirect to established .html paths. Unknown pages return real 404. Canonical host redirects are based on configured trusted origin and deployment mode, not untrusted forwarded headers; localhost development works. Test query preservation, unknown routes, malformed escapes, traversal, static assets and /api/lead error/success paths using a mock upstream only.

Add MIME types for XML/TXT/WebP/AVIF; implement compressed text responses with correct encoding/cache variation or verified platform compression. Cache immutable assets only with content-versioned names/URLs; HTML revalidates. Public Railway hostname duplicates may redirect once the real website hostname is identified. A health endpoint must remain compatible with Railway health checks and not leak secrets.

### T2 Single-source metadata and business facts

Centralize reusable business data, navigation/footer, page metadata, and publication dates using a lightweight deterministic build step. Do not overwrite unique article bodies. Make build idempotent and fail on broken local assets/links or duplicate/missing canonical/title/description.

All intended public pages have one descriptive H1, unique title/description, absolute www canonical, consistent existing social metadata, and accurate robots directives. Structured data uses stable #organization references and valid types: RoofingContractor, WebSite, WebPage, Service, Article, BreadcrumbList as relevant. Do not emit unsupported ratings or invented coordinates/credentials. Preserve organization author attribution unless a real author biography is available. FAQ content can exist for readers; do not promise FAQ/review rich results.

### T3 Publication and editorial correction

Replace browser-only blog scheduling with build-time publication. Pages with future publish dates must not be served or included in blog lists, internal links or sitemap. A date override must be available for deterministic testing; a scheduled build/deploy path or documented operational procedure releases future material without misleading timestamps. sitemap.xml contains only canonical, published, indexable, 200 URLs and truthful dateModified values. No artificial date bump just for a build.

Review all 31 articles. Remove four TDLR roofing-license references and distinguish voluntary RCAT credentials/city registration from a state license. Correct Grand Prairie permit/registration/time guidance using city source. Replace insurance settlement/coverage promises with inspection, photographs and construction-estimate assistance, consistent with TDI. Review unsupported price/ROI/technical warranty/material claims conservatively; cite primary sources and qualify estimates instead of making fresh unverified claims. Produce an editorial review ledger mapping each article to corrections, source links, remaining dependencies, and outcome.

### T4 Search-intent content

Create substantive /pages/roof-repair.html, roof-replacement.html, storm-damage.html, roofing-dallas.html, roofing-fort-worth.html and a service-area or services hub where it improves navigation. Repair About's missing destinations, including handling insurance-claims.html with a truthful useful page or relevant permanent redirect and updating its links.

Pages must have distinct intent, useful process/service details, authentic photos described accurately, natural contextual internal links, accessible FAQs where useful, and a clear contact/inspection action. City pages must differ beyond a city-name swap and reference applicable official local resources. They may explain actual coverage and request process without invented case studies. Avoid overlapping city×service page proliferation. Existing article URLs with distinct informational intent remain.

Update homepage H1 to clearly identify roof repair/replacement in Dallas–Fort Worth; retain slogan as supporting brand copy. Increase roofing prominence while preserving non-roofing services. Update residential/commercial pages with clear scope and relevant links. Gallery receives useful accurate captions and context; case-study publishing schema/template can be prepared but unverifiable projects stay unpublished.

### T5 Performance and accessibility

Generate responsive WebP variants for all large raster imagery, reuse originals as fallback only where appropriate, add srcset/sizes and explicit dimensions, lazy-load below-fold images and prioritize the actual hero. Initial target budgets: mobile hero ≤200 KB, desktop hero ≤350 KB, cards ≤100 KB subject to readable visual quality. Preserve existing photos; do not use generated replacements as project proof.

Pin or self-host the small necessary icon dependency. Guard # smooth-scroll links, maintain content visibility without successful animation, respect reduced motion, and correct mobile menu aria-expanded/controls, Escape and focus behavior. Add mobile call/inspection actions that do not obscure forms or content.

### T6 Lead conversion and measurement

Add a direct inspection request form and relevant landing-page CTA links. Maintain compatibility with deployed CRM requirements: name, phone and email are required until a separately validated backend change supports optional email. Minimize other required inputs and do not introduce a new formType the CRM rejects. Inspection submissions can use contact plus a clear service/request message.

Capture sanitized attribution (landing pathname, referring hostname, allowlisted UTM fields, selected service and city) with length bounds. Do not forward full arbitrary query strings that may contain PII. Include attribution in currently delivered office lead details in a backward-compatible manner, and add structured support to the CRM if safe. Do not change unrelated internal workflows or add speculative database migrations.

Add optional configurable analytics integration with no fabricated property ID; analytics disabled until configured. Events: successful generate_lead after accepted response, click_to_call, form error; exclude careers and never send name/email/phone/street/message to analytics. Avoid auto-captured full URL/query/referrer PII. Do not display success for upstream failures. Duplicate submission protection, accessible status/error behavior and original form compatibility must be tested with mocks, not real office messages.

### T7 Local authority and backlinks

Provide a researched action matrix with direct primary-source signup/listing/pricing links, free/paid cost status, eligibility, estimated effort, review/verification requirement, and likely value for discoverability/referrals/citations. Prioritize real business profiles and established local/trade directories; identify accurate links that can be added to existing owned profiles. Document Google link-spam policy and how paid sponsored placements differ from purchased ranking links. No manufactured reviews, link farms, private networks, fake city offices, or invented live listings.

Add a useful public roofing resource page only when it serves homeowners (official permitting, consumer insurance, storm resources), with accurate outbound links. Outbound citations improve usefulness but must not be called backlinks. Prepare a concise business listing packet and neutral review-request template; do not send them.

### T8 Infrastructure and release

Inspect connected Railway account and locate exact website service/repo. If domain access allows, configure apex DNS/TLS with Railway-provided targets and permanent host redirect, preserving MX/TXT email records. Never guess a record target or alter unrelated services. If account access is missing, complete all code work and document the exact external dependency.

Run baseline and final local audits using identical checks, and Lighthouse if an available supported runtime allows trustworthy testing. Report structural pass counts and asset byte reductions separately from Lighthouse scores; do not label a custom check percentage as a Google SEO score. Check representative pages with browser visual review before deployment. Create a reviewable commit/PR, deploy the verified site through existing Railway workflow if authorized access exists, and smoke-test live canonical/404/asset/lead non-mutating behavior. Avoid changing protected default branches or triggering an unverified CRM deployment.

## Parallel ownership after review

1. Technical agent: server.js, build scripts, package/deploy configuration, business data, canonical/schema/common shell normalization, regression tests. Own shared transform scripts, not article bodies.
2. Editorial agent: existing pages/blog article bodies and editorial source ledger only. Coordinate structure with build agent; no changes to shared build/server.
3. Content agent: new service/city/resource pages plus homepage/About/residential/commercial/inspection/gallery bodies and content review ledger. No global JS/CSS or build changes.
4. Parent: spec/review integration, responsive assets, frontend JS/CSS conversion/accessibility/measurement, CRM attribution support if appropriate, integration testing, Railway/deployment and final report. Research agent finishes backlink work before third execution slot is needed.

## Verification and definition of done

- Reviewer concerns are addressed in revised spec before parallel execution starts.
- Preserve baseline URL list and hash/version information, then record final page counts, broken links, canonical/schema coverage, future-date exclusion, asset budgets and routing checks.
- All test failures introduced by implementation fixed; browser confirms readable mobile/desktop content and forms/navigation; no real lead emails sent by tests.
- Every audit requirement mapped to implemented, configured and verified, or external evidence/access dependency with exact next action; no silent omissions.
- PR/source changes and release result are reported honestly. Distinguish tested code, deployed behavior, and search/business outcomes which require future data.

## Review revisions and implementation contracts

R1 source provenance: exact deployed commit is adf87cebe52eb6ffb1ff01e8ac4e7852069fdedf. Verified Railway service source is the stated website repository. Normal Git/archive retrieval failed after repeated transport errors. Exact120tracked files and original signed commit bytes were recovered and hash-verified; the implementation branch has the authentic production parent (see docs/source-provenance.json). Reviewer approved a bounded fallback: recover exact raw tracked files against a complete Git blob manifest, preserving modes and detecting submodules/LFS; save a verification report and isolated synthetic local baseline. This is not reconstruction from parsed page content. All required files must verify before affected edits. The synthetic baseline is never described or pushed as upstream history; before PR, restore real history and apply the reviewed patch onto a branch based on the actual upstream commit, then compare trees and retest.

R2 lead contract: website POST /api/lead accepts JSON {formType, payload}, forwards to LEAD_API_URL with x-website-token from LEAD_API_TOKEN, uses a 15-second timeout, and returns 202 only after upstream accepts; missing config 503, upstream failure 502, bad JSON 400, non-POST 405. CRM POST /api/public/website-lead accepts contact/careers only, requires name/phone/email, validates secret WEBSITE_LEAD_TOKEN, rate-limits 20/15min and sends the office email. Contact fields: name, phone, email, address, city, state_zip, message; careers: name, phone, email, position, citizen, license, info. Honeypot company exists. Retain this deployed-compatible contract; add request length/type bounds and consistent honeypot semantics. Test success, non-JSON/non-2xx, timeout/unavailable upstream, missing config, invalid fields, duplicate click, and careers independently. Never echo upstream body or user/secret data in public errors. No real lead messages in tests.

R3 analytics: only configured provider activation; disabled means no provider request or analytics storage. Prefer first-party nonpersistent attribution until configuration/consent requires otherwise; session attribution expires with session and after 24h maximum. Allow source/medium/campaign values only from constrained short slug patterns, reject email/phone/URL-like values and omit term/content. Strip query/fragment and use known page pathnames only. Sanitize referrer to hostname. Disable automatic page views/enhanced capture; manual sanitized events only. Inspect/test payloads including PII-looking UTM values. Consent behavior must be explicit and providers cannot be activated silently by untrusted inputs.

R4 publication: America/Chicago date-only boundaries. Invalid/missing publish dates for articles fail build rather than guessing. Reject modification before publication. Always clean build output. Granbury article (currently 200 with September 14 future date) is an explicitly recorded withdrawal until its declared release date; it is not silently lost. Test before/on/after publication and stale-file removal, sitemap/list/related-links agreement. Add scheduled workflow or operational release mechanism preserving true dates.

R5 deployment contract: SkyGuardWebsite project 873e7a61-3649-4ed5-8741-544b3640f3c8, production environment db83fba8-c6f4-4480-99b2-5773659d6d7b, web service 4216dce4-4e3c-43bd-b2fb-5b81d075335e. Existing Railway uses Railpack, Node18, start override node server.js, port8080, no healthcheck. Build must run through package build detected by Railpack; server start remains compatible with node server.js and generated dist. Choose supported pinned Node22 runtime range. API/health routes must not host-redirect. Canonical www works; apex is already attached but DNS requires @ -> ev4ajccq.up.railway.app and certificate is issuing. No new domain registration needed. Do not add a standard apex CNAME where it would conflict with MX/TXT; provider ALIAS/flattening or supported alternative is required. DNS provider access remains to verify.

R6 editorial: review DIY/roof-access safety, warranties, financing, deductible waivers, storm availability, testimonials, captions/alt and schema in addition to licensing/permits/insurance. Existing images do not establish a named project city/date/material/customer. Publish generic accurate descriptions only unless provenance supports specifics. Unpublished case-study support is a separate deliverable from real published case studies.

R7 release gate: save baseline deployment df2b4969-f7b1-4052-94f9-c95a7b478aa6 and its source commit. Record candidate commit, build artifact and tests, required environment variable names only, actual deployment command, and rollback command. Validate candidate before live publish; smoke-test all new/existing route types without sending emails. On regression restore prior verified source/artifact through existing Railway deployment workflow. Do not redeploy or migrate CRM without a separate passing compatible patch.

R8 measurement: baseline/final same checks for original pages and new pages separately; identify withheld Granbury URL. Structural metrics are counts, not Google scores. Lighthouse if available gets separate SEO/accessibility/performance values with exact URL/template and environment. Field rankings/vitals need future data.

R9 ownership: technical owns server.js, package/lockfiles, nixpacks/railway config, scripts/build*, scripts/check*, tests/server/build, data/business.json, templates/partials and generated dist. Editorial owns pages/blog/*.html bodies and docs/editorial-review.md; do not edit global head/nav/footer because builder normalizes them. Content owns index.html and pages/*.html body content, new pages/projects templates and docs/content-review.md; parent owns js/, css/, images/ generation, analytics tests, integration fixtures and release docs. All agents preserve semantic main/article/breadcrumb structure; builder reads current files at runtime and preserves each main body. Global changes serialize through technical agent; dist is generated and never hand-edited.

R10 backlinks: research report completed with source/pricing links and eligibility. First actions are duplicate-check/complete Google, Bing, Apple, Yelp/BBB/Nextdoor as applicable and update verified owned profile website URLs. Prepared listing packet uses canonical www. Track researched, submitted, verified-live and referral outcomes separately. No sufficient-link-count threshold, purchased ranking promise, account purchase or outreach is inferred.
