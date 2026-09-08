# Search-intent content review

Reviewed and implemented: 2026-09-08. Scope: 15 original pages (homepage and 14 core pages), plus nine new destinations. The blog index is reviewed separately below. Shared metadata, schema, navigation, footer and publication are normalized by the technical build. Article bodies have a separate editorial ledger.

## New destinations

| URL | Intent and distinct useful content | Conversion |
|---|---|---|
| `/pages/roof-repair.html` | Leak investigation, localized repair versus replacement, estimate inclusions, active-leak safety, pricing factors. | Inspection form and phone. |
| `/pages/roof-replacement.html` | Assembly, materials, approvals, allowances, work sequence, variable timing and written warranty checks. | Inspection; repair and financing links. |
| `/pages/storm-damage.html` | Safe observations, damage documentation, construction scope, factual insurance boundaries, no same-day promise. | Storm assessment request and phone. |
| `/pages/roofing-dallas.html` | Dallas service area without fictitious office; DallasNow permit resources, Landmark approval, access and property checklist. | Dallas inspection request. |
| `/pages/roofing-fort-worth.html` | Published Fort Worth base; city residential permit resources, scope-dependent review, Fairmount roofing guidelines, property management needs. | Fort Worth inspection request. |
| `/pages/services.html` | Roofing-first hub connecting repair, replacement, storm, inspection, residential/commercial and ancillary trades. | Service links and inspection. |
| `/pages/service-areas.html` | Dallas/Fort Worth core pages, honest wider service coverage, property/jurisdiction/scheduling checks; no invented satellite offices. | Confirm service by address. |
| `/pages/resources.html` | Direct official Dallas/Fort Worth/Grand Prairie, NWS and TDI resources plus a hiring checklist. Outbound references are not backlinks. | Contextual service links. |
| `/pages/insurance-claims.html` | Contractor estimate versus insurer decision, document checklist, written scope, no adjuster representation or deductible waiver. Repairs previously broken About destination. | Roof-condition assessment. |

Each destination has a distinct title, description and H1 in source, a semantic main region, relevant internal links, and a clear next action. Repair, replacement, storm and city pages provide approximately 400 words of useful, distinct content rather than duplicating city names. FAQs use native accessible details/summary elements and make no rich-result promises.

## Existing pages reviewed

| Page | Correction/result |
|---|---|
| Homepage | H1 now identifies DFW roof repair and replacement. Added roofing-intent links and Dallas/Fort Worth context. Removed inconsistent years/project counts, 100% satisfaction, 24/7 availability, unverified manufacturer/state credentials, insurance settlement promises, and unverified testimonial. Preserved service and blog card layout; softened unsupported article teasers. Decorative card images use empty alt text beside descriptive linked headings rather than inferred project cities. |
| About | Replaced unsupported family history, 15/30-year claims, 2,500-roof count, satisfaction/24-hour claims, testimonial, and settlement assurance with business contact details and a practical construction process. Linked working service and insurance pages. Contact facts follow existing Contact page. |
| Residential roofing | Defined inspection/repair/replacement scope, assembly/material questions, property logistics, estimate contents, and related trades. Removed unsupported manufacturer credentials, years and performance promises. |
| Commercial roofing | Added system/occupancy/drainage/equipment planning and maintenance-versus-repair considerations. Removed blanket licenses/insurance credentials and unspecified warranty assurances; request actual documentation for selected system. |
| Inspections | Replaced unsupported certified/25-point/full-picture claims with scope and access limitations. Added direct `#contact-form` at `#request-inspection`; required name/phone/email, optional city/service/message; `data-request-context="Roof inspection request"`. Existing deployed CRM field contract retained through parent frontend mapping. No booking or emergency-response promise. |
| Financing | Found existing Apply button had `href="#"`, with no verified partner application URL. Replaced broken call to action and guaranteed/fast approval language with scope-first planning, provider-dependent eligibility and terms, current Acorn marketplace information, and contact to confirm availability. No rates, monthly payment, approval, or active partnership invented. |
| Gallery | Reviewed contact sheet of all 18 existing gallery images. Added visible captions describing only observable framing, roof, underlayment, painting preparation and building features. No city/date/material-brand/customer inferred from filename. Preserved gallery/lightbox structure and original photographs. |
| Contact | Kept published business details/hours and existing form. Required name/phone/email unchanged; made message optional, added autocomplete/length bounds, inspection link and appointment-before-visiting copy. |
| Careers | Retained existing form and field contract. Removed absolute training/advancement/pay promises; role-dependent hiring copy, contact field bounds/autocomplete, button width correction. No job schema or false vacancy created. |
| Siding | Replaced unsupported superlatives with wall-system, material, flashing, concealed-condition and scope decisions. Related window/paint/roof links. |
| Windows/doors | Removed unspecified factory certifications and guaranteed protection/savings; added measurements, ratings, flashing, finish and warranty questions. |
| Painting | Removed flawless/guaranteed finish claims; added surface preparation, coating/finish selection, moisture cause, access and defined exclusions. |
| Fencing | Added property line/easement, gates, utilities, local/HOA and scope checks; no blanket durability or completion promise. |
| Drywall | Added underlying moisture/structural cause, assembly, finish and lighting expectations, coordinated paint/roof links; no guaranteed invisible patch. |
| Framing | Removed passes-inspection-every-time and unconditional budget/schedule claims. Added plans/design-professional, permitting, trade sequence and change-approval requirements. |
| Blog index | Additional authorized integration review: aligned all 31 article previews with conservative corrected intent; Southlake documentation and Frisco budgeting labels match editorial changes. Removed inferred city/project image alt claims and added descriptive image-link labels. Added service/resource links. All original publication dates preserved; technical build excludes the future Granbury card. |

## Primary sources used

Checked 2026-09-08. City requirements remain scope/address-dependent; pages direct readers to the city instead of asserting a universal DFW rule.

- [Dallas residential permits](https://dallascityhall.com/departments/sustainabledevelopment/buildinginspection/pages/residential.aspx): DallasNow and remodel/permit resources.
- [Dallas Landmark Review Process](https://dallascityhall.com/departments/sustainabledevelopment/historicpreservation/Pages/Landmark-Review-Process.aspx): exterior-work approval, routine-maintenance review and shingle replacement context.
- [Fort Worth residential building permits](https://www.fortworthtexas.gov/departments/development-services/permits/residential-building-permit): local scope/application resources.
- [Fort Worth Fairmount roofing guidelines](https://www.fortworthtexas.gov/files/assets/public/development-services/documents/all-preservation-and-design/historic/historic-districts/fairmount/section7-roofing.pdf): example of district-specific roof guidance; not generalized to every Fort Worth property.
- [Grand Prairie residential re-roof](https://www.gptx.org/Departments/Building-Inspections/Residential-Information/Residential-Re-Roof): official resource shared with the separate article editorial review.
- [Texas Department of Insurance: roofing and insurance](https://tdi.texas.gov/consumer/storms/roofing-and-insurance-know-the-law.html): contractor/public-adjuster distinction and deductible restrictions.
- [National Weather Service Fort Worth/Dallas](https://www.weather.gov/fwd/): official weather information, not property-specific proof of damage.
- [Acorn Finance](https://www.acornfinance.com/): direct marketplace information; no unverified SkyGuard partner link or offer was published.

## Remaining evidence dependencies

Business owner should confirm published contact details, address eligibility/visitor policy, actual no-cost inspection eligibility, current service capability and availability, insurance evidence, manufacturer credentials, written warranty terms, real customer references and photo permissions. No new claims based on those dependencies have been invented. The existing published business contact facts are preserved as the source of truth for this release.

Before publishing a real case study, use `docs/CASE_STUDY_TEMPLATE.md` and obtain project records/permission. Current gallery captions improve useful image context but are not authenticated case studies. Obtain a verified financing application URL before introducing an Apply button. Ranking/lead outcomes require post-release Search Console/analytics data.

## Integration checks

- Reviewed source titles/descriptions on all core pages; corrected stale Careers vacancy and Gallery completed-project claims.
- Corrected visual breadcrumb hierarchy: general company/resource pages do not sit under Services, city pages link to Service Area.
- Main-region checks pass for local targets, fragment IDs, one H1 per page, and unique IDs.
- Blog index keeps all 31 original `data-publish-date` values unchanged; publication control remains build-owned.
- Main heading order reviewed across all 25 core/index pages: no skipped levels. Shared footer heading order remains build-owned.
- Reviewed parent-generated desktop/mobile homepage screenshots: readable headline wrapping, intact single-column mobile cards, no visible horizontal overflow. Initial desktop capture had unloaded lazy images; mobile capture showed them loaded. Screenshot labels precede final Frisco teaser change.
- Final generated HTML needs rebuild after this integration pass; source updates are authoritative.
