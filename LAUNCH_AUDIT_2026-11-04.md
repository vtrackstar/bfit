# BFit Training Hub — launch audit

Historical review. See the [current site handoff](README.md) for the published catalog, coaching intake, social links, and open checks.

## November 5: coaching-funnel read-only verification

The public coaching questionnaire was opened in signed-out Chromium and confirmed to show **Premium** and **Elite** with their monthly pricing shown in the form, along with the option to request an inquiry call. This resolves the earlier question of whether the public questionnaire reflects both plans. The form submission, Google response capture, Zapier routing, and follow-up emails remain untested. See [Coaching Funnel QA](COACHING_FUNNEL_QA_2026-11-05.md) for confirmed evidence and the remaining manual steps. The hub's fuller automated browser and accessibility checks passed in the November 5 CI run.

## Final social/community status — November 4 update

The hub and all four guides now include links to Instagram (`@_trainwithbfit`), TikTok (`@_trainwithbfit`), Twitch (`gamewithbfit`), and the public [BFit Lounge](https://discord.gg/9yfqjvZPg) on Discord. The public community is distinct from the private Premium/Elite client area. Gamer Fit was successfully retrieved using Git blob access, and now describes both plans. All five pages contain the four link destinations in the repository source. GitHub Pages reported a successful deployment of commit `19e7e813b27cdd58393f1e10bb104271d0c62619`. Third-party account availability, signed-out Discord invite acceptance, and final post-change browser smoke-test results still need independent confirmation.


## Social/community corrections — final source review

The GitHub source for the hub and all four guides includes the supplied Instagram, TikTok, Twitch, and [BFit Lounge Discord](https://discord.gg/9yfqjvZPg) links. BFit Lounge is the public community; Premium and Elite clients have a separate private coaching area. This supersedes earlier statements below that said no invite was available or that all Discord access was private. Gamer Fit was successfully retrieved via its Git blob and edited, superseding older retrieval caveats. A source link check does not prove the external service accepts sign-in-free invites; actual signed-out click tests and the newest GitHub Actions status still need separate confirmation.

## Social links and Gamer Fit correction — later update

The hub and all four guides now contain clickable links to the Instagram, TikTok, and Twitch account URLs already present in Foundation. Gamer Fit was successfully retrieved through its Git blob and updated; it now explains the Premium and Elite coaching options rather than the older single-plan offer. Discord has since been corrected to the public BFit Lounge invitation, with a separate private area for Premium and Elite clients. These are source-level findings: the platform account pages and Discord access have not been validated in a signed-out user browser. After the HTML commits, GitHub Pages deployment and smoke tests were triggered; inspect the newest workflows for final outcomes.


## Coaching correction — later November 4 update

The site has **two** coaching plans, Premium and Elite. The hub, Foundation, Athleticism and Run Strong now present both plans without public pricing. The exact prices, feature allowances, and enrollment automation have **not** been verified against the live questionnaire. Gamer Fit's large HTML file was subsequently retrieved through its Git blob and updated. The earlier browser checks predate these content changes; new GitHub Actions results should be inspected before treating them as tested.

**Date:** November 4, 2026  
**Site:** https://vtrackstar.github.io/bfit/  
**Source:** https://github.com/vtrackstar/bfit

## What I checked

I audited the hub and all four current guide HTML files in `main`. The source checker runs automatically in [GitHub Actions](https://github.com/vtrackstar/bfit/actions) whenever the repository is updated.

### Automated results

- **Static source:** 5 pages, 10 executable inline JavaScript blocks, 3 embedded JSON blocks, 1,657 links, and 1,433 static hash anchors checked in the latest source-only run.
- **Source failures:** none in the passing CI run. No duplicate *static HTML* IDs, missing static anchor targets, broken in-repository guide paths, invalid embedded JSON, or JavaScript syntax errors detected.
- **Desktop/mobile:** all 5 pages loaded successfully at 1366px and 390px widths in headless Chromium (10 checks), with no uncaught JavaScript errors or reported significant whole-page horizontal overflow.
- **Foundation:** created a workout using a 2-day bodyweight setup, saved browser choices, opened the export dialog, downloaded the HTML workout file, and reloaded the saved plan.
- **Athleticism:** opened program-building and workout views; verified all 4 program types have 3-day/4-day, four-week schedules, with no missing main workout fields or negative/nonfinite load counts in a separate data inspection.
- **Gamer Fit:** followed the first-workout entry point and downloaded a workout text file.
- **Run Strong:** downloaded the offline HTML guide.
- **Visual reference:** desktop and mobile screenshots from CI are saved in the `bfit-qa-screenshots` artifact of the [browser test run](https://github.com/vtrackstar/bfit/actions/runs/41883774260).

### Fixes made

- Fixed the Foundation logo's placeholder `href="#"` and linked it clearly back to the BFit hub.
- Added missing search/social preview metadata to Athleticism and Gamer Fit.
- Added source, browser, and core-interaction smoke tests. These run on pushes to `main`, and screenshots can be downloaded from the Actions test artifacts.
- The preceding repository cleanup corrected old cross-guide URLs to the current `/bfit/` site paths and documented the repository.

## Still needing confirmation or deeper testing

1. **Exercise library:** The exercise library's older address redirected to `https://bfit-exercise-movement-library.balouissaint.chatgpt.site/` and the final address returned HTTP 200 from the external public-link probe. All 171 literal host references across the four guide files were updated directly to that final host while retaining the original `#BFIT-xxxxx` fragments. **Individual exercise IDs and the library's internal back-links still need signed-out browser checks**, and the library is hosted separately from this GitHub repository.
2. **Coaching form:** Test the form as a visitor, including confirmation emails and Zapier routing. A working URL does not establish that submissions and enrollment follow-ups work.
3. **Exercise demonstrations and reference URLs:** Test external videos, approved source labels, and exercise permalinks separately. A successful site build does not verify third-party content.
4. **Full interaction coverage:** Printing/saving PDF, Athleticism backup import/export, every programming path, every Gamer Fit tool, complex keyboard/screen-reader paths, and different browsers/devices have not all been tested.
5. **Mobile usability:** The 390px screenshots load without page-wide overflow. Gamer Fit has much denser long-form reading than the other guides, so evaluate its navigation and reading flow with actual beginner visitors.
6. **User-data safety:** Browser saved state and exported files need testing with deliberately malformed/older backups and in private-browsing environments. The current smoke tests use temporary browser profiles and do not change visitors' records.
7. **Canonical host:** The free GitHub Pages URL is the current site address. No paid custom domain has been configured.

## Suggested release decision

**Technically usable for a limited soft launch.** Automated source parsing and the main first-workout/download paths passed. Before actively promoting it, personally test the external exercise library, the coaching form, and your most important mobile flows in a normal signed-out browser.

The results above are limited to the exact tests described. A successful GitHub Pages deployment confirms the files were published, not that every guide feature or external destination has been verified.
