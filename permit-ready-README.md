# ArchDraw Intel — AI Permit Architect

> AI-powered architectural analysis, floor plan generation, and permit-ready drawing set for US residential development. Single HTML file. No installation.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blue)](https://antenehproduction.github.io/Premit-Ready)

---

## What it does

Enter any US property address. ArchDraw Intel:

1. **Researches the site** — jurisdiction, existing OSM buildings, FEMA flood zone
2. **Pulls live zoning data** — setbacks, FAR, height limits, ADU rights, permitted uses
3. **Searches county records** — OSM Overpass, FEMA NFHL, public GIS APIs
4. **Presents 2–5 development options** — cost estimates, ROI, timeline, green certifications
5. **Researches 2019–2024 comparables** — competitor projects, design innovations, structural improvements
6. **Generates expert floor plans** — IBC-compliant room dimensions, structural bay grid
7. **Produces a complete permit drawing set** — 6 sheets (A-0 Cover through A-5 Schedules), printable PDF
8. **Builds a jurisdiction-specific permit checklist** — 50-state codes, FEMA overlay, fee estimates

---

## Quick start

### Claude.ai (no key required)
Open the [live demo](https://antenehproduction.github.io/Premit-Ready) — API is pre-authorized inside Claude.ai.

### Standalone Chrome
1. Download `index.html`
2. Open directly in Chrome
3. Enter your Anthropic API key (`sk-ant-...`) from [console.anthropic.com](https://console.anthropic.com/settings/keys)

Cost: ~$0.03–$0.08 per full analysis.

---

## Features

| Feature | Details |
|---------|---------|
| 🛰️ Satellite map | Esri World Imagery + OSM building footprints via Leaflet |
| 📐 Instant floor plans | Local geometry engine — no AI timeout, always completes |
| 📄 PDF permit set | 24"×36" sheets: Cover, Site Plan, Floor Plans, Elevations, Sections, Schedules |
| 🏗️ 3D massing | Three.js model with hip roof, orbit controls |
| 📋 50-state checklist | FEMA auto-detect, flood/historic/hillside/coastal/fire overlays, fee estimates |
| 🎯 Development options | 2–5 programs with cost/ROI/green cert comparison |
| ✏️ Expert design | PhD architect prompt, structural member sizes, passive solar specs |
| ⌨️ Keyboard shortcuts | ← → sheets, F=fit, M=map, P=plan, 3=3D, Esc=close |
| 📍 Address autocomplete | Nominatim-powered suggestions |
| 📥 CSV checklist export | Download permit tracking sheet |

---

## Stack

- **Single HTML file** — zero build step, zero dependencies to install
- **Anthropic Claude Sonnet 4.6** — site research, zoning analysis, competitor research
- **Leaflet.js** — satellite map (Esri World Imagery tiles)
- **Three.js** — 3D massing model
- **jsPDF** — permit drawing PDF export
- **OpenStreetMap / Overpass API** — existing building footprints (free, no key)
- **FEMA NFHL REST API** — flood zone detection (free, no key)
- **Nominatim** — geocoding and address autocomplete (free, no key)

---

## Drawing sheets

| Sheet | Content | Scale |
|-------|---------|-------|
| A-0 | Cover sheet — project data, code compliance, sheet index | N.T.S. |
| A-1 | Site plan — parcel, setbacks, footprint, parking | 1/8"=1'-0" |
| A-2 | Floor plans — all levels, structural grid, room dims | 1/4"=1'-0" |
| A-3 | Exterior elevations — all 4 sides, windows, materials | 1/4"=1'-0" |
| A-4 | Building sections — 2 sections, foundation, insulation | 1/4"=1'-0" |
| A-5 | Door/window schedule + energy compliance table | N.T.S. |

---

## Development

This project is maintained as a single `index.html` file for maximum portability. Claude Code is the primary development tool.

```bash
git clone https://github.com/antenehproduction/Premit-Ready.git
cd Premit-Ready
# Open index.html in Chrome to run locally
# Use Claude Code for AI-assisted development
```

See [CLAUDE.md](CLAUDE.md) for architecture details, critical rules, and active bugs.

---

## License

MIT — free to use, modify, and distribute.
