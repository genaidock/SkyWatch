export interface Airport {
  code: string;
  city: string;
}

export type SensorMode = 'normal' | 'nvg' | 'flir' | 'crt';

export interface ChaseCameraState {
  active: boolean;
  targetFlightId: string | null;
  pitch: number;
  bearing: number;
  zoom: number;
}

export interface Flight {
  id: string;
  callsign: string;
  icao24: string;
  country: string;
  reg: string;
  lat: number;
  lon: number;
  altitude: number; // in feet
  altM: number; // in meters
  speed: number; // in knots
  heading: number; // in degrees
  vertRate: number; // in ft/min
  onGround: boolean;
  squawk: string;
  type: string;
  desc?: string;
  category?: 'civil' | 'cargo' | 'military' | 'private' | 'helicopter' | null;
  branch?: string;
  isMilitary?: boolean;
  isGov?: boolean;
  operator?: string;
  distKm: number;
  from: Airport;
  to: Airport;
  progress: number;
  firstSeen: Date;
  source: string;
  sources?: string[];
  isHeli?: boolean;
  isDemo?: boolean;
  lastUpdated?: number;
  // Used for interpolation in the canvas / MapLibre
  prevLat?: number;
  prevLon?: number;
  prevHeading?: number;
  airlineObj?: {
    name: string;
    icao?: string;
    iata?: string;
    callsign?: string;
  };
}
