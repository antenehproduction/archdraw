#!/usr/bin/env node
// ArchDraw Intel — local server
// Serves all project files + proxies external APIs so CORS-blocked
// endpoints work without Vercel.
//
// Usage:
//   1. cp .env.example .env  → paste ANTHROPIC_KEY=sk-ant-...
//   2. node server.js
//   3. Open http://localhost:8080
//
// The app auto-detects local mode and uses your .env key for all AI calls.
// No sign-in required.

'use strict';

const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');
const url   = require('url');

// ─── Load .env ──────────────────────────────────────────────────────────────
try {
  let raw = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
  // Strip UTF-8 BOM that Windows Notepad adds
  if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
  raw.split(/\r?\n/).forEach(line => {
    if (!line || line.startsWith('#')) return;
    const eq = line.indexOf('=');
    if (eq < 1) return;
    const key = line.slice(0, eq).trim();
    let val   = line.slice(eq + 1).trim();
    // Strip surrounding quotes: "value" or 'value'
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (key && val) process.env[key] = val;
  });
} catch (_) {}

const PORT          = parseInt(process.env.PORT || '8080', 10);
const ANTHROPIC_KEY = process.env.ANTHROPIC_KEY || '';

// ─── Static file serving ────────────────────────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.ico':  'image/x-icon',
  '.svg':  'image/svg+xml',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
  '.txt':  'text/plain; charset=utf-8',
};

function serveStatic(res, filePath) {
  // Security: prevent path traversal
  const abs = path.resolve(filePath);
  if (!abs.startsWith(__dirname)) { send(res, 403, 'text/plain', 'Forbidden'); return; }
  try {
    const stat = fs.statSync(abs);
    const target = stat.isDirectory() ? path.join(abs, 'index.html') : abs;
    const data = fs.readFileSync(target);
    const ext  = path.extname(target).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  } catch (_) { send(res, 404, 'text/plain', 'Not found'); }
}

function send(res, status, ct, body) {
  const buf = typeof body === 'string' ? Buffer.from(body, 'utf8') : body;
  res.writeHead(status, {
    'Content-Type': ct,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(buf);
}

function json(res, status, obj) {
  send(res, status, 'application/json', JSON.stringify(obj));
}

// ─── Helpers: upstream HTTPS requests ───────────────────────────────────────
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', d => chunks.push(d));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function httpsGet(targetUrl, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(targetUrl);
    const opts = {
      hostname: parsed.hostname,
      port:     parsed.port || 443,
      path:     parsed.pathname + parsed.search,
      method:   'GET',
      headers:  {
        'User-Agent':      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept':          'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        ...extraHeaders,
      },
    };
    const req = https.request(opts, resolve);
    req.on('error', reject);
    req.end();
  });
}

function httpsPost(targetUrl, headers, body) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(targetUrl);
    const buf = Buffer.isBuffer(body) ? body : Buffer.from(body, 'utf8');
    const opts = {
      hostname: parsed.hostname,
      port:     parsed.port || 443,
      path:     parsed.pathname + parsed.search,
      method:   'POST',
      headers:  { ...headers, 'Content-Length': buf.length },
    };
    const req = https.request(opts, resolve);
    req.on('error', reject);
    req.write(buf);
    req.end();
  });
}

function pipeUpstream(upRes, res, extraHeaders = {}) {
  res.writeHead(upRes.statusCode, {
    'Content-Type': upRes.headers['content-type'] || 'application/octet-stream',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store',
    ...extraHeaders,
  });
  upRes.pipe(res);
}

function readUpstream(upRes) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    upRes.on('data', d => chunks.push(d));
    upRes.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    upRes.on('error', reject);
  });
}

// ─── Route handlers ─────────────────────────────────────────────────────────

// /api/local-auth  — tells index.html whether a local key is configured
function handleLocalAuth(res) {
  json(res, 200, { keyAvailable: !!ANTHROPIC_KEY, mode: 'local' });
}

// /api/health
function handleHealth(res) {
  json(res, 200, {
    ok: true,
    version: 'local-server-1',
    platform: 'node',
    keyAvailable: !!ANTHROPIC_KEY,
    routes: ['/api/local-auth', '/api/health', '/api/ai/messages', '/api/fema?lat=&lon=',
             '/api/arcgis?url=', '/api/overpass?data=', '/api/municode?url=', '/api/permits/:city'],
  });
}

// /api/ai/messages  — Anthropic proxy, NO JWT required (local mode)
async function handleAIMessages(req, res) {
  if (!ANTHROPIC_KEY) {
    json(res, 401, { error: 'ANTHROPIC_KEY not set in .env' });
    return;
  }
  const body = await readBody(req);
  let parsed;
  try { parsed = JSON.parse(body.toString('utf8')); } catch (_) {
    json(res, 400, { error: 'invalid_json_body' }); return;
  }
  if (!parsed?.messages) { json(res, 400, { error: 'messages required' }); return; }

  const upstreamBody = Buffer.from(JSON.stringify({
    model:      parsed.model      || 'claude-sonnet-4-6',
    max_tokens: parsed.max_tokens || 2200,
    messages:   parsed.messages,
    ...(parsed.system ? { system: parsed.system } : {}),
  }), 'utf8');

  try {
    const upRes = await httpsPost('https://api.anthropic.com/v1/messages', {
      'x-api-key':           ANTHROPIC_KEY,
      'anthropic-version':   '2023-06-01',
      'Content-Type':        'application/json',
    }, upstreamBody);
    pipeUpstream(upRes, res);
  } catch (e) {
    json(res, 502, { error: e.message });
  }
}

// /api/fema?lat=&lon=
const FEMA_ENDPOINTS = [
  'https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query',
  'https://hazards.fema.gov/arcgis/rest/services/FEMA/NFHL/MapServer/28/query',
  'https://msc.fema.gov/arcgis/rest/services/NFHL/MapServer/28/query',
  'https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/28/query',
];
async function handleFema(params, res) {
  const lat = params.get('lat'), lon = params.get('lon');
  if (!lat || !lon) { json(res, 400, { error: 'lat + lon required' }); return; }
  const qs = `?geometry=${lon},${lat}&geometryType=esriGeometryPoint&spatialRel=esriSpatialRelIntersects&outFields=FLD_ZONE,SFHA_TF&returnGeometry=false&f=json`;
  for (const base of FEMA_ENDPOINTS) {
    try {
      const upRes = await httpsGet(base + qs);
      const text  = await readUpstream(upRes);
      let obj;
      try { obj = JSON.parse(text); } catch (_) { continue; }
      if (upRes.statusCode === 200 && obj.features !== undefined) {
        send(res, 200, 'application/json', text);
        return;
      }
    } catch (_) {}
  }
  json(res, 502, { error: 'fema_all_endpoints_failed' });
}

// /api/arcgis?url=
const ARCGIS_ALLOWLIST = /arcgis|gismaps|portlandmaps|hazards\.fema|dpw\.gis|sfplanninggis|acgov|hazards\.usgs|coast\.noaa|fortress\.wa\.gov|gis\.dnr\.wa\.gov|kingcounty|services1\.arcgis|services6\.arcgis|snohomish|piercecountywa/i;
async function handleArcgis(params, res) {
  const targetUrl = params.get('url');
  if (!targetUrl) { json(res, 400, { error: 'url required' }); return; }
  if (!ARCGIS_ALLOWLIST.test(targetUrl)) { json(res, 400, { error: 'url not in ArcGIS allowlist' }); return; }
  try {
    const upRes = await httpsGet(targetUrl);
    pipeUpstream(upRes, res);
  } catch (e) {
    json(res, 502, { error: e.message });
  }
}

// /api/overpass?data=
async function handleOverpass(params, res) {
  const data = params.get('data');
  if (!data) { json(res, 400, { error: 'data required' }); return; }
  const body = 'data=' + encodeURIComponent(data);
  try {
    const upRes = await httpsPost('https://overpass-api.de/api/interpreter', {
      'Content-Type':  'application/x-www-form-urlencoded',
      'User-Agent':    'Mozilla/5.0',
      'Accept':        'application/json',
    }, body);
    pipeUpstream(upRes, res);
  } catch (e) {
    json(res, 502, { error: e.message });
  }
}

// /api/municode?url=
const MUNI_ALLOWLIST = /municode|ecode360|codepublishing|legistar|amlegal/i;
async function handleMunicode(params, res) {
  const targetUrl = params.get('url');
  if (!targetUrl) { json(res, 400, { error: 'url required' }); return; }
  if (!MUNI_ALLOWLIST.test(targetUrl)) { json(res, 400, { error: 'url not in municode allowlist' }); return; }
  try {
    const upRes = await httpsGet(targetUrl);
    const text  = await readUpstream(upRes);
    send(res, upRes.statusCode, 'text/plain; charset=utf-8', text);
  } catch (e) {
    json(res, 502, { error: e.message });
  }
}

// /api/permits/:city?...
const PERMIT_ENDPOINTS = {
  seattle: 'https://data.seattle.gov/resource/76t5-zqzr.json',
  sf:      'https://data.sfgov.org/resource/i98e-djp9.json',
  nyc:     'https://data.cityofnewyork.us/resource/ipu4-2q9a.json',
  boston:  'https://data.boston.gov/api/3/action/datastore_search?resource_id=6ddcd912-32a0-43df-9908-63574f8c7e77',
  austin:  'https://data.austintexas.gov/resource/3syk-w9eu.json',
  chicago: 'https://data.cityofchicago.org/resource/ydr8-5enu.json',
  la:      'https://data.lacity.org/resource/yv23-pmwf.json',
};
async function handlePermits(city, params, res) {
  const endpoint = PERMIT_ENDPOINTS[city];
  if (!endpoint) { json(res, 400, { error: `unknown city '${city}'` }); return; }
  const q = params.toString();
  const target = endpoint + (endpoint.includes('?') ? '&' : '?') + q;
  try {
    const upRes = await httpsGet(target);
    pipeUpstream(upRes, res);
  } catch (e) {
    json(res, 502, { error: e.message });
  }
}

// ─── Main request dispatcher ─────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const parsed   = url.parse(req.url, true);
  const pathname = parsed.pathname.replace(/\/$/, '') || '/';
  const params   = new URLSearchParams(parsed.query);

  // Strip /api prefix to get the sub-route
  const isApi    = pathname.startsWith('/api');
  const subPath  = isApi ? pathname.slice(4).replace(/^\//, '') : null;
  const segments = subPath ? subPath.split('/').filter(Boolean) : [];
  const route    = segments[0] || '';

  try {
    if (isApi) {
      if (route === 'local-auth')                      { handleLocalAuth(res); return; }
      if (route === 'health' || route === '')          { handleHealth(res); return; }
      if (route === 'fema')                            { await handleFema(params, res); return; }
      if (route === 'arcgis')                          { await handleArcgis(params, res); return; }
      if (route === 'overpass')                        { await handleOverpass(params, res); return; }
      if (route === 'municode')                        { await handleMunicode(params, res); return; }
      if (route === 'permits' && segments[1])          { await handlePermits(segments[1], params, res); return; }
      if (route === 'ai' && segments[1] === 'messages' && req.method === 'POST') {
        await handleAIMessages(req, res); return;
      }
      json(res, 404, { error: 'not found', tried: subPath });
      return;
    }

    // Static file
    serveStatic(res, path.join(__dirname, pathname === '/' ? 'index.html' : pathname));
  } catch (e) {
    console.error('[server]', e.message);
    json(res, 500, { error: e.message });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('\x1b[32m✓ ArchDraw Intel\x1b[0m  http://localhost:' + PORT);
  if (ANTHROPIC_KEY) {
    console.log('\x1b[36mℹ Key loaded from .env — AI calls routed through local server\x1b[0m');
  } else {
    console.log('\x1b[33m⚠ No ANTHROPIC_KEY in .env — you can enter a key in the app UI\x1b[0m');
  }
  console.log('\x1b[90mCtrl+C to stop\x1b[0m');
});
