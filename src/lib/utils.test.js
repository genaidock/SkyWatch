import { haversine, bearing, degreesToRadians, radiansToDegrees, headingToDirection, flagToCountry, getAirportName, getNearbyAirports, SQUAWK_MEANINGS, AIRCRAFT_DB, getAircraftInfo } from '@/lib/utils';

describe('utils', () => {
  describe('degreesToRadians / radiansToDegrees', () => {
    test('degreesToRadians converts correctly', () => {
      expect(degreesToRadians(180)).toBeCloseTo(Math.PI);
      expect(degreesToRadians(90)).toBeCloseTo(Math.PI / 2);
      expect(degreesToRadians(0)).toBe(0);
    });

    test('radiansToDegrees converts correctly', () => {
      expect(radiansToDegrees(Math.PI)).toBeCloseTo(180);
      expect(radiansToDegrees(Math.PI / 2)).toBeCloseTo(90);
      expect(radiansToDegrees(0)).toBe(0);
    });

    test('roundtrip', () => {
      expect(radiansToDegrees(degreesToRadians(45))).toBeCloseTo(45);
      expect(radiansToDegrees(degreesToRadians(-120))).toBeCloseTo(-120);
    });
  });

  describe('haversine', () => {
    test('same point returns 0', () => {
      expect(haversine(0, 0, 0, 0)).toBe(0);
      expect(haversine(10, 20, 10, 20)).toBe(0);
    });

    test('known distances', () => {
      // Approx distance between London (51.5074, -0.1278) and Paris (48.8566, 2.3522) ~344 km
      const d = haversine(51.5074, -0.1278, 48.8566, 2.3522);
      expect(d).toBeCloseTo(344, 0);
    });

    test('symmetry', () => {
      const a = haversine(10, 20, 30, 40);
      const b = haversine(30, 40, 10, 20);
      expect(a).toBeCloseTo(b);
    });
  });

  describe('bearing', () => {
    test('same point returns 0', () => {
      expect(bearing(10, 20, 10, 20)).toBe(0);
    });

    test('known bearings', () => {
      // North
      expect(bearing(0, 0, 1, 0)).toBeCloseTo(0, 0);
      // East
      expect(bearing(0, 0, 0, 1)).toBeCloseTo(90, 0);
      // South
      expect(bearing(0, 0, -1, 0)).toBeCloseTo(180, 0);
      // West
      expect(bearing(0, 0, 0, -1)).toBeCloseTo(270, 0);
    });

    test('bearing in [0, 360)', () => {
      expect(bearing(10, 20, 5, 15)).toBeGreaterThanOrEqual(0);
      expect(bearing(10, 20, 5, 15)).toBeLessThan(360);
    });
  });

  describe('headingToDirection', () => {
    test('cardinal directions', () => {
      expect(headingToDirection(0)).toBe('N');
      expect(headingToDirection(90)).toBe('E');
      expect(headingToDirection(180)).toBe('S');
      expect(headingToDirection(270)).toBe('W');
    });

    test('intercardinal', () => {
      expect(headingToDirection(45)).toBe('NE');
      expect(headingToDirection(135)).toBe('SE');
      expect(headingToDirection(225)).toBe('SW');
      expect(headingToDirection(315)).toBe('NW');
    });
  });

  describe('flagToCountry', () => {
    test('known prefixes', () => {
      expect(flagToCountry('VT-ABC')).toBe('India');
      expect(flagToCountry('N123')).toBe('USA');
      expect(flagToCountry('G-ABCD')).toBe('UK');
      expect(flagToCountry('D-ABCD')).toBe('Germany');
      expect(flagToCountry('F-GHZ')).toBe('France');
    });

    test('unknown returns —', () => {
      expect(flagToCountry('XX-123')).toBe('—');
      expect(flagToCountry('')).toBe('—');
    });
  });

  describe('getAirportName', () => {
    test('known codes', () => {
      expect(getAirportName('DEL')).toBe('Delhi Intl');
      expect(getAirportName('BOM')).toBe('Mumbai Intl');
      expect(getAirportName('JFK')).toBe('New York JFK');
    });

    test('unknown returns code', () => {
      expect(getAirportName('XYZ')).toBe('XYZ');
      expect(getAirportName('—')).toBe('—');
    });
  });

  describe('getNearbyAirports', () => {
    test('returns sorted airports within radius', () => {
      const near = getNearbyAirports(28.5, 77.1, 100); // near Delhi
      expect(near.length).toBeGreaterThan(0);
      expect(near[0]).toBe('DEL');
    });

    test('empty when none in range', () => {
      const near = getNearbyAirports(0, 0, 1); // middle of ocean, 1km radius
      expect(near).toEqual([]);
    });
  });

  describe('SQUAWK_MEANINGS', () => {
    test('emergency codes', () => {
      expect(SQUAWK_MEANINGS['7700']).toContain('emergency');
      expect(SQUAWK_MEANINGS['7600']).toContain('Radio');
      expect(SQUAWK_MEANINGS['7500']).toContain('Hijacking');
    });
  });

  describe('AIRCRAFT_DB / getAircraftInfo', () => {
    test('known types', () => {
      const a320 = getAircraftInfo('A320');
      expect(a320.maker).toBe('Airbus');
      expect(a320.full).toContain('A320');
      expect(a320.cat).toBe('Narrow Body');
    });

    test('unknown type returns defaults', () => {
      const unk = getAircraftInfo('XYZ999');
      expect(unk.maker).toBe('—');
      expect(unk.full).toBe('XYZ999');
    });
  });
});