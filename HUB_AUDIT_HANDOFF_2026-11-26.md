# Current hub audit follow-up — November 26, 2026

This handoff supersedes older recommendations where the current source differs. Historical reports remain intact. Read the main branch and current Actions results before making further changes.

## Implemented in this follow-up
- Ten published guides/plans; Pistol Squat remains planned. Coming Next is evergreen.
- Collection shortcuts, overflow controls, introductory descriptions, running-guide differentiation, combining-guide guidance and consistent major hub headings.
- Catalog, sitemap, public-link list, changelog and static/browser checks updated.
- Run Strong headings and 5K link; 5K plain-language labels; Weekend Warrior first gym visit; Build Your Glutes exercise selection, integration and realistic expectations.
- Existing paths, storage formats, training algorithms, coaching prices, paused intake and hub Twitch removal retained.

- Foundation starting-weight and rest guidance, Athleticism program examples and readiness language, stable push-up surfaces and pull-up setup guidance added. Glute exercise and frequency research linked directly, including published correction.
- Horizontal navigation regression corrected; responsive and arrow checks passed in workflow 45877375277. The later guide changes require their own run.

- Added missing Open Graph/Twitter text metadata on hub, Foundation, Run Strong, Keep Moving, Push-Up and 5K; updated local-storage copy on relevant pages. Existing images retained; new 1200 × 630 PNG sharing cards added for the hub and 5K.
- Added a focused Gamer Fit source/browser report to CI. It inspects full HTML locally, isolates first-party traffic, checks initial navigation and overflow at 320/390/1366 px, and records local throttled timing. Report passed in run 45877853005: 1,112,980 source bytes, 189,096 gzip bytes, 11,701 DOM elements, zero overflow at all three widths, 199–243 ms local load and 5,747 ms uncompressed local transfer at simulated 1.6 Mbps. Not production or physical-device measurements. First-entry text and workout reviewed; full chapter-by-chapter human editorial review remains open.

- Removed unused hub coaching styles and standardized local storage copy across Keep Moving and Pull-Up. Added contextual links for strength training and glute-plan integration. Hub, 5K and glute sharing metadata/copy updated.

## Stable-baseline verification and open work
- Verify the final commit's Actions results and sharing images on real platforms. No final pass is claimed until the workflow completes.
- Full Gamer Fit chapter-by-chapter manual review and production/mobile performance remain open; no urgent rebuild indicated by the local report.
- Further guide-specific copy changes should be driven by independent reader feedback rather than repeating the same audit.
- Physical phone timers, sound, screen lock, watch/manual-recording feasibility, certificate printing, downloads and restoration.
- Manual assistive-technology, font scaling, full demo playback, independent beginner and 50+ reader testing.
- Defer 5K manual recording and major algorithm changes until reader/device testing identifies the need. Additional simulations belong to that separate feature work. The current timer tracks individual phases; import validation enforces recorded time and completed phases. Manual recording must preserve phase bounds, effort, symptoms, next-day recovery, and honest self-reported provenance. Do not credit planned duration as completed or automatically award a certificate based on an unverified distance/time entry. Treat a future manual path as separate tested functionality.
- Verify CI and deployment against the actual revision; do not confuse earlier passing runs with new tests. Do not claim clinical validation or independent user feedback.

No physical-device or human verification was performed in this follow-up.

## Persistent homepage layout rule
- Foundation Training always appears first in the main training-guide collection. On the two-column layout it spans both columns only when the number of cards in that collection is odd; when even, it uses the same width as other cards. Keep its featured styling in both cases. Mobile remains single-column. This rule is automatic in CSS and covered by the hub release test; do not manually add a wide-card class when publishing new guides.
