# BFit Training Hub — Change Log

## 2026-11-10 — Prelaunch housekeeping while coaching intake is closed

- Kept all four free guides available and preserved workout programs and exercise IDs.
- Added a stable coaching availability page with an accurate paused-intake message.
- Redirected the hub and four guide coaching calls-to-action to that page instead of the closed questionnaire. Current form link stays documented for the eventual hard launch.
- Added checks that prevent direct links to the closed form while intake is paused, and extended navigation/browser QA to the new page.
- Updated the repository README and a single prelaunch checklist with source-of-truth URLs, pending form/Zapier checks, exercise-demo review, and mobile testing.
- Identified older Drive drafts as historical backups. No Drive file was deleted, moved, overwritten, or added while storage access is limited.
- Preserved the previous main commit (`5f52ea436d29bb8412b35657a29da729069ea657`) as a Git history restore point.


## 2026-11-05 — Return to all guides while reading

- Foundation and Athleticism now show a small **All guides** link throughout reading or workout sessions, including on a narrow phone. It returns to the main BFit Hub, where readers can switch guides without finishing the current one.
- Existing Hub links remain in every guide's header. Gamer Fit and Run Strong already use sticky headers, so they did not need an additional floating control.
- In Athleticism, the new link sits opposite the existing in-guide Back control; **Back** still changes screens within Athleticism, while **All guides** goes to the Hub.
- Added a mobile-browser regression check for the new links, including touch target size and avoiding overlap with the Athleticism Back button.
- No workout prescriptions, progress data, exercise IDs, or coaching links changed.


## 2026-11-05 — Training-audit fixes and beginner-path checks

- Added a short readiness note to Athleticism before the plan-selection cards. It links back to Foundation and to the guide's first-workout walkthrough; the Jump Starter option still requires basic landing preparation.
- Cleaned up old workload fields in the Athleticism data: the isometric and overall strength fields now agree with the separate lifting/isometric set counts. No exercises, sets, reps, distances, or training days were changed.
- Made Jump Starter's weekly chart totals use the actual reduced workout rows rather than another list of numbers.
- Added automated program-total checks and first-visitor navigation tests to the normal GitHub Actions run.
- Still needs real-device beginner feedback and a separate check of the external exercise demonstration links.


## 2026-11-05 — Cross-guide design consistency pass

- Preserved distinct guide palettes and page layouts; this change is navigation and UI polish, not a redesign.
- Added an explicit **BFit Hub** link in the visible header of Foundation, Athleticism, Gamer Fit, and Run Strong. Their local guide-home or Start actions still operate inside their guide.
- Distinguished internal exercise indexes (**In-guide exercises**) from the separate **Exercise Library** destination on the hub and in Run Strong.
- Added consistent minimum 44px touch targets and keyboard-focus affordances for the new Hub links, adapted to each guide's own palette and mobile breakpoint.
- Kept workout engines, program data, exercise IDs, storage keys, coaching form, and third-party community destinations unchanged.
- Remaining design review: verify real narrow-phone header spacing and screen-reader behavior; use GitHub smoke tests as regression evidence, not a substitute for manual QA.


## 2026-11-05 — Hub-first visual hierarchy and guide navigation polish

- Kept BFit's existing navy, cream, green, and blue guide palettes. Updated the hub's visual hierarchy rather than redesigning it.
- Emphasized Foundation as a starting option, clarified all four card outcomes, reduced intro spacing on mobile, and made Exercise Help easier to find.
- Split the hub's coaching section into Premium and Elite summaries with one prominent questionnaire button and a clearly labeled illustrative coaching check-in (not a client testimonial).
- Moved Foundation's reset action into an accessible Options menu, simplified Athleticism's small-screen nav and saved-progress wording, shortened Gamer Fit's topbar label and initial hero spacing, and tucked Run Strong's Download/Print tools into a secondary menu.
- Standardized the coaching-link language across all guides. Corrected an old Athleticism in-app statement: BFit Lounge is public, while coaching clients have a separate private area.
- Added guide-layout mobile interaction tests and updated the Run Strong download test to account for its menu. Hub responsive, keyboard, accessibility, and guide-entry tests continue to run in GitHub Actions.
- **Not changed:** training programs, exercise IDs, workout calculations, published prices (still shown only in the questionnaire), and individual guide color systems.


## 2026-11-04 — BFit Lounge invitation correction

- Added the BFit Lounge public invitation (`https://discord.gg/9yfqjvZPg`) to the hub and all four guides.
- Corrected earlier wording: the BFit Lounge is an open community; Premium and Elite coaching clients have a separate private client area.
- Confirmed all five repository HTML files contain clickable Instagram, TikTok, Twitch, and Discord links.
- Gamer Fit's large source was retrieved through GitHub blob access and its two-plan coaching copy was corrected.
- GitHub Pages published the current five-page commit successfully. The final smoke-test run was still in progress at the time of this note; external profile availability and signed-out Discord joining are not yet independently verified.

## 2026-11-04 — Public BFit Lounge and social-link consistency

- Published the previously supplied [BFit Lounge Discord invitation](https://discord.gg/9yfqjvZPg) alongside Instagram, TikTok, and Twitch on the hub and all four guides.
- Clarified that BFit Lounge is a public community, while Premium and Elite clients have a separate private coaching area.
- Updated Foundation's leftover private-only Discord sentence and corrected the README and launch audit.
- Preserved workout generators, exercise IDs, prescriptions, and the existing coaching inquiry form.
- All five source files contain all four links; signed-out external click-through and post-change automated browser checks are separate release verifications.

## 2026-11-04 — Social links across the hub and guides

- Added Instagram (`@_trainwithbfit`), TikTok (`@_trainwithbfit`), and Twitch (`gamewithbfit`) as clickable links on the hub, Foundation, Athleticism, Gamer Fit, and Run Strong.
- Made the links easier to find: a Connect section on the hub, guide coaching/footer links, and a Foundation sidebar shortcut.
- Initially no invite URL was available in the repository; this was superseded when the public BFit Lounge invite was supplied and linked across all five pages.
- Replaced Gamer Fit's outdated single-coaching-plan copy with Premium and Elite; programming and workbook logic were not intentionally changed.
- Checked that each of the five HTML sources contains all three profile destinations. External account availability and live mobile rendering still require verification.


## 2026-11-04 — Premium and Elite coaching wording

- Updated the hub, Foundation, Athleticism, and Run Strong to identify two coaching plans: Premium and Elite.
- Removed single-plan claims and kept pricing off public pages; the questionnaire remains the destination for current terms.
- Left programming, workout builder logic, export functions, and exercise IDs intact.
- Gamer Fit initially required separate Git blob access; it was subsequently retrieved and its Premium/Elite copy was updated.
- The Google Form's actual plan descriptions and its email/Zapier follow-up were not accessible for verification.


## 2026-11-04 — Launch audit and testing

- Fixed Foundation's placeholder logo navigation.
- Added clear page descriptions to Athleticism and Gamer Fit.
- Added GitHub Actions source checks and desktop/mobile Chromium smoke tests.
- Checked the Foundation workout builder, browser saving, HTML export, Gamer Fit text download, Athleticism program navigation, and Run Strong offline download.
- Added public-link status checks and a separate [launch audit](LAUNCH_AUDIT_2026-11-04.md) with remaining manual tests.
- Followed the verified library redirect and updated 171 exercise-library host references across the four guides, keeping exercise-ID fragments unchanged.

## 2026-11-04 — Repository cleanup and link consistency

- Replaced the old `Forbfit` README with setup instructions, an accurate repository map, the current free Pages URL, guide links, and an honest release-check checklist.
- Refreshed the hub's first-person introduction and added a low-pressure individual-coaching link.
- Updated all four guides' internal links so Foundation, Athleticism, Gamer Fit, Run Strong, and the hub use `https://vtrackstar.github.io/bfit/` URLs.
- Added canonical URL metadata to the hub and each guide.
- Added a sitemap, an accessible not-found page, and `.nojekyll` for straightforward static hosting.
- Preserved the existing exercise-library links on the separately hosted library; its canonical replacement destination has not been confirmed.
- Did not intentionally alter exercise programming, workout builders, exercise IDs, training prescriptions, or form destinations.

## Prior repository content

- **2026-11-04:** Initial hub and four interactive guides added to GitHub Pages from the November 2 editorial candidates; later first-person coaching and hub navigation updates.
- **Before GitHub:** The site and guide sources were developed across separate BFit guide projects. The files currently in this repository are the source for this GitHub Pages site. Older `CURRENT` or editorial handoff copies elsewhere are not automatically synced.

## Release verification boundary

GitHub Actions deployment success confirms a successful deployment of repository files; it does **not** guarantee a full interactive browser test. Check in particular: mobile menus, generated workouts, exported downloads, saved state after reload, first-workout completion, exercise-library links, and external questionnaire links.
