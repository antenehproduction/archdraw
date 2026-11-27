// ═══ COST_SETTINGS — editable development cost + offer inputs (Build step 2, gap 6) ═══
//
// The Unified Deal Map plan's #1 principle: NO hard-coded costs. Build cost
// per SF, soft costs, permit fees, and the acquisition offer percentage are
// EDITABLE here, seeded with planning-grade placeholders to be replaced with
// real contractor bids and local fee schedules. Values like $380 / $220 per SF
// are EXAMPLES ONLY.
//
// These numbers previously lived hard-coded inside index.html (baseCostPerSF /
// marketValuePerSF / SOFT_COST / seismic premium / permit feeRate). index.html
// now reads them through the helper functions below, and falls back to the same
// defaults if this file fails to load (standalone HTML use), so behavior is
// unchanged until someone edits the values here.
//
// Inflation: $/SF figures are pre-inflation; callers multiply by
// window.COST_INDEX.current (see data/cost-index.js).

window.COST_SETTINGS = {
  // Hard construction cost $/SF (pre-inflation, pre-soft-cost). Keyed by state; `default` otherwise.
  constructionCostPerSF: { CA: 380, NY: 380, DC: 380, MA: 380, WA: 380, FL: 200, TX: 200, default: 260 },
  // Finished-resale market value $/SF — the VALUE side of the ROI + max-offer model.
  marketValuePerSF: { CA: 820, NY: 700, DC: 700, MA: 700, WA: 700, FL: 360, TX: 360, default: 470 },
  // Soft costs (design + permits + financing + contingency) as a multiplier on hard cost.
  softCostFactor: 1.30,
  // Seismic premium applied to hard cost in high-seismic states.
  seismicPremium: 1.18,
  seismicStates: ['CA', 'AK', 'WA', 'OR', 'NV', 'UT', 'HI'],
  // Building-permit + plan-review fee as a fraction of valuation (percent-of-valuation / 100).
  permitFeeRate: { CA: 0.012, NY: 0.012, WA: 0.01, OR: 0.01, default: 0.008 },
  // Purchase rule: max offer = maxOfferPct × finished value − all-in work cost. Working range 0.65-0.70.
  maxOfferPct: 0.70,
  _source: 'DEFAULT PLACEHOLDERS — replace with real contractor bids and local fee schedules',
  _editable: true,
  _asOf: '2026-10',
};

// ── Accessors (read COST_SETTINGS). index.html and the future engine/Map call these. ──
// Each tolerates a missing/short state and returns the `default` bucket.
(function (C) {
  function pick(map, state) {
    var s = String(state || '').toUpperCase().trim();
    if (map && Object.prototype.hasOwnProperty.call(map, s)) return map[s];
    return map ? map.default : undefined;
  }
  window.devCostPerSF = function (state) { return pick(C.constructionCostPerSF, state); };
  window.devValuePerSF = function (state) { return pick(C.marketValuePerSF, state); };
  window.devSoftCost = function () { return C.softCostFactor; };
  window.devSeismicPremium = function (state) {
    var s = String(state || '').toUpperCase().trim();
    return (C.seismicStates.indexOf(s) >= 0) ? C.seismicPremium : 1.0;
  };
  window.permitFeeRate = function (state) { return pick(C.permitFeeRate, state); };
  // Purchase rule (plan): max acquisition offer = pct × finished value − all-in work cost.
  // Returns 0 (never negative) when the deal does not pencil at the given percentage.
  window.maxAcquisitionOffer = function (finishedValue, allInWorkCost, pctOverride) {
    var pct = (pctOverride != null ? pctOverride : C.maxOfferPct);
    var offer = pct * (Number(finishedValue) || 0) - (Number(allInWorkCost) || 0);
    return Math.max(0, Math.round(offer));
  };
})(window.COST_SETTINGS);
