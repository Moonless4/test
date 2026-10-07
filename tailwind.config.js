/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.25rem',
        lg: '1.5rem',
        xl: '2rem',
      },
      screens: {
        '2xl': '1440px',
      },
    },
    extend: {
      colors: {
        teal: {
          50: '#EEF4F6',
          100: '#DCE8EC',
          200: '#B7CFD8',
          300: '#6FA5B8',
          400: '#4C8699',
          500: '#3D7487',
          600: '#2A5E70',
          700: '#1B4C5E',
          800: '#123F50',
          900: '#0D3544',
          950: '#082229',
        },
        cream: '#F6F3EE',
        beige: '#E9DED0',
        cocoa: '#463630',
        wine: '#9A2B42',
        'wine-dark': '#7C2136',
        ink: '#183744',
        muted: '#71818A',
        sale: '#E84B3C',
        gold: '#F4A623',
        line: '#EAE6E0',
      },
      fontFamily: {
        sans: ['Vazirmatn', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        script: ['"Dancing Script"', 'cursive'],
      },
      borderRadius: {
        card: '16px',
        panel: '24px',
      },
      boxShadow: {
        soft: '0 4px 20px -6px rgba(18, 63, 80, 0.10)',
        card: '0 10px 30px -12px rgba(18, 63, 80, 0.18)',
        lift: '0 18px 40px -16px rgba(18, 63, 80, 0.28)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'drawer-left': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        'drawer-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up .5s ease-out both',
        'fade-in': 'fade-in .35s ease-out both',
        'drawer-left': 'drawer-left .3s ease-out both',
        'drawer-right': 'drawer-right .3s ease-out both',
      },
    },
  },
  plugins: [],
};
