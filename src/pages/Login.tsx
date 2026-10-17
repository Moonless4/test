import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { faDigits } from '@/lib/jalali';

export default function Login() {
  const navigate = useNavigate();
  const { user, login, logout } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [mobile, setMobile] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submitLogin = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!/^09\d{9}$/.test(mobile)) next.mobile = 'شماره موبایل معتبر وارد کنید (مثال: ۰۹۱۲۳۴۵۶۷۸۹)';
    if (usePassword) {
      if (password.length < 6) next.password = 'رمز عبور حداقل ۶ کاراکتر باشد';
    } else if (codeSent) {
      if (!/^\d{5}$/.test(code)) next.code = 'کد تأیید ۵ رقمی را وارد کنید';
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    if (!usePassword && !codeSent) {
      setCodeSent(true);
      setErrors({});
      return;
    }

    // ورود آزمایشی: در نسخه‌ی عملیاتی این بخش به سرویس احراز هویت متصل می‌شود
    login({ name: name || 'کاربر سفربان', phone: mobile, email: email || undefined });
    navigate('/account');
  };

  const submitRegister = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (name.trim().length < 3) next.name = 'نام و نام خانوادگی را کامل وارد کنید';
    if (!/^09\d{9}$/.test(mobile)) next.mobile = 'شماره موبایل معتبر وارد کنید';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'ایمیل معتبر وارد کنید';
    if (password.length < 6) next.password = 'رمز عبور حداقل ۶ کاراکتر باشد';
    if (!accepted) next.accepted = 'پذیرش قوانین و مقررات الزامی است';
    setErrors(next);
    if (Object.keys(next).length) return;

    login({ name: name.trim(), phone: mobile, email: email || undefined });
    navigate('/account');
  };

  if (user) {
    return (
      <div className="container-page py-10">
        <div className="mx-auto max-w-md rounded-2xl border border-ink-200 bg-white p-6 text-center shadow-card">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Icon name="user" className="h-7 w-7" />
          </span>
          <h1 className="mt-4 text-base font-bold text-ink-900">شما وارد حساب خود هستید</h1>
          <p className="num mt-2 text-xs text-ink-500">{user.name} · {user.phone}</p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link to="/account">
              <Button block>مشاهده سفرهای من</Button>
            </Link>
            <Button variant="secondary" onClick={logout}>
              خروج از حساب
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page grid gap-6 py-7 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:py-12">
      <div className="order-2 lg:order-1">
        <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-card sm:p-6">
          <div className="flex rounded-lg border border-ink-200 bg-ink-50 p-0.5">
            {[
              { key: 'login' as const, label: 'ورود' },
              { key: 'register' as const, label: 'ثبت‌نام' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setMode(tab.key);
                  setErrors({});
                }}
                className={cn(
                  'flex-1 rounded-md py-2.5 text-xs font-medium transition',
                  mode === tab.key ? 'bg-white text-brand-700 shadow-card' : 'text-ink-500 hover:text-ink-800',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {mode === 'login' ? (
            <form onSubmit={submitLogin} className="mt-5 space-y-3.5" noValidate>
              <div>
                <label className="field-label">شماره موبایل</label>
                <div className={cn('field-shell', errors.mobile && 'field-shell-error')}>
                  <Icon name="phone" className="h-4 w-4 text-ink-400" />
                  <input
                    value={mobile}
                    onChange={(event) => setMobile(event.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    inputMode="numeric"
                    className="input-base num dir-ltr"
                  />
                </div>
                {errors.mobile && <p className="mt-1 text-2xs text-danger-600">{errors.mobile}</p>}
              </div>

              {usePassword ? (
                <div>
                  <label className="field-label">رمز عبور</label>
                  <div className={cn('field-shell', errors.password && 'field-shell-error')}>
                    <Icon name="lock" className="h-4 w-4 text-ink-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="رمز عبور"
                      className="input-base dir-ltr"
                    />
                  </div>
                  {errors.password && <p className="mt-1 text-2xs text-danger-600">{errors.password}</p>}
                </div>
              ) : codeSent ? (
                <div>
                  <label className="field-label">کد تأیید پیامک‌شده</label>
                  <div className={cn('field-shell', errors.code && 'field-shell-error')}>
                    <Icon name="shield-check" className="h-4 w-4 text-ink-400" />
                    <input
                      value={code}
                      onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 5))}
                      placeholder="۵ رقم"
                      inputMode="numeric"
                      className="input-base num dir-ltr tracking-[0.4em]"
                    />
                  </div>
                  {errors.code && <p className="mt-1 text-2xs text-danger-600">{errors.code}</p>}
                  <p className="num mt-1.5 text-2xs text-ink-500">
                    کد تأیید به شماره {faDigits(mobile)} ارسال شد. (در نسخه‌ی نمایشی هر کد ۵ رقمی پذیرفته می‌شود)
                  </p>
                </div>
              ) : null}

              <Button type="submit" size="lg" block>
                {usePassword ? 'ورود به حساب' : codeSent ? 'تأیید و ورود' : 'دریافت کد تأیید'}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setUsePassword((current) => !current);
                  setCodeSent(false);
                  setErrors({});
                }}
                className="w-full text-2xs font-medium text-brand-700"
              >
                {usePassword ? 'ورود با کد یک‌بارمصرف پیامکی' : 'ورود با رمز عبور'}
              </button>
            </form>
          ) : (
            <form onSubmit={submitRegister} className="mt-5 space-y-3.5" noValidate>
              <div>
                <label className="field-label">نام و نام خانوادگی</label>
                <div className={cn('field-shell', errors.name && 'field-shell-error')}>
                  <Icon name="user" className="h-4 w-4 text-ink-400" />
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="مثال: سارا محمدی"
                    className="input-base"
                  />
                </div>
                {errors.name && <p className="mt-1 text-2xs text-danger-600">{errors.name}</p>}
              </div>

              <div>
                <label className="field-label">شماره موبایل</label>
                <div className={cn('field-shell', errors.mobile && 'field-shell-error')}>
                  <Icon name="phone" className="h-4 w-4 text-ink-400" />
                  <input
                    value={mobile}
                    onChange={(event) => setMobile(event.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    inputMode="numeric"
                    className="input-base num dir-ltr"
                  />
                </div>
                {errors.mobile && <p className="mt-1 text-2xs text-danger-600">{errors.mobile}</p>}
              </div>

              <div>
                <label className="field-label">ایمیل (اختیاری)</label>
                <div className={cn('field-shell', errors.email && 'field-shell-error')}>
                  <Icon name="mail" className="h-4 w-4 text-ink-400" />
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="input-base dir-ltr"
                  />
                </div>
                {errors.email && <p className="mt-1 text-2xs text-danger-600">{errors.email}</p>}
              </div>

              <div>
                <label className="field-label">رمز عبور</label>
                <div className={cn('field-shell', errors.password && 'field-shell-error')}>
                  <Icon name="lock" className="h-4 w-4 text-ink-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="حداقل ۶ کاراکتر"
                    className="input-base dir-ltr"
                  />
                </div>
                {errors.password && <p className="mt-1 text-2xs text-danger-600">{errors.password}</p>}
              </div>

              <label className="flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(event) => setAccepted(event.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-ink-300 accent-brand-600"
                />
                <span className="text-2xs leading-6 text-ink-600">
                  قوانین و مقررات و سیاست حریم خصوصی سفربان را می‌پذیرم.
                </span>
              </label>
              {errors.accepted && <p className="text-2xs text-danger-600">{errors.accepted}</p>}

              <Button type="submit" size="lg" block>
                ساخت حساب کاربری
              </Button>
            </form>
          )}

          <p className="mt-4 border-t border-ink-100 pt-4 text-center text-2xs leading-6 text-ink-500">
            با ورود یا ثبت‌نام، امکان پیگیری سفرها، استرداد آنلاین و دریافت تخفیف‌های اختصاصی برای شما فعال می‌شود.
          </p>
        </div>
      </div>

      <aside className="order-1 lg:order-2">
        <div className="mb-4">
          <Logo />
        </div>
        <h1 className="text-lg font-bold leading-9 text-ink-900 sm:text-xl">
          حساب کاربری سفربان؛ همه‌ی سفرها در یک نگاه
        </h1>
        <p className="mt-3 text-xs leading-7 text-ink-500 sm:text-sm">
          با ساخت حساب کاربری، بلیط‌ها و رزروهای خود را مدیریت کنید، درخواست استرداد ثبت کنید و از تخفیف‌های
          باشگاه مشتریان بهره‌مند شوید.
        </p>
        <ul className="mt-5 space-y-3">
          {[
            'پیگیری لحظه‌ای وضعیت پرواز و اقامتگاه',
            'استرداد آنلاین بدون تماس تلفنی',
            'ذخیره‌ی اطلاعات مسافران برای رزرو سریع‌تر',
            'دسترسی به تخفیف‌های اختصاصی اعضا',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-xs text-ink-600">
              <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-success-600" />
              {item}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
