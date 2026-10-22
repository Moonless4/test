import { products } from './content.js';

/* =========================================================
   Formatters — Persian numerals, Jalali dates, tomans
   ========================================================= */

const faNumber = (value) => Number(value || 0).toLocaleString('fa-IR');

export const fa = faNumber;

export const money = (value) => `${faNumber(value)} تومان`;

let dayFormatter;
let timeFormatter;
let shortFormatter;

try {
  dayFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  shortFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { day: 'numeric', month: 'long' });
  timeFormatter = new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' });
} catch {
  dayFormatter = new Intl.DateTimeFormat('fa-IR');
  shortFormatter = new Intl.DateTimeFormat('fa-IR');
  timeFormatter = new Intl.DateTimeFormat('fa-IR');
}

export const formatDate = (iso) => (iso ? dayFormatter.format(new Date(iso)) : '—');
export const formatShortDate = (iso) => (iso ? shortFormatter.format(new Date(iso)) : '—');
export const formatTime = (iso) => (iso ? timeFormatter.format(new Date(iso)) : '—');

export const formatDayNumber = (iso) =>
  iso ? new Date(iso).toLocaleDateString('fa-IR-u-ca-persian', { day: 'numeric' }) : '—';

export const formatMonth = (iso) =>
  iso ? new Date(iso).toLocaleDateString('fa-IR-u-ca-persian', { month: 'long' }) : '—';

export const formatWeekday = (iso) =>
  iso ? new Date(iso).toLocaleDateString('fa-IR-u-ca-persian', { weekday: 'long' }) : '—';

export const relativeTime = (iso) => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'همین حالا';
  if (minutes < 60) return `${faNumber(minutes)} دقیقه پیش`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${faNumber(hours)} ساعت پیش`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'دیروز';
  if (days < 30) return `${faNumber(days)} روز پیش`;
  return formatShortDate(iso);
};

export const findProduct = (id) => products.find((item) => item.id === id) || null;

/* =========================================================
   Status dictionaries
   ========================================================= */

export const ORDER_STATUS = {
  review: { label: 'در حال بررسی', tone: 'amber' },
  preparing: { label: 'در حال آماده‌سازی', tone: 'wine' },
  ready: { label: 'آماده تحویل', tone: 'gold' },
  delivered: { label: 'تحویل داده شد', tone: 'green' },
  cancelled: { label: 'لغو شده', tone: 'muted' },
};

export const PAYMENT_STATUS = {
  paid: { label: 'پرداخت شده', tone: 'green' },
  pending: { label: 'در انتظار پرداخت', tone: 'amber' },
  refunded: { label: 'بازگشت وجه', tone: 'muted' },
};

export const ORDER_TYPE = {
  delivery: 'ارسال به آدرس',
  pickup: 'تحویل حضوری',
  dinein: 'صرف در رستوران',
};

export const RESERVATION_STATUS = {
  confirmed: { label: 'تایید شده', tone: 'green' },
  pending: { label: 'در انتظار تایید', tone: 'amber' },
  completed: { label: 'انجام شده', tone: 'muted' },
  cancelled: { label: 'لغو شده', tone: 'red' },
};

export const NOTIFICATION_TYPE = {
  order: { label: 'سفارش', icon: 'scooter', tone: 'wine' },
  reservation: { label: 'رزرو', icon: 'calendar', tone: 'gold' },
  offer: { label: 'پیشنهاد', icon: 'sparkle', tone: 'amber' },
  loyalty: { label: 'امتیاز', icon: 'star', tone: 'green' },
  system: { label: 'سیستم', icon: 'bell', tone: 'muted' },
};

export const ORDER_FLOW = ['review', 'preparing', 'ready', 'delivered'];

/* =========================================================
   Account defaults — shared by every customer
   ========================================================= */

export const ACCOUNT_RESTAURANT = 'نوال — شعبه سعادت‌آباد';

export const REWARDS = [
  { id: 'rw-drink', title: 'نوشیدنی رایگان', description: 'یک نوشیدنی سرد دلخواه با هر سفارش', cost: 600, icon: 'cart' },
  { id: 'rw-off', title: 'تخفیف ۱۵٪ سفارش', description: 'روی کل سفارش بعدی شما اعمال می‌شود', cost: 800, icon: 'sparkle' },
  { id: 'rw-dessert', title: 'دسر رایگان', description: 'یک دسر از انتخاب سرآشپز', cost: 1200, icon: 'chef' },
  { id: 'rw-ship', title: 'ارسال رایگان', description: 'ارسال سفارش بعدی بدون هزینه', cost: 400, icon: 'scooter' },
  { id: 'rw-chef', title: 'تجربه ویژه سرآشپز', description: 'منوی اختصاصی برای دو نفر', cost: 2500, icon: 'star' },
];

export const DEFAULT_SETTINGS = {
  notifications: { orders: true, reservations: true, offers: false, newsletter: true },
  language: 'fa',
  security: { twoFactor: false },
  privacy: { personalized: true },
};

/* =========================================================
   Fresh account — what a new customer starts with
   ========================================================= */

export const createAccount = ({ firstName = '', lastName = '', phone = '', email = '' } = {}) => ({
  user: {
    firstName,
    lastName,
    phone,
    email,
    birthday: '',
    avatar: '/assets/avatar2.png',
    memberSince: new Date().toISOString().slice(0, 10),
    tier: 'نقره‌ای',
  },

  addresses: [],
  orders: [],
  reservations: [],
  favorites: [],

  notifications: [
    {
      id: 'welcome',
      type: 'system',
      title: 'به نوال خوش آمدید',
      body: 'حساب شما ساخته شد. سفارش‌ها، رزروها و امتیازهای باشگاه مشتریان از این پس همین‌جا نمایش داده می‌شوند.',
      createdAt: new Date().toISOString(),
      read: false,
    },
  ],

  loyalty: {
    points: 0,
    nextRewardAt: 500,
    tier: 'نقره‌ای',
    rewards: REWARDS,
    history: [],
  },

  settings: {
    notifications: { orders: true, reservations: true, offers: false, newsletter: false },
    language: 'fa',
    security: { twoFactor: false },
    privacy: { personalized: true },
  },
});

/* =========================================================
   Derived helpers
   ========================================================= */

export const orderSubtotal = (order) =>
  (order.items || []).reduce((sum, item) => sum + item.price * item.qty, 0);

export const orderTotal = (order) =>
  orderSubtotal(order) + (order.deliveryFee || 0) - (order.discount || 0);

export const orderItemCount = (order) =>
  (order.items || []).reduce((sum, item) => sum + item.qty, 0);

export const activeOrder = (orders) =>
  orders.find((order) => ['review', 'preparing', 'ready'].includes(order.status)) || null;

export const upcomingReservation = (reservations) =>
  reservations.find((item) => ['confirmed', 'pending'].includes(item.status)) || null;

export const resolveItems = (order) =>
  (order.items || []).map((item) => ({ ...item, product: findProduct(item.productId) }));

export const createId = (prefix = 'id') =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
