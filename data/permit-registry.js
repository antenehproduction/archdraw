// ═══ PERMIT_PORTAL_REGISTRY — Socrata + ArcGIS permit data portals ═══
// Used by runPhase_comp to cross-check AI-researched comparables against real
// permit filings, and by checklist-auto to link the user to the correct portal.
//
// Each city has a `searchByAddress(addr)` builder that returns a URL the worker
// proxy (or corsproxy.io fallback) can hit. Response shapes vary; the consumer
// normalizes.

window.PERMIT_PORTAL_REGISTRY = {
  seattle: {
    city: 'Seattle', state: 'WA',
    portalURL: 'https://cosaccela.seattle.gov/portal/Default.aspx',
    socrataDataset: 'https://data.seattle.gov/resource/76t5-zqzr.json',
    searchByAddress: (addr) =>
      `https://data.seattle.gov/resource/76t5-zqzr.json?$where=upper(address) like '%25${encodeURIComponent(addr.toUpperCase())}%25'&$limit=20`,
    radiusSearch: (lat, lon, miles = 2) =>
      `https://data.seattle.gov/resource/76t5-zqzr.json?$where=within_circle(location,${lat},${lon},${miles * 1609.34})&$limit=50`,
  },
  sf: {
    city: 'San Francisco', state: 'CA',
    portalURL: 'https://sfdbi.org/permit-services',
    socrataDataset: 'https://data.sfgov.org/resource/i98e-djp9.json',
    searchByAddress: (addr) =>
      `https://data.sfgov.org/resource/i98e-djp9.json?$where=upper(street_name) like '%25${encodeURIComponent(addr.toUpperCase())}%25'&$limit=20`,
    radiusSearch: (lat, lon, miles = 2) =>
      `https://data.sfgov.org/resource/i98e-djp9.json?$where=within_circle(location,${lat},${lon},${miles * 1609.34})&$limit=50`,
  },
  nyc: {
    city: 'New York', state: 'NY',
    portalURL: 'https://a810-dobnow.nyc.gov/publish/Index.html',
    socrataDataset: 'https://data.cityofnewyork.us/resource/ipu4-2q9a.json',
    searchByAddress: (addr) =>
      `https://data.cityofnewyork.us/resource/ipu4-2q9a.json?$where=upper(house__) like '%25${encodeURIComponent(addr.toUpperCase())}%25'&$limit=20`,
  },
  la: {
    city: 'Los Angeles', state: 'CA',
    portalURL: 'https://www.ladbs.org/services/core-services/plan-check-permit',
    socrataDataset: 'https://data.lacity.org/resource/yv23-pmwf.json',
    searchByAddress: (addr) =>
      `https://data.lacity.org/resource/yv23-pmwf.json?$where=upper(address_full) like '%25${encodeURIComponent(addr.toUpperCase())}%25'&$limit=20`,
  },
  austin: {
    city: 'Austin', state: 'TX',
    portalURL: 'https://abc.austintexas.gov/web/permit/index',
    socrataDataset: 'https://data.austintexas.gov/resource/3syk-w9eu.json',
    searchByAddress: (addr) =>
      `https://data.austintexas.gov/resource/3syk-w9eu.json?$where=upper(original_address1) like '%25${encodeURIComponent(addr.toUpperCase())}%25'&$limit=20`,
  },
  boston: {
    city: 'Boston', state: 'MA',
    portalURL: 'https://www.boston.gov/departments/inspectional-services/how-apply-building-permit',
    socrataDataset: 'https://data.boston.gov/dataset/approved-building-permits',
    searchByAddress: (addr) =>
      `https://data.boston.gov/api/3/action/datastore_search?resource_id=6ddcd912-32a0-43df-9908-63574f8c7e77&q=${encodeURIComponent(addr)}`,
  },
  chicago: {
    city: 'Chicago', state: 'IL',
    portalURL: 'https://www.chicago.gov/city/en/depts/bldgs.html',
    socrataDataset: 'https://data.cityofchicago.org/resource/ydr8-5enu.json',
    searchByAddress: (addr) =>
      `https://data.cityofchicago.org/resource/ydr8-5enu.json?$where=upper(street_name) like '%25${encodeURIComponent(addr.toUpperCase())}%25'&$limit=20`,
  },
  portland: {
    city: 'Portland', state: 'OR',
    portalURL: 'https://www.portland.gov/permitting',
    // Portland's permit search is web-only; no public Socrata dataset
    searchByAddress: null,
  },
};

window.permitRegistryKey = function(city) {
  if (!city) return null;
  return String(city).toLowerCase().replace(/\s+/g,'').replace(/city(of)?/,'');
};
