import { NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';

const CACHE_TTL = 7 * 24 * 60 * 60; // 7 days in seconds
const FETCH_TIMEOUT = 5000;

async function fetchWithTimeout(url, ms = FETCH_TIMEOUT) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { headers: { 'Accept': 'application/json' }, signal: controller.signal, redirect: 'error' });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchRouteExternal(callsign) {
  try {
    // 1. Try adsbdb.com
    const adsUrl = `https://api.adsbdb.com/v0/callsign/${encodeURIComponent(callsign)}`;
    const adsRes = await fetchWithTimeout(adsUrl, 4000);
    
    if (adsRes.ok) {
      const data = await adsRes.json();
      if (data.response && data.response.flightroute) {
        const route = data.response.flightroute;
        return {
          dep: route.origin?.iata_code || route.origin?.icao_code || '',
          depName: (route.origin?.municipality && route.origin?.name) ? `${route.origin.municipality} - ${route.origin.name}` : (route.origin?.name || route.origin?.municipality || ''),
          depLat: route.origin?.latitude || null,
          depLon: route.origin?.longitude || null,
          arr: route.destination?.iata_code || route.destination?.icao_code || '',
          arrName: (route.destination?.municipality && route.destination?.name) ? `${route.destination.municipality} - ${route.destination.name}` : (route.destination?.name || route.destination?.municipality || ''),
          arrLat: route.destination?.latitude || null,
          arrLon: route.destination?.longitude || null,
          airline: route.airline || null,
        };
      }
    }
  } catch(e) {
    console.error(`Error fetching route for ${callsign} from adsbdb:`, e.message);
  }
  
  // Return empty route if all fails to prevent immediate re-fetching
  return { dep: '', arr: '' };
}

export async function POST(request) {
  try {
    const { callsigns } = await request.json();
    if (!Array.isArray(callsigns) || callsigns.length === 0) {
      return NextResponse.json({ routes: {} });
    }

    // Deduplicate
    const unique = [...new Set(callsigns.map(c => c.trim().replace(/\s/g, '')))].filter(Boolean);
    const redis = getRedis();
    const results = {};
    const toFetch = [];

    if (redis) {
      // Fetch all from redis
      const keys = unique.map(c => `route:${c}`);
      const cachedData = await redis.mget(...keys);
      
      unique.forEach((callsign, index) => {
        if (cachedData[index]) {
          try {
            const parsed = typeof cachedData[index] === 'string' ? JSON.parse(cachedData[index]) : cachedData[index];
            results[callsign] = parsed;
          } catch(e) {}
        }
        if (!results[callsign]) {
          toFetch.push(callsign);
        }
      });
    } else {
      toFetch.push(...unique);
    }

    // Process those not in cache
    // To avoid hitting rate limits hard, we'll only fetch up to 5 at a time
    const limitedFetch = toFetch.slice(0, 5);
    
    // Fetch them concurrently
    const fetchedRoutes = await Promise.all(limitedFetch.map(async (callsign) => {
      const route = await fetchRouteExternal(callsign);
      
      // Fallback for suffixed callsigns
      if (!route.dep && !route.arr) {
        const match = callsign.match(/^([A-Z]{3})(\d{1,4})[A-Z]+$/);
        if (match) {
          const baseCallsign = match[1] + match[2];
          const fallbackRoute = await fetchRouteExternal(baseCallsign);
          if (fallbackRoute.dep || fallbackRoute.arr) {
             return { callsign, route: fallbackRoute };
          }
        }
      }
      return { callsign, route };
    }));

    // Cache the successful fetches (even empty ones to negative cache them)
    if (redis && fetchedRoutes.length > 0) {
      const pipeline = redis.pipeline();
      fetchedRoutes.forEach(({ callsign, route }) => {
        results[callsign] = route;
        pipeline.setex(`route:${callsign}`, CACHE_TTL, JSON.stringify(route));
      });
      await pipeline.exec();
    } else {
      fetchedRoutes.forEach(({ callsign, route }) => {
        results[callsign] = route;
      });
    }

    return NextResponse.json({ routes: results });

  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
