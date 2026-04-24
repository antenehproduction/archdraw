# ArchDraw — project-coordinator STATUS

Daily backlog state per `PROJECT_COORDINATOR.md` §9. Most recent day at the top.

---

## 2026-04-24 — P0-3 Tacoma + permission unblock

### Moved to done today
- **P0-3 Tacoma** — `tacoma,wa:UR-1`, `UR-2`, `UR-3` registered in `data/zoning-matrix.js` with full primary fields populated. — `zoning-legal`. **Higher quality than Bellevue:** Tacoma's city-side cms.tacoma.gov + cityoftacoma.org sources weren't blocked the way `bellevue.municipal.codes` was, so all four setbacks, height, FAR, parking, and ADU data are confirmed. Only `maxStories` and `maxLotCoverage` are in `_unverified[]` (TMC controls density via FAR + amenity-area, not story count or coverage %).
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
9. **NEW — Tacoma R→UR rename.** Amend `PROJECT_COORDINATOR.md` §P0-3 city list to `UR-1/UR-2/UR-3`?
10. **NEW — WA statewide laws HB 1337 + SB 5184.** Model as first-class data (sibling to HB 1110 in P0-4) or leave per-city in `notes`?

### Launch checklist (§6) delta
- Bellevue partial → unchanged.
- Tacoma → first WA city with **fully populated primary fields** (only stories/coverage in `_unverified`). Counts as 1 of 10 toward "Top 10 WA cities (P0-3) in `zoning-matrix.js` with no missing required fields outside `_unverified[]`."

### Still in progress / next up
- 8 of 10 P0-3 cities remaining: Everett, Redmond, Kirkland, Renton, Bothell, Auburn, Kent, Federal Way.
- Recommend: Everett next (third launch county's largest city; aligns with the 3-county WA launch market).

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
