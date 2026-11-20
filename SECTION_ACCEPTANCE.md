# Section-by-section acceptance / Книга сказок

Active: **01 — Мои сказки / авторская мастерская**. Status: **implementation / technical acceptance pending**.
Base main: 1.5.150, d2c7b1fc62037df75ef6b5433b932460f677310d.
Coordinating branch: `section-01-author-acceptance`; candidate 1.5.151. CI must pass on its exact head. Previous #115 passed regression and both browser engines, merged. Pages and physical iPad not confirmed. Preserve all user data; only synthetic fixtures in tests.

## Acceptance matrix
Based on master prompt §§114–119, 127–132. A PASS requires evidence for the whole row, not merely code presence. All rows mandatory. No aggregate score; individual axes (function, content, usability, art, data/privacy, accessibility, speed/offline) remain unscored until evidence recorded.

| ID | Route / actions and required result | Status | Evidence / outstanding |
|---|---|---|---|
| A01 | Home: My stories / creative priorities, direct clean sheet, continue, drafts, Home and Back, portrait/landscape | НЕ ПРОВЕРЕНО | Prior #114/#115 CI; re-run viewport/touch routes and actual child test |
| A02 | Shelf: new, continue, draft picker, search/clear, theme/author, read/edit, private/shared labels, empty results, return | НЕ ПРОВЕРЕНО | Prior smoke and #115 search tests; inventory every visible action |
| A03 | Editor: title optional, body, focus view, done typing, save, back, Cyrillic, selection, long text, paste, IME, rotation | НЕ ПРОВЕРЕНО | #114 simulated visual viewport pass; real software keyboard not tested |
| A04 | New/multiple draft, reopen, edit existing, reload, offline, failed write, retries and export; concurrent tabs | НЕ ПРОВЕРЕНО | Candidate guard and test of sequential stale writes, not atomic merge; image-inclusive rescue and simultaneous races outstanding |
| A05 | Optional ideas, planning, words, grammar suggestions, preview and disclosure controls; never replace original | НЕ ПРОВЕРЕНО | Existing tests for private plan and import; inventory remaining controls |
| A06 | Chapter append/jump, title, bold/italic, preview selection, font/size and versions; failure/rollback | НЕ ПРОВЕРЕНО | Candidate chapter rollback test; existing version and chapter tests; candidate CI pending |
| A07 | Cover palette/image, draw/photo/gallery, insert/move/remove, cancel, save, restore, undo | НЕ ПРОВЕРЕНО | #112 placement conflicts with main; reimplement after safe budget reserve; validate drawings |
| A08 | Personal book reader: previous/next, page jump, text fits, art, font, rotation, resume/back/edit | НЕ ПРОВЕРЕНО | Existing paginated smoke; check all controls and long content |
| A09 | Explicit family share/unshare, theme/cover, only chosen snapshot, anonymous reader, refresh, errors, no draft leakage | НЕ ПРОВЕРЕНО | Existing synthetic archive verification tests; candidate stale tab gate; no live archive write/read without explicit authorization |
| A10 | Full backup/export/import, preview/cancel, restore/undo, corrupt storage, recovery, preserve drawings/metadata | НЕ ПРОВЕРЕНО | Existing archive tests; cross-tab race/rollback additional audit |
| A11 | All applicable actions: focus, 44px, contrast, keyboard/touch, small screen, reduced motion, error/disabled states; quiet white sheet and artwork | НЕ ПРОВЕРЕНО | ART-04 PDF p44 and existing writer fox; no new assets needed for current safety fix; inspect device and inventory |
| A12 | Startup budget, offline/update safety, actual transfer, response time, memory, no regression; live release and child independence | НЕ ПРОВЕРЕНО | 998489 → 999530 B measured source; CI/device/live Pages/latency pending |

**Accepted mandatory rows: 0 / 12** (previous tests provide partial evidence, not failure of all rows).
## Candidate changes
- Compare localStorage to last successfully read/written raw library before saving. On mismatch refuse stale write, keep editor open, expose rescue TXT and message. No schema changes. Not an atomic locking mechanism; simultaneous writes can still race.
- Refuse starting family publication from a known stale library; remote operations already in flight need separate audit.
- Skip stale async local archive snapshots; do not confirm skipped snapshot.
- Roll back failed chapter append and keep proposed chapter title.
- New regression and Chromium/WebKit tests: stale second tab, newest draft reload, stale archive/publication, chapter quota failure/retry.

## Remaining roadmap
01 active; 02 Читаем; 03 Творчество; 04 Математика; 05 Логика, память и внимание; 06 Познаю мир; 07 Русский язык и речь; 08 Жизненные и социальные навыки. Do not start 02 until 01 accepted. Previously accepted #115 is a carry-over, not transition to 02. #112 incompatible; do not merge blindly.

## Exact next action
Read CI for the current branch/PR head, fix failures without changing acceptance criteria or resource limits. Verify deployment separately if merged. Then free startup reserve losslessly, reconcile #112 placement and complete the per-action inventory including family/backup routes. Request one physical iPad test of typing/reopening when candidate is live; real family archive verification requires authorized isolated synthetic access. Do not mark either as PASS before evidence.

## Follow-on candidate 1.5.152
Branch `section-01-picture-placement`, based on #116 exact head 5aac4dd46fa4103ca1181ec62cb1262959ef346d; do not merge until #116 accepted and compatible with main. Expanded existing lossless dictionary; all 36 books exactly equal canonical JSON. Source budget 995955 B (from 999530 B). Restored only compatible placement logic from #112, not its obsolete HTML/catalog; optional move after paragraph, failed write rolls back text; failed cover change rolls back. Synthetic tests for marker edge cases, quota, placement and cover. A07/A12 evidence partial; mandatory rows remain 0/12; full CI pending. Next: finish #116, verify exact #117 or subsequent PR CI, deployment and device; add remaining action inventory and image-inclusive rescue.

## Follow-on 1.5.153
Branch section-01-draft-recovery, based on #117 head 5e14908f144e0d970cf11b059b3f92573a413f39. A04/A10: new on-demand single OWN draft JSON rescue (text, images, cover, plan, versions) from active editor on failed save. Existing TXT kept. Import through backup preview adds a private new draft; no replacement of books or publications, cancellation supported. Unknown theme restored as local theme. No storage schema change. Uninserted canvas is not part of snapshot. Source 998457 B; syntax checked, synthetic tests added, CI pending. Full device/real archive and concurrent writes still outstanding. 0/12 full mandatory rows accepted. Next: complete #117 then #118 exact head CI, inventory all optional controls, device check.

## 1.5.153 follow-up, same PR #118
Found full-copy rescue hidden by compact writer whitelist. Both rescue choices now share a 44px action row visible in keyboard mode. Backup file read is bound to the originating backup modal; late result cannot replace an unrelated dialog. Added compact-mode full rescue bounds check and quota-failed additive restore / retry with exact persisted-state comparison. Source 998842 B (prior 998457); syntax passed, new exact-head CI required. No schema change. Real iPad and live family archive remain blocked, A01–A12 full rows 0/12.

### Per-action inventory — writer / related routes (static audit, not blanket PASS)
| Screen | Controls / input | Expected result and return | Evidence / still required |
|---|---|---|---|
| Draft picker | [data-own-draft], [data-own-edit], newOwnStory | chosen private draft / edit / blank sheet, back to caller | existing browser paths; check focus/back |
| Writer main | storyTitle, storyBody, writerFocus, writerDoneTyping, saveStoryNow, close, publishStory, publishFamily | optional title, free text, expand/restore, blur, save/return, explicit publish | compact and quota browser fixtures; physical keyboard/IME unknown |
| Writer rescue | rescueDraft, rescueFull | TXT or complete private JSON, remain in editor, retry save | added compact bounds assertion and exact copy test |
| Writer quick idea | quickIdea, quickIdeaClose | one prompt, dismiss and restore focus, unchanged text | verify repeat/dismiss and no mutation |
| Writer extras / notes | writerExtras, story notebook details, [data-story-plan], storyTheme, storyIcon | optional disclosure, private notes/theme/icon, return to same text | verify touch, reload, no leak |
| Chapters | storyChapters, newChapterTitle, appendChapter, [data-chapter-jump], chapterStory | add/jump, preserve text on failure, return to editor | rollback test exists; check wrapped text/jump |
| Typography | storyFont, storySize, boldStory, italicStory, previewStory, bookPreviewChapter | chosen font/size, voluntary markup, preview and selection, exit preview | verify all normal and failure paths |
| Editions | versionSave, [data-version-use], [data-version-delete] | save/swap/remove with confirmation, current version retained | existing version fixtures; quota rollback |
| Pictures | drawStory, pictureStory/pictureFile, [data-cover-pic], [data-move-pic], [data-picture], coverColor, coverImage | insert, select cover, move, delete/cancel, return to editor | browser picture rollback tests; unfinished canvas separate |
| Ideas / words / literacy | ideaStage, ideaStory, writerWordSelect, literacyToggle, literacyCheck, literacyAccept, literacyNext, literacyLocate | one voluntary idea or correction; explicit acceptance only | individual action coverage and unchanged prose checks needed |
| Text import | loadText, storyFile | preview replacement confirmation, preserve edition, cancel/failure rollback | existing browser fixtures |
| Own reader | ownReadPages, ownReadBack, ownReadSmall/Large, ownReadPrev/Next/Jump | page fits, prev/next and jump, return, position retained | existing paginated fixtures; size persistence needs review |
| Family shelf | familyOwnInvite, familyOwnBack, family-own-book, shareFamilyBook | explicit selection, invitation setup, return, share selected snapshot | synthetic archive tests; real anonymous access unknown |
| Parent backups | download, restore/importFile, localRestore, undoRestore, confirmRestore, confirmDraftRescue, cancelRestore | validated file, confirm or cancel, additive draft vs full replacement; retry on failure | quota test added, async origin guard; full rollback evidence partial |

Next: verify #117 exact CI and merge if compatible; then #118 exact-head checks and Pages. Complete action audit for shelf, family and drawing including measured accessibility and real-device evidence. No new section until acceptance.

## 1.5.153 technical release / 1.5.154 follow-on
#118 exact head ed3e5eb passed regression, Chromium and WebKit (run 44813618525), merged to main 7c24012cc2a0a148239ee90791c6da482b42bbc0; Pages and real iPad not independently confirmed. Candidate section-01-reader-preferences / 1.5.154 addresses A08: reader size reset on reopen. Store optional validated size with existing per-book/room position; old bookmarks continue to work, no change to published books or authored font. Synthetic browser coverage for personal and family reader size, position, content unchanged; backup validation allows legacy bookmarks and five sizes. Source 998965 B (was 998842). Syntax and standalone validation passed; browser CI pending. Full rows 0/12. Next: exact-head CI, Pages and iPad verification; audit remaining controls and unfinished drawing recovery. No new package.

## 1.5.155 drawing rescue follow-on
Based on #119 b7e3582b3a2c11e920f240b5091ec85b6b9a0f8e; do NOT merge before #119 exact CI and compatible main. A07/A10: if local drawing storage or insertion fails, emergency PNG download in normal and expanded canvas; no state mutation or promise of durable download, original canvas remains open. Browser test exercises blocked draft and library writes, PNG byte comparison, failed insert and retry. Initial source 999499 B vs 998965; syntax passed; full CI pending. Previous one global unfinished drawing key retained; no per-story canvas/undo history migration. Pages release endpoint inaccessible, real-device and live family archive pending. Full rows 0/12. Next: verify #119 and this candidate exact CI, correct failures, then Pages and device. No new section.


## Package 01 candidate 1.5.156 — approved writer squirrel
Owner approved replacing the ART-04 fox with the exact illustrated squirrel. New immutable UI WebP URL and manifest; original fox kept for earlier offline shells, no changes to child artwork or data. Source generated in chat, 1254 × 1254, SHA-256 4355a2e29dd7179bb104e6163cad9a80cd450c06466b62b7fed3907a5eba03f9; resized to existing 144 × 144 card slot, 5460 → 5232 B. Maintains generic paper/pencil SVG fallback and separate white editor. Browser smoke now checks exact new URL, hash, decoding, offline shell and missing-image writing route. Startup source estimate 999504 B (previous 999499 B); actual transfer/latency/iPad not measured. #119 passed all three jobs and merged b439ab9f6c89877360b631e2bf05268e08554e7c; main tree equals #119 head, #120 prior exact head passed all three jobs. Reconcile #120 with main as two-parent candidate retaining previous drawing rescue; require fresh exact-head CI on 1.5.156. Full acceptance 0/12, live Pages and physical iPad/family archive still unverified. Next: verify CI, deploy then confirm the card and writing on iPad; continue A01–A12.


## 1.5.157 visual follow-on (A01/A03/A05/A11)
Candidate section-01-author-visual from #120 exact head 6846494e641ae47e348aacb04140fb7be0d2a1b9, which must pass and merge first. Enlarge approved squirrel card art 54 → 72 CSS px on portrait iPad, 64 on short landscape, 54 on narrow phones; native source remains 144×144 (5232 B), no additional network request. Shorter writing guidance, distinguish local shelf from family publication, correct a misleading publication-error message for private save failure. Browser tests assert exact artwork geometry and card containment, existing full first-screen and entry/return criteria retained; optional idea dismissal focus and unchanged text covered. Startup source 999485 B (was 999504), unchanged storage and artwork bytes. A01–A12 full acceptance still 0/12; physical iPad, live family archive and deployment not verified. Next: verify #120 exact checks and deployment, then this exact head; continue remaining action inventory and lossless reserve. 


## 1.5.158 personal shelf (A02/A11)
Candidate section-01-personal-shelf, retains #121 exact head 0943e2b605e16f77c0ea06a3c554c6c8ea3e8b13; reconciles merged #120 main a87e1021d95847bcb5c3d38b624d47988f1dc967 (tree equals tested #120). #120 1.5.156 regression, Chromium and WebKit passed run 44816316416; merged, Pages not confirmed. Personal shelf now displays deduplicated draft + edit count, updated on render; personal actions visible during global personal search even from classic shelf. Title targets >=44px, read/edit >=48px with larger text, changed-edition badge uses lavender; shortened empty-state text. Existing covers, feedback, text and storage schema untouched. Added browser assertions for count, search actions, title/action geometry and retained actual read/edit/reopen tests. Startup estimate 999510 B vs 999485 B. #121 must pass on exact head and be reconciled before candidate merge, then fresh complete CI on this candidate. Mandatory full acceptance remains 0/12; iPad and family archive not verified. Next: finish #121, verify Pages, test this candidate; no parallel expansion.
