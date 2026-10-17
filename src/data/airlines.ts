import type { Airline } from '@/types';

export const AIRLINES: Airline[] = [
  { code: 'IR', name: 'هواپیمایی جمهوری اسلامی ایران (هما)', short: 'هما', color: '#0F4C81' },
  { code: 'W5', name: 'هواپیمایی ماهان', short: 'ماهان', color: '#1E4E8C' },
  { code: 'EP', name: 'هواپیمایی آسمان', short: 'آسمان', color: '#2E7D32' },
  { code: 'QB', name: 'هواپیمایی قشم', short: 'قشم', color: '#B71C1C' },
  { code: 'IV', name: 'هواپیمایی کاسپین', short: 'کاسپین', color: '#00838F' },
  { code: 'VR', name: 'هواپیمایی وارش', short: 'وارش', color: '#6A1B9A' },
  { code: 'ZO', name: 'هواپیمایی زاگرس', short: 'زاگرس', color: '#EF6C00' },
  { code: 'I3', name: 'هواپیمایی آتا', short: 'آتا', color: '#00695C' },
  { code: 'B9', name: 'ایران ایرتور', short: 'ایرتور', color: '#283593' },
  { code: 'S4', name: 'هواپیمایی ساها', short: 'ساها', color: '#0277BD' },
  { code: 'PU', name: 'هواپیمایی پویا', short: 'پویا', color: '#5D4037' },
  { code: 'K5', name: 'کیش ایر', short: 'کیش‌ایر', color: '#1565C0' },
  { code: 'TK', name: 'ترکیش ایرلاینز', short: 'ترکیش', color: '#C62828', international: true },
  { code: 'EK', name: 'امارات', short: 'امارات', color: '#9C1B1B', international: true },
  { code: 'QR', name: 'قطر ایرویز', short: 'قطر', color: '#5D1049', international: true },
  { code: 'FZ', name: 'فلای دبی', short: 'فلای دبی', color: '#E65100', international: true },
  { code: 'PC', name: 'پگاسوس ایرلاینز', short: 'پگاسوس', color: '#F57C00', international: true },
  { code: 'LH', name: 'لوفت‌هانزا', short: 'لوفت‌هانزا', color: '#0F4C81', international: true },
  { code: 'J2', name: 'آذربایجان ایرلاینز', short: 'آذربایجان', color: '#00838F', international: true },
  { code: 'A9', name: 'جورجین ایرویز', short: 'جورجین', color: '#D32F2F', international: true },
];

export const AIRLINES_BY_CODE = AIRLINES.reduce(
  (acc, a) => {
    acc[a.code] = a;
    return acc;
  },
  {} as Record<string, Airline>,
);

export const AIRCRAFTS = [
  'ایرباس A۳۲۰',
  'ایرباس A۳۳۰',
  'بوئینگ ۷۳۷',
  'بوئینگ ۷۳۷-۸۰۰',
  'بوئینگ ۷۷۷',
  'ایرباس A۳۵۰',
  'MD-۸۲',
  'فوکر ۱۰۰',
];
