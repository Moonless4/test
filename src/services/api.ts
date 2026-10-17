import type {
  BusTrip,
  City,
  Flight,
  Hotel,
  Tour,
  TrainTrip,
} from '@/types';
import { CITIES, cityByCode } from '@/data/cities';
import { HOTELS } from '@/data/hotels';
import { TOURS } from '@/data/tours';
import {
  generateBuses,
  generateFlights,
  generateHotelsForCity,
  generateTrains,
  generateVillasForCity,
  hotelsInCity,
  villasInCity,
} from './mockData';

/* --------------------------------------------------------------------------
   لایه‌ی سرویس (API)
   در این نسخه داده‌ها از ماژول mockData می‌آیند. برای اتصال به سرویس واقعی
   کافی است بدنه‌ی همین توابع با درخواست شبکه‌ای جایگزین شود؛ امضاها و
   ساختار خروجی تغییر نمی‌کند.
-------------------------------------------------------------------------- */

export interface RequestOptions {
  /** شبیه‌سازی خطای سرور برای نمایش «وضعیت خطا» */
  fail?: boolean;
  latency?: number;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function respond<T>(payload: T, options?: RequestOptions): Promise<T> {
  await delay(options?.latency ?? 700);
  if (options?.fail) {
    throw new Error('ارتباط با سرور برقرار نشد. لطفاً دوباره تلاش کنید.');
  }
  return payload;
}

export interface FlightSearchRequest {
  origin: City;
  destination: City;
  date: Date;
  tripType: 'oneway' | 'round' | 'multi';
  cabin: Flight['cabin'];
  passengers: number;
}

export async function searchFlights(req: FlightSearchRequest, options?: RequestOptions): Promise<Flight[]> {
  const dateKey = `${req.date.getFullYear()}${req.date.getMonth() + 1}${req.date.getDate()}`;
  const flights = generateFlights({
    origin: req.origin,
    destination: req.destination,
    date: dateKey,
    tripType: req.tripType,
    cabin: req.cabin,
    passengers: req.passengers,
    allCities: CITIES,
  });
  return respond(flights, options);
}

export interface HotelSearchRequest {
  cityName: string;
  cityCode?: string;
  includeGenerated?: boolean;
}

export async function searchHotels(req: HotelSearchRequest, options?: RequestOptions): Promise<Hotel[]> {
  const city = req.cityCode ? cityByCode(req.cityCode) : null;
  const cityName = req.cityName || city?.name || '';
  const cityCode = req.cityCode || city?.code || '';
  const base = cityName ? hotelsInCity(cityName, cityCode) : [];

  if (base.length) return respond(base, options);

  const generated = cityName
    ? generateHotelsForCity(cityName, cityCode || cityName, city?.countryName ?? 'ایران', city?.isDomestic ?? true)
    : [];
  return respond(generated, options);
}

export async function searchStays(cityName: string, cityCode: string, options?: RequestOptions): Promise<Hotel[]> {
  const city = cityByCode(cityCode);
  const base = villasInCity(cityName, cityCode);
  const items = base.length
    ? base
    : cityName
      ? generateVillasForCity(cityName, cityCode, city?.countryName ?? 'ایران')
      : [];
  return respond(items, options);
}

export async function getAllHotels(options?: RequestOptions): Promise<Hotel[]> {
  return respond(HOTELS.filter((h) => h.type === 'hotel'), options);
}

export async function getHotelById(id: string, options?: RequestOptions): Promise<Hotel | null> {
  return respond(HOTELS.find((h) => h.id === id) ?? null, { ...options, latency: options?.latency ?? 420 });
}

export interface TripSearchRequest {
  origin: City;
  destination: City;
  date: Date;
  passengers: number;
}

export async function searchTrains(req: TripSearchRequest, options?: RequestOptions): Promise<TrainTrip[]> {
  const dateKey = `${req.date.getFullYear()}${req.date.getMonth() + 1}${req.date.getDate()}`;
  return respond(generateTrains(req.origin, req.destination, dateKey, req.passengers), options);
}

export async function searchBuses(req: TripSearchRequest, options?: RequestOptions): Promise<BusTrip[]> {
  const dateKey = `${req.date.getFullYear()}${req.date.getMonth() + 1}${req.date.getDate()}`;
  return respond(generateBuses(req.origin, req.destination, dateKey, req.passengers), options);
}

export async function searchTours(destination?: string, options?: RequestOptions): Promise<Tour[]> {
  const items = destination ? TOURS.filter((t) => t.destination.includes(destination)) : TOURS;
  return respond(items.length ? items : TOURS, options);
}

export async function getPopularFlights(options?: RequestOptions): Promise<Flight[]> {
  const pairs: Array<[string, string]> = [['THR', 'MHD'], ['THR', 'IST'], ['THR', 'DXB'], ['MHD', 'THR']];
  const results: Flight[] = [];
  pairs.forEach(([from, to], index) => {
    const origin = cityByCode(from);
    const destination = cityByCode(to);
    if (!origin || !destination) return;
    const list = generateFlights({
      origin,
      destination,
      date: `seed-${index}`,
      tripType: 'oneway',
      cabin: 'economy',
      passengers: 1,
      allCities: CITIES,
    });
    if (list[index % list.length]) results.push(list[index % list.length]);
  });
  return respond(results, { ...options, latency: options?.latency ?? 400 });
}
