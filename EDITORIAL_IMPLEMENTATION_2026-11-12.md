# BFit Editorial Voice Pass: Implementation
**Date:** November 12, 2026  
**Scope:** Public Training Hub, Foundation, Athleticism, Gamer Fit, Run Strong  
**Source review:** [Editorial audit](EDITORIAL_VOICE_AUDIT_2026-11-12.md) and [Community language benchmark](COMMUNITY_AI_SLOP_LANGUAGE_AUDIT_2026-11-12.md)

## Applied wording changes

| Page | Changes |
| --- | --- |
| **Hub** | Tightened Premium and Elite introductions and offer cards, reduced repeated check-in phrasing, made the example outcome more specific, and corrected the stale reference to the closed questionnaire. |
| **Foundation** | Condensed calorie-estimate guidance while retaining uncertainty, clarified how to track weekly volume and overlapping muscle work, shortened restaurant-order advice, and made coaching decision language more direct. Updated the tier table and application instructions for paused intake. |
| **Athleticism** | Removed duplicate Week 4 review sentences, tightened team-practice and recovery guidance, explained Jump Performance and Multisport choices more directly, clarified workload totals, and replaced decorative em dashes in program explanation headings. Corrected the paused-intake pricing note in the embedded editorial metadata. |
| **Gamer Fit** | Condensed all 18 paired "Key takeaway / Do this" chapter summaries into short topic-specific actions. Preserved TL;DR section containers, chapter links, the research/reference link, safety directions, and training tools. Tightened the food and streaming introductions and repeated post-block progress notes. |
| **Run Strong** | Removed repeated explanations of progression and faster sessions, simplified lifting/run coordination and isometric placement, reduced an unnecessary em dash, and tightened the coaching descriptions. Preserved the real mile-conditioning example and the athlete-specific 37/47-second surge targets. |

## Preserved

- All exercise identifiers and their references, including repeated references in the embedded program data
- HTML IDs used for chapters, navigation, saved links and workout states
- Workout prescriptions, strength sets, contact counts, run distances, pace targets and progression rules
- Calculator logic, data objects, storage keys, export functions and other interactive programming
- Citation links, exercise source labels, critical safety instructions and real coaching examples
- The website's first-person coaching voice and current paused-intake route

## Checks

The source-level before/after review found **identical ordered multisets of BFIT exercise IDs and identical HTML ID sets on all five edited pages**. The new `scripts/editorial-smoke.mjs` checks the paused-coaching message, retained Gamer Fit summary/navigation structure, and specific running examples. Existing GitHub Actions tests still validate script syntax, program totals, browser layouts, accessibility, main user paths and exports.

Source-extracted spaces adjacent to the Run Strong inline links and emphasized text were checked in HTML. The underlying markup already attaches punctuation properly. No unnecessary punctuation "fix" was applied to those elements.

## Editorial approach

The objective is accurate, recognizable coaching language. It is **not** possible to verify whether a text will be accused of AI assistance, and no detector can establish who conceived a training idea. These updates remove repetitive packaging, retain the author's specific training decisions and leave a clear Git history.

## Release notes

Editorial changes should be merged only after the pull request tests succeed. Paid coaching remains paused; the form and Zapier/email routing require owner-side verification after storage access is restored. This pass does **not** announce a hard launch.
