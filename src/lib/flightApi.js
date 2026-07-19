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

        const altFt = s.alt_baro === 'ground' ? 0 : (s.alt_baro || s.alt_geom || 0);
        return {
          id: s.hex || s.flight?.trim() || `alv-${Math.round(s.lat*100)}-${Math.round(s.lon*100)}`,
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
          onGround: s.alt_baro === 'ground' || (altFt < 500 && (s.gs || 0) < 40),
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

        const altFt = s.alt_baro === 'ground' ? 0 : (s.alt_baro || s.alt_geom || 0);
        return {
          id: s.hex || s.flight?.trim() || s.r || `al-${Math.round(s.lat*100)}-${Math.round(s.lon*100)}`,
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
          onGround: s.alt_baro === 'ground' || (altFt < 500 && (s.gs || 0) < 40),
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

export function parseOpenSky(data, userLat, userLon, radiusKm) {
  try {
    const states = data.states || [];
    return states
      .filter(s => s[6] != null && s[5] != null)
      .map(s => {
        const lat = s[6];
        const lon = s[5];
        const dist = haversine(userLat, userLon, lat, lon);
        if (dist > radiusKm) return null;

        const altM = s[7] || s[13] || 0;
        const altFt = altM * 3.28084;
        const velocity = s[9] || 0;
        const speedKnots = velocity * 1.94384;
        const vertRate = s[11] || 0;
        const vertRateFtMin = vertRate * 196.85;

        return {
          id: s[0] || s[1]?.trim() || `os-${Math.round(lat*100)}-${Math.round(lon*100)}`,
          callsign: (s[1] || '').trim() || s[0]?.toUpperCase() || '?',
          icao24: s[0]?.toUpperCase() || '',
          country: s[2] || '—',
          reg: '—', // OpenSky doesn't provide registration directly in states
          lat,
          lon,
          altitude: Math.round(altFt),
          altM: Math.round(altM),
          speed: Math.round(speedKnots),
          heading: Math.round(s[10] || 0),
          vertRate: Math.round(vertRateFtMin),
          onGround: !!s[8],
          squawk: s[14] || '—',
          type: '—',
          distKm: dist,
          from: { code: '—', city: '—' },
          to: { code: '—', city: '—' },
          progress: 0.5,
          firstSeen: new Date(s[4] ? s[4] * 1000 : Date.now()),
          source: 'OpenSky',
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.distKm - b.distKm);
  } catch (e) {
    console.warn('parseOpenSky error:', e);
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
  return Array.from(map.values()).map(f => {
    let category = null;
    const desc = (f.desc || '').toLowerCase();
    const type = (f.type || '').toUpperCase();
    const callsign = (f.callsign || '').toUpperCase();
    
    // Cargo planes (FedEx, UPS, Atlas Air, Polar, ABX, Omni, Kalitta, Cargolux, Southern Air, Nippon Cargo, Polar Air)
    if (/freighter|cargo/.test(desc) || /^(FDX|UPS|GTI|PAC|ABX|OAE|CKS|CLX|SOO|NCA|PO)/.test(callsign)) {
      category = 'cargo';
    } 
    // Military planes
    else if (/military|air force|navy|army|coast guard|nato/.test(desc) || /^(F16|F35|C17$|C17A|C130|EUFI|B52|E3TF|KC13)/.test(type) || /^(RCH|RFR|CNV)/.test(callsign)) {
      category = 'military';
    } 
    // Private jets
    else if (/gulfstream|challenger|citation|falcon|learjet|legacy/.test(desc) || /^(GLF|C56|CL3|F2TH|E55|E50|H25B|FA7X|FA8X)/.test(type)) {
      category = 'private';
    }
    
    f.category = category;
    return f;
  }).sort((a, b) => a.distKm - b.distKm);
}

export function generateDemoFlights(baseLat, baseLon, radius) {
  const demos = [
    { cs: 'AI101', from: 'BOM', to: 'DEL', alt: 35000, spd: 480, hdg: 350, type: 'A320', cat: 'civil' },
    { cs: 'FDX123', from: 'MEM', to: 'DXB', alt: 32000, spd: 450, hdg: 120, type: 'B77W', cat: 'cargo' },
    { cs: 'RCH11', from: 'RMS', to: 'ADW', alt: 28000, spd: 420, hdg: 200, type: 'C17', cat: 'military' },
    { cs: 'GLF5', from: 'TEB', to: 'VNY', alt: 41000, spd: 490, hdg: 270, type: 'GLF', cat: 'private' },
  ];

  return demos.map((d, i) => {
    const angle = (i / demos.length) * Math.PI * 2;
    const dist = 30 + i * 15;
    const lat = baseLat + (dist / 111) * Math.cos(angle);
    const lon = baseLon + (dist / 111) * Math.sin(angle) / Math.cos((baseLat * Math.PI) / 180);

    return {
      id: 'demo' + i,
      callsign: d.cs,
      icao24: 'DEMO' + i,
      country: 'Demo',
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
      category: d.cat,
      distKm: dist,
      from: { code: d.from, city: d.from },
      to: { code: d.to, city: d.to },
      routeObj: null,
      airlineObj: null,
      progress: 0.5,
      firstSeen: new Date(),
      isDemo: true,
    };
  });
}

// Enrich routes using our new server-side endpoint
export async function enrichRoutes(flights) {
  const toFetch = flights.filter(
    f =>
      (f.from?.code === '—' || f.to?.code === '—') &&
      f.callsign &&
      f.callsign !== '?'
  );

  if (toFetch.length === 0) return flights;

  const callsigns = Array.from(new Set(toFetch.map(f => f.callsign)));
  
  try {
    const res = await fetch('/api/routes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callsigns })
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data.routes) {
        Object.keys(data.routes).forEach(cs => {
          const route = data.routes[cs];
          if (route) {
            ROUTE_CACHE[cs] = {
              dep: route.dep || '',
              depName: route.depName || route.dep || '',
              depLat: route.depLat || null,
              depLon: route.depLon || null,
              arr: route.arr || '',
              arrName: route.arrName || route.arr || '',
              arrLat: route.arrLat || null,
              arrLon: route.arrLon || null,
              airline: route.airline || null,
              ts: Date.now(),
            };
          }
        });
      }
    }
  } catch (e) {
    console.error('Error batch fetching routes:', e);
  }

  return applyRouteCache(flights);
}

function applyRouteCache(flights) {
  return flights.map(f => {
    const cached = ROUTE_CACHE[f.callsign];
    if (cached) {
      const updated = { ...f };
      if (cached.dep) {
        updated.from = { code: cached.dep, city: cached.depName };
      }
      if (cached.arr) {
        updated.to = { code: cached.arr, city: cached.arrName };
      }
      updated.routeObj = {
        depLat: cached.depLat,
        depLon: cached.depLon,
        arrLat: cached.arrLat,
        arrLon: cached.arrLon,
      };
      updated.airlineObj = cached.airline || null;
      return updated;
    }
    return f;
  });
}

function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

export async function fetchAircraftDetails(icao24) {
  if (!icao24) return null;
  try {
    const targetUrl = `https://api.adsbdb.com/v0/aircraft/${icao24}`;
    const url = `/api/proxy?url=${encodeURIComponent(targetUrl)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.response?.aircraft || null;
  } catch (e) {
    return null;
  }
}

export async function fetchAirlineDetails(icao) {
  if (!icao) return null;
  try {
    const targetUrl = `https://api.adsbdb.com/v0/airline/${icao}`;
    const url = `/api/proxy?url=${encodeURIComponent(targetUrl)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data.response) ? data.response[0] : null;
  } catch (e) {
    return null;
  }
}
