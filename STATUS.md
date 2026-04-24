# ArchDraw — project-coordinator STATUS

Daily backlog state per `PROJECT_COORDINATOR.md` §9. Most recent day at the top.

---

## 2026-04-24 — P0-3 Tacoma + Everett + Redmond + permission unblock

### Moved to done today
- **P0-3 Tacoma** — `tacoma,wa:UR-1`, `UR-2`, `UR-3` registered in `data/zoning-matrix.js` with full primary fields populated. — `zoning-legal`, commit `42076ae`. **Higher quality than Bellevue:** Tacoma's city-side cms.tacoma.gov + cityoftacoma.org sources weren't blocked the way `bellevue.municipal.codes` was, so all four setbacks, height, FAR, parking, and ADU data are confirmed. Only `maxStories` and `maxLotCoverage` are in `_unverified[]` (TMC controls density via FAR + amenity-area, not story count or coverage %).
- **P0-3 Everett** — `everett,wa:R-1`, `R-2` registered in `data/zoning-matrix.js`. — `zoning-legal`, commit `41e66dc`. **Quality between Tacoma and Bellevue.** Confirmed: 28ft height (EMC 19.22.020), 35% / 40% lot coverage (EMC 19.06.010), 5ft side setbacks, ADU rules aligned with HB 1337, HB 1110 compliance via Ord 4102-25 (eff. 2025-07-08). Unverified: front/rear setbacks (Table 6-2 in EMC 19.06.020 sat behind same 403 wall as Bellevue — `everett.municipal.codes` and `everettwa.gov` DocumentCenter both blocked WebFetch); `maxStories` (code uses height not stories); `maxFAR` (Everett uses lot coverage + height envelope, no FAR); `parkingPerUnit` (Table 34-1 not retrievable; SB 5184 in compliance transition until ~early 2027). District codes unchanged — no Tacoma-style rename.
- **P0-3 Redmond** — registered as `redmond,wa:NR` + `redmond,wa:NMF` + 3 legacy stub entries (`R-4`, `R-6`, `R-8` with `_repealed: true`, `_replacedBy: 'redmond,wa:NR'`). — `zoning-legal`. **Biggest structural change of the project so far:** Redmond Ord 3186 (adopted 2024-11-19, eff. 2025-01-01) consolidated **11 residential zones into 2** — NR (Neighborhood Residential) + NMF (Neighborhood Multifamily). All R-X codes the manual asked for are abolished; remapped to NR. Confirmed: lot coverage 60%, parking eliminated, NR allows 6 du/lot citywide by right (8 with affordability bonus — exceeds HB 1110's 4-du Tier 1 floor), NMF min FAR 0.44, ADU rules aligned with HB 1337. Unverified: all setbacks + height + stories + maxFAR (Table 21.08.143B.3 sits behind 403 on both `redmond.municipal.codes` and `redmond.gov` — same blocking pattern as Bellevue/Everett). New schema field `_repealed: true` introduced for legacy stubs — additive, no consumer should iterate them.
- **Permission unblock** — owner removed `Bash(git push:*)` and `Write(.claude/**)` from `.claude/settings.json` deny list (origin/main commits `71d7147`, `8a87f46`, `7aa6598`). Branch sync via `git pull --no-rebase --no-edit`; merge commits `84ee446` and `33024ba`. Yesterday's blocked push (3 commits) finally landed on origin.

### Major finding — manual amendment proposed
**Tacoma district rename.** `PROJECT_COORDINATOR.md` §P0-3 lists "Tacoma, WA — R-1, R-2, R-3" but Tacoma abolished those codes effective **2025-02-01** via Ordinance 28986 (Home in Tacoma Phase 2) and remapped every parcel to UR-1/UR-2/UR-3. The R-X codes will not appear in any current `site-intel` SiteRecord.
- **Action taken:** shipped UR-X entries (current TMC). Each entry carries `_legacy_key: 'tacoma,wa:R-X'` for provenance.
- **Owner decision queued:** amend §P0-3 city list to read "Tacoma, WA — UR-1, UR-2, UR-3" so the manual matches reality. Recommend yes; the manual is owner-edited only (per Appendix A).

### Statewide-WA data items surfaced
Tacoma research surfaced two statewide laws affecting *every* WA city in P0-3, beyond HB 1110:
- **WA HB 1337** (eff. 2025-07-23) — statewide ADU floor of 1,000 sf; eliminates owner-occupancy requirement; mandates ≥2 ADUs per residential lot. Currently noted only in Tacoma `notes`.
- **WA SB 5184** (2025) — constrains local off-street parking minimums. Tacoma already 0; other cities may have stale matrix values.

**Recommendation:** treat HB 1337 + SB 5184 like HB 1110 — model as first-class data in P0-4's `middle-housing.js` (or sibling `wa-statewide.js`) so the renderer applies them uniformly across all WA jurisdictions instead of relying on each city entry's `notes` field. Routing: `zoning-legal` once Bellevue/Tacoma cycle settles.

### Blockers surfaced
- **P0-1 Hosted-key auth** — blocked on §7-A, §7-C, §8 Q1 (unchanged).
- **P0-6 Reconcile two Vercel projects** — blocked on §8 Q6 (unchanged).
- **`.claude/settings.json` JSON validity** — owner moved trailing comma from inside the deny array to after the closing `]`; still rejected by strict JSON parsers (`Expected double-quoted property name`). One-character fix: drop the comma between `]` and `}`. Claude Code's parser tolerated it — push succeeded — but a stricter consumer or a CI lint will fail.

### Decisions awaiting the human owner
1. §7-A single-file constraint — keep / split data only / migrate to framework (blocks P0-1).
2. §7-B TypeScript migration — defer OK but needed by P1.
3. §7-C model routing — Sonnet-for-all vs per-task-class routing (blocks P0-1 cost model).
4. §8 Q1 pricing — free-trial quota + paid tier price (blocks P1-1 Stripe).
5. §8 Q6 Vercel canonical — `archdraw` or `production` (blocks P0-6).
6. §8 Q2–Q5 — branding, geographic expansion order, architect-partnership model, E&O insurance timing.
7. **Bellevue R-15 tier mismatch** (carried from yesterday) — swap for R-4, keep R-15 as MF placeholder, or ship both?
8. **Snohomish TAB_ACRES unit conversion** (carried from yesterday) — schema field `lotAreaUnit` or fetch-time normalizer?
9. **Tacoma R→UR rename.** Amend `PROJECT_COORDINATOR.md` §P0-3 city list to `UR-1/UR-2/UR-3`?
10. **WA statewide laws HB 1337 + SB 5184.** Model as first-class data (sibling to HB 1110 in P0-4) or leave per-city in `notes`?
11. **NEW — Overlay schema gap.** `zoning-matrix.js` doesn't model overlays (Everett's Metro Everett / Historic / R-2(A); Bellevue's Shoreline; Seattle's MHA). Add `overlays[]` field to entries vs. sibling `data/zoning-overlays.js`? This blocks accurate output for any parcel that sits inside an overlay boundary — not rare in dense WA cities.
12. **`everett.municipal.codes` / `bellevue.municipal.codes` / `redmond.municipal.codes` 403 pattern.** Confirmed across 3 cities now. Spike a `site-intel` task to fetch chart HTML via the Vercel proxy (different egress IP) instead of WebFetch. **Strong recommend before further P0-3 cities** — every blocked city has shipped with setback/height nulls and the pattern will repeat. Estimate: <1 day; unblocks Bellevue + Everett + Redmond back-fill plus the remaining 6 cities.
13. **NEW — Schema field `_repealed` introduced for Redmond legacy stubs.** First time a matrix entry signals "this district no longer exists; route to `_replacedBy`." Decision: should `index.html`'s `runPhase_zone` resolver follow `_replacedBy` automatically (transparent redirect with a UI badge), or should it surface the rename to the user as an explicit migration prompt? Different UX implications.
14. **NEW — Redmond urban-center exclusions.** NR/NMF entries explicitly say "do NOT use for parcels inside Overlake / Downtown / Marymoor Village." Without overlay-aware geometry checks (decision #11), there's no enforcement — site-intel could match a downtown parcel to NR and the renderer would happily draw a 60%-coverage 6-du SF result on a tower-zone lot. Decisions #11 and #14 are tightly coupled; recommend resolving together.

### Launch checklist (§6) delta
- Bellevue partial → unchanged (chart-fetch unblock would back-fill).
- Tacoma → fully populated primary fields (only stories/coverage in `_unverified`).
- Everett → partial; height + side + coverage + ADU confirmed; front/rear blocked.
- Redmond → district-rename + chart-fetch blocked; 11→2 consolidation makes legacy R-4/R-6/R-8 keys obsolete; high-confidence on density/coverage/parking/ADU; setbacks/height blocked.
- WA city count: **6 of 10 jurisdictions present in matrix** (Seattle + Shoreline pre-existing, Bellevue + Tacoma + Everett + Redmond added). Only Tacoma fully satisfies the "no missing required fields outside `_unverified[]`" bar; the other three are partial.

### Everett-specific items surfaced (uncaptured by current matrix schema)
1. **R-2(A) variant zone** — alley-access subset of R-2 with reduced lot sizes (4,500 sf min). Requires parcel-level overlay flag, not a separate matrix entry.
2. **Metro Everett overlay (EMC 19.20)** — downtown/corridor overlay with substantially different rules (multi-story height, different setbacks). Any parcel inside this boundary uses EMC 19.20, not R-1/R-2 tables.
3. **Historic (H) overlay** — 24ft eave-to-side cap, design review board.
4. **Snohomish County Swift BRT and future Everett Link light rail** — the 0.25mi transit buffer for HB 1110's 6-du upzone shifts as new stations open. Annual re-verification recommended.

These overlay-checks are a **schema gap** in `data/zoning-matrix.js`: the matrix is keyed `<jurisdiction>:<district>` but doesn't model overlays. Either add an `overlays[]` field to entries, or create a sibling `data/zoning-overlays.js` keyed by jurisdiction. Routing: `zoning-legal` + `drawing-engine` (downstream consumer). New decision item below.

### Still in progress / next up
- 6 of 10 P0-3 cities remaining: Kirkland, Renton, Bothell, Auburn, Kent, Federal Way.
- Recommend: **Kirkland next** (5th-largest King Co city; East Link light rail terminus by 2025; HB 1110 Tier 1).
- **Blocked on chart-fetch decision** — see next section. Continuing the sweep without an unblock will ship every remaining General-Code-hosted city with the same partial-quality nulls.

### Hypothesis tests — `*.municipal.codes` unblock (site-intel × 2, 2026-04-24)

**Round 1 result: FAILED.** Public proxies (`corsproxy.io`, `api.allorigins.win`, `thingproxy.freeboard.io`, `r.jina.ai`) all returned 403. Owner's browser diag probe through the Vercel proxy revealed the actual block mechanism: **Cloudflare Turnstile** (`<title>Just a moment...</title>` + `challenges.cloudflare.com`). Requires JS execution to pass; no HTTP-layer proxy can defeat it. Path #1 (Vercel-whitelist extension) is confirmed dead.

**Round 2 result: Wayback path viable for owner only.** Owner's browser probe of `web.archive.org` through the Vercel proxy returned 200 with 124 KB body → Wayback has a usable snapshot for Bellevue LUC 20.20.010 and is reachable from owner's authenticated browser session. BUT a second site-intel dispatch confirmed the **agent's own egress is blocked from `archive.org`** (Claude Code execution-context level) AND blocked from our Vercel deployment (deployment-protection allowlist). **Only the owner can drive Wayback fetches.** Full-HTML via `/api/municode?url=<wayback>` would require whitelisting `web.archive.org` / `archive.org` in the proxy regex (one-line edit).

**Net data recovered despite blocks:**
- Redmond NR: side-yard sharing rule (min 3 ft/side, 6 ft total between structures) — added to NR notes.
- Redmond ADU: AADU (attached) up to 1,500 sf; DADU 1,000 sf — matrix carries conservative DADU value, notes now flag the attached-ADU ceiling.

### Freshness strategy (adopted 2026-04-24)
To avoid stale data from Wayback snapshots or ageing manual copies, we commit to a layered approach documented here and proposed for inclusion in `PROJECT_COORDINATOR.md` §P2-8:
- **Layer 1 — snapshot-date gating.** Any Wayback-sourced value must be from a snapshot dated AFTER the city's most recent compliance ordinance. Schema add: `_sourceSnapshot: '<ISO>'` and `_sourceMethod: 'wayback' | 'live' | 'manual' | 'city-site'`.
- **Layer 2 — staleness surfacing.** `verifiedDate > 12 months` → UI banner "verify with jurisdiction before relying." Already in manual §P2-8; no code yet.
- **Layer 3 — change detection.** Periodic site-intel scan of each city's ordinance-list page (usually city-`.gov`, NOT Cloudflare-gated) vs. our `verifiedDate`. If newer ordinance appears → flag for re-research.
- **Layer 4 — permanent fix (P1.5).** Options: (a) Vercel Serverless Function running puppeteer-core + chrome-aws-lambda to solve Turnstile; (b) General Code API subscription; (c) commercial scraping browser (Bright Data / ScrapingBee).

### Remaining options for the current back-fill (blocked cells)
After both hypothesis tests, only two paths still work:

1. **Owner browser manual copy** — guide exists in conversation. ~15–25 min total for Bellevue + Everett + Redmond.
2. **Owner browser → Vercel → Wayback HTML** — requires proxy whitelist extension to include `web.archive.org|archive.org` (one-line edit to `handleMunicode`). Owner then hits `https://<vercel>/api/municode?url=<wayback-id_-URL>` from their browser for each of 7 targets; pastes HTML blocks; I extract. Same owner-time as path #1, but automates provenance tracking once the snippet lands.

Path #1 is simpler; path #2 scales better for the remaining 6 P0-3 cities. Awaiting owner direction.

---

### Manual-copy round 1 — owner uploaded 5 chart files (2026-04-24)

Owner committed five `.txt` files to `origin/main` containing saved HTML of the code chart pages (commits `fcd0614` "Add files via upload", `2b6b78c` "Create Snapshot"). Post-audit:

| File | Size | Outcome |
|---|---|---|
| `Chart 20.20.010.txt` (Bellevue) | 0 bytes | **Upload failed — needs retry.** No content saved. |
| `Table 6-2.txt` (Everett setbacks) | 144 KB | **Integrated.** Full HTML of EMC 19.06.020. |
| `Table 34-1.txt` (Everett parking) | 250 KB | **Integrated.** Full HTML of EMC 19.34.020. |
| `Table 21.08.143B.3.txt` (Redmond NR) | 91 KB | **Duplicate of .147B and wrong page.** md5-identical content; Ch. 21.08 table-of-contents, not the NR section. |
| `Table 21.08.147B.txt` (Redmond NMF) | 91 KB | Same as above. |
| `Snapshot` | 1 byte | Stray empty file from GitHub UI "Create" action — safe to delete. |

**MAJOR FINDING — Everett zone rewrite.** The owner-uploaded Table 6-2 confirms Everett 2044 (Ord 4102-25) did a **Redmond-style full zone rewrite** — the current code uses zones **NR-C, NR, UR4, UR7, MU4, MU7, MU15, MU25, LI-MU, LI, HI, AG**. There is NO R-1 or R-2 column in the live Table 6-2. `zoning-legal` missed this because the Sept 2025 open data portal still labelled parcels R-1/R-2 (GIS layer drift, common). This changes Everett's launch posture significantly.

**What shipped in commit `<next>`:**
- **NEW entries** `everett,wa:NR-C` (low-density, front 20 / rear 20 / side-street 10 / side-interior 5, height 28) and `everett,wa:NR` (HB-1110 middle-housing, front 10 / rear 5 / side 5, height 28). Both carry `_sourceMethod: 'manual'` and `_sourceSnapshot: '2026-04-24'` — first matrix entries with audit-trail provenance.
- **Existing entries updated** `everett,wa:R-1` and `R-2`: `parkingPerUnit: null → 1` (Table 34-1 confirms 1 per dwelling unit citywide — post-SB-5184 compliance already codified). Notes extended with the zone-rewrite finding and a pointer to the new NR-C/NR entries. R-1/R-2 NOT yet deprecated via `_repealed` — see decision item below.

**NEW DECISION (#15):** Deprecate `everett,wa:R-1` and `R-2` to `_repealed` stubs (→ `everett,wa:NR-C` and `NR` respectively)? For / against:
- **FOR (recommended):** Current authoritative chart uses new zone names; eventually site-intel will match "NR-C" not "R-1". Mirrors Redmond R-4/R-6/R-8 → NR pattern.
- **AGAINST:** Sept 2025 open data portal still returns "R-1" for parcels. Until that layer is updated, deprecating R-1 would misfire lookups.
- **Middle path:** keep both; flag R-1/R-2 with `_legacyMapping: 'everett,wa:NR-C'` (soft redirect metadata) while preserving their current values as fallback. Do not use `_repealed`.

### Manual-copy round 2 — full back-fill (2026-04-24)

Owner re-uploaded `Chart 20.20.010.txt` (now 184 KB, was 0) and a new `Table 21.08.147B.txt`. Findings:

**Bellevue** — ANOTHER zone rewrite discovered. Current LUC 20.20.010 chart uses **LL-1, LL-2, SR-1/2/3/4, LDR-1/2/3, MDR-1/2** — not R-1/R-5/R-7.5. Clean mapping by lot-size lineage:
- R-1 (estate, ≥35,000 sf) → **LL-1**
- R-5 (7,200 sf min) → **SR-4** (exact match)
- R-7.5 → **LDR-1** (min lot 4,700 sf)
- R-15 (multifamily) → **MDR-1** (20 du/acre)

All four Bellevue entries updated with full chart values (front/rear/side setbacks, height, lot coverage, stories). Only `parkingPerUnit` remains `_unverified` — not in the dimensional-standards chart (lives in a separate Bellevue LUC section).

**Redmond** — file confirmed that §21.08.143 and §21.08.147 don't exist as discrete sections in current code. Redmond re-reorganized: all dimensional standards now live in Ch. 21.08 shared **Table 21.08.200.B** (density/height/coverage) and **Table 21.08.300.A** (setbacks). Both tables present in the uploaded file. NR and NMF updated with full chart values:
- **NR:** front 10, rear 5, side-interior 3, height 38, coverage 50/60%, 6 du base / 8 with affordable
- **NMF:** front 30, rear 10, side-interior 15, height 60, FAR 1.1 base / 1.5 with incentives, coverage 60%

All 6 updated entries carry `_sourceMethod: 'manual'` + `_sourceSnapshot: '2026-04-24'` per Layer-1 freshness discipline.

**Cleanup performed:**
- `git rm Snapshot` (1-byte stray from GitHub "Create" UI)
- `git rm "Table 21.08.143B.3.txt"` (md5-different from 147B but content-equivalent — both show Ch. 21.08 overview with the same 3 tables; 147B is newer and includes the informative "could not be found" banner)

**4 kept snapshot files** (serve as audit trail for `_sourceSnapshot` fields):
- `Chart 20.20.010.txt` (Bellevue)
- `Table 6-2.txt` (Everett setbacks)
- `Table 34-1.txt` (Everett parking)
- `Table 21.08.147B.txt` (Redmond Ch. 21.08 with .200.B + .300.A tables)

### Coverage across 6 WA cities with the new zone-rename pattern established

**Pattern is unambiguous:** Every WA Tier 1 city that went through HB 1110 compliance also restructured its dimensional-standards schema with new zone names:
- **Tacoma** R-1/R-2/R-3 → **UR-1/UR-2/UR-3** (Ord 28986, eff. 2025-02-01)
- **Redmond** R-4/R-6/R-8 → **NR** (Ord 3186, eff. 2025-01-01) — further reorg into Ch. 21.08 shared tables
- **Everett** R-1/R-2 → **NR-C / NR / UR4 / UR7 / MU\* / LI / HI / AG** (Ord 4102-25, eff. 2025-07-08)
- **Bellevue** R-1/R-5/R-7.5/R-15 → **LL-1/2 / SR-1..4 / LDR-1..3 / MDR-1..2** (date TBD — chart is current)

Owner decision #15 updated: NOT just Everett — same question applies across all 4 cities. Options:
- **(A) Deprecate all legacy keys via `_repealed` stubs** (Redmond R-4/R-6/R-8 already done). Clean but requires GIS layer parity.
- **(B) Keep legacy keys as live entries with updated values** (current approach for Bellevue R-1/R-5/R-7.5/R-15 and Everett R-1/R-2). Parcel data from GIS still tagged with old codes works; new chart-name codes (LL-1, NR-C, etc.) don't yet have entries.
- **(C) Dual-entry approach:** keep legacy + add new-code entries. Doubles the matrix for these cities but makes site-intel lookup unambiguous regardless of which name the parcel-data layer returns.

Recommend **(C)** for next cycle — pairs with the GIS-layer-drift reality. Current commit ships (B) as pragmatic intermediate.

---

## 2026-04-23 — Step 0 + P0-2 + P0-3 Bellevue partial

### Moved to done today
- **T0.1** — `PROJECT_COORDINATOR.md` landed at repo root. — commit `4b6be6c`.
- **T0.2** — `STATUS.md` seeded. — commit `4b6be6c`.
- **P0-2** — `WA:Snohomish` registered in `data/county-registry.js` (SIS Cadastral/Tax_Parcels layer 0, fields `PARCEL_ID / TAB_ACRES / USECODE`). — `site-intel`, commit `71236bb`. **Ships with two caveats flagged in `_unverified[]`:** `corsOk` (inferred from standard Esri behaviour; WebFetch got 403 — needs browser DevTools confirmation) and `yearBuilt` (lives on separate Improvement Records CAMA table). Smoke-test candidate: 3322 Wetmore Ave, Everett WA 98201.

### Moved to in-progress today
- **P0-3 Bellevue** — four districts integrated in `data/zoning-matrix.js` (R-1, R-5, R-7.5, R-15) with `_unverified[]` fields per §P0-3 discipline. — `zoning-legal`. **Only R-5 has solid dimensional data** (front 20 / rear 20, FAR 0.5 tiered, height 30/35, ADU 1,200 sf, HB 1110 noted). R-1 and R-7.5 chart cells could not be retrieved — WebFetch to `bellevue.municipal.codes` returned 403 across all attempts. Side setbacks are structurally null for all Bellevue SF districts (Bellevue uses a combined-total rule: 5 ft min one side, 15 ft combined — not per-side symmetric values; `drawing-engine` must branch). HB 1110 Ord 6851 noted in every entry.

### Blockers surfaced
- **P0-1 Hosted-key auth** — blocked on §7-A, §7-C, §8 Q1 (unchanged).
- **P0-6 Reconcile two Vercel projects** — blocked on §8 Q6 (unchanged).
- **Branch convention conflict** — operator-mandated branch overrides §5.1 for this session (unchanged).
- **Bellevue setbacks (new)** — LUC Chart 20.20.010 table cells for R-1, R-7.5, R-15 were not retrievable. Options: (a) dispatch `site-intel` to pull the chart HTML via the Vercel proxy instead of WebFetch; (b) assign a human to browser-copy the chart once; (c) ship as-is with `_unverified[]` surfacing a "VERIFY" banner in the UI — current approach. Recommend (a) for the remaining 9 P0-3 cities so the LUC-403 pattern doesn't repeat.

### Decisions awaiting the human owner
1. §7-A single-file constraint — keep / split data only / migrate to framework (blocks P0-1).
2. §7-B TypeScript migration — defer OK but needed by P1.
3. §7-C model routing — Sonnet-for-all vs per-task-class routing (blocks P0-1 cost model).
4. §8 Q1 pricing — free-trial quota + paid tier price (blocks P1-1 Stripe).
5. §8 Q6 Vercel canonical — `archdraw` or `production` (blocks P0-6).
6. §8 Q2–Q5 — branding, geographic expansion order, architect-partnership model, E&O insurance timing. Not blocking P0 data work.
7. **NEW — Bellevue R-15 tier mismatch.** Manual's P0-3 district list pairs R-1 / R-5 / R-7.5 (SF) with R-15 (actually MULTIFAMILY, 15 du/acre attached). `zoning-legal` shipped R-15 as a mostly-null MF placeholder. Owner decision: (a) swap R-15 for R-4 to complete the SF tier; (b) keep R-15 as MF placeholder and add R-4 in a follow-up; (c) add R-4 alongside R-15 in the next Bellevue PR. Manual appendix amendment may be needed.
8. **NEW — Snohomish TAB_ACRES unit conversion.** `data/county-registry.js` field `lotArea: 'TAB_ACRES'` returns acres; `WA:King`'s `SHAPEAREA` returns sq ft. The dispatcher in `runPhase_record` currently assumes one unit. Tracked as a follow-up for `site-intel` — either add a `lotAreaUnit: 'acres' | 'sqft'` field to the registry schema, or wrap the Snohomish fetch in a `× 43560` normalizer.

### Launch checklist (§6) delta
- [x] **`WA:Snohomish` in `county-registry.js`** — done, with `_unverified: ['corsOk','yearBuilt']` documented. (Full smoke-test against 3 real addresses still pending — manual's acceptance criterion requires it before fully checking the data-coverage bullet.)
- Bellevue in `zoning-matrix.js` — **partial**. All four requested districts present; R-5 complete; R-1/R-7.5/R-15 have `_unverified[]` gaps. Does not yet satisfy "Top 10 WA cities with no missing required fields outside `_unverified[]`" — by the letter, nulls-with-`_unverified` do satisfy the criterion, but R-15's multifamily misclassification means the SF tier coverage is incomplete. Awaiting owner decision #7 above.

---
