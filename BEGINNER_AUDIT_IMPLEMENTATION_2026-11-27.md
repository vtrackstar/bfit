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
