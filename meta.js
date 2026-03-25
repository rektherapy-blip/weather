// api/meta.js
// Returns the latest available HRRR run timestamp.
// Falls back to clock-based calculation if IEM is unreachable.

function clockFallback() {
  const now = new Date();
  // Go back 1 hour to ensure the run is actually available
  now.setUTCMinutes(0, 0, 0);
  now.setUTCHours(now.getUTCHours() - 1);
  const y  = now.getUTCFullYear();
  const mo = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d  = String(now.getUTCDate()).padStart(2, '0');
  const h  = String(now.getUTCHours()).padStart(2, '0');
  const init = `${y}${mo}${d}${h}00`; // e.g. "202603251300"
  return { init, source: 'clock' };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=120');

  try {
    // IEM JSON metadata — tells us the actual latest processed run
    const up = await fetch(
      'https://mesonet.agron.iastate.edu/data/gis/images/4326/hrrr/refd_1080.json',
      { headers: { 'User-Agent': 'NEPlainsWeatherScope/1.0' } }
    );

    if (!up.ok) throw new Error(`IEM returned ${up.status}`);

    const data = await up.json();
    // model_init_utc looks like "2026-03-25 13:00"
    const raw = (data.model_init_utc || '').trim();
    if (!raw) throw new Error('Empty model_init_utc');

    // Convert "2026-03-25 13:00" → "202603251300"
    const init = raw.replace(/[-: ]/g, '').slice(0, 12);
    if (init.length !== 12) throw new Error(`Bad init string: ${init}`);

    return res.status(200).json({ init, raw, source: 'iem' });

  } catch (e) {
    console.warn('[meta] IEM unavailable, using clock fallback:', e.message);
    return res.status(200).json(clockFallback());
  }
}
