import type { City } from '@/types';

export const CITIES: City[] = [
  // ---------------------------------------------------------------- ایران
  { code: 'THR', name: 'تهران', nameEn: 'Tehran', country: 'IR', countryName: 'ایران', isDomestic: true, image: 'tehran', popular: true },
  { code: 'MHD', name: 'مشهد', nameEn: 'Mashhad', country: 'IR', countryName: 'ایران', isDomestic: true, image: 'mashhad', popular: true },
  { code: 'SYZ', name: 'شیراز', nameEn: 'Shiraz', country: 'IR', countryName: 'ایران', isDomestic: true, image: 'shiraz', popular: true },
  { code: 'IFN', name: 'اصفهان', nameEn: 'Isfahan', country: 'IR', countryName: 'ایران', isDomestic: true, image: 'isfahan', popular: true },
  { code: 'TBZ', name: 'تبریز', nameEn: 'Tabriz', country: 'IR', countryName: 'ایران', isDomestic: true, image: 'tabriz', popular: true },
  { code: 'KIH', name: 'کیش', nameEn: 'Kish Island', country: 'IR', countryName: 'ایران', isDomestic: true, image: 'kish', popular: true },
  { code: 'GSM', name: 'قشم', nameEn: 'Qeshm Island', country: 'IR', countryName: 'ایران', isDomestic: true, image: 'qeshm', popular: true },
  { code: 'BND', name: 'بندرعباس', nameEn: 'Bandar Abbas', country: 'IR', countryName: 'ایران', isDomestic: true, image: 'bandar-abbas' },
  { code: 'AZD', name: 'یزد', nameEn: 'Yazd', country: 'IR', countryName: 'ایران', isDomestic: true, image: 'yazd', popular: true },
  { code: 'RAS', name: 'رشت', nameEn: 'Rasht', country: 'IR', countryName: 'ایران', isDomestic: true, image: 'rasht' },
  { code: 'KER', name: 'کرمان', nameEn: 'Kerman', country: 'IR', countryName: 'ایران', isDomestic: true, image: 'kerman' },
  { code: 'CQD', name: 'شهرکرد', nameEn: 'Shahr-e Kord', country: 'IR', countryName: 'ایران', isDomestic: true, image: 'shahr-e-kord' },
  { code: 'AWZ', name: 'اهواز', nameEn: 'Ahvaz', country: 'IR', countryName: 'ایران', isDomestic: true, image: 'shahr-e-kord' },
  { code: 'ADU', name: 'اردبیل', nameEn: 'Ardabil', country: 'IR', countryName: 'ایران', isDomestic: true, image: 'tabriz' },
  { code: 'OMH', name: 'ارومیه', nameEn: 'Urmia', country: 'IR', countryName: 'ایران', isDomestic: true, image: 'tabriz' },
  { code: 'ZAH', name: 'زاهدان', nameEn: 'Zahedan', country: 'IR', countryName: 'ایران', isDomestic: true, image: 'kerman' },
  { code: 'SRY', name: 'ساری', nameEn: 'Sari', country: 'IR', countryName: 'ایران', isDomestic: true, image: 'rasht' },
  { code: 'KSH', name: 'کرمانشاه', nameEn: 'Kermanshah', country: 'IR', countryName: 'ایران', isDomestic: true, image: 'shahr-e-kord' },

  // ------------------------------------------------------------- خارجی
  { code: 'IST', name: 'استانبول', nameEn: 'Istanbul', country: 'TR', countryName: 'ترکیه', isDomestic: false, image: 'istanbul', popular: true },
  { code: 'AYT', name: 'آنتالیا', nameEn: 'Antalya', country: 'TR', countryName: 'ترکیه', isDomestic: false, image: 'antalya', popular: true },
  { code: 'DXB', name: 'دبی', nameEn: 'Dubai', country: 'AE', countryName: 'امارات', isDomestic: false, image: 'dubai', popular: true },
  { code: 'DOH', name: 'دوحه', nameEn: 'Doha', country: 'QA', countryName: 'قطر', isDomestic: false, image: 'doha', popular: true },
  { code: 'TBS', name: 'تفلیس', nameEn: 'Tbilisi', country: 'GE', countryName: 'گرجستان', isDomestic: false, image: 'tbilisi', popular: true },
  { code: 'GYD', name: 'باکو', nameEn: 'Baku', country: 'AZ', countryName: 'آذربایجان', isDomestic: false, image: 'baku', popular: true },
  { code: 'CDG', name: 'پاریس', nameEn: 'Paris', country: 'FR', countryName: 'فرانسه', isDomestic: false, image: 'paris', popular: true },
  { code: 'FCO', name: 'رم', nameEn: 'Rome', country: 'IT', countryName: 'ایتالیا', isDomestic: false, image: 'rome', popular: true },
  { code: 'VIE', name: 'وین', nameEn: 'Vienna', country: 'AT', countryName: 'اتریش', isDomestic: false, image: 'vienna' },
  { code: 'LHR', name: 'لندن', nameEn: 'London', country: 'GB', countryName: 'انگلستان', isDomestic: false, image: 'london', popular: true },
  { code: 'SVO', name: 'مسکو', nameEn: 'Moscow', country: 'RU', countryName: 'روسیه', isDomestic: false, image: 'moscow', popular: true },
  { code: 'KUL', name: 'کوالالامپور', nameEn: 'Kuala Lumpur', country: 'MY', countryName: 'مالزی', isDomestic: false, image: 'kuala-lumpur', popular: true },
  { code: 'AMM', name: 'امان', nameEn: 'Amman', country: 'JO', countryName: 'اردن', isDomestic: false, image: 'doha' },
  { code: 'NJF', name: 'نجف', nameEn: 'Najaf', country: 'IQ', countryName: 'عراق', isDomestic: false, image: 'doha', popular: true },
  { code: 'BEY', name: 'بیروت', nameEn: 'Beirut', country: 'LB', countryName: 'لبنان', isDomestic: false, image: 'istanbul' },
  { code: 'MCT', name: 'مسقط', nameEn: 'Muscat', country: 'OM', countryName: 'عمان', isDomestic: false, image: 'dubai' },
  { code: 'DEL', name: 'دهلی', nameEn: 'Delhi', country: 'IN', countryName: 'هند', isDomestic: false, image: 'dubai' },
  { code: 'BKK', name: 'بانکوک', nameEn: 'Bangkok', country: 'TH', countryName: 'تایلند', isDomestic: false, image: 'kuala-lumpur' },
  { code: 'PEK', name: 'پکن', nameEn: 'Beijing', country: 'CN', countryName: 'چین', isDomestic: false, image: 'kuala-lumpur' },
  { code: 'ICN', name: 'سئول', nameEn: 'Seoul', country: 'KR', countryName: 'کره جنوبی', isDomestic: false, image: 'kuala-lumpur' },
  { code: 'FRA', name: 'فرانکفورت', nameEn: 'Frankfurt', country: 'DE', countryName: 'آلمان', isDomestic: false, image: 'vienna' },
  { code: 'AMS', name: 'آمستردام', nameEn: 'Amsterdam', country: 'NL', countryName: 'هلند', isDomestic: false, image: 'london' },
  { code: 'JED', name: 'جده', nameEn: 'Jeddah', country: 'SA', countryName: 'عربستان', isDomestic: false, image: 'doha' },
];

export const CITY_BY_CODE: Record<string, City> = CITIES.reduce(
  (acc, city) => {
    acc[city.code] = city;
    return acc;
  },
  {} as Record<string, City>,
);

export function cityByCode(code: string | null | undefined): City | null {
  if (!code) return null;
  return CITY_BY_CODE[code.toUpperCase()] ?? null;
}

export function findCityByName(query: string): City | null {
  const q = query.trim();
  if (!q) return null;
  return (
    CITIES.find((c) => c.name === q) ??
    CITIES.find((c) => c.name.includes(q)) ??
    CITIES.find((c) => q.includes(c.name)) ??
    CITIES.find((c) => c.nameEn.toLowerCase() === q.toLowerCase()) ??
    CITIES.find((c) => c.code.toLowerCase() === q.toLowerCase()) ??
    null
  );
}

export const DOMESTIC_CITIES = CITIES.filter((c) => c.isDomestic);
export const INTERNATIONAL_CITIES = CITIES.filter((c) => !c.isDomestic);
export const POPULAR_CITIES = CITIES.filter((c) => c.popular);

/** پرترددترین مسیرهای داخلی برای پیشنهاد سریع */
export const POPULAR_DOMESTIC_ROUTES: Array<[string, string]> = [
  ['THR', 'MHD'],
  ['THR', 'KIH'],
  ['THR', 'SYZ'],
  ['THR', 'IFN'],
  ['MHD', 'THR'],
  ['THR', 'GSM'],
];

export const POPULAR_INTERNATIONAL_ROUTES: Array<[string, string]> = [
  ['THR', 'IST'],
  ['THR', 'DXB'],
  ['THR', 'AYT'],
  ['THR', 'TBS'],
  ['THR', 'NJF'],
  ['THR', 'DOH'],
];
