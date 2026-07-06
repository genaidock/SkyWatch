// Math and conversion utilities
export function degreesToRadians(d) {
  return (d * Math.PI) / 180;
}

export function radiansToDegrees(r) {
  return (r * 180) / Math.PI;
}

export function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(degreesToRadians(lat1)) *
      Math.cos(degreesToRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function bearing(lat1, lon1, lat2, lon2) {
  const dLon = degreesToRadians(lon2 - lon1);
  const y =
    Math.sin(dLon) * Math.cos(degreesToRadians(lat2));
  const x =
    Math.cos(degreesToRadians(lat1)) * Math.sin(degreesToRadians(lat2)) -
    Math.sin(degreesToRadians(lat1)) *
      Math.cos(degreesToRadians(lat2)) *
      Math.cos(dLon);
  return (radiansToDegrees(Math.atan2(y, x)) + 360) % 360;
}

export function headingToDirection(h) {
  const directions = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
  ];
  return directions[Math.round(h / 22.5) % 16];
}

export function getCurrentTime() {
  const now = new Date();
  return (
    now.getHours().toString().padStart(2, '0') +
    ':' +
    now.getMinutes().toString().padStart(2, '0') +
    ':' +
    now.getSeconds().toString().padStart(2, '0')
  );
}

export function flagToCountry(reg) {
  if (!reg) return '—';
  const r = reg.toUpperCase();
  
  const countryMap = {
    'VT': 'India',
    'N': 'USA',
    'G-': 'UK',
    'D-': 'Germany',
    'F-': 'France',
    'OE-': 'Austria',
    'HB-': 'Switzerland',
    'PH-': 'Netherlands',
    'OO-': 'Belgium',
    'EC-': 'Spain',
    'CS-': 'Portugal',
    'EI-': 'Ireland',
    'SE-': 'Sweden',
    'LN-': 'Norway',
    'OH-': 'Finland',
    'OY-': 'Denmark',
    'SP-': 'Poland',
    'OK-': 'Czech Republic',
    'HA-': 'Hungary',
    'YR-': 'Romania',
    'LZ-': 'Bulgaria',
    'SU-': 'Egypt',
    'A6-': 'UAE',
    'A9C-': 'Bahrain',
    'HZ-': 'Saudi Arabia',
    '4R-': 'Sri Lanka',
    'S2-': 'Bangladesh',
    'AP-': 'Pakistan',
    'EP-': 'Iran',
    '9V-': 'Singapore',
    '9M-': 'Malaysia',
    'HS-': 'Thailand',
    'VH-': 'Australia',
    'JA': 'Japan',
    'B-': 'China/Taiwan',
    'HL-': 'South Korea',
    'PK-': 'Indonesia',
    'RP-': 'Philippines',
  };

  for (const [prefix, country] of Object.entries(countryMap)) {
    if (r.startsWith(prefix)) return country;
  }

  return '—';
}

export const SQUAWK_MEANINGS = {
  '7500': '⚠️ Hijacking in progress',
  '7600': '📡 Radio comm failure',
  '7700': '🆘 General emergency',
  '2000': 'IFR en-route',
  '1200': 'VFR flight',
};

export const AIRCRAFT_DB = {
  'A319': { maker: 'Airbus', full: 'Airbus A319-100', engines: '2× CFM56', cat: 'Narrow Body', pax: 156, icon: '🛫', range: '6,850 km' },
  'A320': { maker: 'Airbus', full: 'Airbus A320-200', engines: '2× CFM56-5', cat: 'Narrow Body', pax: 180, icon: '🛫', range: '6,150 km' },
  'A321': { maker: 'Airbus', full: 'Airbus A321neo', engines: '2× CFM LEAP-1A', cat: 'Narrow Body', pax: 220, icon: '🛫', range: '7,400 km' },
  'A330': { maker: 'Airbus', full: 'Airbus A330-300', engines: '2× RR Trent 700', cat: 'Wide Body', pax: 335, icon: '✈️', range: '11,750 km' },
  'A350': { maker: 'Airbus', full: 'Airbus A350-900', engines: '2× RR Trent XWB', cat: 'Wide Body', pax: 369, icon: '✈️', range: '15,000 km' },
  'A380': { maker: 'Airbus', full: 'Airbus A380-800', engines: '4× RR Trent 970', cat: 'Super Jumbo', pax: 853, icon: '🛩️', range: '15,200 km' },
  'B737': { maker: 'Boeing', full: 'Boeing 737-800', engines: '2× CFM56-7', cat: 'Narrow Body', pax: 162, icon: '🛫', range: '5,765 km' },
  'B738': { maker: 'Boeing', full: 'Boeing 737 MAX 8', engines: '2× CFM LEAP-1B', cat: 'Narrow Body', pax: 178, icon: '🛫', range: '6,570 km' },
  'B77W': { maker: 'Boeing', full: 'Boeing 777-300ER', engines: '2× GE90-115B', cat: 'Wide Body', pax: 396, icon: '✈️', range: '13,650 km' },
  'B788': { maker: 'Boeing', full: 'Boeing 787-8 Dreamliner', engines: '2× GEnx-1B', cat: 'Wide Body', pax: 242, icon: '✈️', range: '13,621 km' },
  'B789': { maker: 'Boeing', full: 'Boeing 787-9 Dreamliner', engines: '2× RR Trent 1000', cat: 'Wide Body', pax: 296, icon: '✈️', range: '14,140 km' },
  'AT76': { maker: 'ATR', full: 'ATR 72-600', engines: '2× PW127M Turboprop', cat: 'Turboprop', pax: 70, icon: '🛩️', range: '1,528 km' },
  'E190': { maker: 'Embraer', full: 'Embraer E190', engines: '2× GE CF34-10E', cat: 'Regional Jet', pax: 114, icon: '🛫', range: '4,537 km' },
};

export function getAircraftInfo(type) {
  if (!type) return { maker: '—', full: 'Unknown Aircraft', engines: '—', cat: '—', pax: '—', icon: '✈️', range: '—' };
  const key = type.toUpperCase().substring(0, 4);
  return AIRCRAFT_DB[key] || { maker: '—', full: type, engines: '—', cat: 'Aircraft', pax: '—', icon: '✈️', range: '—' };
}

export const INDIA_AIRPORTS = [
  { code: 'DEL', name: 'Delhi Intl', lat: 28.5561, lon: 77.1000 },
  { code: 'BOM', name: 'Mumbai Intl', lat: 19.0887, lon: 72.8679 },
  { code: 'BLR', name: 'Bengaluru', lat: 13.1986, lon: 77.7066 },
  { code: 'MAA', name: 'Chennai Intl', lat: 12.9941, lon: 80.1709 },
  { code: 'HYD', name: 'Hyderabad', lat: 17.2313, lon: 78.4298 },
  { code: 'CCU', name: 'Kolkata Intl', lat: 22.6546, lon: 88.4467 },
  { code: 'PNQ', name: 'Pune Airport', lat: 18.5822, lon: 73.9197 },
  { code: 'GOI', name: 'Goa Dabolim', lat: 15.3808, lon: 73.8314 },
  { code: 'COK', name: 'Kochi Intl', lat: 10.1518, lon: 76.3926 },
  { code: 'AMD', name: 'Ahmedabad', lat: 23.0722, lon: 72.6346 },
  // Additional Maharashtra Airports
  { code: 'NAG', name: 'Nagpur', lat: 21.0922, lon: 79.0472 },
  { code: 'ISK', name: 'Nashik', lat: 20.1192, lon: 73.9125 },
  { code: 'IXU', name: 'Aurangabad', lat: 19.8632, lon: 75.3981 },
  { code: 'SAG', name: 'Shirdi', lat: 19.6865, lon: 74.3794 },
  { code: 'KLH', name: 'Kolhapur', lat: 16.6669, lon: 74.2881 },
  { code: 'JLQ', name: 'Jalgaon', lat: 20.9639, lon: 75.5269 },
  { code: 'NDC', name: 'Nanded', lat: 19.1824, lon: 77.3188 },
  // Other Major Indian Airports
  { code: 'TRV', name: 'Thiruvananthapuram', lat: 8.4821, lon: 76.9201 },
  { code: 'LKO', name: 'Lucknow', lat: 26.7606, lon: 80.8893 },
  { code: 'JAI', name: 'Jaipur', lat: 26.8242, lon: 75.8122 },
  { code: 'CNN', name: 'Kannur', lat: 11.9163, lon: 75.5463 },
  { code: 'SXR', name: 'Srinagar', lat: 33.9986, lon: 74.7743 },
  { code: 'BBI', name: 'Bhubaneswar', lat: 20.2444, lon: 85.8178 },
];

export const GLOBAL_AIRPORTS = [
  // North America
  { code: 'JFK', name: 'New York JFK', lat: 40.6413, lon: -73.7781 },
  { code: 'LAX', name: 'Los Angeles Intl', lat: 33.9416, lon: -118.4085 },
  { code: 'ORD', name: 'Chicago O\'Hare', lat: 41.9742, lon: -87.9073 },
  { code: 'ATL', name: 'Atlanta Hartsfield', lat: 33.6407, lon: -84.4277 },
  { code: 'DFW', name: 'Dallas/Fort Worth', lat: 32.8998, lon: -97.0403 },
  { code: 'SFO', name: 'San Francisco Intl', lat: 37.6213, lon: -122.3790 },
  { code: 'YYZ', name: 'Toronto Pearson', lat: 43.6777, lon: -79.6248 },
  { code: 'YVR', name: 'Vancouver Intl', lat: 49.1967, lon: -123.1815 },
  { code: 'MEX', name: 'Mexico City Intl', lat: 19.4361, lon: -99.0719 },
  // Europe
  { code: 'LHR', name: 'London Heathrow', lat: 51.4700, lon: -0.4543 },
  { code: 'CDG', name: 'Paris Charles de Gaulle', lat: 49.0097, lon: 2.5479 },
  { code: 'FRA', name: 'Frankfurt Intl', lat: 50.0333, lon: 8.5706 },
  { code: 'AMS', name: 'Amsterdam Schiphol', lat: 52.3105, lon: 4.7683 },
  { code: 'MAD', name: 'Madrid Barajas', lat: 40.4983, lon: -3.5676 },
  { code: 'MUC', name: 'Munich Intl', lat: 48.3537, lon: 11.7861 },
  { code: 'FCO', name: 'Rome Fiumicino', lat: 41.7999, lon: 12.2462 },
  { code: 'IST', name: 'Istanbul Airport', lat: 41.2753, lon: 28.7520 },
  // Asia
  { code: 'HND', name: 'Tokyo Haneda', lat: 35.5494, lon: 139.7798 },
  { code: 'NRT', name: 'Tokyo Narita', lat: 35.7647, lon: 140.3863 },
  { code: 'PEK', name: 'Beijing Capital', lat: 40.0799, lon: 116.6031 },
  { code: 'HKG', name: 'Hong Kong Intl', lat: 22.3080, lon: 113.9185 },
  { code: 'SIN', name: 'Singapore Changi', lat: 1.3644, lon: 103.9915 },
  { code: 'DXB', name: 'Dubai Intl', lat: 25.2532, lon: 55.3657 },
  { code: 'DOH', name: 'Doha Hamad', lat: 25.2731, lon: 51.6080 },
  { code: 'BKK', name: 'Bangkok Suvarnabhumi', lat: 13.6811, lon: 100.7472 },
  { code: 'ICN', name: 'Seoul Incheon', lat: 37.4602, lon: 126.4407 },
  { code: 'KUL', name: 'Kuala Lumpur Intl', lat: 2.7456, lon: 101.7099 },
  { code: 'CGK', name: 'Jakarta Soekarno-Hatta', lat: -6.1256, lon: 106.6558 },
  // Oceania
  { code: 'SYD', name: 'Sydney Kingsford', lat: -33.9399, lon: 151.1753 },
  { code: 'MEL', name: 'Melbourne Intl', lat: -37.6690, lon: 144.8410 },
  { code: 'BNE', name: 'Brisbane Intl', lat: -27.3842, lon: 153.1175 },
  { code: 'AKL', name: 'Auckland Intl', lat: -37.0082, lon: 174.7915 },
  // South America
  { code: 'GRU', name: 'São Paulo Guarulhos', lat: -23.4356, lon: -46.4731 },
  { code: 'BOG', name: 'Bogotá El Dorado', lat: 4.7016, lon: -74.1469 },
  { code: 'SCL', name: 'Santiago Arturo Merino', lat: -33.3930, lon: -70.7858 },
  { code: 'EZE', name: 'Buenos Aires Ezeiza', lat: -34.8150, lon: -58.5348 },
  // Africa
  { code: 'JNB', name: 'Johannesburg OR Tambo', lat: -26.1367, lon: 28.2411 },
  { code: 'CPT', name: 'Cape Town Intl', lat: -33.9715, lon: 18.6021 },
  { code: 'CAI', name: 'Cairo Intl', lat: 30.1219, lon: 31.4056 },
  { code: 'ADD', name: 'Addis Ababa Bole', lat: 8.9778, lon: 38.7993 },
  { code: 'NBO', name: 'Nairobi Jomo Kenyatta', lat: -1.3192, lon: 36.9278 },
  { code: 'CMN', name: 'Casablanca Mohammed V', lat: 33.3675, lon: -7.5899 },
];

export const ALL_AIRPORTS = [...INDIA_AIRPORTS, ...GLOBAL_AIRPORTS];

export const AIRPORT_NAMES = {};
ALL_AIRPORTS.forEach(a => AIRPORT_NAMES[a.code] = a.name);

export function getAirportName(code) {
  return code && code !== '—' ? (AIRPORT_NAMES[code] || code) : '—';
}

export function getNearbyAirports(lat, lon, maxKm) {
  return ALL_AIRPORTS
    .map(a => ({ ...a, dist: haversine(lat, lon, a.lat, a.lon) }))
    .filter(a => a.dist < maxKm)
    .sort((a, b) => a.dist - b.dist)
    .map(a => a.code);
}

/**
 * Retry policy with exponential backoff and jitter.
 * Inspired by FlightRadarAPI request.js
 */
export class RetryPolicy {
  /**
   * @param {Object} options
   * @param {number} [options.maxAttempts=3] - Total attempts including first
   * @param {number} [options.baseDelayMs=1000] - First backoff in ms
   * @param {number} [options.maxDelayMs=30000] - Cap for exponential backoff
   * @param {number} [options.jitterMs=500] - Random ms added to each sleep
   */
  constructor({ maxAttempts = 3, baseDelayMs = 1000, maxDelayMs = 30000, jitterMs = 500 } = {}) {
    if (maxAttempts < 1) throw new Error('maxAttempts must be >= 1');
    if (baseDelayMs < 0 || maxDelayMs < 0 || jitterMs < 0) {
      throw new Error('baseDelayMs, maxDelayMs and jitterMs must be >= 0');
    }
    this.maxAttempts = maxAttempts;
    this.baseDelayMs = baseDelayMs;
    this.maxDelayMs = maxDelayMs;
    this.jitterMs = jitterMs;
  }

  /**
   * @param {number} attemptIndex - Zero-based attempt index
   * @return {number} ms to sleep before next attempt
   */
  sleepFor(attemptIndex) {
    const delay = Math.min(this.baseDelayMs * (2 ** attemptIndex), this.maxDelayMs);
    return delay + Math.random() * this.jitterMs;
  }
}

/**
 * Execute async function with retry policy.
 * Retries on: network errors, timeout, 5xx, 429.
 * @template T
 * @param {() => Promise<T>} fn
 * @param {RetryPolicy} [policy]
 * @return {Promise<T>}
 */
export async function withRetry(fn, policy = new RetryPolicy()) {
  let lastError;
  for (let attempt = 0; attempt < policy.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const isRetryable = err.name === 'AbortError' ||
        err.name === 'TimeoutError' ||
        (err.cause && (err.cause.code === 'UND_ERR_SOCKET' || err.cause.code === 'ECONNRESET' || err.cause.code === 'ETIMEDOUT')) ||
        (err.status >= 500 && err.status < 600) ||
        err.status === 429;

      if (!isRetryable || attempt === policy.maxAttempts - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, policy.sleepFor(attempt)));
    }
  }
  throw lastError;
}

/**
 * Detect Cloudflare challenge/block response.
 * @param {number} statusCode
 * @param {Headers} headers
 * @return {boolean}
 */
export function isCloudflareBlock(statusCode, headers) {
  if (statusCode === 520) return true;
  if (statusCode !== 403) return false;
  return Boolean(headers.get('cf-mitigated'));
}
