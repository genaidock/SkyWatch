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
    <div className="flex border-b border-neutral bg-surface flex-shrink-0 z-10">
      <div className="flex-1 flex flex-col items-center justify-center py-4 px-2 border-r border-neutral">
        <div className="text-sm font-bold font-display text-slate-900">{flights}</div>
        <div className="text-[10px] text-slate-500 font-sans tracking-wide mt-0.5">Aircraft</div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center py-4 px-2 border-r border-neutral">
        <div className="text-sm font-bold font-display text-slate-900">{radius} km</div>
        <div className="text-[10px] text-slate-500 font-sans tracking-wide mt-0.5">Radius</div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center py-4 px-2 border-r border-neutral">
        <div className="text-sm font-bold font-display text-slate-900">
          {maxAlt > 0 ? `${(maxAlt / 1000).toFixed(1)}k` : '—'}
        </div>
        <div className="text-[10px] text-slate-500 font-sans tracking-wide mt-0.5">Max Alt</div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center py-4 px-2">
        <div className="text-sm font-bold font-display text-slate-900">{timeStr}</div>
        <div className="text-[10px] text-slate-500 font-sans tracking-wide mt-0.5">Updated</div>
      </div>
    </div>
  );
}
