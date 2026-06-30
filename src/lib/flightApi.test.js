import {
  parseAirplanesLive,
  parseADSBLol,
  parseAviationStack,
  parseAirLabs,
  uniqueFlights,
  generateDemoFlights,
  fetchWithTimeout,
} from '@/lib/flightApi';

const MOCK_USER_LAT = 18.602;
const MOCK_USER_LON = 73.747;
const MOCK_RADIUS = 100;

describe('flightApi parsers', () => {
  describe('parseAirplanesLive', () => {
    test('parses valid aircraft array', () => {
      const data = {
        ac: [
          { hex: 'abc123', flight: 'AI101  ', lat: 18.6, lon: 73.8, alt_baro: 35000, gs: 450, track: 90, baro_rate: 0, squawk: '1200', t: 'A320', r: 'VT-ABC', flag: 'IN' },
        ],
      };
      const result = parseAirplanesLive(data, MOCK_USER_LAT, MOCK_USER_LON, MOCK_RADIUS);
      expect(result).toHaveLength(1);
      expect(result[0].callsign).toBe('AI101');
      expect(result[0].icao24).toBe('ABC123');
      expect(result[0].altitude).toBe(35000);
      expect(result[0].speed).toBe(450);
      expect(result[0].heading).toBe(90);
      expect(result[0].source).toBe('Airplanes.live');
    });

    test('filters out aircraft without lat/lon', () => {
      const data = { ac: [{ hex: 'abc123', flight: 'AI101' }, { hex: 'def456', lat: 18.6, lon: 73.8 }] };
      const result = parseAirplanesLive(data, MOCK_USER_LAT, MOCK_USER_LON, MOCK_RADIUS);
      expect(result).toHaveLength(1);
    });

    test('filters out aircraft beyond radius', () => {
      const data = { ac: [{ hex: 'abc123', flight: 'AI101', lat: 0, lon: 0 }] };
      const result = parseAirplanesLive(data, MOCK_USER_LAT, MOCK_USER_LON, 10);
      expect(result).toHaveLength(0);
    });

    test('handles missing data gracefully', () => {
      expect(parseAirplanesLive(null, 0, 0, 100)).toEqual([]);
      expect(parseAirplanesLive({}, 0, 0, 100)).toEqual([]);
      expect(parseAirplanesLive({ ac: 'not array' }, 0, 0, 100)).toEqual([]);
    });

    test('uses alt_geom when alt_baro missing', () => {
      const data = { ac: [{ hex: 'abc123', flight: 'AI101', lat: 18.6, lon: 73.8, alt_geom: 36000 }] };
      const result = parseAirplanesLive(data, MOCK_USER_LAT, MOCK_USER_LON, MOCK_RADIUS);
      expect(result[0].altitude).toBe(36000);
    });
  });

  describe('parseADSBLol', () => {
    test('parses valid aircraft', () => {
      const data = { ac: [{ hex: 'abc123', flight: ' 6E202 ', lat: 18.6, lon: 73.8, alt_baro: 28000, gs: 420, track: 180, baro_rate: 500, squawk: '2000', t: 'A321' }] };
      const result = parseADSBLol(data, MOCK_USER_LAT, MOCK_USER_LON, MOCK_RADIUS);
      expect(result).toHaveLength(1);
      expect(result[0].callsign).toBe('6E202');
      expect(result[0].source).toBe('ADS-B.lol');
    });

    test('falls back to reg when flight missing', () => {
      const data = { ac: [{ hex: 'abc123', r: 'VT-XYZ', lat: 18.6, lon: 73.8 }] };
      const result = parseADSBLol(data, MOCK_USER_LAT, MOCK_USER_LON, MOCK_RADIUS);
      expect(result[0].callsign).toBe('VT-XYZ');
    });
  });

  describe('parseAviationStack', () => {
    test('parses active flights', () => {
      const data = {
        data: [
          {
            live: { latitude: 18.6, longitude: 73.8, altitude: 35000, speed: 450, heading: 90, vertical_rate: 0, is_ground: false, squawk: '1200', updated: Date.now() },
            departure: { iata: 'BOM', icao: 'VABB', airport: 'Mumbai' },
            arrival: { iata: 'DEL', icao: 'VIDP', airport: 'Delhi' },
            aircraft: { icao24: 'abc123', registration: 'VT-ABC', iata: 'A320', icao: 'A320' },
            flight: { icao: 'AI101', number: '101' },
            airline: { name: 'Air India' },
          },
        ],
      };
      const result = parseAviationStack(data, MOCK_USER_LAT, MOCK_USER_LON, MOCK_RADIUS);
      expect(result).toHaveLength(1);
      expect(result[0].callsign).toBe('AI101');
      expect(result[0].from.code).toBe('BOM');
      expect(result[0].to.code).toBe('DEL');
      expect(result[0].source).toBe('AviationStack');
    });

    test('filters out non-live or missing coords', () => {
      const data = {
        data: [
          { live: null },
          { live: { latitude: null, longitude: 73.8 } },
          { live: { latitude: 18.6, longitude: 73.8, is_ground: true } },
        ],
      };
      const result = parseAviationStack(data, MOCK_USER_LAT, MOCK_USER_LON, MOCK_RADIUS);
      expect(result).toHaveLength(1); // only the grounded one has coords but is filtered by radius? actually grounded is kept
      // wait, is_ground doesn't filter out, only lat/lon missing
      expect(result[0]).toBeDefined();
    });
  });

  describe('parseAirLabs', () => {
    test('parses response array', () => {
      const data = {
        response: [
          { hex: 'abc123', flight_icao: 'UK303', latitude: 18.6, longitude: 73.8, altitude: 31000, speed: 450, heading: 120, vertical_rate: 0, on_ground: false, squawk: '1200', aircraft_icao: 'B738', airline_name: 'Vistara', registration: 'VT-UKY', departure_iata: 'BOM', departure_airport: 'Mumbai', arrival_iata: 'HYD', arrival_airport: 'Hyderabad', updated: Date.now() },
        ],
      };
      const result = parseAirLabs(data, MOCK_USER_LAT, MOCK_USER_LON, MOCK_RADIUS);
      expect(result).toHaveLength(1);
      expect(result[0].callsign).toBe('UK303');
      expect(result[0].source).toBe('AirLabs');
    });

    test('handles data.data format', () => {
      const data = {
        data: [
          { hex: 'def456', flight_icao: 'AI202', latitude: 18.6, longitude: 73.8, altitude: 30000, speed: 400, heading: 100, vertical_rate: 0, on_ground: false },
        ],
      };
      const result = parseAirLabs(data, MOCK_USER_LAT, MOCK_USER_LON, MOCK_RADIUS);
      expect(result).toHaveLength(1);
    });
  });

  describe('uniqueFlights', () => {
    test('deduplicates by icao24', () => {
      const f1 = { icao24: 'ABC123', callsign: 'AI101', distKm: 50 };
      const f2 = { icao24: 'ABC123', callsign: 'AI101', distKm: 51 };
      const result = uniqueFlights([f1, f2]);
      expect(result).toHaveLength(1);
    });

    test('deduplicates by callsign when icao24 missing', () => {
      const f1 = { callsign: 'AI101', distKm: 50 };
      const f2 = { callsign: 'AI101', distKm: 51 };
      const result = uniqueFlights([f1, f2]);
      expect(result).toHaveLength(1);
    });

    test('merges from/to preferring non-default', () => {
      const f1 = { icao24: 'ABC123', from: { code: '—' }, to: { code: 'DEL' } };
      const f2 = { icao24: 'ABC123', from: { code: 'BOM' }, to: { code: '—' } };
      const result = uniqueFlights([f1, f2]);
      expect(result[0].from.code).toBe('BOM');
      expect(result[0].to.code).toBe('DEL');
    });

    test('sorts by distance', () => {
      const f1 = { icao24: 'A', distKm: 100 };
      const f2 = { icao24: 'B', distKm: 10 };
      const f3 = { icao24: 'C', distKm: 50 };
      const result = uniqueFlights([f1, f2, f3]);
      expect(result.map(r => r.distKm)).toEqual([10, 50, 100]);
    });
  });

  describe('generateDemoFlights', () => {
    test('returns 3 demo flights', () => {
      const flights = generateDemoFlights(18.6, 73.7, 100);
      expect(flights).toHaveLength(3);
      flights.forEach(f => {
        expect(f.isDemo).toBe(true);
        expect(f.callsign).toBeTruthy();
        expect(f.distKm).toBeGreaterThan(0);
      });
    });
  });
});