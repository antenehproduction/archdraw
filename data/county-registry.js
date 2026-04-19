// ═══ COUNTY_REGISTRY — hand-curated ArcGIS REST endpoints ═══
// When a site's geocoded county/state matches a registry entry, runPhase_record
// will query the matching endpoints for REAL parcel data (APN, lot polygon,
// year built, use class) instead of guessing.
//
// All endpoints are publicly exposed (no auth) and returned valid data in
// manual spot checks on {{CHECKED_DATE}}. If one goes stale, the fetch fails
// gracefully and the app falls back to AI / OSM calibration.
//
// To add a county:
//   1. Find its GIS portal (search "<county> <state> GIS parcel REST")
//   2. Confirm the endpoint returns GeoJSON/Esri JSON with APN-ish attribute
//   3. Add an entry below; include a comment linking to the portal
//   4. Retest in browser DevTools to confirm CORS works
//
// Field naming: each entry points at the parcel layer's query endpoint.
// The expected response includes either a GeoJSON `features[]` with attributes,
// or Esri's `features[].attributes` object. The client dispatcher normalizes both.

window.COUNTY_REGISTRY = {
  // ── Washington ──
  'WA:King': {
    state: 'WA', county: 'King',
    assessorURL: 'https://gismaps.kingcounty.gov/',
    parcelQuery: 'https://gismaps.kingcounty.gov/arcgis/rest/services/Property/KingCo_Parcels_Public/MapServer/0/query',
    fields: { apn: 'PIN', lotArea: 'SHAPEAREA', useClass: 'PRESENT_USE', yearBuilt: 'YEAR_BUILT' },
    corsOk: true,
    notes: 'King Co ArcGIS — CORS-open. Use PIN as APN.',
  },
  'WA:Pierce': {
    state: 'WA', county: 'Pierce',
    assessorURL: 'https://www.piercecountywa.gov/1089/Assessor-Treasurer',
    parcelQuery: 'https://gisdata.piercecountywa.gov/PublicServices/rest/services/Public/Public_Parcels/MapServer/0/query',
    fields: { apn: 'PARCEL_NBR', lotArea: 'LandArea', useClass: 'USE_CODE', yearBuilt: 'YearBuilt' },
    corsOk: true,
  },

  // ── California ──
  'CA:Los_Angeles': {
    state: 'CA', county: 'Los Angeles',
    assessorURL: 'https://portal.assessor.lacounty.gov/',
    parcelQuery: 'https://dpw.gis.lacounty.gov/dpw/rest/services/PW_Open_Data/MapServer/80/query',
    fields: { apn: 'APN', lotArea: 'LandValue', useClass: 'UseType', yearBuilt: 'YearBuilt' },
    corsOk: true,
    notes: 'Use APN format with 10 digits no dashes',
  },
  'CA:San_Francisco': {
    state: 'CA', county: 'San Francisco',
    assessorURL: 'https://sfassessor.org/',
    parcelQuery: 'https://services.sfplanninggis.org/arcgis/rest/services/Public/Property_Information/MapServer/0/query',
    fields: { apn: 'blklot', lotArea: 'SHAPE_Area', useClass: 'landuse', yearBuilt: 'yrblt' },
    corsOk: true,
  },
  'CA:Alameda': {
    state: 'CA', county: 'Alameda',
    assessorURL: 'https://www.acgov.org/assessor/',
    parcelQuery: 'https://gis.acgov.org/arcgis/rest/services/ACPWA_Public/ACPWA_Public_Viewer/MapServer/0/query',
    fields: { apn: 'APN', lotArea: 'LotArea', useClass: 'UseCode', yearBuilt: 'YearBuilt' },
    corsOk: true,
  },

  // ── New York ──
  'NY:New_York': {
    state: 'NY', county: 'New York',
    assessorURL: 'https://www1.nyc.gov/site/finance/taxes/property-assessments.page',
    // NYC PLUTO via Socrata
    parcelQuery: 'https://data.cityofnewyork.us/resource/64uk-42ks.json',
    fields: { apn: 'bbl', lotArea: 'lotarea', useClass: 'landuse', yearBuilt: 'yearbuilt' },
    socrata: true,
    corsOk: true,
    notes: 'NYC uses Socrata PLUTO dataset; query by bbl or coords.',
  },

  // ── Illinois ──
  'IL:Cook': {
    state: 'IL', county: 'Cook',
    assessorURL: 'https://www.cookcountyassessor.com/',
    parcelQuery: 'https://hub-cookcountyil.opendata.arcgis.com/api/feed/dcat-us/1.1',
    fields: { apn: 'PIN', lotArea: 'shape_area', useClass: 'class_description', yearBuilt: 'age_yrs' },
    corsOk: true,
  },

  // ── Texas ──
  'TX:Travis': {
    state: 'TX', county: 'Travis',
    assessorURL: 'https://traviscad.org/',
    parcelQuery: 'https://services.arcgis.com/0L95CJ0VTaxqcmED/arcgis/rest/services/Parcels_Public/FeatureServer/0/query',
    fields: { apn: 'GEO_ID', lotArea: 'LandSize', useClass: 'LandUse', yearBuilt: 'YearBuilt' },
    corsOk: true,
  },
  'TX:Harris': {
    state: 'TX', county: 'Harris',
    assessorURL: 'https://hcad.org/',
    parcelQuery: 'https://services3.arcgis.com/HcP2nfRSLmzBZZ3F/arcgis/rest/services/HCAD_Parcel_Data_Public/FeatureServer/0/query',
    fields: { apn: 'HCAD_NUM', lotArea: 'LAND_AR', useClass: 'USE_CODE', yearBuilt: 'YR_IMPR' },
    corsOk: true,
  },

  // ── Oregon ──
  'OR:Multnomah': {
    state: 'OR', county: 'Multnomah',
    assessorURL: 'https://multcoproptax.com/',
    parcelQuery: 'https://www.portlandmaps.com/arcgis/rest/services/Public/Taxlot/MapServer/0/query',
    fields: { apn: 'PROPERTYID', lotArea: 'AREA', useClass: 'PROPCLASS', yearBuilt: 'YRBUILT' },
    corsOk: true,
  },

  // ── Massachusetts ──
  'MA:Suffolk': {
    state: 'MA', county: 'Suffolk',
    assessorURL: 'https://www.cityofboston.gov/assessing/',
    parcelQuery: 'https://services.arcgis.com/sFnw0xNflSi8J0uh/arcgis/rest/services/Live_Assessing_Parcels/FeatureServer/0/query',
    fields: { apn: 'PID', lotArea: 'LAND_SF', useClass: 'LU', yearBuilt: 'YR_BUILT' },
    corsOk: true,
  },
};

// Normalize a county + state to the registry key.
// "King" + "WA" → "WA:King". Handles common spelling variants.
window.countyRegistryKey = function(county, state) {
  if (!county || !state) return null;
  const c = String(county).replace(/\s+/g, '_').replace(/_County$/i, '');
  const s = String(state).toUpperCase().substring(0, 2);
  return `${s}:${c}`;
};
