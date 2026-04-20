// ArchDraw Intel — CORS / auth proxy (Vercel Edge Function)
// Catch-all route at api/[...path].js — handles every /api/* path with one function.
// Runtime: 'edge' uses V8 isolates (similar to Cloudflare Workers), no cold start.
//
// ═══ DEPLOYMENT ═══
// Option A — Git deploy (recommended, no CLI):
//   1. https://vercel.com/new → "Import Git Repository" → select Premit-Ready
//   2. Framework: "Other" · Root: leave default · Build: leave empty
//   3. Click Deploy
//   4. Copy the deployment URL (e.g. https://premit-ready.vercel.app)
//
// Option B — CLI:
//   1. npm i -g vercel
//   2. cd Premit-Ready/ && vercel deploy --prod
//
// ═══ WIRE INTO THE APP ═══
// Open DevTools console on the live app:
//   localStorage.setItem('ADI_PROXY', 'https://<your-deployment>.vercel.app/api');
//   location.reload();
// Note the trailing /api — Vercel routes serverless functions under /api by default.
//
// ═══ ROUTES ═══
//   GET /api/health        → version + route list
//   GET /api/fema?lat=&lon= → FEMA NFHL flood zone
//   GET /api/arcgis?url=    → any ArcGIS REST query (whitelisted)
//   GET /api/municode?url=  → municipal code text
//   GET /api/permits/<city>?... → Socrata permit search
//   GET /api/diag?url=      → upstream debugging passthrough

const PROXY_VERSION = '5-vercel';

// v5: permissive CORS for public data. Reflect the requesting origin so the
// proxy works from any deployment target (github.io, vercel.app, custom
// domains, localhost). Tighten again when we add paid-API secrets.
const ALLOWED_ORIGINS = null; // unused; kept for doc

const PERMIT_ENDPOINTS = {
  seattle:  'https://data.seattle.gov/resource/76t5-zqzr.json',
  sf:       'https://data.sfgov.org/resource/i98e-djp9.json',
  nyc:      'https://data.cityofnewyork.us/resource/ipu4-2q9a.json',
  boston:   'https://data.boston.gov/api/3/action/datastore_search?resource_id=6ddcd912-32a0-43df-9908-63574f8c7e77',
  austin:   'https://data.austintexas.gov/resource/3syk-w9eu.json',
  chicago:  'https://data.cityofchicago.org/resource/ydr8-5enu.json',
  la:       'https://data.lacity.org/resource/yv23-pmwf.json',
};

const PROXY_HEADERS = { 'User-Agent': 'ArchDrawIntel-Proxy/1.0', 'Accept': 'application/json' };

const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': origin || '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
  'X-Adi-Proxy-Version': PROXY_VERSION,
});

function jsonResponse(body, origin, status = 200, cacheControl = 'no-store') {
  return new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json', 'Cache-Control': cacheControl },
  });
}

async function jsonPassthrough(resp, origin, label) {
  const contentType = resp.headers.get('content-type') || '';
  const text = await resp.text();
  const looksJson = contentType.includes('json') || /^\s*[\{\[]/.test(text);
  if (!resp.ok || !looksJson) {
    return jsonResponse({
      error: 'upstream_non_json',
      label,
      upstreamStatus: resp.status,
      upstreamContentType: contentType,
      preview: text.substring(0, 200).replace(/\s+/g, ' ').trim(),
      hint: 'Upstream returned HTML/error. Not cached; the next request will retry upstream cleanly.',
    }, origin, 502, 'no-store');
  }
  return new Response(text, {
    status: 200,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300, s-maxage=300' },
  });
}

async function handleFema(params, origin) {
  const lat = params.get('lat'), lon = params.get('lon');
  if (!lat || !lon) return jsonResponse({ error: 'lat + lon required' }, origin, 400);
  const upstream = `https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/28/query?geometry=${lon},${lat}&geometryType=esriGeometryPoint&spatialRel=esriSpatialRelIntersects&outFields=FLD_ZONE,SFHA_TF&returnGeometry=false&f=json`;
  const resp = await fetch(upstream, { headers: PROXY_HEADERS });
  return jsonPassthrough(resp, origin, 'fema');
}

async function handleArcgis(params, origin) {
  const url = params.get('url');
  if (!url) return jsonResponse({ error: 'url required' }, origin, 400);
  if (!/arcgis|services\.arcgisonline|gismaps|portlandmaps|hazards\.fema|dpw\.gis\.lacounty|sfplanninggis|acgov/i.test(url))
    return jsonResponse({ error: 'url must be an ArcGIS REST endpoint' }, origin, 400);
  const resp = await fetch(url, { headers: PROXY_HEADERS });
  return jsonPassthrough(resp, origin, 'arcgis');
}

async function handleMunicode(params, origin) {
  const url = params.get('url');
  if (!url) return jsonResponse({ error: 'url required' }, origin, 400);
  if (!/municode|ecode360|codepublishing|legistar|amlegal/i.test(url))
    return jsonResponse({ error: 'url must be a recognized municipal-code domain' }, origin, 400);
  const resp = await fetch(url);
  if (!resp.ok) return jsonResponse({ error: 'upstream_failed', upstreamStatus: resp.status }, origin, 502);
  const text = await resp.text();
  return new Response(text, {
    status: 200,
    headers: { ...corsHeaders(origin), 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400' },
  });
}

async function handlePermits(city, params, origin) {
  const endpoint = PERMIT_ENDPOINTS[city];
  if (!endpoint) return jsonResponse({ error: `unknown city '${city}'. Supported: ${Object.keys(PERMIT_ENDPOINTS).join(', ')}` }, origin, 400);
  const q = params.toString();
  const url = `${endpoint}${endpoint.includes('?') ? '&' : '?'}${q}`;
  const resp = await fetch(url, { headers: PROXY_HEADERS });
  return jsonPassthrough(resp, origin, `permits:${city}`);
}

async function handleDiag(params, origin) {
  const url = params.get('url');
  if (!url) return jsonResponse({ error: 'pass ?url=... to diagnose any endpoint' }, origin, 400);
  try {
    const t0 = Date.now();
    const resp = await fetch(url, { headers: PROXY_HEADERS });
    const text = await resp.text();
    return jsonResponse({
      url,
      upstreamStatus: resp.status,
      upstreamContentType: resp.headers.get('content-type') || '(none)',
      bodyLength: text.length,
      bodyPreview: text.substring(0, 500),
      elapsedMs: Date.now() - t0,
      proxyVersion: PROXY_VERSION,
    }, origin);
  } catch (e) {
    return jsonResponse({ error: e.message, url, proxyVersion: PROXY_VERSION }, origin, 500);
  }
}

export const config = { runtime: 'edge' };

export default async function handler(request) {
  const origin = request.headers.get('Origin') || '';
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }
  const u = new URL(request.url);
  // path is the catch-all segment array, joined back into a string
  // Vercel passes the rest of the URL after /api/ as the dynamic segment
  // Strip /api/ prefix so we can route on the remaining path
  const subPath = u.pathname.replace(/^\/api\/?/, '').replace(/\/$/, '');
  const segments = subPath.split('/').filter(Boolean);
  const route = segments[0] || 'health';
  try {
    if (route === 'health' || route === '') {
      return jsonResponse({
        ok: true,
        version: PROXY_VERSION,
        platform: 'vercel-edge',
        routes: ['/api/fema?lat=&lon=', '/api/arcgis?url=', '/api/municode?url=', '/api/permits/:city', '/api/diag?url='],
        permitCities: Object.keys(PERMIT_ENDPOINTS),
      }, origin);
    }
    if (route === 'fema') return await handleFema(u.searchParams, origin);
    if (route === 'arcgis') return await handleArcgis(u.searchParams, origin);
    if (route === 'municode') return await handleMunicode(u.searchParams, origin);
    if (route === 'permits' && segments[1]) return await handlePermits(segments[1], u.searchParams, origin);
    if (route === 'diag') return await handleDiag(u.searchParams, origin);
    return jsonResponse({ error: 'not found', tried: subPath }, origin, 404);
  } catch (e) {
    return jsonResponse({ error: e.message, route }, origin, 500);
  }
}
