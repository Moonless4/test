/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0A192F',
          900: '#071322',
          800: '#0F2340',
          700: '#16304F',
          600: '#1E3C60',
        },
        gold: {
          DEFAULT: '#C5A069',
          light: '#D8BD8F',
          dark: '#A9814A',
        },
        ivory: '#FBF9F4',
        mist: '#F4F5F7',
        ink: '#0B1B31',
        muted: '#5B6672',
        line: '#E4E2DC',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      maxWidth: {
        shell: '1280px',
      },
      borderRadius: {
        card: '18px',
      },
      boxShadow: {
        soft: '0 18px 50px -24px rgba(10, 25, 47, 0.28)',
        lift: '0 28px 70px -32px rgba(10, 25, 47, 0.42)',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.22, 1, 0.36, 1)',
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
        'hero-zoom': {
          from: { transform: 'scale(1.03)' },
          to: { transform: 'scale(1)' },
        },
        'panel-in': {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.8s ease-out both',
        'hero-zoom': 'hero-zoom 1.4s cubic-bezier(0.22, 1, 0.36, 1) both',
        'panel-in': 'panel-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
}
