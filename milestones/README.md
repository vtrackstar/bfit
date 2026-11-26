# Your First… milestone programs

| Guide | Publication | Current material |
| --- | --- | --- |
| Your First Push-Up | Published | [Guide](first-push-up/index.html), [release checks](first-push-up/RELEASE_CHECKS.md), [manifest](first-push-up/manifest.json) |
| Your First Pull-Up | Published | [Guide](first-pull-up/index.html), [programming framework](first-pull-up/FRAMEWORK.md), [manifest](first-pull-up/manifest.json), [engine tests](first-pull-up/test-engine.cjs) |
| Your First Pistol Squat | Planning | [Manifest](first-pistol-squat/manifest.json) |
| Your First 5K | Published | [Guide](first-5k/index.html), [manifest](first-5k/manifest.json), [programming review](first-5k/PROGRAMMING_REVIEW.md) |

Three published guides appear under **Your First…** on the hub. Push-Up and Pull-Up review progress after eight completed sessions, about four weeks at twice a week. 5K adjusts workouts using completed training and recovery, with no fixed completion deadline. All three support local saving and JSON backup and restore.

Push-Up starts with a surface the reader can use comfortably. Pull-Up defines a dead hang on the opening page, asks which equipment the reader has, and shows the setup prompt for that equipment. Someone without safe pulling equipment gets a direct route to Foundation.

## Reading the manifests

`published` records an authorized public release. Each quality gate records its own evidence and open work. `ready` is the build standard’s fully verified status. Keep partial reviews, physical-device checks, and independent-reader feedback explicit. For a new milestone, use the [build standard](BUILD_STANDARD.md) and retain its progression, recovery, and portability checks.

From the repository root, run `node scripts/audit-milestones.mjs` and `node milestones/first-pull-up/test-engine.cjs`. The [hub README](../README.md) covers the rest of the catalog and the release workflow.
