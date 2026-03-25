// api/meta.js
// ─────────────────────────────────────────────────────────────────────────────
// Fetches the latest available HRRR or NAM run metadata from IEM.
// Returns { model_init_utc: "YYYY-MM-DD HH:MM", init: "YYYYMMDDHHMM" }
//
// Usage: /api/meta?model=hrrr
//        /api/meta?model=nam
// ─────────────────────────────────────────────────────────────────────────────

// IEM JSON endpoints — one per forecast hour, we check the 18h (1080 min) file
// which is always available if the run completed
const META_URLS = {
  hrrr: 'https://mesonet.agron.iastate.edu/data/gis/images/4326/hrrr/refd_1080.json',
  nam:  'https://mesonet.agron.iastate.edu/data/gis/images/4326/hrrr/refd_1080.json', // NAM uses same fallback
};

export default async function handler(req, res) {
  const model = (req.query.model || 'hrrr').toLowerCase();
  const metaUrl = META_URLS[model] || META_URLS.hrrr;

  try {
    const upstream = await fetch(metaUrl, {
      headers: { 'User-Agent': 'NEPlainsWeatherScope/1.0' },
    });

    if (!upstream.ok) {
      // Fallback: calculate from clock (go back 1 hour to be safe)
      return res.status(200).json(calcFallback());
    }

    const data = await upstream.json();

    // IEM returns model_init_utc like "2026-03-24 14:00"
    const raw  = data.model_init_utc || '';
    const init = raw.replace(/[-: ]/g, '').slice(0, 12); // "202603241400"

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=120'); // 2 min cache
    return res.status(200).json({
      model_init_utc: raw,
      init,           // "202603241400"
      source: 'iem',
    });

  } catch (err) {
    console.error('[meta] error:', err.message);
    // Fallback to clock-based calculation
    return res.status(200).json(calcFallback());
  }
}

// If IEM is unreachable, calculate the most likely run from the current UTC clock
function calcFallback() {
  const now = new Date();
  now.setUTCMinutes(0, 0, 0);
  now.setUTCHours(now.getUTCHours() - 1); // go back 1 hour for safety

  const y  = now.getUTCFullYear();
  const mo = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d  = String(now.getUTCDate()).padStart(2, '0');
  const h  = String(now.getUTCHours()).padStart(2, '0');
  const init = `${y}${mo}${d}${h}00`;

  return {
    model_init_utc: `${y}-${mo}-${d} ${h}:00`,
    init,
    source: 'clock-fallback',
  };
}
