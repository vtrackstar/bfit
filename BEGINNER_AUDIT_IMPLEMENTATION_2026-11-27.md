# BFit beginner-first audit implementation ledger

Owner approved the independent audit recommendations and coaching nutrition reordering. No changes to training algorithms, storage schemas, IDs, coaching prices or intake status without separate justification. Progress is an editorial estimate, not elapsed time.

## Recovery checkpoints
- Baseline: 8dae7bfd21e38463366fb8f7e86c6ebfaad38ca8. Full smoke 46038997536, Mobility checks 46038503478 and Pages 46038996777 passed.
- Batch 1: 6f1d3254cf99b5e959a743dd0f95d60e533bd2a3. coaching/index.html, scripts/editorial-smoke.mjs. Nutrition support → interactive dashboard → professional scope, then onboarding/prices/qualifications. Pages 46040274129 passed; smoke 46040274749 failed.
- Batch 2: 8236578fd02e0d64cff519ea6dbc4cda0f218d78. exercise-library/index.html, app.js, scripts/audit-exercise-library.mjs. Discovery filters, card labels and visible safety; no catalog changes. Pages 46040351254 passed; smoke 46040351524 failed at same two coaching tests.
- Batch 3 (this commit): coaching/index.html, scripts/beginner-entry-flows.mjs, this ledger. Both failures traced to changed nutrition link/summary selectors and old nested dashboard expectation. Restore contextual links from training spreadsheet and nutrition support, update tests to use stable IDs and the new independent nutrition disclosure; retain keyboard interaction, food calculation, mobile overflow and deep-link checks. Await new CI; do not treat deployment alone as verification.

## Remaining backlog
1. Reconcile nine identified catalog records in Living Master, approved copy, catalog.json and embedded snapshot: 00002, 00012, 00013, 00017, 00018, 00019, 00020, 00088, 00095. Preserve all 231 published IDs and unapproved records. Rows 3,13,14,18,19,20,21,89,96 in both sheets verified by ID. No sheet writes made yet. Review all other entries for language separately. Test library filter results and reset/deep links; heuristic filters are discovery aids, not equipment guarantees.
2. Mobility, Build Your Mobility and Gamer Fit: standalone quick routes, terminology, exact movement cues, timing, combined workload, foam roller table, optional eccentric practice. Preserve links/IDs and progression.
3. Conditioning education and workout: everyday questions, optional science, simpler setup and storage copy, unsupported activity visibility, safety.
4. Foundation and Athleticism: defaults, equipment, workout notation, sport context, readiness and load rules.
5. Run Strong, all three milestones: effort, pace, recording, equipment, timer limitations. No manual 5K recording feature in editorial pass.
6. Keep Moving all four pages, Weekend Warrior, Build Your Glutes: everyday terms, first-session access, equipment, restrained coaching references.
7. Hub: collection distinction, goal-based descriptions, integration, automatic Foundation parity, back-to-top. Coaching: verify reordered nutrition and prices.
8. Global terminology, independent-reader and physical-device checks, media verification, final regression and re-audit. Do not claim human testing without evidence.

## Resume procedure
Read latest main SHA and workflow runs, inspect failed job logs before further edits. Use small guarded commits against expected head; do not force push. For each batch record files, exact parent and new commit, tests and deployment outcomes, scope and remaining issues. If a regression persists, isolate or revert the affected batch rather than overwriting unrelated concurrent work. Maintain catalog source parity, verify row IDs and cell metadata before writes, read back changed cells and compare snapshots. Update this ledger as work proceeds.

Estimated implementation progress: 15%; two feature batches published, regression repair pending verification. No independent physical-device or reader test completed.

## Batch 4 — targeted catalog corrections
Parent 29ea59ff04d0f69b677a1b535bdd9e083bb534bd: smoke 46040807224 and Pages 46040806989 passed. Nine records updated in canonical master, approved copy, JSON and embedded snapshot. All IDs, approval states and unapproved records preserved; no demonstration approvals. Publication timestamp 2026-11-27T17:25:00.000Z. Readback and release checks required; remaining full catalog review outstanding. If rollback needed, restore the nine changed fields from parent and matching spreadsheet rows, including approved-copy publication timestamp.

## Batch 5 — coordinated mobility language and independent use
Parent 2779f9ad4a60f3778a63c19e8c186ca5fa7a53c3. Library Pages 46041322375 passed; smoke 46041322632 pending at start. Mobility: practical entry, plain movement terminology and workload guidance. Build Your Mobility: default route labels and explanation, clearer saving and alternative-to-Gamer-Fit guidance; engine and stored settings untouched. Gamer Fit: five-minute starting example, foam roller row repair, plain labels and glossary alignment, alternative workout guidance. No exercise IDs, workout dosage rules, or data formats changed. Verify all three standalone, cross-links and full regression. Catalog full review remains open.

## Batch 6 — conditioning language and entry clarity
Parent 42cfab6dfc51610435c1fcb9e30cf85b446bae14. Educational guide: practical entry, ordinary-language labels before physiology, gradual warm-up explanation and direct companion links. Workout builder: clearer goal options, optional advanced preferences, preview and backup explanations, no misleading swimming instructions. Existing hidden swim fields, validation, goal values, safety and workout logic unchanged. Verify regression tests; earlier catalog and mobility tests may still be running. No independent human testing completed.

## Batch 7 — Foundation, Athleticism and Run Strong
Parent 2fcc872a20454a8af0a5f143014a8a8684af01fb. guides/foundation/index.html: 8 targeted edits; unmatched replacements: []. guides/athleticism/index.html: 9 targeted edits; unmatched replacements: []. guides/run-strong/index.html: 7 targeted edits; unmatched replacements: []. Plain-language starting schedule and equipment, workout notation, jump contacts, agility and pace. Training data, navigation IDs and engine settings unchanged. Prior catalog smoke 46041322632 and mobility smoke 46041687570 passed; conditioning verification pending at prior check. Await full tests for this batch.

## Batch 8 — milestone language
Parent 0e22a8770a252c8addec72a77dc9df6600a431c8. Conditioning production 46041775288 and full smoke 46041775390 passed. milestones/first-push-up/index.html: 6 edits, unmatched []; milestones/first-pull-up/index.html: 5 edits, unmatched []; milestones/first-5k/index.html: 4 edits, unmatched []. Effort labels, grip, assistance, reps, reset and timer limitations. No engine, certificate, timing or persistence changes. External timing remains unsupported for automatic logging; no manual-recording feature added. Await regression and deployment.

## Batch 9 — specialty program usability
Parent 85a40463a7784bfda337f93dc1bbf9fd7059a091. guides/50-plus/index.html: 4 edits; unmatched []; guides/50-plus/activities/index.html: 6 edits; unmatched []; guides/50-plus/plan/index.html: 3 edits; unmatched []; guides/50-plus/progress/index.html: 3 edits; unmatched []; guides/weekend-warrior/index.html: 6 edits; unmatched []; guides/build-your-glutes/index.html: 6 edits; unmatched []. Everyday terminology, equipment identification, starter workout clarity and reduced repeated coaching promotion. No exercise programming, navigation, timers, storage or safety rules intentionally changed. Review unmatched items and run regression before declaring verified.

## Batch 10 — hub and durable editorial policy
Parent 07e308662ef66f33ef84b289e6e803f095221e87. Milestone smoke 46042255732 and Foundation/Athleticism/Run Strong smoke 46042112415 passed; specialty Pages 46042479589 passed but smoke 46042480508 failed because progress page lost coaching destination and Premium/Elite names. Restored a short optional footer link without promotional paragraph. Hub: clarify four collection purposes and Conditioning integration, keep existing parity, scroll and back-to-top logic, free mission and coaching explanation. README points to permanent editorial standard and this ledger. Await full regression. Full catalog review and manual reader/device verification still outstanding. Estimated editorial implementation 85%.

## Batch 11 — catalog search and equipment filter repair
Parent 9a40437046c2db8e3c813d41cc4ded43e0a086cf. Found literal backslash in whitespace regex; repaired actual multiword search. Home filter now excludes entries requiring named external equipment rather than matching floor/bench alone. Added browser assertions for multiword search and equipment-free incline vs loaded squat/floor press. Conservative heuristic remains; it may omit some home-friendly optional equipment entries. No catalog records or spreadsheets changed in this batch. Targeted catalog wording and equipment field corrections remain to be made after review; no claim of complete catalog audit. Latest prior Pages 46042685121 passed; smoke 46042685695 pending at inspection.

## Batch 12 — second catalog correction pass and 50+ link repair
Parent f86823838a400385959a6a67d83697e34d2d16a1. Reviewed published movement steps and equipment; targeted 24 records: BFIT-00016, BFIT-00029, BFIT-00034, BFIT-00037, BFIT-00039, BFIT-00041, BFIT-00043, BFIT-00051, BFIT-00064, BFIT-00065, BFIT-00071, BFIT-00076, BFIT-00077, BFIT-00084, BFIT-00094, BFIT-00103, BFIT-00104, BFIT-00106, BFIT-00116, BFIT-00117, BFIT-00141, BFIT-00205, BFIT-00224, BFIT-00225. Correct complete movement instructions, hip movement distinction, equipment, grip, safe setup, units and sport terminology. Stable IDs, approvals, schema and draft exclusion retained. Canonical master and approved feed must match prepared JSON before main update. Restored short optional coaching link on 50+ plan page after 46042685695 failure. Library search/filter regression pending. Remaining manual demo/reader checks not completed; no claim of exhaustive expert review of all fields.
