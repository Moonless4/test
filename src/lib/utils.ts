import { faDigits } from './jalali';

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

/** عدد فارسی با جداکننده هزارگان: ۴٬۸۵۰٬۰۰۰ */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('fa-IR').format(Math.round(value));
}

/** قیمت به تومان */
export function formatToman(value: number): string {
  return `${formatNumber(value)} تومان`;
}

/** ۱ ساعت و ۲۰ دقیقه */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${faDigits(m)} دقیقه`;
  if (m === 0) return `${faDigits(h)} ساعت`;
  return `${faDigits(h)} ساعت و ${faDigits(m)} دقیقه`;
}

/** ۰۷:۳۰ */
export function formatClock(minutesFromMidnight: number): string {
  const h = Math.floor(minutesFromMidnight / 60) % 24;
  const m = minutesFromMidnight % 60;
  return faDigits(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
}

/** هش پایدار برای تولید داده‌ی تکرارپذیر */
export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** مولد اعداد تصادفی با دانه‌ی ثابت (نتیجه‌ی تکرارپذیر) */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickFrom<T>(list: T[], rand: () => number): T {
  return list[Math.floor(rand() * list.length) % list.length];
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function slugify(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0600-\u06FF-]/g, '');
}

export function pluralFa(count: number, single: string, plural?: string): string {
  return count === 1 ? single : plural ?? single;
}

export function percentOff(price: number, oldPrice: number): number {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

/** خواندن پارامتر تاریخ از URL (میلادی، YYYY-MM-DD) */
export function parseDateParam(value: string | null): Date | null {
  if (!value) return null;
  const parts = value.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function serializeDate(date: Date | null): string {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** فاصله‌ی زمانی نسبی برای تاریخ‌های آینده */
export function daysFromNow(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}
