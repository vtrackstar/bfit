# BFit prelaunch handoff
**Prepared:** November 10, 2026  
**Current phase:** Free guides available; paid coaching intake paused; hard launch deferred until account/storage access is restored and release checks pass.

## What is live

- Hub: https://vtrackstar.github.io/bfit/
- Foundation: https://vtrackstar.github.io/bfit/guides/foundation/
- Athleticism: https://vtrackstar.github.io/bfit/guides/athleticism/
- Gamer Fit: https://vtrackstar.github.io/bfit/guides/gamer-fit/
- Run Strong: https://vtrackstar.github.io/bfit/guides/run-strong/
- Exercise & Movement Library (separately hosted): https://bfit-exercise-movement-library.balouissaint.chatgpt.site/
- Coaching status (stable route): https://vtrackstar.github.io/bfit/coaching/

**Source of truth:** `main` in `vtrackstar/bfit`. Earlier Drive HTML candidates and `CURRENT` files predate the GitHub source. Do not use them to overwrite the deployed site. Do not change its origin lightly: browser-saved workouts/preferences may be tied to the current origin.

**Safe restore point:** The pre-cleanup source was commit `5f52ea436d29bb8412b35657a29da729069ea657`. All work remains in Git history. No older assets, programs, or Google Drive files were deleted.

## What is finished

- [x] One public hub with four usable guides, return-to-hub navigation, and future-program cards clearly marked Coming Soon
- [x] Automated tests of responsive layouts (320px–1366px), basic navigation, accessibility checks, and the primary workout/download paths
- [x] Athleticism workload reconciliation and program-summary automated checks
- [x] Master exercise ID audit: 226 distinct IDs referenced by the four guides, with no missing IDs in the catalog at time of review
- [x] Representative signed-out library deep-link browser tests for Goblet Squat, A-Skip, Easy Run, Short-Lever Copenhagen Hold, and Single-Leg Hop-and-Stick
- [x] A stable coaching-availability page, so visitors are not sent directly to a closed Google Form
- [x] Current site source and launch instructions kept in GitHub instead of uploading new large copies to Drive

## What is on hold

### Account access and coaching inquiries

- [ ] Restore the intended Google account storage plan/available quota. The storage issue is user-reported; it has not been independently established as the reason the form closed.
- [ ] As the form owner, open Google Forms and turn on **Accepting responses**. The public form last showed **no longer accepting responses**.
- [ ] Check current offer names, exact prices, calls, limits, and terms in the form against the public coaching copy. **Do not assume older pricing is correct.**
- [ ] Run one real, explicitly labeled test response for each relevant form path (Premium, Elite, inquiry call), using an address you control. Confirm response capture and Zapier routing.
- [ ] Verify automated emails, notifications, delivery, timing, duplicates, and booking links. No payment or enrollment should run before someone knowingly accepts the terms.
- [ ] **Only after these checks:** update `coaching/index.html` to say inquiries are open and link to the verified form. Update the paused-page assertion in `scripts/audit-site.mjs` and `scripts/hub-release.mjs`. The hub and four guides can keep linking to the same coaching page.
- [ ] Confirm the public form works signed out and on a physical phone.

### Training and exercise references

- [ ] Finish a movement-by-movement demonstration audit. A valid exercise ID or an open website does not mean an exact video or technique variation is approved. Preserve IDs, variation names, and credits.
- [ ] Check the actual guide-to-exercise variation and any videos/media on real devices for high-priority movements. The master catalog had 228 canonical entries in the November 10 read; the separate public library reported 226 entries. Investigate the difference before claiming full catalog parity.
- [ ] Have 3–5 new readers use the site without instruction. Ask them to find a guide, start one workout, understand the sets/reps or running effort, save/download, and return to the hub. Include a beginner and a recreational athlete.
- [ ] Spot-check mobile browser saved-state, exports, print/PDF, accessibility with screen readers and keyboard, and low-memory phone performance, especially Gamer Fit.

### Website and promotion

- [ ] Inspect the current GitHub Actions workflow for a green site-smoke-test run and a successful GitHub Pages deployment.
- [ ] Check Instagram, TikTok, Twitch, and the public Discord invite manually signed out. An automated HTTP 429 on Instagram is not proof that the profile is unavailable.
- [ ] Decide whether to use the current free GitHub Pages domain or purchase/configure a custom domain. Moving domains may change local saved-data behavior.
- [ ] Confirm contact information, coaching conditions, and any legal/privacy notices that apply before paid promotion.
- [ ] Approve the final launch announcement and switch the coaching availability page to open. No automatic promotion is scheduled.

## Google Drive housekeeping

Shared folder: https://drive.google.com/drive/folders/1-JNlq8lrPmdR51hAfivRW4uMMjk2IpTn

The November 10 folder read returned **47 top-level items**, including older guide candidates, zip handoffs, the shared `START_HERE_BFit_Guides.txt`, and dedicated subfolders. A number of Athleticism versions coexist by design. They are historical records and should not be treated as current website source or deleted merely because their names include `CURRENT`, `CANDIDATE`, or `ARCHIVE`.

**No Drive files were deleted, renamed, moved, or duplicated.** With storage capacity unresolved, keep new working notes here in GitHub. After access is restored, compare backups by date and hash, decide which to retain, and archive or remove duplicates only after confirming a safe backup.

## Release acceptance

**Free-resource launch:** Fine to share privately or as a soft launch, subject to your own real-device review.  
**Paid coaching and hard launch:** Hold until the application can accept responses and the end-to-end follow-up works. Do not call the video library fully verified until demonstrations are reviewed.

## Existing QA references

- [GitHub Actions](https://github.com/vtrackstar/bfit/actions)
- [Earlier launch audit](LAUNCH_AUDIT_2026-11-04.md)
- [Training and first-reader audit](TRAINING_AND_BEGINNER_AUDIT_2026-11-05.md)
- [Coaching funnel QA](COACHING_FUNNEL_QA_2026-11-05.md)
