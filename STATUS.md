# ArchDraw — project-coordinator STATUS

Daily backlog state per `PROJECT_COORDINATOR.md` §9. Most recent day at the top.

---

## 2026-04-25 — P0-4 HB 1110 first-class data (first batch)

### Moved to done today
- **P0-4 schema + data** — new file `data/middle-housing.js` registers `window.MIDDLE_HOUSING_DB` keyed by `<jurisdiction>,<state>` for all 10 P0-3 WA cities (Bellevue, Tacoma, Everett, Redmond, Kirkland, Auburn, Bothell, Renton, Kent, Federal Way). Each entry carries: `statuteName` ('WA HB 1110'), `statuteCite` ('RCW 36.70A.635'), `populationTier` (`tier1`/`tier2`), `statutoryFloor: { baseUnits, transitUnits, affordableUnits }`, optional `cityImplementationUnits` for cities that exceed the floor, `localOrdinance`, `transitProximityBonus`, `affordabilityBonus`, `transitStations[]`, `dimensionalOverrides`, `exceptions[]`, `codeURL`, `cityImplementationURL`, `verifiedDate`, `_sourceMethod` ('zoning-matrix-notes'), `_sourceSnapshot`, `_unverified[]`, `notes`. Source data extracted from existing `data/zoning-matrix.js` notes + densityBonus fields — no external research, all values inherited from the P0-3 sweep audit trail.
- **P0-4 helper** — `window.effectiveZoning(jurisdiction, district, opts)` merges base zoning + middle-housing overlay and returns a single envelope `{ jurisdiction, district, baseZoning, middleHousing, effective: { maxUnits, …setbacks, maxHeightFt, …, sourceOfUnits, appliedRules }, warnings }`. opts: `{ enableMiddleHousing=true, nearMajorTransit=false, includesAffordableUnit=false, inException=false }`. Tolerates jurisdiction inputs with or without state suffix (`'Bellevue'` / `'Bellevue, WA'` / `'bellevue,wa'` all resolve), follows `_repealed` redirects with a preserved warning, prefers `cityImplementationUnits` only when not flagged `_unverified`, falls back to statutory floor with a surfaced warning otherwise.
- **P0-4 test** — `test/middle-housing.test.js` — first test file in the project. Pure Node.js, no test framework: uses `node:assert/strict` + `node:vm` to load both data files into a sandbox without needing a build step. 10 test groups, all passing:
  1. All 10 P0-3 cities present in overlay
  2. Required schema fields on every overlay entry
  3. Bothell is Tier 2 with statutory 2/4/4 floor; other 9 are Tier 1
  4. **Manual §P0-4 success criterion** — Bellevue R-5 with HB 1110 disabled returns 1 unit; with HB 1110 enabled returns 4 units (different unit counts, same address)
  5. Bellevue R-5 + transit → 6 units + 32ft middle-housing height cap from `dimensionalOverrides` (LUC 20.20.538)
  6. Redmond NR exceeds the floor: 6 du base / 8 du affordable (per Ord 3186)
  7. Bothell R-L1 unverified city claim → falls back to statutory 2/4/4 with warning surfaced
  8. `inException` flag suppresses middle-housing override (parcel inside critical area / urban center)
  9. Repealed-zone redirect — `redmond,wa:R-4` (`_repealed: true`, `_replacedBy: 'redmond,wa:NR'`) resolves transparently to NR's 6 units with a redirect warning
  10. Unknown jurisdiction returns null base + warning, no crash

  Run: `node test/middle-housing.test.js` — exits 0 on pass, non-zero with assertion error on fail.

### Bothell Tier 1 vs Tier 2 ambiguity — RESOLVED
Per session-handoff flag: WA HB 1110 statutory floor for Tier 2 (25k–75k pop) is **2 du citywide / 4 du transit / 4 du affordable**. Bothell pop. 48,161 (2020 Census) → Tier 2. The P0-3 zoning-matrix entries for `bothell,wa:R-L1` and `R-L2` cited "4 du citywide / 6 du transit" — that exceeds the statutory floor and was unverified due to the Cloudflare 403 wall on `bothell.municipal.codes`.

**Resolution in `MIDDLE_HOUSING_DB['bothell,wa']`:**
- `statutoryFloor: { baseUnits: 2, transitUnits: 4, affordableUnits: 4 }` — authoritative for the renderer
- `cityImplementationUnits: { baseUnits: 4, transitUnits: 6, affordableUnits: 6, _unverified: true, _claim: '...' }` — preserves the P0-3 claim with provenance
- `_unverified: ['cityImplementationUnits']` at top level
- The `effectiveZoning` helper checks `_unverified` and falls back to the floor with a warning. Net behaviour: Bothell ships with conservative defaults (2/4/4) until BMC 12.14.134 can be directly read.

### Schema-template alignment notes
- `cityImplementationUnits` field added beyond the `PROJECT_COORDINATOR.md` §P0-4 template — needed to model Redmond (6 base / 8 affordable, exceeds the 4/6/6 floor) and the unverified Bothell claim. Recommend amending the manual to include this field.
- `statutoryFloor` field added — explicit RCW-mandated minimum, separate from `baseUnits` in the template. Lets the helper know what the legal floor is even if the city has been claimed to exceed it.
- `transitStations[]` added — concrete station list per city. Used by future `site-intel` parcel-distance check.
- `dimensionalOverrides` added — middle-housing-specific dimensional overrides (Bellevue's 32ft flat / 35ft ridge cap is the only current instance; LUC 20.20.538).

### Decisions awaiting the human owner (carried + new)
- All 14 prior items unchanged. New P0-4 items:
- **#16 NEW — Manual schema template amendment.** `PROJECT_COORDINATOR.md` §P0-4 schema template should be updated to include `statutoryFloor`, `cityImplementationUnits`, `transitStations[]`, `dimensionalOverrides`. Recommend yes — the template-as-shipped doesn't model the city-exceeds-floor case (Redmond) or the unverified-city-claim case (Bothell). Manual is owner-edited only (Appendix A).
- **#17 NEW — Bothell verification path.** Confirming Bothell's actual local rule (2/4/4 statutory vs. claimed 4/6/6) needs a direct read of BMC 12.14.134 — same Cloudflare 403 wall as the rest of the P0-3 sweep. Options: (a) owner manual-copy upload of BMC 12.14 (same path that worked for Bellevue/Everett/Redmond); (b) defer to P1.5 Cloudflare bypass; (c) accept statutory floor permanently. Recommend (a) on next owner upload round.
- **#18 NEW — `effectiveZoning()` adoption.** The helper exists but no `index.html` callsite uses it yet — the existing `runPhase_zone` and `runPhase_record` still consume the raw matrix entry. Wiring it in should happen as a follow-up PR (small, isolated). Routing: `drawing-engine` for the consumer side, `architect-advisor` to verify the disclosure block correctly references "HB 1110 effective: up to N units" when the override fires.

### Launch checklist (§6) delta
- **`HB 1110 entries in middle-housing.js for all 10 cities`** — ✓ DONE (data layer). Wiring into the pipeline is decision #18 above.
- The §P0-4 success criterion "Site phase output explicitly states 'Base zoning: 1 unit. HB 1110 effective: up to 4 units (6 near transit).'" requires the wiring step to claim. Data-layer half is satisfied.

### Statewide-WA pending (carried from 2026-04-24, decision #10)
HB 1337 (statewide ADU floor) and SB 5184 (parking minimum cap) are still per-city in `notes` fields rather than first-class data. P0-4 deliberately scoped to HB 1110 only — adding the other two is a sibling file (`data/wa-statewide.js`) and a separate batch.

### Decision #18 wiring — DONE (commit 37630cd)
- `data/middle-housing.js` registered in `index.html`.
- `runPhase_zone` calls `effectiveZoning` three times (base, citywide-MH, transit-MH); stashes results on `z._effectiveBase / _effectiveMH / _effectiveMHTransit / _middleHousing / _middleHousingWarnings`.
- Bellevue's 32ft middle-housing height cap (LUC 20.20.538) is auto-applied via `dimensionalOverrides.maxHeightFt`; pre-override value preserved on `z._maxHeightFtBase`.
- Zone UI panel renders a blue HB 1110 callout with base / citywide / transit unit counts, ordinance reference, height-cap delta, and (when present) an amber warning row.
- §P0-4 manual success criterion satisfied: site phase output now states "Base zoning: N unit. HB 1110 effective: up to N citywide / N near major transit."

### Decision #10 wiring — DONE (this commit)
- `data/wa-statewide.js` registers `window.WA_STATEWIDE_DB.{HB1337, SB5184}` + `window.applyWaStatewide(envelope, opts)`. Pure layered helper; takes the `effectiveZoning` envelope, returns a new envelope with HB 1337 (statewide ADU floor, 2 ADUs/lot, no owner-occ, ADU parking 0 within 0.5mi major transit) and SB 5184 (parking caps: SFR 1, MF 0.5, ADU 0; cities >50k pending compliance default to statutory cap with deadline warning) layered on. `cityImplementationOverrides` carry the above-floor local rules (Bellevue/Bothell/Redmond ADU caps; Tacoma/Redmond/Bothell pre-codified parking 0).
- `runPhase_zone` consumes it: `z.aduMaxSqFt` / `z.parkingPerUnit` updated when HB 1337 / SB 5184 fire; pre-override values stashed on `z._aduMaxSqFtBase` / `z._parkingPerUnitBase`. `z._minADUsPerLot` carries the HB 1337 mandate (2). UI renders a purple statewide callout summarizing each delta.
- Test count up from 10 → 17 groups. `node test/middle-housing.test.js` exits 0.

### Manual-copy back-fill guide (drafted 2026-04-25)
Concise per-city upload checklist below covers the 7 still-`_unverified` jurisdictions. Owner action: open the listed live URL in a regular browser, save HTML, upload to `origin/main` via GitHub UI. Same protocol that worked for Bellevue/Everett/Redmond rounds 1–2.

| City | Zone(s) | Live URL (target) | Wayback fallback | Filename | Unblocks |
|---|---|---|---|---|---|
| Auburn | R-5, R-7 | https://auburn.municipal.codes/ACC/18.07.030 | https://web.archive.org/web/2025/https://www.codepublishing.com/WA/Auburn/html/Auburn18/Auburn1807.html | `ACC 18.07.030.txt` | all dimensional fields |
| Kirkland | RSA 6, RSA 8 | https://www.codepublishing.com/WA/Kirkland/html/Kirkland15/Kirkland1530.html | wayback | `KZC 15.30.txt` | rearSetback, maxStories, aduMaxSqFt |
| Renton | R-4, R-8 | https://www.codepublishing.com/WA/Renton/html/Renton04/Renton0402.html | wayback | `RMC 4-2-110A.txt` | most numeric fields |
| Kent | SR-6, SR-8 | https://www.codepublishing.com/WA/Kent/html/Kent15/Kent1504.html | wayback | `KCC 15.04.170.txt` | most numeric fields |
| Federal Way | RS 7.2, RS 9.6 | https://www.codepublishing.com/WA/FederalWay/html/FederalWay19/FederalWay1925.html | wayback | `FWRC RS use chart.txt` | most numeric fields |
| Bothell (resolves #17) | R-L1, R-L2 | https://bothell.municipal.codes/BMC/12.14.030 + .140 | wayback | `BMC 12.14.030.txt` + `BMC 12.14.140.txt` | setbacks, FAR, **Tier 1/2 ambiguity** |
| Everett (partial) | NR-C, NR | https://everett.municipal.codes/EMC/19.06.010 | wayback | `Table 6-1.txt` | maxLotCoverage |

Save as "Webpage, HTML only" and rename per the filename column. Multi-table cities (Bothell): one commit with both files preferred.

### Round 3 owner upload — 16 chart files landed in `f95a97b` on origin/main
Owner committed the back-fill chart files (initially to the wrong repo `Website-Farm`, then corrected to `archdraw/main`). 16 view-source HTML files merged in. All distinct (no duplicate md5s despite Bothell BMC 12.14.030 + 12.14.152 sharing the byte size). All content-bearing (no Cloudflare error pages).

| File | Size | City target | Audit result |
|---|---|---|---|
| `view-source_https___bothell.municipal.codes_BMC_12.14.030.html` | 1.78 MB | Bothell R-L1 / R-L2 dimensional standards | ✓ INTEGRATED — see decision #17 resolution below |
| `view-source_https___bothell.municipal.codes_BMC_12.14.152.html` | 1.78 MB | Bothell Ch. 12.14 full text | ✓ chart present (whole-chapter view; same data as .030 + .040) |
| `view-source_https___auburn.municipal.codes_ACC_18.07.030.html` | 352 KB | Auburn R-5 / R-7 development standards | ✓ chart present, integration deferred |
| `view-source_https___everett.municipal.codes_EMC_19.06.030.html` | 882 KB | Everett NR-C / NR table 6-X | ✓ chart present (note: requested Table 6-1 was at .010; .030 may carry a different table — needs review) |
| `view-source_https___kirkland.municipal.codes_KZC_15.30.html` | 1.05 MB | Kirkland RSA 6 / RSA 8 dimensional standards | ✓ chart present, integration deferred |
| `view-source_https___www.codepublishing.com_WA_Kent_html_Kent15_Kent1504.html` | 5.22 MB | Kent SR-6 / SR-8 (KCC 15.04) | ✓ chart present (large file), integration deferred |
| Renton RMC 4-2-110 A through I (9 files) | 20K–163K | Renton R-4 / R-8 dimensional sub-tables | ✓ chart present, integration deferred |
| `view-source_https___www.codepublishing.com_WA_FederalWay_html_FederalWay19_FederalWay1925.html#19.25.110.html` | 81 KB | Federal Way RS chart | ✗ **WRONG CHAPTER** — uploaded `Chapter 19.25 BONDS` (performance bonds for permits), NOT the RS use-zone chart. **RE-UPLOAD NEEDED** — the FWRC use-zone charts for residential are in Title 19 Division IV (Use Zone Charts). Likely correct path: `https://www.codepublishing.com/WA/FederalWay/html/FederalWay19/FederalWay19200.html` (Ch. 19.200 Use Zone Charts — Suburban Estates) OR `FederalWay19205.html` (Ch. 19.205 RS — Single Family Residential). Owner action: re-upload from Ch. 19.200 or 19.205 (whichever shows the RS 7.2 / RS 9.6 dimensional chart). |

### Decision #17 RESOLVED — Bothell Tier 1/2 ambiguity
Owner-uploaded BMC 12.14.030 chart confirms R-L1 and R-L2 use **EXACTLY the Tier 2 statutory floor**: base 2 du / transit-or-affordable 4 du. The earlier P0-3 zoning-legal claim of "4 citywide / 6 transit" was misreading the **R-M1 multifamily column** of the same chart (which IS 4/6 — but R-M1 is multifamily, not the R-L SF tier). Updates landed:
- `data/zoning-matrix.js` — both `bothell,wa:R-L1` and `R-L2` updated with chart-confirmed setbacks (front 15ft / 20ft garage door, rear 15ft no-alley / 0 with-alley / 3ft alley garage door, side 5ft each), height 35ft, hard-surface coverage 55% (R-L1) / 60% (R-L2), min lot 6,000 sf (R-L1) / 3,600 sf (R-L2). `_sourceMethod: 'manual'`, `_sourceSnapshot: '2026-04-25'`, `_unverified: []`.
- `data/middle-housing.js` — `MIDDLE_HOUSING_DB['bothell,wa'].cityImplementationUnits` set to `null` (city does not exceed statute), `_unverified: []` cleared, notes updated with the column-misread root cause.
- `test/middle-housing.test.js` — Bothell test rewritten to assert the chart-confirmed Tier 2 floor instead of the unverified-fallback path. 17/17 passing.

### Round 3 integration — what shipped vs deferred
**Shipped this batch:**
- Bothell R-L1 / R-L2 full chart integration (resolves decision #17).
- Audit + spot-check of all 16 files (extraction script `scripts/extract-viewsource.py` checked in for reuse).

**Deferred to a follow-up batch:**
- Auburn ACC 18.07.030 → R-5 / R-7
- Kirkland KZC 15.30 → RSA 6 / RSA 8 (rearSetback, maxStories, aduMaxSqFt)
- Renton RMC 4-2-110A..I → R-4 / R-8
- Kent KCC 15.04 → SR-6 / SR-8
- Everett EMC 19.06.030 → NR-C / NR maxLotCoverage (need to confirm correct table)

**Blocked, owner action required:**
- Federal Way RS 7.2 / RS 9.6 — re-upload from Ch. 19.200 or 19.205 (uploaded chapter 19.25 was performance bonds).

Per-city integration is back-fill quality lift, not blocking P0-5. The 5 deferred cities currently ship with `_unverified[]` arrays and will continue to do so until the next round of integration; the renderer warns appropriately.

### New decisions awaiting the human owner (round 3)
- **#19** Federal Way Ch. 19.25 was the wrong upload — please re-upload from Ch. 19.200 or 19.205 (RS use-zone chart). Same upload path as round 3.
- **#20** Add `scripts/extract-viewsource.py` to the operating manual as the canonical decoder for owner-uploaded view-source HTML — small (~30 LOC) Python helper with usage docs in its docstring.

### P0-5 (WA permit portals expansion) — first batch shipped this commit
Five new entries added to `data/permit-registry.js`:

| Key | Coverage | Endpoint status |
|---|---|---|
| `mybuildingpermit` | 15 King Co cities (Bellevue, Bothell, Carnation, Clyde Hill, Issaquah, Kenmore, Kirkland, Mercer Island, Newcastle, North Bend, Redmond, Sammamish, Snoqualmie, Woodinville, Yarrow Point) | Web-only portal — `searchByAddress: null`. Same pattern as Portland. checklist-auto links the user to the public search. |
| `tacoma` | Tacoma | ArcGIS Hub item `a12d6fbf58e4434b8ff5070c09646f19` (Accela Permit Data). FeatureServer URL not yet confirmed (Hub indirection + 403 on direct probe). `_unverifiedEndpoint: true`. |
| `pierce_county_unincorp` | Pierce County (unincorporated + small cities; Tacoma has its own entry) | Socrata `bg5p-p534` on `open.piercecountywa.gov`. searchByAddress + radiusSearch builders generated; field name `site_address` assumed pending live `?$select=:*` confirm. |
| `snohomish_county_unincorp` | Snohomish County | snoco-gis Active Permits dataset; org host `services6.arcgis.com/z6WYi9VRHfgwgtyW` confirmed for sibling layers (zoning, parcels) but service name not yet probed. PDS Online Records portal as fallback. |
| `everett` | Everett | Socrata `7fiu-4gra` on `data.everettwa.gov` + eTRAKiT online portal. searchByAddress builder generated; `address` field name assumed. |

**P0-5 status note — Cloudflare wall pattern repeats.** Direct REST/Socrata probes from agent egress all returned 403 (Tacoma Hub, Pierce Socrata, Snohomish ArcGIS, Everett Socrata). Same anti-scraping wall that hit P0-3 municipal-codes. URL patterns ship as best-known from public documentation (Esri Hub item IDs, Socrata canonical URL conventions, advertised dataset slugs). Field-name verification deferred to owner-browser smoke test.

**Schema convention introduced — `_unverifiedEndpoint: true`.** Mirrors the matrix `_unverified[]` discipline for fields whose URL/field schema is best-known but not live-verified. Consumers (`runPhase_comp`) should treat `_unverifiedEndpoint: true` entries the same as `searchByAddress: null` — surface portal links to the user; do not auto-query the JSON endpoint until the flag is cleared.

### New decisions awaiting the human owner (round 3 + P0-5)
- **#19** Federal Way Ch. 19.25 was the wrong upload — please re-upload from Ch. 19.200 or 19.205 (RS use-zone chart). Same upload path as round 3.
- **#20** Add `scripts/extract-viewsource.py` to the operating manual as the canonical decoder for owner-uploaded view-source HTML.
- **#21 NEW (P0-5)** — Verify the 4 best-known REST endpoints via owner-browser hits:
  - `https://open.piercecountywa.gov/resource/bg5p-p534.json?$select=*&$limit=1` — confirm field names, especially the address column (assumed `site_address`).
  - `https://data.everettwa.gov/resource/7fiu-4gra.json?$select=*&$limit=1` — confirm field names (assumed `address`).
  - `https://services6.arcgis.com/z6WYi9VRHfgwgtyW/arcgis/rest/services?f=json` — list all services on snoco-gis to find the active-permits FeatureServer name.
  - The Tacoma ArcGIS Hub item `a12d6fbf58e4434b8ff5070c09646f19` resolves to a hosted FeatureServer URL on the city's ArcGIS Online org — usually visible in the item's "View as ArcGIS REST" link.

  Owner-browser smoke test takes ~5 minutes per endpoint. Once values are pasted back, `_unverifiedEndpoint: true` flags clear and the entries graduate to live consumers.

- **#22 NEW (P0-5)** — `mybuildingpermit` covers a market-significant chunk of King County but exposes no public REST API. Two paths: (a) accept web-only forever and route checklist-auto links accordingly; (b) procure an Accela Construct API key (typically requires an MOU with eCityGov Alliance). Recommend (a) until P1 — the web link is sufficient for the checklist-auto use case; auto-querying historical permits is a comp-phase enhancement, not P0.

### Round 5 — GitHub Actions automation pipeline (this commit)

**Trigger.** Owner uploaded 5 more files (commit `c3c0fec` on main):
- 4 dev.socrata.com Foundry pages → reveal **4 new dataset IDs** I hadn't found in prior searches: Everett `3w3u-656c`, Everett `ppic-abeb`, Pierce `hmbh-c3hw`, Pierce `eugc-5pca`. The Foundry pages themselves are SPA shells (no inline schema in the static HTML — title is generic "Socrata Developer Portal"), but the dataset IDs in the URLs are the genuinely useful artifact.
- 1 Socrata Schema-Mapping documentation page (reference doc).

Plus instruction: **"No manual effort should be required."**

**Diagnosis.** Honest answer is the agent-egress 403 wall extends to:
- Socrata data hosts (`data.everettwa.gov`, `open.piercecountywa.gov`)
- The public Socrata catalog API (`api.us.socrata.com`)
- The Foundry SPA's underlying JSON XHR endpoints
- The Vercel proxy itself (deployment-protection allowlist — round 2 finding)

A pure agent-driven `WebFetch` loop cannot fulfill the "no manual effort" goal. The infrastructure must run the fetches in a different IP space.

**Solution shipped this commit — GitHub Actions egress as the third bypass path:**

1. **`.github/workflows/fetch-schemas.yml`** — runs `scripts/fetch-socrata-schemas.py` on every push that touches the registry, plus daily at 09:00 UTC, plus `workflow_dispatch`. If the resulting `data/_socrata-schemas.json` differs from what's in the repo, the workflow auto-commits the change with `archdraw-bot` author. **No human approval. No manual button-click.** GitHub-runner egress lives in a different IP allocation than agent or browser, and several WA municipal Socrata endpoints don't block it.

2. **`scripts/fetch-socrata-schemas.py`** — stdlib-only Python. Walks `data/permit-registry.js`, picks up both `socrataDataset:` (singular) and `socrataDatasetCandidates: [...]` (array — new schema field), fetches `https://<host>/api/views/<id>.json` for each, normalizes columns, auto-detects address + geo fields by name pattern, and writes `data/_socrata-schemas.json`.

3. **`scripts/sync-permit-registry.py`** — reads the schemas file and ranks the candidates per registry entry by "permit-shapedness" (column-name keyword match + presence of address/geo fields). Outputs a JSON report identifying the best candidate dataset, the discovered address field, and a generated `searchByAddress` URL. Does NOT auto-mutate the registry — emits a report for hand-merge (same safety pattern as `integrate-charts.py`; misclassifying a non-permit dataset as the chosen one would silently break runPhase_comp).

4. **`data/permit-registry.js` schema extension** — `socrataDatasetCandidates: ['<url>', ...]` array on entries with multiple plausible dataset IDs. Existing single-ID `socrataDataset:` still supported. The Pierce + Everett entries now declare all candidates the owner discovered; the next workflow run (on push of this commit) will resolve all six dataset schemas (3 per city) in parallel.

**End-to-end auto-pipeline once the workflow lands:**
```
git push (this commit)
  → .github/workflows/fetch-schemas.yml runs
  → fetches 13 dataset schemas from GitHub egress (~3 sec)
  → writes data/_socrata-schemas.json
  → if changed: commits + pushes back with "fetch-schemas: refresh ..."
  → daily cron repeats (catches schema drift)
  → next dev session runs sync-permit-registry.py → sees real address fields → graduates _unverifiedEndpoint flags
```

**Limitations and remaining manual touchpoints:**
- The `sync-permit-registry.py` patch report is hand-merged (not auto-applied). Goal is to keep human-in-the-loop until the dataset-ranking heuristic is proven over several runs. Once stable, a second workflow can open a PR with the suggested edits for owner one-click approval.
- ArcGIS endpoints (Tacoma Hub, Snohomish snoco-gis) aren't yet covered by this pipeline — Socrata only. Adding ArcGIS support is a parallel script that hits `<host>/arcgis/rest/services?f=json` to enumerate FeatureServers; planned follow-up.
- If a host blocks GitHub Actions runners too, fall back to (a) Cloudflare Workers paid tier (different egress) or (b) the existing scripts/extract-viewsource.py + owner manual-copy path.

### Round 5d — Auburn rename RESOLVED (decision #23) + Federal Way upload guide

**Decision #23 RESOLVED — Auburn 2024 zone rewrite confirmed.** Owner-uploaded ACC 18.07.030 chart row A (Minimum density) provides the rename map:

| Current zone | Min density | Lot area / unit |
|---|---|---|
| RC | 0.25 du/ac | 174,000 sf |
| R-1 | 1 du/ac | 43,500 sf |
| **R-2** | **7 du/ac** | **6,222 sf** |
| R-3 | 12 du/ac | 3,630 sf |
| R-4 | 16 du/ac | 2,723 sf |
| R-NM | 30 du/ac | 1,452 sf |
| R-F | 7 du/ac | 6,222 sf |

Legacy R-5 (4–5 du/ac) and R-7 (5–7 du/ac) **both map to current R-2** by density floor. HB 1110 forced minimum-density up; legacy SF tier consolidated. Same pattern as Redmond (11→2 zone consolidation, Ord 3186).

**Updates landed this commit:**
- `data/zoning-matrix.js` — new entry `auburn,wa:R-2` with chart-confirmed values: residence front 10ft, garage front 20ft (15ft alley-loaded), interior side 5ft, street side 10ft, rear 15ft, max impervious 75%, max building height 35ft, parking 1, ADU 1,000 sf. HB 1110 row D1 confirms 4 base / D2 6 transit-or-affordability. `_sourceMethod: 'manual'`, `_unverified: []`.
- `auburn,wa:R-5` and `auburn,wa:R-7` → `_repealed: true`, `_replacedBy: 'auburn,wa:R-2'`. The existing `effectiveZoning()` `_repealed` redirect path (proven for Redmond R-4 → NR) handles legacy GIS tags transparently with a surfaced redirect warning.
- `scripts/integrate-charts.py` — Auburn integration plan updated with correct column list (RC, R-1, R-2, R-3, R-4, R-NM, R-F).

**End-to-end validation:** `effectiveZoning('Auburn', 'R-5')` → redirects to R-2 → returns `maxUnits: 4, frontSetback: 10, rearSetback: 15, leftSetback: 5, maxHeightFt: 35` with warning "auburn,wa:R-5 is repealed; redirecting to auburn,wa:R-2". 17 of 17 tests passing.

**Decision #19 — Federal Way upload guide** (owner action, one upload)

The earlier upload was wrong chapter (Ch. 19.25 BONDS). RS use-zone chart is in **Chapter 19.200**. Owner steps:
1. Open https://www.codepublishing.com/WA/FederalWay/html/FederalWay19/FederalWay19200.html in a regular browser
2. Right-click → Save As → "Webpage, HTML only"
3. Upload to `antenehproduction/archdraw` `main` via Add files → Upload files (same path that worked rounds 3–4)

Optional secondary (if cottage/compact rules wanted): https://www.codepublishing.com/WA/FederalWay/html/FederalWay19/FederalWay19250.html

Once committed I'll run `integrate-charts.py --city federalway` (after extending the integration plan with the RS column list: RS 5.0 / RS 7.2 / RS 9.6 / RS 15.0 / RS 35.0) and graduate `federal way,wa:RS 7.2` + `RS 9.6` from `_unverified[]`.

### Round 5c — Everett GRADUATED, Pierce identified, security gate live

**First GitHub Actions workflow run succeeded.** 12 of 13 datasets resolved (only `data.lacity.org:yv23-pmwf` 403'd). GitHub-runner egress confirmed unblocked on the WA municipal Socrata hosts that had been walling out agent egress for 4 rounds.

**Round 5c findings from the schema fetch:**

| Entry | P0-5 best-guess | Verified result |
|---|---|---|
| **everett** | `7fiu-4gra` (assumed) | **Wrong** — 0 cols, deprecated. **Right answer: `3w3u-656c` "Trakit Permits"**, 21 cols, address = `siteaddress`, geo = `geocoded_column`. **GRADUATED this commit.** |
| **pierce_county_unincorp** | `bg5p-p534` (assumed) | **Wrong** — 0 cols, deprecated. Round-4 owner candidates (`hmbh-c3hw`, `eugc-5pca`) also wrong (boundary lines + project-level land use). **Web-discovered new candidate: `9yt4-rd9g` "Permits - Pierce County"** added; will graduate after next workflow run validates. |
| **seattle** (existing) | `76t5-zqzr` with `address` field | **Schema verified** but address field is actually `originaladdress1`. Latent bug in current `searchByAddress` builder (uses `upper(address)`). Not regressing existing behavior, but flagged for follow-up. |
| 9 other cities (San Francisco, NY, Austin, Boston, Chicago, San Diego, etc.) | various | All resolved with column counts 28–122. No address-field-name mismatches surfaced beyond Seattle's. |

**Everett graduation diff (this commit):**
- `socrataDataset` → `3w3u-656c` (was 7fiu-4gra)
- `searchByAddress` builder uses `siteaddress` (was assumed `address`)
- `radiusSearch` added — uses `within_circle(geocoded_column, ...)` (was null)
- `_unverifiedEndpoint: true` flag REMOVED — entry now live
- `_sourceMethod: 'github-actions-schema-fetch'`

**Pierce-County status:** kept `_unverifiedEndpoint: true`, but `socrataDatasetCandidates[]` extended with `9yt4-rd9g` (web-discovered "Permits - Pierce County" feed) and `nhnt-v7ka`. Next workflow run resolves their schemas; if `9yt4-rd9g` advertises a permit-shaped column set with an address column, sync-permit-registry.py will flag for graduation.

**Pipeline behavior validated end-to-end:**
- Push → workflow runs on GitHub egress (3 sec) → 12 schemas in `data/_socrata-schemas.json` → bot auto-pushes the metadata commit (round 5 ran under old auto-push permissions).
- The auto-PR pattern lands with this commit (round 5b). All future runs open `bot/schema-update-*` PRs against the trigger branch — the bot can never overwrite source files again.

### Round 5b — workflow tightened to auto-PR (security gate added)
Changed the schema-fetch workflow's commit pattern from "push directly to current branch" to **"push to bot/schema-update-* branch + open PR"**. Effect:
- **Permission scope reduced.** `contents: write` still needed to push the throwaway bot branch, but it can never overwrite source files — only humans can merge the PR.
- **Supply-chain attack surface drops.** If a fetched host gets hijacked and returns a malicious JSON payload, the bot writes it to a PR, not to the working code. A human reviews the diff before it lands. Worst case becomes "we ignore the PR and close it."
- **Diff is always `data/_socrata-schemas.json` only** — metadata, never executed at runtime. Even an inadvertent merge of bad metadata can't get RCE; it only feeds the offline `sync-permit-registry.py` patch report (which is also reviewed before any registry mutation).
- **PR base auto-tracks the trigger branch.** Push from a feature branch → PR targets that branch. Cron run on `main` → PR targets `main`. Each round-trip stays inside the appropriate review surface.

This is the validate-then-iterate path: ship the smallest reliable thing, watch the first run, only add the parallel ArcGIS fetcher (Tacoma, snoco-gis) and the auto-merge promoter once we've seen GitHub-runner egress actually clear the Cloudflare wall on these hosts. If the first run shows 0 successes, we pivot egress (Cloudflare Worker, paid scraper) before stacking more code on unproven infra.

### Round 5 status of decisions
- **#21 (P0-5 endpoint verification)** — superseded by the GitHub Actions pipeline. Once the workflow runs, schemas are written to `data/_socrata-schemas.json`; sync script promotes them. Owner-browser hit no longer required for any Socrata endpoint.
- **#16, #18, #20, #22** — pending owner approval (carried).
- **#17 (Bothell)** — RESOLVED in round 3.
- **#19 (Federal Way wrong upload)** — pending owner re-upload.
- **#23 (Auburn zone rename)** — pending owner direction.
- **NEW #24** — adopt `data/_socrata-schemas.json` as a checked-in source of truth maintained by GitHub Actions (this commit's pattern). Recommend yes; the auto-update commit train is small and easy to monitor.

### Next up
- Watch the first GitHub Actions workflow run on push of this commit.
- Run `python3 scripts/sync-permit-registry.py` after schemas land — graduate the Pierce + Everett entries.
- Add an ArcGIS service-catalog fetch script (parallel to Socrata) to cover Tacoma Hub + snoco-gis.
- Round 5+ chart integration for Kent/Renton/Everett (per-city column-order tuning).
- Federal Way re-upload (#19) + Auburn rename direction (#23).

---

### Round 4 — first chart-integration batch + auto-extraction tooling (commit d2352a2)

**Shipped:**
- `scripts/integrate-charts.py` — auto-extraction tool. Reads a Chrome view-source HTML save, walks the encoded page DOM, groups `<p>{label}</p>` rows into chart records, applies a per-city integration plan (filename → matrix keys + column ordering + field-row regex), and emits JSON patch suggestions plus a `review` array with raw chart cells per extracted value. Pure stdout — does NOT mutate `data/zoning-matrix.js`. Hand-merge is the safety gate against chart misreads (the same risk that caused the Bothell P0-3 column-misread).
- Sanity-checked on Bothell (already-integrated): script reproduces the chart values. Confirms the column-per-zone layout works.
- Kirkland integrated: KZC 15.30 § 15.30.060 "Detached Dwelling Unit" row chart-confirms RSA 6 / RSA 8 values (front 20', side 5', rear 10', height 30' ABE, coverage 50%). Pre-existing matrix values were correct; round-4 promotes `_sourceMethod: 'manual'` + `_sourceSnapshot: '2026-04-25'` and clears `_unverified[]` to empty.

**Findings:**
- **Decision #23 NEW — Auburn zone rename.** Auburn ACC 18.07.030 chart shows zones **RC, R-1, R-2, R-3, R-4, R-NM, R-F** — there is NO R-5 or R-7. Same pattern as Tacoma/Redmond/Everett/Bellevue/Bothell (~6th of 10 P0-3 cities now confirmed renamed). The P0-3 `auburn,wa:R-5` and `R-7` matrix entries reference obsolete code. Owner action options:
  - (A) Mirror the dual-entry approach used for Bellevue/Tacoma (decision #15 / Option C): keep legacy R-5 / R-7 with a `_legacy_key` back-reference, add new RC/R-1..4 entries.
  - (B) Deprecate R-5 / R-7 via `_repealed: true` stubs pointing to the new zones (need an authoritative density-tier mapping to choose `_replacedBy`).
  - (C) Live-research the lot-area-per-unit row in the chart to confirm the rename mapping (legacy R-5 ≈ R-3 if both are 5 du/ac? or ≈ R-4? unverified) before choosing A or B.
  
  Recommend (C) → (A) — once rename mapping is confirmed via the chart, dual-entry preserves backward-compat with stale GIS tags and lets new code work too.

- **Renton / Kent / Everett — chart-layout heterogeneity.** Auto-extraction emits values, but spot-checks suggest column-ordering misalignment (e.g. Kent SR-8 rear=20 vs SR-6 rear=10 — opposite of expected density-tier pattern; column list in the script likely doesn't match the chart's actual header order). Pier-city tuning + per-row spot-check is required before applying. Deferred to round 5.

- **Kirkland (handled this round) needed a different layout** than Bothell: KZC 15.30 uses per-USE rows with inline per-zone exceptions (`<b>RSA: </b>5'`) rather than a column-per-zone grid. The auto-extractor doesn't support this layout; values were hand-confirmed against the same chart cells the script would have read. Future enhancement: a second extractor mode for "row-per-use, inline-per-zone-overrides" charts.

**Round 4 status summary:**

| City | Chart layout | Round 4 outcome |
|---|---|---|
| Bothell | column-per-zone | INTEGRATED in round 3 (commit 9fbf39a) |
| Kirkland | row-per-use, inline overrides | INTEGRATED this round (chart confirms existing matrix values) |
| Auburn | column-per-zone but ZONES RENAMED | DEFERRED — decision #23 needed |
| Kent | column-per-zone, 11+ columns | DEFERRED — script extracted values but column-order needs verification |
| Renton | column-per-zone, multi-file (A..I) | DEFERRED — same column-order risk |
| Everett (NR-C/NR maxLotCoverage) | unclear from EMC 19.06.030 (may be Table 6-2 setbacks not Table 6-1 coverage) | DEFERRED — needs the right table |
| Federal Way | n/a | BLOCKED — wrong chapter uploaded (see decision #19) |

### New decisions awaiting the human owner (round 4)
- **#23 NEW** — Auburn zone rename: pick (A)/(B)/(C) per above. Recommend (C) → (A).

### Next up
- Owner-browser verification of decisions #21 endpoints (5-min/each).
- Owner re-upload of Federal Way RS chart (decision #19).
- Owner direction on Auburn zone-rename (decision #23). If (C): I'll inspect the lot-area-per-unit row of ACC 18.07.030 (already uploaded) to draft a rename map and propose (A) entries.
- **Round 5 chart-integration batch** — Kent / Renton / Everett with per-city column-order verification + script tuning.
- **P0-5 batch 2** when endpoint verifications come back.
- Owner approval of decisions #16–#23 + round-4 batch.

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

### Kirkland shipped (2026-04-24) — rename pattern corrected
`kirkland,wa:RSA 6` + `kirkland,wa:RSA 8` registered. **First WA Tier-1 city in the P0-3 sweep that did NOT rename its residential zones** through HB 1110 compliance — the RSA-family (RSA 1 / RSA 4 / RSA 6 / RSA 8) was preserved through Ord O-4905 (adopted 2025-06-17). This contradicts the pattern I had declared "unambiguous" two commits ago. Revised finding:

**Zone-rename is common but NOT universal** across WA Tier-1 HB-1110 implementations. Score so far: **4 of 5** with rename (Tacoma, Redmond, Everett, Bellevue); **1 of 5** without (Kirkland). Future cities in the sweep (Renton, Bothell, Auburn, Kent, Federal Way) need per-city verification — no assumption either way.

Kirkland values (full primary data, 3 items in `_unverified[]`): front 20, rear 10, side 5+5 (combined ≥15), height 30ft ABE, FAR 0.50 flat / 0.60 peaked, coverage 50%, parking 2 (pre-SB-5184), ADU 1,000 sf (state floor). Parking=2 is the current KZC 15.40; will drop to 1 once Kirkland codifies SB 5184 (~early 2027 deadline).

**Kirkland fetch-source surprise:** both `codepublishing.com/WA/Kirkland` AND `kirkland.municipal.codes` returned 403. This contradicts my earlier working assumption that codepublishing.com was safe (Tacoma was via codepublishing). Codepublishing's CDN behavior varies per tenant. For the remaining 5 cities, assume neither host is guaranteed — plan manual-copy fallback from the start.

### Kirkland-specific uncaptured overlays (schema gap decision #11 grows)
Six Kirkland overlays the matrix can't represent: Totem Lake Urban Center (KZC 40–50), Rose Hill Business District, NE 85th Street Station Form-Based Code (KZC ch. 57, East Link terminus — key overlay), Carillon Woods (PLA 6E), Shoreline (KZC ch. 83), Pipeline Corridor (KZC ch. 118). Each mandates different dimensional standards than base RSA. `zoning-overlays.js` sibling file (decision #11) continues to grow in value.

### OWNER DECISION #15 (2026-04-24): C adopted. Implementation summary
- **Bellevue:** 4 legacy R-X entries retained with updated values + 4 new-code entries added (LL-1, SR-4, LDR-1, MDR-1) carrying the same dimensional data with `_legacy_key` back-references.
- **Tacoma:** 3 UR-X primaries retained + 3 legacy R-1/R-2/R-3 `_repealed` stubs added (mirror of the Redmond stub pattern — clean for a full 1:1 rename).
- **Redmond:** already dual-form (NR + NMF + R-4/R-6/R-8 stubs). No change.
- **Everett:** already dual-form (NR-C + NR + R-1 + R-2 live entries). No change.
- **Kirkland:** NO rename (RSA 6 + RSA 8 retained through Ord O-4905). No dual-entry work required.

Matrix count: 44 entries. Any Tier-1 WA city added going forward needs per-city rename verification; dual-entry only where a rename is detected.

### P0-3 progress: ALL 10 WA CITIES SHIPPED ✓
**Coverage complete.** 12 WA jurisdictions in matrix; 56 total entries.

| City | Form | Keys | Quality |
|---|---|---|---|
| Seattle | pre-existing | NR1, NR2 | verified Jan 2025 |
| Shoreline | pre-existing | R-6 | verified Jan 2025 |
| Bellevue | dual: 4 legacy + 4 new | R-X + LL/SR/LDR/MDR | owner chart; full setback/height/FAR/coverage data |
| Tacoma | dual: 3 new + 3 stubs | UR-X + R-X stubs | full chart data |
| Everett | dual: 2 legacy + 2 new | R-X + NR-C/NR | owner chart for setbacks; partial |
| Redmond | dual: 2 new + 3 stubs | NR/NMF + R-4/6/8 stubs | owner chart; full setback/height/FAR data |
| Kirkland | full | RSA 6, RSA 8 | search-snippet only |
| Auburn | full | R-5, R-7 | all dimensional fields nulled (Cloudflare 403) |
| Bothell | dual: 2 new + 2 stubs | R-L1/R-L2 + R-9600/R-7200 stubs | search-snippet; height + coverage + ADU confirmed |
| Renton | full | R-4, R-8 | wall-plate height confirmed; rest nulled |
| Kent | full | SR-6, SR-8 | best-guess setbacks + height from Ch. 15.08 + SEPA |
| Federal Way | full | RS 7.2, RS 9.6 | lot coverage 60% confirmed; setbacks nulled |

### Final rename-pattern tally — exactly 5 of 10
**RENAMED via HB 1110 compliance:** Tacoma (R→UR), Redmond (R-X→NR/NMF, 11→2), Everett (R-X→NR-C/NR/UR/MU), Bellevue (R-X→LL/SR/LDR/MDR), Bothell (R-9600/7200→R-L1/L2).
**RETAINED:** Kirkland (RSA), Auburn (R-5/R-7), Renton (R-4/R-8), Kent (SR-6/SR-8), Federal Way (RS 7.2/9.6).

The "rename pattern is unambiguous" finding I declared mid-sweep was wrong. Final: it's mixed 50/50. Going forward (other states, new cities) — never assume either way.

### Cloudflare 403 wall — across the entire sweep
**Hit on every city after Tacoma:** Bellevue, Everett, Redmond, Auburn, Bothell, Renton, Kent, Federal Way municipal-code hosts all 403'd. Tacoma was the lone exception (cms.tacoma.gov + cityoftacoma.org outside the General-Code/codepublishing CDN). Kirkland's `codepublishing.com/WA/Kirkland` ALSO 403'd — disproved the "codepublishing is safe" hypothesis. Final-state: only owner-uploaded HTML snapshots (Bellevue/Everett/Redmond) yielded full chart data; the other 7 cities ship with significant `_unverified[]` arrays. Manual-copy back-fill is the path for any future quality lift.

### What's next (post-P0-3)
- **P0-4 HB 1110 first-class data** — schema work to build `data/middle-housing.js` with the WA HB 1110 / HB 1337 / SB 5184 overlays modeled as a sibling. The patterns are now well-understood; this is local code work.
- **Owner decisions still queued** (#1–#15) — most still pending. P0-1 Hosted-key auth fully blocked on §7-A/7-C/§8-Q1.
- **Manual-copy back-fill** for the 7 cities still in `_unverified` (Auburn, Kirkland, Renton, Kent, Federal Way, Bothell partial, Everett partial). Path #4 same as the Bellevue/Everett/Redmond round 2 protocol.

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
