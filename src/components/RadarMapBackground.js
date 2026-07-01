'use client';

import { useMemo } from 'react';

// Convert lat/lon + zoom to OSM tile coordinates
function latLonToTile(lat, lon, zoom) {
  const n = Math.pow(2, zoom);
  const x = Math.floor((lon + 180) / 360 * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
  return { x, y };
}

// Pixel offset of lat/lon from tile origin
function tilePixelOffset(lat, lon, zoom, tileX, tileY) {
  const n = Math.pow(2, zoom);
  const worldX = ((lon + 180) / 360) * n * 256;
  const latRad = (lat * Math.PI) / 180;
  const worldY = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n * 256;
  const tileOriginX = tileX * 256;
  const tileOriginY = tileY * 256;
  return { px: worldX - tileOriginX, py: worldY - tileOriginY };
}

const SUBDOMAINS = ['a', 'b', 'c'];

export default function RadarMapBackground({ userLat, userLon, radius }) {
  const zoom = radius <= 10 ? 13 : radius <= 25 ? 12 : radius <= 50 ? 11 : 10;

  const { tiles, centerPx } = useMemo(() => {
    const center = latLonToTile(userLat, userLon, zoom);
    const offset = tilePixelOffset(userLat, userLon, zoom, center.x, center.y);

    // Render a 5x5 grid of tiles centered on the user location
    const range = 2;
    const tileList = [];
    for (let dy = -range; dy <= range; dy++) {
      for (let dx = -range; dx <= range; dx++) {
        const tx = center.x + dx;
        const ty = center.y + dy;
        const sub = SUBDOMAINS[(tx + ty) % 3];
        tileList.push({
          key: `${tx}-${ty}`,
          url: `https://${sub}.tile.openstreetmap.org/${zoom}/${tx}/${ty}.png`,
          left: dx * 256 - offset.px,
          top: dy * 256 - offset.py,
        });
      }
    }

    return { tiles: tileList, centerPx: { x: offset.px, y: offset.py } };
  }, [userLat, userLon, zoom]);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* Tile grid, centered on user position */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 0,
          height: 0,
        }}
      >
        {tiles.map(tile => (
          <img
            key={tile.key}
            src={tile.url}
            alt=""
            width={256}
            height={256}
            style={{
              position: 'absolute',
              left: tile.left,
              top: tile.top,
              width: 256,
              height: 256,
              maxWidth: 'none',
              imageRendering: 'pixelated',
              filter: 'brightness(0.55) saturate(0.3) hue-rotate(170deg)',
              display: 'block',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        ))}
      </div>
    </div>
  );
}
