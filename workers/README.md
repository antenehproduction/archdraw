# ArchDraw Intel — proxy worker

Single Cloudflare Worker that sits between the browser app and third-party data APIs (FEMA, county ArcGIS, municipal codes, Socrata permit portals). Handles CORS + caching + secret keys. Free tier covers 100K requests/day.

## Deploy (one-time, ~5 minutes)

```bash
npm install -g wrangler
wrangler login                    # opens browser, approve access to your Cloudflare account
cd workers/
wrangler deploy                   # reads wrangler.toml and deploys proxy.js
```

Output ends with:
```
Deployed adi-proxy ... ✔
  https://adi-proxy.<your-subdomain>.workers.dev
```

Copy that URL.

## Wire it into the app

In the browser DevTools console on the live app:
```js
localStorage.setItem('ADI_PROXY', 'https://adi-proxy.<your-subdomain>.workers.dev');
location.reload();
```

Or permanently, edit `index.html` and set `window.ADI_PROXY_DEFAULT = 'https://adi-proxy...'` near the top of the script.

To remove:
```js
localStorage.removeItem('ADI_PROXY');
location.reload();
```

## Available routes

| Route | Upstream |
|-------|----------|
| `GET /fema?lat=&lon=` | FEMA NFHL flood zone |
| `GET /arcgis?url=<encoded>` | Any ArcGIS REST endpoint (safety-gated to arcgis* domains) |
| `GET /municode?url=<encoded>` | Municipal code (municode / ecode360 / codepublishing / amlegal) |
| `GET /permits/<city>?q=` | Socrata permit portal. Cities: seattle, sf, nyc, boston, austin, chicago, la |
| `GET /health` | Self-test and route list |

All responses include `Access-Control-Allow-Origin` for the configured allowlist.

## Allowlist

`ALLOWED_ORIGINS` in `proxy.js` limits which sites can call the proxy. Currently:
- `https://antenehproduction.github.io` (production)
- `http://localhost:8080` / `http://127.0.0.1:8080` (local dev)

Add more as needed and redeploy.

## Adding secrets (for paid APIs like ATTOM / Bridge MLS)

```bash
wrangler secret put ATTOM_API_KEY    # prompts for the value, never echoes it
```

Then reference in `proxy.js` as `env.ATTOM_API_KEY` — the worker reads it at runtime; the client never sees it.

## Cost at scale

- Free tier: 100,000 requests/day, 10ms CPU/request. A typical analysis hits the proxy 5-10 times, so free tier supports ~10,000 analyses/day.
- Above free tier: $5/month for 10M requests.
