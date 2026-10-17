import type { Destination } from '@/types';
import { IMG } from './images';

/** مقصدهای پرطرفدار — داخلی و خارجی */
export const DESTINATIONS: Destination[] = [
  {
    id: 'd-tehran', name: 'تهران', nameEn: 'Tehran', country: 'ایران', code: 'THR',
    image: IMG.tehran, isDomestic: true, startingPrice: 1890000, hotelCount: 412, slug: 'tehran',
  },
  {
    id: 'd-mashhad', name: 'مشهد', nameEn: 'Mashhad', country: 'ایران', code: 'MHD',
    image: IMG.mashhad, isDomestic: true, startingPrice: 1490000, hotelCount: 538, slug: 'mashhad',
  },
  {
    id: 'd-kish', name: 'کیش', nameEn: 'Kish Island', country: 'ایران', code: 'KIH',
    image: IMG.kish, isDomestic: true, startingPrice: 2150000, hotelCount: 96, slug: 'kish',
  },
  {
    id: 'd-shiraz', name: 'شیراز', nameEn: 'Shiraz', country: 'ایران', code: 'SYZ',
    image: IMG.shiraz, isDomestic: true, startingPrice: 1680000, hotelCount: 287, slug: 'shiraz',
  },
  {
    id: 'd-isfahan', name: 'اصفهان', nameEn: 'Isfahan', country: 'ایران', code: 'IFN',
    image: IMG.isfahan, isDomestic: true, startingPrice: 1750000, hotelCount: 264, slug: 'isfahan',
  },
  {
    id: 'd-qeshm', name: 'قشم', nameEn: 'Qeshm Island', country: 'ایران', code: 'GSM',
    image: IMG.qeshm, isDomestic: true, startingPrice: 2290000, hotelCount: 74, slug: 'qeshm',
  },
  {
    id: 'd-tabriz', name: 'تبریز', nameEn: 'Tabriz', country: 'ایران', code: 'TBZ',
    image: IMG.tabriz, isDomestic: true, startingPrice: 1790000, hotelCount: 158, slug: 'tabriz',
  },
  {
    id: 'd-yazd', name: 'یزد', nameEn: 'Yazd', country: 'ایران', code: 'AZD',
    image: IMG.yazd, isDomestic: true, startingPrice: 1590000, hotelCount: 112, slug: 'yazd',
  },
  {
    id: 'd-istanbul', name: 'استانبول', nameEn: 'Istanbul', country: 'ترکیه', code: 'IST',
    image: IMG.istanbul, isDomestic: false, startingPrice: 8450000, hotelCount: 1284, slug: 'istanbul',
  },
  {
    id: 'd-dubai', name: 'دبی', nameEn: 'Dubai', country: 'امارات', code: 'DXB',
    image: IMG.dubai, isDomestic: false, startingPrice: 9900000, hotelCount: 964, slug: 'dubai',
  },
  {
    id: 'd-antalya', name: 'آنتالیا', nameEn: 'Antalya', country: 'ترکیه', code: 'AYT',
    image: IMG.antalya, isDomestic: false, startingPrice: 9100000, hotelCount: 742, slug: 'antalya',
  },
  {
    id: 'd-tbilisi', name: 'تفلیس', nameEn: 'Tbilisi', country: 'گرجستان', code: 'TBS',
    image: IMG.tbilisi, isDomestic: false, startingPrice: 7250000, hotelCount: 386, slug: 'tbilisi',
  },
  {
    id: 'd-paris', name: 'پاریس', nameEn: 'Paris', country: 'فرانسه', code: 'CDG',
    image: IMG.paris, isDomestic: false, startingPrice: 18500000, hotelCount: 2140, slug: 'paris',
  },
  {
    id: 'd-baku', name: 'باکو', nameEn: 'Baku', country: 'آذربایجان', code: 'GYD',
    image: IMG.baku, isDomestic: false, startingPrice: 6890000, hotelCount: 312, slug: 'baku',
  },
  {
    id: 'd-moscow', name: 'مسکو', nameEn: 'Moscow', country: 'روسیه', code: 'SVO',
    image: IMG.moscow, isDomestic: false, startingPrice: 12400000, hotelCount: 1580, slug: 'moscow',
  },
  {
    id: 'd-kul', name: 'کوالالامپور', nameEn: 'Kuala Lumpur', country: 'مالزی', code: 'KUL',
    image: IMG['kuala-lumpur'], isDomestic: false, startingPrice: 14900000, hotelCount: 1120, slug: 'kuala-lumpur',
  },
  {
    id: 'd-rome', name: 'رم', nameEn: 'Rome', country: 'ایتالیا', code: 'FCO',
    image: IMG.rome, isDomestic: false, startingPrice: 16900000, hotelCount: 1830, slug: 'rome',
  },
  {
    id: 'd-london', name: 'لندن', nameEn: 'London', country: 'انگلستان', code: 'LHR',
    image: IMG.london, isDomestic: false, startingPrice: 19200000, hotelCount: 2460, slug: 'london',
  },
];

export const DOMESTIC_DESTINATIONS = DESTINATIONS.filter((d) => d.isDomestic);
export const INTERNATIONAL_DESTINATIONS = DESTINATIONS.filter((d) => !d.isDomestic);

export function destinationBySlug(slug: string): Destination | null {
  return DESTINATIONS.find((d) => d.slug === slug) ?? null;
}
