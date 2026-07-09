'use client';

import { useEffect, useRef } from 'react';
import { bearing, haversine, degreesToRadians, ALL_AIRPORTS } from '@/lib/utils';

// ─── Interpolation Utilities ──────────────────────────────────────────────────

/**
 * Shortest-arc heading interpolation.
 * Handles the 360°/0° wrap-around correctly (e.g., 350° → 10° goes through 0°).
 */
function lerpAngle(from, to, t) {
  let diff = ((to - from + 540) % 360) - 180;
  return (from + diff * t + 360) % 360;
}

/**
 * Frame-rate independent exponential decay factor.
 * decayRate closer to 0 = smoother but laggier; 0.008 is a good default for ~5s API intervals.
 */
function smoothFactor(decayRate, deltaSec) {
  return 1 - Math.pow(decayRate, deltaSec);
}

// Sweep rotational speed: degrees per second (~19°/s ≈ one full revolution every ~19s)
const SWEEP_DEG_PER_SEC = 19.2;

// Keep stale interpolation data for 120s before removing it.
// This allows planes that temporarily drop out of the ADSB feed to keep dead-reckoning.
const INTERP_STALE_MS = 120000;

// ─── Component ────────────────────────────────────────────────────────────────

export default function RadarCanvas({ flights = [], selectedFlight = null, userLat = 0, userLon = 0, radius = 100, onSelectFlight, trailsRef }) {
  const canvasRef = useRef(null);
  const animRefRef = useRef(null);
  const sweepRef = useRef(0);
  const stateRef = useRef({ flights, selectedFlight, userLat, userLon, radius, trailsRef });

  /**
   * Interpolation state map – persists across frames.
   * Key: flight.id
   * Value: { displayLat, displayLon, displayHeading, targetLat, targetLon, targetHeading, speed, lastSeen }
   */
  const interpMapRef = useRef(new Map());

  /** Timestamp of previous frame for delta-time calculation */
  const lastFrameTimeRef = useRef(null);

  useEffect(() => {
    stateRef.current = { flights, selectedFlight, userLat, userLon, radius, trailsRef };
  }, [flights, selectedFlight, userLat, userLon, radius, trailsRef]);

  /**
   * Update the interpolation map with fresh API data.
   * - New flights get their display positions initialised to the API position (no lerp on first frame).
   * - Existing flights get their *targets* updated; the display positions will lerp toward them.
   * - Stale entries (flights no longer in the data) are pruned after INTERP_STALE_MS.
   */
  const updateInterpTargets = (curFlights, now) => {
    const interpMap = interpMapRef.current;
    const liveIds = new Set();

    for (const f of curFlights) {
      liveIds.add(f.id);
      const entry = interpMap.get(f.id);

      if (entry) {
        // Flight already tracked
        // Only update physical position targets if the API actually gave us a physically new position.
        // Otherwise, we keep dead-reckoning the existing target.
        if (f.lat !== entry.lastApiLat || f.lon !== entry.lastApiLon) {
          entry.targetLat = f.lat;
          entry.targetLon = f.lon;
          entry.lastApiLat = f.lat;
          entry.lastApiLon = f.lon;
        }
        // ALWAYS update heading and speed, even if position is stale, so dead-reckoning instantly reacts to turns
        entry.targetHeading = f.heading || 0;
        entry.speed = (f.speed || 0) * 1.852; // knots → km/h
        entry.lastSeen = now;
      } else {
        // New flight — initialise display position to current API position (no snap needed)
        interpMap.set(f.id, {
          displayLat: f.lat,
          displayLon: f.lon,
          displayHeading: f.heading || 0,
          targetLat: f.lat,
          targetLon: f.lon,
          targetHeading: f.heading || 0,
          lastApiLat: f.lat,
          lastApiLon: f.lon,
          speed: (f.speed || 0) * 1.852,
          lastSeen: now,
        });
      }
    }

    // Prune stale entries (flights that have left the radar)
    for (const [id, entry] of interpMap) {
      if (!liveIds.has(id) && now - entry.lastSeen > INTERP_STALE_MS) {
        interpMap.delete(id);
      }
    }
  };

  /**
   * Get the smoothed display position for a single flight.
   * Called once per flight per frame inside the draw loop.
   *
   * 1. Lerp displayLat/Lon toward targetLat/Lon (exponential decay, frame-rate independent)
   * 2. Dead-reckon forward from the *display* position using speed + smoothed heading
   * 3. Lerp heading via shortest-arc
   *
   * Returns { lat, lon, heading } — the position to render this frame.
   */
  const getSmoothedPosition = (flightId, deltaSec) => {
    const entry = interpMapRef.current.get(flightId);
    if (!entry) return null;

    // Clamp deltaSec to avoid huge jumps after tab-switch / long GC pause
    const dt = Math.min(deltaSec, 0.1);

    // --- Heading smoothing (shortest-arc) ---
    const headingT = smoothFactor(0.005, dt); // very smooth heading rotation
    entry.displayHeading = lerpAngle(entry.displayHeading, entry.targetHeading, headingT);

    // --- Position smoothing (exponential decay lerp toward moving target) ---
    const posT = smoothFactor(0.008, dt);
    entry.displayLat += (entry.targetLat - entry.displayLat) * posT;
    entry.displayLon += (entry.targetLon - entry.displayLon) * posT;

    return {
      lat: entry.displayLat,
      lon: entry.displayLon,
      heading: entry.displayHeading,
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      // offsetWidth is reliable — it's the CSS-rendered width of the canvas element
      const size = canvas.offsetWidth || 300;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // Resize now and watch for container changes
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const drawRadar = (timestamp) => {
      // ── Delta-time calculation (frame-rate independent) ──────────────────
      if (!lastFrameTimeRef.current) lastFrameTimeRef.current = timestamp;
      const deltaMs = timestamp - lastFrameTimeRef.current;
      lastFrameTimeRef.current = timestamp;
      const deltaSec = Math.max(deltaMs / 1000, 0.0001); // avoid division by zero

      const s = canvas.offsetWidth || 300;
      const cx = s / 2;
      const cy = s / 2;
      const maxR = s * 0.46;

      const { radius: currentRadius } = stateRef.current;

      ctx.clearRect(0, 0, s, s);
      // Semi-transparent dark overlay so map tiles show through, but darker for Luminous Precision
      ctx.fillStyle = 'rgba(2, 6, 10, 0.35)'; // Darker void
      ctx.fillRect(0, 0, s, s);

      // Draw range rings - Hyper-cyan
      [0.2, 0.4, 0.6, 0.8, 1].forEach((r, i) => {
        ctx.beginPath();
        ctx.arc(cx, cy, maxR * r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 229, 255, ${0.08 + i * 0.02})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        const km = (currentRadius * r).toFixed(1).replace('.0', '');
        ctx.fillStyle = 'rgba(0, 229, 255, 0.25)';
        ctx.font = `${s * 0.018}px Courier New`;
        ctx.textAlign = 'left';
        ctx.fillText(km + 'km', cx + maxR * r * 0.71 + 2, cy - maxR * r * 0.71 - 1);
      });

      // Draw crosshairs
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
      ctx.lineWidth = 1;
      const lines = [
        [cx, cy - maxR, cx, cy + maxR],
        [cx - maxR, cy, cx + maxR, cy],
        [cx - maxR * 0.707, cy - maxR * 0.707, cx + maxR * 0.707, cy + maxR * 0.707],
        [cx + maxR * 0.707, cy - maxR * 0.707, cx - maxR * 0.707, cy + maxR * 0.707],
      ];
      lines.forEach(([x1, y1, x2, y2]) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });

      // Draw sweep — frame-rate independent rotation
      sweepRef.current = (sweepRef.current + SWEEP_DEG_PER_SEC * deltaSec) % 360;
      const sw2 = degreesToRadians(sweepRef.current - 90);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(sw2);

      for (let i = 0; i < 75; i++) {
        const a = degreesToRadians(-i);
        const al = (1 - i / 75) * 0.09;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, maxR, a, a - degreesToRadians(1), true);
        ctx.fillStyle = `rgba(0, 229, 255, ${al})`;
        ctx.fill();
      }

      const lg = ctx.createLinearGradient(0, 0, maxR, 0);
      lg.addColorStop(0, 'rgba(0, 229, 255, 0)');
      lg.addColorStop(1, 'rgba(0, 229, 255, 0.95)');
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(maxR, 0);
      ctx.strokeStyle = lg;
      ctx.lineWidth = 2.0;
      ctx.stroke();
      ctx.restore();

      const now = Date.now();
      const { userLat: curLat, userLon: curLon, radius: curRad, trailsRef: curTrails, flights: curFlights, selectedFlight: curSelFlight } = stateRef.current;

      // ── Update interpolation targets from latest API data ──────────────
      updateInterpTargets(curFlights, now);

      // Draw airports
      ALL_AIRPORTS.forEach(airport => {
        const d = haversine(curLat, curLon, airport.lat, airport.lon);
        if (d > curRad) return;

        const b = bearing(curLat, curLon, airport.lat, airport.lon);
        const px = (d / curRad) * maxR;
        const ax = cx + px * Math.cos(degreesToRadians(b - 90));
        const ay = cy + px * Math.sin(degreesToRadians(b - 90));

        ctx.beginPath();
        ctx.arc(ax, ay, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 229, 255, 0.3)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.1)';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = 'rgba(0, 229, 255, 0.35)';
        ctx.textAlign = 'center';
        ctx.fillText(airport.code, ax, ay + 12);
      });



      const getAircraftVisuals = (f) => {
        const desc = (f.desc || '').toLowerCase();
        const type = (f.type || '').toUpperCase();
        
        const category = f.category || 'civil';

        let sizeMult = 1.0;
        if (/^(A38|B74|B77|B78|A35|A34|A33|C5|C17|AN1)/.test(type) || desc.includes('heavy') || desc.includes('widebody')) {
          sizeMult = 1.6;
        } else if (/^(C17|P28|SR2|C15|C18|R44|B06|DA4|DA6|C20|PA2|PA3)/.test(type) || desc.includes('light') || desc.includes('small') || desc.includes('piper')) {
          sizeMult = 0.65;
        } else if (category === 'military' && !/^(C17|C130|A400)/.test(type)) {
          sizeMult = 0.75; // Fast jets
        } else if (category === 'private') {
          sizeMult = 0.8;
        }

        return { category, sizeMult };
      };

      // ── Draw aircraft (using interpolated positions) ───────────────────
      curFlights.forEach(f => {
        // Get smoothly interpolated position from the interp map
        const smoothed = getSmoothedPosition(f.id, deltaSec);
        if (!smoothed) return; // safety: skip if interp entry missing

        const distKm = haversine(curLat, curLon, smoothed.lat, smoothed.lon);
        const brg = bearing(curLat, curLon, smoothed.lat, smoothed.lon);
        const px = (distKm / curRad) * maxR;
        const bx = cx + px * Math.cos(degreesToRadians(brg - 90));
        const by = cy + px * Math.sin(degreesToRadians(brg - 90));
        const isSel = curSelFlight && curSelFlight.id === f.id;
        const col = isSel ? '#ffaa00' : f.altitude < 3000 ? '#ff003c' : f.onGround ? '#ffaa00' : '#00e5ff';
        
        const { category, sizeMult } = getAircraftVisuals(f);
        const l = s * 0.008 * sizeMult;

        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(degreesToRadians(smoothed.heading)); // use smoothed heading
        ctx.shadowColor = col;
        ctx.shadowBlur = isSel ? 12 : 4;
        ctx.fillStyle = col;

        ctx.beginPath();
        if (category === 'military') {
          // Sharp delta fighter shape
          ctx.moveTo(0, -l * 2.5);
          ctx.lineTo(l * 0.3, -l * 0.5);
          ctx.lineTo(l * 1.5, l * 0.8);
          ctx.lineTo(l * 0.4, l * 0.8);
          ctx.lineTo(l * 0.2, l * 2.0);
          ctx.lineTo(0, l * 1.5);
          ctx.lineTo(-l * 0.2, l * 2.0);
          ctx.lineTo(-l * 0.4, l * 0.8);
          ctx.lineTo(-l * 1.5, l * 0.8);
          ctx.lineTo(-l * 0.3, -l * 0.5);
        } else if (category === 'private') {
          // T-tail swept bizjet
          ctx.moveTo(0, -l * 2.0);
          ctx.bezierCurveTo(l * 0.2, -l * 2.0, l * 0.25, -l * 1.5, l * 0.25, -l * 0.8);
          ctx.lineTo(l * 0.25, 0);
          ctx.lineTo(l * 1.8, l * 0.6);
          ctx.lineTo(l * 1.8, l * 0.9);
          ctx.lineTo(l * 0.25, l * 0.7);
          ctx.lineTo(l * 0.2, l * 1.6);
          // T-Tail
          ctx.lineTo(l * 0.8, l * 1.8);
          ctx.lineTo(l * 0.8, l * 2.1);
          ctx.lineTo(0, l * 2.0);
          ctx.lineTo(-l * 0.8, l * 2.1);
          ctx.lineTo(-l * 0.8, l * 1.8);
          ctx.lineTo(-l * 0.2, l * 1.6);
          ctx.lineTo(-l * 0.25, l * 0.7);
          ctx.lineTo(-l * 1.8, l * 0.9);
          ctx.lineTo(-l * 1.8, l * 0.6);
          ctx.lineTo(-l * 0.25, 0);
          ctx.lineTo(-l * 0.25, -l * 0.8);
          ctx.bezierCurveTo(-l * 0.25, -l * 1.5, -l * 0.2, -l * 2.0, 0, -l * 2.0);
        } else {
          // Standard airliner
          ctx.moveTo(0, -l * 1.8);
          ctx.bezierCurveTo(l * 0.25, -l * 1.8, l * 0.35, -l * 1.4, l * 0.35, -l * 0.8);
          ctx.lineTo(l * 0.35, -l * 0.3);
          ctx.lineTo(l * 2.2, l * 0.5);
          ctx.lineTo(l * 2.2, l * 0.8);
          ctx.lineTo(l * 0.35, l * 0.6);
          ctx.lineTo(l * 0.25, l * 1.5);
          ctx.lineTo(l * 1.0, l * 1.8);
          ctx.lineTo(l * 1.0, l * 2.1);
          ctx.lineTo(0, l * 1.9);
          ctx.lineTo(-l * 1.0, l * 2.1);
          ctx.lineTo(-l * 1.0, l * 1.8);
          ctx.lineTo(-l * 0.25, l * 1.5);
          ctx.lineTo(-l * 0.35, l * 0.6);
          ctx.lineTo(-l * 2.2, l * 0.8);
          ctx.lineTo(-l * 2.2, l * 0.5);
          ctx.lineTo(-l * 0.35, -l * 0.3);
          ctx.lineTo(-l * 0.35, -l * 0.8);
          ctx.bezierCurveTo(-l * 0.35, -l * 1.4, -l * 0.25, -l * 1.8, 0, -l * 1.8);
        }
        ctx.closePath();
        ctx.fill();

        // Draw tail lights for all categories
        const lightColor = category === 'private' ? '#00e5ff' : 
                           category === 'cargo' ? '#ff8800' : 
                           category === 'military' ? '#ff0000' :
                           '#ffffff';
          
          // Flash effect based on time
          const flash = Math.sin(now / 150) > 0.5 ? 1 : 0.4;
          
          ctx.beginPath();
          // Base radius on screen size (s) rather than aircraft length (l) so it doesn't shrink too much
          const lightRadius = s * 0.006;
          ctx.arc(0, l * 1.9, lightRadius, 0, Math.PI * 2);
          ctx.fillStyle = lightColor;
          ctx.globalAlpha = flash;
          ctx.shadowColor = lightColor;
          ctx.shadowBlur = 18 * flash;
          ctx.fill();
          ctx.globalAlpha = 1.0; // reset

        ctx.restore();

        ctx.font = `${s * 0.016}px Courier New`;
        ctx.fillStyle = `rgba(${isSel ? '255, 170, 0' : '0, 229, 255'}, 0.65)`;
        ctx.textAlign = 'center';
        ctx.fillText(f.callsign, bx, by - (12 + l));
      });

      // Draw user position
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#00e5ff';
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;

      const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 480);
      ctx.beginPath();
      ctx.arc(cx, cy, 7 + pulse * 6, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 229, 255, ${0.4 - pulse * 0.3})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = `bold ${s * 0.016}px Courier New`;
      ctx.fillStyle = 'rgba(0, 229, 255, 0.45)';
      ctx.textAlign = 'center';
      ctx.fillText('ORG', cx, cy - 14);

      animRefRef.current = requestAnimationFrame(drawRadar);
    };

    // Kick off with rAF (timestamp-based) instead of bare call
    animRefRef.current = requestAnimationFrame(drawRadar);

    return () => {
      if (animRefRef.current) cancelAnimationFrame(animRefRef.current);
      ro.disconnect();
      // Clear the interpolation map on unmount to free memory
      interpMapRef.current.clear();
      lastFrameTimeRef.current = null;
    };
  }, []);

  /**
   * Click handler — uses the interpolation map's display positions so click
   * targets match the visually rendered aircraft positions exactly.
   */
  const handleCanvasClick = (e) => {
    if (!onSelectFlight || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const size = canvas.offsetWidth || 300;
    const cx = size / 2;
    const cy = size / 2;
    const maxR = size * 0.46;

    let closestFlight = null;
    let minDist = Infinity;

    const { flights: currFlights, userLat: cLat, userLon: cLon, radius: cRad } = stateRef.current;
    const interpMap = interpMapRef.current;

    currFlights.forEach(f => {
      // Use interpolated display position so click targets match rendered positions
      const entry = interpMap.get(f.id);
      const lat = entry ? entry.displayLat : f.lat;
      const lon = entry ? entry.displayLon : f.lon;

      const distKm = haversine(cLat, cLon, lat, lon);
      const brg = bearing(cLat, cLon, lat, lon);
      const px = (distKm / cRad) * maxR;
      const bx = cx + px * Math.cos(degreesToRadians(brg - 90));
      const by = cy + px * Math.sin(degreesToRadians(brg - 90));
      const dx = clickX - bx;
      const dy = clickY - by;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 15 && dist < minDist) {
        minDist = dist;
        closestFlight = f;
      }
    });

    if (closestFlight) {
      onSelectFlight(closestFlight);
    } else {
      onSelectFlight(null);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      className="absolute inset-0 w-full h-full block cursor-pointer touch-none select-none"
      style={{ zIndex: 1 }}
    />
  );
}
