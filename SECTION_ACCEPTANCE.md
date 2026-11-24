# Section-by-section acceptance / Книга сказок

## CORE GOLD STANDARD · контрольная точка 24.11.2026

| Критерий | Статус среза | Проверяемый результат |
| --- | --- | --- |
| ST, G21–G22 | PASS по целевым сценариям | Повреждённые JPEG/PNG, позднее декодирование и `pagehide`. Синтетические сказка, рисунок, метаданные и прогресс сравниваются побайтно. |
| ST, G21–G23 · проекты | Частично | История, атомарная запись, проверка редакции между вкладками, экспорт и восстановление отдельной копией. Связь с существующей сказкой проходит отдельный сценарий DATA02. |
| G24 · локальный импорт изображений | PASS по целевым сценариям | JPEG, PNG, WebP, лимиты до декодирования, подмена MIME и изменённая проектная SVG-обложка. Полный многослойный архив рассматривается отдельно. |
| IN, G14 | PASS по целевым сценариям | Завершение штриха, отмена, ширина, масштабирование двумя касаниями, клавиши и перемещение мышью. Для проектов проверены 100–800% и совпадение PNG после поворота. Физический Apple Pencil проверяется отдельно. |
| CL, PRO-04 | Частично | Точные 72 цвета и 12 семейств, RGB/HEX/альфа, круг HSV и SV, пипетка и 24 последних цвета проекта. Пользовательские наборы и профили остаются открыты. |
| PERF, G05/G07/G09 | Частично | Ленивый вход в оба маршрута, повтор после отказа загрузки, защита при закрытии. Ориентир 850 000 байт и длительные аппаратные замеры остаются открыты. |
| DATA02 · связь рисунка со сказкой | Частично | Отказы на трёх границах записи, восстановление, повтор без дубля, вход в слои и возврат. |
| FLOW2 · позиция рисунка | Частично | Текущий курсор подтверждается при потере контекста, отмена сохраняет текст и холст. Журнал сохраняет связь с редакцией проекта, восстанавливает подтверждение и исключает повторную вставку. Совместный архив обоих хранилищ остаётся открытым. |
| FLOW, G25–G28 | PASS в синтетическом переходе | Проверка хэшей, ожидание старых клиентов, сетевой отказ, квота, неправильный MIME и содержимое. Версии N и N+1 открываются после подтверждения и откатываются офлайн. Фактическое развёртывание и Safari/PWA отдельно. |
| C, G29–G32 | Частично | Панель свободного рисунка держит холст на месте при открытии палитры на 320, 360, 390 и 430 CSS px. Раскладка для рабочей руки и физические устройства остаются открытыми. |
| G19–G20 · рост проектов | Частично | Счётчики PNG и редакций, отдельная оценка квоты и резервный архив. Подтверждено сохранение и повторное открытие после 30 минут синтетической нагрузки. Длительный аппаратный замер и доказательство отсутствия утечек остаются открытыми. |
| G33 · задержка | FAIL в синтетическом прогоне | Linux WebKit, 2048×2048 с восемью слоями, p95 интервала кадров 49–61 мс при ориентире 33 мс. Целевой iPad не проверялся. |
| ST3–ST4 · история проектов | Частично | 105 воспроизводимых штрихов с попиксельной отменой и повтором на 720×480, объединённое автосохранение и отдельная рабочая копия выбранной редакции. Нагрузки больших профилей и долговременный аппаратный прогон остаются открытыми. |
| LY01 · слои | Частично | Независимые растровые слои 720×480, порядок, имя, скрытие, блокировка, прозрачность, семь режимов смешивания, отмена и повторное открытие. Группы, блокировка группы и обратимое объединение двух обычных слоёв реализованы. Перетаскивание и аппаратные профили остаются открытыми. |
| LY02 · маски | Частично | Альфа-замок, обтравка, редактируемая альфа-маска, инверсия, временное отключение и сохранение маски отдельным PNG. Референсный слой ограничивает заливку и сохраняет исходный хэш. Маски на больших профилях требуют отдельной проверки. |
| CAN01–CAN04 · холст | Частично | Создание профилей и собственных размеров, расчёт бюджета, 2048×2048 с восемью слоями, полный PNG/JPEG, прозрачный фон и архив. Профиль 4096² отклоняется до записи. Замеры 3072²/4096² и iPad остаются открытыми. |
| BR, ED, FX, ST, PRO-01–08 | Частично | Проверены отпечатки 11 рисующих материалов и отдельный ластик, настройки, импорт и экспорт пресетов, непрозрачность маркера и отмена. Полная проверка эффектов, выделения и трансформаций остаётся открытой. |
| HARDWARE / CHILD UX / FAMILY | NOT TESTED | Физический iPad, самостоятельные задачи художника и фактическая семейная доставка требуют отдельных сессий. |

DEPLOYMENT — ветка разработки. Для релиза нужны оставшиеся критерии PDF и явное разрешение владельца.

Active: **01 — Мои сказки / авторская мастерская**. Status: **technical release merged; deployment and full acceptance pending**.
Current verified main: 1.5.176, de9a4e9cfc5ff54372ce57009806b161ccc8f2d9. Historical entries retain their base SHAs.
Last integrated PR: #141. All mandatory CI checks passed; live deployment, physical iPad and full acceptance unverified.

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


## 1.5.162 — technical acceptance / merge evidence (2026-11-21)
#126 exact head 62f40d45ac5b91258484ae19e22e85c511c8788c passed regression, Chromium and WebKit (run 44820132064). #125 exact head 1c0540c212b63a848f5fdd44beab2693a36a2aa6 is its ancestor; #125 separate CI was cancelled, not reported as success. Chose integrated #126 rather than merge the intermediate separately: comparison of #124 head against then-main bccd14a6373318f4be705cac021cc2489c0dde26 showed zero file changes; #126 synthetic merge against main also had zero changes relative to exact head. #126 merged d66bba0a4d2830642cd0ab0db73388fc30f9560a, verified main release.json 1.5.162 and comparison against tested head has zero file changes. #125 now closed as merged. Candidate startup estimate 999308 B / 1000000 B (692 B reserve), not network transfer or physical iPad measurement. Public Pages endpoint and release JSON unreachable from current environment (DNS/web access failure); deployment not confirmed, no evidence of outage. No real child data accessed. No full acceptance rows newly passed: 0/12; actual iPad, anonymous live family archive and actual performance remain open.
Next: check live release.json and test on physical iPad: from My Stories select a new draft, type several Cyrillic lines, choose an optional cover, read, close and reopen; report keyboard obstruction and preservation of original text/illustration. Continue package 01. Before further runtime additions, free startup budget losslessly and measure; do not transition to package 02 without full acceptance.


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


## 1.5.169 technical merge + next coordinated package 01 candidate
#134 exact head 3b2fc9bd9948b51ff3a7f82250c8b6e50d4798a0: regression, Chromium, WebKit all passed run 44870195085; synthetic merge matched exact tree. Merged beb42624fed5e0a848767f6e6acd3d5c3eb83b75, main release.json 1.5.169, zero file diff from tested head. Pages DNS resolution unavailable in this environment; not outage evidence. SVG hashes verified by browser CI; physical visuals not verified.

A09 in new unversioned working candidate: all three family transports now re-check authoritative publication snapshot after asynchronous work and immediately before dispatch. GitHub token checked again before write/confirmation; already-dispatched writes cannot be withdrawn and retain returned SHA for subsequent conflict checks; stale verification is not shown as current. Peer/cloud also reject stale payloads. No schema, credentials, actual archive operations or real child data touched. Extracted synthetic tests passed for remote read, encryption, changed snapshot, stale confirmation and normal retry on all three paths; JS syntax passed. Source estimate 998375 B (was 997907). Full CI pending. No new version until coordinated candidate complete. Mandatory full rows 0/12; iPad, real anonymous archive, live Pages and actual performance not verified. Next: run exact-head CI, review race after dispatch and atomic local writes; complete editor and family route checks, then version integrated candidate for release. Do not transition to 02.


## Package 01 coordinated 1.5.170 candidate
Prior #135 head d3a8f63345f4c1d21e7c25df334ce31a9f48ec14 passed regression, Chromium and WebKit (44871329566). Continue same PR, not a separate release. A03/A04/A06: assign manuscript as textarea value (HTML parser otherwise discards first newline); preserve whitespace in authored body and nonblank title when saving book; preserve leading LF in plan fields and orphaned theme/icon from existing book. A07: delayed photo result cannot mutate a closed editor; unfinished drawing blocks insertion; explicit save-and-close waits for image. A02/A09: malformed family snapshot does not break personal shelf or reader; show invalid status, disable share action; do not modify bad archive automatically. Single checked snapshot per shelf render. Add synthetic browser scenario for exact manuscript and note on reload and publication, invalid family metadata and delayed photo result. Source estimate 999207 B (previous 1.5.169 997907 B); unchanged budget, keys, artwork and data format. JS syntax passed; exact-head full CI pending. No production data or archive touched. Physical iPad, Pages release endpoint and actual latency/memory still not verified; 0/12 full mandatory rows. Next: verify exact #135 CI, fix failures in same PR, compatible merge and independently verify Pages. Continue atomic-write audit and physical iPad acceptance; no package 02.


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

## Пакет 01 · контрольная точка PR #145

База `5315cf75cff7dbfcfe893c4b9613223bad117599`, код кандидата 1.5.179 `6800bcb106ed948a0b8a4bb9eb7f70ae2c617db2`, стартовые исходники 999 501 Б. В таблице статус относится ко всей строке.

| Критерии | Статус | Проверено и осталось |
| --- | --- | --- |
| A01–A02 | НЕ ПРОВЕРЕНО | Пустой лист, личная полка, поиск, несколько черновиков и возврат проверены в браузере. Остался полный проход на iPad. |
| A03–A04 | НЕ ПРОВЕРЕНО | Сценарии отказа записи, устаревшей вкладки и аварийного скачивания. Отдельные холсты, транзакционная миграция и реальный IME остаются открыты. |
| A05–A06 | НЕ ПРОВЕРЕНО | Версии текста и оформление покрыты регрессией. Полная визуальная сверка всех состояний ожидается. |
| A07 | НЕ ПРОВЕРЕНО | Синтетические касание, давление и пропущенный pointerup, вставка, отмена и экспорт. Редакции вставок, физический Pencil и 30 минут остаются открыты. |
| A08–A09 | НЕ ПРОВЕРЕНО | Личное чтение и явная семейная публикация через синтетический независимый профиль. Фактическая доставка семье не проверена. |
| A10–A12 | НЕ ПРОВЕРЕНО | Отмена отложенного восстановления, бюджет, программный офлайн. VoiceOver, физическое устройство и живое обновление остаются открыты. |
| V01–V03 | НЕ ПРОВЕРЕНО | Геометрия входа в пяти viewport, восемь входов, декодирование, выбор, загрузка одной миниатюры. Память и полные метрики задержки не измерены. |
| V04–V06 | НЕ ПРОВЕРЕНО | Сделаны снимки полки, письма, клавиатуры, холста, кистей, вставки и книги. Полное покрытие состояний и устройств впереди. |

До приёмки пакета проверять точный HEAD в CI, реализовать оставшиеся операции с оригиналами, затем провести проверку на устройстве. [Визуальные снимки](docs/author-studio-visual-1.5.179.webp)

## STUDIO FINAL · контрольная точка 1.5.180

База `5315cf75cff7dbfcfe893c4b9613223bad117599`, код `75e5f0e1b427b624fb2e817a7322375b9b262202`, PR #145. Статусы для полных строк документа. [Фактические снимки](docs/author-studio-visual-1.5.180.webp)

| Критерии | Статус | Доказательство и граница |
| --- | --- | --- |
| F01–F02 | PASS | Новый лист, возврат, продолжение того же PNG, вставка по якорю, правка и чтение. Четыре ART-N, пять фактических снимков. |
| F03–F04 | НЕ ПРОВЕРЕНО | Синтетический отказ quota, PNG и потерянное касание покрыты. Полные T01–T10 и независимая проверка iPad открыты. |
| S01–S03 | НЕ ПРОВЕРЕНО | PNG и предыдущая редакция, два листа в одной сказке, независимость другой, обратное чтение записи и отказ quota проверены. Длинный штрих, стресс, широкая матрица конфликтов и отдельная копия остаются открыты. Используется один localStorage-документ с последовательной проверкой, а не транзакционный IndexedDB или атомарный межвкладочный compare-and-swap. |
| S04–S05 | НЕ ПРОВЕРЕНО | Экспорт и импорт в новый профиль, точное чтение оригиналов, проверяемая точка возврата. Остались испытания обновления и отката с прежних сборок и явный индикатор даты полной копии. |
| T01–T10 | НЕ ПРОВЕРЕНО | Добавлена матрица девяти размеров с hit-test и выходом из полноэкранного холста. Режим 320×568 ограничивает второстепенные инструменты. Остались 200%, реальные safe area, клавиатура, Pencil, p95, память и 30 минут. |
| A01–A12 / C01–C06 | НЕ ПРОВЕРЕНО | Пройден синтетический путь до личного чтения и отдельная проверка семейного транспорта. Полные критерии требуют дальнейших тестов и подтверждения на устройстве. |

## Release gate follow-on 1.5.180 — reversible original removal
Exact prior HEAD 1b7a4bda15c7eeb61d519b04e8b03f4870a5b0f4 passed regression, Chromium, WebKit (45067503206); merge preview identical tree. Before publication retain removed authored PNG and previous version as separate unfinished sheets in the same confirmed library save; detach pending edits from removed slot, refuse removal if sheet capacity/storage prevents retention. Test deletion, persisted current/previous original, reload and reinsertion of exact PNG; existing optional photo/cover behavior unchanged. Five measured files 999985 B. Syntax PASS; new exact CI required. Real iPad, actual family delivery, 30-min stress, old-editor writes after downgrade remain unverified. No other repo or real child data touched.

## 1.5.181 — visible approved studio artwork
Owner confirmed 1.5.180 delivery but did not see the new watercolors. Two approved thumbnails (owl library and rabbit painting) now decorate existing large home navigation cards; all three creative entries show approved artwork on entry, including squirrel writing and hedgehog book. Original SVG remains on decode failure. No new layout rows, editor/canvas changes, data changes or full-size art on home. Cold-home budget unchanged (1,200,000 encoded bytes); two explicitly allowlisted 240px thumbnails are the only new startup requests. Syntax PASS, exact new Chromium/WebKit/regression CI and real-device visual approval required. Full previous package acceptance remains open.

## 1.5.182 — keyboard-first editor on iPad
Field report: in landscape Safari with keyboard open, controls left only a thin writing area. Reuse the existing textarea and visualViewport fit; remove the redundant dialog header in typing mode, prioritize the paper, combine drawing and save actions into one row at tablet widths, retain failure recovery and normal mode on keyboard dismissal. No storage/schema, artwork, fonts, or drawing engine changes. Synthetic tests now require >= 60% of a 230px visible tablet viewport for the writing surface, and reachable draw/save/done controls. Exact Chromium/WebKit/regression CI and physical iPad keyboard/caret checks are required; no physical-device acceptance claimed.

### IPAD WRITING STUDIO FINAL · приёмка режима письма

Матрица `tests/browser-smoke.cjs` проверяет размеры листа, попадание в видимую зону, три точки попадания по каждой основной кнопке, положение активной границы выделения и отсутствие внешней прокрутки. Синтетическое снижение VisualViewport на широком iPad даёт 296/300 и 216/220 px. Проверка 20 событийных циклов включает отсутствие записи при изменении геометрии. В отдельном сценарии проверяется выход из рисования и вставка без изменения выделенного фрагмента. При отказе записи доступны выгрузка текста и сказки с рисунками. Физический iPad остаётся отдельным испытанием.

## Девять героев · 1.5.183

| Критерий | Реализация и способ проверки |
|---|---|
| G01–G02 | Девять обязательных ID, отдельные WebP, миниатюры и подписи. Браузерный тест сверяет оригиналы с SHA-256 манифеста из PDF. |
| G03–G04 | На новый документ выбирается сцена. Закреплённый герой чередует две самостоятельные композиции. Состояние ротации хранится отдельно от библиотеки. |
| G05 | На главной есть кнопка «Мои друзья». Девять карточек ведут в действующие разделы. Полный оригинал открывается по портрету, дополнительные сюжеты доступны в альбоме. |
| G06 | В режиме письма доступны рисунок, галерея, фото, завершение ввода и сохранение. Проверяются координаты нажатий, курсор, выделение и область листа. |
| G07 | Двенадцать загрузок, три последних выбора, декодирование, сравнение пикселей, закрепление и поворот. |
| G08 | В каталоге снимков приведены два входа, девять карточек, письмо, клавиатура, холст, полка и разворот. Аппаратная проверка iPad и Apple Pencil требует устройства. Доставка семейного архива проверяется на синтетических данных в независимых профилях с тестовым сервером. |

[Снимки до и после](docs/acceptance/friends/) · [Браузерные сценарии](tests/browser-smoke.cjs)

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


## R03/R14 · 1.5.192 · закрытие редактора без последнего input

- Given: в личной сказке изменился DOM-текст без события `input` (например, финальная композиция IME). When: ребёнок нажимает «Назад» или Esc. Then: последний текст сохраняется подтверждённой локальной записью до закрытия.
- Given: хранилище отклонило эту запись. When: ребёнок закрывает редактор. Then: редактор остаётся открытым, прежняя сохранённая версия не повреждена, доступны повтор и спасательная копия. Когда запись снова доступна, повторное закрытие сохраняет текст; reload восстанавливает его.
- Автотест: `tests/writer-background-save.cjs`, запуск через `tests/browser-smoke.cjs` в Chromium и WebKit. Переход от синтетического теста к реальному iPad — только после аппаратного воспроизведения.
- Кандидат 1.5.192, PR зависим от #156; до exact-SHA CI — NOT TESTED, реальный iPad — HARDWARE PENDING.


## R16 · candidate 1.5.193 — defer educational atlas until learning
- Given: new service-worker-blocked Chromium/WebKit page showing personal home. When: cold-home resources settle. Then: no request to `assets/ui/learning-sprite-1536.webp`, but visible `#otherArt` remains at least 24×24 CSS px; both independent performance budgets pass.
- Given: the child enters a mathematics/logic lesson. Then: original learning sprite remains available, illustrated buttons and navigation operate as before. Offline shell keeps atlas cached for later sections.
- Synthetic browser tests do not substitute for real iPad memory, throughput or visual quality assessments. No final acceptance without exact-SHA CI and physical device review.


## R14 · 1.5.194 — cross-tab conflict before typing
- Given: two browser tabs open the same local library and both have an author editor. When: tab A persists a draft and tab B receives the native `storage` event. Then: tab B immediately displays an understandable warning and a draft export control, **before** its next input.
- Given: tab B types after the conflict. Then: its text remains in the open DOM for rescue but never overwrites tab A's saved draft. Back/Escape must not close an edited, unsaved stale editor silently; a passive unchanged stale editor may close without writing. Reload from a deliberate recovery retrieves tab A's persisted version.
- No automatic merging, no replacement of user text, and no forced reload while the user is typing. The two-tab CI test verifies synthetic scenarios only; real child/iPad acceptance still pending.


## R14 + R16 · 1.5.195 integrated candidate
- Given two simultaneous same-origin story tabs, When A saves and B has stale edits, Then warning/rescue and refusal of stale overwrite remain exactly as in tested PR #159. Existing synthetic `tests/writer-tab-conflict.cjs` must PASS Chromium and WebKit.
- Given cold home, Then world scene JS must not be requested before world entry. Given world entry after the script loads, Then every original distinct SVG is available and offline shell retains the script. On missing scripts, show retry message without changing personal work.
- Exact-SHA tests/visuals pending; physical iPad/Safari and second real family device remain not tested, release NO-GO.

### R13 · 1.5.196 candidate — selected is not delivered
- Acceptance: the locally selected family snapshot and counter must not state that a second profile received the book; reader acknowledgement remains the only delivery evidence. Regression and WebKit/Chromium browser-smoke must pass on this PR's exact SHA.
- Cloud `enabled:false` and a missing real family A→B test are still **BLOCKED**. No real release claim and no changes to the stored child's work.

### R13 1.5.197 — direct-reader missing-archive fallback
- Given cloud `enabled:false` and public archive 404, with no verified cached archive revision, the family reader must start direct PeerJS transport, decrypt test books, display them, save a local receiver cache and return an ACK for received revision.
- Given an existing verified archive revision, GitHub 404 must **not** trigger P2P fallback or overwrite reader cache. A later verified archive supersedes direct mode and closes the peer.
- Fallback is online-only; no claim of server persistence or delivery to an offline relative. Actual Safari/iPad and two real family devices remain open requirements.

### R13 1.5.198 · local disconnection semantics
- Given a prepared synthetic family secret and locally saved books, cancelling the disconnect prompt must preserve the session and key. Confirming must stop only the local connection, preserve personal manuscripts and offline artifacts, and never promise remote revocation.
- Removing a locally selected story must not claim existing server copies disappeared. New family invitations must state that old archives/links are not automatically revoked.
- Actual authenticated revocation requires separate backend credentials, deletion/rotation and real second-device verification; BLOCKED, no user data used in CI.

### R01/R02/R15/R16/R17 1.5.199 watercolor home
- Visual approval basis: 23 Nov 2026 illustrated `Книга сказок` concept. Implement using real DOM controls, existing watercolor assets and no new lazy/eager art bank. Validate 1024×768 landscape and 768×1024 portrait, 44×44 tap areas, no horizontal overflow, accessible focus and reduced motion.
- Resume opens writer, create opens clean editor without compulsory title/theme, personal bookshelf keeps existing ID route, creative studio and four learning buttons are usable. Regressions/visual diff must PASS on final SHA and original two budgets remain unchanged.

### 1.5.200 R07/R15 — owner bookshelf art and usability
- On personal shelf, a synthetic saved book must render with cover, readable title and 44×44 CSS px or larger cover/title/read/edit/info buttons at 1024×768, 768×1024 and 390×844, and no horizontal overflow.
- Reading and returning must not change book id/title/body/theme/rich fields. Book remains after reload. Visual regressions across Chromium/WebKit must pass; existing external author catalogs may not be restyled accidentally.
- No new art assets or child data migrations. Real iPad, family publishing and final merge gates unchanged.

### R03/R04/R15 · 1.5.201 proposed watercolor writing workspace
- On an iPad landscape layout without the keyboard, text writing area is to the left and illustrated actions «Нарисовать» / «Мои рисунки» remain visible beside it; no mandatory theme or wizard.
- With visualViewport keyboard height 230px, do not overlap text/caret or lose typed text; drawing and gallery actions stay reachable. At 768×1024 and 390×844 there is no horizontal overflow; buttons remain ≥44×44.
- Test reopening, offline save/reload, drawing insertion, keyboard and IME across Chromium/WebKit plus physical Safari/HARDWARE PENDING. Existing persistent storage schema unchanged.

### R15/R17 1.5.202 — hero title must remain unobscured
- At 1024×768, 768×1024, 834×1194, 390×844 the Friends button does not intersect H1, remains ≥44×44 and opens the real gallery. Hero and featured images decode to known project-manifest dimensions (240/320), without baked text, and all normal author actions keep working.
- Verify cold-home budget ≤1,200,000 B and startup five files ≤1,000,000 B on exact SHA. Physical iPad: PENDING.


### R01/R03/R04/R05/R07/R15/R17/R18 · 1.5.203 integrated candidate
- Verify actual squirrel/Egypt watercolor on first screen, no Friends/H1 overlap, 44px actions and simple start/resume/shelf routes at 1024×768, 768×1024, 834×1194 and narrow viewports.
- Verify real manuscript text and drawing tools side by side where space permits, and real canvas/brush/undo/redo/fullscreen/return with text unchanged. Confirm keyboard/caret during IME, zoom and orientation on physical iPad before granting hardware PASS.
- Full regression, Chromium and WebKit, visual checks, five-startup-file and cold-home budgets on final candidate SHA. Family publication to a real second account and authenticated revocation are BLOCKED with `enabled:false`; release NO-GO until verified.


### R15 / 1.5.204 — faithful interactive watercolor home, not a screenshot
- At 1024×768 and 768×1024 check a strong watercolor illustrated header with real "Книга сказок" text, a dominant "Мои сказки" section, Egypt-themed "Продолжить"/writer card, large real writing/drawing/shelf actions and compact reading/mathematics/logic/world cards. No home H1/Friends overlap, 44px clickable controls, horizontal overflow or forced long scroll in 1024×768.
- At 390×844, allow stacked cards but keep actual new/resume writing entry accessible and preserve readers/drafts. A confirmation-of-save badge must be tied to successful persistence, never decorative by default.
- All illustrations remain actual optimized assets; all action labels remain DOM text. Verify reduced-motion and visible focus. Exact-SHA Chromium/WebKit plus physical iPad Safari and Pencil proof required. Family A→B still BLOCKED while cloud disabled. Production release NO-GO.


### R15 / 1.5.205 — cat face framing in the real continuation CTA
- At 1024×768, 768×1024, 834×1194 and 390×844 visually verify that both ears and the whole black Egyptian cat face remain inside the left rounded image and are not occluded by the CTA text/play button. Use actual Chromium and WebKit screenshot artifacts and inspect them manually; source dimensions/hash tests are a necessary but not sufficient visual check.
- The writing/resume action remains one working button and is not a baked screenshot. Real nine-hero scene rotation, honest "Сегодня с тобой ..." caption, shelf, drafting, drawing and all four secondary learning entries remain functional and accessible. Cold-home must use ≤1,200,000 encoded bytes; the five original source files ≤1,000,000.
- Physical iPad Safari, keyboard, portrait/landscape and Pencil acceptance remain pending, family-cloud A→B delivery blocked; do not deploy without those checks.

### 1.5.206 · R01/R02/R08/R09/R15/R16/R17

- Given a clean profile, the real writing action starts a blank draft. After saving text and closing with Escape, «Продолжить сказку» opens that text again. The same action works after reload.
- The approved banner and decoded companion are both visible at iPad, split-view and phone widths. The frame retains the faces in the banner, the complete rotating portrait and the Egyptian cat's ears and muzzle. The greeting announces the decoded companion by name.
- On a return visit with a stale legacy cat cached, the current shell uses the verified versioned cat and banner online and offline. The existing story and drawing storage checks still apply.
- Evidence includes the full browser smoke and regression, matching before/after scenes and screenshots of the favorite and the cat crop in Chromium and WebKit. Hardware Safari, Pencil and real family delivery remain pending or blocked.

### 1.5.207 · Personal studio and reading

- When the writer opens and closes the illustrations drawer, the same text and caret are available. Saving a canvas drawing inserts its marker at that position and moves the caret past the marker.
- The visible zoom controls reach all four scales and retain the canvas bitmap. Brush, palette, undo, redo, PNG rescue and save behavior continue through the original drawing engine.
- The personal reader opens at the selected chapter or illustration. A previously selected personal cover and the story record survive reading and a reload. The book, chapter syntax and drawing storage formats are unchanged.
- The before/after browser evidence covers the editor, drawing workspace, personal shelf and book in landscape and portrait tablet sizes. Physical iPad screenshots and Pencil confirmation are pending.
