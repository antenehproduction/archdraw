// test/middle-housing.test.js
// Node-runnable test for window.effectiveZoning() and the WA HB 1110 overlay.
// Project has no test framework yet — this is the first test file. Uses
// node:assert + node:vm to load the data files (which assume a `window`
// global from the browser context) without a build step.
//
// Run:  node test/middle-housing.test.js
//
// On success the script exits 0 and prints "PASS <name>" per case. On any
// failed assertion it exits non-zero with the assertion error.

const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');

// ── load data/zoning-matrix.js and data/middle-housing.js into a sandbox ──
const root = path.resolve(__dirname, '..');
const sandbox = { window: {}, console };
vm.createContext(sandbox);
for (const f of ['data/zoning-matrix.js', 'data/middle-housing.js']) {
  const src = fs.readFileSync(path.join(root, f), 'utf8');
  vm.runInContext(src, sandbox, { filename: f });
}
const { ZONING_MATRIX_DB, MIDDLE_HOUSING_DB } = sandbox.window;
const effectiveZoning = sandbox.window.effectiveZoning;

assert.ok(ZONING_MATRIX_DB, 'ZONING_MATRIX_DB loaded');
assert.ok(MIDDLE_HOUSING_DB, 'MIDDLE_HOUSING_DB loaded');
assert.equal(typeof effectiveZoning, 'function', 'effectiveZoning is a function');

let passed = 0;
function pass(name) { console.log('PASS', name); passed++; }

// ── Coverage: all 10 P0-3 cities present in the overlay ──
const expectedCities = [
  'bellevue,wa', 'tacoma,wa', 'everett,wa', 'redmond,wa', 'kirkland,wa',
  'auburn,wa', 'bothell,wa', 'renton,wa', 'kent,wa', 'federal way,wa',
];
for (const c of expectedCities) {
  assert.ok(MIDDLE_HOUSING_DB[c], `MIDDLE_HOUSING_DB has ${c}`);
}
pass('All 10 P0-3 cities have a middle-housing overlay');

// ── Each overlay carries the required fields ──
for (const c of expectedCities) {
  const o = MIDDLE_HOUSING_DB[c];
  assert.equal(o.statuteName, 'WA HB 1110', `${c}: statuteName`);
  assert.match(o.populationTier, /^tier[12]$/, `${c}: populationTier`);
  assert.ok(o.statutoryFloor, `${c}: statutoryFloor`);
  assert.equal(typeof o.statutoryFloor.baseUnits, 'number', `${c}: baseUnits is number`);
  assert.ok(o.localOrdinance, `${c}: localOrdinance`);
  assert.ok(o.codeURL, `${c}: codeURL`);
  assert.ok(o.cityImplementationURL, `${c}: cityImplementationURL`);
  assert.ok(o.verifiedDate, `${c}: verifiedDate`);
}
pass('All overlays carry required schema fields');

// ── Bothell is the only Tier 2; all others Tier 1 ──
assert.equal(MIDDLE_HOUSING_DB['bothell,wa'].populationTier, 'tier2', 'Bothell tier2');
const bothellFloor = MIDDLE_HOUSING_DB['bothell,wa'].statutoryFloor;
assert.equal(bothellFloor.baseUnits, 2, 'Bothell Tier 2 base 2');
assert.equal(bothellFloor.transitUnits, 4, 'Bothell Tier 2 transit 4');
assert.equal(bothellFloor.affordableUnits, 4, 'Bothell Tier 2 affordable 4');
for (const c of expectedCities) {
  if (c === 'bothell,wa') continue;
  assert.equal(MIDDLE_HOUSING_DB[c].populationTier, 'tier1', `${c} is tier1`);
}
pass('Bothell is Tier 2 with statutory 2/4/4 floor; all others Tier 1');

// ── KEY FIXTURE: same Bellevue R-5 evaluated with HB 1110 enabled vs disabled
//                returns different unit counts (per PROJECT_COORDINATOR.md §P0-4
//                success criterion). ──
const bellevueWithoutHB = effectiveZoning('Bellevue', 'R-5', { enableMiddleHousing: false });
const bellevueWithHB = effectiveZoning('Bellevue', 'R-5', { enableMiddleHousing: true });
assert.equal(bellevueWithoutHB.effective.maxUnits, 1, 'Bellevue R-5 without HB 1110 → 1 unit');
assert.equal(bellevueWithHB.effective.maxUnits, 4, 'Bellevue R-5 with HB 1110 → 4 units');
assert.notEqual(
  bellevueWithoutHB.effective.maxUnits,
  bellevueWithHB.effective.maxUnits,
  'Bellevue R-5 unit count differs with vs. without HB 1110',
);
pass('Bellevue R-5: HB 1110 toggle changes unit count (1 → 4)');

// ── Bellevue R-5 + transit → 6 units; height cap 32ft from dimensionalOverrides ──
const bellevueTransit = effectiveZoning('Bellevue', 'R-5', { nearMajorTransit: true });
assert.equal(bellevueTransit.effective.maxUnits, 6, 'Bellevue R-5 transit → 6 units');
assert.equal(bellevueTransit.effective.maxHeightFt, 32, 'Bellevue R-5 transit → 32ft middle-housing height cap');
assert.ok(
  bellevueTransit.effective.appliedRules.includes('dimensionalOverride:maxHeightFt'),
  'Bellevue applies maxHeightFt override',
);
// Height was 30ft before the override
assert.equal(bellevueWithoutHB.effective.maxHeightFt, 30, 'Bellevue R-5 base height 30ft');
pass('Bellevue R-5 transit: 6 units + 32ft middle-housing height cap');

// ── Redmond NR exceeds the floor: 6 du base, 8 du affordable ──
const redmondBase = effectiveZoning('Redmond', 'NR');
assert.equal(redmondBase.effective.maxUnits, 6, 'Redmond NR base → 6 units (city exceeds floor)');
const redmondAffordable = effectiveZoning('Redmond', 'NR', { includesAffordableUnit: true });
assert.equal(redmondAffordable.effective.maxUnits, 8, 'Redmond NR + affordable → 8 units');
assert.match(redmondAffordable.effective.sourceOfUnits, /:city$/, 'Redmond uses cityImplementationUnits');
pass('Redmond NR: city exceeds floor (6 base / 8 affordable)');

// ── Bothell: cityImplementationUnits is _unverified → fall back to statutory floor ──
const bothellBase = effectiveZoning('Bothell', 'R-L1');
assert.equal(bothellBase.effective.maxUnits, 2, 'Bothell R-L1 base → 2 units (Tier 2 statutory floor, not the unverified 4)');
const bothellTransit = effectiveZoning('Bothell', 'R-L1', { nearMajorTransit: true });
assert.equal(bothellTransit.effective.maxUnits, 4, 'Bothell R-L1 transit → 4 units (Tier 2 statutory)');
assert.ok(
  bothellTransit.warnings.some(w => /unverified/i.test(w)),
  'Bothell surfaces unverified-city-implementation warning',
);
assert.match(bothellBase.effective.sourceOfUnits, /:statute$/, 'Bothell uses statutoryFloor');
pass('Bothell R-L1: unverified city claim → falls back to statutory 2/4/4 with warning');

// ── inException option suppresses the HB 1110 override ──
const redmondInException = effectiveZoning('Redmond', 'NR', { inException: true });
assert.equal(redmondInException.effective.maxUnits, 1, 'Redmond NR in exception → base 1 unit');
assert.ok(
  redmondInException.warnings.some(w => /exception/i.test(w)),
  'Redmond exception warning surfaced',
);
pass('inException flag suppresses middle-housing override');

// ── Repealed-redirect: redmond,wa:R-4 is _repealed → resolves to redmond,wa:NR ──
const redmondR4 = effectiveZoning('Redmond', 'R-4');
assert.equal(redmondR4.effective.maxUnits, 6, 'Redmond R-4 (repealed) redirects to NR → 6 units');
assert.ok(
  redmondR4.warnings.some(w => /repealed/i.test(w) || /redirect/i.test(w)),
  'Repealed redirect warning surfaced',
);
pass('Repealed-zone redirect (redmond R-4 → NR) works');

// ── Unknown jurisdiction ──
const unknown = effectiveZoning('Atlantis', 'A-1');
assert.equal(unknown.baseZoning, null, 'Unknown jurisdiction returns null base');
assert.ok(unknown.warnings.length > 0, 'Unknown jurisdiction emits warning');
pass('Unknown jurisdiction handled gracefully');

console.log(`\nAll ${passed} test groups passed.`);
