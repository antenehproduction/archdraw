# Agents — ArchDraw Intel

Seven specialized agents manage the end-to-end project. One orchestrates; six execute. Every agent has a single, auditable responsibility, and `architect-advisor` holds veto power over every export.

All definitions live in `.claude/agents/*.md` and load automatically when Claude Code starts in this repo.

---

## Why agents

v14 ships a monolithic 7-phase pipeline in `index.html`. That pipeline works, but:

- The professional-liability surface (what the drawings say vs. what a real stamped set looks like) is *everywhere* in the code and *nowhere* in one place.
- Adding new data sources (utility GIS, WUI overlays, assessor variants) means editing `runPhase_record` and praying nothing else breaks.
- The permit checklist is a static template that only lightly reacts to overlays — it can't yet auto-complete.
- The options generator guesses a program without cross-checking the user's goals.

Splitting responsibilities into agents makes each concern testable, swappable, and *provable* against a source.

---

## Roster

| Agent | Role | Tools | Can call API? |
|-------|------|-------|---------------|
| [`project-coordinator`](.claude/agents/project-coordinator.md) | Orchestrator — dispatches the 6 others in dependency order | Read, Grep, Write, Edit | Indirect (via delegates) |
| [`site-intel`](.claude/agents/site-intel.md) | Location/image → full record from assessor, GIS, county, FEMA, OSM, utilities | WebFetch, WebSearch, Read, Grep | Yes (image analysis) |
| [`zoning-legal`](.claude/agents/zoning-legal.md) | Jurisdiction → zoning envelope w/ setbacks, FAR, uses, ADU, SB9, overlays | WebFetch, WebSearch, Read, Grep | Yes |
| [`use-case-advisor`](.claude/agents/use-case-advisor.md) | Q&A intake → corroborated project brief | WebFetch, WebSearch, Read, Grep | Yes |
| [`drawing-engine`](.claude/agents/drawing-engine.md) | Renders 6 sheets (A-0 → A-5) from envelope + brief | Read, Grep, Edit, Write | **No** (local geometry only) |
| [`architect-advisor`](.claude/agents/architect-advisor.md) | **CRITICAL PROFESSIONAL DISCLOSURE** + RDP threshold detection + export veto | Read, Grep, WebFetch, WebSearch | Yes |
| [`checklist-auto`](.claude/agents/checklist-auto.md) | Auto-completes permit checklist from records; never checks without a source | Read, Grep, Edit, WebFetch | No |

---

## Dependency graph

```
          [user input: address + optional image]
                        │
                        ▼
                 ┌──────────────┐
                 │ project-     │
                 │ coordinator  │
                 └──────┬───────┘
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
    ┌──────────┐  ┌──────────┐  ┌────────────────┐
    │site-intel│  │zoning-   │  │use-case-       │
    │          │─▶│legal     │─▶│advisor         │
    └────┬─────┘  └────┬─────┘  └──────┬─────────┘
         │             │                │
         └─────────────┴────────────────┘
                        │
                        ▼
                 ┌──────────────┐
                 │drawing-engine│
                 └──────┬───────┘
                        │
                        ▼
                 ┌──────────────────┐
                 │architect-advisor │ ◀── blocks export if disclosure missing
                 └──────┬───────────┘    or project requires RDP seal
                        │
                        ▼
                 ┌──────────────┐
                 │checklist-auto│
                 └──────┬───────┘
                        │
                        ▼
            ┌────────────────────────┐
            │ sealed project package │
            │ (PDF + CSV + JSON)     │
            └────────────────────────┘
```

---

## The address-only (or image-only) contract

The application must function from **just a location and/or image**. The user types an address (autocompleted via Nominatim) or drops a site photo (with EXIF or pinned lat/lon). Everything else is automatic:

1. `site-intel` resolves the address → APN → full record pack
2. `zoning-legal` resolves jurisdiction → envelope
3. `use-case-advisor` generates 2–5 Options (Mode A) and shows them in the panel
4. User picks one (or the 90-s auto-select fallback fires)
5. `drawing-engine` renders all 6 sheets locally
6. `architect-advisor` validates disclosure + RDP flags
7. `checklist-auto` fills the right-side checklist with sourced check-marks
8. User can export the PDF + CSV + JSON package

The user is never required to fill a form beyond the landing input. The **Ask me questions** button (use-case-advisor Mode B) is optional and opens the Q&A intake for users who want to refine beyond the auto-generated options.

---

## Record sources auto-pulled by `site-intel`

Every site request triggers **all** of these in parallel (12-s timeout each; missing sources flagged, never fabricated):

| Source | What it answers |
|--------|-----------------|
| Nominatim OSM | Lat/lon, city, county, state, zip |
| County Assessor (ArcGIS REST) | APN, lot area, year built, use class, ownership |
| County GIS parcel layer | Real irregular parcel polygon, easements, ROW |
| FEMA NFHL REST | Flood zone, BFE, floodway, LOMA status |
| OSM Overpass | Existing buildings, trees, roads within 50 m |
| Local historic register | Historic designation, CD features |
| Utility GIS (power/gas/water/sewer) | Nearest connection points |
| State wildfire overlay (CAL FIRE, CO WUI…) | Fire hazard severity zone |
| State coastal overlay (CZM) | Coastal zone boundary |

---

## Checklist auto-completion

`checklist-auto` reads the output of every other agent and, for each checklist item, applies four rules in order:

1. **DISMISS** if the overlay that required it is absent (e.g., floodproofing cert when `flood.zone === "X"`).
2. **CHECK ✓** if a record + a rendered drawing jointly satisfy it (e.g., APN shows on A-0).
3. **REQUIRED & BLANK** if `architect-advisor` says an RDP seal is required (structural, MEP, civil).
4. **🔍 REVIEW** if the supporting zoning field is in `zoning._unverified[]`.

No item is ever marked complete without a `source` citation string. The CSV export includes the source column.

---

## Interactive questions (use-case-advisor Mode B)

For users who want a tailored program, use-case-advisor runs an 8-question intake:

1. Goal — build-to-sell, rent, own, or split
2. Household type — owner-occupied, multigenerational, rental, developer
3. Unit count target — 1, 2–4, 5–9, 10+
4. Budget band — <$300k, $300–600k, $600k–1.2M, $1.2M+
5. Timeline — 3/6/12/18+ months to break ground
6. Design priorities — max GSF / net-zero / aging-in-place / rental yield / preserve existing
7. Risk tolerance — by-right / moderate variance / aggressive (rezone, CUP)
8. Existing structure action — demolish / renovate / add / keep

Every answer is logged with question text + timestamp to `UseCaseBrief._provenance[]`. The brief is **not locked in** until at least two independent sources corroborate it (one zoning, one site), with explicit conflict flags if the user's preference contradicts the envelope.

---

## The `architect-advisor` veto (CRITICAL)

Every AI-generated drawing carries this verbatim block on the A-0 cover and a short-form footer on every sheet:

> THIS IS A PRELIMINARY AI-GENERATED SCHEMATIC. NOT FOR CONSTRUCTION.
> NOT A STAMPED / SEALED ARCHITECTURAL DRAWING. NOT A SUBSTITUTE FOR SERVICES
> OF A REGISTERED DESIGN PROFESSIONAL. Before permit submittal, a licensed
> architect and/or structural, MEP, and civil engineers of record must review,
> revise, and seal drawings per IBC §106.1 and the jurisdiction's registration
> statute. Dimensions, structural members, and code compliance shown are
> unverified and MUST be independently calculated, surveyed, and signed by a
> Registered Design Professional (RDP).

Additionally, `architect-advisor` computes per-project:
- `rdpRequired` — does this project legally need a licensed architect?
- `statuteCitation` — the state licensing statute that answers that question
- `sealsRequired` — which seals (Architect, Structural PE, MEP PE, Civil PE)
- `triggeredBy` — which facts fired the RDP requirement (e.g., "hillside overlay + 2+ stories")

If the advisor cannot answer authoritatively, `rdpRequired: "UNKNOWN — user must verify with jurisdiction"` and the export proceeds with an added banner instead of fabricated confidence.

---

## How to invoke an agent

From another Claude Code session (or within the top-level session):

```
> Use the site-intel agent to pull a full record pack for 355 NE 151st St, Shoreline WA 98155
> Use architect-advisor to produce the disclosure block and RDP decision for a 2-unit duplex in Shoreline WA
```

Claude Code dispatches automatically based on the agent's `description` frontmatter.

---

## Guardrails that apply to every agent

Inherited from `CLAUDE.md`:

1. No `AbortController` / `AbortSignal` — use `Promise.race` with a plain timeout.
2. No escaped apostrophes outside string literals; always escape `\'` inside single-quoted strings.
3. `probeConnection()` and `saveKey()` are locked — don't touch without a confirmed bug report.
4. Model string is `claude-sonnet-4-6`.
5. `callJSON()` / `callJSONWithRetry()` must forward `timeoutMs`.
6. Floor plan geometry is local — no API call during rendering.
7. Single-file: all code lives in `index.html` unless splitting is explicitly requested.
