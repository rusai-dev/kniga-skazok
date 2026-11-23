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

## Release 1.5.42 — learning outcome measurement pilot

Separate optional “Мои открытия” assessment in three domains (word problems, money, sequences), each with two fixed forms of four constructed numerical answers. No hints, immediate correctness feedback, time limit, or impact on ordinary adaptive scores; “Не знаю” is recorded as unsuccessful, incomplete forms resume from the next unanswered item. Second form requires at least seven 24-hour periods after baseline completion, six additional completed in-app skill exercises, and 24 hours since the last completed skill practice. Practice during an interrupted second form is flagged. Parent view reports counts, not a mastery percentage or causal improvement. Baseline is current skill, not a pre-app measurement; forms are matched by design, not psychometrically equated. Outside practice, adult help, and device time cannot be verified. Existing progress and books unchanged; new assessment storage included in portable backups with validation. References: https://ies.ed.gov/ncee/wwc/PracticeGuide/1 and https://educationendowmentfoundation.org.uk/early-years/maths/use-manipulatives-and-representations-to-develop-understanding. Intervals and practice minimum are product pilot choices, not evidence-based cutoffs. Regression checks cover answer keys, eligibility, continuation, practice interruption and archive validity. Browser script syntax checked, actual rendering and real child outcomes still unverified.

## Release 1.5.43

Second assessment audit: flags practice interruption during the baseline as well as the second form; legacy assessment records without the optional baseline fields remain readable. After completing both forms, child can review only missed second-form items with 12 manually checked worked solutions and return to ordinary training. Explanations remain unavailable during assessment. Parent guidance now explicitly requests no answer help and warns about small sample size. Repeated assessments are not yet supported, and the bank needs broader coverage, calibration and independent real-life observations before interpreting changes as learning. Regression suite and browser script syntax checks performed; actual iPad verification outstanding.

## Release 1.5.44 — storybook home and progressive disclosure

First implementation cycle based on the six supplied PDF visual concepts (pages 3–5). Main screen now shows four large direct cards, with a compact path to other learning and a separate creative entrance. Four illustrations were cropped from the approved homepage concept (optimized local WebP sprite, 280×166 px; no composited screen or embedded labels). Existing fox and learning artwork reused. The previously always-visible personal library, author list and topic filters appear only after entry to personal books; explicit author/theme hash navigation retained. Family controls, backups and learning statistics are available on a separate adult screen, not repeated in the child learning hub. Completed exercises hide check/reset actions while keeping feedback and next. Fixed stale browser backup expectation (15 keys, not 14); the previous release passed regression but failed both browser engines at that assertion. No storage keys or book text changed. New browser navigation and layout assertions, full regression; image resolution deliberately modest, further high-resolution illustration and actual physical iPad comparison remain outstanding.

## Release 1.5.45

Second-pass simplification: top-level math, logic and science menus return directly to the opening screen; their duplicate links removed from “Ещё занятия” (language, memory, mixed practice, assessment remain there, along with real suggested review). Suppress redundant dialog close on screens that already have an explicit back button; Escape retains dismiss behavior. Completed constructed tasks no longer reserve an empty action bar. Removed repeated reading shelf introduction. Restore parser accepts the exact legacy checkpoint key set from before the added assessment field, without deleting newer assessment records. Added compatibility assertion and updated smoke navigation. Existing content and storage schemas unchanged. Actual browser test status is recorded by Actions, physical iPad and visual equivalence still need acceptance.

## Release 1.5.46 — inner screens, reading and creative focus

Applied the supplied visual references to actual reader, drawing and exercise surfaces: cream paper and warm high-contrast actions, a single inline reader-settings disclosure, larger mathematical artwork, and a collapsed help section that preserves existing assistance accounting. Memory exercises share the lesson style. Drawing defaults to 12 basic swatches, with all 32 available via one disclosure; rare tools are grouped, canvas takes priority, right-side palette in tablet landscape and bottom palette in portrait. No personal art is replaced. Base-ten illustrations are real state-driven SVG blocks, with ten individually countable faces per decade, and coin denominations are rendered on each coin. Added verification of block/coin counts and browser scenarios for reader controls, actual canvas strokes & gallery save; actual browser result remains in Actions. Original book art retained; not a claim of matching all supplied reference artwork or physical iPad testing.

## Release 1.5.47 — old iPad tab opens the wrong screen

Real user photos showed current branding over the personal library. The old author/theme hash route previously restored the shelf on startup, and the logo was the only unclear way home. First load/reload now normalizes legacy local author/theme fragments to the opening screen without touching localStorage. Navigation within a running session still supports back/forward to the shelf; an explicit #view=library&author=...&theme=... link is supported. Family/writer fragments are untouched. Non-home screens have one clearly labelled “← Главная” button in a compact sticky header. Added eight route cases and browser assertions for load, back, reload and sticky home. Photos support the screen diagnosis, not the exact fragment or the post-fix display on that device.

## Release 1.5.48 — PDF reference main screen and personal shelf

Implemented the approved uploaded PDF page 2 composition with a larger central gilded heading, cropped book-reading fox taken from the provided reference (203×125 WebP, no labels), larger pastel cards, original vector foliage and direct personal books link as one of three secondary paths. Kept existing working card illustrations and avoided duplicated navbar. Personal shelf now has one heading and collapsed author/theme chooser instead of the large banner and always-visible filter/sidebar, with title below cover retained and duplicated cover caption hidden only in shelf. No changes to personal stored data, book content, educational models or outcomes. Explicit modal return labels replace unexplained X; screens with their own return retain that control. Added tests for direct entry, filter disclosure, first-screen button and actual return. Further work: individual high-resolution art for all books/screens, exact reference composition, physical iPad usability and educational outcomes. Browser results in Actions.

## Release 1.5.49 — interior laboratory and forest maze

Applied page 4 reference to the existing maze renderer with an original illustrated meadow/stone board, visible plotted route, larger board and four directional controls in their spatial positions; no suggested solution, no change to maze generator or validator. Added a bean-seed prediction laboratory inspired by page 5: five controlled illustrative conditions, prediction before result, explanation after prediction. Light is not required for germination of bean seeds; the simulation is explicitly schematic, not a real growth experiment, and predictions do not modify assessed scores. Laboratory is available only after the first science answer and hidden on subsequent recall questions. Existing world progress, records and art preserved. Five seed-model states and new browser interaction assertions added. Source principle is consistent with the existing seed lesson; attempted external source search returned no results, so independent external verification is still outstanding. Full regression and browser syntax checks ran; actual browser results tracked separately. Physical iPad and learning outcomes unverified.


## Candidate 1.5.50 — PDF reference learning and creative interiors

Reworked the base-ten model into two equal illustrated panels with centered groups, ten explicit unit blocks per rod, and explicit zero states. Added color-matched controls and distinct primary actions. Refined reading spread, page navigation and evening-mode surface without changing pagination, bookmarks or art assets. Refined real drawing sheet and palette, including three-column palette in wide landscape. Kept all existing storage keys and educational validators. Full dependency-free regression suite passed in JS runtime, including 100 additional base-ten states; browser test syntax checked, browser execution and physical iPad validation pending. No claim of pixel-exact visual equivalence or measured learning gain.


## Candidate 1.5.51 — reader return and accessible mathematical controls

Reading view now uses a clear arrow-labeled shelf return with a descriptive accessible name. Base-ten controls expose independent named groups and maintain at least 44px targets in narrow layouts; book paging and the save action retain prominent touch targets. Added regression assertions for group names and a browser assertion for the reader return. Dependency-free regression and browser syntax passed in JS; actual iPad/browser execution and visual comparison are still outstanding. This is an unmerged candidate.


## Candidate 1.5.52 — visible art-mode entry

Standalone drawing now exposes three large named mode cards for free drawing, coloring and lessons, wired to the existing canvas, template picker and lesson pane. Existing storage keys remain unchanged. Dependency-free regression passed; browser/iPad testing and professional illustration expansion remain pending. Unpublished candidate.


## Candidate 1.5.53 — four-step drawing lessons

Four existing lesson subjects expanded from 3 to 4 stages, with previous-step navigation and dynamic step counts. Existing draft and gallery storage remain unchanged. Dependency-free regression passed; browser and iPad testing outstanding. Six professional lessons and full visual reference matching remain incomplete. Unpublished.


## Candidate 1.5.54 — six drawing lesson subjects

Added fox and butterfly to the existing four drawing lessons, with four cumulative instructional steps each, making six four-step lessons. The regression suite evaluates every lesson stage. These are still simple vector instructional outlines, not the professional artwork required by the approved PDF. Browser and physical iPad testing are not yet complete. This is not a published release.


## Candidate 1.5.55 — personal story search on iPad

Search across all user-authored stories regardless of the selected author or topic, with ё/е normalization, case-insensitive multiword title/body matching, clear control, result count and actionable empty state. Input has 16px font, safe scroll margin, focus scroll and Enter-to-dismiss keyboard. No data migration. Dependency-free regression passed; physical iPad Safari and browser visual checks pending. Unpublished.


## Candidate 1.5.58 — visual coloring catalog and workspace

Added 12 named and individually previewed coloring choices, using combinations of the existing four scene settings and four character drawings. Each selection opens the actual canvas with outline mode and flood-fill selected. Enlarged the canvas layout on the standalone drawing screen. All previous drawing/gallery storage keys remain unchanged. Dependency-free regression passed (including 4,800 math variants, 19 books and 12 coloring entries). These 12 combinations are **not 12 independent professionally illustrated assets**; watercolor concept illustrations have been prepared separately but are not yet installed in the application. Browser/WebKit and iPad verification and publishing remain pending. Do not treat this candidate as meeting the PDF artwork acceptance gate.


## Candidate 1.5.59 — lesson completion behavior

Drawing lessons now stop on their final step instead of wrapping unexpectedly to step one. The last button is disabled and reads 'Урок завершён'; the reference image has an accessible step label. No storage keys or gallery records changed. Dependency-free regression passed. The full 2.0 PDF is **not** implemented: 12 independent professional line-art assets, full browser/iPad checks and publication remain pending. Release remains on the working branch.

## Candidate 1.5.61 — independent coloring artwork, batch 1

Four original vector compositions, authored in code for this project on 2026-11-20: hedgehog-garden (hedgehog, flowers, butterfly), fox-owl-stream (fox, owl, tree and river), bear-library (bear, furniture and open book), kitten-balloon (cat in striped balloon basket). Source: index.html, originalColoring(), 720×480 design coordinates, scalable Path2D source; no external image source or third-party license. Catalog and working canvas use the same renderer. The other eight catalog items retain the old procedural combinations; this is not completion of the twelve-original-asset target. Existing storage keys, image format and gallery records are unchanged. Dependency-free regression passed; browser tests now render each original and check region-fill isolation, plus existing selection, history and draft recovery. Physical iPad, visual standard and professional art acceptance remain outstanding.

## Candidate 1.5.62 — all twelve distinct coloring compositions

Added eight independently authored vector compositions to the four from 1.5.61: undersea-palace, winter-village, forest-picnic, dragon-clouds, rabbit-workshop, squirrel-autumn, owl-observatory, forest-train. All 12 named catalog entries now use originalColoring() for both preview and working canvas. Provenance: project-original code authored 2026-11-20, index.html Path2D contours at 720×480 design coordinates; no imported third-party images or license dependency. Closed paths checked in JS; regression suite passed. Added browser assertions for distinct rendered images, a bounded fill in every scene and five successive independent fills in the undersea scene. Existing JPEG storage and gallery keys unchanged. This fulfills the independent-composition count, not a certified professional illustration standard; actual aesthetic and physical iPad acceptance, six enhanced drawing lessons, and broader PDF sections remain open.

## Candidate 1.5.63 — six-stage illustrated lessons

Replaced all six four-stage schematic exercises with six cumulative original SVG stages each (36 stage views), including characteristic shapes, expression, scene details and final color. The reference uses its own grid cell alongside the drawing sheet, rather than an overlay. Lesson mode does not modify the drawing, history or draft format; all previous storage keys retained. Original project-authored vector source in drawingLesson(), 240×215 viewBox, 2026-11-20; no third-party assets. Dependency-free regression passed including stage boundaries and distinct views. Extended browser smoke to traverse each subject, check canvas/reference separation and preserve the original pixels. Browser run and aesthetic acceptance pending; the examples are vector illustrations, not a verified professional-quality or watercolor asset set. Physical iPad and Pencil testing outstanding.

## Candidate 1.5.64 — expanded coloring library

40 named independent vector compositions (12 retained + 28 new authored Path2D layouts), 8-item pagination, categories, localized title/category search, favorites and recent selections, surprise selector; 72 named colors (16 basic, 56 additional), custom color and last four selections; real pixel eyedropper and distinct soft-brush/crayon stroke algorithms, direct chooser for existing pencil, marker, watercolor and other effects. Origins: original project vector code authored 2026-11-20 in originalColoring(), 720×480 canvas with 360×240 design coordinate system for new scenes; no third-party assets. Catalog preferences and recent colors use new separate optional local keys; drawing drafts and gallery JPEG format unchanged. No migration or deletion of existing drawings. The surprise selector draws from curated scenes; no unlimited new independent generated compositions claimed. Professional art quality and complete contour protection for every possible touch remain unverified. Regression and browser checks required; physical iPad/Pencil acceptance pending.

## Candidate 1.5.65 — safe gallery expansion and contour protection

Gallery ceiling 32 items, total serialized value ≤3,000,000 characters (matches portable archive validation). Old 8-item JPEG data and storage key retained; actual capacity depends on image size and device quota. Gallery writes refuse malformed records or exhausted capacity instead of overwriting previous data; existing export fallback and draft retention preserved. Backup validation accepts up to 32 JPEG records. Original catalog scenes (40) get a separate generated contour mask and a flood-fill barrier; brush/eraser strokes re-composite ink. Undo/redo tracks outline identity; optional local metadata ties the scene to the saved JPEG fingerprint on reopening. Existing drafts still open as before, but legacy drafts and non-catalog generated/raster scenes have no reconstructable protected layer. The optional outline metadata is not part of portable backups; restoration of protected outlines is local only. Regression tests cover 32 small images, quota/corruption refusal, and an independent fill barrier. Browser acceptance checks exact contour pixels under brush, eraser, fill and reload plus ten saved drawings. Physical iPad and professional visual acceptance remain unverified; no new scenes or unbounded gallery claim.

## Candidate 1.5.66 — performance budget, no image quality loss

Moved 12 book illustrations and 2 premium images from base64 in startup source into 14 local binary assets without re-encoding; existing alt text and credits retained. Original file bytes preserved; images requested by browser when needed, book covers retain lazy loading. The five initial source files (HTML, three artwork maps, learning CSS) now total 937,031 UTF-8 bytes before compression; enforce ≤1,000,000 bytes in browser CI, no book asset requests on initial home, and successful decoding of all 14 assets. Reuse one scratch canvas per catalog page instead of eight. Flood fill uses typed queues and direct neighbor/pixel operations, avoiding per-pixel temporary arrays; 500 deterministic randomized equivalence cases passed against previous implementation. Synthetic benchmark in development JS runtime only (not physical iPad). All existing regression checks passed. No change to storage keys, drawing resolution, scene count, lessons, brushes, palette or history depth. Browser and device-level performance/visual acceptance pending.


## Candidate 1.5.67 — offline artwork and coherent updates

Versioned core URLs bypass stale caches from earlier workers. The new service worker stages all five core responses on install, checks the matching HTML release, and keeps older caches as fallback. Exactly 14 known external artwork paths are cached only on first successful image request, with no startup artwork precache or re-encoding. Cache quota failure does not block successful online image loads. Art not previously viewed still needs internet; no claim of fully offline library. The HTML footer now matches the existing release detector (1.5.66 declared a JS version but had no version in the footer). No user storage keys, archive formats, canvas size, or art files changed. Added isolated Chromium offline smoke coverage, including storage preservation and zero artwork precache. Dependency-free regression executed successfully; browser CI and physical iPad acceptance pending.
The completed release shell is written only on installation, not on every navigation. Older unversioned core URLs retain a network-first legacy-cache fallback. New revisions must update the core URL revision, worker REV and footer together; artwork changes must use new filenames or a new artwork cache version.


## Candidate 1.5.68 — drawing lessons and resource lifetime

Nine cumulative six-step lessons instead of six (54 stages); new original owl, sailboat and mountain river illustrations teach symmetry, relative size, foreground/background, color and creative extensions. Existing subjects and drawing tools retained. Release hidden catalog preview and scratch canvas backing stores explicitly; release replaced outline canvas; load premium coloring thumbnail only in the template panel; avoid redundant JPEG encoding/writes when the current dirty drawing is already durably stored. Existing history depth and canvas dimensions unchanged; no changes to user keys or formats. Core initial source 941597 bytes, under 1,000,000. Regression suite passed, including nine distinct lesson sequences. Browser assertions added for lesson navigation and hidden-preview cleanup. Actual peak memory and physical iPad interaction not measured; professional visual/educational acceptance pending.


## Candidate 1.5.69 — two-stage reasoning in mathematics

At levels 2 and 3, five existing story structures and two purchase structures now require an independently entered intermediate result before the final answer. The original question, correct answer, full explanation, exercise generator and storage format remain compatible. Context-specific hints for both steps; wrong attempts or help mark the entire item as assisted. One exercise counts once only after final completion. Existing adaptive rules retained. No changes to artwork, dependencies or user storage keys. Initial source 944232 bytes under 1 MB. Regression checks include 368 deterministic intermediate results and simulated assisted/independent progression. Added real browser smoke exercise; browser and child/device acceptance pending.


## Candidate 1.5.70 — library filter readability

Fixes reported iPad view: theme chips were clipped by max-height and grid stretch left a large empty column. Full-width wrapping themes; first six include selected and owned-story themes; explicit All themes expansion; readable touch targets; compact author grid under themes. Search above filters, filters close on choosing a theme/author or starting a search. Existing search, routing, authors, stories and storage unchanged. Added portrait/landscape Chromium/WebKit smoke assertions for uncut chips, touch size, expanded selection, active visibility and search. Full regression passed. Initial source 946927 bytes under 1 MB; physical iPad and live deployment not verified.


## Candidate 1.5.71 — qualitative science models

Adds ice/temperature comparison and string vibration models to existing science lessons. Three distinct states per lab, explicit schematic limits, no real sound or numerical melting claims, no extra assets or dependencies. Models remain hidden before the first answer and on subsequent checks; storage and scoring unchanged. Regression passes 15 model states and 5 full lab transitions including the new labs; browser smoke has both new labs. Initial source 951011 bytes, under 1 MB. Physical iPad, learning outcomes and new browser run not yet verified. Includes explicit grid placement fix from 1.5.70 after browser logs showed authors above themes due to a legacy grid-row rule.


## Candidate 1.5.72 — Russian language and guided story writing

60 distinct language items instead of 36; added eight per skill (spelling, sentences, meaning) with level-specific pools and original typed spelling. Four writing stages (beginning, adventure, ending, revision), 16 optional prompts; random ideas remain. Prompts never insert or modify story text. No changes to storage keys, original art or dependencies. Regression passes 288 language cases and 16 guidance prompts. Browser smoke checks stage switching and preservation of the text. Initial source 960531 bytes under 1 MB. Physical device and pedagogical acceptance pending.


## Candidate 1.5.73 — author-first experience

Makes writing the top-level home action. Own-author draft picker lists separate existing draft themes and starts a new story only in an unused theme. Existing library and art/learning paths remain. Editor title and text precede optional cover/theme and formatting tools; larger writing field; prompts remain read-only. No migration, new dependencies or art. Regression passed with draft selection assertions. Browser checks cover opening writing directly, draft selection, blank new story and preservation of both original drafts. Startup 964019 bytes under 1 MB. Browser and physical iPad acceptance pending.


## Candidate 1.5.74 — author continuity and safe editor exit

Shows unfinished edits of the child's already saved books alongside new drafts, without changing originals or storage schema. Moves existing preview and save status beside text, adds quick save/close. Failed writes now protect generic Back/Escape; explicit save retries and can close without saving only after confirmation. Successful publication clears the failure flag. Browser regression scenarios inject a storage write error, verify the editor stays open, retry and check persistence, plus edited draft and preview checks. Static/functional regression passed. Startup 965825 bytes under 1 MB. Browser and real device checks pending.


## Candidate 1.5.75 — private story planning notebook

Optional six-field notebook inside the author editor: character, traits, place, wish, obstacle/action, ending. Notes are written by the child; no generated prose or compulsory fields. Autosave supports notes-only drafts; chooser uses hero name when title is empty. Bounded notes are retained in the existing library and portable archive, deliberately excluded by family fbook and story text export. Legacy drafts open without notes; no migration or new keys. Added regression checks for normalization, HTML escaping and archive retention, browser lifecycle for notes-only draft/reload/publish/privacy. Startup 968423 bytes under 1 MB. Browser/physical iPad and learning outcomes pending.


## Candidate 1.5.76 — child-authored chapters and preview

Optional editor chapter panel appends a named chapter to the end of existing text without replacing any authored prose; derives chapter navigation and individual-chapter preview from existing ## heading format. Entire-book preview remains the default. Legacy plain text not interpreted as headings; potentially ambiguous plain markup is not converted by the new append action. No new storage keys, no change to published/exported format or existing drawings. Regression passed 16 chapter partition cases and append/escaping guards; browser checks verify chapter text, navigation, preview, no writes during selection and publication. Startup 972984 bytes under 1 MB. This is chapter-based preview, not automatic page fitting; physical iPad and browser acceptance pending.


## Candidate 1.5.77 — free writing first

Direct entry resumes a draft or opens a blank editor without a required selection. Separate New Story and My Drafts actions; use an available theme without overwriting an existing draft. Neutral My Stories theme preferred. Title is optional; body-only publication uses a neutral title. Save, preview and publish beside body; all planning/design/spelling tools behind a closed optional section, drawing panel outside it. No migration or new dependencies. Registration of optional literacy scan is deferred while extras closed. Regression passed and browser scenarios exercise direct entry, hidden extras, title-free writing and existing draft retention. Initial source 975008 bytes under 1 MB. Theme-based draft capacity unchanged; browser and physical-device acceptance pending.


## Candidate 1.5.79 — independent private drafts

New stories always open a blank editor in neutral My Stories theme, with independent keys. Multiple drafts can use the same theme; selection is by exact draft key, and publishing removes only that draft. Existing theme-keyed entries and legacy single-draft fallback remain readable, with a reference in the legacy last-draft mirror for disambiguation. Existing keys and archive format retained; old releases may not list every new same-theme draft, so rolling back the UI is not a complete compatibility guarantee. No new assets or dependencies. Added regression cases for same-theme and legacy mirror selection plus browser lifecycle for two same-theme drafts, reload, re-open, publish independently. Syntax checked; full regression and browser CI required before release. Startup source 979185 bytes (previous 978544), below 1,000,000; physical device and actual performance unmeasured.


## Candidate 1.5.80 — private author editions

Optional manual history of up to three editions (title, text and rich formatting/images), with a combined 600,000-character serialized history limit. Restoring exchanges the current edition and selected slot instead of discarding current work. Explicit confirmed removal only; quota failure rolls back the attempted operation in the editor. Notes/theme remain unchanged. Existing archive format accepts validated optional editions; family fbook excludes private history. Legacy books open unchanged. No new artwork, dependencies, or keys. Regression passed; browser smoke includes save and swap. Startup 984388 bytes (previous 979185), under 1 MB. Physical-device acceptance and measured memory/time pending.


### 1.5.80 follow-up — personal reader and browser fix

Previous 1.5.80 PR browser run failed because the chapter selector matched two details panels; explicit chapter ID resolves the ambiguity. Added optional page reading mode from the existing personal book reader. Text and inline emphasis/headings retain their visible content, authored images are shown in order on separate pages; no rewriting, automatic art or library migrations. Layout uses actual viewport text-height fitting, font controls, swipe and arrow navigation, with approximate position stored in existing reading-offset map under an own: prefix. Full original reader and export retained. Tests cover markup and missing images, browser entry/return and fitting. Regression passed; browser rerun pending. Startup 990846 bytes; limit unchanged. Very long stories may take time to measure; physical iPad/peak memory unmeasured.


## Candidate 1.5.81 — family delivery visibility and freshness

Moves the explicit family publish action next to the personal publish controls; private drafts/private shelf remain private. Reader polls raw encrypted archive every 5 seconds while visible, wakes on focus/return/online, provides a manual refresh and revision/count status. Rate-limited public API freshness check (90 seconds automatic when raw revision is not newer, 15 seconds manual) mitigates stale CDN responses. Host retries pending delivery every 10 seconds and sends changed publication list immediately after a successful in-flight write. Explicit resync control; existing conflict guard and encryption unchanged. No changes to archive data, credentials or keys. Regression passed; browser checks required. Startup 993005 bytes under 1 MB. Cross-device timing depends on connectivity, GitHub and iPad foreground; actual family secret and private contents not inspected.


### 1.5.81 follow-up — family themes

The parent-facing shelf shows actual themes from published books only, with counts and filters, explicit theme labels inside book cards and opened books. Filtering persists across refresh while theme still exists; falls back to all if removed. No extra data transmitted, no archive/key changes, no draft exposure. Regression cases cover grouping, missing theme, counts; browser cases use synthetic books and simulate new publication. Startup 995123 bytes under 1 MB. Browser and physical device acceptance pending.


## Candidate 1.5.82 — lightweight release polling and encrypted family test

Routine same-version release check now reads release.json (21 bytes) instead of downloading index.html (888311 bytes). The network manifest is not precached; a missing/malformed manifest falls back to HTML, and a newer manifest triggers full HTML verification before reload. Existing unsaved-editor guards remain. Browser tests verify manifest/HTML/worker consistency, same-version fast path, staged release safety, fallback, and a simulated encrypted family archive update while CDN returns an older revision. No private data, network credentials, art or storage changes. Startup shell 995789 bytes under 1 MB, not a reduction in initial source size; savings apply to repeat version checks. Regression passed; real device timing and browser CI pending.


## Candidate 1.5.83 — white and turquoise interface

Implements the six specified colours, white paper, quiet cards, clear turquoise primary controls, focus and calm surfaces for home, writing, library, learning, drawing chrome and family. 456 CSS rules adjusted; excludes artwork, authored covers, canvas, swatches, diagrams and feedback states from bulk adjustment. Added targeted home/editor/family/reading/lesson rules. Retains optional evening reading mode and existing author colours. Fix attempted for prior WebKit failure by injecting fetcher into simulated archive check instead of replacing global fetch. No storage migrations, image changes or dependencies. Startup 999199 bytes, regression passed; visual screenshots/physical device and browser CI pending.


### 1.5.83 palette cascade correction

Both browser engines detected stale root palette overrides in the computed family interface. Removed 21 duplicate legacy CSS custom-property declarations, retained one shared root palette and unified surface tokens. Existing strict computed-style test retained, regression additionally checks that old ink definitions cannot override the theme. Startup 998872 bytes. Awaiting browser acceptance before release.


## Candidate 1.5.84 — identical binary UI sprites and startup headroom

After successful 1.5.83 release, moved two embedded WebP sprites to assets/ui/home-sprite-1548.webp and assets/ui/learning-sprite-1536.webp without re-encoding. CSS coordinates and drawing content unchanged; no JS dependencies or storage changes. Both sprites remain in the versioned offline shell, with MIME check on install and decoding tests while offline. Added computed palette checks for home and writing. Startup source budget 889044 bytes (was 998872); separate binary images 82386 bytes, combined 971430 bytes (saving 27442 uncompressed bytes; compressed transfer/latency and peak memory not measured). Images are needed on main and learning screens; do not claim they are all deferred. Full regression passed; browser CI required before publication.


## Candidate 1.5.85 — visible publication edition and safer deletion

Private author book cards and reader now distinguish private, selected-for-family and changed public snapshots. The comparison excludes private plans/versions/edits through fbook; selection is explicitly not a delivery confirmation. Moved publish action near the title; reader and library update after share/unshare. Changed deletion to transactional commitLibrary, retaining the story if storage fails and triggering archive sync on successful removal. No migration, automatic publication or archive/key change. Updated theme meta colour. Added regression and browser fixtures for all three states. Startup source 891105 bytes, including UI sprites 973491 bytes. Regression passed; browser acceptance and real-device tests pending.


### 1.5.85 follow-up — safe release polling and constructed number patterns

Previous WebKit run failed on intermittent access-control errors during periodic release fetches. Automatic checks are restricted to safe idle states, at most once per minute; removed repeated modal-close polling and abort in-flight check on pagehide. Actual network fetch explicitly uses window.fetch. No browser errors suppressed. Numeric logic patterns now require typed answers rather than three alternatives; visual shape patterns remain choices. Existing four levels, explanatory hints and independent completion tracking retained. Added 800 numeric pattern correctness cases and browser answer test. Source 891530 bytes; regression passed; CI required.


## Candidate 1.5.86 — draft rescue and coherent violet accents

PR #42 passed regression, Chromium and WebKit and merged before this candidate. Failed saves keep the editor open and offer raw UTF-8 text export; TXT does not include image bytes. Added centralized lavender/violet tokens for creative home entrances, optional writer tools, logic card, family theme labels and violet learning tile. White writing paper, turquoise primary actions, authored covers and drawings are unchanged. No schema changes. HTML 890668 → 892229 bytes. Updated release manifest and offline shell version together. Added computed-style checks in browser smoke; CI and actual deployment required. No physical iPad or runtime performance measurement claimed.


## Candidate 1.5.87 — family archive integrity and progressive classification

PR #44 passed regression, Chromium and WebKit before merge; malformed publication data blocks sync and publication changes instead of being treated as an empty archive; private save preserves publication source. New classification tasks replace two of three fixed-choice questions with four levels of independent numeric answers over labeled shapes (single attribute, conjunction, exclusion, inclusive disjunction). Existing semantic classification and adaptive state retained. 800 generated cases executed in isolated JS runtime, independently checking rule results and diversity. Browser fixture checks visual cards, numeric answer and completion. No schema migration or dependencies. HTML 896886 bytes; added CSS and generator only. Release manifest and offline shell bumped together. Full CI and actual deployment still required. Real-device usability and educational outcomes not measured.


## Candidate 1.5.88 — multicolour figures inside exercises

Classification tasks now use six named figure colours (turquoise, violet, yellow, pink, green, orange) rather than just two. Each generated task includes at least three distinct figure colours, preserving numeric answers, all four reasoning levels, adaptive scoring and the semantic classification interleave. Labels accompany colour for accessibility; no storage schema changes or extra assets. Regression verifies six-colour coverage, per-task variety and independent answer validation across 800 cases. Browser CI and physical tablet checks remain required.


## Candidate 1.5.89 — multicolour learning models

Attention tasks now use four colours at levels 0–1 and six at levels 2–3, with every colour shown in each board, controlled distractors and the same number of correct cells (3 or 4). Existing progress and memory rules stay unchanged. Shape-pattern illustrations use distinct natural red, blue, green and yellow; math clocks have blue hour and red minute hands, chart columns differ in colour, polygons vary in fill by side count. Regression independently recomputes answers and checks all colours and SVG fills on 400 attention boards. No new assets or dependencies. Physical-device visuals and learning outcomes remain unverified.

### Follow-up acceptance for 1.5.89

Pre-release audit caught a regression: quarter-hour and interactive clock rendering depended on literal stroke colors in SVG replacement regexes. Render both hands directly from hour/minute values, preserving the new colors. Added coordinate assertions for 144 five-minute clock positions, 160 interactive models and 200 generated quarter-hour questions. Data literacy now alternates four contexts (books, cones, postcards, bookmarks) on four levels, using tables and charts; 800 generated tasks independently recomputed from the displayed values. Full dependency-free regression passed against the modified code in the connector execution environment. CI and physical iPad remain separate acceptance gates.


## Candidate 1.5.90 — science knowledge transfer

Added one alternate applied question with an explanation to each of the 20 existing science topics. First visit remains unchanged; the concluding question on repeat visits rotates between the original and the new context (done % 3), while the existing first recall question, progress records, illustrations and session length remain unchanged. Regression verifies all 20 alternate questions and their rotation; full dependency-free suite passed before PR. Educational impact and physical iPad behavior remain unverified. No new resources or storage schema changes.


## Candidate 1.5.91 — voluntary creative writing guidance

Expand the existing writer helper to seven topics (28 prompts), including sensory scenes, dialogue, and four word-meaning contrasts. Quick ideas cycle through eight prompts for an empty draft and twenty for a nonempty draft; no extra required inputs, no automatic edits, no new data keys or network calls. Full dependency-free regression passed. Browser acceptance extends the existing proof that opening and cycling optional guidance leaves draft text and stored library unchanged. Physical iPad and educational benefit remain unverified.


## Candidate 1.5.92 — family archive rollback protection

Persist the highest verified GitHub archive revision in a separate per-room localStorage key, retaining the existing books-array cache and publication format. Reject older revisions after reopening the reader and on sequential checks in another tab; explicitly show stale-archive status. Write the revision before the cache; if either storage write fails, the previous durable books remain available and the current in-memory result is labelled unsaved. Equal revision can retry cache writes and refresh changed content. New verified empty archives remain valid. Legacy caches without revision metadata establish their watermark on first successful verification. Simultaneous tab writes are not guaranteed atomic; no real family archive was altered. Full dependency-free regression passed; physical-device and live family invitation latency unverified.


## Candidate 1.5.93 — family paginated reading

Reuse the personal adaptive full-screen reading component in the anonymous family viewer. Family-specific offsets are scoped to the archive room and book; no changes to publication payload or book format. Family preview retains the current edition when other books arrive. The fullscreen reader keeps its opened edition until closed; withdrawal closes the reader. Add browser checks for long stories, paging, saved location, and unrelated archive updates. Full dependency-free regression passed. Browser CI and physical iPad remain separate gates; no real archive modified. Size and reading-position storage are local only.


## Candidate 1.5.94 — coordinate directions reasoning

Coordinate questions progress from one to four non-repeating moves by level. Six legible marker palettes, four valid in-grid answer choices, and full route explanations. Fixed previously unreachable coordinate question path: n % 12 === 7 bypasses verbal-order questions while preserving existing sequence, maze and rotation practice. Regression independently reconstructs 4,000 routes, validates SVG start coordinates, all six colors, options, explanations, and actual routing; full dependency-free regression passed. Browser check added; physical iPad and educational benefit remain unverified. No storage or archive format changes.


## Candidate 1.5.95 — colourful money constructions

Four stable, labelled denomination panels in blue, green, amber and violet, larger high-contrast digits on schematic tokens, explicit counts, and four rotating purchase contexts. No change to payment targets, accepted combinations, progress keys, scoring or private data. All existing tests and 560 additional mixed and maximum-capacity SVG cases passed in the dependency-free regression runner; contrast checks cover token digits and category labels. Browser interaction added for exact payment and visible denomination palette. HTML 910949 → 911430 bytes; no new assets or dependencies. Browser CI, physical iPad and learning outcomes remain separate acceptance gates.


## Candidate 1.5.96 — visual geometry reasoning

Explicit geometry generator for all four levels. Rotated and stretched polygons with six fills teach sides and vertices; proportional rectangles label opposite pairs in purple and blue; level 3 alternates direct perimeter and inverse unknown-side problems. Interactive constructions keep existing constraints and scoring, with the same side-pair colors. 1,600 independent geometry checks including 200 inverse tasks passed alongside the full dependency-free regression. HTML 911430 → 914150 bytes; no new assets, libraries or data keys. Browser CI and physical device acceptance pending. The diagrams are schematic, not physical centimetres.


## Candidate 1.5.97 — water and air investigations

Two interactive investigations in existing science topics: evaporation, cloud formation and rainfall; air occupying space in an inverted cup and escaping as bubbles when tilted. Three labeled color diagrams per topic; no simulated timing or visible-water-vapor claims. The labs reuse the existing reveal-after-prediction and next-question workflow, with no new screen, persistence keys or external resources. Expanded regression covers 21 states and seven lab interactions, plus six new diagram checks. Full dependency-free suite passed; browser scenarios extended. HTML 914150 → 918342 bytes. Physical iPad, real-world learning and deployment remain unverified.


## Candidate 1.5.98 — lunar phases and honey-making investigations

Two additional existing science lessons now include three-state labelled SVG models. The Moon diagram separates fixed solar illumination and a schematic orbit from the Earth-view disk and explicitly distinguishes ordinary phases from eclipses. The honey model follows nectar collection, processing and storage, without implying all bee species produce honey. Reuses the existing lesson flow and progress keys. Full dependency-free regression passed (27 lab states, nine interaction paths, six additional nature/space checks), browser cases extended. No new assets or dependencies. HTML 918337 → 924096 bytes. Actual device usability, learning benefit, publication and browser CI remain separate gates.


## Candidate 1.5.99 — flexible attention rules

Five rule types replace the previous two, with color-only and form-only at the foundation, conjunction and exclusion at higher levels, and inclusive OR at the highest level. Explicit overlapping distractors and visible check marks distinguish features and results without color alone. Feedback reports correct selections, missed and extra cells, with existing untimed practice, scoring and progress storage unchanged. Full dependency-free regression passed including 4,000 attention cases and existing 1,200 memory tasks. Browser interaction added. HTML 924090 → 926010 bytes. Browser acceptance, physical iPad and learning outcomes pending.


## Candidate 1.5.100 — construct a short story

Eight original mini-stories with causal and chronological dependencies. At levels 2–3 the existing sentence practice alternates multiple choice and construction of a four- or five-sentence narrative. Reuses existing sequence controls, hides ordering rules until the learner tries, uses shuffled colored cards, and accepts only the original causal chain. Incorrect attempts provide a strategy hint; independent scoring and existing progress storage preserved. Full dependency-free regression passed, including 400 story order cases and adjacent swaps, browser scenario added. No new libraries, data keys, or changes to author text. HTML 925822 → 931883 bytes. Browser CI, physical iPad and educational outcomes remain separate acceptance gates.


## Candidate 1.5.101 — expressive vocabulary for authors

Optional, initially collapsed word workshop in existing author extras. Fourteen familiar words with 35 alternatives and contextual examples; explains shades of meaning and warns that substitutions depend on context. No automatic replacements, data writes, external requests or new storage keys. Full dependency-free regression passed, browser cases check switching words, clearing selection and unchanged draft/library. HTML 931883 → 938647 bytes. Browser, real device and educational acceptance pending.


## Candidate 1.5.102 — bounded versioned shell storage

Previously every installed release retained its own full versioned cache. Activation now keeps the current and two newest older versioned shells, preserving legacy caches, future installing versions, unrelated caches and lazily cached book artwork. Requests for older versioned core files consult the retained prior cache. Cleanup cannot block successful activation; no localStorage or IndexedDB access. Service-worker update requests are coalesced with a 60-second minimum interval across focus, visibility and online events. Full dependency-free regression and numeric revision pruning self-check passed; Chromium seeded cache cleanup and previous-version offline fetch assertions added. HTML 938647 → 938810 bytes. Actual storage usage and cold-start timing not measured on iPad; all materials retained.


## Candidate 1.5.103 — deferred reading banks and shelf rendering

Avoid creating three static reading question/glossary objects at initial script execution (24026 bytes of source data); create once on first use, retaining inline offline/file support. Cache validated immutable book catalog and use one history, progress and favorites snapshot per shelf update instead of repeated storage parsing per book. No book contents, art, user data, or network dependencies changed. Full regression passed including deferred/memoized bank assertions, 19 books, 38 quiz questions and 32 terms; browser assertion added for deferred banks at home. HTML 938810 → 939402 bytes. This optimizes allocation and repeated parsing, not network transfer. Device timings/memory remain unmeasured.


## Candidate 1.5.104 — verified absence of family archive

A raw CDN 404 is no longer sufficient to declare an archive absent. The independent anonymous API must also return 404; temporary errors invalidate the in-memory absence confirmation, without increasing polling frequency. A previously received shelf remains readable and shows a separate unavailable status. No changes to publication content, encryption, storage keys or actual family archives. Full dependency-free regression and six isolated status transitions passed; browser scenario covers throttling, two 404 responses and API failures. Cache test versions derived from release manifest rather than hardcoded. HTML 939402 → 939883 bytes. Browser CI, live family invitation and physical-device acceptance remain pending.

### 1.5.104 follow-up — combined acceptance and truthful empty shelf

Retargeted #62 to main to run the mandatory browser checks on the combined #60–62 candidate; original branch base and main have identical Git trees. On a failed refresh, the empty shelf explicitly says a fresh list has not been retrieved, and populated shelves keep cached books. Full dependency-free regression and six isolated viewer states passed; additional browser fixture tests empty/populated shelves. HTML 940247 bytes; no data key or format changes. No physical device or live family data tested. Merge only after green CI on this exact candidate.

### 1.5.104 release blocker — classic author shelf

CI 44719128356 passed regression but failed Chromium and WebKit with snapshot.favorites.has undefined. Array.map(bookShelfCard) implicitly supplied the array index as the new snapshot parameter. Both shelf routes now use a shared readingShelfSnapshot and explicitly pass it per book. Regression exercises the real author mapping expression with three books and verifies distinct reading states and favorites; browser smoke opens a second Pushkin book, with stack traces retained. Full dependency-free regression passed. HTML 940247 → 940363 bytes; no storage or archive changes. Browser rerun required before release.

### 1.5.104 CI environment fix

Run 44719882395 Chromium failed before browser launch: ubuntu-latest resolved to Ubuntu 26.04 and apt could not locate required fonts. Pin both jobs to Ubuntu 24.04 and refresh apt indexes before Playwright installs browser dependencies. Retain all regression and browser checks without reducing coverage. Browser rerun is mandatory; this change does not alter application resources or stored data.

## Candidate 1.5.105 — measuring lengths on a ruler

Existing measurement practice alternates numerical word problems and original multicolor centimetre-scale diagrams. Level 0 reads from zero; level 1 begins at a nonzero mark; levels 2–3 also compare two independently placed ribbons labelled A/B, with no answer printed. Accessible descriptions give endpoints rather than results, and diagrams explicitly note they are schematic. Existing typed-answer flow, skill identifiers, spaced review and scoring unchanged. Full regression passed with 1,600 independent SVG checks including 400 comparisons; browser interaction added. HTML 940363 → 943247 bytes; no assets or dependencies. Physical device and learning outcomes remain unverified. Suggested off-screen transfer: measure a pencil from zero and then from another mark, compare both results.

### 1.5.105 consolidated ruler tasks

PR #63 independently introduced combined-length tasks. Retain #64's five-color diagrams, schematic label and older text exercises; incorporate combined length at level 3 without duplicating generators or releases. Regression covers 1,600 diagrams (300 differences, 100 sums), plus browser scenarios for both. Separate audit of 8,000 coordinate questions reconstructed each route from its actual text and checked bounds, options and endpoint (0 shortened routes). HTML 943247 → 943473 bytes. No new user data changes. #62 merged after mandatory checks; #64 to main for fresh CI.

### 1.5.105 — construct mirror reflections

The existing spatial workshop now interleaves advanced reflection tasks with coordinate tracking, rotating figures and finding routes. Child toggles nine labeled cells to construct a mirror image across a vertical axis; color never replaces cell labels. The learner's selection, reset, wrong-answer guidance, correct response, solution and adaptive scoring use the existing workshop; no new screen or data key. Tested 400 independent reflected patterns (200 distinct patterns, 5 colors), plus spatial suite and browser case. HTML 943473 → 946770 bytes, initial 950186 of 1,000,000. Candidate #64 had no workflow after retargeting; this substantive commit triggers mandatory CI. Physical iPad and learning outcome remain unverified. Transfer: draw a pattern on graph paper, fold along the axis and recreate its mirror.

### 1.5.105 — correct release identity and cache URLs

CI 44722963246 passed regression but both browsers failed with destroyed execution context on navigation (Chromium line 36; WebKit line 64). Source inspection confirmed stale APP_RELEASE and four stale core URL versions, despite matching footer, release.json and worker. The app would detect its own release as newer and replace the location again. Align all five references with 1.5.105. Add preflight checks of actual runtime identity and all versioned core URLs, in addition to manifest, footer and worker. Keep actual browser and offline tests intact. No change to size or storage schema. Full dependency-free regression passed. Browser rerun required.

## Candidate 1.5.106 — deductive reasoning with adjacency

Advanced deduction alternates old exclusion tasks and three seating contexts with mixed exact position, immediate adjacency and forbidden position. One unique solution; child constructs the order using existing sequence controls. Added new next constraint with explicit numbering, specific failed-condition feedback, and no change to keys, adaptation, or stored data. 800 tasks and 57600 permutations independently checked; full 67 regression groups pass. Browser scenario added. HTML 946770 → 947662; initial 951078 bytes. All six HTML release identifiers, worker and JSON updated together. This branch depends on #64; retarget when #64 passes mandatory checks, do not merge before then. Learning effect and physical iPad unverified. Transfer: arrange five toys from spoken neighbor and position clues.

## Candidate 1.5.107 — safe illustration removal in author workshop

Before: a single image-removal click immediately mutated editor images/text and cover; a storage failure left the mutation in memory and subsequent saves could remove the picture. Now confirm removal, preserve the original image slot, cover, cursor, and exact body on a failed write; no stripping literal markers when markup is off. Do not allow removal during a pending upload or unsaved drawing. Pure helper and regression checks plus synthetic browser scenario: cancel, quota failure, restore picture/cover/body, retry, save. All 68 dependency-free regression groups passed. HTML 947662 → 948443 bytes; initial 951859 of 1,000,000. No storage schema or publication changes. Branch depends on #65; mandatory browser gate before merge. Physical iPad and real family archive unverified.

## Candidate 1.5.108 — accessible multicolor spatial practice

Darken blue and orange mirror colors, retain five distinguishable task colors, show an explicit checkmark on selected controls. The main spatial and seed-lab action uses the shared teal token instead of a low-contrast green gradient. Added 90 rendered SVG label/background contrast checks and browser assertions for the selection mark and primary button. HTML 948443 → 948615 bytes. No new assets, learning progress or data schema changes. Candidate depends on #66; merge only after all mandatory checks on the combined branch. Physical iPad and learning outcomes remain unverified.

### 1.5.108 — transactional TXT import and consolidated acceptance

TXT import previously replaced open prose and reported success even after a failed draft write. Now reject empty input and stale text/title, guard drawing/upload, retain the original as an existing-format private edition before replacing nonempty prose, refuse replacement when edition capacity is insufficient, restore text/title/selection/versions on write failure, and show success only after storage confirms. Browser tests use synthetic files for cancel, quota failure, successful version preservation and blank input. No new data key. HTML 948615 → 949989 bytes. Combined PR #67 targets main; require all browser and regression checks on the combined commit, not just earlier #66. WebKit #66 was cancelled during dependency installation and retried.

## Candidate 1.5.109 — lazy brush previews

Previously 26 effect canvases were created and drawn on every author-editor open, even without drawing. Create and render them only when the effect pane opens; explicitly release their backing stores when it closes. Preserve all 26 effects, labels, selection, canvas size, drawing persistence and authored art. Regression guard and browser checks cover zero canvases during writing, 26 visible previews, nonempty preview rendering, disposal and reopening. HTML 949989 → 948647 bytes; estimated initial source 952063 bytes. Avoid 104000 preview pixels (~416000 raw RGBA bytes, not measured device memory) and associated drawing work until requested. No new data keys or dependencies. Full mandatory CI and real device timings pending.

## Candidate 1.5.110 — bats and ancient Egypt

Four new discovery lessons, six distinct question forms each, four original SVG illustrations, a new history/places category within existing World room, and real-life or creative transfer activities. Existing review and progress engine unchanged. Scientific references: Smithsonian Bat Facts https://www.si.edu/spotlight/bats/batfacts and Bat Conservation International FAQ https://www.batcon.org/about-bats/faq/ ; history: British Museum school materials on daily life and writing, Met Museum https://www.metmuseum.org/essays/papyrus-in-ancient-egypt . Writing artwork uses deliberately labelled schematic symbols, not purported authentic hieroglyphs. Browser tests cover each new topic end to end and storage; existing generated question and unique art checks cover new entries. HTML 948647 → 963784 bytes; estimated starting source 967200 bytes. No new dependencies or storage keys. Physical iPad and learning outcomes not verified. Mandatory CI pending.

## Candidate 1.5.111 — bat echo and Nile field models

Two new three-state interactive schematic models in existing discovery lessons. Show only after first independent prediction or 'Пока не знаю'. Echo compares round-trip paths at constant sound speed; Nile compares near river, dry distant field and canal irrigation, not a historical map or real simulation. Add four optional themed writing prompts into existing creative toolbox, never insert text. Tests extend lab state and interaction count from 27/9 to 33/11, and browser assertions for near/far wall and channel presence. Existing progress, keys and author data unchanged. HTML 963784 → 968083 bytes; estimated initial source 971499 bytes. No libraries. Depends on #69. Mandatory CI and actual device timing/learning outcomes not verified.

### 1.5.111 acceptance correction

Run 44739698365: regression passed, Chromium and WebKit rejected the Nile channel visibility assertion. An SVG horizontal stroked path has zero geometric height for the visibility check. Use a positive-area rounded water rectangle (same 9-unit thickness) and verify visible geometry and actual fill. Added end-to-end themed prompt selection and author-text preservation. No data changes. Re-run full CI before merging.

## Candidate 1.5.112 — family archive consistency and truthful status

Reject a different book payload claiming the same revision as an already verified in-memory archive; keep the current list and cached books. Preserve recovery on reload after failed cache write (received not yet true). Distinguish authenticated archive write/current equality from anonymous verification; if verification fails, advertise pending public reading rather than a failed write. Synthetic regression and browser conflict checks; no real family data, network writes, credentials or storage format changes. HTML 968083 → 968539 bytes. Mandatory CI pending; depends on #70. Real family delivery delay not verified.

## Candidate 1.5.113 — nocturnal wildlife reading room

Dedicated sixth category within existing World screen, selected initially; eight original illustrated reading chapters, optional riddles with answers, chapter navigation, two new owl lessons and preserved two bat lessons/progress. No quiz gate to reading. Source checks: Bat Conservation International https://www.batcon.org/about-bats/faq/ and https://www.batcon.org/about-bats/bats-101/ ; Audubon https://www.audubon.org/magazine/13-fun-facts-about-owls ; Cornell Lab species profiles. Two new original owl SVG scenes, reused bat art. Existing question engine and keys unchanged. Browser tests cover all chapters/riddle/navigation, all four lessons, persistence, existing labs. Startup estimate 990063 bytes (limit 1000000). No new dependencies. Mandatory CI pending.

## Candidate 1.5.114 — nocturnal reading quality

Ten chapters, each with a distinct schematic illustration; seven new chapter-specific compositions and two extra chapters comparing named species. Verified educational references: https://www.bats.org.uk/about-bats/what-are-bats/uk-bats/common-pipistrelle ; https://www.bats.org.uk/about-bats/what-are-bats/uk-bats/brown-long-eared-bat ; https://www.allaboutbirds.org/guide/Barn_Owl/id ; https://www.allaboutbirds.org/guide/Snowy_Owl/id . Remember chapter inside existing compatible reading-offset map, preserve other book positions and show truthful save status. Three-column desktop discovery tabs, two on small screens. Browser covers all ten chapters and resume; regression checks unique art and compatible offset. No new dependencies or keys. Initial source estimate 996601 bytes. Full CI and physical iPad pending.


## Candidate 1.5.116 — restore startup budget without losing night chapter navigation

Main 1.5.115 was deployed but browser CI 44749339131 failed preflight: 1,001,665 source bytes > 1,000,000 limit; regression passed. Integrate the previously tested PR #74 obsolete-art removal and lazy lesson preview on top of main, retaining all ten night chapters and new illustrated contents. Preserve author data, existing progress and drawing state; no new keys, dependencies or assets. Add touch target, artwork, and horizontal-overflow assertions to both tablet viewport browser cases. Source bytes 1001665 → 996084 (limit unchanged); syntax checks passed. Mandatory CI on combined candidate required; no physical iPad, real family archive or measured hardware speed verification. Release IDs synchronized across HTML, service worker and manifest.


## Candidate 1.5.117 — invalidate obsolete family publication confirmation

1.5.116 passed regression, Chromium and WebKit in run 44753355414 and merged. Family GitHub writer could retain a previous confirmed payload for five minutes after a different archive write succeeded but anonymous verification failed. If the author restored the earlier published state during that window, the writer would skip synchronization, leaving the other payload online. Invalidate the prior confirmation whenever a new synchronization starts; only a successful existing verification path can establish it again. Synthetic behavioral test uses actual extracted writer and mocks both remote archive and anonymous read: A verified → B written/verification fails → A restored → write and independently verify A, followed by normal throttling. Negative control fails on old implementation. No real archives or user data touched; no changes to storage formats or keys. Startup source 996084 → 996194 bytes, limit unchanged. Mandatory CI pending, actual family network/iPad unverified.


## Candidate 1.5.118 — nocturnal book to independent investigation

Every one of the ten existing chapters now has a distinct optional open-ended transfer prompt and a link into the existing relevant science lesson. A child can return directly to that chapter, even after answering or revealing a first question; normal World navigation is unchanged. No additional quiz gate, storage keys, assets or dependencies. Existing science practice, spaced review and progress engine reused; open-ended responses are not scored. Content uses facts already checked in 1.5.113/114; prompts ask comparison, reasoning, drawing and safe decisions. Regression checks all ten prompts and lesson targets; browser verifies chapter 8 → practice → same chapter and saved reading position, touch target; previous tests remain. Startup 996194 → 998380 bytes. Hypothesis: child can transfer a fact from the book to another situation; verify by asking for an explanation later without the book. Actual learning outcomes, iPad and network performance not verified. Candidate depends on PR #75; must pass all checks and be retargeted to main once #75 is merged.

Additional acceptance: chapter 2 opens the echo model only after an independent attempt or 'Пока не знаю', can move the wall and return directly to chapter 2; clarify the quiet/rustling comparison question to hold the source sound constant.

1.5.118 CI 44754623784: regression passed; both browser jobs failed because the original `.night-riddle p` locator matched the riddle answer and added transfer prompt. Scope the answer to `details.night-riddle` and give the research section a distinct class. Preserve the assertion that the riddle answer is visible after expansion. Re-run full CI.


## Candidate 1.5.119 — first real Art Bible assets in World

1.5.118 passed run 44756938906 and merged. Integrate ART-02 and ART-03 from pages 31–32 of the supplied Art Bible, as 128px WebP thumbnails for 46–64 CSS px world category icons only. Both source checksums verified; binary transfer Git blob IDs matched exact local files. These are decorative, not factual plates. Preserve all ten night chapters and all science diagrams. Use existing SVG until image decode succeeds and on error; no image or full-size cover preload on home. Service worker caches these two exact URLs on first use, not during install. New binary bytes 9328 (only after entering World); source 998395 → 998987 of 1000000. The existing budget measures source files, not all transferred resources: actual initial network cost and iPad timing have not been measured; no new startup image requests intended. Registry records image/source hashes. Browser tests include forced failure fallback, actual image decode, dimensions, no initial request and Chromium offline cache. No new storage keys, dependencies or personal data touched. Art review is self-review; mandatory CI pending. Full-size covers and individual chapter paintings remain separate future work.


## Candidate 1.5.120 — Egyptian writing model and reproducible artwork

1.5.119 passed mandatory CI 44758515907 and merged at 25046cc. Add three-state optional experimental model to existing Egypt writing lesson: identical invented symbols with two keys and no key. Explicitly not real hieroglyphs; no new historical factual claims. Name the existing category Ancient Egypt; preserve all lessons and existing progress. Remove three truly unreferenced helper functions and obsolete studyAdvance declaration (current adaptive implementation unchanged except declaration). Regression suite executed against complete candidate HTML; browser acceptance includes all three code states at both tablet orientations. Startup 998987 → 999026 bytes; existing limit unchanged. Build-time extraction tool from PR #77 extends 128px thumbnail derivatives with exact locally verified encoder parameters (LANCZOS, WebP quality 55/method 6); two source thumbnails were independently reproduced byte-for-byte from supplied PDF in local Pillow environment. Larger 320/504 cover candidates remain draft. No new runtime dependencies or storage changes. Mandatory CI and live deployment pending; actual iPad and learning outcomes not verified.


## Candidate 1.5.121 — responsive Art Bible scenes for night and Egypt

1.5.120 passed CI 44759400042 and merged at 756bd5b. Extract and verify ART-01–03 from supplied PDF, create six responsive WebP derivatives (320/504px), exact Git blob hashes verified on transfer, source/checksum registry updated. Integrate owl cover on selected night section, Nile atmospheric cover on selected Egypt section, decorative bats scene only in chapter 8; explicitly not a species plate, no replacement of comparison SVG or facts. No full art in contents; no startup image requests intended. Existing SVG fallback for covers, existing illustration retained in chapter if loading fails. Lazy cache exact files on first request; tests check decode, fallback, both orientations, offline and preserved chapter. CSS commentary removed, declarations unchanged, source 999026 → 998251 bytes (limit unchanged). Six files 265098 bytes total, loaded on demand. Entire existing regression suite passed in isolated JS execution; CI pending. Physical iPad, actual timing, screenshots and species-specific plates not verified. No new storage keys or dependencies. Original artwork not upscaled.


## Candidate 1.5.122 — illustrated free-writing entry

1.5.121 main at 7b5a0a9 passed Quality checks and Pages deployment. Integrate exact supplied ART-04 (page 32) as a 144px, 5,460-byte WebP on the main author button, source and Git blob hashes verified. Keep the existing SVG as an error fallback, unchanged button, direct entry and white editor. No storage, draft, publication or other artwork changes. Small essential image included in versioned offline shell; browser acceptance tests decode, fallback, direct author entry in both tablet orientations and offline core. Existing source budget 998251 → 998572 bytes, unchanged 1,000,000 cap. New image adds 5,460 encoded bytes separately; browser tests log first-screen same-origin encoded and transfer bytes, not claimed as hardware timing. Existing full regression executed against complete candidate in JS isolate and passed. CI and real iPad/child observation pending. Art review is self-review; no new third-party dependencies. Build-time pipeline reproduces exact ART-04 dimensions and encoding.


## Candidate 1.5.123 — lossless source representation and immutable artwork reuse

1.5.122 passed mandatory CI 44764087609 and merged at d550390. Re-encode static SVG/drawing markup and omit redundant quotes on safe object keys in selected reading/world data. Exact decoded equality verified for 67 scene/book/lesson records and two markup strings. All content, images and models preserved. Full regression passed against candidate in JS isolate; drawing navigation assertion checks actual markup. Source 998572 → 995128 bytes; reserve 4872 bytes. Worker install reuses immutable UI images with valid image MIME from older versioned shells; missing/invalid entries go to network, HTML and JS freshly fetched. Synthetic test covers age ordering, invalid MIME, fresh core and cold install. Up to 87,846 cached bytes eligible for update reuse (not observed network savings). No data keys, dependencies, shell retention or image quality changes. Existing browser offline tests retained. Mandatory CI pending; hardware timing, child observation and real family delivery unverified.


## Candidate 1.5.124 — night world: evidence-based bat comparison

Depends on PR #82 at c4acf8a; do not merge unless it passes and main is compatible. Preserve ten chapters, bookmarks and artwork. Add optional chapter 8 shared-axis body-length ranges, wingspan and mass sourced to Bat Conservation Trust species pages; explain overlapping ranges and why one measurement cannot identify a species. Add ear-folding and feeding differences; retain artistic vs scientific distinction and optional link to existing lesson. Source references and ten-chapter scene plan stored in docs/night-world-sources.md. New series paintings and exact species portraits remain draft, not claimed delivered. No new runtime images, requests, dependencies, storage keys or progress score. Source 995128 → 997286 bytes; full regression against candidate passed, browser tests add collapsed/reveal/return/no-overflow scenario. Browser CI pending. No physical iPad, child observation or actual family delivery tested.


## 1.5.124 — interactive bat comparison, CI correction

1.5.123 passed all required checks and merged at 16641b9. Both browser jobs for the original 1.5.124 SHA failed on a non-unique legacy .night-riddle summary selector (three summaries after the new comparison); target the original riddle by stable ID and retain all ten chapter assertions. Add an optional movable body-length marker (30–60 mm), accessible slider and 44px +/- buttons, both-range/one-range/no-range textual feedback computed from the same verified intervals, 18px explanation and a soft teal/lavender surface. Existing ART-01 scene and scientific diagram retained, no new painting claimed. No new resources, dependencies or storage changes. Boundary tests and full regression passed in JS isolate. Browser tests now exercise slider keyboard and button paths. Source 999010 bytes, cap 1,000,000. Candidate CI pending; no real iPad or pedagogical observation. Next: original chapter art and screen quality register; no personal data accessed.


## Candidate 1.5.125 — new original chapter 3 art

Based on 0870407, pending PR #83; requires compatible main and green checks. Create new original bedtime-roost painting (1254px square master stored separately in personal Library), verified Git blobs for 320px/25,114B and 504px/53,574B WebP at quality 65/LANCZOS. No species identification claim. Chapter 3 only: responsive artwork, descriptive caption 16px/1.4, old SVG as loading/error fallback. Existing chapter 8 comparison untouched. No home/contents request or precache for full art; existing lazy offline cache. Manifest contains dimensions, exact source/derivative hashes and provenance. Source lossless compaction: 88 safe JSON object properties compared decoded before/after; removed blank lines only in CSS. Source 999010 → 998917 bytes; limit unchanged. Full regression executed in JS isolate, syntax checked browser test and worker. New browser scenarios verify selected chapter decode, caption size, fallback, cache and offline opening, retain all ten chapters, no home or contents requests. New assets total 78,688 bytes on demand; cold-load performance on hardware unmeasured. No changes to personal data, storage formats, writer, or family publication. Original art self-review, not independent verification. Mandatory CI pending.


## Performance instrumentation follow-up (test-only)

Correct previous HOME RESOURCE BYTES sample: it was recorded after entering library and math/logic. Sample true cold home in both tablet viewports before clicks, record encoded and transferred bytes and navigation timings, forbid optional heavy resources and enforce provisional 1.2 MB local encoded response cap in addition to unchanged 1 MB source limit. Keep cumulative scenario measurement separately. No runtime, version, images or user storage changed. Syntax checked; browser CI pending. See docs/performance-budget.md for baseline and safe architecture plan. Depends on PR #84.


## Candidate 1.5.126 — defer hidden shelf construction and book allocation

PR #86 passed regression, Chromium and WebKit (44775192738), merged at e449747. Cold home previously constructed a hidden library, including topic/author buttons, hero art and potentially personal book cards. Skip render while hidden but retain storage status; normal navigation builds fresh data on entry. Remove exact duplicate inline hero SVG (identical to retained bearArt); no artwork removed. Construct and memoize reading catalog only on first demand. All 36 book records compared byte-for-byte by serialized decoded data, preserved order, IDs, images and text. Source 998917 → 992885 bytes; reserve 7115. No new requests, storage changes or dependencies. Existing offline content remains bundled. Full regression passed in isolated JS execution; new browser assertions verify empty hidden shelf/cold catalog, first-entry construction and existing authoring/reading scenarios. Hardware timing, memory, physical iPad and family delivery not measured; mandatory CI pending. This is first safe optimization, not yet the 800–850 KB target; genuine deferred content transfer remains distinct.


## Candidate 1.5.126 — cold home CI correction

CI 44775953162: regression passed, both browser jobs failed at the cold hidden-shelf check (6 buttons found). Root cause: static placeholder markup (four topic buttons and two author buttons), not runtime shelf construction. Remove those placeholders and the inactive mock new-page button; library entry still uses existing render, all data unchanged. Tighten browser check to include every book/hero child and confirm cold direct writing does not allocate reading catalog. Full regression passed in isolated JS execution; browser tests syntax checked. Source 992885 → 992368 bytes; total 6549 B below 1.5.125, reserve 7632. No data keys or artwork changes. Browser CI required again. No physical iPad or actual delivery verification.


## Candidate 1.5.127 — lossless offline literary catalog

Dependent on 1.5.126 (d827046). Keep all 36 catalog records available offline on first use rather than introduce a network dependency for reading. Build-only deterministic word dictionary: editable original content/reading-catalog.json, generator tools/pack-reading-catalog.cjs, lazily decoded generated block in index.html. Full decoded records including ordering, IDs, scenes, text and metadata exactly equal to original; generation checked by regression. No new runtime downloads or dependencies; no storage schema, graphic assets or writing/publication changes. Catalog block 97986 → 82547 B; initial source 992368 → 976929 B; reserve 23071 B. Full isolated regression passed; browser test adds first-use offline reading and forbids editable source download. Browser CI pending. Source size improvement is not a measured hardware speedup; compression tradeoff versus genuine deferred transfer requires device measurement. Further modular extraction remains open.


### 1.5.127 acceptance follow-up

Compared the editable source directly against accepted 1.5.126 main: all 36 records match exactly. Source size measured across all five actual files: 992368 → 976929 B. Strengthen automated codec cases (empty catalog, Cyrillic, supplementary Unicode, markup/script delimiters, whitespace, deterministic output, reserved-token rejection). Browser CI must verify full decoded catalog against editable source while offline, lazy initialization and back-to-shelf navigation. Full isolated regression and 5 codec cases passed; no runtime code or image changes in this follow-up. No CI run was available on f670c72 at review; new head requires all mandatory checks before merge.


## Candidate 1.5.128 — night chapter echo experiment

Chapter 2: optional 1–5 m model, prediction before explanation, outbound/return path 2d, reset, buttons/slider and direct pointer dragging with cancellation. Previous 1.5.127 main ba103ab. CI 44780297375 regression passed; both browsers stopped because a pre-existing generic SVG assertion matched both chapter art and new model. Correct its scope and add direct pointer drag coverage. Initial source 976929 → 982961 B, reserve 17039 B. Full isolated regression passed. No artwork replacement, storage changes, extra resource or real family archive access. Browser CI and physical device performance pending. No learning-effect claim.


## Candidate 1.5.131 — reversible full-screen drawing

Child can enlarge the existing 720x480 drawing in both standalone and story illustration workspaces using a labelled 44px toggle, then return with the same control or Escape. Full-screen uses available viewport; hides surrounding panels while keeping brush, eraser, quick color, undo/redo. Save and gallery remain in the normal workspace. Intrinsic canvas, pixel contents, outline, history, storage format and existing drawing behavior unchanged. No new assets or dependencies. Existing isolated regression passed; browser tests added for actual toggle, unchanged pixels, rotation, undo/redo and Escape. Physical iPad and hardware memory/latency not verified. Publish only after mandatory green CI.


## Candidate 1.5.133 — actual enlarged drawing surface

User reports 1.5.131 leaf does not enlarge. Previous browser assertion allowed equal area and portrait fit can be width-limited. #94 controls retained; version built from current main, no data format changes. New sheet viewport and detail mode scales CSS display by 1.4 when normal-to-full width gain is below 12%, with reversible whole-page view and explicit pan mode (no drawing while panning). Canvas bitmap remains 720×480. Test requires ≥10% width and >20% area gain, records geometry, verifies pan leaves pixels unchanged, fit/rotation/undo and full-screen save. Isolated regression 69 categories passed. Start source 989380 B (budget 1M). Actual deployment, physical iPad, browser CI pending. Detail view can crop edges until panned or switched to whole page; intentional, not bitmap cropping. No new assets.


## Candidate 1.5.134 — painter palette and brush controls

Base 1.5.133 bad36c9. Optional palette panel in normal and expanded canvas, six themed sets and all 72 colors, linear RGB digital blending, seven tonal choices, continuous 1–64 px width and 10–100% brush/stamp density, live sample, 29 effects (new approximate gouache, ink, spray), opt-in pen pressure width. Original pixel buffer, existing undo cap and storage formats unchanged. No added dependencies/assets. Five-file start source 989380 → 997219 B, reserve 2781 B; previous full cold-home requests including images already exceeded 1 MB (1077248 encoded B in Chromium). Not claiming actual cold network budget compliance or physical-device speed. Isolated 69 regression categories pass; browser suite now measures actual colors/opacity, effects, synthetic pen pressure and undo. Physical Apple Pencil, iPad and visual acceptance not tested. Not a physical-paint engine or layer editor. Publish after green Chromium and WebKit.


## Candidate 1.5.135 — responsive painter controls

Base 1.5.134 caba1b3. Previous professional controls replaced up to 72 palette and 7 shade buttons for each slider/color adjustment, losing keyboard focus and repainting the same stroke preview on mix-ratio changes. Reuse existing buttons, update changed values and selection only, skip identical preview draws. No change to supported colors, effects, image buffers, drawings, drafts, archive or storage formats. Five-file initial source 997219 → 997576 B; cap unchanged. All isolated regression categories passed; browser tests assert retained element identity, focus, selection, and unchanged preview after mix-ratio update. Actual device latency, visual quality and family delivery unverified. Mandatory CI required before merge.


## Candidate 1.5.136 — lazy creative-room artwork

Requires PR #98 acceptance on compatible main. Three hidden creative-room SVG illustrations were built on every cold start before visiting the room. Construct them on first entry only and reuse them thereafter; existing artwork and navigation unchanged. No additional network requests, dependency or storage changes. Five-file source 997576 → 997710 B (unchanged 1 MB limit; 2290 B headroom). All 69 isolated regression categories pass. Browser assertions check zero hidden illustrations on cold home, all three on entry and identity on return. No measured physical iPad speedup or full network-size reduction; CI required. Next: structural source budget optimization without losing offline content.


## Candidate 1.5.136 — compact catalog and rebased creative room

Supersedes #99 after squash merge of #98 (base db2aca5). Three deferred creative-room illustrations remain exactly as in #99. Catalog dictionary first 768 tokens use two UTF-8 bytes instead of three; original characters in that interval are JSON-escaped losslessly before tokenizing. Source content, 19 books, illustrations, page text, progress, storage formats and offline single-file catalog retained. Packed block 82547 → 78287 B; five-file initial source 997576 → 993450 B, 6550 B reserve. Seven codec cases (including all 768 original characters, >768 dictionary words, script safety and literal escapes), 69 isolated regression categories passed; exact source catalog equality checked, generated block reproducible. No external resources or dependencies. Browser CI and deployment pending; actual cold network bytes, iPad time and memory unverified.


## Candidate 1.5.137 — active stroke lifecycle checkpoint

Base #100 1c3a779. When the page becomes hidden or pagehide fires before pointerup, an active unsaved stroke previously could be lost. Flush pending bitmap through the existing draft persistence, release the active pointer and avoid redundant encoding once stored. Works for story and standalone canvas; no new storage keys, formats, image degradation or dependencies. Five-file source 993450 → 993951 B; 6049 B reserve. 69 isolated regression categories passed. New browser checks simulate visibilitychange/pagehide during strokes, verify draft changes, late pointerup does not duplicate writes and existing reload recovery is retained. Does not guarantee recovery on abrupt process termination or storage failure; physical iPad lifecycle unverified. Mandatory browser CI before merge.


## Candidate 1.5.138 — night garden and Nile story colorings

Base #101 95fa3c6. Adds two original programmatically drawn 720x480 vector path scenes with large closed coloring regions, moon-bat-garden and nile-cat-voyage (fictional animal story, not historical reconstruction or species guide), inspired by ART-06 on PDF page 33. Existing catalog, category filters, favorites, outline protection, undo and draft formats retained. 40 → 42 scenes; no external assets or dependencies. Source budget 993951 → 996907 B, reserve 3093 B. 69 isolated regression categories passed; browser assertions cover all 42 distinct scenes, five fillable regions each, and targeted fills on bat belly and boat sail without exterior leakage. Visual review on device and browser CI pending. Artwork is vector source in index.html; no separately generated raster. Learning hypothesis: independent color selection and spatial distinction of enclosed regions; observed child outcomes unverified. Requires accepted #101 before merge.


## Candidate 1.5.139 — preserve fine stylus stroke geometry

Base #102 92dd3a2. Previously each delivered pointermove rendered only its final coordinate, potentially cutting across intermediate bends. Where available, consume coalesced pointer samples in order with individual pen pressure, use one canvas rectangle per batch and restore protected outlines once per batch. Empty or unsupported sample API falls back to standard events; repeated identical coordinates skipped. Existing brush effects, undo granularity, draft persistence and data formats unchanged. Five-file source 996907 → 997104 B, reserve 2896 B. 69 regression categories passed; added browser tests for a synthetic bent path, no shortcut, single undo, and empty-list fallback. No new dependencies. Actual device latency and memory unmeasured; no claim of memory reduction or measured physical stylus improvement. Requires green CI and acceptance of #102 with ancestry intact.


## Candidate 1.5.140 — compact vector artwork and layered brushes

Base #103 103b2c7. Deduplicate 28 copies of scene drawing helper declarations into one shared declaration, saving 5749 source bytes. Exact ordered command traces matched for all 42 original coloring scenes before/after; regression fingerprints normalize numeric arguments to 6 decimals. Watercolor and gouache now use three nested pigment layers, simulating softer edges and stronger centers, honoring opacity; not a physical paint simulation. No changes to paper resolution, existing scene geometry, storage keys/formats, dependencies or child records. Five-file initial source 997104 → 991435 B, net saving 5669 B, reserve 8565 B. All 69 isolated regression categories pass; added browser pixel checks for layered opacity and edges, retaining existing gallery, gesture and drawing persistence tests. Browser CI, physical iPad, actual startup timing/peak memory and live deployment unverified. Requires accepted #103 and compatible main before merge.


## Candidate 1.5.141 — dry pigment pencil and pastel

Base accepted 1.5.140 43a272f. Preserve the default solid pencil (and eraser) exactly. Add optional grain-pencil and refine existing pastel with deterministic coordinate-derived pigment flecks, honoring the chosen color, width and opacity. One combined path/fill with at most 360 flecks per segment, no texture bitmaps, new storage or dependencies. 29 → 30 effects, existing 42 coloring scenes and 72 colors unchanged. Initial five-file source 991435 → 992154 B (+719 B, reserve 7846 B). All 69 isolated regression categories passed. New browser assertions cover real stroke pixels, repeatability, color density and opacity, bounded extent, tool selection and undo; preview counts updated. Visual quality on physical iPad, input latency, actual peak memory, browser CI and live deployment not yet verified. No family archive changes. Learning hypothesis: voluntary comparison of crisp and textured marks can support intentional selection of materials; no measured learning benefit. Next: improve lesson content and guided practice without mandatory steps.


## Candidate 1.5.142 — author-first home and personal shelf

Base accepted 1.5.141 26b4190. User's physical iPad screenshot shows learning cards occupying most of home while personal library and creativity are secondary. Reorder home into two dominant creative cards and four compact lower study tabs; preserve separate one-action writing, new draft and resume/draft selection, all other learning routes. Personal shelf receives three direct author actions; existing library filters and stored stories retained. Compact white writing editor, clearer primary save-to-shelf action, optional tools and family publication preserved. No new graphics assets or dependencies; existing illustrations reused. Five-file source 992154 → 996836 B, reserve 3164 B. 69 isolated regression categories pass. Browser assertions for entire home viewport at 768x1024 and 1024x768, accessible tap heights, creative card hierarchy and shelf/editor return. Full CI, physical iPad, real keyboard appearance, installed version, independent family delivery and aesthetic acceptance pending. Author library redesign deferred per user request. No storage changes.


## Candidate 1.5.143 — direct personal book actions and quiet writing

Base 1.5.142 35b646b; all three CI jobs passed for #107. Add one-tap Read (existing paginated reader, return to shelf) and Edit/Continue (existing saved edit) to own book cards only; existing detail view and export unchanged. Add optional Large sheet mode with more writing space, hiding secondary tools while retaining local save, shelf save, save status and emergency text export. Exit mode reveals all tools and family publication; no changes to text, illustrations or stored formats. Focus text field synchronously on editor entry. Source 996836 → 998444 B, reserve 1556 B (measured five files); no new artwork or dependencies. Added browser checks for larger sheet, retained text and controls, direct reader navigation and direct edit autofocus. Required regression/Chromium/WebKit and physical iPad/keyboard checks pending; independent family delivery and actual startup/memory not verified. Author library redesign deferred. Hypothesis: fewer intermediate screens increase independent writing, not yet observed.


## Candidate 1.5.144 — one-tap illustrated cover

Dependent on candidate #108, head 73615a2. Own illustration tray includes a 44px minimum target to choose a drawing as the cover, with a text and aria-pressed selection indicator, synchronized existing cover selector and preview. Existing artwork, body, image deletion and persistence use unchanged data fields. Added browser assertions for both routes, preview identity and existing save/delete recovery. No new images or libraries. Estimated five-file source 998444 + 743 = 999187 B (remeasure required), reserve 813 B. Mandatory checks pending; no independent visual or physical iPad acceptance. Next prioritize real resource savings before further features.


## Candidate 1.5.145 — lossless catalog optimization

Based on #109 c6a2124; 1.5.143 accepted (e214275). Two-stage deterministic build-only dictionary compresses repeated fragments of existing JSON catalog stream, with disjoint reserved token range and explicit exact reconstruction. The editable source and all 36 books are unchanged; decoded only on existing lazy catalog access, no runtime dependency, network requests or new images. Generated catalog block 78287 → 71928 B (-6359 B). Five-file startup source 999187 → 992828 B (reserve 7172 B, remeasure required). Local JS round-trip and deterministic generation passed for complete catalog and synthetic Unicode/markup samples; reject reserved tokens; extended regression samples. Browser runtime, physical iPad, network/memory and real opening speed not verified; source size is not a claim of faster reading. Release requires all quality checks and compatible main. No changes to user data or family archive. Next: profile actual opening time and pursue optional-bank lazy optimization if justified.


## Candidate 1.5.146 — direct page navigation for personal and family books

Base #110 993348d (candidate); 1.5.144 accepted d371cd3 with all three CI checks. Existing paginated own/family reader now offers a native page selector synced to previous/next, preserving reading offset on reopening and recalculating options on resize/font change. Options identify authored illustration pages and chapter starts when present; text labels escaped, native keyboard navigation not intercepted. No new data schema or images. Five-file source estimate 993725 B (remeasure), limit 1000000 B. Added browser checks for first/last jumps and synchronization, existing restore and family withdrawal checks preserved. Syntax checked locally; mandatory full CI and physical iPad not yet verified. #110 Chromium failed at runner font package installation, not product tests; do not merge dependent candidates until complete compatible checks pass. No verified family delivery or real timing/memory measurements.


## Candidate 1.5.148 — navigation hotfix (user reports non-opening tabs)

Base main 1.5.146 6eccdbc; #110/#111 have all required checks green; #112 pending and intentionally excluded from this independent hotfix. Confirmed code risks: three optional book-art scripts are parser-blocking before main navigation initializes; if a newer release is discovered but the navigation receives old HTML, applyRelease can repeatedly navigate to the same _release URL. Defer optional scripts (existing artwork fallback), restrict auto-update to home and suppress repeated automatic attempts for the same target; explicit retry cache-busts without clearing user storage. Add touch route tests in both iPad viewports while optional scripts are stalled, followed by stale-deployment simulation; retain existing offline and save checks. Five-file source 993721 → 994232 B, estimated; no new images/data migration. Live site unavailable to verification environment, exact device root cause not reproduced; hotfix requires mandatory green CI. Do not merge #112 blindly across this version bump; reconcile after hotfix.


## Candidate 1.5.149 — keyboard-aware writing on iPad

Base navigation hotfix #113, SHA 20cf294f; stacked candidate, do not merge before #113 passes and main is compatible. User photograph shows landscape Safari keyboard obscuring the story body while the title and welcome occupy visible area. Use VisualViewport height/offset with resize, scroll and focus updates, without moving/recreating fields or changing data formats. When story text is focused and viewport shrinks, expand to the visible region, suppress optional tools and title, preserve text field, draft status, explicit save/close and dismiss-keyboard button; title editing remains possible and normal controls return after keyboard closes. Pinch zoom and drawing are excluded. Simulate reduced viewport in both iPad orientations including focus, selection, actions and draft reload. Five-file source 994232 → 997846 B, no new dependencies or images; actual software keyboard on physical iPad not tested. No claim of changed family delivery, actual latency or memory. #112 still deferred.

Follow-up to #114: initial regression failed because event registration was executed inside the Node-extracted story-plan helpers (window undefined); moved registration into a one-time initializer called on editor entry. Tested pure plan extraction and added listener-idempotence and compact-save failure assertions; accessible names explicit. Updated five-file size 998056 B; full CI must run on new SHA. Initial Chromium passed; no real iPad keyboard verification. Public release endpoint not reachable in verification environment.


## Candidate 1.5.150 — coherent library author filters and search

Base main 1.5.149 5430b16; #114 regression, Chromium and WebKit green on a7b5ac0. Physical keyboard and live deployment not independently confirmed. Classical reader global title/author search previously ignored filters but left their buttons selected; topic changes also left query active and silently ignored. Reset filters on meaningful global search, show explicit global count, clear query when selecting a topic, show chosen author/topic and per-author book counts. Personal global search exits render before rebuilding themes, author buttons and hero art on each keystroke; clearing search restores full shelf. No changes to book contents, artwork, storage keys or author editor. Estimated five-file source 998056 → 998489 B; tight reserve, no increased limit. Added browser cases for filter/search/topic transitions and retained personal filter/hero DOM. Inline script syntax checked; no physical iPad, actual production or family delivery verification; all CI required. #112 is incompatible with new main and remains deferred.


## Package 01 / candidate 1.5.151 — protect author data across tabs and chapter edits

Active package only; see SECTION_ACCEPTANCE.md. Base main 1.5.150 d2c7b1f, PR #115 required checks green. The shared library previously wrote the entire in-memory snapshot on each save, even when storage had subsequently changed. Prevent known stale writes by comparing last successfully loaded/written raw value, protect malformed/unsupported initial library, refuse stale publication and skip stale asynchronous local archive snapshots. Stale editor keeps text open and offers existing TXT rescue. Not an atomic multi-process lock or merge; simultaneous racing writes remain a limit. Chapter append rolls back body/markup and retains proposed title when storage fails. Synthetic two-tab, failed chapter and basic guard tests added. No new storage keys, art, dependencies or changes to child data. Five-file source 998489 → 999530 B. Syntax/isolated guard checked; full CI, physical iPad and real anonymous delivery pending. #112 is incompatible and deferred for safe reimplementation. ART-04 on PDF p44 already represented by existing writer fox asset; keep quiet white sheet. No new art needed for this data safety cycle.


## Package 01 — candidate 1.5.152
Lossless catalog optimization and safe illustration placement; source 995955 B vs 999530 B. Existing image bytes untouched. Expanded second-stage dictionary 128→512 limit, exact 36-book roundtrip, no new runtime dependency. Move existing illustration after selected paragraph; invalid/multiple markers refused; failure restores original body and selection. Cover selection rolls back on failure. Tests added, full CI/device pending. No change to stored schema. See SECTION_ACCEPTANCE.md.


## Package 01 candidate 1.5.153
Single-draft recoverable JSON for failed saves, private additive restore via existing backup flow; text, inserted artwork, cover, plan, editions. No family keys or other books in rescue export; no publication or wholesale replacement on import. TXT unchanged. New isolated and browser tests; source 998457 B, limit unchanged; full CI pending. Uninserted canvas not included. See SECTION_ACCEPTANCE.md.


1.5.153 same-PR follow-up: compact emergency export controls no longer excluded by viewport CSS, backup async origin guard, tested scenario added for failed additive restore/retry. 998842 B initial source. See per-action inventory in SECTION_ACCEPTANCE.md. Exact-head browser CI pending.


## Package 01 candidate 1.5.154
#118 1.5.153 passed all three CI jobs and merged 7c24012cc2a0a148239ee90791c6da482b42bbc0. A08: persist personal/family reader font size in existing bookmark, legacy compatible, no changes to book or publication. 998965 B startup source, syntax and isolated validation passed, CI pending. Real Pages/iPad/family archive verification outstanding.


1.5.155 candidate: emergency PNG export when drawing persistence or insertion fails; no storage schema change, canvas remains open. 999499 B / 1M. New browser scenario; syntax passed. Exact CI pending, base #119 must be accepted first.


## Package 01 candidate 1.5.156 — approved writer squirrel
Owner approved replacing the ART-04 fox with the exact illustrated squirrel. New immutable UI WebP URL and manifest; original fox kept for earlier offline shells, no changes to child artwork or data. Source generated in chat, 1254 × 1254, SHA-256 4355a2e29dd7179bb104e6163cad9a80cd450c06466b62b7fed3907a5eba03f9; resized to existing 144 × 144 card slot, 5460 → 5232 B. Maintains generic paper/pencil SVG fallback and separate white editor. Browser smoke now checks exact new URL, hash, decoding, offline shell and missing-image writing route. Startup source estimate 999504 B (previous 999499 B); actual transfer/latency/iPad not measured. #119 passed all three jobs and merged b439ab9f6c89877360b631e2bf05268e08554e7c; main tree equals #119 head, #120 prior exact head passed all three jobs. Reconcile #120 with main as two-parent candidate retaining previous drawing rescue; require fresh exact-head CI on 1.5.156. Full acceptance 0/12, live Pages and physical iPad/family archive still unverified. Next: verify CI, deploy then confirm the card and writing on iPad; continue A01–A12.


## 1.5.157 visual follow-on (A01/A03/A05/A11)
Candidate section-01-author-visual from #120 exact head 6846494e641ae47e348aacb04140fb7be0d2a1b9, which must pass and merge first. Enlarge approved squirrel card art 54 → 72 CSS px on portrait iPad, 64 on short landscape, 54 on narrow phones; native source remains 144×144 (5232 B), no additional network request. Shorter writing guidance, distinguish local shelf from family publication, correct a misleading publication-error message for private save failure. Browser tests assert exact artwork geometry and card containment, existing full first-screen and entry/return criteria retained; optional idea dismissal focus and unchanged text covered. Startup source 999485 B (was 999504), unchanged storage and artwork bytes. A01–A12 full acceptance still 0/12; physical iPad, live family archive and deployment not verified. Next: verify #120 exact checks and deployment, then this exact head; continue remaining action inventory and lossless reserve. 


## 1.5.158 personal shelf (A02/A11)
Candidate section-01-personal-shelf, retains #121 exact head 0943e2b605e16f77c0ea06a3c554c6c8ea3e8b13; reconciles merged #120 main a87e1021d95847bcb5c3d38b624d47988f1dc967 (tree equals tested #120). #120 1.5.156 regression, Chromium and WebKit passed run 44816316416; merged, Pages not confirmed. Personal shelf now displays deduplicated draft + edit count, updated on render; personal actions visible during global personal search even from classic shelf. Title targets >=44px, read/edit >=48px with larger text, changed-edition badge uses lavender; shortened empty-state text. Existing covers, feedback, text and storage schema untouched. Added browser assertions for count, search actions, title/action geometry and retained actual read/edit/reopen tests. Startup estimate 999510 B vs 999485 B. #121 must pass on exact head and be reconciled before candidate merge, then fresh complete CI on this candidate. Mandatory full acceptance remains 0/12; iPad and family archive not verified. Next: finish #121, verify Pages, test this candidate; no parallel expansion.


## 1.5.159 lossless reserve (A12)
#121 and #122 passed all three jobs (44816690772, 44817038255); merged together via #122 to main 499df201b37d744204b4e66f01ca38f2c14cfb04; exact tested tree ca5dd456c59ec3c2461d1e09f9efcdaf487537f2. Main 1.5.158. #121 closed as included. Live Pages endpoint unavailable to verification; physical iPad and family archive pending. Candidate 1.5.159 uses two-byte disjoint fragment tokens U+0500–U+07FF, escapes literal source characters in range, deterministic scoring, preserves existing PUA rejection. All 36 canonical books decoded and compared exactly; generated code regression includes every new-range character, literal escape, emoji, markup. Source 999510 → 992228 B, 7772 B reserve, no canonical text, art, user data, storage schema, dependency or lazy entry change. Full regression, Chromium and WebKit required on exact candidate. Network timing, iPad and family archive not verified; 0/12 whole rows accepted. Next: full CI and live version, use reserve for visual shelf/editor and action inventory.


## 1.5.160 illustrated personal shelf (A02/A07/A11)
Candidate section-01-illustrated-shelf stacked on #123 exact head caa389f158c98a13ed70d69899f98b8e29b8ec55, merge only after #123 and fresh exact-head CI. Actual root cause: library hero hidden by global CSS. Enable compact white/teal/lavender hero only for personal shelf, with approved already cached squirrel and existing scene fallback. New original compact inline vector book/pencil illustration on the existing blank-sheet card (no additional network asset, aria-hidden), larger personal cover display, larger excerpt, responsive grid, no clipping or forced new choices. Theme-specific hero still uses existing scenes; search hides header without rebuilding filter/hero DOM. Preserve title/cover data, personal illustrations, all handlers and shared snapshot. New tests for visible hero/squirrel, card art, cover geometry and width; all previous scenarios retained. Initial source 996145 B vs 992228 B. New vector is UI artwork, not a new full painterly cover collection. Physical screenshot, iPad, family archive and Pages still unverified; 0/12 full mandatory criteria accepted. Next: verify #123 and candidate exact CI, release, inspect actual screenshots, then expand voluntary cover library without replacing child drawings.


## 1.5.161 optional illustrated book covers (A07/A11/A12)
Candidate section-01-cover-gallery, stacked on #124 head 186ce4dfe3838280b0b7e030a9bdad40088cb039. #123 passed 44817833784 and merged as 17bd5d00d757f388750a71a8c45683515593b237 (tree 1574b81c809619335c3d28fe9cd9f93e411ef410); #124 still requires exact all-green jobs before merge. Three opt-in reusable approved ART-01/02/03 pictures: existing 320px previews only on user gallery opening, existing 504px WebP only on choice, same-origin fetch then existing imageForStory JPEG conversion. Uses existing rich.images slot and coverImage: no new schema, no change to manuscript or markup, no replacement/deletion of existing drawings. Existing export and family fbook carry embedded image. Five-picture limit remains; choosing uses a free slot, repeated same JPEG can reuse it if space remains. Prior cover restored on quota/network failure. Gallery assets provenance and checksums in assets/world/manifest.json and original PDF artistic refs pages 31–32. No newly generated painting. No startup image requests added, startup source 998773 B vs 996145 B. Browser test adds selection, preserved text, published snapshot, missing asset, storage failure and removal. Physical iPad, full visual quality, live Pages and family archive not verified; 0/12 whole mandatory rows accepted. Next: reconcile and pass #124, then exact CI of this candidate; verify actual site and iPad cover selection.


### 1.5.161 correction and page placement
#124 all three jobs passed (44818467956); merged as bccd14a6373318f4be705cac021cc2489c0dde26, exact tested tree c81dfaef617dd89afac5cd54d77041739fb91bd7. #125 run 44819047050 regression passed but both browser jobs failed at parse time (double escaping regex in new test). Fix test syntax using startsWith; adapt world request assertion to intentional lazy gallery only, preserving prior zero-request check before gallery. Extend existing illustration placement to cover-only images, explicitly via В текст after selected paragraph, no second image slot; preserve original markup on save failure, refuse ambiguous literal markup, prevent asynchronous cover change during unfinished drawing. Cover alt is neutral. New assertions exercise placement and exact retained text/image, no automatic modification. Startup estimate 999041 B vs 998773 B. Fresh full CI mandatory; no new paintings, live Pages, iPad, real family archive and timing remain unverified. 0/12 full mandatory rows accepted. Next: verify exact #125 head and merge only on green compatible tree; inspect actual iPad.


## 1.5.162 personal/family book page design (A08/A09/A11)
Candidate section-01-reading-design, stacked on #125 head 1c0540c212b63a848f5fdd44beab2693a36a2aa6, which had regression and Chromium green on 44819671284 at audit, WebKit pending. Main at audit: bccd14a6373318f4be705cac021cc2489c0dde26 (1.5.160). Apply existing validated cover palette to the personal/family paginated reader (border, image surround, subtle inline-start rule); keep text white, no mandatory styling steps, no changes to manuscript, image, data schema or reading position keys. Fit recomputes with real padding. Synthetic family fixture exercises chosen palette, white text page, image page and containment, image bytes unchanged. No new raster assets or requests; startup source estimate 999308 B vs 999041 B. Actual deployment check unavailable (connector rejects Pages URL; external fetch unavailable). Physical iPad, live anonymous family archive, measured launch latency/memory remain open; 0/12 entire mandatory rows accepted. Next: finish #125 exact tests and compatible merge, then test this candidate on exact head before merge; do not transition to package 02.


## 1.5.163 compact catalog and optional cover gallery (A07/A11/A12)
Candidate based on #127 documentation-only head c675d385ce15e47b7f036982d5079152c477359b. Lossless build-time first dictionary capped at 400 high-value words, leaving fragment packing to compress recurring tails. Measured generated catalog 58852 → 56936 B; decoded all 36 canonical books and compared exact JSON, no changes to source texts, artwork, storage, runtime decoder or request strategy. Add fourth voluntary cover “Лесной домик” using existing NIGHT-03-ROOST 320/504 WebP, already in lazy ART cache policy, no startup image added. Gallery cards have visible focus and rounded corners. Move capacity check after exact-image lookup so a repeated cover does not need a new slot even in a full book; a genuinely new sixth image is refused. Added synthetic tests for uncommon words, fourth cover selection, reuse and original image/text preservation; syntax checked, full CI pending. Repeated selection of the current cover now skips redundant writes; exact persisted snapshot equality asserted. Full-capacity repeat case still needs direct browser coverage. Source estimate 997578 B vs 999308 B; actual network and iPad not measured. No newly generated artwork. Full mandatory rows 0/12, live Pages, iPad and real family archive unverified. Next: full exact-head CI then verify live deployment and actual iPad, no transition to 02.


## 1.5.163 merge evidence (2026-11-21)
PR #128 exact head 5114dfcc0734c828d5506825bd1ee0a9813a4ba0 passed regression, Chromium and WebKit in run 44867267091. Synthetic merge had zero file differences against tested head. Merged as 969da911840b3fb343a9233f769892e82a2989b2; main release.json verified 1.5.163. Public Pages/release.json inaccessible to this environment; not proof of outage. Physical iPad and anonymous real family archive remain unverified; no new full mandatory rows, 0/12.

## 1.5.164 cover retry and full-book coverage (A04/A07/A11)
Base 969da911840b3fb343a9233f769892e82a2989b2. Fix false success on reselecting the current cover when a previous write failed: retry draft persistence and explicitly report continued failure, preserve current text, images and rescue action. No schema, storage keys, artwork or network changes. Add isolated browser scenario with two uploaded synthetic drawings and three optional gallery images, successfully reuse an existing cover at five-image capacity, refuse sixth without persisted mutation, simulate quota failure and restore, retry via same cover, close/reopen and verify full text/image equality. Estimated startup source 997576 → 997692 B (same initialFiles definition). JS syntax checked; full CI pending. No real data touched. Next: exact all-green CI and compatible merge; live Pages and physical iPad test remain required. Do not transition to 02.


## 1.5.164 merge evidence (2026-11-21)
PR #129 exact head 8aa8f984ac4751a5576dce989108e04a4978aabb all three jobs passed in run 44867584649; zero synthetic merge file diff. Merged 8e6bf71aa737315d5bf73d436aaf24cf8b8f5b13; verified release.json 1.5.164. Public release endpoint could not be opened, not proof of outage. No full mandatory row accepted, 0/12.

## 1.5.165 illustrated cover gallery feedback (A07/A11)
Base 8e6bf71aa737315d5bf73d436aaf24cf8b8f5b13. Show the selected gallery card with visible border, check and aria-pressed, synchronized with cover dropdown, removal and rollback. Gallery-wide loading lock and aria-busy while selecting an image; keep old selected cover visible. Track decoded illustration provenance in current editor session only (four bounded references); after reopening, the existing cover preview and chosen picture in tray remain authoritative; no persisted metadata/schema changes. No new artwork or network endpoints. Browser assertions verify selection, theme cover switch, slow fetch with all four buttons disabled and intact saved snapshot, and capacity failure. Syntax checked; full CI pending. Startup sources 997692 → 998492 B; actual transfer, iPad, family archive and full visual acceptance outstanding. 0/12 full rows accepted. Next: exact CI, then physical iPad test and full action inventory; remain in package 01.


## 1.5.165 merge evidence
#130 exact head afacd5a4282b1c8c504ccf35c855530d6a9e0eda passed regression, Chromium and WebKit run 44868257748; tested tree matches merge, main 442cc0f73fa6e2a531b3ff847232be30b614e580. Live deployment and iPad not independently confirmed.

## 1.5.166 expanded optional cover palette (A07/A08/A09/A11)
User requested more cover colors. Add turquoise, violet, mint, peach, berry; keep five original colors unchanged. Central dictionary drives dropdown, validation, cover and reader; no schema/key change, white reading paper unchanged. All ten contrast pairs computed, minimum 5.86:1. Verified normalization and syntax. Added tests for ten choices, persisted draft, reopening, family snapshot and synthetic family reader with turquoise; invalid values fallback to forest. No new images, network requests or dependencies. Source bytes 998492 → 998796; full CI pending, actual Pages/iPad/family archive unverified. No full mandatory rows newly accepted (0/12). Next: exact CI and compatible merge, then physical iPad check.


## 1.5.167 direct color swatches (A07/A11)
Based on pending #131 exact candidate eca58a8aff34ebdf9635d46981b72f17a46c7883; no merge until predecessor CI and compatible tested tree verified. Replace text-only cover color selector with ten directly tappable named colored buttons in optional cover panel, 48px target height, visible check and focus, aria-pressed, responsive layout. Uses existing palette and chooseCover rollback; sync selection through refresh after restore or failed save. No new artwork, network, dependencies, schema or changes to child text. Browser tests assert all ten selections, 44px targets, unique selection, keyboard Enter, failed-write rollback and re-open; existing family snapshot/reader coverage retained. JS syntax checked. Startup sources 998796 → 999468 B; real speed, physical iPad, live Pages/archive not confirmed. Full CI pending; no new mandatory complete rows (0/12). Next: verify #131 and integrated #132 exact CI and compatibility; test on iPad from clean sheet to cover and reopen.


## 1.5.168 shelf family route and lossless reserve (A02/A09/A12)
Based on #132 candidate d4210dc7adf6f05ef28816a0ad8c65825bc1cd35; #131 passed regression/Chromium/WebKit run 44868568100 and merged 4cd3396287d577820662dc53e90af6db3fe78f80. No merge until #132 and exact successor CI confirmed, compatible tree required. Add explicit "О книге и семье" action on personal cards to existing book details/publication controls; opening does not share or mutate storage. Existing read/edit routes retained. Browser test verifies touch target, family controls, unchanged localStorage, return, continued read/edit. Improve build-only dictionary packing using leftover two-byte slots with positive escaped byte savings; all 36 canonical catalog records exact JSON equality and deterministic generation, 56936 → 56330 B. No art, content, data schema, links, permissions or dependencies changed. Startup sources 999468 → 999036 B; JS syntax verified, full CI pending. Public Pages, physical iPad and real family archive unverified. No new mandatory complete rows: 0/12. Next: verify #132 then successor CI and live/iPad acceptance.


## Deep Chat / package 01 — integrated candidate 1.5.169
Base 4c22bbd4f08f43e0ba8dd3d67407b85a5089a9f0 (1.5.168, #133 exact head b6e99036db56a2b0a33dcab67c87b31641e6ad71 all three jobs green, run 44869091397, zero merge diff). PDF §§133–136: one coordinated candidate, no new release for each action. A01: reuse approved squirrel on home (obsolete inline fox removed, cached asset, fallback book SVG). A02/A05: searchable draft picker by words/title/theme, color-coded private draft/edit cards, no writes from search; 44px input and empty state. A07: two new original standalone authored vector cover scenes, library/lantern and star sailboat; four existing WebP choices, ten colors and user pictures retained; SVG choices optional, cached on demand and converted using existing imageForStory pipeline. Manifest assets/author/manifest.json records origin and sizes; physical visual inspection and SHA256 pending. A08/A09: local published shelf previews exactly selected family snapshot, not newer local private edition; separate management, title/theme/cover visible; returns via Back/header/Escape. Remote reader restores focus. No real archive operations. A11/A12: source 999036 → 997907 B; removed obsolete fox rather than moving it to evade budget. New SVGs genuinely optional. Syntax checked, full CI mandatory. New browser tests for home, search, cover selection, exact family copy, return/focus. Device/live deployment and actual anonymous archive still unverified, 0/12 full mandatory rows. Next: exact CI, fix within this SAME candidate, visually inspect artwork and complete remaining keyboard/concurrent writes/backup evidence. Do not transition to 02.


### Integrated package 01 follow-on (unversioned)
Guard GitHub, optional cloud and peer family transport immediately before sending after asynchronous reads/encryption; compare exact published snapshot without touching draft data. Do not claim outdated verification is current. Synthetic race fixtures and normal retries exercised in extracted code; browser CI required. Startup source estimate 998375 B. No real archive used.


### 1.5.170 candidate
Integrates guarded async publication from #135 (prior head all three jobs passed), exact authored whitespace/reopen, corrupt-family shelf graceful failure, delayed image cancellation, preserved old optional theme/icon. Synthetic browser coverage added; current exact head CI pending. Startup source estimate 999207 B. No storage migration, new artwork or external calls. Physical iPad and live archive not verified.


## Package 01 integrated 1.5.171 candidate
Base 3762c85fab4cb5478d5f475710a67432cba35ee0 (1.5.170 merged #135; exact tested head 5189799a804aa2fbd4f0484e677290a10954ef6d: 44871723284 regression/Chromium/WebKit all PASS; merge preview zero diff). A12: third lossless dictionary in unused two-byte tokens; lazy decode remains; all 36 canonical records exact JSON equality and deterministic generator verified; catalog 56330 → 49885 B, startup 999207 → 993311 B; no artwork/content reduction, no moving files or raising limit. A04: stage draft data and theme-key migration; commitLibrary restores last confirmed model on failed save, retains live editor/rescue and retries. A02: clean sheet card always opens new own draft in chosen theme, before books, no accidental continuation; stable card width for sparse shelves, long-title wrapping/focus. A02/A08: feedback, theme and author creation commit from staged model; failed writes do not report success or discard form. Synthetic browser test for legacy draft theme migration failure/retry, fresh sheet, feedback/theme failure/retry. Concurrent multi-process localStorage writes still not atomic. No change to storage keys/schema, no real child/archive writes. Syntax and catalog roundtrip verified; full CI pending, actual speed/device/live family unverified, no full mandatory rows accepted (0/12). Next: exact CI then compatible merge/release; device and anonymous synthetic publication acceptance; remain in package 01.


## 1.5.172 family-publication hotfix (A03/A04/A09)
User reports inability to publish illustrated story from iPad screenshot. #136 exact CI all green, merged 202158e1dbaebb8707e34fef725c53beb6c5bb48. Avoid SubmitEvent.submitter and browser confirm in editor: dedicated button, explicit in-form confirmation/cancel and visible failure/retry; support illustration-only books. On local failure no story is lost and no upload occurs. On success distinct durable local-save and delivery-status dialog with retry and adult settings. Guard host startup retry and restart failed initialization. Synthetic three-picture scenario tests cancel, quota error, same manuscript/images, privacy, retry and local family shelf; mocked delivery, no actual child data/archive accessed. Source 996692 B; syntax passed, full CI pending. Exact device cause and live delivery unknown. No schema changes. Do not bypass conflict checks. Remain package 01.


## 1.5.172 release and coordinated follow-on (A09)
#137 exact head 95a6d5ae64a8ea4a6288c7eec479c68fea8799cc: regression, Chromium, WebKit all PASS (44873450031); merge preview no file diff; merged 217b5282032392979b602d565f886acc26742a49. Main release 1.5.172, startup 996788 B. Direct public manifest access unavailable; Pages deployment initiated. Follow-on: personal book panel now uses in-dialog confirmation/cancel rather than system confirm; shared unchanged edition goes straight to delivery retry without rewriting local book. Add isolated two-profile browser scenario intercepting every external request; synthetic encrypted archive includes one illustration, failure/retry, cancellation, private draft exclusion, unauthenticated reader and automatic second edition. New candidate unversioned (do not deploy as 1.5.172); syntax passed, exact new CI pending; source 997505 B. No real archive or child data touched; no storage migration. Physical iPad, real anonymous archive, actual performance unverified; full acceptance 0/12. Next: verify exact CI, address failures before versioning; test real device publication result without sharing credentials.


## 1.5.173 coordinated candidate — manuscript illustration access (A03/A07/A09)
User requests direct access to drawing while writing. Move drawing/photo controls and existing illustrations outside optional settings; add inline gallery choices, preserve selected insertion position and return focus after drawing/photo/gallery. Reuse same large drawing canvas, no storage migration, retain unchanged source markers and full reading preview (not a WYSIWYG editor). Add synthetic direct gallery/draw/cancel/reopen/keyboard checks. Prior #138 Chromium failed on random ciphertext substring QA; replace with authenticated AES-GCM decryption and explicit private-draft exclusion. Prior live 1.5.172 Pages build/deploy succeeded 44873773040. Source estimate 999826 B; syntax passed; new exact CI pending. No real child data accessed. Physical iPad, live family archive and performance remain unverified; 0/12 full rows. Next: exact CI and fix any failures, compatible merge then Pages; confirm actual iPad gesture and keyboard.


## Package 01 / 1.5.173 verification follow-on
Exact head 164f1e7 regression passed; both browsers passed isolated author-to-reader archive, encrypted private-draft exclusion, failed write retry and second edition. Both then failed new illustration test because normal canvas exposes drawingSave rather than fullscreen-only drawingFullSave. Correct test to exercise normal canvas; keep existing fullscreen tests. Snap insertion outside existing image marker (never split reference); gallery uses current selection; clear stale cursor on input, keep recovery controls above keyboard. Compact existing CSS between rule boundaries to free reserve, no contents or artwork removed. Source estimate 999235 B, syntax passed; exact CI pending. No real archive writes or user data touched; no WYSIWYG migration. Physical iPad and actual delivery remain unverified. Full rows 0/12. Next: exact browser results and compatible merge; only then staged visual editor development.


## Package 01 — 1.5.173 integrated and optional illustrated spread candidate
#138 exact head 01cab9f891e56c81027e8c73f5c4da78342285b9: regression, Chromium and WebKit all PASS run 44874503689; preview merge and final main tree differ by no files. Merged 33fd79a1feeac3fbd0ae37c9482c3276fd3d17a4; release.json 1.5.173. Public Pages DNS unavailable in this environment, not proof of outage. A03/A07/A08/A11: unversioned follow-on moves optional read-only illustrated preview to the writing toolbar, alongside manuscript on wide screens and below it on narrow screens; compact keyboard and full-sheet modes preserve existing plain textarea. Gallery dismissal returns to writing; insertion uses remembered caret. Existing storage and manuscript format retained, no contenteditable migration. A12: exact canonical catalog round-trip after build-only dictionary tuning, 49885 → 49218 B, source estimate 999235 → 999229 B. Script syntax passed; browser assertions for illustrated spread geometry, no writes from preview and gallery cancellation; exact CI pending. No real family archive or child data touched. Physical iPad, live Pages/archive, real speed and full UX acceptance pending, 0/12 full rows. Next: verify exact CI, fix in same candidate, complete preview/caret behavior and visual acceptance before assigning version. No package 02.


## Package 01 — 1.5.174 illustrated spread and safe manuscript follow-on (same PR #139)
Initial #139 head 6c2f918d6271e626e6bdc0c02c86ee6cb643650f all three jobs PASS run 44875001403. A03/A04/A07/A08: avoid rebuilding unchanged preview; preserve scroll during live input, reset on chapter selection; close gallery on draw/photo and honor a newly focused caret. Refuse markup activation if literal text already contains formatting syntax, prevent new picture binding to preexisting marker and accidental formatting across picture markers. Failed text formatting rolls back to original live manuscript. Add browser assertions for unchanged image DOM, unchanged literal manuscript on refused draw, long live preview scroll, and retain direct artist/family scenarios. No new storage format, media, real archive or child data accessed. Starter sources 999229 → 996569 B (same five source files); source-only indentation compaction, newlines/literals unchanged, no claim of network/device speed gain. Syntax verified; isolated regression harness passed with fixture URL; all GitHub regression/Chromium/WebKit checks mandatory again on final exact SHA. Main 1.5.173, candidate 1.5.174. Physical iPad/Pages/live family archive and actual speed unverified; 0/12 whole rows. Next: exact-head CI, fix failures within same PR, verify synthetic merge tree, release and targeted real iPad test. No package 02.


## Package 01 — writer input isolation and save integrity follow-on
Based on exact 1.5.174 candidate d3065f2932a9c8f34aa9073d96b5d7e553950383; do not merge ahead of #139. A03/A04/A06/A07/A12: only manuscript/title/plan input invokes draft; theme/icon change saves once, drawing tools, temporary chapter title, preview and literacy controls no longer trigger full library writes. Font/size changes roll back on quota failure; photo picker cancel returns to writing, delayed photo refuses changed text rather than silently attaching at end; gallery blocked during pending image read. Added browser assertions for absence of library writes from drawing controls and font quota rollback/retry. Source 996569 → 996903 B, inline and test syntax checked, isolated regression verify PASS; exact CI required. No real data touched, no schema change, no artwork removed; physical iPad and live family archive unverified. Full acceptance 0/12. Remain package 01. Version reserved until coordinated candidate and CI.


## Package 01 — 1.5.175 candidate, coordinated PR #140
#139 exact head d3065f2932a9c8f34aa9073d96b5d7e553950383 regression/Chromium/WebKit all PASS run 44875399634; merged 80113a12be7233e258329b2d7bb173f0b79c18bc with identical tree, release.json 1.5.174. PR #140 retargeted to main; prior input isolation retained. A03/A06/A07/A08: snap image insertion outside whole heading, bold/italic token, existing picture marker and surrogate pair; retain words and render all five pictures. New browser checks insert within formatted text and heading, preview and reopen, plus existing rollback checks. No storage schema change, original artwork unchanged. Source 996569 → 997131 B (same measured five files); canonical catalog exact; script syntax and isolated verify PASS. Version 1.5.175 candidate only; exact new CI and merge required. Live device, real archive and live speed unverified; no actual child data accessed. Full acceptance 0/12. Next: exact CI, correct failures within #140, merge only matching main tree, then live site and physical iPad test.


## Package 01 — illustrated manuscript navigation candidate 1.5.176
PR #140 exact head b58eba7e8ff492f1c6301eab35056106082f0e51, run 44876024136 all mandatory jobs PASS, merged a044c646de4bb91c147817a65e52af2328f44989 identical tree. A03/A07/A08/A11: each tray image now indicates whether rendered in manuscript, activates read-only book preview at that image (whole book selected), selected figure has visible focus; cover-only image clearly marked not in text. Existing place/remove/cover controls retained; all tray action heights >=44 CSS px. Snap accidental insertion inside a word to word end, preserving previous punctuation-boundary placement. Browser tests cover direct preview jump without a library write and cover-only disabled state; isolated regression tests for source token precedence and caret cases. Source 997131 → 998643 B, exact catalog round-trip; syntax and isolated verify PASS. All required new CI pending. No schema or media changes; real child data untouched. Main 1.5.175, site/device/live archive unverified; full acceptance 0/12. Next: exact CI, address failures, review preview accessibility on portrait/narrow iPad and confirm real device. No package 02.


## Package 01 — 1.5.177 candidate: budget and illustrated preview return
#141 exact head a8987139936261a87c3b98ee77f94336bafdbdeb, run 44879116040 all 3 jobs PASS; merged de9a4e9cfc5ff54372ce57009806b161ccc8f2d9 with identical tree. A07/A08/A11: sticky 44px return-to-writing control in book preview; restores selection and text scroll, moves focus back, no save triggered; thumbnail shows whole picture without cropping. A12: reuse deterministic reversible codec for already lazy reading question banks independently; canonical content/reading-banks.json holds every exact original value; glossary remains plain if packing is larger; no starter request to canonical files, no alteration of reading lessons or package 02. Source bank block 24384 → 19628 B; startup total 998643 → 994427 B, reserve 5573 B. Exact roundtrip, script syntax, isolated regression PASS; new CI pending. New browser check returns from selected picture to cursor and confirms source bank file not fetched. No artwork or storage schema changes. Full acceptance 0/12, live archive/site/physical iPad not confirmed. Next: exact CI, check picture return at portrait and narrow viewport, device and accessibility evidence; no package 02.


## Package 01 — repair candidate 1.5.177 after failed browser gate
Exact head 89c404f532a6eab286f97de37ee24acbcaa2de54, run 44879570856: regression PASS; Chromium and WebKit FAIL at #readingQuizStart. Root cause: replacing the generated bank region also removed readingGlossaryMarkup, used by finishBook and dictionary. Restored exact helper outside generation markers, added packer guard, isolated glossary markup test, offline actual browser bank roundtrip and glossary test, explicit quiz error assertion. Retain preview return and original bank data. Source 994713 B (reserve 5287 B), syntax, exact bank/catalog generation and isolated regression PASS. New CI required; same PR #142, version unchanged. Main 1.5.176; no merge on red CI. Full acceptance 0/12; live device/archive/site unverified. Next: exact CI and fix any remaining issues before merging. No package 02.

## Urgent package 01 hotfix: lost touch / drawing controls freeze
Reported on physical iPad: brush, Clear, Back to story, Insert stop responding with child drawing visible. Code confirms a missing terminal pointer event can leave pointer non-null and block all these paths; actual trigger on iPad unknown. Separate hotfix from main 73f2bf146cb33a8988d18c84eff4b202c1a5e7bd, 1.5.178 candidate. End abandoned stroke (keep pixels and persist) at next primary contact or explicit tool/save/back/export/clear/fullscreen action; secondary contact does not interrupt. No storage reset, new data schema or live child data. Browser fixture exercises lost terminal event and toolbar recovery; full existing CI required. Runtime/version/footer/core URLs/worker consistent; source 994781 B; JS syntax PASS. PR143 remains blocked by stale candidate version footer/core URLs and must be reconciled after hotfix, not merged concurrently. Current live drawing cannot be remotely restored; advise original tab kept open, same-device ordinary new tab, verify saved image before editing. Full acceptance 0/12; physical/device and actual deployment unconfirmed.

## Пакет 01 · Авторская мастерская · кандидат 1.5.179

База `5315cf75cff7dbfcfe893c4b9613223bad117599` (1.5.178, Quality checks 44898736429 — PASS). Код кандидата `6800bcb106ed948a0b8a4bb9eb7f70ae2c617db2`. Из #143 перенесены маршруты личной полки, защита от последовательной перезаписи холста и отмена устаревшего восстановления. Сохранено завершение потерянного касания из #144. PR #145, кандидат отделён от main.

- Сохранение рукописи и рисунка сверяет данные обратным чтением. PNG доступен при открытом непустом холсте, включая конфликт и отказ записи. Размеры рабочей области не меняются при активации кнопки. Смена толщины, цвета и панели завершает потерянный штрих. Вставка бережёт составные эмодзи при наличии Intl.Segmenter.
- A01/A02/V01/V02. Добавлены акварели из PDF, при входе загружается одна миниатюра, оригинал открывается по запросу. Проверены SHA-256 всех 14 вложений, восемь входов без повтора соседей, закрепление, выключение и отказ декодирования.
- Пять исходных стартовых файлов занимают 999 501 Б. Измеренный холодный запрос в Chromium на предыдущем визуально эквивалентном кандидате — 1 086 979 Б полезной нагрузки, 1 089 679 Б с учётом транспорта. Стартовый экран не запрашивал акварели, миниатюры занимают 16 932–22 666 Б. Снимки пяти размеров, до и после, сделаны в headless Chromium на `ae286506d621756cb9789aae149a91b0c5eb7415`. Декор занял 1,17–1,85% viewport. [Сравнение экранов](docs/author-studio-visual-1.5.179.webp)
- Регрессия на коде кандидата пройдена локально, Chromium на предыдущем кандидате пройден. Полные проверки точного PR и открытые критерии указаны в PR #145 и SECTION_ACCEPTANCE.md. p95 отдельного действия, память и 30 минут непрерывного сеанса не измерены.

Дальше в пакете 01: обратимые холсты по сказкам и редакции вставок с резервированием, затем полный визуальный gate и физический iPad. Доставка в реальную семейную полку требует отдельного подтверждения.

## STUDIO FINAL · кандидат 1.5.180 · PR #145

База main `5315cf75cff7dbfcfe893c4b9613223bad117599` (1.5.178), предыдущий кандидат `7c119b14576afa7f6cc237a3ad27c8ae325672da` прошёл все три проверки. Код текущего кандидата `75e5f0e1b427b624fb2e817a7322375b9b262202`. #143 согласован ранее переносом правок в #145, обе ветки сохранены.

- F01/S01–S03. Личная сказка хранит отдельные листы, оригиналы PNG, предыдущую редакцию и позицию текста в существующей записи библиотеки. Текст, маркер, предпросмотр и оригинал вставки фиксируются одним подтверждённым вызовом записи. Декор и личные листы остаются вне семейного снимка. Старый общий JPEG доступен явным копированием и остаётся на месте. При отказе вставки открытый холст и доступный PNG сохранены.
- F02. Проверены длина и SHA-256 всех 22 графических вложений FINAL. Включены четыре сюжета ART-N с миниатюрами 240×240 по 19 152–21 716 Б. Декодирование восьми новых WebP подтверждено. На входе один сюжет, остальные доступны по выбору, N04 появляется после добровольного открытия результата. [Пять фактических экранов](docs/author-studio-visual-1.5.180.webp)
- S04 и T08–T09. Тест Chromium проверил экспорт и импорт двух синтетических сказок в независимый профиль, с точным сравнением данных оригиналов и сохранением общего черновика. Проверка зон касания прошла на девяти размерах, включая 320×568, Split View и широкие iPad. Проверен первый офлайн-вход в мастерскую после установки оболочки. Клавиатура моделируется VisualViewport.
- Пять исходных стартовых файлов — 999 974 Б. Холодный Chromium 768×1024 — 1 099 499 Б полезной нагрузки и 1 102 799 Б с учётом транспорта. В дополнительном трафике новый код и стили мастерской. Миниатюра появилась только после входа на полку. Команды: `node tests/regression.cjs`, `node tests/browser-smoke.cjs`, `BROWSER=webkit node tests/browser-smoke.cjs`. Источник точного статуса CI — PR #145.

Дальше: обеспечить независимое восстановление удалённой вставки и копию при конфликте, затем проверить рост библиотеки, 30 минут, метрики и rollback старой версии. Полную приёмку завершать на физическом iPad и с независимой реальной проверкой семейной доставки.

## Release gate follow-on 1.5.180 — reversible original removal
Exact prior HEAD 1b7a4bda15c7eeb61d519b04e8b03f4870a5b0f4 passed regression, Chromium, WebKit (45067503206); merge preview identical tree. Before publication retain removed authored PNG and previous version as separate unfinished sheets in the same confirmed library save; detach pending edits from removed slot, refuse removal if sheet capacity/storage prevents retention. Test deletion, persisted current/previous original, reload and reinsertion of exact PNG; existing optional photo/cover behavior unchanged. Five measured files 999985 B. Syntax PASS; new exact CI required. Real iPad, actual family delivery, 30-min stress, old-editor writes after downgrade remain unverified. No other repo or real child data touched.

## 1.5.181 — visible approved studio artwork
Owner confirmed 1.5.180 delivery but did not see the new watercolors. Two approved thumbnails (owl library and rabbit painting) now decorate existing large home navigation cards; all three creative entries show approved artwork on entry, including squirrel writing and hedgehog book. Original SVG remains on decode failure. No new layout rows, editor/canvas changes, data changes or full-size art on home. Cold-home budget unchanged (1,200,000 encoded bytes); two explicitly allowlisted 240px thumbnails are the only new startup requests. Syntax PASS, exact new Chromium/WebKit/regression CI and real-device visual approval required. Full previous package acceptance remains open.

## 1.5.182 — keyboard-first editor on iPad
Field report: in landscape Safari with keyboard open, controls left only a thin writing area. Reuse the existing textarea and visualViewport fit; remove the redundant dialog header in typing mode, prioritize the paper, combine drawing and save actions into one row at tablet widths, retain failure recovery and normal mode on keyboard dismissal. No storage/schema, artwork, fonts, or drawing engine changes. Synthetic tests now require >= 60% of a 230px visible tablet viewport for the writing surface, and reachable draw/save/done controls. Exact Chromium/WebKit/regression CI and physical iPad keyboard/caret checks are required; no physical-device acceptance claimed.

### IPAD WRITING STUDIO FINAL · PR #147

Продолжение ветки 1.5.182 от main `92e56b5519df44c06dec0a2b16117fa628e68d90` (1.5.181). Режим письма использует ширину, высоту и смещение VisualViewport, оставляет прежний textarea, а на широком экране выносит рисование, завершение ввода и сохранение сбоку. У текстового листа единственная прокрутка. Отложенная проверка после изменения viewport прокручивает только лист до активной границы выделения. Размер по умолчанию 24 px, выбор размера действует при закрытой и открытой клавиатуре. Существующая защита записи и выгрузки сохранена.

В синтетической матрице Chromium при 300 CSS px над клавиатурой широкие iPad получили текстовый лист высотой 296 px, при 220 px — 216 px. Проверены доступность касания в трёх точках каждой кнопки, девять размеров (включая Split View и обе ориентации телефона), высоты 180/220/250/300/350/480 в пределах экрана, 20 циклов VisualViewport и 10 200 русских слов. Выделение с направлением сохраняется при возврате из рисования и вставке. Тесты Chromium и WebKit для точного SHA отслеживаются в PR #147. Физическая клавиатура iPad не проверялась.

## 1.5.183 · Девять друзей

Приёмку галереи запускает обычный browser-smoke в Chromium и WebKit. На двенадцати загрузках тест сравнивает героя, сцену, URL и пиксели декодированного изображения. Проверяет последние три входа, поворот, девять переходов по карточкам, закрепление героя, отказ загрузки и офлайн-вход с ранее просмотренной сценой. Тест личной книги открывает следующую пару страниц и сужает окно до одного листа.

Лимиты по-прежнему составляют 1 000 000 байт для пяти исходных файлов и 1 200 000 для холодного входа. Из галереи на главную загружается одна миниатюра. Измерения каждой конфигурации находятся в строках INITIAL SOURCE BYTES, COLD HOME RESOURCE BYTES и PASS keyboard viewport matrix браузерного журнала.

[Скриншоты с синтетической сказкой](docs/acceptance/friends/) · [Тесты галереи](tests/studio-friends.cjs) · [Оригиналы и манифест PDF](assets/author/friends/)

## 1.5.184 — independent visual and data acceptance follow-up (23 Nov 2026)

Candidate based on 1.5.183. Real edits: studio-layout.css, index.html, studio-drawings.js, two small entry illustrations, versioned release.json and sw.js. Canonical 9 heroes and 18-scene rotation preserved.

Visual evidence: https://github.com/rusai-dev/kniga-skazok/actions/workflows/studio-visual.yml captures before/after screenshots at 1024×768, 768×1024, 1194×834, 834×1194, 390×700, and 600×800, including 2 home visits, gallery, manuscript, simulated keyboard, canvas, fullscreen/palette, inserted illustration, shelf, book, family confirmation, learning sections. Examined Chromium before/after screenshots show a larger changing hero, composed creative entry cards, a calmer manuscript page, and a bigger drawing surface with lateral tools. These are actual running UI snapshots with synthetic data, not mocked screenshots.

Data safety: rejection of image removal is compared using all authored book fields and exact persisted library bytes; only transient textarea scroll offset is excluded. Export/import now compares the published and unrelated draft records with the actual export-time canonical JSON, retaining exact authored PNG strings, revisions and images. Previous draft snapshots and JavaScript optional undefined fields are not valid comparators of portable JSON.

Release gates: run regression and browser-smoke in Chromium and WebKit and studio-visual at exact final SHA. Five-file cold source limit <=1,000,000 bytes; cold home transferred bytes <=1,200,000. No storage schema migration, existing art overwrite, or forced reload of an open editor. An older green CI run is not a release gate for a new SHA.

NOT VERIFIED (hardware/account required): physical iPad Safari keyboard, floating keyboard and safe area; real Apple Pencil pressure/palm rejection; actual family account delivery; 30-minute drawing stress and memory/rollback. Do not mark full acceptance PASS based on simulated browser tests alone.

## 1.5.185 · Non-destructive navigation recovery (23 Nov 2026)

Reported on a physical iPad: section buttons appear non-responsive. Independent **public GitHub Pages** test on deployed 1.5.184: version and handler attachment confirmed; all home section destinations were touch-openable in clean Chromium/WebKit at 1024×768, 768×1024 and 390×700. User-device failure is **not reproduced**, and physical Safari state/cache is unavailable to the agent. Do not claim that user's incident was fixed on their device.

Safety changes: persistent family reader mode has an explicit link to personal studio without deleting family settings; a stale non-open dialog no longer leaves `modal-open` after Safari `pageshow`; failed startup library shape/read blocks writes instead of silently overwriting source bytes; a static navigation recovery link works even if application JavaScript fails. All changes retain the same local-library key/schema and no cache or child data is deleted. Additional browser tests include malformed stored library, restoration of stale modal CSS, and switching back from family to personal view. Public-site touch probe is kept as an isolated, synthetic-data check.

Required release gates: exact final-SHA regression, browser smoke in Chromium and WebKit, startup <=1,000,000 source bytes, cold page <=1,200,000; then live public site version and touch navigation after deployment. Not yet verified: actual user's iPad session and Safari storage, physical/floating keyboard and Apple Pencil, real family account delivery, 30-minute stress, and safe downgrade. Never close those debts based on CI alone.

## Candidate 1.5.188 — R14 legacy drawing transaction (2026-11-23)

- Based on the stacked 1.5.187 candidate. Fixes the legacy unfinished-drawing source/outline metadata pair: metadata is checked before replacing the source, failed writes trigger guarded rollback, deletion accepts empty/null as a confirmed state, and a stale tab does not overwrite another tab's source. No child data is touched or migrated.
- New isolated Chromium/WebKit browser smoke exercises metadata quota, source quota, unchanged image/outline after rejection, clearing a drawing, and a stale-write guard. These are synthetic fixtures, not physical iPad evidence.
- R14 remains **PARTIAL** pending exact SHA CI and failure/recovery checks on hardware. No family delivery or live deploy is claimed.

## Candidate 1.5.189 — R13 cloud transport routing (2026-11-23)

- Identified a real unreachable path in `fstart`: a family viewer always returned via the GitHub archive before evaluating provisioned `family-cloud-config.json`, while a host without GitHub token could use Supabase. This prevented a matching Supabase transport on the reader.
- Both roles now evaluate the same family-scoped validated cloud config first; **when enabled and matching**, use the cloud. With disabled/unavailable config, retain the legacy GitHub reader and GitHub/Peer host paths. No storage schema or child asset changes.
- `tests/family-cloud-routing.cjs` (invoked by Chromium + WebKit browser smoke) uses two isolated browser contexts and an AES-GCM-encrypted synthetic story to verify real client-side decode/display, and tests matching writer selection with a synthetic GitHub token plus the legacy disabled-config fallback.
- R13 is still **BLOCKED / NOT TESTED on real family devices**. A mocked RPC cannot prove the server ACL, real device reception, revocation or a successful live deployment. Physical iPad remains HARDWARE PENDING; do not merge merely on green CI.

## Candidate 1.5.190 — cloud reader revision rollback protection (2026-11-23)

- **R13/P0**, stacked on #154. Confirmed: `cloudTick(role=view)` previously accepted any changed server revision, including a lower revision, and replaced locally cached family books. A stale/misconfigured server response could make previously received books disappear from the reader.
- Cloud reader now rejects versions below the last verified cloud-specific revision, and rejects different book content under an unchanged received revision. New revision marker is additive (`<existing family cache key>-cloud-revision`); the legacy cached-book format and personal stories remain unchanged. Persisting books is attempted before the marker; if either write fails, UI states the local copy is not confirmed and retries.
- `tests/family-cloud-routing.cjs`: synthetic AES-GCM cloud transport plus lower-revision response, cache preservation and reload replay. No real family/child content or backend credentials used.
- Five startup source files: **999,900 UTF-8 bytes** versus **1,000,000** limit (exact candidate tree before final PR checks); cold-home HTTP budget, physical iPad and live second-family-device delivery remain separate, unverified gates.
- Overall **R13 BLOCKED/NOT TESTED on real family devices**, `R14 PARTIAL`, `R18 HARDWARE PENDING`. Release **NO-GO** without the requirements in Production MAX.

## Candidate 1.5.191 — R03/R14 IME and background text persistence (2026-11-23)

- **Observed code gap:** normal editor `input` saves synchronously, but `compositionend` and Safari `pagehide` previously only flushed drawing data. A final text value without a trailing `input` event had no independent final-save attempt.
- **Fix:** record last confirmed title/body values, recheck them on composition completion and on pagehide/hidden-tab, and retry prior failed local writes. The existing `commitLibrary`/stale-tab guard remains authoritative; a quota error does not authorize overwriting another tab or showing a false saved status. No storage schema, child text, artwork or family transport changes.
- **New synthetic regression:** `tests/writer-background-save.cjs` (Chromium and WebKit via `tests/browser-smoke.cjs`): IME completion without input, pagehide with final unsignalled text, failed quota write preserves prior bytes, retry when storage recovers, reload retains final draft. No personal data in fixtures.
- R03 and R14 remain **PARTIAL/HARDWARE PENDING** until actual Safari iPad keyboard/IME and resume are verified. Confirm the final exact-SHA regression, browser smoke and studio visual workflows before any merge. No user release is claimed.


## 2026-11-23 · кандидат 1.5.192 — R03/R14, безопасное закрытие редактора

- База: зависимая ветка PR #156 (1.5.191); отдельная ветка `writer-close-save-192`. `main` не меняется.
- Подтверждённый риск в исходнике: `editorSaveBlocked()` проверял только прежний `data-save-failed`, не сверяя последнее DOM-содержимое перед закрытием. Изменение текста без завершающего `input` могло потеряться при «Назад»/Escape без `pagehide`.
- Исправление: `editorSaveBlocked()` вызывает существующий `flushStoryDraft()` при активном редакторе и запрещает закрытие при неподтверждённой записи. Никаких новых ключей/миграций или изменений исходных детских работ.
- Тест: `tests/writer-background-save.cjs` моделирует изменение текста без `input`, отказ `localStorage.setItem` на закрытии, запрет выхода, повторный выход после восстановления и reload с точным текстом.
- Измерение source budget: пять файлов `index.html`, `classic-art-153.js`, `classic-art-155.js`, `andersen-art-156.js`, `learning-art-1536.css` — 999951 / 1000000 байт (до CI, подтверждение — по exact SHA).
- Gates: regression, Chromium/WebKit, visual, cold-home и deployed SHA требуют независимого подтверждения. Физический Safari/iPad, Pencil и реальная семейная A→B доставка — HARDWARE PENDING / BLOCKED. Полный релиз — NO-GO.


## 2026-11-23 · 1.5.193 R16 — selective eager art on story-first home
- Candidate based on PR #157 (1.5.192), separate branch `cold-home-lazy-learning-art-193`.
- Confirmed source of excessive cold-home load: the 27px secondary `#otherArt` element used `fairyArt('spelling')` and fetched the full 78,056-byte educational sprite even before selecting a learning section.
- Replace only the secondary icon with existing square-cropped `childArt('learn')`. Preserve full educational WebP atlas for exercises, and keep the same precache offline shell. No changes to personal works, draft storage, image masters, navigation or server endpoints.
- Regression gate: exact SHA `tests/regression.cjs`, Chromium/WebKit `tests/browser-smoke.cjs` cold-home asset and visible SVG assertions, learning-art checks, navigation and Studio screens. Hardware, physical Safari keyboard/Pencil and actual family delivery remain NOT TESTED/BLOCKED. Release: NO-GO.


## 2026-11-23 · 1.5.194 R14 — immediate cross-tab conflict notice
- Parent: draft PR #158 (1.5.193). Source fact: library write already enforced `localStorage.getItem(KEY)===storedLibrary`, but no `storage` event handler warned a second active writer until the next attempted save. A child could continue typing in a stale tab unaware of the conflict.
- Change: listen only for another tab's main library `KEY` write (same storageArea, changed serialized state). Do **not** merge or adopt external storage automatically. Set visible editor status and rescue draft export immediately; an unchanged stale editor may close normally, while an attempted edit fails its existing persist-first save check and activates the `data-save-failed` exit gate. No data/schema/migrations or new assets.
- New `tests/writer-tab-conflict.cjs`: same-origin Chromium/WebKit two-tab scenario, unsaved second writer, early warning, refusal to overwrite first tab, export visible, Back blocked, reload recovers the first tab's durable draft. Uses synthetic prose.
- Full test gates: regression, Chromium/WebKit browser-smoke, studio visual and live navigation on the **exact new commit SHA**. Physical iPad keyboard/Pencil, Cloud A-to-B family delivery remain HARDWARE PENDING/BLOCKED. Full release NO-GO.


## 2026-11-23 · 1.5.195 candidate · P0 cross-tab R14 + P1 deferred SVG R16
- Base is the exact tested R14 fix PR #159, SHA `d02b8a0154b13def4b2a16d44511a6b43d860fe1`. No source code from that fix was reset. Test `tests/writer-tab-conflict.cjs` remains enabled.
- Move existing world SVG scene strings to `world-scenes-194.js` and load them at first world entry. The single versioned module is included in the Service Worker shell. User drawings, saved stories, backup keys, private/family data and server endpoints untouched.
- New checks: full Node regression including the original SVG scenes, two-tab conflict, Chromium/WebKit cold-home resource budget, visible world navigation and offline fallback, studio screens. All gates must PASS on 1.5.195 exact SHA before considering merge. Physical iPad and real family receive remain HARDWARE PENDING / BLOCKED; release NO-GO.

### 1.5.196 — R13 truthful family preparation labels (draft candidate)
- Family-selected local snapshots are labelled «Выбрана для семьи», not delivered/published; the local count reads «Выбрано для семьи». A confirmed backend/read-account receipt is still required to report delivery.
- Test coverage: `tests/regression.cjs` and `tests/browser-smoke.cjs` check the family badge and wording. Exact-SHA CI and real A→B delivery are **NOT TESTED** until run evidence exists.
- This change preserves familyPublished storage data, private drafts, image bytes, transport code and URL secrets; it does not enable `family-cloud-config.json` or publish the site. Hardware R18 = PENDING; release = NO-GO.

### 1.5.197 — R13 direct encrypted reader fallback (draft candidate)
- Confirmed source defect: when `family-cloud-config.json` has `enabled:false`, `fstart('view')` always took the GitHub reader branch and never reached the existing PeerJS/AES-GCM direct transport. Readers could not see an online writer unless the permanent archive was configured.
- Repair: after confirmed 404 of the public archive and with **no verified archive revision**, retry the same invitation through already-existing direct PeerJS transport. A saved archive high-water revision disables direct fallback to prevent silent downgrades. Both devices must be online simultaneously for direct delivery.
- Existing direct encryption, local reader cache and recipient ACK are reused; no new storage keys, secrets, persistent backend or child content is introduced. Later confirmed archive results take precedence and dispose of the direct peer.
- Synthetic end-to-end regression: `tests/family-peer-fallback.cjs` loaded by Chromium/WebKit browser smoke. Exact-SHA CI pending. Physical iPad / real A→B delivery **NOT TESTED**, release **NO-GO**.
