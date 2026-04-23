# ArchDraw — project-coordinator STATUS

Daily backlog state per `PROJECT_COORDINATOR.md` §9. Most recent day at the top.

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
