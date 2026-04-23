// ═══ ZONING_MATRIX_DB — hand-curated development standards by jurisdiction × district ═══
// When runPhase_zone matches a jurisdiction + district, we return the verified matrix
// instead of relying on AI research. Supplements municipal code text with a structured
// values object the drawing engine can consume directly.
//
// Each entry sits under `<jurisdiction>:<district_code>` (case-insensitive lookup).
// Values from the most recent published municipal code as of {{CHECKED_DATE}}.
// Always annotate with codeURL so users can verify.
//
// Scope for v1: top ~10 residential jurisdictions; expand as needed.

window.ZONING_MATRIX_DB = {
  // ── Seattle, WA ──
  'seattle,wa:NR1': {
    jurisdiction: 'Seattle', state: 'WA', district: 'NR1',
    fullName: 'Neighborhood Residential 1',
    codeURL: 'https://library.municode.com/wa/seattle/codes/municipal_code?nodeId=TIT23LAUSCO',
    frontSetback: 15, rearSetback: 25, leftSetback: 5, rightSetback: 5,
    maxHeightFt: 30, maxStories: 2, maxFAR: 0.5, maxLotCoverage: 35,
    parkingPerUnit: 1, aduAllowed: true, aduMaxSqFt: 1000,
    densityBonus: null, sb9Eligible: false,
    notes: 'Single-family + one ADU or one DADU; Mandatory Housing Affordability overlay may allow more.',
    verifiedDate: '2025-01',
  },
  'seattle,wa:NR2': {
    jurisdiction: 'Seattle', state: 'WA', district: 'NR2',
    fullName: 'Neighborhood Residential 2',
    codeURL: 'https://library.municode.com/wa/seattle/codes/municipal_code?nodeId=TIT23LAUSCO',
    frontSetback: 15, rearSetback: 25, leftSetback: 5, rightSetback: 5,
    maxHeightFt: 30, maxStories: 2, maxFAR: 0.65, maxLotCoverage: 40,
    parkingPerUnit: 1, aduAllowed: true, aduMaxSqFt: 1000,
    densityBonus: null, sb9Eligible: false,
    verifiedDate: '2025-01',
  },

  // ── Shoreline, WA ──
  'shoreline,wa:R-6': {
    jurisdiction: 'Shoreline', state: 'WA', district: 'R-6',
    fullName: 'Residential 6 du/ac',
    codeURL: 'https://www.codepublishing.com/WA/Shoreline/',
    frontSetback: 20, rearSetback: 15, leftSetback: 5, rightSetback: 5,
    maxHeightFt: 30, maxStories: 2, maxFAR: 0.5, maxLotCoverage: 35,
    parkingPerUnit: 2, aduAllowed: true, aduMaxSqFt: 1200,
    densityBonus: 'Affordable housing density bonus (20% affordable = +25% density)',
    sb9Eligible: false,
    notes: 'HB1110 middle-housing bill effective 2025 may override caps for 4-plex in transit areas.',
    verifiedDate: '2025-01',
  },

  // ── Bellevue, WA ──
  'bellevue,wa:R-1': {
    jurisdiction: 'Bellevue', state: 'WA', district: 'R-1',
    fullName: 'Single-Family Residential Estate District (1 du/acre)',
    codeURL: 'https://bellevue.municipal.codes/LUC/20.20.010',
    frontSetback: null, rearSetback: null, leftSetback: null, rightSetback: null,
    maxHeightFt: 30, maxStories: 2,
    maxFAR: 0.5,
    maxLotCoverage: null,
    parkingPerUnit: null,
    aduAllowed: true, aduMaxSqFt: 1200,
    densityBonus: null, sb9Eligible: false,
    notes: 'LUC 20.10.180: R-1 estate tier, 1 du/acre, min lot 43,560 sf. Height 30ft flat / 35ft ridge (LUC 20.20.010, applies to all SF). FAR 0.5 on first 10,000 sf + 0.3 on remainder. ADU max 1,200 sf per LUC 20.20.390 (Ord 6746, 2024); owner-occupancy removed; 1 parking per ADU, waived within 0.5mi major transit. HB 1110 (Ord 6851, eff 2025-07-01): Tier 1 (pop ≥75k) — 4 units by right citywide, 6 within 0.25mi major transit. Middle housing cap 32ft flat / 35ft ridge (LUC 20.20.538).',
    verifiedDate: '2026-04-23',
    _unverified: [
      'frontSetback', 'rearSetback', 'leftSetback', 'rightSetback',
      'maxLotCoverage', 'parkingPerUnit',
    ],
  },
  'bellevue,wa:R-5': {
    jurisdiction: 'Bellevue', state: 'WA', district: 'R-5',
    fullName: 'Single-Family Residential District (5 du/acre, 7,200 sf min lot)',
    codeURL: 'https://bellevue.municipal.codes/LUC/20.20.010',
    frontSetback: 20, rearSetback: 20,
    leftSetback: null, rightSetback: null,
    maxHeightFt: 30, maxStories: 2,
    maxFAR: 0.5,
    maxLotCoverage: null,
    parkingPerUnit: null,
    aduAllowed: true, aduMaxSqFt: 1200,
    densityBonus: null, sb9Eligible: false,
    notes: 'LUC Chart 20.20.010: front 20ft, rear 20ft. Side yard is a COMBINED-TOTAL rule (5ft min one side, 15ft both sides combined) — not a symmetric per-side value; drawing-engine must branch. FAR tiered: 0.5 on first 10,000 sf, 0.3 on remainder. Height 30ft flat / 35ft ridge; no facade >40ft from grade. Min lot 7,200 sf. ADU max 1,200 sf (Ord 6746, 2024); owner-occupancy removed; 1 parking per ADU waived within 0.5mi major transit. HB 1110 (Ord 6851, eff 2025-07-01): Tier 1 — 4 units by right, 6 near major transit. Shoreline overlay (LUC 20.25E.065): 40% lot coverage in SMP jurisdiction.',
    verifiedDate: '2026-04-23',
    _unverified: [
      'leftSetback', 'rightSetback',
      'maxLotCoverage', 'parkingPerUnit',
    ],
  },
  'bellevue,wa:R-7.5': {
    jurisdiction: 'Bellevue', state: 'WA', district: 'R-7.5',
    fullName: 'Single-Family Residential District (7.5 du/acre)',
    codeURL: 'https://bellevue.municipal.codes/LUC/20.20.010',
    frontSetback: null, rearSetback: null, leftSetback: null, rightSetback: null,
    maxHeightFt: 30, maxStories: 2,
    maxFAR: 0.5,
    maxLotCoverage: null,
    parkingPerUnit: null,
    aduAllowed: true, aduMaxSqFt: 1200,
    densityBonus: null, sb9Eligible: false,
    notes: 'LUC 20.10: R-7.5 single-family, 7.5 du/acre. Height 30ft flat / 35ft ridge (LUC 20.20.010, applies to all SF). FAR tiered: 0.5 on first 10,000 sf, 0.3 on remainder. Side yard likely combined-total rule (like R-5) but R-7.5 chart cell not directly confirmed. Shoreline overlay 40% coverage in SMP jurisdiction. ADU max 1,200 sf (Ord 6746, 2024). HB 1110 (Ord 6851, eff 2025-07-01): Tier 1 — 4 units by right, 6 near major transit. Middle housing cap 32ft flat / 35ft ridge (LUC 20.20.538).',
    verifiedDate: '2026-04-23',
    _unverified: [
      'frontSetback', 'rearSetback', 'leftSetback', 'rightSetback',
      'maxLotCoverage', 'parkingPerUnit',
    ],
  },
  'bellevue,wa:R-15': {
    jurisdiction: 'Bellevue', state: 'WA', district: 'R-15',
    fullName: 'Multifamily Residential District (15 du/acre, attached dwellings)',
    codeURL: 'https://bellevue.municipal.codes/LUC/20.20.010',
    frontSetback: null, rearSetback: null, leftSetback: null, rightSetback: null,
    maxHeightFt: null, maxStories: null,
    maxFAR: null,
    maxLotCoverage: null,
    parkingPerUnit: null,
    aduAllowed: null, aduMaxSqFt: null,
    densityBonus: null, sb9Eligible: false,
    notes: 'DISTRICT TYPE ALERT: Bellevue R-15 is MULTIFAMILY (attached, 15 du/acre), not single-family — it buffers SF and commercial tiers (LUC 20.10). R-15 is part of the R-10/R-15/R-20/R-30 MF series; it is absent from the SF district list at BCC 22B.10.090. All dimensional fields pending direct read of LUC Chart 20.20.010 row for R-15. Adjacent-lot MF may reduce side yard to 0 on consolidated lots (LUC 20.20.538). Shoreline overlay 35% coverage (LUC 20.25E.065). HB 1110 (Ord 6851, eff 2025-07-01): applies citywide. OWNER-DECISION PENDING (see STATUS.md): replace with R-4 for SF coverage or keep R-15 as MF placeholder.',
    verifiedDate: '2026-04-23',
    _unverified: [
      'frontSetback', 'rearSetback', 'leftSetback', 'rightSetback',
      'maxHeightFt', 'maxStories', 'maxFAR', 'maxLotCoverage',
      'parkingPerUnit', 'aduAllowed', 'aduMaxSqFt',
    ],
  },

  // ── San Francisco, CA ──
  'san francisco,ca:RH-1': {
    jurisdiction: 'San Francisco', state: 'CA', district: 'RH-1',
    fullName: 'Residential House, One-Family',
    codeURL: 'https://codelibrary.amlegal.com/codes/san_francisco/',
    frontSetback: 15, rearSetback: 45, leftSetback: 0, rightSetback: 0,
    maxHeightFt: 40, maxStories: 3, maxFAR: 1.8, maxLotCoverage: 55,
    parkingPerUnit: 1, aduAllowed: true, aduMaxSqFt: 1200,
    densityBonus: 'State density bonus (SB35, SB9); HOME-SF affordable housing',
    sb9Eligible: true,
    notes: 'SB9 lot split + duplex by right. State density bonus unlocks up to 4 units.',
    verifiedDate: '2025-01',
  },
  'san francisco,ca:RH-2': {
    jurisdiction: 'San Francisco', state: 'CA', district: 'RH-2',
    fullName: 'Residential House, Two-Family',
    codeURL: 'https://codelibrary.amlegal.com/codes/san_francisco/',
    frontSetback: 15, rearSetback: 45, leftSetback: 0, rightSetback: 0,
    maxHeightFt: 40, maxStories: 3, maxFAR: 1.8, maxLotCoverage: 55,
    parkingPerUnit: 1, aduAllowed: true, aduMaxSqFt: 1200,
    densityBonus: 'State density bonus + AB 2011 (multifamily on commercial corridors)',
    sb9Eligible: true,
    verifiedDate: '2025-01',
  },

  // ── Los Angeles, CA ──
  'los angeles,ca:R1': {
    jurisdiction: 'Los Angeles', state: 'CA', district: 'R1',
    fullName: 'One-Family Residential',
    codeURL: 'https://codelibrary.amlegal.com/codes/los_angeles/',
    frontSetback: 20, rearSetback: 15, leftSetback: 5, rightSetback: 5,
    maxHeightFt: 33, maxStories: 2.5, maxFAR: 0.5, maxLotCoverage: 45,
    parkingPerUnit: 2, aduAllowed: true, aduMaxSqFt: 1200,
    densityBonus: 'State density bonus (SB9 by-right duplex + lot split)',
    sb9Eligible: true,
    notes: 'Ministerial duplex + JADU by AB 2221. Up to 4 units on R1 lot with SB9 split.',
    verifiedDate: '2025-01',
  },

  // ── Portland, OR ──
  'portland,or:R5': {
    jurisdiction: 'Portland', state: 'OR', district: 'R5',
    fullName: 'Single-Dwelling Residential (5,000sf)',
    codeURL: 'https://www.portlandoregon.gov/citycode/28197',
    frontSetback: 10, rearSetback: 5, leftSetback: 5, rightSetback: 5,
    maxHeightFt: 30, maxStories: 2.5, maxFAR: 0.5, maxLotCoverage: 50,
    parkingPerUnit: 0, aduAllowed: true, aduMaxSqFt: 800,
    densityBonus: 'RIP (Residential Infill Project) — up to 4 units on any R-zone lot',
    sb9Eligible: false,
    notes: 'HB2001 statewide middle-housing: duplexes by right; 4-plex in transit corridors.',
    verifiedDate: '2025-01',
  },

  // ── Austin, TX ──
  'austin,tx:SF-3': {
    jurisdiction: 'Austin', state: 'TX', district: 'SF-3',
    fullName: 'Family Residence',
    codeURL: 'https://library.municode.com/tx/austin/codes/',
    frontSetback: 25, rearSetback: 10, leftSetback: 5, rightSetback: 5,
    maxHeightFt: 35, maxStories: 2.5, maxFAR: 0.4, maxLotCoverage: 40,
    parkingPerUnit: 2, aduAllowed: true, aduMaxSqFt: 1100,
    densityBonus: null, sb9Eligible: false,
    verifiedDate: '2025-01',
  },

  // ── Expansion batch 2 (researched by zoning-legal agent, verified 2026-04) ──
  // Where a numeric field is contextual, formula-driven, or graphic-only in the
  // code (NYC contextual front yards, Chicago RS-3 setbacks, Miami T3-R graphic
  // standards, DC R-3 row-house contextual setbacks) the value is set to null
  // and the field name is added to _unverified[]. checklist-auto surfaces
  // these as 🔍 VERIFY items so the user knows to research per-parcel.

  'new york,ny:R6': {
    jurisdiction: 'New York City', state: 'NY', district: 'R6',
    fullName: 'Residence District R6',
    codeURL: 'https://zr.planning.nyc.gov/article-ii/chapter-3',
    frontSetback: null, rearSetback: 30, leftSetback: null, rightSetback: null,
    maxHeightFt: 70, maxStories: null, maxFAR: 3.0, maxLotCoverage: 80,
    parkingPerUnit: 0.5, aduAllowed: true, aduMaxSqFt: 800,
    densityBonus: 'Inclusionary Housing Program: up to 0.6 bonus FAR for affordable units',
    sb9Eligible: false,
    notes: 'Dual-path: height-factor or Quality Housing. Narrow-street variant (lot >100ft from wide street) caps FAR at 2.2 / height 55ft. Front yard contextual; rear yard 30ft for lots <40ft wide, 20ft for 40ft+. Side yards: none for attached/semi-detached, 5ft each for detached. Parking 0.5/DU (waived if ≤5 required). City of Yes for Housing Opportunity (eff Jan 2025): ADUs legalised citywide up to 800 sf; parking minimums eliminated for ADUs.',
    verifiedDate: '2026-04',
    _unverified: ['frontSetback','leftSetback','rightSetback','maxStories'],
  },

  'boston,ma:1F-5000': {
    jurisdiction: 'Boston', state: 'MA', district: '1F-5000',
    fullName: 'Single-Family Residential Subdistrict, 5,000 sf min lot',
    codeURL: 'https://library.municode.com/ma/boston/codes/redevelopment_authority?nodeId=ART13DIRE',
    frontSetback: 20, rearSetback: 20, leftSetback: 5, rightSetback: 5,
    maxHeightFt: 35, maxStories: 2.5, maxFAR: 0.5, maxLotCoverage: null,
    parkingPerUnit: 1, aduAllowed: true, aduMaxSqFt: 900,
    densityBonus: null, sb9Eligible: false,
    notes: 'Boston Zoning Code Article 13. Boston is exempt from MGL Ch. 40A so MA Affordable Homes Act (Aug 2024 mandating ADUs ≤900sf statewide) does not auto-apply; Boston is developing its own ordinance. BPDA Neighborhood Housing initiative (2024) enables detached ADUs by right on owner-occupied lots in select neighborhoods. Lot coverage not in Article 13 base table for 1F.',
    verifiedDate: '2026-04',
    _unverified: ['maxLotCoverage'],
  },

  'chicago,il:RS-3': {
    jurisdiction: 'Chicago', state: 'IL', district: 'RS-3',
    fullName: 'Residential Single-Unit (Detached House) District',
    codeURL: 'https://codelibrary.amlegal.com/codes/chicago/latest/chicagozoning_il/0-0-0-48935',
    frontSetback: null, rearSetback: null, leftSetback: null, rightSetback: null,
    maxHeightFt: 30, maxStories: 2, maxFAR: 0.9, maxLotCoverage: null,
    parkingPerUnit: 1, aduAllowed: true, aduMaxSqFt: null,
    densityBonus: null, sb9Eligible: false,
    notes: 'Chicago Zoning Ordinance Ch. 17-2-0300. ALL setbacks formula-driven, not fixed: front = average of nearest two on block face (Sec. 17-2-0306); rear = 28% of lot depth or 50ft (whichever less); sides = combined 20% of width, min 2ft per side. Min lot area/DU: 2,500 sf. Citywide ADU ordinance (coach houses + conversion units) eff Apr 1, 2026 with aldermanic opt-in; RS-3 capped at 3 coach house permits per block per year. Coach house max 22ft height.',
    verifiedDate: '2026-04',
    _unverified: ['frontSetback','rearSetback','leftSetback','rightSetback','maxLotCoverage','aduMaxSqFt'],
  },

  'phoenix,az:R1-6': {
    jurisdiction: 'Phoenix', state: 'AZ', district: 'R1-6',
    fullName: 'Single-Family Residence District (6,000 sf min lot)',
    codeURL: 'https://phoenix.municipal.codes/ZO/613',
    frontSetback: 20, rearSetback: 15, leftSetback: 5, rightSetback: 5,
    maxHeightFt: 30, maxStories: 2, maxFAR: null, maxLotCoverage: 40,
    parkingPerUnit: 2, aduAllowed: true, aduMaxSqFt: 1000,
    densityBonus: null, sb9Eligible: false,
    notes: 'Phoenix ZO Sec. 613/701/706. FAR not specified — density via lot coverage and setbacks. Up to 2 ADUs/lot with single-family primary; 3rd permitted if one is affordable on lots ≥43,560 sf. ADU max = lesser of 1,000 sf or 75% of primary GFA (lots ≤10,000 sf). AZ HB 2720 (2023) limits municipal ADU restrictions below state minimums.',
    verifiedDate: '2026-04',
    _unverified: ['maxFAR'],
  },

  'denver,co:U-SU-C': {
    jurisdiction: 'Denver', state: 'CO', district: 'U-SU-C',
    fullName: 'Urban Single Unit C',
    codeURL: 'https://www.denvergov.org/content/dam/denvergov/Portals/646/documents/Zoning/DZC/Denver_Zoning_Code_Article5_Urban.pdf',
    frontSetback: null, rearSetback: null, leftSetback: null, rightSetback: null,
    maxHeightFt: 35, maxStories: 2.5, maxFAR: null, maxLotCoverage: 50,
    parkingPerUnit: 1, aduAllowed: true, aduMaxSqFt: 864,
    densityBonus: null, sb9Eligible: false,
    notes: 'Denver Zoning Code Article 5. Min lot 5,500 sf. Primary street setback block-sensitive (DZC 13.1.1.3) — must match adjacent lots, no fixed minimum. Height: 30ft / 2.5 stories in front 65% of lot depth; 17ft / 1 story in rear 35% (with allowances). 2024 citywide ADU text amendment: max 864 sf footprint on 6,000-7,000 sf lots; 650 sf on smaller. No ADU parking required.',
    verifiedDate: '2026-04',
    _unverified: ['frontSetback','rearSetback','leftSetback','rightSetback','maxFAR'],
  },

  'miami,fl:T3-R': {
    jurisdiction: 'Miami', state: 'FL', district: 'T3-R',
    fullName: 'Sub-Urban Transect Zone — Restricted (Single-Family)',
    codeURL: 'https://www.miami.gov/Planning-Zoning-Land-Use/View-City-of-Miami-Zoning-Code-Miami-21',
    frontSetback: null, rearSetback: 20, leftSetback: null, rightSetback: null,
    maxHeightFt: 25, maxStories: 2, maxFAR: null, maxLotCoverage: 50,
    parkingPerUnit: 1.5, aduAllowed: false, aduMaxSqFt: null,
    densityBonus: null, sb9Eligible: false,
    notes: 'Miami 21 form-based code, Article 5. T3-R = ONE principal SFR per lot (duplexes need T3-O or T3-L). 2nd-story coverage capped at 30%. Min lot 5,000 sf, min width 50ft. Front and side setbacks defined GRAPHICALLY in Illustration 5.3 — direct code review required per parcel. ADU ordinance proposed Feb 2025 (1-story, ≤800 sf, owner-occupied) but not yet adopted as of Apr 2026.',
    verifiedDate: '2026-04',
    _unverified: ['frontSetback','leftSetback','rightSetback','maxFAR','aduMaxSqFt'],
  },

  'atlanta,ga:R-4': {
    jurisdiction: 'Atlanta', state: 'GA', district: 'R-4',
    fullName: 'Single-Family Residential District',
    codeURL: 'https://library.municode.com/ga/atlanta/codes/code_of_ordinances?nodeId=PTIIICOORANDECO_PT16ZO_CH6SIMIREDIRE',
    frontSetback: 35, rearSetback: 15, leftSetback: 7, rightSetback: 7,
    maxHeightFt: 35, maxStories: 2, maxFAR: 0.5, maxLotCoverage: 50,
    parkingPerUnit: 2, aduAllowed: true, aduMaxSqFt: 750,
    densityBonus: null, sb9Eligible: false,
    notes: 'Atlanta Code Pt. III, Pt. 16, Ch. 6 (Secs. 16-06.007–009). ADU ≤750 sf; combined house+ADU coverage ≤55%; ADU height ≤20ft; ADU may not cover >25% of rear yard. No owner-occupancy required as of 2024 amendment.',
    verifiedDate: '2026-04',
    _unverified: [],
  },

  'dallas,tx:R-7.5(A)': {
    jurisdiction: 'Dallas', state: 'TX', district: 'R-7.5(A)',
    fullName: 'Single Family District, 7,500 sf min lot',
    codeURL: 'https://codelibrary.amlegal.com/codes/dallas/latest/dallas_tx/0-0-0-73675',
    frontSetback: 25, rearSetback: 5, leftSetback: 5, rightSetback: 5,
    maxHeightFt: 36, maxStories: 2.5, maxFAR: null, maxLotCoverage: 45,
    parkingPerUnit: 2, aduAllowed: true, aduMaxSqFt: 800,
    densityBonus: null, sb9Eligible: false,
    notes: 'Dallas Dev Code Ch. 51A (Secs. 51A-4.112, 51A-4.410). FAR not specified — coverage + setbacks govern. ADU NOT by-right citywide; requires neighborhood ADU Overlay (Sec. 51A-4.510) or BoA special exception. Where overlay applies: ≤800 sf, 1BR, owner-occupied.',
    verifiedDate: '2026-04',
    _unverified: ['maxFAR'],
  },

  'minneapolis,mn:R1A': {
    jurisdiction: 'Minneapolis', state: 'MN', district: 'R1A',
    fullName: 'Single-Family Residential District',
    codeURL: 'https://library.municode.com/mn/minneapolis/codes/code_of_ordinances?nodeId=MICOOR_TIT20ZOCO_CH546REDI_ARTIIR1MUMIDI_546.240BUBURE',
    frontSetback: null, rearSetback: 5, leftSetback: 5, rightSetback: 5,
    maxHeightFt: 35, maxStories: 2.5, maxFAR: 0.5, maxLotCoverage: 45,
    parkingPerUnit: 1, aduAllowed: true, aduMaxSqFt: 800,
    densityBonus: 'Minneapolis 2040 Comp Plan: up to 3 dwelling units by right on all residentially-zoned lots citywide',
    sb9Eligible: false,
    notes: 'Minneapolis Ch. 546, Article II Table 546-5. SF/2-family: max 2.5 stories / 28ft wall plate / 33ft to peak (35ft cap is for other principal structures). Front setback contextual per Ch. 535 — not in Table 546-5. Minneapolis 2040 Comp Plan (adopted 2019, affirmed by MN Sup Ct 2023) allows triplexes by right on all residential lots. ADU: 1/lot, detached ≤800 sf, attached ≤1,200 sf, no owner-occupancy required.',
    verifiedDate: '2026-04',
    _unverified: ['frontSetback'],
  },

  'washington,dc:R-3': {
    jurisdiction: 'Washington DC', state: 'DC', district: 'R-3',
    fullName: 'Residential House Zone — Row Dwelling',
    codeURL: 'https://handbook.dcoz.dc.gov/zones/residential/r-3/',
    frontSetback: null, rearSetback: 20, leftSetback: null, rightSetback: null,
    maxHeightFt: 40, maxStories: 3, maxFAR: null, maxLotCoverage: 70,
    parkingPerUnit: 1, aduAllowed: true, aduMaxSqFt: null,
    densityBonus: null, sb9Eligible: false,
    notes: '11 DCMR Subtitle D, Ch. 11-D3 (2016 Zoning Regs). Lot occupancy 70% (Sec. 11-403). Rear yard 20ft for row buildings. Front setback contextual — must fall within range of existing setbacks on block face. Side yard: 5ft for semi-detached; none for attached row. FAR not expressed as a discrete number for R zones — density via lot occupancy and height. ADU (Accessory Apartment) by-right; OWNER-OCCUPANCY required (Subtitle U §253). ADU max = 35% of principal GFA; principal must have ≥1,200 sf GFA.',
    verifiedDate: '2026-04',
    _unverified: ['frontSetback','leftSetback','rightSetback','maxFAR','aduMaxSqFt'],
  },

  'las vegas,nv:R-1': {
    jurisdiction: 'Las Vegas', state: 'NV', district: 'R-1',
    fullName: 'Single Family Residential District',
    codeURL: 'https://files.lasvegasnevada.gov/planning/Title-19-Development-Standards.pdf',
    frontSetback: 20, rearSetback: 10, leftSetback: 5, rightSetback: 5,
    maxHeightFt: 35, maxStories: 2, maxFAR: null, maxLotCoverage: 50,
    parkingPerUnit: 2, aduAllowed: null, aduMaxSqFt: null,
    densityBonus: null, sb9Eligible: false,
    notes: 'City of Las Vegas Title 19 Ch. 19.08 Table 1. FAR not specified — coverage/setbacks govern. ADU status requires direct verification: NV SB 174 (2021) prohibits municipal ADU bans, but Las Vegas-specific size/owner-occupancy rules vary. NOT to be confused with Clark County or North Las Vegas R-1.',
    verifiedDate: '2026-04',
    _unverified: ['maxFAR','aduAllowed','aduMaxSqFt'],
  },

  // Houston intentionally omitted: the city has no zoning ordinance; deed
  // restrictions are parcel-specific private instruments and cannot be
  // expressed in a district-level standards matrix.
};

// Normalize + look up
window.zoningMatrixKey = function(jurisdiction, state, district) {
  if (!jurisdiction || !district) return null;
  return `${String(jurisdiction).toLowerCase()},${String(state||'').toLowerCase()}:${district}`;
};
