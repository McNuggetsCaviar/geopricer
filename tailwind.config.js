/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        app: '#0A0E17',
        panel: '#111827',
        border: '#1F2937',
        'risk-high': '#E24B4A',
        'risk-med': '#EF9F27',
        'risk-low': '#1D9E75',
        text: '#E2E8F0',
        muted: '#6B7280',
        accent: '#1D9E75',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
    },
  },
  plugins: [],
}

