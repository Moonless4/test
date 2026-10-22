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
   Demo customer data — shaped like a future API response
   ========================================================= */

export const ACCOUNT_RESTAURANT = 'نوال — شعبه سعادت‌آباد';

export const demoAccount = {
  user: {
    firstName: 'نگار',
    lastName: 'امیری',
    phone: '09121234567',
    email: 'negar.amiri@gmail.com',
    birthday: '1993-08-03',
    avatar: '/assets/avatar3.png',
    memberSince: '2024-02-11',
    tier: 'طلایی',
  },

  addresses: [
    {
      id: 'addr-home',
      title: 'خانه',
      full: 'تهران، سعادت‌آباد، بلوار دریا، کوچه بهار، پلاک ۱۲، واحد ۴',
      recipient: 'نگار امیری',
      phone: '09121234567',
      notes: 'زنگ واحد ۴ را بزنید؛ آسانسور سمت راست.',
      isDefault: true,
    },
    {
      id: 'addr-work',
      title: 'محل کار',
      full: 'تهران، ونک، خیابان گاندی، برج نگین، طبقه ۷، واحد ۷۰۳',
      recipient: 'نگار امیری',
      phone: '09121234567',
      notes: 'تحویل به نگهبان ساختمان انجام شود.',
      isDefault: false,
    },
  ],

  orders: [
    {
      id: '1048',
      createdAt: '2026-10-20T20:15:00',
      restaurant: ACCOUNT_RESTAURANT,
      status: 'preparing',
      type: 'delivery',
      payment: { method: 'online', status: 'paid', label: 'پرداخت آنلاین' },
      items: [
        { productId: 'royal-pizza', qty: 1, price: 320000 },
        { productId: 'iced-peach-tea', qty: 2, price: 72000 },
      ],
      discount: 0,
      deliveryFee: 25000,
      addressId: 'addr-home',
      note: 'پنیر اضافه لطفاً.',
    },
    {
      id: '1039',
      createdAt: '2026-10-15T12:10:00',
      restaurant: ACCOUNT_RESTAURANT,
      status: 'ready',
      type: 'dinein',
      payment: { method: 'pos', status: 'paid', label: 'پرداخت با کارت در رستوران' },
      items: [
        { productId: 'double-steak', qty: 2, price: 520000 },
        { productId: 'mint-lemonade', qty: 2, price: 68000 },
      ],
      discount: 50000,
      deliveryFee: 0,
      addressId: null,
      note: '',
    },
    {
      id: '1032',
      createdAt: '2026-10-11T13:40:00',
      restaurant: ACCOUNT_RESTAURANT,
      status: 'delivered',
      type: 'pickup',
      payment: { method: 'online', status: 'paid', label: 'پرداخت آنلاین' },
      items: [
        { productId: 'naval-burger', qty: 1, price: 285000 },
        { productId: 'season-salad', qty: 1, price: 165000 },
      ],
      discount: 30000,
      deliveryFee: 0,
      addressId: null,
      note: '',
    },
    {
      id: '1019',
      createdAt: '2026-09-28T21:05:00',
      restaurant: ACCOUNT_RESTAURANT,
      status: 'delivered',
      type: 'delivery',
      payment: { method: 'online', status: 'paid', label: 'پرداخت آنلاین' },
      items: [
        { productId: 'chef-pizza', qty: 1, price: 385000 },
        { productId: 'alfredo-pasta', qty: 1, price: 295000 },
      ],
      discount: 0,
      deliveryFee: 25000,
      addressId: 'addr-work',
      note: '',
    },
    {
      id: '1007',
      createdAt: '2026-09-14T19:20:00',
      restaurant: ACCOUNT_RESTAURANT,
      status: 'cancelled',
      type: 'delivery',
      payment: { method: 'online', status: 'refunded', label: 'پرداخت آنلاین' },
      items: [{ productId: 'saffron-kebab', qty: 2, price: 420000 }],
      discount: 0,
      deliveryFee: 25000,
      addressId: 'addr-home',
      note: '',
    },
  ],

  reservations: [
    {
      id: 'RS-2041',
      date: '2026-10-24',
      time: '20:30',
      guests: 4,
      area: 'تراس روباز',
      restaurant: ACCOUNT_RESTAURANT,
      status: 'confirmed',
      note: 'به مناسبت سالگرد ازدواج؛ در صورت امکان میز کنار پنجره.',
    },
    {
      id: 'RS-2063',
      date: '2026-11-02',
      time: '19:00',
      guests: 2,
      area: 'سالن اصلی',
      restaurant: ACCOUNT_RESTAURANT,
      status: 'pending',
      note: '',
    },
    {
      id: 'RS-1987',
      date: '2026-09-05',
      time: '21:00',
      guests: 6,
      area: 'اتاق خصوصی',
      restaurant: ACCOUNT_RESTAURANT,
      status: 'completed',
      note: '',
    },
    {
      id: 'RS-1944',
      date: '2026-08-19',
      time: '19:30',
      guests: 3,
      area: 'تراس روباز',
      restaurant: ACCOUNT_RESTAURANT,
      status: 'cancelled',
      note: '',
    },
  ],

  favorites: ['royal-pizza', 'chef-pizza', 'iced-peach-tea', 'saffron-kebab'],

  notifications: [
    {
      id: 'n1',
      type: 'order',
      title: 'سفارش شما در حال آماده‌سازی است',
      body: 'سفارش شماره ۱۰۴۸ در آشپزخانه نوال آماده می‌شود و به‌زودی ارسال خواهد شد.',
      createdAt: '2026-10-20T20:32:00',
      read: false,
    },
    {
      id: 'n2',
      type: 'reservation',
      title: 'رزرو شما تایید شد',
      body: 'میز ۴ نفره در تراس روباز برای ۲ آبان ساعت ۲۰:۳۰ رزرو شد.',
      createdAt: '2026-10-19T11:05:00',
      read: false,
    },
    {
      id: 'n3',
      type: 'offer',
      title: 'پیشنهاد ویژه آخر هفته',
      body: 'پیتزای مخصوص سرآشپز با ۲۰٪ تخفیف تا پایان پنجشنبه در منوی شما فعال است.',
      createdAt: '2026-10-18T09:15:00',
      read: false,
    },
    {
      id: 'n4',
      type: 'loyalty',
      title: '۱۵۰ امتیاز جدید دریافت کردید',
      body: 'بابت سفارش قبلی ۱۵۰ امتیاز به باشگاه مشتریان شما اضافه شد.',
      createdAt: '2026-10-12T14:20:00',
      read: true,
    },
    {
      id: 'n5',
      type: 'order',
      title: 'سفارش شما تحویل داده شد',
      body: 'سفارش شماره ۱۰۳۲ با موفقیت تحویل داده شد. از انتخاب نوال سپاسگزاریم.',
      createdAt: '2026-10-11T14:22:00',
      read: true,
    },
    {
      id: 'n6',
      type: 'system',
      title: 'به باشگاه مشتریان نوال خوش آمدید',
      body: 'با هر سفارش امتیاز جمع کنید و به تخفیف‌ها و دسرهای ویژه دسترسی بگیرید.',
      createdAt: '2026-09-30T10:00:00',
      read: true,
    },
  ],

  loyalty: {
    points: 1850,
    nextRewardAt: 2000,
    tier: 'طلایی',
    rewards: [
      { id: 'rw-drink', title: 'نوشیدنی رایگان', description: 'یک نوشیدنی سرد دلخواه با هر سفارش', cost: 600, icon: 'cart' },
      { id: 'rw-off', title: 'تخفیف ۱۵٪ سفارش', description: 'روی کل سفارش بعدی شما اعمال می‌شود', cost: 800, icon: 'sparkle' },
      { id: 'rw-dessert', title: 'دسر رایگان', description: 'یک دسر از انتخاب سرآشپز', cost: 1200, icon: 'chef' },
      { id: 'rw-ship', title: 'ارسال رایگان', description: 'ارسال سفارش بعدی بدون هزینه', cost: 400, icon: 'scooter' },
      { id: 'rw-chef', title: 'تجربه ویژه سرآشپز', description: 'منوی اختصاصی برای دو نفر', cost: 2500, icon: 'star' },
    ],
    history: [
      { id: 'h1', label: 'سفارش شماره ۱۰۴۸', points: 120, date: '2026-10-20T20:40:00' },
      { id: 'h2', label: 'سفارش شماره ۱۰۳۹', points: 210, date: '2026-10-15T12:30:00' },
      { id: 'h3', label: 'سفارش شماره ۱۰۳۲', points: 150, date: '2026-10-11T14:30:00' },
      { id: 'h4', label: 'رزرو میز در نوال', points: 80, date: '2026-09-05T21:00:00' },
      { id: 'h5', label: 'نوشیدنی رایگان', points: -600, date: '2026-08-28T18:00:00' },
    ],
  },

  settings: {
    notifications: { orders: true, reservations: true, offers: false, newsletter: true },
    language: 'fa',
    security: { twoFactor: false },
    privacy: { personalized: true },
  },
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
    rewards: demoAccount.loyalty.rewards,
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
