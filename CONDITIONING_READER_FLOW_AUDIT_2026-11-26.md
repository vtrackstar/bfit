# Conditioning reader-flow audit checkpoint
2026-11-26 | Preview only, no deployment.
## Source walkthrough and changes
- First-time route: select goal/activity, setup, baseline, time, existing load and safety answers; save; check today's recovery and screening; open timer or manual workout; confirm actual activity; save; return the following day to report recovery.
- Added calendar Move day control for due/upcoming slots, using same-week engine constraints. Plan feedback explains existing dates are edited through the calendar.
- Added historical block selector and comparable-output display (requires suitable records; current feedback UI still lacks optional output entry).
- Expanded friendly messages for incomplete setup, mismatched slot/dose, already-trained-today.
- Existing pre-start symptom/pain holds remain persistent; backup cannot overwrite existing exercise/safety history in normal preview controls.
## Actual test setup
- Local runtime has Node 22 and Playwright, but GitHub DNS/network retrieval failed; connected GitHub source is accessible separately.
- Added development/conditioning/preview/browser-flow.mjs, using real Chromium, local HTTP server and fictional date/records. Checks ten chapters, phone-width horizontal overflow, manual workout, next-day recovery, date move, download/restore, timer pause/reload/resume/symptom stop, pre-start symptom persistence, page errors.
- Added .github/workflows/conditioning-preview.yml: actual Node ESM suites and Chromium journey, read-only, no deploy.
- Opened [draft PR #21](https://github.com/vtrackstar/bfit/pull/21) against main to trigger test CI; do not merge or mark ready before release approval. Initial workflow lookup returned no runs. PR initial mergeable=false; investigate mergeability/workflow if it remains blocked. Browser tests have NOT been observed passing. Prior 252 combined-JS checks still last verified full logic count; revised preview JS body parsed, no DOM execution.
## Remaining reader issues
- Plan form is long and shows some irrelevant options; simplify into staged beginner flow, activity-specific controls, plain safety screening with appropriate advice.
- Add clear short-on-time/recovery options, output input and measurement units, manual early cooldown, correction and rescheduling beyond same-week constraints if approved, profile and backup validation, storage errors/coordination.
- Need actual Chromium/Node results, mobile screenshots, accessible keyboard/screen-reader checks, iPhone Safari and other real-device tests, independent beginner, actual demos, diagrams/interaction, final cross-guide and claim/link review, clinician-directed return pathway. No publish until release gates and explicit approval.

## Actual CI result (supersedes initial pending status)
[First CI run](https://github.com/vtrackstar/bfit/actions/runs/45901533597) reached Node 22 ESM, failed in advanced.test.mjs with ReferenceError: steadyGate is not defined in workflow.mjs. Browser step skipped. Added the missing named import in commit 1a424700a6805038667ee410ecad0cdafaa3e941. Source review also caught an unimported private appEq helper in app-state.test.mjs, replaced with local equalJSON in 9ffe5f248df1f26c8e22c8e5a27c0396fd6783e8. Subsequent CI had not yet reported a confirmed pass at this checkpoint. Do not equate prior combined-JS test counts to real ESM or browser passes. No merge/deployment.
