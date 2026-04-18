# ArchDraw Intel — Claude Code Context

## Project overview

Single-file HTML application (`index.html`) that generates permit-ready architectural floor plans for US residential development. No build step. No framework. No npm.

**Live at:** https://antenehproduction.github.io/Premit-Ready (GitHub Pages)

---

## Current state

**Active branch:** `main`  
**Working version:** v14 (all sprint fixes shipped; parse errors resolved)

### v14 sprint fixes included
- API-3 retry wrappers with exponential backoff (`callAIWithRetry`, `callJSONWithRetry`)
- UX-6 keyboard shortcuts, UX-7 address autocomplete, UX-9 responsive layout
- GEOM-3 min-room-dim filter (IBC §1208.1), GEOM-4 parking stalls
- DRAW-3/6/8/9/10 drawing fixes (baseline, floor restore, door swings, wall thickness, window sill/head annotations)
- CODE-2 per-state energy schedule, CHK-3 CSV checklist export
- PIPE-3/4/5 pipeline robustness (cancel handlers, progress dots)
- `probeConnection()` and `saveKey()` are byte-identical to v13 — still locked, do not alter without confirmed bug report.

### v14 rewrite history (for context)
The original v14 drop had parse errors from unescaped apostrophes in single-quoted string literals (violates critical rule #2) and one comment-swallows-code line. These were fixed before shipping to `main`. `probeConnection`/`saveKey` were never actually changed in v14 — the apparent "API connection bug" was a script parse failure that prevented the entire `<script>` block from executing.

---

## Architecture

Everything lives in `index.html`. No separate JS/CSS files.

```
index.html
├── <style>          CSS variables, layout, component styles
├── HTML             Landing screen + Workspace (3-panel layout)
└── <script>
    ├── State        const S = { ... }
    ├── LOG system   L.info / L.warn / L.error → log panel
    ├── STATE_DB     50-state building code database
    ├── API layer    callAI() / callJSON() / callAIWithImg() — NO AbortController
    ├── Connection   probeConnection() / saveKey()  ← DO NOT TOUCH in v14 debug
    ├── Pipeline     7 phases: site → zone → record → opts → comp → plan → chk
    ├── Map engine   Leaflet + Esri satellite + OSM Overpass
    ├── Floor plan   localFloorPlan() — local geometry, no API call
    ├── Drawing      renderSheet() → 6 sheets (A-0 through A-5)
    ├── 3D model     Three.js massing + roof
    └── Checklist    50-state static + overlay-aware
```

---

## Critical rules — read before every edit

1. **No AbortController / AbortSignal anywhere** — breaks in Claude.ai iframe (postMessage structured clone). Use `Promise.race([fetch(...), timeoutPromise])` instead.

2. **No escaped apostrophes in JS** — `\'` is invalid outside string literals. Use `"double quotes"` for object keys. Python string generation has caused this bug twice.

3. **probeConnection() and saveKey() are locked** — v13 versions work. Do not alter them without a confirmed bug report.

4. **Model string is `claude-sonnet-4-6`** — do not change to any other string.

5. **callJSON() must accept and forward `timeoutMs`** — signature: `callJSON(msgs, sys, maxTok=2200, timeoutMs=90000)`. Dropping the 4th arg silently defaults to 90s and kills floor plan generation.

6. **Floor plan is local** — `localFloorPlan(z, selectedOption)` has no API call. Do not add one. The timeout issues that plagued v1–v9 were caused by asking AI to generate JSON geometry.

7. **Single file** — keep everything in `index.html`. No splitting into separate .js or .css files unless explicitly requested.

---

## Pipeline phases (v13/v14)

| Phase | Function | API? | Notes |
|-------|----------|------|-------|
| 1 Site | `runPhase_site()` | Yes — callAIWithRetry 1500 tok | Geocodes address via Nominatim |
| 2 Zone | `runPhase_zone()` | Yes — callJSONWithRetry 1500 tok | Returns zoning JSON |
| 3 Records | `runPhase_record()` | No — OSM + FEMA fetch | Non-blocking, CORS-safe |
| 4 Options | `runPhase_opts()` | No — `generateOptions(z)` | Pauses for user selection |
| 5 Comp | `runPhase_comp()` | Yes — callAIWithRetry 1000 tok | Non-critical, no throw |
| 6 Plan | `runPhase_plan()` | No — `localFloorPlan()` | Instant, 0ms |
| 7 Checklist | `runPhase_chk()` | No — static template | Instant, state-aware |

---

## Token budgets (never exceed without testing)

| Call | Tokens | Timeout |
|------|--------|---------|
| Site research | 1500 | 90s default |
| Zoning JSON | 1500 | 90s default |
| Zoning text | 1000 | 90s default |
| Best use | 1000 | 90s default |
| Competitor | 1000 | 90s default |
| Probe / saveKey | 5–10 | 15s / 12s |

---

## External dependencies (CDN only)

```html
three.js r128     cdnjs.cloudflare.com
leaflet 1.9.4     cdnjs.cloudflare.com
jspdf 2.5.1       cdnjs.cloudflare.com
Google Fonts      fonts.googleapis.com
```

---

## Free external APIs used

| API | Purpose | Key? | CORS? |
|-----|---------|------|-------|
| Nominatim OSM | Geocoding + autocomplete | No | OK |
| Esri World Imagery | Satellite tiles | No | OK |
| OSM Overpass | Existing buildings | No | OK |
| FEMA NFHL | Flood zone | No | Blocked in standalone |
| ESRI ArcGIS (county) | Parcel data | No | Sometimes blocked |

---

## Active bugs to fix (v14 → v15)

Priority order:
1. ~~**API-CONN** — probeConnection / saveKey broken in v14~~ — resolved: was a script parse error from unescaped apostrophes, not a real bug in the connection functions
2. **DRAW-5** — PDF aspect ratio slight distortion (1440/960 ≠ 914/610mm exactly)
3. **GEOM-2** — ADU rooms can exceed rear setback when lot is shallow
4. **MAP-6** — Parcel shown as rectangle; real parcels are irregular
5. **DATA-2** — Cost estimates use fixed $/SF, don't adjust for current ENR index

---

## File history

```
index.html    v14 — sprint fixes, retries, autocomplete, CSV export, responsive layout
archdraw-intel-v14.html  snapshot kept for reference; do not edit
```

Do not create additional versioned files. Git history tracks versions.

---

## Testing checklist before any commit

- [ ] Paste into browser → no console errors on load
- [ ] Probe fires → shows "Checking connection" then key input (standalone) or "Connected" (Claude.ai)
- [ ] Enter key → "✓ Connected" in under 12s
- [ ] Enter address → Analyze → all 7 phases complete
- [ ] Options panel appears → selecting an option continues pipeline
- [ ] MAP view shows satellite tiles + OSM buildings
- [ ] PLAN view renders floor plan with structural grid
- [ ] PDF export downloads multi-sheet file
- [ ] LOG button shows entries, no red errors for normal flow
- [ ] Back button → landing screen, no frozen overlay
