# Conditioning development preview
Not deployed. The repository/branch may be publicly readable; noindex is not privacy or access control. Use fictional records only until release gates close.
From repository root, check out conditioning-guide and run:
```sh
python3 -m http.server 8000
```
Open http://localhost:8000/development/conditioning/preview/ in a local browser. Do not open as file://, because JS module imports need HTTP.
Run actual Node ESM suites from repository root:
```sh
for test in development/conditioning/*.test.mjs; do node "$test" || exit 1; done
```
## First preview
All ten revised chapters, optional-depth disclosures, FAQ, responsive BFit styling, table of contents and direct plan/workout/progress links. Setup, scheduled-day workout, explicit phase timer, manual actual-record inputs, next-day recovery, skip, outside activity, rollover, current block report, backup download/restore and storage adapter connected to engine. Pre-start warning/pain creates zero-work safety hold (not attendance). No automatic clinical restart; warning hold retained. Restore disallowed over existing activity history/active session in preview.
## Verified
Re-fetched saved sources; 252 combined-JS assertions passed; static named imports/export uniqueness, preview JS body syntax, 30 unique static HTML IDs and 56 local anchor links checked. Not actual Node ESM, DOM, browser, physical-device or CI tests. No screenshot/layout verification. 
## Remaining before release
Browser/device testing and usability audit; actual Node and CI; clinical restart pathway, safety copy and clinician review; explicit current limitations of unknown medical suitability, missing/stale readiness and late recovery; stronger profile/backup/actual time validation and safe corrections; profile and active record reload edge cases, atomic cross-tab locking, error recovery; manual early cooldown after partial phase unsupported, circuit movement demos, swim stroke and time cap, reschedule control, previous-cycle selection/comparable-output display, recovery feedback update/correction UI, user-friendly plan editing; illustrative science diagrams and comparison interaction, links and citations checked against actual page; no real-time countdown accuracy claim. The prototype does not have a hub card, production path, or live deployment. Preserve current production paths and data.