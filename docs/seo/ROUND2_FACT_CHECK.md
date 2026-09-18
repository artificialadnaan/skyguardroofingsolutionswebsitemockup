# Five-article factual audit — September 18, 2026

**Result: none of the quoted allegations appear in the current source or freshly fetched live articles.** Treat the allegations as referring to older content, not confirmed defects in the present release. Their original provenance/cache date was not independently established.

Scope: read-only review of five source files under `/private/tmp/skyguard-seo-round2/pages/blog`, checkout identified by root as main `41ff700`. The previous `/private/tmp/skyguard-seo-work/pages/blog` directory was empty. No website files edited.

## Fresh live checks

Fetched each exact `https://www.skyguardrs.com/pages/blog/{slug}.html` URL using IPv4 curl after sandbox DNS failed. All five returned HTTP 200. After HTML parsing and whitespace normalization, **each live `<main>` text, `<title>` and meta description exactly matched its source counterpart**. This is a current direct fetch comparison, not a search-result cache check. Raw response captures: `/private/tmp/round2-live-{slug}.html`.

## Findings by article

### Southlake — `southlake-insurance-claims.html`

Allegations: “Maximize Insurance Claims” title; contractor handles claims/adjusters/supplementing for homeowners; universal two-year deadline.

- Current title, line 6: `Southlake Roof Damage & Insurance Documentation | SkyGuard`.
- Current H1, line 101: `Roof Damage Documentation and Insurance Questions for Southlake, TX Homeowners`.
- Line 113: “Ask the insurer for the deadlines that apply to your policy and claim.” No universal two-year deadline.
- Line 122: “The homeowner handles the claim with the insurer. We do not file or negotiate claims for homeowners, represent them on coverage questions, or promise a settlement.”
- Line 125 assigns additional construction documentation to the homeowner/insurer workflow and explicitly says a contractor change order does not determine coverage.
- **Verdict:** alleged title and problematic claims are absent. Current insurer/contractor distinctions directly address the flagged issue. No necessary correction identified for these flags.

Live: https://www.skyguardrs.com/pages/blog/southlake-insurance-claims.html

### Plano — `plano-roofing-contractor-guide.html`

Allegations: TDLR roofing license; Texas project-manager registration.

- Line 128: “Texas does not require a general state-issued roofing-contractor license. RCAT offers a separate voluntary roofing credential.”
- Same paragraph distinguishes the City of Plano’s scope-specific requirements and business registration/permits from roofing credentials.
- Neither TDLR nor project-manager registration is asserted anywhere in this source.
- **Verdict:** allegations absent and current text directly contradicts them. Optional improvement: link a current City of Plano official requirements page beside the municipal-check instruction; the article currently links RCAT, TDI and GAF only. Verify the exact city scope before adding a rule.

Live: https://www.skyguardrs.com/pages/blog/plano-roofing-contractor-guide.html

### Fort Worth materials — `fort-worth-roofing-materials.html`

Allegations: all replacements require permits; mandatory 130 mph; all Class 4 products have polymer backing; universal 10–30% insurance discount.

- Line 128 tells readers to request the exact product’s current impact-test classification. No polymer-backing or universal Class 4 construction claim.
- Line 131 rejects assuming a standard wind rating for all metal. No 130 mph requirement appears.
- Line 143: “Insurance discounts must be confirmed for the exact product by the insurer.” No percentage appears.
- There is no statement that all replacements require permits. There is currently **no local permit explanation at all**; the article links the Fort Worth service page at line 157.
- **Verdict:** all four alleged claims absent. Real opportunity: add a concise, officially sourced Fort Worth permit distinction if root’s current municipal-source review supports it. That would fill missing local context rather than correct an existing false permit statement. Do not substitute an unsourced categorical exception.

Live: https://www.skyguardrs.com/pages/blog/fort-worth-roofing-materials.html

### Euless commercial maintenance — `euless-commercial-roof-maintenance.html`

Allegations: 2–3× spending multiplier; $1 saves $5–8; 5–10 added years; $200–500 versus $15,000–50,000 costs.

- Line 116 explicitly assesses value “without assuming a fixed savings multiplier.”
- Line 131 says maintenance does not guarantee coverage or automatically extend a warranty.
- Line 134 requests a proposal based on roof size, condition, access, drainage and reporting needs. No quoted price range, spending ratio or added-life number appears anywhere in this source.
- **Verdict:** allegations absent. Minor actual citation-fit gap: the OSHA link at line 142 is a *residential reroofing* fall-hazard PDF while this article concerns commercial maintenance. Its broad caution is compatible with the body, but a commercial/general OSHA roofing or fall-protection primary resource would better match the audience. No numerical claim needs rewriting.

Live: https://www.skyguardrs.com/pages/blog/euless-commercial-roof-maintenance.html

### Mesquite hail — `mesquite-hailstorm-recovery.html`

Allegations: “licensed” roofing contractor; 15–30% insurance discount.

- Line 134 uses “qualified contractor,” not “licensed.” No roofing-license assertion appears in source, metadata or body.
- Line 140: “Ask your insurer whether an exact product qualifies for a discount and obtain the amount in writing before budgeting any savings.” No percentage appears.
- Line 137 also separates SkyGuard’s inspection/photos/estimate role from homeowner coverage representation or settlement negotiation.
- **Verdict:** allegations absent. No necessary correction identified for these flags.

Live: https://www.skyguardrs.com/pages/blog/mesquite-hailstorm-recovery.html

## Recommended scope

1. Preserve the corrected insurance, credential and product-specific wording; do not rewrite these pages merely to remove statements that are already gone.
2. If making a narrowly scoped content improvement, prioritize a current official Fort Worth permit paragraph, a direct Plano municipal reference, and an appropriately scoped Euless safety citation.
3. Tell the user which findings were already resolved using live evidence. Updating search-engine copies/snippets depends on recrawling; this audit does not prove what a third-party cached view contains.
4. Full all-page legal/material fact checking and outbound-link health were outside this bounded assignment. No claim that every existing source link is currently reachable.

## Whole-site direct check and implemented follow-up

A direct no-cache HTTP retrieval on September 18 matched all 58 published pages byte-for-byte against main commit 41ff700. There were no retrieval failures, old Mercantile/76137 references or obsolete emails. All58 carried old hours. This is current-source evidence, not a search-snippet inference. An independent reviewer also scanned main content across all59 source pages, including the scheduled article, for the flagged licensing, savings, response and company-history categories; no additional affirmative examples were found. This targeted risk scan is not certification of every factual sentence.

Actual changes: centralized hours and inspection sidebar; unused homepage schema hours; documented TAMKO date/ID/recertification; explicit Fort Worth shingle-only vs decking permit distinction with City link; direct Plano municipal resource; broader OSHA construction source for the commercial maintenance article; substantive Fort Worth replacement buying guide at the existing URL. Southlake and Mesquite already meet the requested cautious standard and are preserved. No new expert review attribution, company project history, insurer discounts or numerical warranties were invented.

The user-provided training quiz, private conversations, unrelated addresses and CRM screenshots were excluded. The old skyguardhq.com522 screenshot is a different application's historical error and was not treated as a current website SEO defect.
