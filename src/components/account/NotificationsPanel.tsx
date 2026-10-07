import { useState } from 'react';
import { BellRing, Check, Mail, MessageSquare, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { onlyDigits, toFa } from '../../lib/format';

/**
 * «درخواست‌های اطلاع‌رسانی» — three ways to opt in to store updates:
 * an SMS request on a mobile number, an email subscription, and the browser's
 * own site-notification permission. Choices are demo-only and live in
 * localStorage (`styleon.notifications`), keyed per user; replace with real API
 * calls once a backend exists.
 */

type Notice = {
  sms: string;
  email: boolean;
  push: boolean;
};

const EMPTY_NOTICE: Notice = { sms: '', email: false, push: false };
const KEY = 'styleon.notifications';

const load = (userId: string): Notice => {
  try {
    const raw = window.localStorage.getItem(KEY);
    const book = raw ? (JSON.parse(raw) as Record<string, Notice>) : {};
    return { ...EMPTY_NOTICE, ...(book[userId] ?? {}) };
  } catch {
    return EMPTY_NOTICE;
  }
};

const persist = (userId: string, notice: Notice) => {
  try {
    const raw = window.localStorage.getItem(KEY);
    const book = raw ? (JSON.parse(raw) as Record<string, Notice>) : {};
    window.localStorage.setItem(KEY, JSON.stringify({ ...book, [userId]: notice }));
  } catch {
    /* storage unavailable — the choice simply stays in memory */
  }
};

const field =
  'h-12 w-full rounded-xl border border-line bg-white px-4 text-[13px] text-ink outline-none transition-colors focus:border-teal-400';

const card = 'rounded-panel border border-line bg-white p-5 sm:p-6';

const primaryButton =
  'flex h-11 shrink-0 items-center gap-2 rounded-xl bg-teal-800 px-5 text-[13px] font-bold text-white transition-colors hover:bg-teal-700';

export default function NotificationsPanel() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<Notice>(() => load(user?.id ?? 'guest'));
  const [mobile, setMobile] = useState(prefs.sms || user?.mobile || '');
  const [mobileError, setMobileError] = useState('');
  const [pushNote, setPushNote] = useState('');
  const [permission, setPermission] = useState<NotificationPermission>(() =>
    typeof Notification === 'undefined' ? 'denied' : Notification.permission,
  );

  const save = (patch: Partial<Notice>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      persist(user?.id ?? 'guest', next);
      return next;
    });
  };

  const submitSms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^09\d{9}$/.test(mobile))
      return setMobileError('شماره موبایل را به شکل ۰۹xxxxxxxxx وارد کنید.');
    setMobileError('');
    save({ sms: mobile });
  };

  const askPush = async () => {
    if (typeof Notification === 'undefined') {
      setPushNote('مرورگر شما از اعلانات سایت پشتیبانی نمی‌کند.');
      return;
    }
    let result: NotificationPermission = 'denied';
    try {
      result = await Notification.requestPermission();
    } catch {
      result = 'denied';
    }
    setPermission(result);
    save({ push: result === 'granted' });
    setPushNote(
      result === 'granted'
        ? 'اعلانات سایت فعال شد.'
        : result === 'denied'
          ? 'اجازه اعلانات داده نشد. از تنظیمات مرورگر می‌توانید آن را فعال کنید.'
          : 'هنوز تصمیمی درباره اعلانات سایت گرفته نشده است.',
    );
  };

  return (
    <div className="space-y-6">
      <p className="rounded-panel border border-line bg-cream p-5 text-[13px] leading-6 text-muted">
        راه‌های اطلاع‌رسانی خود را انتخاب کنید تا تخفیف‌ها، کالکشن‌های جدید و وضعیت سفارش‌ها را زودتر
        از همه باخبر شوید.
      </p>

      <section className={card}>
        <h2 className="flex items-center gap-2.5 text-base font-bold text-ink">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-800">
            <MessageSquare className="h-5 w-5" />
          </span>
          اطلاع‌رسانی پیامکی
        </h2>
        <p className="mt-3 text-[12.5px] leading-6 text-muted">
          شماره موبایل خود را وارد کنید تا کد تخفیف‌ها و خبر فروش‌های ویژه از طریق پیامک برای شما
          ارسال شود.
        </p>

        <form onSubmit={submitSms} className="mt-4 flex flex-wrap items-center gap-3" noValidate>
          <input
            dir="ltr"
            inputMode="numeric"
            maxLength={11}
            value={mobile}
            onChange={(e) => setMobile(onlyDigits(e.target.value))}
            placeholder="09xxxxxxxxx"
            aria-label="شماره موبایل برای اطلاع‌رسانی پیامکی"
            className={`${field} sm:max-w-[240px]`}
          />
          <button type="submit" className={primaryButton}>
            ارسال پیامک
          </button>
        </form>

        {mobileError ? (
          <p role="alert" className="mt-4 rounded-xl bg-sale/10 px-4 py-3 text-[12.5px] text-sale">
            {mobileError}
          </p>
        ) : null}

        {prefs.sms ? (
          <p className="mt-4 flex items-center gap-2 rounded-xl bg-teal-50 px-4 py-3 text-[12.5px] text-teal-800">
            <Check className="h-4 w-4 shrink-0" />
            اطلاع‌رسانی پیامکی برای شماره {toFa(prefs.sms)} فعال است.
          </p>
        ) : null}
      </section>

      <section className={card}>
        <h2 className="flex items-center gap-2.5 text-base font-bold text-ink">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-800">
            <Mail className="h-5 w-5" />
          </span>
          اطلاع‌رسانی ایمیلی
        </h2>
        <p className="mt-3 text-[12.5px] leading-6 text-muted">
          خبرنامه و پیشنهادهای اختصاصی به ایمیل حساب کاربری شما ارسال می‌شود.
        </p>
        <p dir="ltr" className="mt-3 text-[13px] font-medium text-ink">
          {user?.email}
        </p>

        {prefs.email ? (
          <p className="mt-4 flex items-center gap-2 rounded-xl bg-teal-50 px-4 py-3 text-[12.5px] text-teal-800">
            <Check className="h-4 w-4 shrink-0" />
            اطلاع‌رسانی ایمیلی فعال است.
          </p>
        ) : (
          <button type="button" onClick={() => save({ email: true })} className={`${primaryButton} mt-4`}>
            فعال‌سازی اطلاع‌رسانی ایمیلی
          </button>
        )}
      </section>

      <section className={card}>
        <h2 className="flex items-center gap-2.5 text-base font-bold text-ink">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-800">
            <BellRing className="h-5 w-5" />
          </span>
          اعلانات سایت
        </h2>
        <p className="mt-3 text-[12.5px] leading-6 text-muted">
          با فعال کردن اعلانات، پیام‌های فروشگاه حتی وقتی سایت باز نیست در مرورگر شما نمایش داده
          می‌شود.
        </p>

        {permission === 'granted' ? (
          <p className="mt-4 flex items-center gap-2 rounded-xl bg-teal-50 px-4 py-3 text-[12.5px] text-teal-800">
            <Check className="h-4 w-4 shrink-0" />
            اعلانات سایت در این مرورگر فعال است.
          </p>
        ) : (
          <button type="button" onClick={askPush} className={`${primaryButton} mt-4`}>
            درخواست مجوز اعلانات
          </button>
        )}

        {pushNote ? (
          <p className="mt-4 flex items-center gap-2 rounded-xl bg-cream px-4 py-3 text-[12.5px] text-ink/80">
            <ShieldAlert className="h-4 w-4 shrink-0 text-teal-800" />
            {pushNote}
          </p>
        ) : null}
      </section>
    </div>
  );
}
