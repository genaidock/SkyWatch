# SkyWatch Flight Radar - Next.js Migration Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed

### Setup Steps

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open http://localhost:3000 in your browser
```

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── proxy/route.js          # CORS proxy API route
│   ├── layout.js                   # Root layout with providers
│   ├── page.js                     # Main app component
│   └── globals.css                 # Global styles with Tailwind
├── components/
│   ├── screens/
│   │   ├── RadarScreen.js
│   │   ├── FlightsScreen.js
│   │   ├── AlertsScreen.js
│   │   ├── SettingsScreen.js
│   │   └── DetailScreen.js
│   ├── Header.js
│   ├── BottomNav.js
│   ├── Toast.js
│   ├── LocationModal.js
│   ├── RadarCanvas.js
│   ├── FlightCards.js
│   └── ... other components
├── context/
│   └── FlightContext.js            # Global state management
└── lib/
    └── utils.js                    # Shared utilities & data

```

## 🔄 What Changed from Original

### Before (Vanilla JS)
- Monolithic `index.html` with 2000+ lines
- Inline styles and scripts
- Manual DOM manipulation
- No state management

### After (Next.js + React)
- ✅ Component-based architecture
- ✅ Tailwind CSS styling
- ✅ React Context for state
- ✅ API routes for CORS proxy
- ✅ Built-in optimizations
- ✅ Modern tooling (Hot reload, etc.)

## 🛠️ Key Features Implemented

- **Flight Data Fetching** - Multiple API sources with fallback
- **Interactive Radar Canvas** - Animated with requestAnimationFrame
- **Flight Cards** - Sortable, filterable lists
- **Location Management** - GPS + manual coordinates
- **Alerts System** - Real-time notifications
- **Settings Panel** - API key management
- **Responsive Design** - Mobile-optimized UI

## 📡 API Integration

The app proxies requests through `/api/proxy` to bypass CORS issues:

```javascript
// Original request
fetch('https://api.airplanes.live/v2/point/...')

// Proxied through Next.js
fetch('/api/proxy?url=' + encodeURIComponent('https://api.airplanes.live/...'))
```

## 🎨 Styling with Tailwind

Custom colors defined in `tailwind.config.js`:
- `bg` - Dark background (#040d14)
- `cyan` - Primary accent (#00c8ff)
- `green` - Secondary accent (#00ff9d)
- `panel` - Card backgrounds
- And more...

## 📦 State Management with React Context

Global app state in `FlightContext`:
- Flights list
- User location
- Selected flight
- API status
- Alerts

## 🚀 Building for Production

```bash
# Build
npm run build

# Start production server
npm start
```

## 📝 Migration Checklist

- [x] Project setup
- [x] Component structure
- [x] State management
- [x] API routes
- [x] Styling (Tailwind)
- [ ] Flight data fetching (implement fetchFlights)
- [ ] Location tracking (geolocation API)
- [ ] Service worker (PWA support)
- [ ] Testing
- [ ] Deployment

## ⚠️ Next Steps

1. **Implement Flight Fetching**
   - Create `src/lib/flightApi.js` with fetch logic
   - Integrate with FlightContext
   - Add error handling

2. **Enable Location Services**
   - Request geolocation permissions
   - Update location in context
   - Auto-refresh flights

3. **PWA Setup**
   - Move `public/sw.js` to public folder
   - Update service worker for Next.js
   - Add install prompts

4. **Testing & Deployment**
   - Test on mobile devices
   - Deploy to Vercel (recommended for Next.js)
   - Configure environment variables

## 🔗 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [React Context API](https://react.dev/reference/react/useContext)
- [Flight Data APIs](https://github.com/Mictronics/airplanes.live)

## 📄 License

Original SkyWatch concept, now modernized with Next.js!
