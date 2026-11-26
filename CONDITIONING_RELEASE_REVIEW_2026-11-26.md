# Conditioning Training — release review packet
November 26, 2026 | Development candidate only | Owner review required

## Verified baseline
Latest observed test head: f3ef7e27f6e19524395c557b763fb861ffaffffe.
- Actual Node checks: 273/273.
- Chromium: six test groups passed, including 320/390/1366 px, next-action focus, manual workout/recovery, calendar move, backup restore, timer pause/reload/symptoms, early cooldown and measurement, and education isolation.
- Conditioning CI: https://github.com/vtrackstar/bfit/actions/runs/45904348211
- Existing hub smoke: https://github.com/vtrackstar/bfit/actions/runs/45904348212
- Static navigation: 69 unique IDs; zero missing static destinations; all nine related BFit paths match main.
- GitHub draft PR #21 is open, unmerged, and mergeable as checked. Branch ahead 147, behind 2 at that point. All compared changes are development-only additions. Main remains the production source. No hub card or production route installed.

## Independent beginner walkthrough
Ask 3–5 readers (at least one new exerciser, a recreational athlete, a person who prefers non-running cardio) to use a test preview. Give no navigation hints. Use fictional exercise records; no actual training, symptom provocation, or personal health data required. Record anonymous participant label, device/browser, completion without help, time or hesitation, confusing words, and exact intervention. These are usability tasks, not evidence of improved fitness.
| Task | Expected behavior |
| --- | --- |
| "You get tired quickly when walking or cycling. Choose a guide and explain your goal." | Conditioning for stamina/repeated efforts; First 5K for distance milestone; Run Strong for running pace/race preparation. |
| "You can comfortably pedal for 5 minutes, have 20 minutes, and can train twice a week." | Complete five-step setup; understand that training days and whole-session time include warm-up/rest/cooldown; no advanced specialization required. |
| "Show me the first session and tell me what you would do." | Today's recovery/safety check; explain effort, activity, warm-up, main work, cooldown; use movement help and return. |
| "Pretend you stopped earlier than planned." | Manual partial record or timer early stop; do not credit unperformed time. |
| "Tomorrow you feel more tired than usual." | Recovery report is easy to find; no automatic progression. |
| "Your work schedule changed." | Same-week calendar move; no catch-up doubles; next date remains obvious. |
| "You lost track of the guide while reading." | Contents, Back to top, next-action shortcut, hub links easy to locate. |
| "Why might shortening your rests change a workout?" | Explain the educational comparison without interpreting it as a new prescription. |
| "You reported concerning symptoms in a fictional test." | Stop, appropriate assessment guidance, no automatic resumption after reload/backup. No actual exertion or medical clearance test. |
| "Save a copy of your work and try a clean test browser." | Download/restore test history; no overwriting existing safety history. |

Pass criterion: no blocked core task, no safety bypass, no repeated confusion about what to physically do next. Fix issues and retest with fresh readers. Do not record medical details in public GitHub.

## Actual device review
Test at least one real iPhone Safari and Android Chrome; record OS/browser and observed results. Use fictional records. For local setup see preview README; a secure test origin may be required on mobile.
- Read at default and enlarged text; no sideways page scroll, obscured controls, clipped labels, or unreadable tables. Check portrait and landscape.
- Verify keyboard focus, screen-reader labels, contents collapse and browser back history; use VoiceOver/TalkBack if available. Desktop emulation is not a substitute.
- Check timer pause, background, lock/unlock, returning next day, interruptions, recovery extension, manual fallback and actual-only totals. Do not assume sounds, wake lock or background timing are implemented.
- Download and restore a fictional backup, test corrupted backup rejection and existing record protection, try storage disabled and two tabs. Do not claim tamper-proof local history.
- Open every circuit resource: chair stand NHS illustration, marching NHS, countertop push-up short, supported step-up Physitrack. Confirm playback when offered, right variation, clear attribution, return to guide. Written instructions remain available.

## Safety and data scope before publication
Obtain appropriate qualified clinical review of screening, warning/pain/illness guidance and conservative post-assessment log-only route. Obtain aquatic specialist review of swim prerequisites, familiar stroke/length, session time and water safety. Until reviewed, do not represent guide as medically validated. Current automated restart after warning is intentionally disabled. Do not add a self-clear toggle. Consider excluding or disabling modes that cannot be appropriately reviewed before launch.
Open software limitations: actual-time correction/undo, multi-tab coordination (conflict checks are not atomic), browser clearing/deletion and unverified backup provenance; no exact background timing assurance. Decide whether limitations are acceptable for an initial release or require fixes. User approval alone is not clinical validation.
## Integration plan (not executed)
- Use the current main revision, not stale files from branch; check diff and mergeability again. Preserve all existing live paths, saved data, prices, intake status, socials, and evergreen Coming Next.
- Stage the guide at proposed guides/conditioning/ with colocated production runtime modules and correct relative imports. Keep the development preview distinct; retain preview storage namespace rather than automatically transferring fictional records into the production guide.
- Add the approved card after Run Strong in the main Training Guides grid. Update catalog README, sitemap, public-link list, changelog and release checks; maintain separate horizontal rows for plans/milestones. Add production metadata and canonical URL; remove noindex only when intentionally public. 
- Run Node/Chromium and existing hub smoke against production path on a release branch. Verify no accidental publication of duplicate draft/preview routes, no test data, no missing imports/anchors or stale catalog entries.
- Explicit owner release approval, then merge and verify GitHub Pages deployment, real live URLs, navigation, and rollback plan. Do not merge PR #21 as-is or deploy an unreviewed preview.

## Decision at this checkpoint
Software verification complete for the tested revision. Human/device/video and clinical/aquatic reviews are outstanding. No production integration or publication authorized. Next is a hands-on review of this candidate, then fix concrete issues rather than repeat speculative audits.