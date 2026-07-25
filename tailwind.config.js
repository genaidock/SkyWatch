module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#f8fafc',
        surface: '#ffffff',
        panel: 'rgba(255, 255, 255, 0.85)',
        cyan: '#0284c7', // sky-600
        cdim: 'rgba(2, 132, 199, 0.1)',
        cglow: 'rgba(2, 132, 199, 0.3)',
        neutral: '#e2e8f0', // slate-200
        ndim: 'rgba(15, 23, 42, 0.04)', // subtle hover
        cargo: '#10b981', // emerald-500
        private: '#8b5cf6', // violet-500
        civil: '#64748b', // slate-500 (light map needs darker base color)
        military: '#ef4444', // red-500
        text: '#0f172a', // slate-900
        tdim: '#64748b', // slate-500
        tmid: '#334155', // slate-700
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'sans-serif'],
        display: ['var(--font-space)', 'sans-serif'],
        mono: ['var(--font-space)', 'monospace'],
      },
      keyframes: {
        sweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        flyAcross: {
          '0%': { transform: 'translateX(-100%)', opacity: 0 },
          '10%': { opacity: 1 },
          '90%': { opacity: 1 },
          '100%': { transform: 'translateX(200%)', opacity: 0 },
        },
      },
      animation: {
        'radar-sweep': 'sweep 4s linear infinite',
        'fly-across': 'flyAcross 20s linear infinite',
      }
    },
  },
  plugins: [],
};
