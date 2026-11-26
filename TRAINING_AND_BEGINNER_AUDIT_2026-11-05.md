# BFit training programming and first-time user audit — November 5, 2026

Historical review. See the [current site handoff](README.md) for the published catalog, coaching intake, social links, and open checks.

**Scope:** Current `main` source for the [Hub](index.html), [Foundation](guides/foundation/index.html), [Athleticism](guides/athleticism/index.html), [Gamer Fit](guides/gamer-fit/index.html), and [Run Strong](guides/run-strong/index.html). Review of programming logic, entry paths, novice suitability and public wording.

**Method:** Source inspection and a numerical audit of Athleticism's embedded program data. The most recent pre-audit GitHub Actions run passed source, desktop/mobile and key interaction tests. This review did not include human participants, supervised exercise execution, signed-out exercise-library video-by-video checks or physical-phone/screen-reader tests. Avoid treating an editorial audit as clinical or sport-specific clearance.

## Follow-up changes applied on November 5

- **Athleticism readiness (P1):** Added a plainly worded readiness note *before* the program cards and schedule choices. It links to Foundation or the existing first-workout walkthrough. Jump Starter remains an option for prepared athletes, not a substitute for learning a landing.
- **Athleticism workload metadata (P2):** Reconciled 28 older `iso` values with `isometric_sets`, and 32 older `strength` row values with the sum of lifting plus isometric sets. Updated the associated weekly summaries. Actual prescriptions, exercise IDs, and current visible workload fields were not changed.
- **Jump Starter consistency:** Chart totals now come from the reduced workout rows instead of a separate fixed array of totals.
- **Regression coverage:** Added `scripts/audit-program-data.mjs` and `scripts/beginner-entry-flows.mjs` to GitHub Actions. They check numeric summaries, Starter contact accounting, direct first-workout routes, and common Hub return links.
- **Not replaced by automation:** A few new readers still need to try the site on real devices without help, and exercise-library demonstrations still need individual validation.

The original findings below are retained as an audit trail; the first two issues above have been addressed in source.

## Executive assessment

**Suitable for a limited soft launch.** Nothing inspected requires replacing the programs or rebuilding the website. The free first-session paths are real rather than placeholders. The main work before promotion is to put athlete-readiness guidance earlier in the Athleticism selection path, correct a legacy workload-metadata inconsistency, and collect beginner feedback. The external exercise-demo mapping remains a separate outstanding verification task.

## What checks out

### Foundation
- The builder uses goals, 2-/3-day schedule, session length, equipment and movement constraints rather than one fixed plan.
- Intro mode intentionally caps most strength movements at **one set** while retaining a higher planned-set target; progression and RIR are explained in the first-workout page.
- The first-workout walkthrough is generated from the current session, so names/sets match the chosen setup rather than a detached example.
- A no-equipment version explicitly discloses that progressive loaded pulling is missing; this should remain explicit rather than implying complete equipment equivalence.
- Two-day and three-day example calendars provide easier days between strength exposures in the default schedule.

### Athleticism
- Four programs (Sprint, Field & Court, Jump and Multisport), each with 3- and 4-day choices over four weeks = **32 program/schedule/week combinations**.
- Recalculated each program/schedule/week row total for contacts, pogos, running metres, cutting, braking, reactive reps, lifting sets and isometric sets. **No discrepancies between the recomputed totals and the `summary` fields** for those dimensions.
- Three-day, Week 1 → Week 4: Sprint contacts **49→26** and running metres **375→325**; Field & Court contacts **45→32**; Jump contacts **107→56**; Multisport contacts **54→32**. Week 4 is a lower-volume checkpoint rather than an automatic max-test.
- The standard Jump three-day program rises to **128 contacts** in Week 3, including 60 pogo contacts. The optional Starter setting describes a reduced sequence (**65, 77, 74, 52 contacts** over Weeks 1–4). Those figures are programmed values, not a universal safe threshold.
- Sprint testing notes call out repeatable W2 vs W4 fly-10 conditions and limitations of handheld 10m timing. Field & Court separates cutting/braking from jump contacts.
- The 4-day Jump option adds a recovery/movement day rather than additional jump contacts, and says so in the guide.
- Readiness checks, regressions, recovery adjustments and a Foundation link exist.

### Gamer Fit
- The first click offers a **15–25 minute** no-equipment session with four movements: bodyweight squat, incline push-up, glute bridge and dead bug, preceded by a short warm-up.
- One set per exercise is the default first exposure, with a second optional; the guide tells beginners to repeat this twice in the first week with recovery between, then move toward Workout A/B.
- The guide warns that unanchored bodyweight work cannot substitute for progressive resisted pulling. It explains what equipment is safe to use and discourages improvised door/towel setups.
- The three-day push/pull/legs hypertrophy option explicitly warns that it reaches each major region only about once weekly and points newer readers toward fuller-body options instead.

### Run Strong
- A true beginner entry starts with **5 minutes walking + 6 × (30 seconds easy running / 90 seconds walking) + 3 minutes walking** = 20 minutes total, with 3 minutes running.
- This first session is expressly limited to someone who already tolerates 20–30 minutes of walking; a separate 10-minute jog path is available.
- One starting week places the 20-minute session on Tuesday and Friday (40 minutes total, 6 running minutes), with no unadvertised fast session.
- Tempo/threshold, fartlek, interval and strides examples are for appropriately experienced runners; the guide cautions against stacking multiple hard sessions.

## Findings and prioritized action

### P1 — Make Athleticism eligibility more obvious before choosing Jump or Sprint
**Type:** beginner UX / communication, not a confirmed prescription error.

The readiness checks currently appear in Workout Mode, after a reader can already navigate to the program builder. The Jump standard option can reach 128 contacts in Week 3 with approach jumps, one-leg hops and bounds; actual demand varies markedly by exercise intensity and athlete history. The lower-volume Starter control is present, but a completely new jumper may still interpret “Starter” as an invitation to jump without prior preparation.

**Recommended fix:** Introduce a short, plain-language readiness line on each athleticism program card or just above the 3-/4-day choice: "If you can't land a small hop comfortably or haven't sprinted recently, start with Foundation or the easier skill drills before this plan." Link to the existing first-workout/readiness guidance, not another medical disclaimer. Keep the programmed volume intact until a training decision is made.

### P2 — Standardize legacy isometric workload metadata
**Type:** confirmed internal data consistency issue; **not a confirmed visitor-visible error**.

In Athleticism embedded row data, `isometric_sets` (used by the visible workload cards) differs from the older `iso` alias in **28 rows** across Jump and Multisport schedules. The separate `strength` legacy category also combines or separates lifting and isometric work differently across program families. The current UI uses `lifting_sets` and `isometric_sets` separately, which is the correct presentation.

**Recommended fix:** Choose those two separate fields as the canonical workload measures and either normalize the legacy aliases across every schedule plus `summary`, or retire them after confirming that no consumer relies on them. Add a build-time invariant test. Do not edit workout doses or overwrite newer exercise IDs.

### P2 — Test an actual first-time reader
**Type:** unverified usability risk.

Source entry points are clearer than an earlier BFit build, but generated workouts and long guides can still overwhelm readers. Gamer Fit's HTML alone exceeds 1 MB, though the most recent GitHub Actions smoke run completed successfully. Its size and article density warrant a real low-end phone check, not an unsupported claim of performance failure.

**Recommended test (3–5 people):** Without coaching them, ask participants to (1) find the most relevant guide, (2) choose a first session, (3) explain sets/reps or running effort, (4) complete or download a plan, (5) return to the Hub. Record hesitations and wrong turns. Test one complete beginner, one recreational athlete and one screen-heavy beginner at minimum.

### P3 — Verify real exercise demonstrations and exercise-to-ID mapping
**Type:** external reference audit outstanding.

Many movements have direct exercise IDs, substitutions or coaching cues; the separate library and source videos are not all verified here. Cross-check the actual exercise variation, linked demo, public accessibility, and source credit before claiming complete exercise-video coverage.

### P3 — Keep progressive starter amounts explicitly labeled
**Type:** educational clarity.

Foundation and Gamer Fit appropriately use low initial set counts for first exposure. Those doses should continue to be labeled "getting started" rather than portrayed as optimized hypertrophy or strength prescriptions. The 2026 ACSM Position Stand emphasizes progressive training, with stronger average strength outcomes at heavier loading and ≥2 sessions/week, and larger hypertrophy responses at greater weekly volumes. The programs may deliberately begin below those averages to support adherence and skill acquisition.

## Evidence used for external benchmark

- Currier et al., *ACSM Position Stand: Resistance Training Prescription for Muscle Function, Hypertrophy, and Physical Performance in Healthy Adults* (2026), DOI: 10.1249/MSS.0000000000003897, PMID 41843416, https://pubmed.ncbi.nlm.nih.gov/41843416/
- NSCA, *Plyometric Exercises*, emphasizing quality and the demands already contributed by sport practice: https://www.nsca.com/education/articles/kinetic-select/plyometric-exercises/
- World Athletics, *Plyometric Training and the High Jump*, for staged plyometric recovery and intensity context: https://worldathletics.org/download/downloadnsa?filename=8877d8be-01c8-4d52-aa69-7e98c6920706.pdf&urlslug=plyometric-training-and-the-high-jump

These sources support principles, not a universal numeric approval of any individual program. Do not treat a specific author's set/contact recommendations as rules that apply to every trainee.

## Not inspected or claimed

- No complete cross-product validation of every Foundation equipment/goal combination.
- No individualized review of contraindications, training history or readiness for the jump/sprint plans.
- No participant observation, on-device session timing or print/download readability with actual athletes.
- No full independent fact-check of every citation, exercise technique cue or external video.
- No end-to-end enrollment/Zapier testing in this audit.

**Release recommendation:** Maintain the deployed soft launch. Prioritize Athleticism program-selection readiness wording and legacy-isometric data consistency, then run short beginner task tests before paid promotion. Preserve training data, export formats, and exercise IDs unless a tested issue specifically calls for changing them.
