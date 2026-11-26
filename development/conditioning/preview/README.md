# Conditioning development preview — current checkpoint (November 26, 2026)

This is a tested development candidate, not a deployed guide. The repository may be publicly readable; noindex is not access control. Use fictional records only. Do not perform unfamiliar exercise or enter personal medical information to test the website.

## Open the preview for a hands-on review
From a local clone of the repository:
```sh
git switch conditioning-guide
git pull --ff-only origin conditioning-guide
python3 -m http.server 8000
```
Open http://localhost:8000/development/conditioning/preview/ on that computer. For a phone on the same trusted local network, use the computer's local IP address in place of localhost; allow local network access only if appropriate. HTTP on a non-localhost address may lack secure-context APIs used by the preview (including crypto.randomUUID). If so, use a trusted HTTPS test host or a local desktop browser. Do not use file://, or expose the local server to the internet. The preview is not yet accessible at a live BFit route.

## Implemented
Ten optional lessons, five-step setup, context-specific movement instructions, six next-action states plus restriction and review routing, 4-week calendar with same-week moves, adaptive dose selection, timer and manual actual records including early cooldown, optional main-work metrics, next-day recovery and conservative correction, outside activity, historical reports, backup/restore, educational figures and isolated interval comparison, 37 annotated scientific references. Warning and pain history is retained; clinician-directed outside activity may be logged separately without unlocking a paused plan.

## Latest observed verification
At head f3ef7e27f6e19524395c557b763fb861ffaffffe:
- [Conditioning CI](https://github.com/vtrackstar/bfit/actions/runs/45904348211): success. Actual Node 22 ESM, 273 checks (54 engine, 36 workflow, 32 calendar, 43 timer, 43 app, 23 integrated, 21 advanced, 4 education, 7 recording, 10 safety/data), and six browser test groups including 320/390/1366 px navigation/overflow, timer interruption, manual recording and backup, safety persistence, educational isolation.
- [BFit smoke tests](https://github.com/vtrackstar/bfit/actions/runs/45904348212): success.
- 69 unique static IDs; all static internal anchors resolve; nine related guide routes match current main.
- No real phone, independent reader, video playback, clinical or aquatic review performed.
- Draft [PR #21](https://github.com/vtrackstar/bfit/pull/21) unmerged; mergeable at check, two commits behind main, no production integration.

## Run tests locally
```sh
for test in development/conditioning/*.test.mjs; do node "$test" || exit 1; done
npm install --no-save playwright
npx playwright install chromium
node development/conditioning/preview/browser-flow.mjs
```

## Remaining work
Use the [release review packet](../../../CONDITIONING_RELEASE_REVIEW_2026-11-26.md) for hands-on tasks, safety/scope decisions and production integration. Older audit files describe historical snapshots; this file and the latest handoff supersede their status. Do not publish until owner approval and appropriate review of unresolved safety and device limitations.