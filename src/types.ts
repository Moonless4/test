/* ---------------------------------------------------------------------------
   مدل‌های داده‌ی پلتفرم سفر
   این ساختارها عمداً از منابع داده جدا هستند تا اتصال به API واقعی
   (GDS، سایت‌های هتل، API شرکت‌های ریلی) بدون تغییر در رابط کاربری ممکن باشد.
--------------------------------------------------------------------------- */

export type ServiceKey =
  | 'flight'
  | 'hotel'
  | 'train'
  | 'bus'
  | 'tour'
  | 'villa'
  | 'visa'
  | 'insurance'
  | 'more';

export type TripType = 'oneway' | 'round' | 'multi';

export type CabinClass = 'economy' | 'comfort' | 'business' | 'first';

export type FareType = 'system' | 'charter';

export interface City {
  code: string;
  name: string;
  nameEn: string;
  country: string;
  countryName: string;
  isDomestic: boolean;
  image?: string;
  popular?: boolean;
}

export interface Airline {
  code: string;
  name: string;
  short: string;
  color: string;
  international?: boolean;
}

export interface Aircraft {
  code: string;
  name: string;
}

export interface FlightSegment {
  from: City;
  to: City;
  departTime: string; // ۰۷:۳۰
  arriveTime: string;
  durationMinutes: number;
  flightNumber: string;
  aircraft: string;
}

export interface Flight {
  id: string;
  airline: Airline;
  from: City;
  to: City;
  /** دقیقه از نیمه‌شب */
  departMinutes: number;
  arriveMinutes: number;
  arrivesNextDay?: boolean;
  durationMinutes: number;
  stops: number;
  stopCities: City[];
  baggage: string;
  cabinBaggage: string;
  cabin: CabinClass;
  fareType: FareType;
  price: number;
  oldPrice?: number;
  seatsLeft: number;
  refundable: boolean;
  date: string;
  segments: FlightSegment[];
}

export interface RoomType {
  id: string;
  name: string;
  capacity: number;
  breakfast: boolean;
  price: number;
}

export interface Hotel {
  id: string;
  name: string;
  type: 'hotel' | 'villa' | 'apartment' | 'hostel' | 'traditional';
  cityName: string;
  cityCode: string;
  countryName: string;
  isDomestic: boolean;
  stars: number;
  score: number;
  reviewCount: number;
  images: string[];
  facilities: string[];
  pricePerNight: number;
  oldPrice?: number;
  district: string;
  distanceToCenterKm: number;
  description: string;
  rooms: RoomType[];
  popular?: boolean;
  freeCancel: boolean;
}

export interface TrainTrip {
  id: string;
  operator: string;
  operatorColor: string;
  trainNumber: string;
  wagonClass: 'economy' | 'comfort' | 'luxury';
  wagonClassName: string;
  from: City;
  to: City;
  departMinutes: number;
  arriveMinutes: number;
  durationMinutes: number;
  price: number;
  oldPrice?: number;
  seatsLeft: number;
  mealService: boolean;
  date: string;
}

export interface BusTrip {
  id: string;
  operator: string;
  operatorColor: string;
  busType: 'VIP' | 'Normal';
  from: City;
  to: City;
  departMinutes: number;
  arriveMinutes: number;
  durationMinutes: number;
  price: number;
  seatsLeft: number;
  date: string;
  terminal: string;
}

export interface Tour {
  id: string;
  title: string;
  destination: string;
  days: number;
  nights: number;
  image: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviewCount: number;
  includes: string[];
  travelDate: string;
  tags: string[];
}

export interface Destination {
  id: string;
  name: string;
  nameEn: string;
  country: string;
  image: string;
  code: string;
  isDomestic: boolean;
  startingPrice: number;
  hotelCount: number;
  slug: string;
}

export interface PopularRoute {
  id: string;
  fromCode: string;
  toCode: string;
  price: number;
  airlineShort: string;
  airlineColor: string;
  durationMinutes: number;
  isDomestic: boolean;
}

export interface ServiceItem {
  key: string;
  title: string;
  description: string;
  href: string;
  icon: string;
  badge?: string;
}

export interface Offer {
  id: string;
  title: string;
  subtitle: string;
  discountLabel: string;
  code?: string;
  image: string;
  href: string;
  tone: 'brand' | 'accent' | 'dark';
  expiresInDays: number;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  image: string;
  readMinutes: number;
  author: string;
  publishedAt: string;
  body: string[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface Benefit {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface PassengerSelection {
  adults: number;
  children: number;
  infants: number;
}

export interface FlightSearchParams {
  tripType: TripType;
  origin: City | null;
  destination: City | null;
  departDate: Date | null;
  returnDate: Date | null;
  passengers: PassengerSelection;
  cabin: CabinClass;
  extraLegs?: Array<{ origin: City | null; destination: City | null; departDate: Date | null }>;
}

export interface HotelSearchParams {
  destination: string;
  cityCode: string;
  checkIn: Date | null;
  checkOut: Date | null;
  rooms: number;
  guests: number;
}

export interface TripSearchParams {
  origin: City | null;
  destination: City | null;
  departDate: Date | null;
  returnDate: Date | null;
  passengers: number;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
}

export interface BookingDraft {
  kind: 'flight' | 'hotel' | 'train' | 'bus' | 'tour';
  itemId: string;
  title: string;
  subtitle: string;
  image?: string;
  price: number;
  meta: Array<{ label: string; value: string }>;
}
