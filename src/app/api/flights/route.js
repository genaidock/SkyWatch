import { NextResponse } from 'next/server';
import { getRedis, getApiKeys } from '@/lib/redis';
import {
  parseAirplanesLive,
  parseADSBLol,
  parseAirLabs,
  uniqueFlights,
} from '@/lib/flightApi';

const CACHE_TTL = 15;
const FETCH_TIMEOUT = 8000;

function cacheKey(lat, lon, radius) {
  const rLat = Math.round(lat * 2) / 2;
  const rLon = Math.round(lon * 2) / 2;
  const rRadius = Math.round(radius / 5) * 5;
  return `flights:${rLat}:${rLon}:${rRadius}`;
}

async function fetchWithTimeout(url, ms = FETCH_TIMEOUT) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { headers: { 'Accept': 'application/json' }, signal: controller.signal, redirect: 'error' });
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat'));
  const lon = parseFloat(searchParams.get('lon'));
  const radius = parseInt(searchParams.get('radius'), 10) || 100;

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json({ error: 'Missing or invalid lat/lon' }, { status: 400 });
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
    airplaneslive: searchParams.get('airplaneslive') !== 'false',
    adsblol: searchParams.get('adsblol') !== 'false',
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

  if (redis) {
    const key = cacheKey(lat, lon, radius);
    const cachePayload = { flights, ts: Date.now() };
    redis.setex(key, CACHE_TTL, JSON.stringify(cachePayload)).catch(() => {});
  }

  return NextResponse.json({ flights, cached: false });
}
