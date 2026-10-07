import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { onlyDigits } from '../lib/format';

const field =
  'h-12 w-full rounded-xl border border-line bg-white px-4 text-[13px] text-ink outline-none transition-colors focus:border-teal-400';

/** Sign-up form. Accounts are stored in this browser only (no server yet). */
export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', mobile: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name.trim().length < 3) return setError('نام و نام خانوادگی را وارد کنید.');
    if (!/^09\d{9}$/.test(form.mobile.trim()))
      return setError('شماره موبایل را به شکل ۰۹xxxxxxxxx وارد کنید.');
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError('ایمیل را درست وارد کنید.');
    if (form.password.length < 6) return setError('رمز عبور باید حداقل ۶ کاراکتر باشد.');
    if (form.password !== form.confirm) return setError('تکرار رمز عبور مطابقت ندارد.');

    const result = register({
      name: form.name,
      mobile: form.mobile,
      email: form.email,
      password: form.password,
    });
    if (!result.ok) {
      setError(result.error ?? 'ثبت‌نام انجام نشد.');
      return;
    }
    navigate('/account');
  };

  return (
    <div className="container py-10 sm:py-16">
      <div className="mx-auto w-full max-w-md rounded-panel border border-line bg-white p-6 shadow-soft sm:p-8">
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cream text-black">
          <UserPlus className="h-5 w-5" />
        </span>
        <h1 className="text-xl font-black text-ink sm:text-2xl">ساخت حساب کاربری</h1>
        <p className="mt-2 text-[13px] leading-6 text-muted">
          با ساخت حساب، سفارش‌ها و آدرس‌های خود را یک‌جا مدیریت کنید.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="name" className="mb-1.5 block text-[13px] font-medium text-ink">
              نام و نام خانوادگی
            </label>
            <input
              id="name"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className={field}
            />
          </div>

          <div>
            <label htmlFor="mobile" className="mb-1.5 block text-[13px] font-medium text-ink">
              شماره موبایل
            </label>
            <input
              id="mobile"
              dir="ltr"
              value={form.mobile}
              onChange={(e) => set('mobile', onlyDigits(e.target.value))}
              placeholder="09xxxxxxxxx"
              inputMode="numeric"
              maxLength={11}
              className={field}
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium text-ink">
              ایمیل
            </label>
            <input
              id="email"
              type="email"
              dir="ltr"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="you@example.com"
              className={field}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="password" className="mb-1.5 block text-[13px] font-medium text-ink">
                رمز عبور
              </label>
              <input
                id="password"
                type="password"
                dir="ltr"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                className={field}
              />
            </div>
            <div>
              <label htmlFor="confirm" className="mb-1.5 block text-[13px] font-medium text-ink">
                تکرار رمز عبور
              </label>
              <input
                id="confirm"
                type="password"
                dir="ltr"
                value={form.confirm}
                onChange={(e) => set('confirm', e.target.value)}
                className={field}
              />
            </div>
          </div>

          {error ? (
            <p role="alert" className="rounded-xl bg-sale/10 px-4 py-3 text-[12.5px] text-sale">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="h-12 w-full rounded-xl bg-teal-800 text-sm font-bold text-white transition-colors hover:bg-teal-700"
          >
            ثبت‌نام
          </button>
        </form>

        <p className="mt-6 text-center text-[13px] text-muted">
          قبلاً ثبت‌نام کرده‌اید؟{' '}
          <Link to="/login" className="font-medium text-black hover:underline">
            وارد شوید
          </Link>
        </p>
      </div>
    </div>
  );
}
