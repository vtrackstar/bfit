# BFit Milestone Guide: Build Standard and Definition of Done

**Scope:** "Your First Push-Up," "Your First Pull-Up," "Your First Pistol Squat," and "Your First 5K."  
**Apply from day one.** Never convert a rough program into a publishable guide by simply changing its title or adding a Coming Soon link.

## The build workflow

| Phase | Deliverable | Checks before moving on |
| --- | --- | --- |
| 0. Brief | Goals, intended users, intake questions, available training time/equipment, success test, open decisions | User has approved the actual outcome and constraints; program manifest says `planning` |
| 1. Coaching design | Skill map, concurrent training model, exercise substitutions, weekly doses, success/repeat/reduce/pause rules, interaction with other training | Manual programming review plus automated plan-data consistency tests; record evidence |
| 2. Evidence & exercise reference | Primary reviews/consensus where useful; source-to-principle mapping; each movement ID and suitable setup/demo status | Don't claim a video is verified merely because an ID or URL exists; cite source vs own coaching judgement honestly |
| 3. Interactive engine | Adaptive questionnaire, plan generator, four-week sessions, milestone check, complete workout shortcut, learn/revisit route | Tests for each intake branch, valid exercise/volume outputs, and impossible/contradictory answers |
| 4. Saving & portability | Local save, clear save-state indicator, JSON export, JSON import, schema version, invalid-file handling | Round-trip tests, old-version handling, malformed import rejection, no unintended data loss, mobile/offline behavior where supported |
| 5. Language & accessibility | Plain-language instructions, first-workout steps, readable RIR/negative terms, program-specific cues | Editorial voice pass, WCAG automated scan, keyboard controls, screen-reader labels, 320/390/768/1366px review, accessible focus and touch targets |
| 6. Beta review | Full first-visitor walkthrough, direct workout, workout export, week review, next-block decision | At least one uncoached first-time reader and one appropriate experienced reviewer; note confusion and fixes |
| 7. Release | Signed-off manifest, green GitHub Actions, confirmed exercise/library destinations, stable navigation and backup | All gates marked `pass` with an evidence file; no `ready` status without actual content and automated tests |

## Program requirements (not optional)

### 1. A precise success standard

Specify exactly what counts as the user's first successful repetition or event. This is an **unresolved design decision** today. For push-ups define technique, range and rep standard; for pull-ups, grip, start position and finish standard; for pistol squat, depth, balance and assistance; for 5K, whether completion can include walking or means continuously running. Do not promise success by the end of one block.

### 2. Intake needs to change the plan

The minimum domains are starting ability, equipment, training frequency, existing sport/gym work and movement limitations. Show a default example if a new visitor skips optional questions. Only collect information needed for the program. Save on the person's device by default; exporting may contain answers they consider private, so make the export contents visible.

### 3. Four weeks means a review checkpoint

Never program four weeks as an automatic pass. The four outcomes must mean something:
- **Progress:** quality, consistency, and recovery meet the next milestone's criteria.
- **Repeat:** build more practice at the same stage, without meaningless calendar progression.
- **Reduce:** change dose or variation when quality, recovery or consistency is insufficient.
- **Pause and review:** stop this progression when pain or another limitation needs individualized attention.

The 5K can use several four-week blocks, and a baseline beyond eight weeks should not be mistaken for failure. The site's timer/counter must not claim someone has earned a milestone without completing its actual success standard.

### 4. Strength-skill programs use concurrent practice

For Push-Up and Pull-Up, schedule negative practice, skill work and supporting strength concurrently, not as compulsory successive phases. Scale negatives appropriately. Bands are an optional tool, and there must be a viable unbanded progression. Pistol squat needs its own strength/range/balance model. The 5K uses running-specific run/walk exposure and recovery rather than resistance-training assumptions.

### 5. Audit every generated schedule, not just examples

When `program.json` and the plan generator are designed, the matching test must cover:
- Every supported intake combination, short and standard options, and equipment substitutions.
- Sets, reps, isometric hold time, running minutes, weekly training totals, recovery spacing, and zero/negative/NaN values.
- No exercise that the user's equipment or restrictions make impossible without a declared substitution or a stop/review route.
- Warm-up jump contacts as relevant; keep elastic contacts separate from cutting, braking, and footwork. Do not introduce unsupported plyometric totals.
- Strength workload as challenging sets with overlaps documented, not a misleading universal volume target.
- Stage changes, missed sessions, backtracking, Week 4 decisions and post-milestone choices.
- A single source for workout cards and exports so what is printed/downloaded matches the user's actual plan.

**Gate:** `loadTotals` cannot pass based on inspection of a few sample workouts. Write executable audits over generated plans.

### 6. Language from the first draft

Write one action and its reason in plain English, like a coach talking professionally. Avoid repetitive "not X but Y" transitions, corporate benefits claims, dense disclaimer stacking, decorative em dashes and all-chapter "Key takeaway/Do this" duplication. Keep essential safety conditions and honest source limits. No invented testimonials. Make sure the teaching explains negatives, RIR, technique and progression without assuming a beginner already knows the terms.

**Gate:** `editorial` needs a short written review with exact before/after examples and evidence of checking the rendered program variants, not a score from an AI detector.

### 7. First-time usability is a product test

No hidden equipment surprises, incomplete first-workout instructions, dead video links, buttons that only look clickable or broken browser-history behavior. Test from a clean browser and on actual phones. Users should locate the first workout in under a few taps without needing to read an entire textbook first, then return to the longer explanations if interested.

### 8. Source and version control

Keep every draft, design decision, test and release handoff in the GitHub project. Use a PR per feature or significant editorial update, with green tests before merge. Do not rely on storage-expired Drive files as the only copy. Do not claim auto-syncing or completion of a check that has not been run.

## Manifest quality gates

The `qualityGates` statuses in each manifest are:
- `pending`: no sign-off yet
- `fail`: tested and found a problem
- `pass`: checked successfully and supported by a real local `evidence` file in that milestone folder

The checks correspond to `programming`, `evidence`, `exerciseLibrary`, `loadTotals`, `progression`, `editorial`, `accessibility`, `deviceAndNavigation`, `saveAndRestore`, `beginnerTest` and `releaseLinks`. The GitHub script refuses `ready` if even one has not passed or lacks evidence.

**Important limitation:** A checked-box manifest can be falsified. A proper review must look at the actual tests, screenshots, source citations, workout numbers and recorded first-visitor feedback. For now all gate statuses are pending and no training prescriptions have been approved.
