import type { Airline, City } from '@/types';
import { cityByCode } from './cities';
import { CITIES } from './cities';
import { flightDateKey } from '@/services/api';
import { generateFlights } from '@/services/mockData';
import { addDays, startOfDay } from '@/lib/jalali';
import { serializeDate } from '@/lib/utils';
import { POPULAR_DOMESTIC_ROUTES, POPULAR_INTERNATIONAL_ROUTES } from './cities';

export interface FlightDeal {
  id: string;
  /** تاریخ پیشنهاد — با کلیک روی کارت، نتایج همین تاریخ باز می‌شود */
  departDate: string;
  from: City;
  to: City;
  price: number;
  airline: Airline;
  durationMinutes: number;
  isDomestic: boolean;
}

/** تاریخ پیشنهادها؛ ثابت است تا قیمت کارت با کمترین قیمت نتیجه‌ی جستجو یکی باشد */
const DEAL_DATE = addDays(startOfDay(new Date()), 7);

function buildDeals(routes: Array<[string, string]>): FlightDeal[] {
  const deals: FlightDeal[] = [];
  routes.forEach(([fromCode, toCode]) => {
    const from = cityByCode(fromCode);
    const to = cityByCode(toCode);
    if (!from || !to) return;
    const flights = generateFlights({
      origin: from,
      destination: to,
      date: flightDateKey(DEAL_DATE),
      tripType: 'oneway',
      cabin: 'economy',
      passengers: 1,
      allCities: CITIES,
    });
    if (!flights.length) return;
    const cheapest = flights.reduce((min, item) => (item.price < min.price ? item : min), flights[0]);
    deals.push({
      id: `${from.code}-${to.code}`,
      departDate: serializeDate(DEAL_DATE),
      from,
      to,
      price: cheapest.price,
      airline: cheapest.airline,
      durationMinutes: cheapest.durationMinutes,
      isDomestic: from.isDomestic && to.isDomestic,
    });
  });
  return deals;
}

const DOMESTIC_ROUTES: Array<[string, string]> = [
  ...POPULAR_DOMESTIC_ROUTES,
  ['MHD', 'SYZ'],
  ['SYZ', 'MHD'],
  ['THR', 'AZD'],
  ['THR', 'AWZ'],
];

const INTERNATIONAL_ROUTES: Array<[string, string]> = [
  ...POPULAR_INTERNATIONAL_ROUTES.filter(([, to]) => cityByCode(to)),
  ['THR', 'KUL'],
  ['THR', 'CDG'],
  ['THR', 'LHR'],
  ['THR', 'GYD'],
];

export const DOMESTIC_FLIGHT_DEALS = buildDeals(DOMESTIC_ROUTES);
export const INTERNATIONAL_FLIGHT_DEALS = buildDeals(INTERNATIONAL_ROUTES);
