# Mobility exercise reconciliation — 2026-11-27

The canonical library is now https://vtrackstar.github.io/bfit/exercise-library/, with source under exercise-library/. This document records reconciliation and release controls, not a separate dictionary. The old host is historical.

## Existing exercise records confirmed in Gamer Fit

| Canonical ID | Existing name | Required consistency |
|---|---|---|
| BFIT-00012 | 90/90 Hip Lift-Off | Specify rear-leg ankle lift as inward rotation; front-leg variation separate. Supported, small range, advanced control. |
| BFIT-00013 | 90/90 Hip Switch | Front hip outward, rear hip inward; support optional indefinitely; no forced exact angles. |
| BFIT-00016 | Ankle Circles and Rocks | Distinguish ankle motion directions; do not force pinching. |
| BFIT-00017 / BFIT-00018 | Arm Circles / Shoulder CAR | Distinguish free arm circles from deliberate controlled joint rotation. |
| BFIT-00028 | Bodyweight Hip Hinge | Hips backward, comfortable knee bend, return under control. |
| BFIT-00036 | Cat-Cow Flow | Spinal bending and straightening, not chest rotation. |
| BFIT-00051 | Elbow and Forearm CARs | Distinguish elbow bend/straighten from forearm palm-up/palm-down rotation. |
| BFIT-00056 | Foam Roller Reset | Optional comfort/range; no claims of physically breaking knots; deliberate pressure analogy. |
| BFIT-00062 | Hand Open-and-Close | Comfortable finger motion, no forceful squeezing. |
| BFIT-00066 / BFIT-00067 | Standing / Quadruped Hip CAR | Related hip control, not equivalent to loaded or single-leg exercises. |
| BFIT-00073 / BFIT-00074 | Supported / Dumbbell Lateral Lunge | Distinguish supported weight shift, independent lunge and loaded lunge. |
| BFIT-00080 / BFIT-00081 / BFIT-00082 | Gentle Neck Rotation / Chin Tuck / Gentle Neck Half-Circle | Comfortable range; no forceful neck circles. |
| BFIT-00088 | Prone Y Raise | Allow natural shoulder blade movement; wall slide related but different loading; hip airplane not a substitute. |
| BFIT-00095 | Supported Hip Airplane | Bodyweight with stable support; advanced balance and rotation; no unrelated shoulder substitutions. |
| BFIT-00121 | Side-Lying Open Book | Seated chest turn is a related floor-free option; Cat-Cow is not equivalent. |
| BFIT-00122 | Toe Flexion and Extension | Comfortable active toe movement; foot pressure awareness is a distinct task. |
| BFIT-00126 | Knee-to-Wall Ankle Rock | Heel stays down, comfortable forward knee travel. |
| BFIT-00128 | Wall Slide | Related overhead movement, not identical to a free overhead reach. |
| BFIT-00129 | Wrist Circles and Flexion/Extension Flow | Wrist movement distinct from forearm rotation. |

## Complete workout mapping (release candidate)

| Workout key | BFIT ID | Relationship |
|---|---|---|
| ankle | BFIT-00126 | Same basic movement |
| wall-slide | BFIT-00128 | Same basic movement |
| hinge | BFIT-00028 | Wall-touch variation |
| hand | BFIT-00062 | Related finger movement |
| lateral-strength | BFIT-00073 | Stationary supported variation |
| hip-in | BFIT-00141 | Outward foot movement |
| hip-out | BFIT-00141 | Inward foot movement |
| chair | BFIT-00150 | Sit-to-stand |
| calf-raise | BFIT-00003 | Supported two-leg variation |
| neck | BFIT-00080 | Assigned side |
| hinge-strength | BFIT-00099 | Related loaded hinge |
| knee-strength | BFIT-00174 | Related nonalternating march |
| side-shift | BFIT-00073 | Stationary weight shift, not a full lunge |
| reach | BFIT-00229 | Active Overhead Reach, draft |
| turn | BFIT-00230 | Seated Chest Rotation, draft |
| knee-lift | BFIT-00231 | Seated Knee Lift, draft |
| foot | BFIT-00232 | Foot Pressure Awareness, draft |
| wrist-load | BFIT-00233 | Supported Wall Hand Pressure, draft |

Keep dosage and progression in the workout, with complete standalone instructions. Related variations are labeled as such rather than treated as equivalent demonstrations.

## 2026-11-27 — Library migration and editorial master cutover
- Canonical public URL: https://vtrackstar.github.io/bfit/exercise-library/.
- Active editorial master: https://docs.google.com/spreadsheets/d/1xtxh9ey80FL0rFEi7dCHTfapFa2f7BHZhK-BsDiMuqM/edit (verified writable copy).
- Former master retained unchanged: ID 1aLjYoLen3zGhRJ72dXAoFbD7ymDbD8bvtTJ3Ywig2Gs. Do not edit both masters independently. When original-account access returns, reconcile by stable ID and changed fields before any synchronization.
- Existing public feed remains unchanged. 226 approved records in GitHub snapshot; 228 original master records including two with blank publication status (BFIT-00194 and BFIT-00202).
- Five new records BFIT-00229–00233 were written to the new master and verified as Draft, with no vetted demos. Total master records: 233; approved: 226. Do not expose drafts in public feed.
- Completed: reconciled 226 approved IDs and 3,616 fields; corrected nine stale snapshot fields; integrated main into feature with Gamer Fit edits preserved; staged 231-record candidate; all 18 mappings and offline library browser checks passed in run 46037482947.
- Remaining: confirm latest site-wide checks (46037838921) and mobility checks (46037838867); require explicit publication authorization; approve five written records without approving videos; verify live feed write access; update public feed and snapshots consistently; remove noindex/draft notices at release; verify Pages deployment and live links. Do not overwrite or renumber the two older unpublished records.
- Current candidate commit a0d20e8. Public feed remains 226 records. Candidate fallback has 231 entries and a newer publication timestamp, so old live feed is rejected rather than removing new anchors. Set the final publication timestamp consistently with the approved feed at release.
- Actual footage, physical-device checks, and independent beginner testing remain open; do not claim those were completed.
