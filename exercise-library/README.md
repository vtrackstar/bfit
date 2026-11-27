# BFit Exercise & Movement Library

The canonical public library is [Exercise & Movement Library](https://vtrackstar.github.io/bfit/exercise-library/), published as part of `vtrackstar/bfit` through GitHub Pages.

This source was migrated from the archived BFit Library v6 package dated 2026-10-30. Its embedded static catalog and `catalog.json` both contain **231 release-candidate movement records** (226 approved plus five written-reviewed mobility drafts; do not deploy until the five are approved and the feed is synchronized), with stable `BFIT-xxxxx` IDs. Do not renumber IDs or change their anchor fragments. Deep links such as `#BFIT-00126` must continue to open the same movement.

The self-contained page embeds a reviewed fallback catalog; `app.js` also checks the approved public Google Sheets feed through `feed-config.js` and `catalog-feed.js`. The fallback works without Google Sheets. If live feed access fails, the page should explicitly indicate that its saved catalog is being shown. New data is not automatically committed to GitHub; update the reviewed snapshot and embedded copy together when making a release.

The editorial source of truth is the Google Sheet **BFit Exercise & Movement Library — Living Master**. The public feed is **BFit — Public Approved Exercise Feed**. The writable editorial master is https://docs.google.com/spreadsheets/d/1xtxh9ey80FL0rFEi7dCHTfapFa2f7BHZhK-BsDiMuqM/edit; retain the original as a historical backup. The existing public feed remains at 226 entries until authorized release. Demonstration videos remain under review; the library does not present unapproved videos as verified.

For release checks, verify searching, category and difficulty filters, reset, copied deep links, direct visits to BFIT ID anchors, the empty-result state, mobile layout, and read-only catalog refresh. Keep the original off-repo site available until the new path and references have been checked publicly; GitHub cannot redirect links on the original chatgpt.site host.
