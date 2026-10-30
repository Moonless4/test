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
 * It seeds the orders list the admin panel reads and a few newsletter
 * subscribers — never a customer account: the site always starts signed out and
 * every customer registers their own profile. Dates are relative to the moment
 * the script runs, so run it again whenever the sample data should feel current.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { products } from '../src/data/content.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = resolve(ROOT, 'src/dev/demoSeed.data.js');

const CUSTOMER_PHONE = '09123456789';
const CUSTOMER_NAME = 'سارا محمدی';
const DELIVERY_FEE = 35000;
const FREE_DELIVERY_FROM = 500000;

const hoursAgo = (hours) => new Date(Date.now() - hours * 3600 * 1000).toISOString();

const line = (id, qty) => {
  const product = products.find((item) => item.id === id);
  if (!product) throw new Error(`محصولی با شناسه «${id}» در منو پیدا نشد.`);
  return { productId: product.id, name: product.name, price: product.price, qty };
};

/* Only the addresses that the demo orders carry, for the admin panel list. */
const ADDRESSES = [
  {
    id: 'addr-home',
    title: 'خانه',
    full: 'تهران، سعادت‌آباد، بلوار دریا، خیابان مطهری، پلاک ۲۴، واحد ۵',
  },
  {
    id: 'addr-work',
    title: 'محل کار',
    full: 'تهران، ونک، خیابان گاندی جنوبی، برج نگین، طبقه ۷، واحد ۷۰۲',
  },
];

/* One order list feeds both the customer history and the admin panel list. */
const ORDERS = [
  {
    code: 'NW-418203',
    adminStatus: 'new',
    type: 'delivery',
    createdAt: hoursAgo(1),
    addressId: 'addr-home',
    payment: { label: 'پرداخت در محل', status: 'pending' },
    items: [line('royal-pizza', 1), line('season-salad', 1)],
  },
  {
    code: 'NW-417640',
    adminStatus: 'preparing',
    type: 'delivery',
    createdAt: hoursAgo(4),
    addressId: 'addr-home',
    payment: { label: 'پرداخت آنلاین', status: 'paid' },
    items: [line('double-steak', 1), line('alfredo-pasta', 1), line('season-salad', 2)],
  },
  {
    code: 'NW-409118',
    adminStatus: 'done',
    type: 'delivery',
    createdAt: hoursAgo(24 * 6 + 3),
    addressId: 'addr-work',
    payment: { label: 'پرداخت آنلاین', status: 'paid' },
    items: [line('naval-burger', 2), line('charcoal-chicken', 1)],
  },
  {
    code: 'NW-405533',
    adminStatus: 'done',
    type: 'pickup',
    createdAt: hoursAgo(24 * 19 + 5),
    addressId: '',
    payment: { label: 'پرداخت آنلاین', status: 'paid' },
    items: [line('saffron-kebab', 2), line('chef-pizza', 1)],
  },
  {
    code: 'NW-401204',
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

const seed = {
  version: 2,
  createdAt: new Date().toISOString(),
  /* نسخه‌های قبلی این فایل یک مشتری آماده را در مرورگر وارد می‌کردند؛ لودر
     توسعه این شناسه‌ها را از حافظه پاک می‌کند تا سایت همیشه مهمان باز شود. */
  purgeAccounts: [CUSTOMER_PHONE],
  storage: {
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
console.log(
  `سفارش‌ها: ${adminOrders.length} · اعضای خبرنامه: ${NEWSLETTER.length} · حساب کاربری: هیچ (سایت مهمان باز می‌شود)`
);
console.log('صفحه را دوباره بارگذاری کنید؛ داده نمونه یک بار در localStorage نوشته می‌شود.');
console.log('توجه: داده‌های فعلی همین مرورگر (سفارش‌ها و خبرنامه) جایگزین می‌شوند.');
