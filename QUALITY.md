# Quality checks — «Книга сказок»

## Local regression suite

Run `node tests/regression.cjs` from the repository root. No npm dependencies required.

Checks: inline JavaScript syntax; book/question coverage; pagination text preservation and bookmarks; illustration coverage and unique SVG IDs; generated arithmetic, logic and memory task structure; science answer indices; vocabulary occurrence; local archive validation.

These checks do **not** prove correctness of all educational explanations, actual screen fit or child learning outcomes.

## Browser acceptance checklist (manual, not yet verified on iPad)

- Open all home sections on iPad Safari, portrait and landscape; no clipped controls; easy return.
- Read a long prose scene and a poem at each supported letter size. Rotate the tablet halfway; verify exact place retained and text fully visible.
- Open all seven newly illustrated texts and compare artwork against the actual scene.
- Finish and restart a book, complete or skip its optional questions.
- Complete each learning activity, use hints, leave and restart; verify local progress.
- Write, draw, save locally; check personal shelf and gallery.
- Export a backup, restore into a separate test profile; verify stories, drawings, settings and learning records. Never use a child's only copy for destructive testing.
- Test offline shell after one successful online visit.
- Verify grammar and factual claims separately; record any errors and fix before release.

## Release 1.5.22

19 scene-specific vector illustrations for seven books, 32 glossary entries across 13 classical works, stronger reader initialization and scene reuse. Existing historical and original raster assets unchanged.

## Release 1.5.24

Mixed six-question mathematics/logic sessions with per-skill persistence, review recommendations across all four domains, date-gated science review intervals, dictionary access during reading, stable reading-position anchor during reflow, keyboard page navigation, and removal of duplicated quick-shelf filters. Regression suite checks mixed-plan composition and science scheduling. Browser/iPad visual acceptance and real-world learning effects remain unverified.

## Release 1.5.25

Three structured Russian-language skills with 36 reviewed prompts, adaptive levels, typed spelling answers, separate progress, and integration into the review queue. Existing writer practice remains available. Tests cover question variety, options, typed answer normalization and routing.

## Release 1.5.26

Parent dashboard reorganized into four skill groups, science practice and reading completion; separate completed, independent and recent counts; due-topic summaries; no cross-domain ranking. Existing history and storage keys unchanged. Regression suite checks aggregate totals.

## Release 1.5.27

Fixed text input mode and maximum length in the active study renderer. Added mocked UI regression covering six typed spelling answers, persistence, parent summary and restoration of numeric input mode. Real browser and iPad checks remain outstanding.

## Release 1.5.28

Added evidence-based reasoning skill with 16 prompts (observations, missing information, fair experiments); diversified planning exercises; corrected Russian cases and general level labels. Removed superseded world/study interfaces and legacy logic question bank; legacy progress data and active math fallbacks retained. Regression checks include the new skill.

## Release 1.5.29

Grouped mathematics (12 skills) and logic (6 skills) into 3 and 2 topic areas; due topics open automatically. Added optional Playwright smoke script for two tablet viewport orientations. Run from a test checkout with Playwright installed: `node tests/browser-smoke.cjs`, optionally `BROWSER=webkit node tests/browser-smoke.cjs`. The browser script has been syntax-checked only; its actual execution and iPad Safari testing remain outstanding. Regression checks confirm complete, unique topic coverage.

## Release 1.5.30

Expanded mathematical word problems to eight problem structures at each difficulty level (including inverse, comparison, and two-step problems); money practice now includes four or six contexts by level, with budget, missing amount, price difference and combined expenses. Worked answers are explicitly displayed; session summary separates first-attempt independent answers, assisted/retried answers and viewed solutions. No storage schema changes or original story edits. Added 1,536 independent arithmetic checks of generated story and money task templates. Actual child learning outcomes and tablet rendering remain unverified.
