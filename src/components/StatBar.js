'use client';

import { useEffect, useState } from 'react';

function formatTime(date) {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

export default function StatBar({ flights = 0, radius = 100, maxAlt = 0 }) {
  const [timeStr, setTimeStr] = useState('--:--');

  useEffect(() => {
    const updateTime = () => setTimeStr(formatTime(new Date()));
    updateTime();
    const timer = setInterval(updateTime, 60_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid grid-cols-4 gap-2 px-2.5 py-2 border-b border-cyan/15 bg-surface flex-shrink-0 text-xs">
      <div className="text-center">
        <div className="font-mono font-bold text-base text-cyan drop-shadow-[0_0_8px_#00c8ff]">{flights}</div>
        <div className="text-tdim font-mono tracking-widest mt-0.5">Aircraft</div>
      </div>
      <div className="text-center">
        <div className="font-mono font-bold text-base text-cyan drop-shadow-[0_0_8px_#00c8ff]">{radius} km</div>
        <div className="text-tdim font-mono tracking-widest mt-0.5">Radius</div>
      </div>
      <div className="text-center">
        <div className="font-mono font-bold text-base text-cyan drop-shadow-[0_0_8px_#00c8ff]">
          {maxAlt > 0 ? `${(maxAlt / 1000).toFixed(1)}k` : '—'}
        </div>
        <div className="text-tdim font-mono tracking-widest mt-0.5">Max Alt</div>
      </div>
      <div className="text-center">
        <div className="font-mono font-bold text-base text-cyan drop-shadow-[0_0_8px_#00c8ff]">{timeStr}</div>
        <div className="text-tdim font-mono tracking-widest mt-0.5">Updated</div>
      </div>
    </div>
  );
}
