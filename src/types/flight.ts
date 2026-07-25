export interface Airport {
  code: string;
  city: string;
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
  distKm: number;
  from: Airport;
  to: Airport;
  progress: number;
  firstSeen: Date;
  source: string;
  isHeli?: boolean;
  lastUpdated?: number;
  // Used for interpolation in the canvas
  prevLat?: number;
  prevLon?: number;
  prevHeading?: number;
}
