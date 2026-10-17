import type { Airline, City } from '@/types';
import { cityByCode } from './cities';
import { CITIES } from './cities';
import { generateFlights } from '@/services/mockData';
import { POPULAR_DOMESTIC_ROUTES, POPULAR_INTERNATIONAL_ROUTES } from './cities';

export interface FlightDeal {
  id: string;
  from: City;
  to: City;
  price: number;
  airline: Airline;
  durationMinutes: number;
  isDomestic: boolean;
}

function buildDeals(routes: Array<[string, string]>): FlightDeal[] {
  const deals: FlightDeal[] = [];
  routes.forEach(([fromCode, toCode], index) => {
    const from = cityByCode(fromCode);
    const to = cityByCode(toCode);
    if (!from || !to) return;
    const flights = generateFlights({
      origin: from,
      destination: to,
      date: `deals-${index}`,
      tripType: 'oneway',
      cabin: 'economy',
      passengers: 1,
      allCities: CITIES,
    });
    if (!flights.length) return;
    const cheapest = flights.reduce((min, item) => (item.price < min.price ? item : min), flights[0]);
    deals.push({
      id: `${from.code}-${to.code}`,
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
