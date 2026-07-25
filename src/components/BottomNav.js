'use client';

export default function BottomNav({ currentScreen, onScreenChange }) {
  const screens = [
    { id: 'radar', icon: '🛰️', label: 'RADAR' },
    { id: 'flights', icon: '✈️', label: 'FLIGHTS' },
    { id: 'alerts', icon: '🔔', label: 'ALERTS' },
    { id: 'settings', icon: '⚙️', label: 'SETTINGS' },
  ];

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex bg-surface/90 backdrop-blur-md border border-neutral shadow-lg shadow-neutral/50 rounded-full px-2 py-1 z-50 w-[90%] max-w-sm">
      {screens.map(screen => (
        <button
          key={screen.id}
          onClick={() => onScreenChange(screen.id)}
          className={`flex-1 flex flex-col items-center gap-1 py-2 px-3 mx-1 rounded-full cursor-pointer transition-all ${
            currentScreen === screen.id
              ? 'bg-cyan text-white shadow-sm'
              : 'text-tdim hover:bg-neutral/50'
          }`}
        >
          <div className="text-lg">{screen.icon}</div>
          <div className="text-[10px] tracking-widest font-display font-bold">{screen.label}</div>
        </button>
      ))}
    </div>
  );
}
