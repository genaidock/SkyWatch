'use client';

export default function Header({ title, subtitle, liveIndicator = false }) {
  return (
    <div className="flex flex-col px-6 py-6 pb-4 bg-surface z-10 flex-shrink-0 border-b border-neutral overflow-hidden">
      <div className="flex justify-between items-center w-full relative">
        <div className="flex items-center gap-3">
          {/* Thick & Stylish Header without static logo */}
          <h1 className="text-2xl font-black italic tracking-widest font-display text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 drop-shadow-sm uppercase">
            {title}
          </h1>
        </div>

        {/* Marquee Flying Plane */}
        {liveIndicator && (
          <div className="flex-1 h-6 relative mx-4 overflow-hidden pointer-events-none flex items-center">
            <div className="animate-fly-across text-cyan w-full flex">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="transform rotate-90 opacity-70">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
              </svg>
            </div>
          </div>
        )}

        {liveIndicator && (
          <div className="flex items-center gap-2 text-[10px] font-display font-bold tracking-[0.2em] text-slate-500 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></span>
            LIVE
          </div>
        )}
      </div>
      {/* Reverted Tagline */}
      <p className="text-xs text-slate-500 mt-2 font-sans italic tracking-wide font-medium">{subtitle}</p>
    </div>
  );
}
