'use client';

export default function Header({ title, subtitle, liveIndicator = false }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-neutral/10 flex-shrink-0">
      <div>
        <div className="font-mono font-black text-lg text-white tracking-widest drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
          {title}
        </div>
        <div className="font-mono text-xs text-tdim tracking-widest mt-0.5">{subtitle}</div>
      </div>
      {liveIndicator && (
        <div className="flex items-center gap-1 text-xs font-mono text-neutral border border-neutral/30 px-2.5 py-1 rounded-full bg-neutral/5">
          <div className="w-1.5 h-1.5 rounded-full bg-neutral glow-animation"></div>
          <span>LIVE</span>
        </div>
      )}
    </div>
  );
}
