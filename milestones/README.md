# Your First… milestone programs

These projects are **in planning**, not finished guides and not public training recommendations. They are separate from the existing Hub and four free guides.

## Order

1. **[Your First Push-Up](first-push-up/BRIEF.md)**: build this first, then test its adaptive programming and save/reload workflow.
2. **Your First Pull-Up**: reuse the tested interface, then build appropriate pulling progressions.
3. **Your First Pistol Squat**: reuse the structure with its own balance, strength, and range criteria.
4. **Your First 5K**: reuse the interface, but write running-specific progression logic. Four weeks is a check-in cycle; finishing a 5K may require 8–12 weeks or longer.

The four JSON manifests record what has been agreed and what remains undecided. They don't contain exercise prescriptions.

## Design commitments already agreed

- The main product is an **interactive, individualized milestone progression**, not a spreadsheet.
- A visitor can also open a **complete sample workout** quickly and return to the learning material later.
- Intake asks about ability, equipment, training days, existing exercise/sport, and limitations. Only ask follow-up questions that change the plan.
- For push-ups and pull-ups, **skill practice, negative progressions, and supporting strength** are developed concurrently. Band assistance can help, but is optional. Negatives must have an appropriate entry/regression for the user's current strength.
- Training progresses based on performance, execution, and recovery rather than a promise to achieve the milestone in four weeks.
- After each four-week review, offer explicit next steps: **progress, repeat, reduce, or pause and review**.
- Save locally and provide **JSON export/import** so the user can restore their own answers. A compact portable code was discussed but not finalized; a readable file is the reliable baseline.
- Research-informed principles are used to design original workouts, not copy another program.

## Preventing another retroactive audit

**Read [BUILD_STANDARD.md](BUILD_STANDARD.md) before writing workouts or site copy.**

Every project has a `manifest.json` checked automatically by `scripts/audit-milestones.mjs`. Every quality gate is pending until its evidence exists in that milestone's folder. A program cannot be marked `ready` with missing programming, evidence, exercise links, load totals, progression branches, editorial, accessibility, mobile, saving, beginner review, or release checks.

The validator is intentionally stricter about **declaring a program ready** than about preserving early drafts. Automated checks establish structure and technical invariants. Human coaching review is still necessary for realistic training, exercise substitutions, safety, and whether first-time readers understand it.

The milestone files are **not added to the Hub's public navigation** until approved. Existing guides and the hub remain unchanged by this preparation.
