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
];

export const GLOBAL_AIRPORTS = [
  { code: 'JFK', name: 'New York JFK', lat: 40.6413, lon: -73.7781 },
  { code: 'LHR', name: 'London Heathrow', lat: 51.4700, lon: -0.4543 },
  { code: 'DXB', name: 'Dubai Intl', lat: 25.2532, lon: 55.3657 },
  { code: 'LAX', name: 'Los Angeles Intl', lat: 33.9416, lon: -118.4085 },
  { code: 'HND', name: 'Tokyo Haneda', lat: 35.5494, lon: 139.7798 },
  { code: 'CDG', name: 'Paris Charles de Gaulle', lat: 49.0097, lon: 2.5479 },
  { code: 'FRA', name: 'Frankfurt Intl', lat: 50.0333, lon: 8.5706 },
  { code: 'SIN', name: 'Singapore Changi', lat: 1.3644, lon: 103.9915 },
  { code: 'SYD', name: 'Sydney Kingsford', lat: -33.9399, lon: 151.1753 },
  { code: 'BKK', name: 'Bangkok Suvarn', lat: 13.6811, lon: 100.7472 },
  { code: 'AMS', name: 'Amsterdam Schiphol', lat: 52.3105, lon: 4.7683 },
  { code: 'YYZ', name: 'Toronto Pearson', lat: 43.6777, lon: -79.6248 },
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
