/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Vazirmatn', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        // برند اصلی — آبی سفر
        brand: {
          50: '#EEF5FF',
          100: '#DCE9FD',
          200: '#BAD3FB',
          300: '#8CB5F7',
          400: '#5891F0',
          500: '#2C6FE4',
          600: '#1556CB',
          700: '#1244A2',
          800: '#143B80',
          900: '#163468',
        },
        // رنگ مکمل — نارنجی گرم برای پیشنهادها و تخفیف‌ها
        accent: {
          50: '#FFF6E9',
          100: '#FCE9C8',
          200: '#F8D08C',
          300: '#F3B455',
          400: '#EC9A29',
          500: '#DE8107',
          600: '#B86604',
          700: '#8F4E07',
        },
        ink: {
          50: '#F8FAFC',
          100: '#F1F4F8',
          200: '#E3E8EF',
          300: '#CFD7E3',
          400: '#98A3B5',
          500: '#697586',
          600: '#4B5768',
          700: '#364152',
          800: '#212B36',
          900: '#101828',
        },
        success: { 50: '#ECFDF3', 500: '#12B76A', 600: '#039855', 700: '#027A48' },
        danger: { 50: '#FEF3F2', 500: '#F04438', 600: '#D92D20', 700: '#B42318' },
        warning: { 50: '#FFFAEB', 500: '#F79009', 600: '#DC6803' },
      },
      borderRadius: {
        md: '8px',
        lg: '10px',
        xl: '12px',
        '2xl': '16px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.05), 0 1px 3px rgba(16,24,40,0.06)',
        'card-hover': '0 6px 16px rgba(16,24,40,0.09), 0 2px 5px rgba(16,24,40,0.05)',
        panel: '0 10px 30px rgba(16,24,40,0.10)',
        pop: '0 12px 32px rgba(16,24,40,0.16)',
        inset: 'inset 0 1px 0 rgba(255,255,255,0.6)',
      },
      spacing: {
        18: '4.5rem',
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      screens: {
        xs: '420px',
      },
      zIndex: {
        60: '60',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          from: { opacity: '0', transform: 'translateY(-4px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'slide-up': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.18s ease-out both',
        'fade-up': 'fade-up 0.22s ease-out both',
        'pop-in': 'pop-in 0.14s ease-out both',
        'slide-up': 'slide-up 0.24s ease-out both',
      },
    },
  },
  plugins: [],
};
