// Flight data fetching logic for different APIs
import { haversine, getNearbyAirports, getAirportName } from './utils';

const ROUTE_CACHE = {};
const ROUTE_PROMISES = {};
const ROUTE_TTL = 10 * 60 * 1000; // 10 minutes
let RATE_LIMITED_UNTIL = 0;

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal, redirect: 'error' });
  } finally {
    clearTimeout(id);
  }
}

// Parse responses from different flight data APIs
export function parseAirplanesLive(data, userLat, userLon, radiusKm) {
  try {
    const ac = data.ac || data.aircraft || [];
    if (!Array.isArray(ac)) return [];

    return ac
      .filter(s => s.lat != null && s.lon != null)
      .map(s => {
        const dist = haversine(userLat, userLon, s.lat, s.lon);
        if (dist > radiusKm) return null;

        const altFt = s.alt_baro || s.alt_geom || 0;
        return {
          id: s.hex || 'alv' + Math.random(),
          callsign: (s.flight || '').trim() || s.hex?.toUpperCase() || '?',
          icao24: s.hex?.toUpperCase() || '',
          country: s.flag || '—',
          reg: s.r || '—',
          lat: s.lat,
          lon: s.lon,
          altitude: Math.round(altFt),
          altM: Math.round(altFt * 0.3048),
          speed: Math.round(s.gs || 0),
          heading: Math.round(s.track || 0),
          vertRate: Math.round(s.baro_rate || s.geom_rate || 0),
          onGround: s.alt_baro === 'ground' || (s.gs || 0) < 30,
          squawk: s.squawk || '—',
          type: s.t || '—',
          desc: s.desc || '',
          distKm: dist,
          from: { code: '—', city: '—' },
          to: { code: '—', city: '—' },
          progress: 0.5,
          firstSeen: new Date(),
          source: 'Airplanes.live',
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.distKm - b.distKm);
  } catch (e) {
    console.warn('parseAirplanesLive error:', e);
    return [];
  }
}

export function parseADSBLol(data, userLat, userLon, radiusKm) {
  try {
    const ac = data.ac || data.aircraft || [];
    if (!Array.isArray(ac)) return [];

    return ac
      .filter(s => s.lat != null && s.lon != null)
      .map(s => {
        const dist = haversine(userLat, userLon, s.lat, s.lon);
        if (dist > radiusKm) return null;

        const altFt = s.alt_baro || s.alt_geom || 0;
        return {
          id: s.hex || 'al' + Math.random(),
          callsign: (s.flight || '').trim() || s.r || s.hex?.toUpperCase() || '?',
          icao24: s.hex?.toUpperCase() || '',
          country: s.r ? 'Encoded' : '—',
          reg: s.r || '—',
          lat: s.lat,
          lon: s.lon,
          altitude: Math.round(altFt),
          altM: Math.round(altFt * 0.3048),
          speed: Math.round(s.gs || 0),
          heading: Math.round(s.track || 0),
          vertRate: Math.round(s.baro_rate || s.geom_rate || 0),
          onGround: s.alt_baro === 'ground' || (s.gs || 0) < 30,
          squawk: s.squawk || '—',
          type: s.t || '—',
          desc: s.desc || '',
          distKm: dist,
          from: { code: '—', city: '—' },
          to: { code: '—', city: '—' },
          progress: 0.5,
          firstSeen: new Date(),
          source: 'ADS-B.lol',
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.distKm - b.distKm);
  } catch (e) {
    console.warn('parseADSBLol error:', e);
    return [];
  }
}

export function parseAirLabs(data, userLat, userLon, radiusKm) {
  try {
    const flights = Array.isArray(data.response) ? data.response : Array.isArray(data.data) ? data.data : [];
    return flights
      .filter(f => f.latitude != null && f.longitude != null)
      .map(f => {
        const lat = Number(f.latitude);
        const lon = Number(f.longitude);
        const dist = haversine(userLat, userLon, lat, lon);
        if (dist > radiusKm) return null;

        const altFt = Number(f.altitude || 0);

        return {
          id: f.hex || f.flight_icao || f.flight_iata || `${lat.toFixed(4)}-${lon.toFixed(4)}`,
          callsign: (f.flight_icao || f.flight_iata || f.callsign || '').trim() || '?',
          icao24: f.hex?.toUpperCase() || '',
          country: f.airline_name || '—',
          reg: f.registration || '—',
          lat,
          lon,
          altitude: Math.round(altFt),
          altM: Math.round(altFt * 0.3048),
          speed: Math.round(Number(f.speed || 0)),
          heading: Math.round(Number(f.heading || 0)),
          vertRate: Math.round(Number(f.vertical_rate || 0)),
          onGround: !!f.on_ground,
          squawk: f.squawk || '—',
          type: f.aircraft_icao || f.aircraft_iata || '—',
          distKm: dist,
          from: { code: f.departure_iata || '—', city: f.departure_airport || '—' },
          to: { code: f.arrival_iata || '—', city: f.arrival_airport || '—' },
          progress: 0.5,
          firstSeen: new Date(f.updated || Date.now()),
          source: 'AirLabs',
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.distKm - b.distKm);
  } catch (e) {
    console.warn('parseAirLabs error:', e);
    return [];
  }
}

// Main fetch function - call this from your component
export async function fetchFlights(userLat, userLon, radiusKm = 100, enabledAPIs = {}, apiKeys = {}) {
  if (!userLat || !userLon) return [];

  // Try the server-side cached endpoint first
  try {
    const params = new URLSearchParams({
      lat: userLat.toFixed(4),
      lon: userLon.toFixed(4),
      radius: String(Math.max(10, Math.ceil(radiusKm))),
    });
    for (const [key, val] of Object.entries(enabledAPIs)) {
      params.set(key, String(!!val));
    }
    const res = await fetchWithTimeout(`/api/flights?${params}`, 12000);
    if (res.ok) {
      const data = await res.json();
      if (data.flights && data.flights.length > 0) {
        return data.flights;
      }
    }
  } catch (e) {
    // fall through to legacy approach
  }

  // Legacy fallback: fetch via proxy
  const sources = [];
  const latF = (+userLat).toFixed(4);
  const lonF = (+userLon).toFixed(4);
  const distNm = Math.max(10, Math.ceil(radiusKm * 1.2 * 0.621371));
  const proxied = (target) => `/api/proxy?url=${encodeURIComponent(target)}`;

  const deg = radiusKm / 111;
  const cosLat = Math.cos(userLat * Math.PI / 180);
  const degLon = deg / (cosLat || 1);
  const bbox = `${(userLat - deg).toFixed(4)},${(userLon - degLon).toFixed(4)},${(userLat + deg).toFixed(4)},${(userLon + degLon).toFixed(4)}`;

  // Source 1: Airplanes.live (free, no key needed)
  if (enabledAPIs.airplaneslive !== false) {
    sources.push({
      name: 'Airplanes.live',
      url: proxied(`https://api.airplanes.live/v2/point/${latF}/${lonF}/${Math.ceil(radiusKm)}`),
      parser: (data) => parseAirplanesLive(data, userLat, userLon, radiusKm),
    });
  }

  // Source 2: ADS-B.lol (free)
  if (enabledAPIs.adsblol !== false) {
    sources.push({
      name: 'ADS-B.lol',
      url: proxied(`https://api.adsb.lol/v2/lat/${latF}/lon/${lonF}/dist/${distNm}`),
      parser: (data) => parseADSBLol(data, userLat, userLon, radiusKm),
    });
  }

  // Source 4: AirLabs (key injected server-side by proxy)
  if (enabledAPIs.airlabs !== false) {
    sources.push({
      name: 'AirLabs',
      url: proxied(`https://airlabs.co/api/v9/flights?bbox=${bbox}`),
      parser: (data) => parseAirLabs(data, userLat, userLon, radiusKm),
    });
  }

  const sourceResults = await Promise.allSettled(
    sources.map(async (source) => {
      try {
        const response = await fetchWithTimeout(source.url, 5000);
        if (!response.ok) throw new Error(`${response.status}`);

        const data = await response.json();
        return source.parser(data).map((flight) => ({ ...flight, source: flight.source || source.name }));
      } catch (error) {
        console.warn(`${source.name} fetch failed:`, error);
        return [];
      }
    })
  );

  const flights = sourceResults
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value)
    .filter(Boolean);

  if (flights.length > 0) {
    return uniqueFlights(flights);
  }

  // Fallback: return demo flights
  return generateDemoFlights(userLat, userLon, radiusKm);
}

export function uniqueFlights(flights) {
  const map = new Map();
  flights.forEach((flight) => {
    const key = flight.icao24 || flight.callsign || flight.id;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, flight);
      return;
    }

    // keep the most complete data
    const merged = {
      ...existing,
      ...flight,
      from: flight.from?.code !== '—' ? flight.from : existing.from,
      to: flight.to?.code !== '—' ? flight.to : existing.to,
      source: existing.source || flight.source,
    };
    map.set(key, merged);
  });
  return Array.from(map.values()).sort((a, b) => a.distKm - b.distKm);
}

export function generateDemoFlights(baseLat, baseLon, radius) {
  const demos = [
    { cs: 'AI101', from: 'BOM', to: 'DEL', alt: 35000, spd: 480, hdg: 350, type: 'A320' },
    { cs: '6E202', from: 'PNQ', to: 'BLR', alt: 28000, spd: 420, hdg: 165, type: 'A321' },
    { cs: 'UK303', from: 'BOM', to: 'HYD', alt: 31000, spd: 450, hdg: 120, type: 'B738' },
  ];

  return demos.map((d, i) => {
    const angle = (i / demos.length) * Math.PI * 2;
    const dist = 30 + i * 12;
    const lat = baseLat + (dist / 111) * Math.cos(angle);
    const lon = baseLon + (dist / 111) * Math.sin(angle) / Math.cos((baseLat * Math.PI) / 180);

    return {
      id: 'demo' + i,
      callsign: d.cs,
      icao24: 'DEMO' + i,
      country: 'India',
      reg: 'VT-DEMO',
      lat,
      lon,
      altitude: d.alt,
      altM: Math.round(d.alt * 0.3048),
      speed: d.spd,
      heading: d.hdg,
      vertRate: 0,
      onGround: false,
      squawk: '2000',
      type: d.type,
      distKm: dist,
      from: { code: d.from, city: d.from },
      to: { code: d.to, city: d.to },
      progress: 0.5,
      firstSeen: new Date(),
      isDemo: true,
    };
  });
}

// Enrich routes using adsbdb.com API
export async function enrichRoutes(flights) {
  const toFetch = flights.filter(
    f =>
      (f.from?.code === '—' || f.to?.code === '—') &&
      f.callsign &&
      f.callsign !== '?'
  );

  // If we're currently rate-limited, skip external calls
  if (Date.now() < RATE_LIMITED_UNTIL) {
    return applyRouteCache(flights);
  }

  // Deduplicate callsigns and limit to 8 per run
  const unique = Array.from(new Set(toFetch.map(f => f.callsign))).slice(0, 8);

  // Sequentially fetch to avoid bursts
  for (const cs of unique) {
    const key = cs.replace(/\s/g, '');
    // Skip if cached and fresh
    const cached = ROUTE_CACHE[cs];
    if (cached && Date.now() - cached.ts < ROUTE_TTL) continue;

    // If there's an in-flight promise, await it
    if (ROUTE_PROMISES[cs]) {
      try { await ROUTE_PROMISES[cs]; } catch (e) { /* ignore */ }
      continue;
    }

    // Create promise and store to dedupe concurrent attempts
    ROUTE_PROMISES[cs] = (async () => {
      try {
        const targetUrl = `https://api.adsbdb.com/v0/callsign/${encodeURIComponent(key)}`;
        const url = `/api/proxy?url=${encodeURIComponent(targetUrl)}`;
        const response = await fetchWithTimeout(url, 5000);

        if (!response.ok) {
          if (response.status === 429) {
            // Back off for 60 seconds on rate limit
            RATE_LIMITED_UNTIL = Date.now() + 60_000;
          }
          // store a short negative cache to avoid immediate retries
          ROUTE_CACHE[cs] = { dep: '', arr: '', ts: Date.now() };
          return;
        }

        const data = await response.json();
        const route = data.response?.flightroute;
        if (!route) {
          ROUTE_CACHE[cs] = { dep: '', arr: '', ts: Date.now() };
          return;
        }

        ROUTE_CACHE[cs] = {
          dep: route.origin?.iata_code || route.origin?.icao_code || '',
          depName: route.origin?.municipality || route.origin?.name || '',
          arr: route.destination?.iata_code || route.destination?.icao_code || '',
          arrName: route.destination?.municipality || route.destination?.name || '',
          ts: Date.now(),
        };
      } catch (e) {
        // on network error, set a short negative cache
        ROUTE_CACHE[cs] = { dep: '', arr: '', ts: Date.now() };
      } finally {
        // small pause between requests to reduce burstiness
        await sleep(150);
        delete ROUTE_PROMISES[cs];
      }
    })();

    try {
      await ROUTE_PROMISES[cs];
    } catch (e) {
      // ignore per-call errors
    }

    // If rate-limited, stop issuing more requests
    if (Date.now() < RATE_LIMITED_UNTIL) break;
  }

  return applyRouteCache(flights);
}

function applyRouteCache(flights) {
  return flights.map(f => {
    const cached = ROUTE_CACHE[f.callsign];
    if (cached && Date.now() - cached.ts < ROUTE_TTL) {
      return {
        ...f,
        from: cached.dep ? { code: cached.dep, city: cached.depName || getAirportName(cached.dep) || cached.dep } : f.from,
        to: cached.arr ? { code: cached.arr, city: cached.arrName || getAirportName(cached.arr) || cached.arr } : f.to,
      };
    }
    return f;
  });
}

function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}
