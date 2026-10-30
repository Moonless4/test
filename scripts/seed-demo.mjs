#!/usr/bin/env node
/**
 * Demo seed generator — a stand-in "database" for hand testing.
 *
 * The site keeps every record in the browser's localStorage, so there is no
 * database to fill: this script writes a fixture module
 * (src/dev/demoSeed.data.js) and the dev app loads it into localStorage on the
 * next start, once per generated fixture (src/dev/demoSeed.js).
 *
 *   docker compose -f docker-compose.base44.yml exec -T web node scripts/seed-demo.mjs
 *   # then refresh the preview
 *
 * It seeds: one registered demo customer (order history, reservations,
 * notifications, club points), the orders list the admin panel reads, and a few
 * newsletter subscribers. Dates are relative to the moment the script runs, so
 * run it again whenever the sample data should feel current.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { products } from '../src/data/content.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = resolve(ROOT, 'src/dev/demoSeed.data.js');

const CUSTOMER_PHONE = '09123456789';
const CUSTOMER_NAME = 'سارا محمدی';
const RESTAURANT = 'رستوران آترین';
const DELIVERY_FEE = 35000;
const FREE_DELIVERY_FROM = 500000;

const hoursAgo = (hours) => new Date(Date.now() - hours * 3600 * 1000).toISOString();
const dayAt = (offset, hour, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  date.setHours(hour, minute, 0, 0);
  return date;
};
const dayKey = (offset) => {
  const date = dayAt(offset, 12);
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const line = (id, qty) => {
  const product = products.find((item) => item.id === id);
  if (!product) throw new Error(`محصولی با شناسه «${id}» در منو پیدا نشد.`);
  return { productId: product.id, name: product.name, price: product.price, qty };
};

const ADDRESSES = [
  {
    id: 'addr-home',
    title: 'خانه',
    recipient: CUSTOMER_NAME,
    phone: CUSTOMER_PHONE,
    full: 'تهران، سعادت‌آباد، بلوار دریا، خیابان مطهری، پلاک ۲۴، واحد ۵',
    notes: 'زنگ واحد ۵',
    isDefault: true,
  },
  {
    id: 'addr-work',
    title: 'محل کار',
    recipient: CUSTOMER_NAME,
    phone: CUSTOMER_PHONE,
    full: 'تهران، ونک، خیابان گاندی جنوبی، برج نگین، طبقه ۷، واحد ۷۰۲',
    notes: 'تحویل به پذیرش طبقه همکف',
    isDefault: false,
  },
];

/* One order list feeds both the customer history and the admin panel list. */
const ORDERS = [
  {
    code: 'NW-418203',
    customerStatus: 'review',
    adminStatus: 'new',
    type: 'delivery',
    createdAt: hoursAgo(1),
    addressId: 'addr-home',
    payment: { label: 'پرداخت در محل', status: 'pending' },
    items: [line('royal-pizza', 1), line('season-salad', 1)],
  },
  {
    code: 'NW-417640',
    customerStatus: 'preparing',
    adminStatus: 'preparing',
    type: 'delivery',
    createdAt: hoursAgo(4),
    addressId: 'addr-home',
    payment: { label: 'پرداخت آنلاین', status: 'paid' },
    items: [line('double-steak', 1), line('alfredo-pasta', 1), line('season-salad', 2)],
  },
  {
    code: 'NW-409118',
    customerStatus: 'delivered',
    adminStatus: 'done',
    type: 'delivery',
    createdAt: hoursAgo(24 * 6 + 3),
    addressId: 'addr-work',
    payment: { label: 'پرداخت آنلاین', status: 'paid' },
    items: [line('naval-burger', 2), line('charcoal-chicken', 1)],
  },
  {
    code: 'NW-405533',
    customerStatus: 'delivered',
    adminStatus: 'done',
    type: 'pickup',
    createdAt: hoursAgo(24 * 19 + 5),
    addressId: '',
    payment: { label: 'پرداخت آنلاین', status: 'paid' },
    items: [line('saffron-kebab', 2), line('chef-pizza', 1)],
  },
  {
    code: 'NW-401204',
    customerStatus: 'cancelled',
    adminStatus: 'cancelled',
    type: 'delivery',
    createdAt: hoursAgo(24 * 27 + 8),
    addressId: 'addr-home',
    payment: { label: 'بازگشت وجه', status: 'refunded' },
    items: [line('diet-chicken', 1), line('season-salad', 1)],
  },
];

const orderTotals = (order) => {
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const delivery =
    order.type === 'delivery' && subtotal < FREE_DELIVERY_FROM ? DELIVERY_FEE : 0;
  return { subtotal, delivery, total: subtotal + delivery };
};

const customerOrders = ORDERS.map((order, index) => ({
  id: `ord-demo-${index + 1}`,
  code: order.code,
  type: order.type,
  status: order.customerStatus,
  createdAt: order.createdAt,
  restaurant: RESTAURANT,
  items: order.items,
  deliveryFee: orderTotals(order).delivery,
  discount: 0,
  pointsUsed: 0,
  payment: order.payment,
  ...(order.addressId ? { addressId: order.addressId } : {}),
}));

const adminOrders = ORDERS.map((order, index) => {
  const { subtotal, delivery, total } = orderTotals(order);
  const address = ADDRESSES.find((item) => item.id === order.addressId);
  return {
    id: `ord-demo-${index + 1}`,
    code: order.code,
    status: order.adminStatus,
    createdAt: order.createdAt,
    total,
    subtotal,
    delivery,
    discount: 0,
    pointsUsed: 0,
    count: order.items.reduce((sum, item) => sum + item.qty, 0),
    name: CUSTOMER_NAME,
    phone: CUSTOMER_PHONE,
    address: address
      ? `${address.title} — ${address.full}`
      : 'تحویل حضوری در شعبه سعادت‌آباد',
    payment: order.payment.label,
    time: 'در اولین فرصت',
    items: order.items,
  };
});

const RESERVATIONS = [
  {
    id: 'RS-2481',
    status: 'confirmed',
    date: dayKey(3),
    time: '20:30',
    guests: 2,
    area: 'سالن اصلی',
    restaurant: 'آترین — شعبه سعادت‌آباد',
    note: 'میز کنار پنجره باشد، لطفاً.',
  },
  {
    id: 'RS-2510',
    status: 'pending',
    date: dayKey(9),
    time: '21:00',
    guests: 5,
    area: 'تراس',
    restaurant: 'آترین — شعبه سعادت‌آباد',
    note: 'جشن تولد؛ کیک را خودمان می‌آوریم.',
  },
  {
    id: 'RS-2207',
    status: 'completed',
    date: dayKey(-18),
    time: '21:00',
    guests: 4,
    area: 'تراس',
    restaurant: 'آترین — شعبه سعادت‌آباد',
    note: '',
  },
  {
    id: 'RS-1980',
    status: 'cancelled',
    date: dayKey(-33),
    time: '19:00',
    guests: 3,
    area: 'سالن اصلی',
    restaurant: 'آترین — شعبه سعادت‌آباد',
    note: '',
  },
];

const NOTIFICATIONS = [
  {
    id: 'ntf-demo-1',
    type: 'order',
    title: 'سفارش شما در حال آماده‌سازی است',
    body: 'سفارش NW-417640 توسط آشپزخانه تایید شد و تا حدود ۳۰ دقیقه دیگر به دستتان می‌رسد.',
    createdAt: hoursAgo(3),
    read: false,
  },
  {
    id: 'ntf-demo-2',
    type: 'reservation',
    title: 'رزرو RS-2481 تایید شد',
    body: 'میز ۲ نفره شما برای ساعت ۲۰:۳۰ رزرو شد. تا ۱۵ دقیقه پس از ساعت رزرو میز نگه داشته می‌شود.',
    createdAt: hoursAgo(26),
    read: false,
  },
  {
    id: 'ntf-demo-3',
    type: 'loyalty',
    title: '۳۵۰ امتیاز جدید به باشگاه شما اضافه شد',
    body: 'امتیاز سفارش NW-409118 به حساب باشگاه مشتریان آترین اضافه شد.',
    createdAt: hoursAgo(24 * 6),
    read: true,
  },
  {
    id: 'ntf-demo-4',
    type: 'offer',
    title: 'پیشنهاد ویژه آخر هفته',
    body: 'با خرید دو پیتزای مخصوص سرآشپز، نوشیدنی سرد هدیه بگیرید.',
    createdAt: hoursAgo(24 * 11),
    read: true,
  },
  {
    id: 'ntf-demo-5',
    type: 'system',
    title: 'به آترین خوش آمدید',
    body: 'حساب شما ساخته شد. سفارش‌ها، رزروها و امتیازهای باشگاه مشتریان از این پس همین‌جا نمایش داده می‌شوند.',
    createdAt: hoursAgo(24 * 40),
    read: true,
  },
];

const LOYALTY_HISTORY = [
  { id: 'h-demo-1', label: 'امتیاز سفارش NW-417640', points: 145, date: hoursAgo(4) },
  { id: 'h-demo-2', label: 'امتیاز سفارش NW-409118', points: 350, date: hoursAgo(24 * 6) },
  { id: 'h-demo-3', label: 'استفاده از امتیاز در سفارش NW-405533', points: -400, date: hoursAgo(24 * 19) },
  { id: 'h-demo-4', label: 'امتیاز سفارش NW-405533', points: 305, date: hoursAgo(24 * 19) },
  { id: 'h-demo-5', label: 'هدیه ثبت‌نام در باشگاه مشتریان', points: 500, date: hoursAgo(24 * 40) },
];

const NEWSLETTER = [
  'sara.mohammadi@example.com',
  'reza.karimi@example.com',
  'niloofar.ahmadi@example.com',
  'saman.rezaei@example.com',
  'maryam.kazemi@example.com',
  'atrin.fan@example.com',
].map((email, index) => ({
  id: `sub-demo-${index + 1}`,
  email,
  createdAt: hoursAgo(24 * (index + 2)),
}));

const accounts = {
  [CUSTOMER_PHONE]: {
    registrationCompleted: true,
    user: {
      firstName: 'سارا',
      lastName: 'محمدی',
      phone: CUSTOMER_PHONE,
      email: 'sara.mohammadi@example.com',
      birthday: '1991-04-18',
      avatar: 'graphic:rose',
      memberSince: dayKey(-240),
      tier: 'طلایی',
    },
    addresses: ADDRESSES,
    orders: customerOrders,
    reservations: RESERVATIONS,
    favorites: ['royal-pizza', 'chef-pizza', 'season-salad'],
    notifications: NOTIFICATIONS,
    loyalty: {
      points: 1240,
      nextRewardAt: 1500,
      tier: 'طلایی',
      history: LOYALTY_HISTORY,
    },
  },
};

const seed = {
  version: 1,
  createdAt: new Date().toISOString(),
  demo: {
    customer: CUSTOMER_PHONE,
    customerName: CUSTOMER_NAME,
    note: 'داده نمونه برای تست؛ با ?seed=demo در localStorage بارگذاری می‌شود.',
  },
  storage: {
    'naval-accounts-v1': accounts,
    'naval-account-session-v1': CUSTOMER_PHONE,
    'atrin-orders-v1': adminOrders,
    'atrin-newsletter-v1': NEWSLETTER,
  },
};

mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(
  OUTPUT,
  `/* Generated by scripts/seed-demo.mjs — do not edit by hand. */\nexport default ${JSON.stringify(seed, null, 2)};\n`,
  'utf8'
);

console.log(`دیتابیس نمونه ساخته شد: ${OUTPUT}`);
console.log(`مشتری نمونه: ${CUSTOMER_NAME} — ${CUSTOMER_PHONE} (ورود با همین شماره)`);
console.log(
  `سفارش‌ها: ${adminOrders.length} · رزروها: ${RESERVATIONS.length} · اعضای خبرنامه: ${NEWSLETTER.length}`
);
console.log('صفحه را دوباره بارگذاری کنید؛ داده نمونه یک بار در localStorage نوشته می‌شود.');
console.log('توجه: داده‌های فعلی همین مرورگر (سفارش‌ها، خبرنامه، مشتری نمونه) جایگزین می‌شوند.');
