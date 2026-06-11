'use client';

export default function Header({ title, subtitle, liveIndicator = false }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-cyan/7 to-transparent border-b border-cyan/15 flex-shrink-0">
      <div>
        <div className="font-mono font-black text-lg text-cyan tracking-widest drop-shadow-[0_0_18px_rgba(0,200,255,0.4)]">
          {title}
        </div>
        <div className="font-mono text-xs text-tdim tracking-widest mt-0.5">{subtitle}</div>
      </div>
      {liveIndicator && (
        <div className="flex items-center gap-1 text-xs font-mono text-green border border-green/30 px-2.5 py-1 rounded-full bg-green/10">
          <div className="w-1.5 h-1.5 rounded-full bg-green glow-animation"></div>
          <span>LIVE</span>
        </div>
      )}
    </div>
  );
}
