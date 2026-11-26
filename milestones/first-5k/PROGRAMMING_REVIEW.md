# Your First 5K — programming review handoff

Updated November 26, 2026. Development branch only; no public guide changes.

## Current model
- Two independent targets: running-bout duration and distance endurance.
- Two or three nonconsecutive sessions, based on recent running exposure. Third day redistributes running time.
- Four-week review cycles; no fixed completion deadline.
- Easy effort first; current performance supports optional goal pace later.
- Distance or personalized duration cap, whichever comes first. Use comparable recent measured outings. Mixed outing distance is not running-only distance.
- If a distance increase triggers a caution, try a smaller increase or a familiar running dose with additional walking. A caution is not a safety guarantee.
- If goal pace is not supported, continue the normal endurance review rather than stalling.
- Recovery, symptom and missed-session rules are draft coaching decisions, not diagnostic criteria.

## Goal acknowledgment — interface requirement
Heading: Let's build toward your goal.

Your workouts will start at a pace that fits your current fitness. As you progress, we'll revisit your target pace and begin working toward it when your training supports it. You can keep your original goal or change it at any time.

Acknowledgment: **Got it. Keep my goal.**

Display only when optional goal pace is deferred. Persist acknowledgment per goal revision; do not interrupt every workout. Allow editing the goal. Recheck eligibility as recent training changes. Acknowledgment never overrides pace or symptom safeguards. Avoid calling the person's goal unrealistic or implying the coach knows their ultimate potential.

## Verification
Re-executed committed engine and test source: 12 profiles and 29 additional checks; 0 failures. Profiles 08 and 12 now cover 12 weeks. Both advance rather than being blocked solely by the original distance-warning or pace-goal problem. These are scripted scenarios, not predicted completion times or clinical validation.

## Remaining
- Confirm primary finish goal and certificate eligibility
- Resolve repeated weekly load-limit holds with smaller intermediate prescriptions
- Test end-to-end completion from all entry points and actual schedule changes
- Integrate re-entry, safety holds, frequency transitions, pace substitutions, goal acknowledgment and completion into persistent session state
- Complete programming, research, accessibility, device and beginner gates

## November 26 — workload fallback and full journey audit

Version 4 adds smaller intermediate prescriptions for workload/distance holds, and allows generated prescriptions to progress beyond their original library IDs. Original 12 profiles and 29 boundary checks pass when re-executed. The ambitious pace scenario progresses rather than stalling, with weekly prescribed running increasing from 40 to 51.25 minutes over 12 weeks in the scripted case. See SIMULATION_RESULTS.json.

Six exploratory full journeys use different walking and running speeds, stop at the prescribed distance or duration, and simulate missed training and goal switching. See test-journeys.cjs and JOURNEY_RESULTS.json. Only one reaches its selected 5K in the 80-week horizon (existing 30-minute runner at week 35). The remaining five progress but remain incomplete. These are deliberately scripted outcomes, not actual human timelines. Do not present this as ready for implementation or clinical validation.

Next: simplify the interaction between weekly review, alternating progression, repeat requirements, and four-week holds; use session-level progression with global rolling exposure checks, and ensure demonstrated running rhythm can transfer to the long outing at comparable volume. Four weeks is a checkpoint, not a compulsory hold. Do not relax symptom/recovery rules. Run full journeys again before UI work. Current pace acknowledgment remains documented and not integrated. Re-entry in exploratory harness is manually applied, not a tested persistent application flow.

## Session-based research review (November 26, 2026)

Evidence: Buist et al. randomized novice-running trial https://pubmed.ncbi.nlm.nih.gov/17940147/ (no injury reduction from 13-week graded versus 8-week program; does not validate faster progression). 2025 cohort https://pubmed.ncbi.nlm.nih.gov/40623829/ and https://bjsm.bmj.com/content/59/17/1203 (single-session distance spikes associated with overuse injury; observational, not a safe threshold; participants with exclusively <500 m or >100 km sessions excluded). Small novice trial in adults with obesity https://pmc.ncbi.nlm.nih.gov/articles/PMC6253747/ (population-specific starting dose evidence). CDC talk test https://www.cdc.gov/physical-activity-basics/measuring/index.html. Established program benchmarks: https://www.nhs.uk/better-health/get-active/get-running-with-couch-to-5k/couch-to-5k-running-plan/ and https://www.nonetorun.com/12-week-beginner-running-plan. Competitor schedules are not comparative efficacy trials. Exact thresholds in session-engine.cjs are experimental coaching choices, not validated injury-prevention rules.

New files: session-engine.cjs, test-session-engine.cjs, SESSION_RESULTS.json. Prior engine retained. Latest run: 7/8 boundary checks and 1/6 journeys completed; established 30-minute slow runner completed at simulated week 17 rather than 35. Other journeys stalled. Comparable-exposure test still fails; diagnose before accepting this engine. Audit actual rolling volume, walking-to-running transition, and lane transfer. Frequency change and full persistent session state are not implemented in the new candidate. No human adaptation estimates, no release gate passes, no public changes.

## Session candidate — progression corrections

Corrected initial walk-to-run rolling limit, shrinking introductory running dose, and the comparable-exposure test schedule (the old test inadvertently placed three runs in a seven-day window). Extended comparable successful evidence window from 14 to 21 days, added library-guided and generated interval candidates, improved rhythm transfer and made run-walk practice retain familiar bouts around three minutes rather than requiring continuous running. These are provisional coaching/software decisions, not validated thresholds. Latest six scripted journeys complete at weeks 45, 40, 49, 5, 29, 55 respectively, with 8/8 boundary checks. Run-walk completions include walking. No clinical efficacy or projected human timelines. Some completion records exceed 5 km because practice sessions lack distance stop; long-outing lane still lags practice. Three-day request is not an implemented transition. Next: audit dose efficiency against published beginner benchmarks, improve lane coordination, add regression checks for distinct goals, explicit 5K attempt stopping, scheduling and persistent state. Do not publish.

## Reference programming redesign — November 26, 2026

The approved approach uses original 15-week reference pathways with adaptive bridges, not a forced deadline. Benchmark sources: https://www.nhs.uk/better-health/get-active/get-running-with-couch-to-5k/couch-to-5k-running-plan/ (three days, first-week running 24 min, final continuous duration 30 min); https://www.nonetorun.com/12-week-beginner-running-plan (three days, first session 8 x 30 seconds running with 2-minute walking, final continuous duration 25 min; full intermediate schedule not verified); https://www.halhigdon.com/training-programs/5k-training/novice-5k/ (eight-week distance-based program). Schedules are benchmarks, not comparative efficacy evidence. See prior research notes for trial and observational evidence; no precise safe load rate established.

Files: reference-engine.cjs, test-reference-engine.cjs, REFERENCE_RESULTS.json. Four 15-row reference pathways, with two-day plans omitting the easy slot rather than compressing it. Early run-walk and continuous prescriptions overlap, then run-walk retains familiar bouts around 3 min while continuous extends sustained running. Five-minute warm-up and three-minute cooldown are additional to main workout. Exact doses and thresholds are coaching proposals.

Latest execution: 7/7 scripted journeys reached exactly 5000 m, 11/11 initial checks passed; completion weeks walking foundation 19, three-day request run-walk 14, continuous 17, established slow runner 6, goal change 19, interrupted 18, two-day run-walk 12. These are software traces with assumed recovery, not human outcomes or promised timelines. Distance limit and completion state now implemented in prototype; UI not implemented. Week 2 longest main outing corrected to 16 min. Two-to-three-day transition moves backward to a lower reference row, which delays progress. Goal switch currently resets to no later than row 4, not a history-based reassessment. Continuous bridges need audit. Important additional blockers: no full rolling load audit, robust persistent recovery/re-entry testing, extension beyond row 15 for slower participants, or real distance measurement integration. Goal pace acknowledgment state exists but pace-specific prescription not integrated into reference candidate. All release gates pending. No public changes.

## Running calculator and goal reassessment

Shared browser/CommonJS module `shared/running-calculator.js` accepts distance in m/km/mi, duration, average pace per mile/km, and speed mph/kmh. Supports one known quantity without inventing missing information, or derives the third from two. Preserves input provenance and recording context (running-only, run-walk, whole session; elapsed/moving; surface). Conflicting measures beyond 3% prompt correction; this is a software tolerance, not wearable accuracy evidence. Constant-pace splits are arithmetic, not race predictions. Do not infer endurance from pace-only or short efforts. No wearable integration or automatic sync.

Goal reassessment now selects the highest supported reference row using two recent seven-day windows with at least two recovered running days each, weekly running exposure, maximum running time, bout and main duration. Time-only edits preserve the current row and index. Optional comfortable assessment duration is bounded by demonstrated recovered bout (2, 5, 10, 20 minutes); no assessment duration if pain hold or no supporting exposure. Assessment should replace part of a familiar workout. Assessment workout execution, normalized data ingestion and recovery-based acceptance remain unimplemented. Initial history retained. Four-week review calculates actual running time, total activity, completed sessions, longest recovered bout and measured distance, plus weekly totals. UI requirement: `Explore my running numbers` collapsed by default; no analytics required for workout progression. `Look how far you've come` review shows actual work and progress, not speed-only success.

Verification: initial reassessment fixture had three days in one window and one in the other; corrected to two in each rather than relaxing eligibility. Final 22/22 assessment/calculator checks, 11/11 reference checks, all seven journeys complete at unchanged weeks. Goal-change journey still takes 19 simulated weeks; improved history selection is not evidence of faster progression. Remaining frequency redistribution, slow-runner extension, rolling load and persistent state audits, actual browser integration and optional pace prescription. No release gates passed; public site unchanged.

## Frequency and endurance extensions

Implemented in reference-engine.cjs: after two recent weeks of recovered running, eligible two-day participants split the familiar practice dose across two sessions while retaining the longer outing and reference level for a transition cycle. Counts extra eight minutes of warm-up/cooldown. Next ordinary reference cycle still needs actual rolling-load audit; preserving the split dose alone does not validate subsequent increases. Endurance extension after final reference row: two recent recovered long outings at current duration permit a proposed 1–3 minute increment (8% rounded down to 30 s, bounded 60–180 s); shorter reference sessions remain stable. These are provisional coaching settings, not validated safety thresholds. Added 55-minute continuous and approximately 69-minute run-walk finish scenarios; both reach exactly 5000 m at simulated weeks 14 and 19. Previous seven journey timelines unchanged, including 17-week continuous beginner and 14-week three-day vs 12-week two-day run-walk beginner. Latest checks: 15/15 reference and 22/22 assessment; nine journeys complete. No claim of efficiency improvement for existing profiles. No human validation or browser testing. Remaining rolling-load and re-entry audit, unmeasured distance behavior, explicit goal pace integration, assessment lifecycle and browser guide. Public site unchanged.

## Rolling workload and recovery audit candidate

Separate `workload-audit-engine.cjs` retained alongside existing reference engine. Actual prospective seven-day exposure includes incomplete work, counts sessions, and compares running and total duration against prior seven days and two-week average. Proposed budget allowances are coaching/software heuristics (30% with bounded absolute increments), not validated safe load thresholds. Truncates familiar workouts when budgets are exceeded. Recovery reductions based on recovered lane records; multi-session recovery counter; pre-session fatigue and symptom context, duplicate/out-of-order log rejection and basic strategy validation. No clinical validation. Existing 15 reference and 22 assessment checks passed; 14 dedicated edge tests passed (test-workload-audit.cjs and WORKLOAD_EDGE_RESULTS.json). Nine scripted journeys reach 5000 m but completion weeks now 22,17,21,7,24,30,15,15,19 versus 19,14,17,6,19,18,12,14,19. Main regression: recovery and budget bridges do not advance lane/index and can repeat unnecessarily, especially interruptions. Need to test full recovery cycles, context persistence, invalid records, actual rolling workload sequences and unmeasured journeys; current edge checks are targeted, not exhaustive. Preserve working reference engine until improvements pass. No UI or public changes.
