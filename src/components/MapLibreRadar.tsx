'use client';

import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import MapGL, { Source, Layer, Marker, useMap } from 'react-map-gl/maplibre';
import * as SunCalc from 'suncalc';
import CockpitHudOverlay from './CockpitHudOverlay';
import { haversine, calculateGreatCircleRoute } from '../lib/utils';
import 'maplibre-gl/dist/maplibre-gl.css';

// SVG without glow filter for crisp display, perfectly centered in 48x48
const PLANE_SVG = `<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <path d="M33 28v-4l-16-10V7c0-1.66-1.34-3-3-3s-3 1.34-3 3v7l-16 10v4l16-5V34l-4 3v4l7-2 7 2v-4l-4-3V23l16 5z" fill="COLOR" transform="translate(17, 12) scale(0.5)"/>
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
  'plane-black': PLANE_SVG.replace(/COLOR/g, '#000000'),
  'heli-cyan': HELI_SVG.replace(/COLOR/g, '#00e5ff'),
  'heli-amber': HELI_SVG.replace(/COLOR/g, '#ffaa00'),
  'heli-red': HELI_SVG.replace(/COLOR/g, '#ff003c'),
  'heli-black': HELI_SVG.replace(/COLOR/g, '#000000'),
};

export default function MapLibreRadar({
  flights,
  selectedFlight,
  userLat,
  userLon,
  radius,
  recenterTrigger,
  onSelectFlight,
  isChaseMode = false,
  onExitChase = () => {},
  onViewportChange,
  trailsRef,
  sensorMode = 'normal',
}: {
  flights: any[];
  selectedFlight: any;
  userLat: number | null;
  userLon: number | null;
  radius: number;
  recenterTrigger?: number;
  onSelectFlight: (flight: any) => void;
  isChaseMode?: boolean;
  onExitChase?: () => void;
  onViewportChange?: (centerLat: number, centerLon: number, radiusKm: number, isPanned: boolean) => void;
  trailsRef?: React.MutableRefObject<Map<string, Array<{ lat: number; lon: number; ts: number }>>>;
  sensorMode?: string;
}) {
  const [iconsLoaded, setIconsLoaded] = useState(false);
  const [blinkTick, setBlinkTick] = useState(true);

  // Dynamic path color adapting to tactical sensor vision modes
  const pathColor = useMemo(() => {
    switch (sensorMode) {
      case 'crt': return '#ffaa00'; // Amber CRT
      case 'nvg': return '#00ff66'; // Tactical NVG Green
      case 'flir': return '#ffffff'; // Thermal White
      default: return '#00f3ff'; // Tactical Cyan
    }
  }, [sensorMode]);
  
  // Refs for animation
  const mapRef = useRef(null);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(Date.now());
  const activeFlightsRef = useRef<any[]>([]);
  const moveTimerRef = useRef<any>(null);
  const lastChaseViewportRef = useRef<number>(0);

  // Viewport calculation on map pan/zoom
  const handleMoveEnd = useCallback(() => {
    if (!mapRef.current) return;
    if (moveTimerRef.current) clearTimeout(moveTimerRef.current);

    moveTimerRef.current = setTimeout(() => {
      if (!mapRef.current) return;
      const map = (mapRef.current as any).getMap?.() || mapRef.current;
      if (!map.getCenter || !map.getBounds) return;

      const center = map.getCenter();
      const bounds = map.getBounds();
      if (!center || !bounds) return;

      const ne = bounds.getNorthEast();
      const spanKm = haversine(center.lat, center.lng, ne.lat, ne.lng);
      const effectiveRadius = Math.max(15, Math.min(350, Math.round(spanKm)));

      let isPanned = false;
      if (userLat != null && userLon != null) {
        const distFromHome = haversine(userLat, userLon, center.lat, center.lng);
        isPanned = distFromHome > 15;
      }

      onViewportChange?.(center.lat, center.lng, effectiveRadius, isPanned);
    }, 300);
  }, [userLat, userLon, onViewportChange]);

  // Realistic Aircraft Double-Strobe Effect
  useEffect(() => {
    let timeout;
    const strobeLoop = () => {
      setBlinkTick(true);
      timeout = setTimeout(() => {
        setBlinkTick(false);
        timeout = setTimeout(() => {
          setBlinkTick(true);
          timeout = setTimeout(() => {
            setBlinkTick(false);
            timeout = setTimeout(strobeLoop, 1200); // Wait 1.2s before next strobe
          }, 80); // Second flash on
        }, 120); // Gap between flashes
      }, 80); // First flash on
    };
    strobeLoop();
    return () => clearTimeout(timeout);
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
              
              if (selectedFlight?.id === f.id) {
                stateColor = '#000000'; // Selected (Black)
                stateSuffix = 'black';
              } else if (f.onGround) {
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

          // 3. Dynamic Selected Flight Trail & Great-Circle Route
          const trailSource: any = map.getSource('flight-trail-source');
          const routeSource: any = map.getSource('flight-route-source');
          const waypointsSource: any = map.getSource('flight-waypoints-source');

          if (selectedFlight) {
            const activeSel = activeFlightsRef.current.find(f => f.id === selectedFlight.id) || selectedFlight;
            const curLat = activeSel.lat;
            const curLon = activeSel.lon;

            // A. Live Breadcrumb Trail from Position Buffer
            if (trailSource && trailsRef?.current) {
              const key = selectedFlight.icao24 || selectedFlight.callsign || selectedFlight.id;
              const historyPts = trailsRef.current.get(key) || [];
              const trailCoords = historyPts.map((p: any) => [p.lon, p.lat]);
              if (curLon != null && curLat != null) {
                trailCoords.push([curLon, curLat]);
              }
              if (trailCoords.length >= 2) {
                trailSource.setData({
                  type: 'FeatureCollection',
                  features: [{
                    type: 'Feature',
                    geometry: { type: 'LineString', coordinates: trailCoords },
                    properties: { type: 'trail' }
                  }]
                });
              } else {
                trailSource.setData(emptyGeoJson);
              }
            }

            // B. Origin -> Plane -> Destination Great Circle Corridor
            if (routeSource && waypointsSource) {
              const depLat = selectedFlight.routeObj?.depLat ?? selectedFlight.depLat;
              const depLon = selectedFlight.routeObj?.depLon ?? selectedFlight.depLon;
              const arrLat = selectedFlight.routeObj?.arrLat ?? selectedFlight.arrLat;
              const arrLon = selectedFlight.routeObj?.arrLon ?? selectedFlight.arrLon;

              const routeFeatures: any[] = [];
              const waypointFeatures: any[] = [];

              if (curLat != null && curLon != null) {
                // Flown segment: origin -> current
                if (depLat != null && depLon != null) {
                  const flownArc = calculateGreatCircleRoute(depLat, depLon, curLat, curLon, 30);
                  if (flownArc.length >= 2) {
                    routeFeatures.push({
                      type: 'Feature',
                      geometry: { type: 'LineString', coordinates: flownArc },
                      properties: { segment: 'flown' }
                    });
                  }
                  waypointFeatures.push({
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: [depLon, depLat] },
                    properties: { label: selectedFlight.from?.code || 'DEP', role: 'origin' }
                  });
                }

                // Planned segment: current -> destination
                if (arrLat != null && arrLon != null) {
                  const plannedArc = calculateGreatCircleRoute(curLat, curLon, arrLat, arrLon, 30);
                  if (plannedArc.length >= 2) {
                    routeFeatures.push({
                      type: 'Feature',
                      geometry: { type: 'LineString', coordinates: plannedArc },
                      properties: { segment: 'planned' }
                    });
                  }
                  waypointFeatures.push({
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: [arrLon, arrLat] },
                    properties: { label: selectedFlight.to?.code || 'ARR', role: 'destination' }
                  });
                }
              }

              routeSource.setData({ type: 'FeatureCollection', features: routeFeatures });
              waypointsSource.setData({ type: 'FeatureCollection', features: waypointFeatures });
            }
          } else {
            if (trailSource) trailSource.setData(emptyGeoJson);
            if (routeSource) routeSource.setData(emptyGeoJson);
            if (waypointsSource) waypointsSource.setData(emptyGeoJson);
          }

          // 4. Dynamic Cockpit Chase Camera Tethering (60 FPS)
          if (isChaseMode && selectedFlight) {
            const chased = activeFlightsRef.current.find(f => f.id === selectedFlight.id);
            if (chased && chased.lat != null && chased.lon != null) {
              map.jumpTo({
                center: [chased.lon, chased.lat],
                pitch: 65,
                bearing: chased.heading || 0,
              });

              // Periodically stream new airspace as the aircraft travels
              const nowTime = Date.now();
              if (!lastChaseViewportRef.current || nowTime - lastChaseViewportRef.current > 4000) {
                lastChaseViewportRef.current = nowTime;
                onViewportChange?.(chased.lat, chased.lon, 60, true);
              }
            }
          }
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [iconsLoaded, selectedFlight, isChaseMode, trailsRef]); // re-bind when selectedFlight, chase mode or trailsRef changes


  // Initial empty source (will be instantly overwritten by RAF loop)
  const emptyGeoJson = useMemo(() => ({ type: 'FeatureCollection' as const, features: [] }), []);

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
  }, [userLat, userLon, radius, recenterTrigger]);

  // Smoothly transition camera when entering or exiting Cockpit Chase mode
  useEffect(() => {
    if (!mapRef.current) return;
    if (isChaseMode && selectedFlight) {
      const f = activeFlightsRef.current.find(fl => fl.id === selectedFlight.id) || selectedFlight;
      if (f && f.lat != null && f.lon != null) {
        mapRef.current.flyTo({
          center: [f.lon, f.lat],
          zoom: 14,
          pitch: 65,
          bearing: f.heading || 0,
          duration: 1200,
          essential: true,
        });
      }
    } else if (!isChaseMode && userLat !== null && userLon !== null) {
      mapRef.current.easeTo({
        pitch: 60,
        bearing: 0,
        duration: 800,
      });
    }
  }, [isChaseMode, selectedFlight?.id]);

  // Load custom SVG images into MapLibre on load
  const onMapLoad = useCallback((e) => {
    const map = e.target;
    const promises = Object.entries(ICONS).map(([name, svgString]) => {
      return new Promise<void>((resolve) => {
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
    <div className="relative w-full h-full">
      <MapGL
        ref={mapRef}
        initialViewState={{
          longitude: userLon || 0,
          latitude: userLat || 0,
          zoom: initialZoom,
          pitch: 60, // Dramatic 3D tilt
        }}
        mapStyle={mapStyleUrl}
        style={{ width: '100%', height: '100%' }}
        interactive={true}
        onLoad={onMapLoad}
        onMoveEnd={handleMoveEnd}
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
        {/* 3D Buildings Layer */}
        <Layer
          id="3d-buildings"
          source="carto"
          source-layer="building"
          type="fill-extrusion"
          minzoom={14}
          paint={{
            'fill-extrusion-color': '#E2E8F0',
            'fill-extrusion-height': ['coalesce', ['get', 'render_height'], ['get', 'height'], 20],
            'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], ['get', 'min_height'], 0],
            'fill-extrusion-opacity': 0.7
          }}
        />
        <Marker longitude={userLon} latitude={userLat}>
          <div className="flex flex-col items-center justify-center">
            <div className="w-4 h-4 rounded-full border flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.8)] bg-black/20 border-black/50">
              <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
            </div>
            <div className="text-[10px] font-mono mt-1 text-black/70">ORG</div>
          </div>
        </Marker>

        {iconsLoaded && (
          <>
            {/* ─── Selected Flight Breadcrumb Trail ─── */}
            <Source id="flight-trail-source" type="geojson" data={emptyGeoJson}>
              <Layer
                id="flight-trail-glow"
                type="line"
                paint={{
                  'line-color': pathColor,
                  'line-width': 6,
                  'line-opacity': 0.35,
                  'line-blur': 3,
                }}
              />
              <Layer
                id="flight-trail-core"
                type="line"
                layout={{
                  'line-cap': 'round',
                  'line-join': 'round',
                }}
                paint={{
                  'line-color': pathColor,
                  'line-width': 2.5,
                  'line-opacity': 0.9,
                }}
              />
            </Source>

            {/* ─── Selected Flight Origin -> Aircraft -> Destination Route ─── */}
            <Source id="flight-route-source" type="geojson" data={emptyGeoJson}>
              {/* Flown corridor glow & core */}
              <Layer
                id="route-flown-glow"
                type="line"
                filter={['==', ['get', 'segment'], 'flown']}
                paint={{
                  'line-color': pathColor,
                  'line-width': 5,
                  'line-opacity': 0.25,
                  'line-blur': 3,
                }}
              />
              <Layer
                id="route-flown-core"
                type="line"
                filter={['==', ['get', 'segment'], 'flown']}
                layout={{
                  'line-cap': 'round',
                  'line-join': 'round',
                }}
                paint={{
                  'line-color': pathColor,
                  'line-width': 2,
                  'line-opacity': 0.75,
                }}
              />
              {/* Planned / remaining corridor (dashed) */}
              <Layer
                id="route-planned-core"
                type="line"
                filter={['==', ['get', 'segment'], 'planned']}
                paint={{
                  'line-color': pathColor,
                  'line-width': 2,
                  'line-dasharray': [2, 2],
                  'line-opacity': 0.65,
                }}
              />
            </Source>

            {/* ─── Waypoint Nodes (Origin / Destination Airports) ─── */}
            <Source id="flight-waypoints-source" type="geojson" data={emptyGeoJson}>
              <Layer
                id="waypoint-glow"
                type="circle"
                paint={{
                  'circle-radius': 10,
                  'circle-color': pathColor,
                  'circle-opacity': 0.35,
                  'circle-blur': 0.8,
                }}
              />
              <Layer
                id="waypoint-core"
                type="circle"
                paint={{
                  'circle-radius': 4.5,
                  'circle-color': pathColor,
                  'circle-stroke-width': 1.5,
                  'circle-stroke-color': '#0F172A',
                }}
              />
              <Layer
                id="waypoint-labels"
                type="symbol"
                layout={{
                  'text-field': ['get', 'label'],
                  'text-font': ['Open Sans Regular'],
                  'text-size': 11,
                  'text-offset': [0, 1.4],
                  'text-anchor': 'top',
                  'text-allow-overlap': true,
                }}
                paint={{
                  'text-color': '#0F172A',
                  'text-halo-color': '#FFFFFF',
                  'text-halo-width': 2,
                }}
              />
            </Source>

            <Source id="flights-source" type="geojson" data={emptyGeoJson}>
              {/* Static Aura Glow */}
              <Layer
                id="flight-aura"
                type="circle"
                paint={{
                  'circle-radius': ['case', ['==', ['get', 'isSel'], true], 30, 20],
                  'circle-color': ['get', 'stateColor'],
                  'circle-opacity': 0.4,
                  'circle-blur': 0.8,
                  'circle-pitch-alignment': 'map',
                }}
              />

              {/* Plane Symbol */}
              <Layer
                id="flight-points"
                type="symbol"
                layout={{
                  'icon-image': ['get', 'icon'],
                  'icon-size': ['case', ['==', ['get', 'isSel'], true], 1.6, 1.2],
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
                  'circle-radius': ['case', ['==', ['get', 'isSel'], true], 5, 4],
                  'circle-color': ['get', 'typeColor'],
                  'circle-opacity': blinkTick ? 1.0 : 0.0, // React drives this blink!
                  'circle-pitch-alignment': 'map',
                  'circle-stroke-width': 2,
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
          </>
        )}
      </MapGL>


      {/* Avionics Tactical HUD Overlay */}
      {isChaseMode && selectedFlight && (
        <CockpitHudOverlay flight={selectedFlight} onExitChase={onExitChase} />
      )}
    </div>
  );
}
