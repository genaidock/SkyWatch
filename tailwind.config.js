module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#040d14',
        surface: '#070f1a',
        panel: '#0a1622',
        cyan: '#00c8ff',
        cdim: 'rgba(0,200,255,0.12)',
        cglow: 'rgba(0,200,255,0.4)',
        green: '#00ff9d',
        gdim: 'rgba(0,255,157,0.1)',
        amber: '#ffb300',
        red: '#ff3b3b',
        purple: '#bf5af2',
        text: '#c8e6f0',
        tdim: 'rgba(200,230,240,0.42)',
        tmid: 'rgba(200,230,240,0.68)',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'sans-serif'],
        mono: ['Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
};
