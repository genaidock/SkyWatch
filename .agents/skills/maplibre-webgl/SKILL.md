---
name: maplibre-webgl
description: "Novice guidelines for building high-performance 2D/3D interactive maps using MapLibre GL JS, featuring advanced UX techniques and dead reckoning."
category: frontend
risk: safe
source: community
tags: "[maplibre, mapbox, webgl, react-map-gl, maps, geospatial, ux, animation]"
date_added: "2026-07-25"
---

# MapLibre WebGL Mapping (Novice Level)

## Purpose
To provide expert guidance on implementing, optimizing, and migrating to WebGL-based maps using **MapLibre GL JS** and **react-map-gl**, with a strong focus on high-end UI/UX and 60fps animations.

## When to Use This Skill
- When migrating a map from Leaflet or Google Maps to a WebGL engine.
- When rendering massive geospatial datasets (thousands of points, lines, or polygons).
- When implementing 3D map features (terrain, pitch, 3D buildings).
- When you need smooth, native-feeling animations for moving entities (like flights or vehicles).

## Core Best Practices

### 1. The React Wrapper (`react-map-gl`)
Always use `react-map-gl` to integrate MapLibre into React apps. Import `maplibre` explicitly to avoid Mapbox telemetry.
```tsx
import Map from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
```

### 2. Free Tile Sources
MapLibre needs a `mapStyle` JSON that defines where to download tiles.
- **Dark Mode:** `https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json`
- **Light Mode:** `https://basemaps.cartocdn.com/gl/positron-gl-style/style.json`

### 3. High-Performance Movement (Dead Reckoning)
When rendering live tracking data (e.g., airplanes) that only updates every few seconds, the markers will "teleport". To achieve a smooth 60fps glide:
- **DO NOT** update a React `useState` at 60fps. It will cause cascading re-renders.
- **DO** use a `requestAnimationFrame` (RAF) loop that manually projects the coordinates based on `speed` and `heading`.
- **DO** inject the updated GeoJSON directly into the MapLibre source using `map.getSource('id').setData()`.

**Interpolation Math (Knots to Degrees):**
```javascript
// 1 knot = 1 nautical mile/hr = 1/60th degree of lat/hr
const speedDegPerSec = (speedInKnots / 60) / 3600;
const dy = Math.cos(heading * Math.PI / 180) * speedDegPerSec * dt;
const dx = Math.sin(heading * Math.PI / 180) * speedDegPerSec * dt / Math.cos(lat * Math.PI / 180);
```

### 4. Advanced Layering (Dynamic Glows & Strobes)
You can create incredibly rich visual effects by layering multiple MapLibre WebGL layers bound to the exact same GeoJSON source. Order matters: layers defined later render *on top* of earlier layers.

Example Stack for an Airplane:
1. `type: 'circle'` - Large, blurred, semi-transparent circle (Ambient Aura).
2. `type: 'symbol'` - The actual airplane SVG icon.
3. `type: 'circle'` - Small, highly opaque circle with a colored stroke (Blinking Strobe).

To animate a strobe, use a simple React `setInterval` that toggles a boolean, and pass that boolean into the `circle-opacity` paint property!

### 5. Custom SVG Icons & Data URI Traps
When passing dynamic SVG strings into `map.addImage()`, you must encode them properly. If the SVG contains filters or hex colors (e.g., `url(#glow)` or `fill="#ff0000"`), the `#` character will break the Data URI parser, resulting in black or invisible icons.

**Crucial Fix:**
```javascript
const img = new Image();
// NEVER do this: img.src = \`data:image/svg+xml;charset=utf-8,\${svgString}\`
// ALWAYS do this:
img.src = \`data:image/svg+xml;charset=utf-8,\${encodeURIComponent(svgString)}\`;
```
