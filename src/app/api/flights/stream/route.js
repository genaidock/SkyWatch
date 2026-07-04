import { getRedis } from '@/lib/redis';
import {
  parseAirplanesLive,
  parseADSBLol,
  parseAirLabs,
  uniqueFlights,
} from '@/lib/flightApi';
import { getApiKeys } from '@/lib/redis';

const FETCH_INTERVAL = 15000;
const FETCH_TIMEOUT = 8000;

async function fetchWithTimeout(url, ms = FETCH_TIMEOUT) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { headers: { 'Accept': 'application/json' }, signal: controller.signal, redirect: 'error' });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchFlightsForStream(lat, lon, radius, enabledAPIs = { airplaneslive: true, adsblol: true, airlabs: false }) {
  const radiusKm = Math.max(10, radius);
  const latF = lat.toFixed(4);
  const lonF = lon.toFixed(4);
  const distNm = Math.max(10, Math.ceil(radiusKm * 1.2 * 0.621371));
  const keys = await getApiKeys();

  const deg = radiusKm / 111;
  const cosLat = Math.cos(lat * Math.PI / 180);
  const degLon = deg / (cosLat || 1);
  const bbox = `${(lat - deg).toFixed(4)},${(lon - degLon).toFixed(4)},${(lat + deg).toFixed(4)},${(lon + degLon).toFixed(4)}`;

  const fetchers = [];

  if (enabledAPIs.airplaneslive) {
    fetchers.push(
      fetchWithTimeout(`https://api.airplanes.live/v2/point/${latF}/${lonF}/${Math.ceil(radiusKm)}`)
        .then(r => r.ok ? r.json() : null)
        .then(d => d ? parseAirplanesLive(d, lat, lon, radiusKm) : [])
        .catch(() => [])
    );
  }

  if (enabledAPIs.adsblol) {
    fetchers.push(
      fetchWithTimeout(`https://api.adsb.lol/v2/lat/${latF}/lon/${lonF}/dist/${distNm}`)
        .then(r => r.ok ? r.json() : null)
        .then(d => d ? parseADSBLol(d, lat, lon, radiusKm) : [])
        .catch(() => [])
    );
  }

  if (enabledAPIs.airlabs && keys.airLabs) {
    fetchers.push(
      fetchWithTimeout(`https://airlabs.co/api/v9/flights?api_key=${encodeURIComponent(keys.airLabs)}&bbox=${bbox}`)
        .then(r => r.ok ? r.json() : null)
        .then(d => d ? parseAirLabs(d, lat, lon, radiusKm) : [])
        .catch((e) => { console.error("AirLabs error:", e); return []; })
    );
  }

  const results = await Promise.all(fetchers);
  const flights = uniqueFlights(results.flat().filter(Boolean));

  return flights;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat'));
  const lon = parseFloat(searchParams.get('lon'));
  const radius = parseInt(searchParams.get('radius'), 10) || 100;

  const enabledAPIs = {
    airplaneslive: searchParams.get('airplaneslive') !== 'false',
    adsblol: searchParams.get('adsblol') !== 'false',
    airlabs: searchParams.get('airlabs') === 'true',
  };

  if (isNaN(lat) || isNaN(lon)) {
    return new Response('Missing lat/lon', { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let interval;

      const sendFlights = async () => {
        if (request.signal.aborted) return;
        try {
          const flights = await fetchFlightsForStream(lat, lon, radius, enabledAPIs);
          if (request.signal.aborted) return;
          const payload = JSON.stringify({ flights, timestamp: Date.now() });
          controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        } catch (e) {
          if (!request.signal.aborted) {
            controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ message: e.message })}\n\n`));
          }
        }
      };

      // Push initial data immediately
      await sendFlights();
      interval = setInterval(sendFlights, FETCH_INTERVAL);

      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
