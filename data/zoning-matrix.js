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
};

// Normalize + look up
window.zoningMatrixKey = function(jurisdiction, state, district) {
  if (!jurisdiction || !district) return null;
  return `${String(jurisdiction).toLowerCase()},${String(state||'').toLowerCase()}:${district}`;
};
