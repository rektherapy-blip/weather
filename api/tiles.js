// api/tiles.js
// ─────────────────────────────────────────────────────────────────────────────
// Vercel serverless tile proxy.
// The browser calls: /api/tiles?url=https://mesonet.agron.iastate.edu/...
// This function fetches the tile from IEM/NOAA server-side (no CORS issue)
// and streams it back to the browser with proper headers.
// ─────────────────────────────────────────────────────────────────────────────

const ALLOWED_DOMAINS = [
  'mesonet.agron.iastate.edu',
  'noaa.gov',
  'ncep.noaa.gov',
  'weather.gov',
  'tilecache.rainviewer.com',
  'api.rainviewer.com',
];

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  // Validate URL
  let parsed;
  try {
    parsed = new URL(decodeURIComponent(url));
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  // Only allow whitelisted domains
  const allowed = ALLOWED_DOMAINS.some(d => parsed.hostname === d || parsed.hostname.endsWith('.' + d));
  if (!allowed) {
    return res.status(403).json({ error: `Domain not allowed: ${parsed.hostname}` });
  }

  try {
    const upstream = await fetch(parsed.toString(), {
      headers: {
        'User-Agent': 'NEPlainsWeatherScope/1.0',
        'Accept':     'image/png,image/*,*/*',
      },
    });

    if (!upstream.ok) {
      return res.status(upstream.status).end();
    }

    const contentType = upstream.headers.get('content-type') || 'image/png';
    const buffer      = await upstream.arrayBuffer();

    res.setHeader('Content-Type',                contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control',               'public, max-age=300'); // 5 min cache
    return res.status(200).send(Buffer.from(buffer));

  } catch (err) {
    console.error('[tiles proxy] error:', err.message);
    return res.status(502).json({ error: 'Upstream fetch failed' });
  }
}
