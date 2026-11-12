# Your First Push-Up: Design Brief

**Status:** Planning. **No program or exercise prescriptions approved.**  
**Position:** First build in the "Your First…" series. This becomes the reusable interactive framework for Pull-Up, Pistol Squat and 5K.

## Goal

Help someone work toward their **first full, controlled push-up**, with progress that adapts to what they can do now. The exact success standard, starting screen and training dose still need to be designed and approved; do not claim a four-week guarantee.

## Already decided

- Four-week **review cycles**, repeated or adjusted until a milestone is reached.
- Skill practice and supporting strength progress **at the same time**.
- Negative/eccentric practice is a core element, with an appropriate supported or easier negative for someone who cannot yet control a full descent.
- Band assistance is an **optional booster**, not a required substitute for other skill practice.
- The interface is the training product. Spreadsheet output is not the primary program.
- Start with a small intake based on current ability, equipment, training days, existing workouts/sports and movement limitations. Additional questions only if they change a decision.
- **Two entry paths:** begin the adaptive progression, or open a complete example workout immediately and return to the lesson later.
- Browser saving and portable human-readable JSON export/import must work before release. A compact reload code remains a possible follow-up; don't make it the only backup.
- At Week 4 show next steps with criteria: progress, repeat, reduce or pause/review.
- Technique explanations should refer to the current exercise setup and an exact library variation, not a misleading near-match video.

## First decisions to design (not yet settled)

1. **What counts as one push-up?** Full-range, controlled lowering and pressing; define hand position, body alignment, valid assistance and range.
2. **Starting categories:** full/partial supported negatives; raised-hand variations; floor attempts; how to screen these without requiring testing to failure.
3. **Progression map:** select safe variations and decide when to change leverage, range, reps and load. Negatives are concurrent with skill and general upper-body strength work.
4. **Schedule variants:** choose reasonable days/week and short/standard options. Adjust if the user already has heavy pressing or sport practice.
5. **Dose:** sets, reps, negative duration, rest and weekly exposure. Audit totals and recovery before generating a plan.
6. **Milestone decisions:** define objective pass/repeat/reduce/pause thresholds and adjustments for missed days, technique breakdown and recovery.
7. **Evidence & video:** select supporting training principles and exact BFIT exercise IDs; record whether the demonstration and variation are truly vetted.
8. **Post-success path:** what to do after the first successful rep and how to avoid presenting another unearned automatic progression.

## First release test scenarios

- Complete beginner, no equipment, two training days.
- Person who can lower but not press back up.
- Person who can do partial elevated push-ups but no full-range floor rep.
- Person with an existing upper-body gym program (avoid automatically doubling pressing).
- Person who skips Week 2 and returns; progress is based on completed work, not calendar position.
- Person who cannot perform a chosen variation or experiences pain; offer a safe alternate route, not a forced progression.
- Browser reload, export, import on a different device, invalid JSON and old-version save.
- Someone visits the complete sample workout first and later decides to customize.

The above are **test cases**, not claims that the user can complete a specific training dose. Actual exercise choices and volume still need sign-off.

## Immediate next step

Design the push-up success test and starting ability screen; then choose the concurrent practice/negative/strength slots **before** coding the plan generator. At the same time, write tests that calculate weekly work and verify all intake branches. The manifest remains `planning` until these have been reviewed.
