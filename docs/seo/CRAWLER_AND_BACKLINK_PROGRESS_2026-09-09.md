# SkyGuard crawler, images and backlink progress

September 9, 2026. Candidate implementation validated locally; deployment evidence is maintained in the workspace RELEASE_STATUS.md.

## Completed independently

- Audited every image: all 230 image elements in the 56 source pages have alt attributes. The current 55-page build contains 226 images: 128 with descriptive alternatives and 98 intentionally empty decorative alternatives. All 18 gallery photos retain their descriptions in the enlarged view. Three homepage article image links now have clear accessible names.
- Added build checks for missing alt attributes, unnamed image links and empty gallery descriptions. These static checks complement browser verification; they are not a complete accessibility audit.
- Enhanced the generated sitemap with 18 unique gallery image URLs, selecting the largest optimized rendition. It still lists exactly 55 published pages and excludes the article scheduled for September 14.
- Documented and verified wildcard robots permission for public pages, images and rendering assets, including search and AI crawlers. API and health routes remain excluded. Robots rules are crawler requests, not access controls; the server still exposes only the public build.
- Added a standard-library XML/robots validation step to CI. Checks cover Googlebot, Bingbot, OAI-SearchBot, ChatGPT-User, GPTBot, Claude-SearchBot, Claude-User, ClaudeBot, PerplexityBot, Perplexity-User and Google-Extended. Allowing access does not guarantee crawling, indexing, rankings or AI citations.
- Added https://www.skyguardrs.com/ to the existing public GitHub repository's homepage field and verified the saved metadata. This is one owned profile reference, not an earned editorial endorsement or a new independent referring domain. The repository README already linked to the website before this change.

## Validation

25 automated tests passed; the 55-page metadata/link/image audit passed; XML and robots parser checks passed for 55 pages, 18 images and 11 crawler identifiers. Desktop/mobile keyboard, navigation, no-JavaScript and mocked form checks passed, including all 18 enlarged-gallery alternatives. No real leads were submitted. Live checks are required after deployment.

## Backlink execution queue

| Priority | Opportunity | Observed state | Needed to complete |
| --- | --- | --- | --- |
| 1 | Existing Facebook Page | Contact link points to http://SkyGuardRS.com/, whose bare domain does not currently resolve. Correct destination: https://www.skyguardrs.com/. | SkyGuard Page manager access; the available account did not list SkyGuard among managed profiles. |
| 1 | Existing YouTube @SkyGuardRSOffice | Public About panel has no website link. Available account switcher did not include SkyGuard. | SkyGuard channel manager session; add the canonical website under Studio → Customization → Profile → Links. |
| 1 | Bare-domain DNS | www works, skyguardrs.com does not. Fixing this would restore existing links using the bare host. | Authoritative DNS access. Use Railway's verified target ev4ajccq.up.railway.app with a provider-supported apex alias/flattening method; preserve mail records. |
| 2 | Fort Worth Chamber | Existing website link already present; address and hours differ from the website. | Existing member access and owner confirmation of current address/hours. Correct the existing listing rather than creating a duplicate. |
| 2 | Show Technology exhibitor feature | Official 2026 show guides list the business. A content form can request a feature including website/social links, but publication is discretionary. | Confirm current exhibitor eligibility, representative details and photo rights; authorization to send the submission. |
| 3 | NTRCA / RCAT | Relevant roofing directories with membership requirements. | Check existing memberships first; owner documents and any approved dues if applying. |
| 3 | Hotfrog | Free basic listing requires account/email and ownership verification. | Confirm canonical business details and existing listing status, then complete verification. |

No new third-party directory listing, editorial backlink, paid placement or outreach message was completed. No money was spent. Detailed routes, sources and profile copy are in BACKLINK_EXECUTION_OPTIONS_2026-09-09.md.

## Spending recommendation

Prioritize existing business profiles, real supplier relationships, trade memberships and local event relationships. Evaluate any paid sponsorship for relevant audience and referral leads; paid links should be labeled sponsored or nofollow. Avoid bulk ranking-link packages and low-quality directory networks: Google lists buying ranking credit and low-quality directory links as link spam. There is no defensible universal number of backlinks that is sufficient to rank in Dallas–Fort Worth.

Sources: [Google link policies](https://developers.google.com/search/docs/essentials/spam-policies#link-spam), [Google image sitemap format](https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps), [YouTube profile link instructions](https://support.google.com/youtube/answer/2657964?hl=en), [existing Facebook Page](https://www.facebook.com/people/SkyGuard-Roofing-Solutions/61557874130573/), [existing YouTube channel](https://www.youtube.com/@SkyGuardRSOffice), [existing Chamber profile](https://business.fortworthchamber.com/list/member/skyguard-roofing-solutions-50563.htm), [exhibitor feature form](https://showtechnology.com/exhibitors-sponsors/exhibitor-info-submission).
