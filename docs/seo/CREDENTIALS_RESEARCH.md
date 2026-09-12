# SkyGuard credential and membership evidence

Checked September 12, 2026. Read-only primary-source research; no logins, submissions, messages, purchases, downloaded-script execution, or website edits.

## Evidence status and safe labels

The owner confirms CertainTeed ShingleMaster status (certificate being mailed), TAMKO Pro Gold, Azle and Fort Worth Chamber memberships, and Home Depot Pro Referral participation. A pending paper certificate is not the same as a pending credential. This report separates that owner confirmation from independent public-profile verification; it does not require the owner to reconfirm already supplied facts.

| Website label | Limited meaning / wording | Independent public match |
| --- | --- | --- |
| **CertainTeed ShingleMaster™** | CertainTeed manufacturer credential. Use the base tier the owner confirmed, not ShingleMaster PRO, PREMIER, or SELECT ShingleMaster. Exact enhanced-warranty eligibility depends on the credential, products/system, and current terms. | Owner-confirmed; no exact SkyGuard public CertainTeed profile URL established in bounded search. |
| **TAMKO Pro Gold™ Certified Contractor** | Gold tier of TAMKO's contractor program. Independent contractor; not a TAMKO employee, agent, or representative. Gold warranty options differ from higher tiers. | Owner-confirmed with supplied badge; no exact SkyGuard public locator-profile URL established. |
| **Azle Area Chamber of Commerce member** | Local business association membership; not a roofing license, installation certification, or workmanship guarantee. | **Verified exact member profile 3520**, matching business name and main phone. |
| **Fort Worth Chamber member** | Local business association membership; distinct from manufacturer credentials. | **Verified member 50563** and official widget response naming SkyGuard. |
| **Pro Referral participant — powered by The Home Depot** | Independent professional participating in a referral marketplace. Avoid “Home Depot-certified,” “Home Depot employee,” or a blanket Home Depot workmanship guarantee. | Owner-confirmed; no exact public SkyGuard Pro Referral profile URL established. |

## CertainTeed: current name and scope

[Official US roofing credential programs](https://www.certainteed.com/roofing-education-credential-us) currently distinguishes **ShingleMaster**, **ShingleMaster PRO**, and **ShingleMaster PREMIER**. It describes education, marketing, business resources, and enhanced warranty benefits by tier. The [Master Craftsman Roofing Contractor page](https://www.certainteed.com/master-craftsman-roofing-contractor) identifies its individual training/test credential as a requirement for these company programs. Do not substitute the individual credential for the company's ShingleMaster status.

CertainTeed's [contractor support page](https://www.certainteed.com/construye-con-certeza) describes credentialed contractors being included in its Find a Pro database. Some older CertainTeed pages still use SELECT terminology; that is not a reason to upgrade or relabel SkyGuard's owner-confirmed base credential. Request the exact current profile URL from the owner's existing credential records when available. Do not invent a `/profiles/skyguard...` URL.

**Official base ShingleMaster artwork observed in live CertainTeed HTML:**

https://certainteed.widen.net/content/hrmgry40qv/web/Credentialed-Contractor-Badge_2025_RGB_ShingleMaster.jpg?crop=yes&k=c&w=1454&h=1162&v=6e87372d-0b83-4166-8f55-ffcbd00f53b1&itok=yqB4_JVd

The source `<img>` identifies the base ShingleMaster badge, 1454 × 1162. This is program artwork, not an individualized SkyGuard certificate. Use the corresponding supplied/authorized badge asset; retain the correct tier and proportions. A link to the program page can explain the credential but is not a link to independent verification of SkyGuard specifically.

## TAMKO: Gold means Gold

[The TAMKO Edge official program page](https://www.tamko.com/edge) explicitly lists Gold separately from Platinum and Diamond. Gold can offer the standard limited warranty and **TAMKO Shield™ Enhanced Limited System Warranty** on qualifying systems. The current comparison identifies no workmanship coverage for Shield; do not import Platinum/Diamond workmanship terms into Gold copy. Avoid numeric warranty marketing unless the actual product/system and issued warranty are specified.

The [official contractor locator](https://www.tamko.com/Locate-A-Contractor) explains that certification involves application/business requirements, references and testing, and advises verifying current certification and warranty eligibility with TAMKO. It also states that these contractors are independent, not TAMKO employees/agents/representatives. Its initial empty search state is not evidence that no SkyGuard listing exists. Exact-name/domain searches did not establish SkyGuard's profile URL, so no guessed profile is provided.

**Official Gold artwork observed twice in live program-page HTML:**

https://www.tamko.com/images/default-source/2025design/edge/tamko-pro-gold-logo-optimized.png?sfvrsn=524b25a0_2

The image alt labels are “Gold Program” and “GOLD.” Prefer the owner's supplied Gold badge if it matches the correct current program, using this official image as a reference. Do not use another tier's artwork.

## Azle: matching member page and existing backlink

**Canonical, live HTTP 200 profile:**

https://business.azlechamber.com/list/member/skyguard-roofing-solutions-3520

Recovered as an actual anchor from the [official construction category](https://business.azlechamber.com/list/ql/construction-equipment-contractors-7), then fetched directly. Match: **SkyGuard Roofing Solutions**, **(682) 330-5088**, **1500 N Main St, Suite 231, Fort Worth, TX 76164**. The live page's canonical link is the exact URL above.

**Verified inbound website anchor:** `http://www.SkyGuardrs.com`, with visible label “Visit Website.” Domain capitalization is immaterial; changing the existing field to `https://www.skyguardrs.com/` would remove reliance on HTTP redirection when owner access is available. No edit was made. This is an existing backlink, not a newly generated one.

The directory address matches Fort Worth Chamber but differs from the website's earlier Mercantile Plaza address. Preserve owner-approved current facts; do not resolve this by guessing. Use the supplied Azle membership badge; no separately verified official member-badge image URL was established here. The exact profile above is the appropriate verification destination.

## Fort Worth widget: exact official response, inspected without execution

Provided script inspected **as text only**:

https://fortworthchamber.chambermaster.com/Content/Script/Member.js

Its code requests the public member endpoint with `secure`, `referrer`, and `memId` parameters, then builds a member-name/Chamber-logo widget from returned fields. A read-only request for member **50563** returned HTTP 200 JSON:

```json
{
  "Customer": "Fort Worth Chamber of Commerce",
  "Logo": "https://chambermaster.blob.core.windows.net/images/chambers/1802/ChamberImages/logo/200x200/logo-red-120.png",
  "URL": "https://www.fortworthchamber.com",
  "Member": "SkyGuard Roofing Solutions"
}
```

**Exact checked public endpoint:**

https://fortworthchamber.chambermaster.com/public/widgets/member?secure=true&referrer=www.skyguardrs.com&memId=50563

**Official widget logo:**

https://chambermaster.blob.core.windows.net/images/chambers/1802/ChamberImages/logo/200x200/logo-red-120.png

**Important distinction:** the widget's `URL` is the Chamber homepage, not SkyGuard's directory profile. The independently verified profile is:

https://business.fortworthchamber.com/list/member/skyguard-roofing-solutions-50563.htm

The widget renders the company's name, “Proud Member of,” and Chamber logo. A static logo/member-link presentation can use those verified values without embedding the third-party JavaScript, subject to the owner's supplied badge usage. The JSON verifies the current public response; it is not a guarantee of future membership status. Linking to the member page allows customers to check the business directly.

## Pro Referral: screening language, not “Home Depot certified”

The [official Home Depot painting-services page](https://www.homedepot.com/services/h/painting) describes Pro Referral professionals as independent businesses. It says the program screens each business owner before matching customer requests, uses third-party background checks after application, verifies valid applicable state-level trade licensing, and requires general liability insurance.

Keep that scope precise: screening of the business owner does not establish checks of every employee or subcontractor; applicable licensing is not evidence of a Texas state roofing license. Program membership does not certify every trade or make every job a Home Depot installation contract. Safe concise copy: **“SkyGuard participates in Pro Referral, powered by The Home Depot.”** A program explanation can mention independent businesses and its stated screening requirements with the official link.

The [official Pro Referral privacy policy](https://proreferral.homedepot.com/about/legal/privacy) confirms the “powered by The Home Depot” relationship and collection of business/identity information for eligibility and background checks. No exact SkyGuard public Pro Referral profile was verified in bounded search. Use the owner's supplied Pro Referral asset and actual account/profile link when available, not an invented slug or generic Home Depot logo presented as a certification.

## Practical link implementation

- Link Chamber badges to the exact matched SkyGuard member profiles above.
- Until company-specific manufacturer/Pro Referral URLs are supplied or independently verified, link informational text to the official program page with a label such as “About the ShingleMaster program,” not “Verify our profile.”
- Keep manufacturer credentials, Chamber membership, and Pro Referral participation in clearly labeled cards. Do not group all five under a blanket “certifications” heading.
- Record user-provided evidence separately from public-directory verification. No public profile found in a bounded search means **not verified**, not **absent**.
- No new backlinks were created by this research. Azle and Fort Worth already link to SkyGuard; the new finding is an additional verified existing source and the precise badge/program information.
