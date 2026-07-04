'use client';

import { useEffect, useRef } from 'react';
import { bearing, haversine, degreesToRadians, ALL_AIRPORTS } from '@/lib/utils';

export default function RadarCanvas({ flights = [], selectedFlight = null, userLat = 0, userLon = 0, radius = 100, onSelectFlight, trailsRef }) {
  const canvasRef = useRef(null);
  const animRefRef = useRef(null);
  const sweepRef = useRef(0);

  const getExtrapolatedPosition = (f, now) => {
    const elapsedSec = Math.max(0, (now - (f.lastUpdated || now)) / 1000);
    const speedKmh = (f.speed || 0) * 1.852;
    const distanceKm = (speedKmh / 3600) * elapsedSec;
    const headingRad = degreesToRadians(f.heading || 0);
    const latRad = degreesToRadians(f.lat);
    const deltaLat = (distanceKm * Math.cos(headingRad)) / 111.32;
    const deltaLon = (distanceKm * Math.sin(headingRad)) / (111.32 * Math.cos(latRad));
    const currentLat = f.lat + deltaLat;
    const currentLon = f.lon + deltaLon;
    return {
      lat: currentLat,
      lon: currentLon,
      distKm: haversine(userLat, userLon, currentLat, currentLon),
      bearing: bearing(userLat, userLon, currentLat, currentLon),
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

    const drawRadar = () => {
      const s = canvas.offsetWidth || 300;
      const cx = s / 2;
      const cy = s / 2;
      const maxR = s * 0.46;

      ctx.clearRect(0, 0, s, s);
      // Semi-transparent dark overlay so map tiles show through
      ctx.fillStyle = 'rgba(4, 13, 20, 0.15)';
      ctx.fillRect(0, 0, s, s);

      // Draw range rings
      [0.2, 0.4, 0.6, 0.8, 1].forEach((r, i) => {
        ctx.beginPath();
        ctx.arc(cx, cy, maxR * r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,200,255,${0.05 + i * 0.012})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        const km = (radius * r).toFixed(1).replace('.0', '');
        ctx.fillStyle = 'rgba(0,200,255,0.16)';
        ctx.font = `${s * 0.019}px Courier New`;
        ctx.textAlign = 'left';
        ctx.fillText(km + 'km', cx + maxR * r * 0.71 + 2, cy - maxR * r * 0.71 - 1);
      });

      // Draw crosshairs
      ctx.strokeStyle = 'rgba(0,200,255,0.055)';
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

      // Draw sweep
      sweepRef.current = (sweepRef.current + 0.32) % 360;
      const sw2 = degreesToRadians(sweepRef.current - 90);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(sw2);

      for (let i = 0; i < 75; i++) {
        const a = degreesToRadians(-i);
        const al = (1 - i / 75) * 0.075;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, maxR, a, a - degreesToRadians(1), true);
        ctx.fillStyle = `rgba(0,200,255,${al})`;
        ctx.fill();
      }

      const lg = ctx.createLinearGradient(0, 0, maxR, 0);
      lg.addColorStop(0, 'rgba(0,200,255,0)');
      lg.addColorStop(1, 'rgba(0,200,255,0.85)');
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(maxR, 0);
      ctx.strokeStyle = lg;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      const now = Date.now();

      // Draw airports
      ALL_AIRPORTS.forEach(airport => {
        const d = haversine(userLat, userLon, airport.lat, airport.lon);
        if (d > radius) return;

        const b = bearing(userLat, userLon, airport.lat, airport.lon);
        const px = (d / radius) * maxR;
        const ax = cx + px * Math.cos(degreesToRadians(b - 90));
        const ay = cy + px * Math.sin(degreesToRadians(b - 90));

        ctx.beginPath();
        ctx.arc(ax, ay, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(250, 204, 21, 0.8)'; // yellow-400 with opacity
        ctx.fill();
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.3)';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = 'rgba(250, 204, 21, 0.9)';
        ctx.textAlign = 'center';
        ctx.fillText(airport.code, ax, ay + 14);
      });

      const project = (lat, lon) => {
        const d = haversine(userLat, userLon, lat, lon);
        const b = bearing(userLat, userLon, lat, lon);
        const px = (d / radius) * maxR;
        return {
          x: cx + px * Math.cos(degreesToRadians(b - 90)),
          y: cy + px * Math.sin(degreesToRadians(b - 90)),
          dist: d,
        };
      };

      // Draw flight path for selected flight
      if (selectedFlight && selectedFlight.routeObj) {
        const rObj = selectedFlight.routeObj;
        if (rObj.depLat && rObj.depLon && rObj.arrLat && rObj.arrLon) {
          const dep = project(rObj.depLat, rObj.depLon);
          const arr = project(rObj.arrLat, rObj.arrLon);
          
          ctx.beginPath();
          ctx.moveTo(dep.x, dep.y);
          ctx.lineTo(arr.x, arr.y);
          ctx.setLineDash([6, 6]);
          ctx.strokeStyle = 'rgba(255, 179, 0, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.setLineDash([]);

          // Draw origin marker
          ctx.beginPath();
          ctx.arc(dep.x, dep.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#ffb300';
          ctx.fill();
          
          // Draw destination marker
          ctx.beginPath();
          ctx.arc(arr.x, arr.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#ffb300';
          ctx.fill();
        }
      }

      // Draw flight trails
      if (trailsRef?.current) {
        trailsRef.current.forEach((pts) => {
          if (pts.length < 2) return;
          const coords = pts.map(p => project(p.lat, p.lon));
          const cutoff = coords.filter(c => c.dist <= radius);
          if (cutoff.length < 2) return;
          for (let i = 1; i < cutoff.length; i++) {
            const t = i / cutoff.length;
            ctx.beginPath();
            ctx.moveTo(cutoff[i - 1].x, cutoff[i - 1].y);
            ctx.lineTo(cutoff[i].x, cutoff[i].y);
            ctx.strokeStyle = `rgba(0,255,157,${(1 - t) * 0.35})`;
            ctx.lineWidth = 1.5 - t * 0.8;
            ctx.stroke();
          }
        });
      }

      const getAircraftVisuals = (f) => {
        const desc = (f.desc || '').toLowerCase();
        const type = (f.type || '').toUpperCase();
        
        let category = 'civil';
        if (/military|air force|navy|army|coast guard|nato|fighter|bomber/.test(desc) || /^(F16|F35|C17|C130|EUFI|B52|A400|V22)$/.test(type)) {
          category = 'military';
        } else if (/gulfstream|challenger|citation|falcon|learjet|legacy|bizjet/.test(desc) || /^(GLF|C56|CL3|F2TH|E55|E50|BE2|BE9|PC12|PC24)/.test(type)) {
          category = 'private';
        }

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

      // Draw aircraft
      flights.forEach(f => {
        const pos = getExtrapolatedPosition(f, now);
        const px = (pos.distKm / radius) * maxR;
        const bx = cx + px * Math.cos(degreesToRadians(pos.bearing - 90));
        const by = cy + px * Math.sin(degreesToRadians(pos.bearing - 90));
        const isSel = selectedFlight && selectedFlight.id === f.id;
        const col = isSel ? '#ffb300' : f.altitude < 3000 ? '#ff3b3b' : f.onGround ? '#ffb300' : '#00ff9d';
        
        const { category, sizeMult } = getAircraftVisuals(f);
        const l = s * 0.008 * sizeMult;

        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(degreesToRadians(f.heading));
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
        ctx.restore();

        ctx.font = `${s * 0.018}px Courier New`;
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.textAlign = 'center';
        ctx.fillText(f.callsign, bx, by - 12);
      });

      // Draw user position
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#00c8ff';
      ctx.shadowColor = '#00c8ff';
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.shadowBlur = 0;

      const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 480);
      ctx.beginPath();
      ctx.arc(cx, cy, 9 + pulse * 5, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0,200,255,${0.32 - pulse * 0.22})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = `bold ${s * 0.019}px Courier New`;
      ctx.fillStyle = 'rgba(0,200,255,0.48)';
      ctx.textAlign = 'center';
      ctx.fillText('YOU', cx, cy - 14);

      animRefRef.current = requestAnimationFrame(drawRadar);
    };

    drawRadar();

    return () => {
      if (animRefRef.current) cancelAnimationFrame(animRefRef.current);
      ro.disconnect();
    };
  }, [flights, selectedFlight, radius, userLat, userLon, trailsRef]);

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
    const now = Date.now();

    flights.forEach(f => {
      const pos = getExtrapolatedPosition(f, now);
      const px = (pos.distKm / radius) * maxR;
      const bx = cx + px * Math.cos(degreesToRadians(pos.bearing - 90));
      const by = cy + px * Math.sin(degreesToRadians(pos.bearing - 90));
      const dx = clickX - bx;
      const dy = clickY - by;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 15 && dist < minDist) {
        minDist = dist;
        closestFlight = f;
      }
    });

    if (closestFlight) onSelectFlight(closestFlight);
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
