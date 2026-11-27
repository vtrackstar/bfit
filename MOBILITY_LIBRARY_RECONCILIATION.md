# Mobility exercise reconciliation — 2026-11-27

The central Exercise & Movement Library is hosted at https://bfit-exercise-movement-library.balouissaint.chatgpt.site/. It is not a directory in this repository. This document is an integration checklist, not a separate public exercise dictionary. No central library edit has been verified.

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

## New workout local keys
Do not assign a canonical ID based solely on similar anatomy. Existing IDs above are confirmed only from Gamer Fit embedded records, not an exhaustive central inventory.

- hinge: related BFIT-00028; wall-touch variation.
- ankle: BFIT-00126 movement family.
- hand: related BFIT-00062; fingertip opposition adds a distinct task.
- neck: BFIT-00080 direction.
- reach: related BFIT-00128 but free reach is not wall slide.
- turn: related BFIT-00121 but seated chest turn is not side-lying open book.
- side-shift: related BFIT-00073 but a small supported shift is not a full lunge.
- hip-in, hip-out, knee-lift, foot, chair: inspect central inventory before mapping.
- For each candidate inspect exact setup, movement, assistance, equipment and goal before reusing an identifier.
- Keep workout dosage and progression in program code, canonical exercise setup/cues in the library; provide essential instructions in the workout even when offline.
- Verify library deep links, exercise demos, aliases and reverse program destinations before public launch.

## Release gate
Central library inventory and write access are still needed. Existing IDs and Gamer Fit anchors must remain stable. The guide and workout must remain independently usable. No new canonical IDs have been issued in this branch.
