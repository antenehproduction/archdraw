// test/cost-settings.test.js
// Node-runnable test for the editable cost-settings module (Build step 2, gap 6).
// Loads data/cost-settings.js into a vm sandbox (it assumes a `window` global)
// without a build step, the same pattern as middle-housing.test.js.
//
// Run:  node test/cost-settings.test.js
//
// Verifies that (1) the defaults reproduce the values previously hard-coded in
// index.html (so externalizing them is a no-op until edited), (2) the max-offer
// purchase rule computes correctly, and (3) the settings are live-editable.

const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const sandbox = { window: {}, console };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'data/cost-settings.js'), 'utf8'), sandbox, { filename: 'data/cost-settings.js' });

const C = sandbox.window.COST_SETTINGS;
const { devCostPerSF, devValuePerSF, devSoftCost, devSeismicPremium, permitFeeRate, maxAcquisitionOffer } = sandbox.window;

let passed = 0;
function pass(name) { console.log('PASS', name); passed++; }

// ── module + accessors present ──
assert.ok(C, 'COST_SETTINGS loaded');
for (const fn of [devCostPerSF, devValuePerSF, devSoftCost, devSeismicPremium, permitFeeRate, maxAcquisitionOffer]) {
  assert.equal(typeof fn, 'function', 'accessor is a function');
}
assert.equal(C._editable, true, 'settings flagged editable');
pass('COST_SETTINGS module + accessors load');

// ── construction $/SF defaults reproduce the old baseCostPerSF() ──
assert.equal(devCostPerSF('CA'), 380, 'CA construction 380');
assert.equal(devCostPerSF('WA'), 380, 'WA construction 380');
assert.equal(devCostPerSF('TX'), 200, 'TX construction 200');
assert.equal(devCostPerSF('OH'), 260, 'OH (default) construction 260');
assert.equal(devCostPerSF('wa'), 380, 'lower-case state tolerated');
assert.equal(devCostPerSF(''), 260, 'empty state -> default');
pass('construction $/SF defaults match the old baseCostPerSF()');

// ── market value $/SF defaults reproduce the old marketValuePerSF() ──
assert.equal(devValuePerSF('CA'), 820, 'CA value 820');
assert.equal(devValuePerSF('WA'), 700, 'WA value 700');
assert.equal(devValuePerSF('NY'), 700, 'NY value 700');
assert.equal(devValuePerSF('TX'), 360, 'TX value 360');
assert.equal(devValuePerSF('OH'), 470, 'OH (default) value 470');
pass('market value $/SF defaults match the old marketValuePerSF()');

// ── soft cost, seismic premium, permit fee defaults ──
assert.equal(devSoftCost(), 1.30, 'soft-cost factor 1.30');
assert.equal(devSeismicPremium('CA'), 1.18, 'CA seismic premium 1.18');
assert.equal(devSeismicPremium('WA'), 1.18, 'WA seismic premium 1.18');
assert.equal(devSeismicPremium('OH'), 1.0, 'OH no seismic premium (1.0)');
assert.equal(permitFeeRate('CA'), 0.012, 'CA permit fee 0.012');
assert.equal(permitFeeRate('NY'), 0.012, 'NY permit fee 0.012');
assert.equal(permitFeeRate('WA'), 0.01, 'WA permit fee 0.01');
assert.equal(permitFeeRate('OR'), 0.01, 'OR permit fee 0.01');
assert.equal(permitFeeRate('OH'), 0.008, 'OH (default) permit fee 0.008');
pass('soft-cost / seismic / permit-fee defaults match the old inline values');

// ── max-offer purchase rule: pct × finished value − all-in work cost ──
assert.equal(maxAcquisitionOffer(1000000, 600000, 0.70), 100000, '70% of 1M minus 600k = 100k');
assert.equal(maxAcquisitionOffer(1000000, 600000), 100000, 'default pct (0.70) applied');
assert.equal(maxAcquisitionOffer(800000, 400000, 0.65), 120000, '65% of 800k minus 400k = 120k');
assert.equal(maxAcquisitionOffer(500000, 600000), 0, 'no-pencil deal floors at 0 (never negative)');
pass('max-offer purchase rule computes correctly and floors at 0');

// ── settings are live-editable (bid-based override flows through) ──
const origWA = C.constructionCostPerSF.WA;
C.constructionCostPerSF.WA = 500;
assert.equal(devCostPerSF('WA'), 500, 'edited construction $/SF flows through the accessor');
C.constructionCostPerSF.WA = origWA;
assert.equal(devCostPerSF('WA'), 380, 'restore after edit');
pass('cost settings are live-editable through the accessors');

console.log(`\nAll ${passed} cost-settings test groups passed.`);
