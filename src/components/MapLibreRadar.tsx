'use client';

import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import MapGL, { Source, Layer, Marker, useMap } from 'react-map-gl/maplibre';
import * as SunCalc from 'suncalc';
import 'maplibre-gl/dist/maplibre-gl.css';

// SVG without glow filter for crisp display
const PLANE_SVG = `<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <path d="M33 28v-4l-16-10V7c0-1.66-1.34-3-3-3s-3 1.34-3 3v7l-16 10v4l16-5V34l-4 3v4l7-2 7 2v-4l-4-3V23l16 5z" fill="COLOR" transform="translate(12, 10) scale(0.5)"/>
</svg>`;

const HELI_SVG = `<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="24" cy="24" rx="4" ry="10" fill="COLOR"/>
  <rect x="23" y="34" width="2" height="10" fill="COLOR"/>
  <rect x="21" y="42" width="6" height="2" fill="COLOR"/>
  <circle cx="24" cy="24" r="14" fill="none" stroke="COLOR" stroke-width="1.5" stroke-dasharray="8 4" opacity="0.8"/>
  <line x1="10" y1="24" x2="38" y2="24" stroke="COLOR" stroke-width="2" opacity="0.5"/>
  <line x1="24" y1="10" x2="24" y2="38" stroke="COLOR" stroke-width="2" opacity="0.5"/>
</svg>`;

const ICONS = {
  'plane-cyan': PLANE_SVG.replace(/COLOR/g, '#00e5ff'),
  'plane-amber': PLANE_SVG.replace(/COLOR/g, '#ffaa00'),
  'plane-red': PLANE_SVG.replace(/COLOR/g, '#ff003c'),
  'heli-cyan': HELI_SVG.replace(/COLOR/g, '#00e5ff'),
  'heli-amber': HELI_SVG.replace(/COLOR/g, '#ffaa00'),
  'heli-red': HELI_SVG.replace(/COLOR/g, '#ff003c'),
};

export default function MapLibreRadar({ flights, selectedFlight, userLat, userLon, radius, onSelectFlight }) {
  const [iconsLoaded, setIconsLoaded] = useState(false);
  const [blinkTick, setBlinkTick] = useState(true);
  
  // Refs for animation
  const mapRef = useRef(null);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(Date.now());
  const activeFlightsRef = useRef<any[]>([]);

  // Blinker effect: Toggles every 500ms
  useEffect(() => {
    const interval = setInterval(() => {
      setBlinkTick(b => !b);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // When flights prop changes, update our active tracking array
  // We use a clever Stale Data & Lerp system to eliminate rubberbanding.
  useEffect(() => {
    const currentMap = new Map(activeFlightsRef.current.map(f => [f.id, f]));

    activeFlightsRef.current = flights.map(f => {
      const current = currentMap.get(f.id);
      
      if (current) {
        const isStale = current.apiLat === f.lat && current.apiLon === f.lon;
        
        return {
          ...f,
          // Visual Coordinates (where the plane actually is on screen)
          lat: current.lat, 
          lon: current.lon,
          // Target Coordinates (where the plane *should* be, which dead-reckons forward)
          targetLat: isStale ? current.targetLat : f.lat,
          targetLon: isStale ? current.targetLon : f.lon,
          // Keep track of the raw API coordinates to detect staleness next time
          apiLat: f.lat,
          apiLon: f.lon,
          staleTimer: isStale ? current.staleTimer + 1 : 0,
        };
      }
      
      return {
        ...f,
        lat: f.lat,
        lon: f.lon,
        targetLat: f.lat,
        targetLon: f.lon,
        apiLat: f.lat,
        apiLon: f.lon,
        staleTimer: 0
      };
    });
  }, [flights]);

  // The Dead Reckoning & Lerp Loop
  useEffect(() => {
    if (!iconsLoaded) return;

    const animate = () => {
      const now = Date.now();
      const dt = (now - lastTimeRef.current) / 1000; // delta time in seconds
      lastTimeRef.current = now;

      if (mapRef.current) {
        const map = mapRef.current.getMap();
        const source = map.getSource('flights-source');
        
        if (source) {
          activeFlightsRef.current.forEach(f => {
            if (f.speed > 0 && !f.onGround) {
              
              // 1. Move the TARGET forward via Dead Reckoning
              const speedDegPerSec = (f.speed / 60) / 3600;
              const headingRad = (f.heading || 0) * (Math.PI / 180);
              const latRad = f.targetLat * (Math.PI / 180);
              
              const dy = Math.cos(headingRad) * speedDegPerSec * dt;
              const dx = (Math.sin(headingRad) * speedDegPerSec * dt) / Math.cos(latRad);
              
              // If we haven't received fresh API data in a while, gracefully slow the plane down 
              // so it doesn't coast off into space forever.
              let speedMultiplier = 1.0;
              if (f.staleTimer >= 2) speedMultiplier = 0.5; // ~10 seconds stale
              if (f.staleTimer >= 4) speedMultiplier = 0.1; // ~20 seconds stale
              if (f.staleTimer >= 6) speedMultiplier = 0.0; // ~30 seconds stale
              
              f.targetLat += dy * speedMultiplier;
              f.targetLon += dx * speedMultiplier;
              
              // 2. Smoothly LERP the visual display coordinates towards the TARGET coordinates
              // This completely eliminates teleporting when fresh API data arrives.
              const lerpFactor = Math.min(dt * 3.0, 1.0); 
              
              f.lat += (f.targetLat - f.lat) * lerpFactor;
              f.lon += (f.targetLon - f.lon) * lerpFactor;
            }
          });

          // Build a fresh GeoJSON payload
          const geoJson = {
            type: 'FeatureCollection',
            features: activeFlightsRef.current.map((f) => {
              // 1. Determine State Color (Aura & Plane Base)
              let stateColor = '#00e5ff'; // Cruising (Cyan)
              let stateSuffix = 'cyan';
              
              if (selectedFlight?.id === f.id || f.onGround) {
                stateColor = '#ffaa00'; // Amber
                stateSuffix = 'amber';
              } else if (f.altitude < 3000) {
                stateColor = '#ff003c'; // Red
                stateSuffix = 'red';
              }

              // 2. Determine Shape
              let shape = f.category === 'helicopter' ? 'heli' : 'plane';
              let icon = `${shape}-${stateSuffix}`;

              // 3. Determine Strobe Light Color (Type)
              let typeColor = '#ffffff'; // Civil
              if (f.category === 'cargo') typeColor = '#00ff9d';
              else if (f.category === 'private') typeColor = '#8a2be2';
              else if (f.category === 'military') typeColor = '#cc0000';
              else if (f.category === 'helicopter') typeColor = '#39ff14';

              return {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [f.lon, f.lat],
                },
                properties: {
                  id: f.id,
                  callsign: f.callsign,
                  heading: f.heading || 0,
                  icon,
                  stateColor,
                  typeColor,
                  isSel: selectedFlight?.id === f.id,
                },
              };
            })
          };

          // Inject directly into MapLibre (Bypasses React rendering entirely!)
          source.setData(geoJson);
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [iconsLoaded, selectedFlight]); // re-bind when selectedFlight changes so colors update correctly


  // Initial empty source (will be instantly overwritten by RAF loop)
  const emptyGeoJson = useMemo(() => ({ type: 'FeatureCollection', features: [] }), []);

  // Fly to new location when user changes location via dropdown
  useEffect(() => {
    if (mapRef.current && userLat !== null && userLon !== null) {
      let targetZoom = 9;
      if (radius <= 10) targetZoom = 12;
      else if (radius <= 25) targetZoom = 11;
      else if (radius <= 50) targetZoom = 10;
      else if (radius <= 100) targetZoom = 8.5;
      else targetZoom = 7; // For 250km

      mapRef.current.flyTo({
        center: [userLon, userLat],
        zoom: targetZoom,
        duration: 1500, // 1.5 seconds smooth fly animation
        essential: true
      });
    }
  }, [userLat, userLon, radius]);

  // Load custom SVG images into MapLibre on load
  const onMapLoad = useCallback((e) => {
    const map = e.target;
    const promises = Object.entries(ICONS).map(([name, svgString]) => {
      return new Promise((resolve) => {
        const img = new Image(48, 48);
        img.onload = () => {
          if (!map.hasImage(name)) map.addImage(name, img);
          resolve();
        };
        img.onerror = () => {
          console.error(`Failed to load SVG icon: ${name}`);
          resolve(); // Resolve anyway so it doesn't hang the map
        }
        // IMPORTANT: SVG must be URL encoded because of the '#' in the filter URL!
        img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
      });
    });

    Promise.all(promises).then(() => {
      setIconsLoaded(true);
    });
  }, []);

  const mapStyleUrl = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

  let initialZoom = 9;
  if (radius <= 10) initialZoom = 12;
  else if (radius <= 25) initialZoom = 11;
  else if (radius <= 50) initialZoom = 10;
  else if (radius <= 100) initialZoom = 8.5;
  else initialZoom = 7; // For 250km

  return (
    <MapGL
      ref={mapRef}
      initialViewState={{
        longitude: userLon || 0,
        latitude: userLat || 0,
        zoom: initialZoom,
        pitch: 45, // Slight 3D tilt
      }}
      mapStyle={mapStyleUrl}
      style={{ width: '100%', height: '100%' }}
      interactive={true}
      onLoad={onMapLoad}
      onClick={(e) => {
        if (e.features && e.features.length > 0) {
          const clickedFlight = flights.find(f => f.id === e.features[0].properties.id);
          if (clickedFlight) {
            onSelectFlight(clickedFlight);
            return;
          }
        }
        onSelectFlight(null);
      }}
      interactiveLayerIds={['flight-points', 'flight-glow']}
      cursor="crosshair"
    >
      <Marker longitude={userLon} latitude={userLat}>
        <div className="flex flex-col items-center justify-center">
          <div className="w-4 h-4 rounded-full border flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.8)] bg-black/20 border-black/50">
            <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
          </div>
          <div className="text-[10px] font-mono mt-1 text-black/70">ORG</div>
        </div>
      </Marker>

      {iconsLoaded && (
        <Source id="flights-source" type="geojson" data={emptyGeoJson}>
          {/* Static Aura Glow */}
          <Layer
            id="flight-aura"
            type="circle"
            paint={{
              'circle-radius': ['case', ['==', ['get', 'isSel'], true], 20, 14],
              'circle-color': ['get', 'stateColor'],
              'circle-opacity': 0.25,
              'circle-blur': 1,
              'circle-pitch-alignment': 'map',
            }}
          />

          {/* Plane Symbol */}
          <Layer
            id="flight-points"
            type="symbol"
            layout={{
              'icon-image': ['get', 'icon'],
              'icon-size': ['case', ['==', ['get', 'isSel'], true], 1.2, 0.85],
              'icon-rotate': ['get', 'heading'],
              'icon-allow-overlap': true,
              'icon-rotation-alignment': 'map', // Lay flat on 3D map
              'icon-pitch-alignment': 'map',
            }}
          />
          
          {/* Blinking Beacon Light (Rendered ON TOP of plane) */}
          <Layer
            id="flight-glow"
            type="circle"
            paint={{
              'circle-radius': ['case', ['==', ['get', 'isSel'], true], 4, 3],
              'circle-color': ['get', 'typeColor'],
              'circle-opacity': blinkTick ? 1.0 : 0.0, // React drives this blink!
              'circle-pitch-alignment': 'map',
              'circle-stroke-width': 1.5,
              'circle-stroke-color': ['get', 'stateColor'],
              'circle-stroke-opacity': blinkTick ? 1.0 : 0.0,
            }}
          />
          {/* Labels */}
          <Layer
            id="flight-labels"
            type="symbol"
            layout={{
              'text-field': ['get', 'callsign'],
              'text-font': ['Open Sans Regular'],
              'text-size': 11,
              'text-offset': [0, 1.5],
              'text-anchor': 'top',
              'text-allow-overlap': false,
            }}
            paint={{
              'text-color': '#0F172A',
              'text-halo-color': '#FFFFFF',
              'text-halo-width': 2,
            }}
          />
        </Source>
      )}
    </MapGL>
  );
}
