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
- Treat 800–850 KB as an optional engineering improvement, not a release requirement or an end in itself. Keep the 1,000,000 B hard initial-source cap. Genuinely defer optional reading banks/world content and reusable lesson code where measured benefits justify complexity, without breaking cold/offline authoring. Do not merely move eager files outside the measured list. Validate the new dependency graph and service worker versioning first.
- Preserve full-quality original masters; responsive delivery by real display size and DPR. Only decode the visible scene; maintain fallback text and navigation.
- Reuse lightweight models and pointer handling for direct manipulation. Check continuous drag/brush frame pacing, cancel/undo, rotation and save/reopen, including long sessions. Never evict user work when pruning derived asset cache; bound artwork cache only with a tested offline strategy.
- Measure actual cold/warm startup, chapter opening, input response, frame times, peak memory and disk/cache growth on the same device and conditions before and after structural changes. No hardware/child observation obtained yet. Proposed targets are engineering objectives, not measured results.

## Owner-approved quality-first resource policy (2026-11-20)

- There is no artificial hard cap on total educational content. Distinguish initial source bytes, actual cold/warm transferred bytes (including service-worker installation traffic), optional downloadable assets, decoded memory, disposable cache and irreplaceable user data. Repository size includes development files and is not installed size.
- Keep all existing automated limits (1,000,000 B initial sources; provisional 1.2 MB cold home encoded response bodies). Do not change a gate merely to pass CI. Start with a lightweight home and offline writer; defer optional content without losing access to already available material. Any change to offline availability requires tests and an explicit fallback. Release only after regression, Chromium and WebKit pass on the candidate.
- Preserve original full-quality artwork. Select derivatives by actual rendered size and device pixel ratio, compare on screen. Illustrative working ranges, not rejection thresholds: 10–40 KB per thumbnail, 80–300 KB per full scene. A library of 20–50 MB or more is acceptable in principle if browsing, opening chapters and cache management remain responsive; it is not a download target or a guarantee of device capacity. Do not preload the entire library or add assets merely to fill a budget.
- Child works (stories, illustrations, backups, progress) are outside disposable artwork cache; never delete, resize, overwrite or evict them to meet a resource target. Keep drafts and publication behavior intact. Verify persistence and export; do not promise browser storage can never be evicted by the OS.
- Proposed device acceptance targets, to be calibrated on a physical iPad: cold usable home within 2 s on a documented normal network; visible touch feedback within 100 ms; repeat cached section open within 0.5 s; smooth drag and brush rendering around 60 FPS on a 60 Hz screen. These are goals, not measured results. Record device/OS, network, cache conditions, repeated measurements and frame stalls; inspect memory and stability in long drawing/reading sessions, orientation changes and repeated navigation. Do not infer device speed from source bytes alone.
- Spend engineering effort on actual quality, not marginal kilobyte reductions: prioritize safe authoring/family reading, meaningful educational models, distinct chapter artwork and accessible typography. Refactor only when justified; identify the next concrete scenario and measure before/after. No quality reduction to meet cosmetic size targets.

Reference: 1.5.127 main ba103ab, 976,929 B initial sources; PR #88 passed required checks (run 44778703905). Physical iPad and real family delivery remain unverified. This policy does not change runtime code or limits.
