import { NextResponse } from 'next/server';
import { getRedis, getApiKeys, rateLimit } from '@/lib/redis';
import {
  parseAirplanesLive,
  parseADSBLol,
  parseAirLabs,
  parseOpenSky,
  uniqueFlights,
} from '@/lib/flightApi';

const CACHE_TTL = 15;
const FETCH_TIMEOUT = 8000;
const RATE_LIMIT_MAX = 30; // requests per window
const RATE_LIMIT_WINDOW = 60; // seconds

function cacheKey(lat, lon, radius) {
  const rLat = Math.round(lat * 2) / 2;
  const rLon = Math.round(lon * 2) / 2;
  const rRadius = Math.round(radius / 5) * 5;
  return `flights:${rLat}:${rLon}:${rRadius}`;
}

async function fetchWithTimeout(url, ms = FETCH_TIMEOUT, customHeaders = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { 
      signal: controller.signal, 
      redirect: 'error',
      headers: {
        'User-Agent': 'SkyWatch/6.0 (genaidock.com; flight-tracker)',
        'Accept': 'application/json',
        ...customHeaders
      }
    });
  } finally {
    clearTimeout(timer);
  }
}

const OPENSKY_MEM_CACHE = new Map();
const OPENSKY_TTL = 15000; // 15 seconds

async function fetchOpenSkyCached(bbox, fetchUrl, authHeader, lat, lon, radiusKm) {
  const cached = OPENSKY_MEM_CACHE.get(bbox);
  const now = Date.now();
  if (cached && (now - cached.ts < OPENSKY_TTL)) {
    return cached.data;
  }
  try {
    const res = await fetchWithTimeout(fetchUrl, FETCH_TIMEOUT, authHeader);
    if (res.ok) {
      const data = await res.json();
      const parsed = parseOpenSky(data, lat, lon, radiusKm);
      OPENSKY_MEM_CACHE.set(bbox, { ts: now, data: parsed });
      return parsed;
    }
  } catch (e) {
    if (cached) return cached.data;
  }
  return cached ? cached.data : [];
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat'));
  const lon = parseFloat(searchParams.get('lon'));
  const radius = parseInt(searchParams.get('radius'), 10) || 100;

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json({ error: 'Missing or invalid lat/lon' }, { status: 400 });
  }

  // Rate limiting
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rateLimitKey = `ratelimit:flights:${clientIp}`;
  const { allowed, count } = await rateLimit(rateLimitKey, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(RATE_LIMIT_WINDOW), 'X-RateLimit-Remaining': '0' } }
    );
  }

  const redis = getRedis();

  if (redis) {
    const key = cacheKey(lat, lon, radius);
    try {
      const cached = await redis.get(key);
      if (cached) {
        const data = JSON.parse(cached);
        return NextResponse.json({ flights: data.flights, cached: true, age: Math.round((Date.now() - data.ts) / 1000) });
      }
    } catch (e) {
      console.error('Cache read error:', e.message);
    }
  }

  const enabledAPIs = {
    adsblol: searchParams.get('adsblol') !== 'false',
    opensky: searchParams.get('opensky') !== 'false',
    airlabs: searchParams.get('airlabs') === 'true',
  };

  const keys = await getApiKeys();
  const radiusKm = Math.max(10, radius);
  const latF = lat.toFixed(4);
  const lonF = lon.toFixed(4);
  const distNm = Math.max(10, Math.ceil(radiusKm * 1.2 * 0.621371));

  const deg = radiusKm / 111;
  const cosLat = Math.cos(lat * Math.PI / 180);
  const degLon = deg / (cosLat || 1);
  const bbox = `${(lat - deg).toFixed(4)},${(lon - degLon).toFixed(4)},${(lat + deg).toFixed(4)},${(lon + degLon).toFixed(4)}`;

  const fetchers = [];

  if (enabledAPIs.adsblol) {
    fetchers.push(
      fetchWithTimeout(`https://api.adsb.lol/v2/lat/${latF}/lon/${lonF}/dist/${distNm}`)
        .then(r => r.ok ? r.json() : null)
        .then(d => d ? parseADSBLol(d, lat, lon, radiusKm, 'ADS-B.lol') : [])
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

  if (enabledAPIs.opensky) {
    let authHeader = {};
    if (keys.openskyUsername && keys.openskyPassword) {
      authHeader = { 'Authorization': 'Basic ' + Buffer.from(`${keys.openskyUsername}:${keys.openskyPassword}`).toString('base64') };
    }

    const openSkyUrl = `https://opensky-network.org/api/states/all?lamin=${(lat - deg).toFixed(4)}&lomin=${(lon - degLon).toFixed(4)}&lamax=${(lat + deg).toFixed(4)}&lomax=${(lon + degLon).toFixed(4)}`;
    fetchers.push(
      fetchOpenSkyCached(bbox, openSkyUrl, authHeader, lat, lon, radiusKm)
    );
  }

  const results = await Promise.all(fetchers);
  const flights = uniqueFlights(results.flat().filter(Boolean));

  if (redis) {
    const key = cacheKey(lat, lon, radius);
    const cachePayload = { flights, ts: Date.now() };
    redis.setex(key, CACHE_TTL, JSON.stringify(cachePayload)).catch(() => {});
  }

  return NextResponse.json({ flights, cached: false });
}
