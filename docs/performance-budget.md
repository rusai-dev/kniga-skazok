# Performance budget — 2026-11-20

## Observed baseline, 1.5.124
Main SHA 985c859b634790c3cbe323a62919d3045f72e02f. All required checks passed; Pages deployment successful.
- Five initial source files: 999,010 B (hard limit 1,000,000 B; 990 B reserve).
- Whole tracked tree: 3,825,401 B, including tests and documentation; NOT device disk usage or startup payload.
- UI artwork: 88,392 B including its manifest; book assets: 1,256,742 B; world assets: 279,259 B.
- The previous log labelled HOME RESOURCE BYTES was sampled *after* opening library, math and logic. In local uncompressed CI (run 44768513088), encoded bytes were 1,086,878 in Chromium and 1,165,210 in WebKit for both tablet viewport sizes. These are cumulative scenario measurements, not a cold-start benchmark.
- The candidate 1.5.125 retains 998,917 B initial sources and adds 78,688 B of chapter-3 art on demand.

## Separate gates
The existing 1 MB initial source cap stays unchanged. The test now samples cold home before any child interaction in a fresh context with service workers blocked. An additional **provisional** 1.2 MB encoded response-body cap on the local server catches hidden startup resources; it is not an increase of the source budget or a claim about actual iPad network/RAM. Optional full artwork and the legacy art/peer files are explicitly forbidden in this initial request set. Cumulative library/maths/logic log remains separate. Log navigation timing for both views; no device timing threshold until a calibrated baseline exists.

## Development policy
- Target 800–850 KB initial source budget by genuinely deferring optional reading banks/world content and reusable lesson code, without breaking cold/offline authoring. Do not merely move eager files outside the measured list. Validate the new dependency graph and service worker versioning first.
- Preserve full-quality original masters; responsive delivery by real display size and DPR. Only decode the visible scene; maintain fallback text and navigation.
- Reuse lightweight models and pointer handling for direct manipulation. Check continuous drag/brush frame pacing, cancel/undo, rotation and save/reopen, including long sessions. Never evict user work when pruning derived asset cache; bound artwork cache only with a tested offline strategy.
- Measure actual cold/warm startup, chapter opening, input response, frame times, peak memory and disk/cache growth on the same device and conditions before and after structural changes. No hardware/child observation obtained yet. Proposed targets are engineering objectives, not measured results.


## R16 · 1.5.193 cold-home icon deferral (candidate, 2026-11-23)
- Baseline 1.5.192 exact SHA `b739224b15c88364b82c8fdcda345720577b6574`: five source files **999,951 B**; Chromium cold-home maximum **1,191,975 B**; WebKit maximum **1,192,307 B** (local browser tests, NOT hardware).
- Root cause: `#otherArt` on home inserted `fairyArt('spelling')`, which applied the entire `learning-sprite-1536.webp` CSS background to a 27px icon. The full educational atlas weighed **78,056 B** and loaded before any learning activity.
- Candidate: reuse existing `childArt('learn')` at a square 27px viewBox for this small secondary home icon. The original learning sprite and styling remain intact for math, logic and language screens; its service-worker precache entry remains intact to support offline use. No asset edits, additional requests, storage migrations or child data modifications.
- Acceptance: `tests/browser-smoke.cjs` asserts the learning sprite is **not** in cold-home resources and the replacement SVG is >=24×24 CSS px, while existing learning checks still require the real learning sprite and usable learning routes. Keep independent cold-home <1,200,000 B and source <=1,000,000 B. Final measurement and exact SHA CI must be recorded separately; not a claim about actual iPad RAM.


## 1.5.194 guardrail
- This patch targets P0 cross-tab data safety, not source-size optimization. Catalog data cannot be trivially deferred because `readyAuthorBooks` is referenced while constructing the primary author shelf; a simple separate script would add an asynchronous dependency to the child's main story pathway. Do not claim catalog deferral or 800–850 KB achieved. Keep both existing performance budgets and instrument future refactors before moving content.
