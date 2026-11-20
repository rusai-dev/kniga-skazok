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
