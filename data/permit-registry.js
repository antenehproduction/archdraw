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

  // ── P0-5: WA permit-portal expansion (2026-04-25) ──
  // All 5 entries below ship with _unverifiedEndpoint: true. Direct REST
  // probes from agent egress returned 403 (same Cloudflare/anti-scrape wall
  // that hit P0-3 municipal-codes). URL patterns are best-known from public
  // documentation + Esri Hub + Socrata canonical conventions; field names
  // require live verification via owner-browser before the searchByAddress
  // builder is removed from quarantine. Until verified, runPhase_comp should
  // surface portal links to the user without auto-querying the JSON endpoint.

  // MyBuildingPermit.com — single eCityGov Alliance / Accela tenant covering
  // ~17 King County cities. One integration unlocks all of them. Public web
  // search exists at permitsearch.mybuildingpermit.com but no public REST
  // API surface — same pattern as Portland (web-only).
  mybuildingpermit: {
    city: 'eCityGov Alliance', state: 'WA',
    portalURL: 'https://permitsearch.mybuildingpermit.com/',
    coversCities: [
      'Bellevue', 'Bothell', 'Carnation', 'Clyde Hill', 'Issaquah', 'Kenmore',
      'Kirkland', 'Mercer Island', 'Newcastle', 'North Bend', 'Redmond',
      'Sammamish', 'Snoqualmie', 'Woodinville', 'Yarrow Point',
    ],
    notes: 'Powered by eCityGov Alliance + Accela Citizen Access. Jurisdiction is a required search-form field; no JSON or REST endpoint surfaces from the citizen portal. checklist-auto should link the user here for any covered city; runPhase_comp should fall back to address-only AI research in covered jurisdictions until an authenticated Accela Construct API key is obtained.',
    searchByAddress: null,
    _verifiedDate: '2026-04-25',
    _sourceMethod: 'public-portal-only',
  },

  // Tacoma — ArcGIS Hub dataset "Accela Permit Data (Tacoma)" updated daily.
  // Dataset item id: a12d6fbf58e4434b8ff5070c09646f19. Underlying FeatureServer
  // URL not yet confirmed (Hub indirection layer + 403 on direct probe).
  tacoma: {
    city: 'Tacoma', state: 'WA',
    portalURL: 'https://www.tacomapermits.org/',
    hubURL: 'https://tacomaopendata-tacoma.hub.arcgis.com/datasets/accela-permit-data-tacoma',
    arcgisItemId: 'a12d6fbf58e4434b8ff5070c09646f19',
    landUseHubURL: 'https://geohub.cityoftacoma.org/datasets/d3ec4be073384acbad77a9c51b519130',
    searchByAddress: null,
    notes: 'Accela permit data published to Tacoma Open Data Hub daily. Underlying FeatureServer URL has not been verified through agent egress (Hub redirect + 403). Owner-browser test recommended before the searchByAddress builder is wired.',
    _verifiedDate: '2026-04-25',
    _sourceMethod: 'public-portal-only',
    _unverifiedEndpoint: true,
  },

  // Pierce County (unincorporated + Lakewood + smaller cities; Tacoma has its
  // own portal above). Multiple Socrata datasets discovered via owner-browser
  // upload of dev.socrata.com Foundry pages (round 4, 2026-04-25):
  //   bg5p-p534  — original P0-5 best-guess (broad permits feed)
  //   hmbh-c3hw  — internal.open.piercecountywa.gov (newer endpoint)
  //   eugc-5pca  — open.piercecountywa.gov (embed view)
  // The GitHub Actions schema-fetch workflow (.github/workflows/fetch-schemas.yml)
  // resolves field names for all of these; sync-permit-registry.py picks the
  // dataset whose schema actually advertises a permit-like address column.
  pierce_county_unincorp: {
    city: 'Pierce County (unincorporated)', state: 'WA',
    portalURL: 'https://open.piercecountywa.gov/dataset/Permits-Pierce-County/bg5p-p534',
    socrataDataset: 'https://open.piercecountywa.gov/resource/bg5p-p534.json',
    socrataDatasetCandidates: [
      'https://open.piercecountywa.gov/resource/bg5p-p534.json',
      'https://internal.open.piercecountywa.gov/resource/hmbh-c3hw.json',
      'https://open.piercecountywa.gov/resource/eugc-5pca.json',
    ],
    searchByAddress: (addr) =>
      `https://open.piercecountywa.gov/resource/bg5p-p534.json?$where=upper(site_address) like '%25${encodeURIComponent(addr.toUpperCase())}%25'&$limit=20`,
    radiusSearch: (lat, lon, miles = 2) =>
      `https://open.piercecountywa.gov/resource/bg5p-p534.json?$where=within_circle(location,${lat},${lon},${miles * 1609.34})&$limit=50`,
    notes: 'Pierce County PALS-Plus extract published to Open Pierce County. Permit points placed via PALS-Plus XY coords; permits without coords are not in the spatial layer. Field names assumed (site_address, permit_number, issue_date, permit_type, location); GitHub Actions schema fetch will graduate this entry once it returns the canonical column names.',
    _verifiedDate: '2026-04-25',
    _sourceMethod: 'documented-socrata-id',
    _unverifiedEndpoint: true,
  },

  // Snohomish County — Active Permits dataset hosted on the snoco-gis ArcGIS
  // Online org. The org's services6.arcgis.com host (z6WYi9VRHfgwgtyW) is
  // confirmed for zoning + parcels; permits service name not yet verified.
  snohomish_county_unincorp: {
    city: 'Snohomish County (unincorporated)', state: 'WA',
    portalURL: 'https://snohomish-county-open-data-portal-snoco-gis.hub.arcgis.com/datasets/snoco-gis::active-permits-1',
    arcgisOrgHost: 'https://services6.arcgis.com/z6WYi9VRHfgwgtyW',
    pdsRecordsURL: 'https://snohomishcountywa.gov/3920/Online-Permitting',
    searchByAddress: null,
    notes: 'snoco-gis Active Permits FeatureServer URL not yet confirmed; the org host services6.arcgis.com/z6WYi9VRHfgwgtyW is verified for sibling layers (zoning, parcels). Likely path: <orgHost>/arcgis/rest/services/Active_Permits/FeatureServer/0 — pending owner-browser verification. Site-intel can fall back to the PDS Online Records portal until then.',
    _verifiedDate: '2026-04-25',
    _sourceMethod: 'partial-discovery',
    _unverifiedEndpoint: true,
  },

  // Everett — multiple Socrata datasets discovered via owner-browser upload
  // of dev.socrata.com Foundry pages (round 4, 2026-04-25):
  //   7fiu-4gra  — original P0-5 best-guess (Permits)
  //   3w3u-656c  — newly discovered Everett Socrata dataset
  //   ppic-abeb  — newly discovered Everett Socrata dataset
  // The GitHub Actions workflow resolves all schemas; sync-permit-registry.py
  // picks the one whose schema is actually permit-shaped. eTRAKiT online
  // portal at onlinepermits.everettwa.gov is the citizen-facing apply/inspect
  // surface (no public REST).
  everett: {
    city: 'Everett', state: 'WA',
    portalURL: 'https://onlinepermits.everettwa.gov/etrakit/default.aspx',
    socrataDataset: 'https://data.everettwa.gov/resource/7fiu-4gra.json',
    socrataDatasetCandidates: [
      'https://data.everettwa.gov/resource/7fiu-4gra.json',
      'https://data.everettwa.gov/resource/3w3u-656c.json',
      'https://data.everettwa.gov/resource/ppic-abeb.json',
    ],
    openDataURL: 'https://data.everettwa.gov/Responsive-and-Responsible-Government/Permits/7fiu-4gra',
    searchByAddress: (addr) =>
      `https://data.everettwa.gov/resource/7fiu-4gra.json?$where=upper(address) like '%25${encodeURIComponent(addr.toUpperCase())}%25'&$limit=20`,
    radiusSearch: null,
    notes: 'Everett Socrata permit dataset (id pending schema-fetch). Standard Socrata URL conventions; field name "address" assumed pending GitHub Actions schema-fetch graduation. eTRAKiT online portal is the citizen-facing apply/inspect surface.',
    _verifiedDate: '2026-04-25',
    _sourceMethod: 'documented-socrata-id',
    _unverifiedEndpoint: true,
  },

};

window.permitRegistryKey = function(city) {
  if (!city) return null;
  return String(city).toLowerCase().replace(/\s+/g,'').replace(/city(of)?/,'');
};
