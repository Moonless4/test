import type { City, PassengerSelection } from '@/types';
import { cityByCode } from '@/data/cities';
import { parseDateParam, serializeDate } from './utils';

export interface FlightQuery {
  origin: City | null;
  destination: City | null;
  departDate: Date | null;
  returnDate: Date | null;
  tripType: 'oneway' | 'round' | 'multi';
  passengers: PassengerSelection;
  cabin: 'economy' | 'comfort' | 'business' | 'first';
}

export function buildFlightQuery(query: FlightQuery): string {
  const params = new URLSearchParams();
  if (query.origin) params.set('from', query.origin.code);
  if (query.destination) params.set('to', query.destination.code);
  if (query.departDate) params.set('depart', serializeDate(query.departDate));
  if (query.returnDate && query.tripType === 'round') params.set('return', serializeDate(query.returnDate));
  params.set('trip', query.tripType);
  params.set('adults', String(query.passengers.adults));
  if (query.passengers.children) params.set('children', String(query.passengers.children));
  if (query.passengers.infants) params.set('infants', String(query.passengers.infants));
  params.set('cabin', query.cabin);
  return params.toString();
}

export function parseFlightQuery(search: URLSearchParams): FlightQuery {
  const trip = search.get('trip');
  const cabin = search.get('cabin');
  return {
    origin: cityByCode(search.get('from')),
    destination: cityByCode(search.get('to')),
    departDate: parseDateParam(search.get('depart')),
    returnDate: parseDateParam(search.get('return')),
    tripType: trip === 'round' || trip === 'multi' ? trip : 'oneway',
    passengers: {
      adults: Math.max(1, Number(search.get('adults') ?? 1) || 1),
      children: Math.max(0, Number(search.get('children') ?? 0) || 0),
      infants: Math.max(0, Number(search.get('infants') ?? 0) || 0),
    },
    cabin:
      cabin === 'comfort' || cabin === 'business' || cabin === 'first' ? cabin : 'economy',
  };
}

export interface HotelQuery {
  cityName: string;
  cityCode: string;
  checkIn: Date | null;
  checkOut: Date | null;
  rooms: number;
  guests: number;
}

export function buildHotelQuery(query: HotelQuery): string {
  const params = new URLSearchParams();
  if (query.cityCode) params.set('city', query.cityCode);
  if (query.cityName) params.set('name', query.cityName);
  if (query.checkIn) params.set('checkin', serializeDate(query.checkIn));
  if (query.checkOut) params.set('checkout', serializeDate(query.checkOut));
  params.set('rooms', String(query.rooms));
  params.set('guests', String(query.guests));
  return params.toString();
}

export function parseHotelQuery(search: URLSearchParams): HotelQuery {
  return {
    cityName: search.get('name') ?? '',
    cityCode: search.get('city') ?? '',
    checkIn: parseDateParam(search.get('checkin')),
    checkOut: parseDateParam(search.get('checkout')),
    rooms: Math.max(1, Number(search.get('rooms') ?? 1) || 1),
    guests: Math.max(1, Number(search.get('guests') ?? 2) || 2),
  };
}

export interface TripQuery {
  origin: City | null;
  destination: City | null;
  departDate: Date | null;
  returnDate: Date | null;
  passengers: number;
}

export function buildTripQuery(query: TripQuery): string {
  const params = new URLSearchParams();
  if (query.origin) params.set('from', query.origin.code);
  if (query.destination) params.set('to', query.destination.code);
  if (query.departDate) params.set('depart', serializeDate(query.departDate));
  if (query.returnDate) params.set('return', serializeDate(query.returnDate));
  params.set('pax', String(query.passengers));
  return params.toString();
}

export function parseTripQuery(search: URLSearchParams): TripQuery {
  return {
    origin: cityByCode(search.get('from')),
    destination: cityByCode(search.get('to')),
    departDate: parseDateParam(search.get('depart')),
    returnDate: parseDateParam(search.get('return')),
    passengers: Math.max(1, Number(search.get('pax') ?? 1) || 1),
  };
}

/** ?demo=error برای نمایش وضعیت خطا در صفحه‌های نتایج */
export function readRequestOptions(search: URLSearchParams) {
  return { fail: search.get('demo') === 'error' };
}
