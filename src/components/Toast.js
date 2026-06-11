'use client';

export default function Toast({ message, show }) {
  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 bg-cyan/20 border border-cyan rounded-full px-4 py-2 font-mono text-sm text-cyan z-50 transition-all duration-200 ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
      }`}
    >
      {message}
    </div>
  );
}
