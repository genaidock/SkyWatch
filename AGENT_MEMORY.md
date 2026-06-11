# SkyWatch - Agent Memory

## Project Overview
SkyWatch is a Live Flight Radar web application. It was originally a monolithic vanilla JS app and has recently been migrated to Next.js 14 (App Router) using React 18 and Tailwind CSS. It tracks aircraft in real-time using ADS-B data from multiple sources.

## Current State
- **Architecture**: Next.js App Router (`src/app`), React Context for global state (`src/context`), and component-based UI (`src/components`). The main view (`src/app/page.js`) acts as a Single Page Application (SPA), rendering different "screens" (Radar, Flights, Alerts, Settings, Detail) conditionally based on state.
- **Data Fetching**: Implemented in `src/lib/flightApi.js`. Uses a Next.js API route (`/api/proxy/route.js`) to bypass CORS when calling third-party flight APIs (Airplanes.live, ADS-B.lol, AviationStack, AirLabs).
- **Styling**: Tailwind CSS with custom theme colors (`bg`, `cyan`, `green`, `panel`).
- **Pending/Next Steps** (From Migration Guide & observation):
  - Location tracking (Geolocation API integration).
  - Service Worker (PWA support) migration.
  - Testing and Deployment preparations.

## Core Technologies
- Framework: Next.js 14, React 18
- Styling: Tailwind CSS
- State Management: React Context API
- Tools: Bun (package manager), Node.js 18+
