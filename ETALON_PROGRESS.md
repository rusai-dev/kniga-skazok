# ETALON_PROGRESS — проверяемый журнал «Книги сказок»

**Источник:** PDF `Kniga_skazok_MASTER_REPEATABLE_CHATGPT_ETALON_ILLUSTRATIONS_2026.pdf`, страницы 2–12, 13–23.  
**Последняя сверка:** 2026-11-23.  
**Только факты:** статус в этом файле никогда не заменяет проверку GitHub, CI, HTML опубликованного сайта и реального iPad.

## Текущая контрольная точка

- `main`: 1.5.185, SHA `b5fdfe0ac7fc97ecabd1474968493348e4a633e9` — интегрирован PR #150.
- PR [#150](https://github.com/rusai-dev/kniga-skazok/pull/150) — **MERGED**: безопасный возврат из семейного просмотра, восстановление stale modal после Safari pageshow, защита от повреждённого локального формата. На точном финальном SHA зелёные regression, browser Chromium/WebKit, live-navigation Chromium/WebKit, визуальные снимки.
- НОВЫЙ PR [#151](https://github.com/rusai-dev/kniga-skazok/pull/151) — кандидат 1.5.186: девять персонажей со второй реальной сценой прямо в галерее, без новой вкладки; пиксельные тесты всех девяти, CSS 44px и до/после визуальные снимки. **НЕ объединять до success всех проверок финального SHA**.
- Физический пользовательский iPad и реальная семейная доставка остаются **NOT TESTED**; сценарий неактивных разделов на реальном устройстве не признан воспроизведённым/закрытым.
- Девять вложенных в PDF WebP совпадают со SHA256 в исходном манифесте; репозиторий содержит базовые и альтернативные сцены, новые дубли не нужны.
- Сохранять бюджет пяти стартовых файлов <=1,000,000 B и холодной загрузки <=1,200,000 B.

## Порядок следующего рабочего цикла

1. Проверить на финальном SHA PR #151: девять сцен переключаются в том же окне, два настоящих декодированных WebP на героя, не меняется избранный, все кнопки работают. Обязательно regression + browser smoke Chromium/WebKit + визуальные доказательства.
2. При зелёном CI и отсутствии конфликтов безопасно опубликовать 1.5.186 и подтвердить `release.json`, SW, публичный HTML/тап-маршруты. Физический iPad не объявлять проверенным.
3. Следующий P0/P1 — R02–R06: удобное свободное письмо, фокус/клавиатура, помещение рисунков рядом с абзацами, рабочий холст, галерея рисунков. Сравнить реальные скриншоты с PDF стр. 19–22.
4. Затем продолжить R07–R18; реальные устройства, семейные аккаунты и долговременное тестирование фиксировать отдельно.

## Текущий status R01–R18

| ID | Приоритет | Статус | Что мешает окончательной приёмке |
|---|---|---|---|
| R01 | P0 | PARTIAL | Навигация, кнопки и возврат; подтвердить финальный сценарий и доказательства |
| R02 | P0 | PARTIAL | Личные сказки, черновики и поиск; подтвердить финальный сценарий и доказательства |
| R03 | P0 | NOT TESTED | Клавиатура iPad и фокус текста; подтвердить финальный сценарий и доказательства |
| R04 | P0 | PARTIAL | Рисунок из редактора сказки; подтвердить финальный сценарий и доказательства |
| R05 | P1 | PARTIAL | Большой холст и живые инструменты; подтвердить финальный сценарий и доказательства |
| R06 | P1 | PARTIAL | Мои рисунки и уроки; подтвердить финальный сценарий и доказательства |
| R07 | P1 | PARTIAL | Книга, главы и книжная полка; подтвердить финальный сценарий и доказательства |
| R08 | P1 | PARTIAL | Девять канонических героев; подтвердить финальный сценарий и доказательства |
| R09 | P1 | PARTIAL | Ротация видимых сцен при входе; подтвердить финальный сценарий и доказательства |
| R10 | P1 | PARTIAL | Чтение и библиотека авторов; подтвердить финальный сценарий и доказательства |
| R11 | P2 | PARTIAL | Математика и логика; подтвердить финальный сценарий и доказательства |
| R12 | P2 | PARTIAL | Познаю мир: совы, мыши, Египет, природа; подтвердить финальный сценарий и доказательства |
| R13 | P0 | NOT TESTED | Семейная публикация и приватность; подтвердить финальный сценарий и доказательства |
| R14 | P0 | PARTIAL | Хранение, backup и восстановление; подтвердить финальный сценарий и доказательства |
| R15 | P1 | PARTIAL | Художественная система и доступность; подтвердить финальный сценарий и доказательства |
| R16 | P1 | PARTIAL | Скорость, вес и офлайн; подтвердить финальный сценарий и доказательства |
| R17 | P1 | PARTIAL | Доказательные скриншоты и сравнение; подтвердить финальный сценарий и доказательства |
| R18 | P0 | NOT TESTED | Релиз и аппаратная приемка; подтвердить финальный сценарий и доказательства |

## Проверка перед заявлением DONE

Статусы DONE ставить только при фактическом end-to-end результате: реальные изменения + сохранённые данные + подтверждённые скриншоты + CI success exact SHA + проверка публичного сайта. Для физического iPad, Apple Pencil, реальных семейных устройств и 30-минутного рисования веди отдельные HARDWARE PENDING / NOT TESTED без ложных заявлений.

Запрещено тестировать на реальных детских данных и удалять их из Safari. Не публиковать личную сказку без действия пользователя.

### 1.5.197 R13 draft (after #162)
- Existing fallback bug: the reader always entered the GitHub polling branch when cloud was disabled; no direct PeerJS route was reached.
- Added conditional direct encrypted fallback on confirmed missing archive, preserving the archived high-water guard. CI and hardware release gates to be checked on final SHA. Main/Pages untouched.

### 1.5.198 R13 candidate — truthful local disconnect
- Source audit: old «Отключить» removed only browser key, did not revoke public encrypted archive/invitation. UI now distinguishes local stop from archive revocation. Synthetic browser test checks cancel/accept and unchanged story storage. Exact SHA CI pending; no production merge or hardware claim.

### Candidate 1.5.200 — watercolor personal bookshelf
- Personal saved-book cards now share the approved home art palette and book-like surface. Isolated CSS and smoke test added; no data model, image manifest or publishing changes. QA requires current SHA checks and iPad hardware remains pending.

### 1.5.201 proposed — writing page complements approved watercolor home and shelf
- Separate real CSS presentation + one accessible art heading. Changes are scoped to the existing writer surface; not a stand-alone mock. Illustration uses an existing optimized project asset after editor open. CI exact-SHA pending, no Pages deployment.

### 1.5.202 · candidate watercolor paint studio
- Only CSS treatment of existing editable canvas and its real tools. Browser visual-functional test added before implementation. Never embed image UI mockups as inert controls or change child's saved work; pending exact SHA CI.
