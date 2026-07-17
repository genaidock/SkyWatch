module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#02060a',
        surface: '#050a11',
        panel: '#08101a',
        cyan: '#cbd5e1', // formerly #00c8ff, muted globally to fit Navigational Nocturne
        cdim: 'rgba(203, 213, 225, 0.12)',
        cglow: 'rgba(203, 213, 225, 0.4)',
        neutral: '#e2e8f0',
        ndim: 'rgba(226, 232, 240, 0.12)',
        cargo: '#00ff9d',
        private: '#8a2be2',
        civil: '#ffffff',
        military: '#cc0000',
        text: '#cbd5e1',
        tdim: 'rgba(203, 213, 225, 0.42)',
        tmid: 'rgba(203, 213, 225, 0.68)',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'sans-serif'],
        mono: ['Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
};
