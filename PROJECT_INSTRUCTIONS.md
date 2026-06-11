# Project & Feature Level Instructions

## Architecture Rules
1. **App Router**: Use Next.js App Router conventions. Pages should be in `src/app`.
2. **Client Components**: Because of heavy interactivity (canvas, maps), most UI components require `'use client'`. Keep server components at the layout level unless data fetching can be server-side.
3. **SPA Navigation**: The app uses an SPA approach inside `src/app/page.js` to switch screens (Radar, Flights, Alerts, Settings, Detail). Do not create new routes in `src/app` unless necessary for entirely separate web pages.
4. **State Management**: Use `FlightContext` (`src/context/FlightContext.js`) for global state (flights, location, alerts, API keys).
5. **Data Fetching**: Always use `src/lib/flightApi.js` to fetch flight data. The app relies on `/api/proxy` to avoid CORS issues with external flight APIs. Do not fetch third-party APIs directly from the client without the proxy.

## Feature Implementation Guidelines

### 1. Adding a New Screen
- Add the screen component in `src/components/screens/`.
- Ensure it receives necessary props (e.g., `onShowToast`).
- Register it in `src/app/page.js`'s `renderScreen` switch statement.
- Update `BottomNav.js` if it should be accessible from the main navigation.

### 2. Modifying Flight API Parsers
- If adding a new data source, add the parser to `src/lib/flightApi.js`.
- Make sure to map the incoming data exactly to the normalized flight object structure (e.g., `id`, `callsign`, `lat`, `lon`, `altitude`, `speed`, `heading`, `vertRate`, `onGround`, `squawk`, `type`, `distKm`, `from`, `to`, `progress`, `firstSeen`, `source`).
- Update `fetchFlights` to include the new source.

### 3. Styling
- Use Tailwind CSS exclusively.
- Rely on defined theme colors from `tailwind.config.js` (e.g., `bg-bg`, `text-text`, `text-cyan`, `bg-panel`).
- Ensure all screens are mobile-optimized first.
- Utilize micro-animations and hover effects to maintain a rich, dynamic aesthetic.

### 4. Alerts System
- If implementing new alerts, dispatch them via `FlightContext` or local state based on altitude/speed thresholds.

### 5. Location and PWA
- When implementing Geolocation, ensure a graceful fallback to a default location or a manual coordinate entry (`LocationModal.js`).
- PWA must be configured with standard service worker patterns. Next.js PWA approaches (like `next-pwa`) or native `public/sw.js` are acceptable.
