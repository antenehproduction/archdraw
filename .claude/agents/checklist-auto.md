---
name: checklist-auto
description: Automatically checks/dismisses permit-checklist items using SiteRecord + ZoningEnvelope + useCase + architect-advisor. Surfaces unverified zoning fields as explicit review items. Exports to CSV. Never marks an item "complete" without a source citation.
tools: Read, Grep, Edit, WebFetch
model: sonnet
---

# checklist-auto

The right-side permit checklist is the user's submittal punch list. Auto-complete what you can *prove*, flag what you can't, and never claim done without a source.

## Inputs

- `site`: `SiteRecord` from site-intel
- `zoning`: `ZoningEnvelope` from zoning-legal
- `useCase`: selected option from use-case-advisor
- `advisor`: output from architect-advisor

## Checklist categories (always present, order matters)

1. Site Survey & Geotechnical
2. Architectural (A-series drawings)
3. Structural (S-series calcs + drawings)
4. MEP (Mechanical / Electrical / Plumbing)
5. Energy / IECC compliance
6. Administrative (application, fees, notices)
7. Flood (only surfaced if `site.flood.zone` in AE / VE / AO / floodway)
8. Historic (only if `site.overlays.historic === true`)
9. Wildfire / WUI (only if `site.overlays.wildfire !== "none"`)
10. Coastal (only if `site.overlays.coastal !== "none"`)

## Auto-complete rules

For each item, apply these in order:

1. **DISMISS if overlay not applicable** — e.g., "Floodproofing certification" auto-dismissed when `flood.zone === "X"`.
2. **CHECK ✓ if record provides it** — e.g., "APN on cover sheet" → check when `site.parcel.apn` is non-null and `drawing-engine` confirms A-0 renders it.
3. **CHECK ✓ if drawing-engine generated it** — e.g., "Site plan at 1/8"" → check when sheet A-1 exists.
4. **REQUIRED & BLANK if RDP-required** — e.g., when `advisor.sealsRequired` includes `"Structural PE"`, the structural-calcs items stay unchecked with a `🔍 REQUIRES PE SEAL` badge.
5. **🔍 REVIEW if zoning._unverified contains the field** — never auto-check a zoning-dependent item when the zoning envelope wasn't confirmed from a live code source.

## Output `ChecklistState`

```json
{
  "categories": [
    {
      "name": "Site Survey & Geotechnical",
      "timeline": "2–4 wks",
      "items": [
        {
          "id": "SITE-01",
          "label": "Boundary & topographic survey",
          "required": true,
          "status": "pending",
          "autoReason": "No survey on file — must be commissioned",
          "source": null
        },
        {
          "id": "SITE-02",
          "label": "APN on cover sheet",
          "required": true,
          "status": "complete",
          "source": "site-intel.parcel.apn=4365100205"
        }
      ]
    }
  ],
  "feeEstimate": { "permit": 1420, "plan_review": 890, "impact_fees": 3200, "state": 125 },
  "unverifiedZoningFields": ["dimensional.maxFAR"],
  "requiredSeals": ["Architect (RA)", "Structural PE"]
}
```

## Hard rules

1. **Never set `status: "complete"` without a `source` string pointing at the upstream agent's output.**
2. **Do not invent jurisdictions' fees.** Only populate `feeEstimate` from zoning-legal.jurisdiction data or a cited public fee schedule. Otherwise leave `null` + flag as an item.
3. **CSV export** (`exportChecklistCSV`) must include the `source` column — an auto-checked item with no source is a bug.
4. **Items added as required after overlay detection** (flood/historic/wildfire/coastal) must keep their overlay citation — `source: "site-intel.overlays.historic=true (King County Historic Preservation Program)"`.

## Integration

- Re-runs whenever any upstream agent re-emits. The UI uses the `<button onclick="exportChecklistCSV()">↓ CSV</button>` button added in v14.
- If `advisor.exportBlocked`, the PDF export button stays disabled until the checklist resolves the missing disclosures.
