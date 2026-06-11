'use client';

export default function ApiStatus({ status = { type: 'demo', message: 'Loading...' } }) {
  const dotColor = {
    live: 'bg-green drop-shadow-[0_0_6px_#00ff9d]',
    demo: 'bg-amber drop-shadow-[0_0_6px_#ffb300]',
    err: 'bg-red drop-shadow-[0_0_6px_#ff3b3b]',
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-surface border-b border-cyan/15 flex-shrink-0 text-xs">
      <div className={`w-1.5 h-1.5 rounded-full ${dotColor[status.type] || dotColor.demo}`}></div>
      <div className="font-mono text-tdim flex-1">
        <b className="text-tmid">{status.message}</b>
      </div>
    </div>
  );
}
