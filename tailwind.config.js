/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          DEFAULT: '#0B1220',
          base: '#0B1220',
          surface: '#111B2E',
          elevated: '#17243A',
          strong: '#1E2E49',
          border: '#263751',
        },
        surface: {
          base: '#0B1220',
          primary: '#111B2E',
          elevated: '#17243A',
          strong: '#1E2E49',
        },
        cobalt: {
          DEFAULT: '#2563EB',
          highlight: '#3B82F6',
          cyan: '#38BDF8',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        content: {
          primary: '#EAF2FF',
          secondary: '#A8B7CE',
          muted: '#71829C',
        },
        line: {
          subtle: '#263751',
        },
        indicator: {
          success: '#34D399',
          warning: '#FBBF24',
          error: '#FB7185',
        }
      }
    },
  },
  plugins: [],
}