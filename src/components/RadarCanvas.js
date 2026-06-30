'use client';

import { useEffect, useRef } from 'react';
import { bearing, haversine, degreesToRadians } from '@/lib/utils';

export default function RadarCanvas({ flights = [], selectedFlight = null, userLat = 0, userLon = 0, radius = 100, onSelectFlight, trailsRef }) {
  const canvasRef = useRef(null);
  const animRefRef = useRef(null);
  const sweepRef = useRef(0);

  const getExtrapolatedPosition = (f, now) => {
    const elapsedSec = Math.max(0, (now - (f.lastUpdated || now)) / 1000);
    // Convert speed (knots) to km/h, then distance in km
    const speedKmh = (f.speed || 0) * 1.852;
    const distanceKm = (speedKmh / 3600) * elapsedSec;

    const headingRad = degreesToRadians(f.heading || 0);
    const latRad = degreesToRadians(f.lat);

    // Approximate lat/lon change
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
    const rect = canvas.parentElement.getBoundingClientRect();
    const size = rect.width;

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);

    const drawRadar = () => {
      const s = size;
      const cx = s / 2;
      const cy = s / 2;
      const maxR = s * 0.46;

      ctx.clearRect(0, 0, s, s);
      ctx.fillStyle = '#040d14';
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
        ctx.font = `${size * 0.019}px Courier New`;
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

      // Draw flight trails
      if (trailsRef?.current) {
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

      // Draw aircraft
      flights.forEach(f => {
        const pos = getExtrapolatedPosition(f, now);
        
        const px = (pos.distKm / radius) * maxR;
        const bx = cx + px * Math.cos(degreesToRadians(pos.bearing - 90));
        const by = cy + px * Math.sin(degreesToRadians(pos.bearing - 90));
        const isSel = selectedFlight && selectedFlight.id === f.id;
        const col = isSel ? '#ffb300' : f.altitude < 3000 ? '#ff3b3b' : f.onGround ? '#ffb300' : '#00ff9d';

        const l = size * 0.008; // Base scale for the airplane shape

        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(degreesToRadians(f.heading));
        
        // Add a subtle glow to the plane itself
        ctx.shadowColor = col;
        ctx.shadowBlur = isSel ? 12 : 4;
        
        ctx.beginPath();
        // Nose
        ctx.moveTo(0, -l * 1.8);
        // Right nose/fuselage
        ctx.bezierCurveTo(l * 0.25, -l * 1.8, l * 0.35, -l * 1.4, l * 0.35, -l * 0.8);
        ctx.lineTo(l * 0.35, -l * 0.3);
        // Right wing
        ctx.lineTo(l * 2.2, l * 0.5);
        ctx.lineTo(l * 2.2, l * 0.8);
        ctx.lineTo(l * 0.35, l * 0.6);
        // Right fuselage to tail
        ctx.lineTo(l * 0.25, l * 1.5);
        // Right tail wing
        ctx.lineTo(l * 1.0, l * 1.8);
        ctx.lineTo(l * 1.0, l * 2.1);
        ctx.lineTo(0, l * 1.9); // Center tail
        // Left tail wing
        ctx.lineTo(-l * 1.0, l * 2.1);
        ctx.lineTo(-l * 1.0, l * 1.8);
        // Left fuselage from tail
        ctx.lineTo(-l * 0.25, l * 1.5);
        // Left wing
        ctx.lineTo(-l * 0.35, l * 0.6);
        ctx.lineTo(-l * 2.2, l * 0.8);
        ctx.lineTo(-l * 2.2, l * 0.5);
        ctx.lineTo(-l * 0.35, -l * 0.3);
        // Left nose/fuselage
        ctx.lineTo(-l * 0.35, -l * 0.8);
        ctx.bezierCurveTo(-l * 0.35, -l * 1.4, -l * 0.25, -l * 1.8, 0, -l * 1.8);
        ctx.closePath();
        
        ctx.fillStyle = col;
        ctx.fill();
        ctx.restore();

        // Draw callsign
        ctx.font = `${size * 0.018}px Courier New`;
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

      ctx.font = `bold ${size * 0.019}px Courier New`;
      ctx.fillStyle = 'rgba(0,200,255,0.48)';
      ctx.textAlign = 'center';
      ctx.fillText('YOU', cx, cy - 14);

      animRefRef.current = requestAnimationFrame(drawRadar);
    };

    drawRadar();

    return () => {
      if (animRefRef.current) cancelAnimationFrame(animRefRef.current);
    };
  }, [flights, selectedFlight, radius, userLat, userLon, trailsRef]);

  const handleCanvasClick = (e) => {
    if (!onSelectFlight || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    const size = rect.width;
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

    if (closestFlight) {
      onSelectFlight(closestFlight);
    }
  };

  return (
    <div 
      className="relative mx-auto bg-gradient-radial from-cyan/5 to-bg flex-shrink-0 cursor-pointer"
      style={{ width: '100%', maxWidth: 'min(100%, 60vh)', aspectRatio: '1 / 1' }}
    >
      <canvas ref={canvasRef} onClick={handleCanvasClick} className="w-full h-full block" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1 left-1/2 -translate-x-1/2 font-mono text-xs text-cyan/28">N</div>
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 font-mono text-xs text-cyan/28">S</div>
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 font-mono text-xs text-cyan/28">E</div>
        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 font-mono text-xs text-cyan/28">W</div>
      </div>
    </div>
  );
}
