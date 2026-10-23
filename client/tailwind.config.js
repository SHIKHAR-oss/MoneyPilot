/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          brand: '#087F5B',
          hover: '#066649',
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#087F5B',
          700: '#066649',
          800: '#14251C',
          900: '#0E1A13',
        },
        forest: '#14251C',
        mint: {
          pale: '#ECFDF5',
          accent: '#A7F3D0',
        },
        surface: {
          page: '#F4F8F5',
          card: '#FFFFFF',
          input: '#FAFCFA',
          subtle: '#EEF3F0',
        },
        ink: {
          primary: '#17251D',
          secondary: '#64736A',
          muted: '#859188',
        },
        border: {
          subtle: '#E0E8E2',
          DEFAULT: '#E0E8E2',
        },
        fintech: {
          success: '#15803D',
          warning: '#B45309',
          danger: '#DC2626',
          info: '#2563EB',
        },
        brand: {
          50: '#ECFDF5',
          100: '#A7F3D0',
          500: '#10B981',
          600: '#087F5B',
          700: '#066649',
          900: '#14251C',
        }
      }
    },
  },
  plugins: [],
}
