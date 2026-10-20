/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Vazirmatn', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        // تم تیره‌ی هدر و هیرو (برگرفته از تصویر مرجع)
        night: {
          DEFAULT: '#121616',
          900: '#0C1011',
          800: '#171D1E',
          700: '#1F2627',
        },
        // طلایی برند (DESIGN.md: brass-gold / secondary-container)
        gold: {
          DEFAULT: '#FDB813',
          300: '#FFD066',
          400: '#F7C544',
          500: '#FDB813',
          600: '#E0A300',
        },
        brass: '#F59E0B',
        // سبز نشان‌ها و تیره‌های معماری (DESIGN.md)
        moss: {
          DEFAULT: '#3E543A',
          300: '#9DB79A',
          700: '#2C3E2A',
        },
        cedar: '#1B382B',
        forest: '#12281E',
        // سطوح روشن
        cream: '#F4F3EF',
        canvas: '#F8FAFC',
        canvasSubtle: '#F1F5F9',
        ink: {
          400: '#8C8C95',
          600: '#515158',
          800: '#252529',
        },
      },
      borderRadius: {
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '28px',
        '3xl': '32px',
      },
      boxShadow: {
        // DESIGN.md — ارتفاع‌های ۱ تا ۳
        card: '0 8px 24px -4px rgba(18, 40, 30, 0.05)',
        float: '0 16px 36px -6px rgba(18, 40, 30, 0.08), 0 4px 12px -2px rgba(18, 40, 30, 0.03)',
        overlay: '0 24px 64px -12px rgba(11, 23, 28, 0.20)',
        glow: '0 18px 60px -18px rgba(253, 184, 19, 0.45)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out both',
        'fade-up': 'fade-up 0.6s ease-out both',
        'float-slow': 'float-slow 7s ease-in-out infinite',
      },
      screens: {
        xs: '420px',
      },
    },
  },
  plugins: [],
};
