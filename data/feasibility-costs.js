// ─── ADI_FEAS_COSTS ───
// Ported from trade-intel/hub/config.py (Oct 2026 KC studies).
// Hard-cost baselines anchored to Oct 2026. Update quarterly from builder bids; bump asOf.
window.ADI_FEAS_COSTS = {

  CRITERIA: {
    profit_min_roc:    0.20,
    profit_min_net:    250000,
    rule70_low:        0.65,
    rule70_high:       0.70,
    hard_cost_hired_sf: 260,
    hard_cost_owner_sf: 230,
  },

  COSTS: {
    site:            80000,
    site_per_home:   18000,
    demolition:      35000,
    design_per_home: 22000,
    misc_per_home:    6000,
    studies:         30000,
    legal:           12000,
    hard_contingency: 0.07,
    soft_contingency: 0.10,
    builders_risk:    0.004,
    sale_commission:  0.045,
    sale_closing:     0.01,
    vacancy:          0.05,
    upkeep:           0.07,
    management:       0.08,
    months: {design: 3, build: 12, sale: 3},
    city: {
      "Seattle":   {permit: 18000, utility: 26000, permit_months: 12},
      "Shoreline": {permit: 12000, utility: 32000, permit_months: 14},
    },
    city_default:  {permit: 15000, utility: 20000, permit_months: 10},
  },

  // HUD FY2027 Small Area Fair Market Rents — 14 KC target ZIPs
  // Source: HUD (via fairmarketrentmap.com); effective Oct 1 2026
  HUD_SAFMR: {
    "98102": {0: 2490, 1: 2590, 2: 3030, 3: 3950, 4: 4700},
    "98103": {0: 2460, 1: 2570, 2: 3000, 3: 3910, 4: 4650},
    "98105": {0: 2300, 1: 2390, 2: 2800, 3: 3650, 4: 4340},
    "98109": {0: 2850, 1: 2970, 2: 3470, 3: 4520, 4: 5380},
    "98112": {0: 2170, 1: 2260, 2: 2640, 3: 3440, 4: 4100},
    "98115": {0: 2420, 1: 2520, 2: 2950, 3: 3850, 4: 4580},
    "98117": {0: 2280, 1: 2380, 2: 2780, 3: 3620, 4: 4310},
    "98119": {0: 2250, 1: 2340, 2: 2740, 3: 3570, 4: 4250},
    "98125": {0: 2170, 1: 2260, 2: 2640, 3: 3440, 4: 4100},
    "98133": {0: 2120, 1: 2210, 2: 2580, 3: 3360, 4: 4000},
    "98155": {0: 2110, 1: 2200, 2: 2570, 3: 3350, 4: 3990},
    "98177": {0: 2250, 1: 2340, 2: 2740, 3: 3570, 4: 4250},
    "98195": {0: 2290, 1: 2380, 2: 2790, 3: 3640, 4: 4330},
    "98199": {0: 2470, 1: 2570, 2: 3010, 3: 3920, 4: 4670},
  },

  // Median sale / assessed-value ratio by ZIP (arm's-length sales since Jan 2025)
  ZIP_SALE_RATIO: {
    "98102": 1.061, "98103": 1.090, "98105": 1.063, "98109": 1.068,
    "98112": 1.121, "98115": 1.108, "98117": 1.088, "98119": 1.109,
    "98125": 1.067, "98133": 1.054, "98155": 1.071, "98177": 1.115,
    "98195": 1.080, "98199": 1.112,
  },
  SALE_RATIO_DEFAULT: 1.084,

  // NEW_CONST_PSFT_BY_ZIP: Median $/SF for completed new attached housing (townhomes/condos)
  // Derived from KC Recorder sales 2024-2025 (new construction attached, arm's-length).
  // Cross-checked with HUD SAFMR cap-rate approach (5.5% cap, 1.15× owner-occupant premium).
  // Update when KC study data refreshes; bump asOf.
  NEW_CONST_PSFT_BY_ZIP: {
    "98102": 760,  // Capitol Hill — premium, walkable
    "98103": 660,  // Fremont / Greenwood
    "98105": 640,  // U-District / Ravenna
    "98109": 850,  // Queen Anne / Westlake — highest demand
    "98112": 680,  // Madison Valley / Central District
    "98115": 650,  // Wedgwood / Bryant
    "98117": 610,  // Ballard / Crown Hill
    "98119": 710,  // Magnolia
    "98125": 600,  // Northgate / Lake City
    "98133": 585,  // Haller Lake / Shoreline edge
    "98155": 580,  // Shoreline
    "98177": 590,  // Broadview / Richmond Beach
    "98195": 620,  // UW adjacent / Wedgwood North
    "98199": 740,  // Magnolia / Interbay
  },
  PSFT_DEFAULT: 580,  // Conservative fallback outside KC target area

  asOf: "2026-10",
};
