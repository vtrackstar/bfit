# BFit Training Hub

I built these guides so you can choose a workout that fits your week, try it, and learn why you’re doing it. [Open the BFit hub](https://vtrackstar.github.io/bfit/)

## Published catalog

| Collection | Page | What the reader can do |
| --- | --- | --- |
| Training guides | [Foundation Training](guides/foundation/) | Build a strength workout around time, equipment, and comfort with floor exercises. Leave the goals blank for a general routine. |
| Training guides | [Athleticism](guides/athleticism/) | Choose four weeks of sprint, jump, field and court, or multisport training. The starting screen links new exercisers to Foundation. |
| Training guides | [Gamer Fit](guides/gamer-fit/) | Take a five-minute break or start a 15–25-minute workout. |
| Training guides | [Run Strong](guides/run-strong/) | Choose a first run–walk session or start from the running you already do. |
| Training guides | [Conditioning Training](guides/conditioning/) | Learn how energy systems, fatigue, recovery and conditioning methods work; use independently or alongside the companion. |
| Training guides | [Keep Moving 50+](guides/50-plus/) | Choose everyday priorities and activities, build a week, and save check-ins across four pages. |
| Training guides | [Mobility](guides/mobility/) | Learn how flexibility, strength and control support the movements you need. |
| More training plans | [Build Your Mobility](guides/build-your-mobility/) | Build a short general or targeted practice routine, save feedback, and adjust the next session. |
| More training plans | [Build Your Conditioning](guides/build-your-conditioning/) | Start a standalone adaptive land-based plan, record workouts and recovery, and retain existing conditioning history. |
| More training plans | [Weekend Warrior](guides/weekend-warrior/) | Fit two short home visits and a gym visit around work and log four weeks. |
| More training plans | [Build Your Glutes](guides/build-your-glutes/) | Follow two leg days a week for eight weeks, swap equipment, and log each set. |
| Your First… | [Your First Push-Up](milestones/first-push-up/) | Start at a wall or raised surface and work toward one floor push-up. |
| Your First… | [Your First Pull-Up](milestones/first-pull-up/) | Practice with assistance and work toward one pull-up from a dead hang. |
| Your First… | [Your First 5K](milestones/first-5k/) | Build toward a run-walk or continuous 5K with adaptive workouts, recovery checks, and saved progress. |

Pistol Squat is planned. The [Exercise & Movement Library](exercise-library/) is hosted in this repository alongside the guides, with stable BFIT exercise links.

## Current decisions for future edits

- GitHub Pages publishes from `main` in `vtrackstar/bfit`. Start with the current repository files. Drive drafts and backups are separate copies. Preserve existing public paths, anchors, and saved workout data.
- Keep the training plans and milestones in their own single-row collections. Show the swipe cue and previous/next controls when more cards extend offscreen; the homepage also has direct collection shortcuts. Main guide cards stay in the regular grid.
- Write for someone doing their first workout. Give the first physical action and explain unfamiliar terms where the reader needs them. For example, a dead hang means hanging still from the bar with straight arms and feet off the ground. Push-Up and Pull-Up review progress after eight completed sessions; 5K adjusts according to completed running sessions and recovery.
- The hub links to Instagram, TikTok, and BFit Lounge on Discord. Bryan paused Twitch **on the hub** and will say when to restore it. Individual guides can retain their existing Twitch links.
- Coaching intake is paused. The [coaching page](coaching/) holds the examples, nutrition information, and expandable comparison of Premium ($199/month) and Elite ($499/month). The hub links there. Keep intake closed until Bryan reopens it.
- Foundation saves setup choices and exports a workout with a blank record sheet. Gamer Fit saves Skill Tree choices. Run Strong offers a printable record. Athleticism, Keep Moving, the two training plans, and the three milestone guides have their own recording tools. Check the specific guide before describing what it saves or transfers.

## Verification and handoff

The [release workflow](.github/workflows/site-smoke-tests.yml) lists the checks used on changes. The site audit discovers HTML pages under the published content directories. The hub release test checks the three collections and their destinations. The milestone audit reads each [manifest](milestones/README.md), and the Pull-Up engine has its own regression tests.

Keep physical iPhone Safari downloads and restores, full demo playback and cue review, and uncoached first-reader testing open until someone records the result. Browser tests at phone widths cover layout and workflow. Use the [reader walkthrough](READER_WALKTHROUGH.md) for the hands-on checks.

The [change log](CHANGELOG.md) records decisions by date. Dated launch and editorial reports describe the revision reviewed at the time. For current behavior, start here and check the relevant page on `main`.

See the [current beginner audit implementation ledger](BEGINNER_AUDIT_IMPLEMENTATION_2026-11-27.md) for recovery checkpoints, test results and remaining work. Follow the [BFit editorial and release standard](BFIT_EDITORIAL_STANDARD.md) for future guides. The [November 26 audit handoff](HUB_AUDIT_HANDOFF_2026-11-26.md) is historical context.
