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
