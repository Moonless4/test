import type { Tone } from '../components/StatusPill';

/**
 * The vocabulary the panel prints.
 *
 * Every enum lives in one place so a status cannot be labelled two different ways on two screens,
 * and the Persian wording is chosen once rather than in each table cell. The labels are display
 * text only: the API keeps sending and accepting its own machine values.
 */

export const ORDER_STATUS: Record<string, { label: string; tone: Tone }> = {
  pending_payment: { label: 'در انتظار پرداخت', tone: 'warn' },
  paid: { label: 'پرداخت‌شده', tone: 'ok' },
  processing: { label: 'در حال آماده‌سازی', tone: 'info' },
  shipped: { label: 'ارسال‌شده', tone: 'info' },
  delivered: { label: 'تحویل‌شده', tone: 'ok' },
  cancelled: { label: 'لغوشده', tone: 'danger' },
  refunded: { label: 'مرجوع‌شده', tone: 'danger' },
};

export const PAYMENT_STATUS: Record<string, { label: string; tone: Tone }> = {
  pending: { label: 'در انتظار', tone: 'warn' },
  succeeded: { label: 'موفق', tone: 'ok' },
  failed: { label: 'ناموفق', tone: 'danger' },
  cancelled: { label: 'لغوشده', tone: 'muted' },
  refunded: { label: 'بازگشت‌خورده', tone: 'danger' },
};

export const CONTENT_STATUS: Record<string, { label: string; tone: Tone }> = {
  published: { label: 'منتشرشده', tone: 'ok' },
  draft: { label: 'پیش‌نویس', tone: 'muted' },
};

export const COUPON_TYPE: Record<string, string> = {
  percent: 'درصدی',
  fixed: 'مبلغ ثابت',
};

export const SETTING_TYPE: Record<string, string> = {
  string: 'متن',
  int: 'عدد صحیح',
  float: 'عدد اعشاری',
  bool: 'بله/خیر',
  json: 'JSON',
};

/**
 * An order's allowed next states.
 *
 * A mirror of `App\Enums\OrderStatus::allowedTransitions()` — the panel renders only the moves the
 * API would accept, and the API refuses anything else with a 422 and its own message, so a drifted
 * copy here can never move an order somewhere illegal.
 */
export const ORDER_TRANSITIONS: Record<string, string[]> = {
  pending_payment: ['paid', 'cancelled'],
  paid: ['processing', 'cancelled', 'refunded'],
  processing: ['shipped', 'cancelled', 'refunded'],
  shipped: ['delivered', 'refunded'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
};

export const orderLabel = (status: string) =>
  ORDER_STATUS[status]?.label ?? status;

export const orderTone = (status: string): Tone => ORDER_STATUS[status]?.tone ?? 'muted';

export const paymentLabel = (status: string) => PAYMENT_STATUS[status]?.label ?? status;

export const paymentTone = (status: string): Tone => PAYMENT_STATUS[status]?.tone ?? 'muted';

export const contentLabel = (status: string) => CONTENT_STATUS[status]?.label ?? status;

export const contentTone = (status: string): Tone => CONTENT_STATUS[status]?.tone ?? 'muted';

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/** A date for a table cell: `۱۴۰۵/۰۷/۱۸` style, always with Persian digits. */
export const faDate = (iso: string | null | undefined): string => {
  if (!iso) return '—';

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';

  const pad = (value: number) => String(value).padStart(2, '0');
  const latin = `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`;

  return latin.replace(/\d/g, (digit) => FA_DIGITS[Number(digit)]);
};

/** `datetime-local` wants `YYYY-MM-DDTHH:mm` in local time; the API answers with an ISO string. */
export const toDateTimeInput = (iso: string | null | undefined): string => {
  if (!iso) return '';

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const pad = (value: number) => String(value).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
};

/** A `datetime-local` value back to the ISO string the API expects (`null` when cleared). */
export const fromDateTimeInput = (value: string): string | null => {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};
