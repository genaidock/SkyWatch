'use client';

export default function BottomNav({ currentScreen, onScreenChange }) {
  const screens = [
    { id: 'radar', icon: '🛰️', label: 'RADAR' },
    { id: 'flybys', icon: '🔭', label: 'FLYBYS' },
    { id: 'alerts', icon: '🔔', label: 'ALERTS' },
    { id: 'settings', icon: '⚙️', label: 'SETTINGS' },
  ];

  return (
    <div className="flex bg-black/70 border-t border-cyan/15 backdrop-blur-sm flex-shrink-0 z-50">
      {screens.map(screen => (
        <button
          key={screen.id}
          onClick={() => onScreenChange(screen.id)}
          className={`flex-1 flex flex-col items-center gap-1 py-2 cursor-pointer transition-all ${
            currentScreen === screen.id
              ? 'text-cyan drop-shadow-[0_0_6px_#00c8ff]'
              : 'text-tdim'
          }`}
        >
          <div className="text-xl">{screen.icon}</div>
          <div className="text-xs tracking-widest font-mono">{screen.label}</div>
        </button>
      ))}
    </div>
  );
}
