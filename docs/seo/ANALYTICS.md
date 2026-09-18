# Organic traffic and SEO measurement

## Activation — 2026-09-18

Created a dedicated account and GA4 property, both named **SkyGuard Roofing Solutions**.

- Account: `408629828`; property: `554929193`.
- Website stream: `15803397898` — `https://www.skyguardrs.com`.
- Measurement ID: `G-ZCV2CRSKGB`; Google tag: `GT-TNCSHVZV`.
- Reporting timezone: America/Chicago; currency: USD.
- Business objectives: Generate leads and Understand web/app traffic. Industry: Home & Garden; small business size selected based on available company context.
- Optional account data-sharing features disabled. Enhanced Measurement off; user-provided data capabilities off and saved state rechecked.
- `generate_lead` created with code, marked as a key event, once per event, no invented monetary value. Existing Google defaults for purchase/qualify/close do not receive site events.
- Consent-gated page-view test accepted by Google (HTTP 204); zero collect requests before opt-in. Campaign `internal / test / analytics_validation` distinguishes setup traffic. Synthetic email/query/fragment were absent from the outgoing payload.
- Production variables set to the verified measurement ID and manual measurement enabled. Deployment and live verification recorded in the workspace release log.
- Search Console URL-prefix property initiated; this release installs its ownership meta tag on the homepage. Completion of verification, linking and sitemap submission must be recorded after Google's confirmation.

Analytics home: https://analytics.google.com/analytics/web/#/a408629828p554929193/reports/intelligenthome

No historical GA4 visits or SEO gains were invented. Reporting begins after activation and visitor consent. The original checklist below remains the operational reference; see the workspace release record for final verified status.

## Activation checklist

Use an existing SkyGuard GA4 property, or create a separate SkyGuard property in the owner's account. Never put SkyGuard data in another business's property. Record the numeric property ID, web stream ID and public G- measurement ID here after verification. Choose America/Chicago reporting time zone and USD if creating a new property.

1. Use the web stream for `https://www.skyguardrs.com`. Turn off **Enhanced Measurement** (including automatic form interactions/history pageviews). Review Google tag settings and turn off automatic user-provided data collection. Leave Google signals and advertising personalization disabled. Do not link Ads or import conversions as part of this task.
2. Configure Railway production build variables `ANALYTICS_MEASUREMENT_ID=G-...` and `ANALYTICS_MANUAL_MEASUREMENT_VERIFIED=true` after that review; rebuild/deploy. These are public configuration, not credentials. A placeholder ID must never be enabled in production.
3. Check with browser network tools that no Google requests occur before opt-in, one manual page view occurs after opt-in, and navigation retains the choice. Inspect outbound payloads for canonical URLs and referrer hostname only. Check Realtime/DebugView in the actual property. Do not submit a real customer form just to test analytics; the accepted-response event wiring is covered with mocks.
4. Mark **generate_lead** as a key event. It means the server accepted a contact/inspection inquiry; it does not mean the lead was qualified, booked, or sold. Keep **click_to_call** as a separate event/metric; a click does not prove a call connected. Never add the two counts together as unique leads. `form_error` is diagnostic, not a conversion. Careers applications are excluded.
5. Verify ownership of the Search Console property for `https://www.skyguardrs.com/` (or the existing domain property), submit `https://www.skyguardrs.com/sitemap.xml`, and link the property to the matching GA4 stream. Linking requires GA4 Editor and verified Search Console owner access. Publish its Search Console report collection in GA4 if it is not visible. Do not alter DNS without the authoritative provider context.
6. Add an annotation for analytics activation and the September 18 SEO release. Record the previous SEO releases September 8–12 separately. Annotate future material content or technical changes, and the eventual apex DNS repair.

## Reports to save privately in Google Analytics / Search Console

| Report | Filter / dimension | Metrics | What it answers |
| --- | --- | --- | --- |
| GA4 Traffic acquisition | Session default channel group = Organic Search; drill into Session source / medium | Sessions, engaged sessions, engagement rate, generate_lead key events, session key event rate | Is unpaid search bringing more visits and inquiries? |
| GA4 Landing page | Same Organic Search session filter; Landing page | Sessions, engaged sessions, generate_lead key events | Which service, city and blog entry pages are producing results? |
| GA4 Events | click_to_call; compare Organic Search sessions | Event count | Are organic visitors clicking the phone number? |
| Search Console Performance / Search results | Search type Web; query and page views | Clicks, impressions, CTR, average position | Is Google visibility growing, and for which searches/pages? |

Keep `generate_lead` selected as the key event in acquisition reports to avoid including unrelated key events. A zero/null baseline cannot be used for a percentage-growth claim. Session source/medium measures the visit; First user source/medium measures initial user acquisition and answers a different question.

Create a branded Search Console query view using `skyguard|sky guard` and a nonbranded view excluding those terms. Keep the all-query totals too: anonymized queries are omitted from the query table, so query totals need not equal overall totals. Track Fort Worth roofing, repair/replacement, stone-coated steel, metal and commercial landing pages separately. Do not infer each individual GA4 lead's search keyword from aggregated Search Console data.

## Baseline and comparison schedule

- Export existing Search Console data, if available, before drawing conclusions. Save the most recent complete 28 days and previous 28 days, plus the same period last year where available. Exclude incomplete recent days and record the exact dates.
- New GA4 tracking cannot reconstruct preinstallation visits. Its first complete 28 days after verified activation becomes the initial baseline. Compare the next complete 28-day period using the same filters.
- Review weekly, evaluate at 30/60/90 days. Report absolute counts alongside percent changes and note consent coverage, weather/storm demand, seasonality, ads and other releases. A before/after increase alone does not prove the SEO edits caused it.
- Consent, blockers and collection settings mean GA4 will undercount total visits. Search Console clicks and GA4 sessions are different measures and will not match exactly.
- No baseline numbers were available or invented during implementation. Fill actual report links and exports only after authenticated setup.

## Implementation and privacy

`js/analytics.js` loads GA4 only with a valid configured ID, verified manual-measurement flag, the canonical production origin and visitor opt-in. Canonical page paths, external referrer hostname and constrained source/medium/campaign slugs are sent. Form contents, email, phone, addresses, arbitrary query strings, fragments and referrer search terms are excluded. Avoid personal data in campaign names even if it happens to fit a slug.

Natural search referrers are retained for GA4 classification; `ignore_referrer` is false. Approved UTM slugs populate GA4 campaign fields. Presence of Google/Bing advertising click parameters classifies a visit as cpc without transmitting the raw identifiers, preventing paid search from being mistaken for organic. This does not provide Google Ads campaign-level attribution or offline call tracking. `fbclid` alone does not imply paid traffic.

Consent choice alone is saved in sessionStorage for at most 24 hours, without rolling renewal on navigation. It ends when the tab session ends (browser restore behavior may retain a session until the 24-hour limit). Restricted storage falls back to a page-only choice. The footer lets visitors revoke/regrant consent. GA cookies expire after one day without renewal; this limits long-term returning-user analysis. Disabled analytics does not access analytics storage or load the provider. Preview/local origins never collect production data.

## Official references

- GA4 configuration fields: https://developers.google.com/analytics/devguides/collection/ga4/reference/config
- Traffic acquisition: https://support.google.com/analytics/answer/12923437
- Search Console integration: https://support.google.com/analytics/answer/10737381
- Key events: https://support.google.com/analytics/answer/9356034
- Using Search Console with Analytics: https://developers.google.com/search/docs/monitor-debug/google-analytics-search-console
