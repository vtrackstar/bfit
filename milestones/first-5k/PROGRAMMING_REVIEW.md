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
