// ArchDraw Intel — CORS / auth proxy
// Deployed as a Cloudflare Worker (free tier: 100K requests/day).
// Sits between the static GitHub Pages app and third-party data APIs,
// adding CORS headers, holding secret keys, and caching common queries.
//
// ═══ DEPLOYMENT ═══
// 1. npm install -g wrangler
// 2. wrangler login
// 3. cd workers/ && wrangler deploy proxy.js --name adi-proxy
// 4. Copy the resulting URL (e.g. https://adi-proxy.<your-subdomain>.workers.dev)
// 5. In the app, open DevTools console and run:
//      localStorage.setItem('ADI_PROXY','https://adi-proxy.<your-subdomain>.workers.dev');
//    Or edit index.html: set window.ADI_PROXY_DEFAULT to the same value.
// 6. Reload the app. FEMA / assessor / municode fetches now route through the proxy.
//
// ═══ ROUTES ═══
//   GET /fema?lat=&lon=          → FEMA NFHL flood zone
//   GET /arcgis?url=<encoded>    → any ArcGIS REST query (CORS-open upstream)
//   GET /municode?url=<encoded>  → municipal code text (municode/ecode360/codepublishing)
//   GET /permits/<city>?q=       → Socrata permit search (see PERMIT_ENDPOINTS)
//
// ═══ SECRETS ═══
// If you want to use paid data (ATTOM, Bridge MLS), set via `wrangler secret put KEY_NAME`:
//   ATTOM_API_KEY, BRIDGE_API_KEY, etc.
// The worker reads them from env.<KEY_NAME> and never exposes them to the client.

const ALLOWED_ORIGINS = [
  'https://antenehproduction.github.io',
  'http://localhost:8080', // local dev
  'http://127.0.0.1:8080',
];

const CORS_HEADERS = (origin) => ({
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
});

const PERMIT_ENDPOINTS = {
  seattle:  'https://data.seattle.gov/resource/76t5-zqzr.json',       // Building permits
  sf:       'https://data.sfgov.org/resource/i98e-djp9.json',          // Building permits
  nyc:      'https://data.cityofnewyork.us/resource/ipu4-2q9a.json',   // DOB Job Application
  boston:   'https://data.boston.gov/api/3/action/datastore_search?resource_id=6ddcd912-32a0-43df-9908-63574f8c7e77',
  austin:   'https://data.austintexas.gov/resource/3syk-w9eu.json',    // Issued construction permits
  chicago:  'https://data.cityofchicago.org/resource/ydr8-5enu.json',  // Building permits
  la:       'https://data.lacity.org/resource/yv23-pmwf.json',         // Building and Safety permits
};

function corsResponse(body, origin, status = 200, extraHeaders = {}) {
  return new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS(origin), 'Content-Type': 'application/json', ...extraHeaders },
  });
}

// Passes upstream response through as JSON only if it actually IS JSON.
// If upstream returned HTML or an error status, wrap it in a structured JSON error
// so the client can JSON.parse() without choking on "<html>..." bodies.
async function jsonPassthrough(resp, origin, label, extraHeaders = {}) {
  const contentType = resp.headers.get('content-type') || '';
  const text = await resp.text();
  const looksJson = contentType.includes('json') || /^\s*[\{\[]/.test(text);
  if (!resp.ok || !looksJson) {
    const bodyPreview = text.substring(0, 200).replace(/\s+/g, ' ').trim();
    return corsResponse({
      error: 'upstream_non_json',
      label,
      upstreamStatus: resp.status,
      upstreamContentType: contentType,
      preview: bodyPreview,
      hint: 'The upstream service returned HTML or an error. Retry in a moment or check the upstream status directly.',
    }, origin, 502, extraHeaders);
  }
  return new Response(text, {
    status: 200,
    headers: { ...CORS_HEADERS(origin), 'Content-Type': 'application/json', ...extraHeaders },
  });
}

async function handleFema(params, origin) {
  const lat = params.get('lat'), lon = params.get('lon');
  if (!lat || !lon) return corsResponse({ error: 'lat + lon required' }, origin, 400);
  const upstream = `https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/28/query?geometry=${lon},${lat}&geometryType=esriGeometryPoint&spatialRel=esriSpatialRelIntersects&outFields=FLD_ZONE,SFHA_TF&returnGeometry=false&f=json`;
  const resp = await fetch(upstream, {
    cf: { cacheTtl: 3600, cacheEverything: true },
    headers: { 'User-Agent': 'ArchDrawIntel-Proxy/1.0', 'Accept': 'application/json' },
  });
  return jsonPassthrough(resp, origin, 'fema', { 'Cache-Control': 'public, max-age=3600' });
}

async function handleArcgis(params, origin) {
  const url = params.get('url');
  if (!url) return corsResponse({ error: 'url required' }, origin, 400);
  // Safety: only allow ArcGIS REST endpoints
  if (!/arcgis|services\.arcgisonline|gismaps|portlandmaps|hazards\.fema/i.test(url))
    return corsResponse({ error: 'url must be an ArcGIS REST endpoint' }, origin, 400);
  const resp = await fetch(url, {
    cf: { cacheTtl: 1800, cacheEverything: true },
    headers: { 'User-Agent': 'ArchDrawIntel-Proxy/1.0', 'Accept': 'application/json' },
  });
  return jsonPassthrough(resp, origin, 'arcgis', { 'Cache-Control': 'public, max-age=1800' });
}

async function handleMunicode(params, origin) {
  const url = params.get('url');
  if (!url) return corsResponse({ error: 'url required' }, origin, 400);
  // Only allow known municipal-code domains
  if (!/municode|ecode360|codepublishing|legistar|amlegal/i.test(url))
    return corsResponse({ error: 'url must be a recognized municipal-code domain' }, origin, 400);
  const resp = await fetch(url, { cf: { cacheTtl: 86400, cacheEverything: true } });
  const text = await resp.text();
  // Return text (HTML) as-is; client will extract what it needs
  return new Response(text, {
    status: 200,
    headers: {
      ...CORS_HEADERS(origin),
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}

async function handlePermits(path, params, origin) {
  const city = path.split('/')[2]; // /permits/<city>
  const endpoint = PERMIT_ENDPOINTS[city];
  if (!endpoint) return corsResponse({ error: `unknown city '${city}'. Supported: ${Object.keys(PERMIT_ENDPOINTS).join(', ')}` }, origin, 400);
  const q = params.toString();
  const url = `${endpoint}${endpoint.includes('?') ? '&' : '?'}${q}`;
  const resp = await fetch(url, {
    cf: { cacheTtl: 600, cacheEverything: true },
    headers: { 'User-Agent': 'ArchDrawIntel-Proxy/1.0', 'Accept': 'application/json' },
  });
  return jsonPassthrough(resp, origin, `permits:${city}`, { 'Cache-Control': 'public, max-age=600' });
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS(origin) });
    }
    const u = new URL(request.url);
    const path = u.pathname;
    try {
      if (path === '/fema') return await handleFema(u.searchParams, origin);
      if (path === '/arcgis') return await handleArcgis(u.searchParams, origin);
      if (path === '/municode') return await handleMunicode(u.searchParams, origin);
      if (path.startsWith('/permits/')) return await handlePermits(path, u.searchParams, origin);
      if (path === '/' || path === '/health') {
        return corsResponse({
          ok: true,
          routes: ['/fema', '/arcgis', '/municode', '/permits/:city'],
          permitCities: Object.keys(PERMIT_ENDPOINTS),
        }, origin);
      }
      return corsResponse({ error: 'not found' }, origin, 404);
    } catch (e) {
      return corsResponse({ error: e.message }, origin, 500);
    }
  },
};
