import type {
  Airline,
  BusTrip,
  CabinClass,
  City,
  FareType,
  Flight,
  FlightSegment,
  Hotel,
  TrainTrip,
} from '@/types';
import { AIRLINES, AIRCRAFTS } from '@/data/airlines';
import { HOTELS } from '@/data/hotels';
import { IMG } from '@/data/images';
import { hashString, pickFrom, seededRandom } from '@/lib/utils';

/* --------------------------------------------------------------------------
   تولید داده‌ی نمونه‌ی تکرارپذیر
   همه‌ی نتایج از یک دانه‌ی ثابت (مبدا + مقصد + تاریخ) ساخته می‌شوند تا جستجوی
   یکسان همیشه نتیجه‌ی یکسان بدهد. ساختار خروجی دقیقاً همان چیزی است که از یک
   API واقعی انتظار می‌رود؛ برای اتصال به سرویس واقعی کافی است همین ماژول
   جایگزین شود.
-------------------------------------------------------------------------- */

const DOMESTIC_AIRLINE_CODES = ['IR', 'W5', 'EP', 'QB', 'IV', 'VR', 'ZO', 'I3', 'B9', 'S4', 'PU', 'K5'];
const INTL_BY_COUNTRY: Record<string, string[]> = {
  TR: ['TK', 'PC', 'W5'],
  AE: ['EK', 'FZ', 'QB'],
  QA: ['QR', 'W5'],
  GE: ['A9', 'EP'],
  AZ: ['J2', 'W5'],
  RU: ['SU', 'W5'],
  DE: ['LH', 'IR'],
  AT: ['OS', 'IR'],
  FR: ['LH', 'IR'],
  IT: ['LH', 'IR'],
  GB: ['LH', 'IR'],
  NL: ['LH', 'IR'],
  MY: ['EK', 'QR'],
  TH: ['EK', 'QR'],
  CN: ['EK', 'QR'],
  KR: ['EK', 'QR'],
  IN: ['QR', 'EK'],
  IQ: ['QB', 'EP'],
  JO: ['QR', 'W5'],
  LB: ['TK'],
  OM: ['QR', 'EK'],
  SA: ['QR', 'EK'],
};
const INTL_FALLBACK = ['TK', 'EK', 'QR', 'LH'];

/** مدت زمان تقریبی پرواز (دقیقه) بر پایه‌ی کشور/منطقه */
const REGION_MINUTES: Record<string, number> = {
  TR: 190, AE: 150, QA: 180, GE: 165, AZ: 155, IQ: 140, JO: 165, LB: 155, OM: 175, SA: 185,
  RU: 225, FR: 350, IT: 340, AT: 330, GB: 360, DE: 340, NL: 355,
  MY: 430, TH: 450, CN: 420, KR: 470, IN: 320,
};

const TIME_SLOTS_DOMESTIC = [330, 375, 420, 465, 510, 555, 620, 665, 720, 765, 830, 900, 960, 1020, 1080, 1140, 1200, 1260];
const TIME_SLOTS_INTL = [135, 240, 300, 360, 420, 480, 540, 600, 660, 720, 780, 840, 900, 960, 1020, 1080, 1140, 1200, 1260, 1320];

function airlineByCode(code: string): Airline {
  return AIRLINES.find((a) => a.code === code) ?? AIRLINES[0];
}

function flightDuration(from: City, to: City, rand: () => number): number {
  if (from.isDomestic && to.isDomestic) return 70 + Math.floor(rand() * 55);
  if (!from.isDomestic && !to.isDomestic) {
    const a = REGION_MINUTES[from.country] ?? 300;
    const b = REGION_MINUTES[to.country] ?? 300;
    return Math.round(Math.abs(a - b) * 0.7 + 120 + rand() * 90);
  }
  const intl = from.isDomestic ? to : from;
  const base = REGION_MINUTES[intl.country] ?? 240;
  return Math.round(base * (0.92 + rand() * 0.2));
}

function stopCitiesFor(from: City, to: City, count: number, rand: () => number, pool: City[]): City[] {
  const candidates = pool.filter((c) => c.code !== from.code && c.code !== to.code);
  const result: City[] = [];
  for (let i = 0; i < count; i += 1) {
    const c = pickFrom(candidates, rand);
    if (!result.some((r) => r.code === c.code)) result.push(c);
  }
  return result;
}

function priceFor(duration: number, isDomestic: boolean, cabin: CabinClass, fareType: FareType, rand: () => number) {
  const base = isDomestic
    ? 620000 + duration * 13500
    : 3100000 + duration * 27500;
  const cabinMultiplier =
    cabin === 'economy' ? 1 : cabin === 'comfort' ? 1.22 : cabin === 'business' ? 2.15 : 3.1;
  const fareMultiplier = fareType === 'charter' ? 0.84 : 1;
  const jitter = 0.88 + rand() * 0.28;
  return Math.round((base * cabinMultiplier * fareMultiplier * jitter) / 10000) * 10000;
}

function baggageFor(cabin: CabinClass, fareType: FareType) {
  if (cabin === 'business' || cabin === 'first') return { baggage: '۴۰ کیلوگرم', cabinBaggage: '۱۰ کیلوگرم' };
  if (cabin === 'comfort') return { baggage: '۳۰ کیلوگرم', cabinBaggage: '۷ کیلوگرم' };
  return fareType === 'charter'
    ? { baggage: '۲۰ کیلوگرم', cabinBaggage: '۵ کیلوگرم' }
    : { baggage: '۳۰ کیلوگرم', cabinBaggage: '۷ کیلوگرم' };
}

export interface FlightGenInput {
  origin: City;
  destination: City;
  date: string;
  tripType: 'oneway' | 'round' | 'multi';
  cabin: CabinClass;
  passengers: number;
  allCities: City[];
}

export function generateFlights(input: FlightGenInput): Flight[] {
  const { origin, destination, date, tripType, cabin, allCities } = input;
  const seedBase = hashString(`${origin.code}-${destination.code}-${date}-${tripType}-${cabin}`);
  const isDomestic = origin.isDomestic && destination.isDomestic;
  const slots = isDomestic ? TIME_SLOTS_DOMESTIC : TIME_SLOTS_INTL;
  const count = 10 + (seedBase % 7);

  const airlineCodes = isDomestic
    ? DOMESTIC_AIRLINE_CODES
    : [...(INTL_BY_COUNTRY[destination.country] ?? []), ...(INTL_BY_COUNTRY[origin.country] ?? []), ...INTL_FALLBACK];

  const flights: Flight[] = [];

  for (let i = 0; i < count; i += 1) {
    const rand = seededRandom(seedBase + i * 7919);
    const airline = airlineByCode(airlineCodes[i % airlineCodes.length]);
    const departMinutes = slots[(i * 3 + (seedBase % 5)) % slots.length] + Math.floor(rand() * 20);
    const durationMinutes = flightDuration(origin, destination, rand);

    // توقف‌ها: داخلی معمولاً بدون توقف، بین‌المللی ۰ تا ۲ توقف
    let stops = 0;
    const stopRoll = rand();
    if (isDomestic) stops = stopRoll > 0.88 ? 1 : 0;
    else if (durationMinutes > 330) stops = stopRoll > 0.45 ? 1 : 0;
    else stops = stopRoll > 0.72 ? 1 : 0;

    const extraStopMinutes = stops * (55 + Math.floor(rand() * 60));
    const totalDuration = durationMinutes + extraStopMinutes;
    const fareType: FareType = !isDomestic || rand() > 0.45 ? 'charter' : 'system';
    const basePrice = priceFor(durationMinutes + extraStopMinutes, isDomestic, cabin, fareType, rand);
    const totalPrice = tripType === 'round' ? Math.round((basePrice * 2 * 0.95) / 10000) * 10000 : basePrice;
    const { baggage, cabinBaggage } = baggageFor(cabin, fareType);

    const aircraft = AIRCRAFTS[Math.floor(rand() * AIRCRAFTS.length)];
    const flightNumber = `${airline.code}-${100 + Math.floor(rand() * 899)}`;
    const stopCities = stopCitiesFor(origin, destination, stops, rand, allCities);

    const outbound: FlightSegment = {
      from: origin,
      to: destination,
      departTime: minutesToClock(departMinutes),
      arriveTime: minutesToClock(departMinutes + totalDuration),
      durationMinutes: totalDuration,
      flightNumber,
      aircraft,
    };

    const segments: FlightSegment[] = [outbound];

    if (tripType === 'round') {
      const returnDepart = 300 + Math.floor(rand() * 900);
      const returnDuration = totalDuration;
      segments.push({
        from: destination,
        to: origin,
        departTime: minutesToClock(returnDepart),
        arriveTime: minutesToClock(returnDepart + returnDuration),
        durationMinutes: returnDuration,
        flightNumber: `${airline.code}-${100 + Math.floor(rand() * 899)}`,
        aircraft,
      });
    }

    flights.push({
      id: `fl-${origin.code}${destination.code}-${date}-${i}`,
      airline,
      from: origin,
      to: destination,
      departMinutes,
      arriveMinutes: (departMinutes + totalDuration) % 1440,
      arrivesNextDay: departMinutes + totalDuration >= 1440,
      durationMinutes: totalDuration,
      stops,
      stopCities,
      baggage,
      cabinBaggage,
      cabin,
      fareType,
      price: totalPrice,
      oldPrice: rand() > 0.7 ? Math.round((totalPrice * 1.14) / 10000) * 10000 : undefined,
      seatsLeft: rand() > 0.62 ? 1 + Math.floor(rand() * 5) : 9,
      refundable: fareType === 'system' && rand() > 0.3,
      date,
      segments,
    });
  }

  return flights;
}

function minutesToClock(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/* ------------------------------------------------------------------ قطار ---- */

const TRAIN_OPERATORS = [
  { name: 'رجا', color: '#0F4C81' },
  { name: 'سفرهای ریلی پارس', color: '#1E7A5F' },
  { name: 'ریل ترابر آریا', color: '#B03A2E' },
  { name: 'قطارهای لوکس زرین', color: '#6C3483' },
];

const WAGON_CLASSES: Array<{ key: TrainTrip['wagonClass']; name: string; multiplier: number }> = [
  { key: 'economy', name: 'اقتصادی', multiplier: 1 },
  { key: 'comfort', name: 'درجه یک', multiplier: 1.7 },
  { key: 'luxury', name: 'لوکس پنج‌ستاره', multiplier: 2.9 },
];

export function generateTrains(
  origin: City,
  destination: City,
  date: string,
  passengers: number,
): TrainTrip[] {
  const seed = hashString(`train-${origin.code}-${destination.code}-${date}`);
  const count = 6 + (seed % 4);
  const slots = [360, 480, 600, 750, 900, 1020, 1140, 1260, 1380, 1440];
  const trips: TrainTrip[] = [];

  for (let i = 0; i < count; i += 1) {
    const rand = seededRandom(seed + i * 104729);
    const operator = TRAIN_OPERATORS[i % TRAIN_OPERATORS.length];
    const wagon = WAGON_CLASSES[(i + (seed % 3)) % WAGON_CLASSES.length];
    const durationMinutes = 420 + Math.floor(rand() * 480);
    const departMinutes = slots[(i * 2 + (seed % 4)) % slots.length];
    const base = 780000 + durationMinutes * 1250;
    const price = Math.round((base * wagon.multiplier * (0.92 + rand() * 0.22)) / 10000) * 10000;

    trips.push({
      id: `tr-${origin.code}${destination.code}-${date}-${i}`,
      operator: operator.name,
      operatorColor: operator.color,
      trainNumber: `${200 + Math.floor(rand() * 700)}`,
      wagonClass: wagon.key,
      wagonClassName: wagon.name,
      from: origin,
      to: destination,
      departMinutes,
      arriveMinutes: (departMinutes + durationMinutes) % 1440,
      durationMinutes,
      price: price * (passengers > 0 ? 1 : 1),
      oldPrice: rand() > 0.7 ? Math.round((price * 1.12) / 10000) * 10000 : undefined,
      seatsLeft: 2 + Math.floor(rand() * 30),
      mealService: wagon.key !== 'economy',
      date,
    });
  }

  return trips.sort((a, b) => a.price - b.price);
}

/* ---------------------------------------------------------------- اتوبوس ---- */

const BUS_OPERATORS = [
  { name: 'ایران پیام', color: '#0F4C81' },
  { name: 'سیر و سفر', color: '#1E7A5F' },
  { name: 'تابان سیر', color: '#B03A2E' },
  { name: 'رعد سفر', color: '#6C3483' },
  { name: 'همسفر نوین', color: '#B9770E' },
];

export function generateBuses(
  origin: City,
  destination: City,
  date: string,
  passengers: number,
): BusTrip[] {
  const seed = hashString(`bus-${origin.code}-${destination.code}-${date}`);
  const count = 7 + (seed % 5);
  const slots = [330, 420, 540, 660, 780, 900, 1020, 1140, 1260, 1380, 1440, 1500];
  const trips: BusTrip[] = [];

  for (let i = 0; i < count; i += 1) {
    const rand = seededRandom(seed + i * 15485863);
    const operator = BUS_OPERATORS[i % BUS_OPERATORS.length];
    const busType: BusTrip['busType'] = (i + (seed % 2)) % 3 === 0 ? 'Normal' : 'VIP';
    const durationMinutes = 300 + Math.floor(rand() * 540);
    const departMinutes = slots[(i * 2 + (seed % 3)) % slots.length];
    const base = 480000 + durationMinutes * 900;
    const price = Math.round((base * (busType === 'VIP' ? 1.25 : 1) * (0.9 + rand() * 0.24)) / 10000) * 10000;

    trips.push({
      id: `bs-${origin.code}${destination.code}-${date}-${i}`,
      operator: operator.name,
      operatorColor: operator.color,
      busType,
      from: origin,
      to: destination,
      departMinutes,
      arriveMinutes: (departMinutes + durationMinutes) % 1440,
      durationMinutes,
      price: price * (passengers > 0 ? 1 : 1),
      seatsLeft: 1 + Math.floor(rand() * 18),
      date,
      terminal: `پایانه ${origin.name}`,
    });
  }

  return trips.sort((a, b) => a.price - b.price);
}

/* ------------------------------------------------------------------ هتل ---- */

const GENERATED_HOTEL_NAMES = [
  'پالاس',
  'ارکیده',
  'آریا',
  'سپهر',
  'گلستان',
  'جهانگردی',
  'بین‌المللی',
  'نگین',
  'ساحل',
  'آفتاب',
];

const HOTEL_IMAGE_KEYS = [
  'hotel-1', 'hotel-2', 'hotel-3', 'hotel-4', 'hotel-5', 'hotel-6', 'hotel-7', 'hotel-8',
  'hotel-9', 'hotel-10', 'hotel-11', 'hotel-12', 'hotel-13', 'hotel-14', 'hotel-15', 'hotel-16',
];

const FACILITY_SETS = [
  ['wifi', 'breakfast', 'parking', 'restaurant'],
  ['wifi', 'breakfast', 'restaurant', 'laundry', 'lounge'],
  ['wifi', 'pool', 'breakfast', 'parking', 'gym', 'restaurant'],
  ['wifi', 'pool', 'breakfast', 'parking', 'gym', 'spa', 'restaurant', 'lounge'],
  ['wifi', 'breakfast', 'restaurant', 'conference', 'parking'],
];

const DISTRICTS = ['مرکز شهر', 'بلوار اصلی', 'منطقه گردشگری', 'خیابان اصلی', 'حاشیه شهر'];

/** ساخت اقامتگاه‌های نمونه برای شهرهایی که در داده‌ی پایه هتل ندارند */
export function generateHotelsForCity(cityName: string, cityCode: string, countryName: string, isDomestic: boolean): Hotel[] {
  const seed = hashString(`hotel-${cityCode}`);
  const count = 6 + (seed % 4);
  const hotels: Hotel[] = [];

  for (let i = 0; i < count; i += 1) {
    const rand = seededRandom(seed + i * 31337);
    const stars = 3 + Math.floor(rand() * 3);
    const nameIndex = (i * 3 + (seed % 5)) % GENERATED_HOTEL_NAMES.length;
    const name = `هتل ${GENERATED_HOTEL_NAMES[nameIndex]} ${cityName}`;
    const pricePerNight = Math.round((1300000 + stars * 950000 + rand() * 900000) / 10000) * 10000;
    const imgA = HOTEL_IMAGE_KEYS[(i * 3 + seed) % HOTEL_IMAGE_KEYS.length];
    const imgB = HOTEL_IMAGE_KEYS[(i * 3 + seed + 5) % HOTEL_IMAGE_KEYS.length];
    const imgC = HOTEL_IMAGE_KEYS[(i * 3 + seed + 9) % HOTEL_IMAGE_KEYS.length];
    const facilities = FACILITY_SETS[(i + seed) % FACILITY_SETS.length];

    hotels.push({
      id: `hg-${cityCode}-${i}`,
      name,
      type: 'hotel',
      cityName,
      cityCode,
      countryName,
      isDomestic,
      stars,
      score: Math.round((7.6 + rand() * 1.8) * 10) / 10,
      reviewCount: 60 + Math.floor(rand() * 900),
      images: [IMG[imgA], IMG[imgB], IMG[imgC]],
      facilities,
      pricePerNight,
      oldPrice: rand() > 0.65 ? Math.round((pricePerNight * 1.18) / 10000) * 10000 : undefined,
      district: DISTRICTS[(i + seed) % DISTRICTS.length],
      distanceToCenterKm: Math.round((0.5 + rand() * 7) * 10) / 10,
      description: `${name} با ${stars} ستاره و امکانات کامل اقامتی، در ${DISTRICTS[(i + seed) % DISTRICTS.length]} ${cityName} واقع شده و گزینه‌ای مناسب برای سفرهای تفریحی و کاری است.`,
      rooms: [
        { id: `hg-${cityCode}-${i}-r1`, name: 'اتاق دو تخته', capacity: 2, breakfast: true, price: pricePerNight },
        { id: `hg-${cityCode}-${i}-r2`, name: 'اتاق سه تخته', capacity: 3, breakfast: true, price: pricePerNight + 540000 },
        { id: `hg-${cityCode}-${i}-r3`, name: 'سوئیت خانوادگی', capacity: 4, breakfast: true, price: pricePerNight + 1280000 },
      ],
      freeCancel: rand() > 0.35,
    });
  }

  return hotels;
}

/** اقامتگاه‌های ویلا/بومی نمونه */
export function generateVillasForCity(cityName: string, cityCode: string, countryName: string): Hotel[] {
  const seed = hashString(`villa-${cityCode}`);
  const count = 5 + (seed % 3);
  const types: Array<'villa' | 'apartment' | 'traditional'> = ['villa', 'villa', 'apartment', 'traditional'];
  const items: Hotel[] = [];

  for (let i = 0; i < count; i += 1) {
    const rand = seededRandom(seed + i * 6151);
    const type = types[i % types.length];
    const label = type === 'villa' ? 'ویلا' : type === 'apartment' ? 'آپارتمان مبله' : 'اقامتگاه سنتی';
    const pricePerNight = Math.round((1900000 + rand() * 5200000) / 10000) * 10000;
    const imgA = HOTEL_IMAGE_KEYS[(i * 4 + seed + 2) % HOTEL_IMAGE_KEYS.length];
    const imgB = HOTEL_IMAGE_KEYS[(i * 4 + seed + 7) % HOTEL_IMAGE_KEYS.length];
    const capacity = 4 + Math.floor(rand() * 6);

    items.push({
      id: `vg-${cityCode}-${i}`,
      name: `${label} ${cityName} ${rand() > 0.5 ? 'شماره یک' : 'شماره دو'}`,
      type,
      cityName,
      cityCode,
      countryName,
      isDomestic: true,
      stars: type === 'villa' ? 4 : 3,
      score: Math.round((8.2 + rand() * 1.5) * 10) / 10,
      reviewCount: 24 + Math.floor(rand() * 180),
      images: [IMG[imgA], IMG[imgB]],
      facilities: ['wifi', 'parking', 'breakfast'],
      pricePerNight,
      district: DISTRICTS[(i + seed) % DISTRICTS.length],
      distanceToCenterKm: Math.round((0.8 + rand() * 9) * 10) / 10,
      description: `${label} با ظرفیت ${capacity} نفر، مناسب اقامت‌های خانوادگی و گروهی در ${cityName}. شامل آشپزخانه مجهز و پارکینگ اختصاصی.`,
      rooms: [
        { id: `vg-${cityCode}-${i}-r1`, name: `${label} ${capacity} نفره`, capacity, breakfast: false, price: pricePerNight },
      ],
      freeCancel: rand() > 0.4,
    });
  }

  return items;
}

export function hotelsInCity(cityName: string, cityCode: string): Hotel[] {
  return HOTELS.filter(
    (h) => h.type === 'hotel' && (h.cityCode === cityCode || h.cityName === cityName),
  );
}

export function villasInCity(cityName: string, cityCode: string): Hotel[] {
  return HOTELS.filter((h) => h.type !== 'hotel' && (h.cityCode === cityCode || h.cityName === cityName));
}

export function nearbyHotels(cityCode: string, excludeId: string, limit = 4): Hotel[] {
  return HOTELS.filter((h) => h.cityCode === cityCode && h.id !== excludeId).slice(0, limit);
}
