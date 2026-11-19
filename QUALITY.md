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
Mocked session checks additionally verify all three outcome categories (3 independent, 2 assisted/retried, 1 worked solution) and explicit answer display.

## Release 1.5.31

20 contextual science reasoning questions; rotating review prompts for all 20 science topics; first retrieval before illustration and explanation on repeat sessions; explicit uncertainty option; feedback showing the answer rather than elimination-based guessing; separate delayed first-response counters. Early practice does not postpone scheduled review. Delayed response is recorded immediately, once per due timestamp. Existing science storage key and earlier records preserved; optional recall fields validated in backups. Parent dashboard distinguishes new delayed indicator from earlier practice. Revised rain, magnet and sound wording. Design references: https://ies.ed.gov/ncee/wwc/PracticeGuide/1 and https://my.nsta.org/ngss/Practices.aspx?exampleid=521&id=3. Actual learning and tablet visual acceptance remain unverified.
Second pass: refined seasonal and magnet wording, separated review-start prompts from the closing transfer question, and checked initial and interrupted-repeat UI paths using simulated storage plus old/new archive validation.

## Release 1.5.32

Added a third, inference-focused comprehension question to each of 19 readable books, with a source excerpt available only after the answer and explicit uncertainty option. Original text remains unchanged. Quiz displays first-attempt results and warns on failed saving. Bounded text measurement windows, complete-word boundary preservation and end-of-scene bookmark fallback. Reader touch targets and evidence panel styling adjusted. Regression checks cover evidence verbatim occurrence and pagination. Full browser/iPad rendering and live site deployment remain unverified.
Second pass: per-session cache of up to three measured layouts, avoid bookmark writes when unchanged, notify on storage failures. Mocked quiz checks three answers and saved score. Browser smoke checklist expanded for orientation, font sizes and the three-question quiz; syntax checked but not run on a live checkout.

## Release 1.5.33

Constructed-response exercises integrated in ordering, deduction and planning skills (alternating with original questions). Three to five cards by level, constraints explicitly listed; planning accepts both valid preparatory orders. Tap to build, undo/reset and submit complete order; only first unaided correct submission counts as independent. Existing progress, mixed sessions and review mechanism unchanged. Exhaustive permutation checks and simulated UI confirm acceptance of alternatives, rejection of invalid sequences, undo, retry and persistence. Browser/iPad testing outstanding.
Second pass: retain card DOM nodes while filling slots; show the actual accepted order, including alternative valid paths; point to the first violated constraint after an incorrect submission. Added mocked assertions and a browser smoke scenario (syntax checked only).

## Release 1.5.34

Archive import now validates the complete library, image formats, draft/edit records, publication records, duplicate IDs and allowed extra keys rather than silently discarding malformed records. Preview shows counts before confirmation; export fails explicitly if a full backup cannot be prepared. Before manual import or previous-library recovery, a dedicated IndexedDB checkpoint preserves the current library and all 14 portable keys, including absent keys, with exact restoration via the recovery panel. Writes roll back on failure; rollback failure is reported. Ordinary library automatic snapshots remain library-only and are labelled accordingly. No schema migration or family-secret export. If checkpoint creation fails, destructive restore is blocked, including native contexts without usable IndexedDB. Regression tests use synthetic data; real IndexedDB/native/iPad/browser acceptance remains outstanding.
Second pass: distinguish complete library replacement from optional-section replacement in import preview, check for persisted library mismatch and changes during checkpoint creation, cancel application if the user leaves the restore dialog, and test successful import and exact rollback of absent keys. The conservative policy may block restoration if current storage is corrupt or diverges; no forced overwrite path added.
Browser smoke checklist additionally tests import and undo with actual IndexedDB using a synthetic book and isolated browser profile. Syntax checked; actual execution could not be performed because repository access from the browser-test runtime was unavailable.

## Release 1.5.35

Learning interface redesign prompted by actual iPad photographs. Full-height learning canvas with compact controls; all math/logic topics exposed in flat grouped cards, memory/language cards share the same navigation. Science uses four visual category selectors, preserves category on lesson return, and 20 new local vector scenes. Science lesson illustration and question are side by side in landscape and stacked in portrait; hidden during first delayed recall as before. Existing questions and progress untouched. Regression checks for complete scene and skill coverage; updated browser script syntax checked, not executed on iPad. Artwork is handcrafted vector, not a replacement for all book artwork.
Added an interactive four-position day/night Earth model after the initial answer (not shown before recall); verified category navigation with simulated DOM and added browser smoke cases for returning to a category and rotating the model. The model is schematic, not to scale.

## Release 1.5.36

Implemented the approved illustrated math/logic mockups as real adaptive HTML controls. Nineteen artwork crops (18 topic illustrations and fox mascot) were extracted from the two approved generated designs into a single offline WebP sprite (78,056 bytes, 176px cells). The new storybook theme supplies colour-coded cards, tactile action labels, landscape header, grouped labels, and responsive phone/portrait layouts. Shared styling applied to language, memory, world and learning hub navigation, with selected existing topic art reused there. All questions, event handlers and storage schemas remain intact. Existing and new structural regression checks passed before merge; full iPad rendering not yet verified.
Tablet landscape pass: tightened math row rhythm while retaining larger logic illustrations. Sprite moved into a versioned same-origin stylesheet and included in service-worker offline cache, avoiding oversized HTML; native/missing stylesheet fallback uses pictograms. Browser smoke checklist now asserts actual sprite CSS and return to exercise styling; syntax checked only.

## Release 1.5.37

Extended the approved illustrated style to active mathematics, logic and language exercises and science lessons: calmer storybook canvas, small fox, clear progress, contrasting response states and responsive answer controls. Long text stays in one column; short options may use two columns on tablets. Three explanatory interactive science models (shadow direction, attraction of selected materials, floating/sinking) each have three selectable states, descriptions and visible selection. They appear only after the first answer and hide before the next question, including delayed recall; existing day/night model, scores and data formats remain unchanged. Models are schematic. Regression checks cover nine model states, selection, hiding before answers and between questions. Browser smoke tests extended; actual browser/iPad rendering and learning outcomes remain unverified.

## Release 1.5.38

Constructed mathematics exercises in six skills, interleaved with existing questions every five tasks: number-line addition/subtraction, place-value blocks, clock setting, exact payment using coins, and rectangle construction at a given perimeter. Numeric and model tasks share existing level and progress scoring; edits are not attempts, a wrong submission or hint counts as assisted, worked solutions do not count as independent. Money and rectangle validators accept any valid construction and feedback describes the submitted solution. Controls work via taps and keyboard without drag gestures; no new storage keys. Corrected an incomplete addition equation and minute-hand wording. Design reference: https://ies.ed.gov/ncee/wwc/PracticeGuide/26 (representations, number lines, mathematical language). Models are schematic; browser/iPad rendering, complete accessibility review and educational outcomes are not verified. Regression tests cover generated model targets and alternatives, state transitions and mocked submission flows. Browser smoke script includes model interaction; syntax only unless subsequently documented.

## Release 1.5.39

Second-pass review of 1.5.38: lower geometry levels now construct a rectangle with specified width/height before advanced perimeter tasks; clock controls no longer show a visible digital answer and whole-hour tasks hide minute controls, while accessible labels remain. Number-line jumps outside the available range are rejected instead of silently shortening the jump. Extended generated-task checks for these conditions and reran the full regression suite. Removed no existing questions, books, storage keys or personal records. Actual browser/iPad visual acceptance remains outstanding: the local browser runtime cannot resolve the repository host. No claim of improved learning outcomes.

## Release 1.5.40

Added two constructed-response formats in the existing spatial/order logic skill, interleaved with earlier ordering questions: navigable mazes with obstacles and undo/reset (advanced levels require any shortest route), and quarter-turn figure rotation with left/right controls. Both validate the submitted state rather than requiring a specific sequence of button presses; generated mazes are checked for reachability. No timers. Added optional per-skill fields lastPractice, delayedDone and delayedCorrect inside the existing study storage record, validated in portable backups. They count only the first completed task after at least 24 hours since the last completed task in that skill, not a separate session or a standardized retention test. Older records are not retrospectively scored. Parent panel reports the new indicator separately; existing repetition schedule unchanged. Regression tests compare maze shortest-path lengths against a separate distance algorithm and cover rotation, interaction, backup and time boundaries. Browser smoke extended, syntax checked only. Actual iPad acceptance, comprehensive proofreading of the entire library, and educational outcomes remain unverified.

## Release 1.5.41

Second-pass spatial audit: advanced 5×5 mazes use staggered openings that force a detour beyond the eight-step unobstructed corner-to-corner distance, with four reflected orientations and variable gate rows. Stronger checks for genuine detours, invalid rotation controls and specific accessible grid descriptions. Refined Russian instructions. Pedagogical references: https://ies.ed.gov/ncee/wwc/PracticeGuide/1 (spacing and retrieval; the 24-hour metric is a local design choice, not a prescribed interval) and https://pubmed.ncbi.nlm.nih.gov/32212765/ (spatial language in preschool play; not evidence of this application's effect). No change to the earlier storage format additions, books or art. A separate review of the entire library and iPad acceptance remain outstanding.
