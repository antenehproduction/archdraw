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

  // ── Expansion batch 2 (researched by site-intel agent) ──
  // Most of these are ArcGIS FeatureServer endpoints rather than Socrata; the
  // radiusSearch builder uses ArcGIS spatial filter syntax. Field names
  // verified from indexed search results — confirm with outFields=* on first
  // live query if a city's response is empty.

  denver: {
    city: 'Denver', state: 'CO',
    portalURL: 'https://opendata-geospatialdenver.hub.arcgis.com/datasets/residential-construction-permits',
    socrataDataset: 'https://www.denvergov.org/arcgis/rest/services/NDCC/Navigate/MapServer/4',
    searchByAddress: (addr) =>
      `https://www.denvergov.org/arcgis/rest/services/NDCC/Navigate/MapServer/4/query?where=upper(ADDRESS)+like+upper('%25${encodeURIComponent(addr)}%25')&outFields=PERMIT_NUM,ADDRESS,ISSUE_DATE,PERMIT_TYPE,CONTRACTOR_NAME&f=json&resultRecordCount=20`,
    radiusSearch: (lat, lon, miles = 2) =>
      `https://www.denvergov.org/arcgis/rest/services/NDCC/Navigate/MapServer/4/query?geometry=${lon},${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&distance=${miles * 1609.34}&units=esriSRUnit_Meter&outFields=PERMIT_NUM,ADDRESS,ISSUE_DATE,PERMIT_TYPE&f=json&resultRecordCount=50`,
  },
  lasvegas: {
    city: 'Las Vegas', state: 'NV',
    portalURL: 'https://opendataportal-lasvegas.opendata.arcgis.com/datasets/building-permits/explore',
    socrataDataset: 'https://mapdata.lasvegasnevada.gov/clvgis/rest/services/DevelopmentServices/BuildingPermits/MapServer/0',
    searchByAddress: (addr) =>
      `https://mapdata.lasvegasnevada.gov/clvgis/rest/services/DevelopmentServices/BuildingPermits/MapServer/0/query?where=upper(ADDRESS)+like+upper('%25${encodeURIComponent(addr)}%25')&outFields=APNO,ADDRESS,PERMIT_TYPE,ISSUE_DATE,STATUS&f=json&resultRecordCount=20`,
    radiusSearch: (lat, lon, miles = 2) =>
      `https://mapdata.lasvegasnevada.gov/clvgis/rest/services/DevelopmentServices/BuildingPermits/MapServer/0/query?geometry=${lon},${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&distance=${miles * 1609.34}&units=esriSRUnit_Meter&outFields=APNO,ADDRESS,PERMIT_TYPE,ISSUE_DATE&f=json&resultRecordCount=50`,
  },
  sandiego: {
    city: 'San Diego', state: 'CA',
    portalURL: 'https://data.sandiegocounty.gov/Housing-and-Infrastructure/Building-Permits/dyzh-7eat',
    socrataDataset: 'https://data.sandiegocounty.gov/resource/dyzh-7eat.json',
    searchByAddress: (addr) =>
      `https://data.sandiegocounty.gov/resource/dyzh-7eat.json?$where=upper(OriginalAddress1) like '%25${encodeURIComponent(addr.toUpperCase())}%25'&$limit=20`,
    radiusSearch: (lat, lon, miles = 2) =>
      `https://data.sandiegocounty.gov/resource/dyzh-7eat.json?$where=within_circle(location,${lat},${lon},${miles * 1609.34})&$limit=50`,
  },
  atlanta: {
    city: 'Atlanta', state: 'GA',
    portalURL: 'https://dpcd-coaplangis.opendata.arcgis.com/datasets/655f985f43cc40b4bf2ab7bc73d2169b',
    socrataDataset: 'https://gis.atlantaga.gov/dpcd/rest/services/OpenDataService/FeatureServer/25',
    searchByAddress: (addr) =>
      `https://gis.atlantaga.gov/dpcd/rest/services/OpenDataService/FeatureServer/25/query?where=upper(ADDRESS)+like+upper('%25${encodeURIComponent(addr)}%25')&outFields=PERMIT_NUM,ADDRESS,PERMIT_TYPE,ISSUED_DATE,STATUS&f=json&resultRecordCount=20`,
    radiusSearch: (lat, lon, miles = 2) =>
      `https://gis.atlantaga.gov/dpcd/rest/services/OpenDataService/FeatureServer/25/query?geometry=${lon},${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&distance=${miles * 1609.34}&units=esriSRUnit_Meter&outFields=PERMIT_NUM,ADDRESS,PERMIT_TYPE,ISSUED_DATE&f=json&resultRecordCount=50`,
  },
  miamidade: {
    city: 'Miami-Dade', state: 'FL',
    portalURL: 'https://gis-mdc.opendata.arcgis.com/datasets/MDC::building-permit/about',
    socrataDataset: 'https://gis-mdc.opendata.arcgis.com/datasets/MDC::building-permit',
    searchByAddress: (addr) =>
      `https://gisweb.miamidade.gov/arcgis/rest/services/EnerGov/MD_LandMgtViewer/MapServer/46/query?where=upper(SITE_ADDR)+like+upper('%25${encodeURIComponent(addr)}%25')&outFields=PROCESS_NUMBER,SITE_ADDR,FOLIO,PERMIT_DATE,PERMIT_TYPE&f=json&resultRecordCount=20`,
    radiusSearch: (lat, lon, miles = 2) =>
      `https://gisweb.miamidade.gov/arcgis/rest/services/EnerGov/MD_LandMgtViewer/MapServer/46/query?geometry=${lon},${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&distance=${miles * 1609.34}&units=esriSRUnit_Meter&outFields=PROCESS_NUMBER,SITE_ADDR,FOLIO,PERMIT_DATE&f=json&resultRecordCount=50`,
  },
  minneapolis: {
    city: 'Minneapolis', state: 'MN',
    portalURL: 'https://opendata.minneapolismn.gov/datasets/cityoflakes::ccs-permits/about',
    socrataDataset: 'https://opendata.minneapolismn.gov/datasets/91d7cc54f31a45b0982fca5117f16a0f_0',
    searchByAddress: (addr) =>
      `https://services.arcgis.com/afSMGVsC7QlRK1kZ/arcgis/rest/services/CCS_Permits/FeatureServer/0/query?where=upper(SITE_ADDRESS)+like+upper('%25${encodeURIComponent(addr)}%25')&outFields=PERMIT_NUM,SITE_ADDRESS,PERMIT_TYPE,ISSUE_DATE,STATUS&f=json&resultRecordCount=20`,
    radiusSearch: (lat, lon, miles = 2) =>
      `https://services.arcgis.com/afSMGVsC7QlRK1kZ/arcgis/rest/services/CCS_Permits/FeatureServer/0/query?geometry=${lon},${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&distance=${miles * 1609.34}&units=esriSRUnit_Meter&outFields=PERMIT_NUM,SITE_ADDRESS,PERMIT_TYPE,ISSUE_DATE&f=json&resultRecordCount=50`,
  },
  dc: {
    city: 'Washington', state: 'DC',
    portalURL: 'https://opendata.dc.gov/datasets/DCGIS::building-permits-in-2025/about',
    socrataDataset: 'https://maps2.dcgis.dc.gov/dcgis/rest/services/FEEDS/DCRA/FeatureServer/4',
    searchByAddress: (addr) =>
      `https://maps2.dcgis.dc.gov/dcgis/rest/services/FEEDS/DCRA/FeatureServer/4/query?where=upper(FULL_ADDRESS)+like+upper('%25${encodeURIComponent(addr)}%25')&outFields=PERMIT_ID,FULL_ADDRESS,ISSUE_DATE,PERMIT_TYPE_NAME,STATUS_ID&f=json&resultRecordCount=20`,
    radiusSearch: (lat, lon, miles = 2) =>
      `https://maps2.dcgis.dc.gov/dcgis/rest/services/FEEDS/DCRA/FeatureServer/4/query?geometry=${lon},${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&distance=${miles * 1609.34}&units=esriSRUnit_Meter&outFields=PERMIT_ID,FULL_ADDRESS,ISSUE_DATE,PERMIT_TYPE_NAME&f=json&resultRecordCount=50`,
  },
};

window.permitRegistryKey = function(city) {
  if (!city) return null;
  return String(city).toLowerCase().replace(/\s+/g,'').replace(/city(of)?/,'');
};
