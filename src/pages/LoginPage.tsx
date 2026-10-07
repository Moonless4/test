import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const field =
  'h-12 w-full rounded-xl border border-line bg-white px-4 text-[13px] text-ink outline-none transition-colors focus:border-teal-400';

/** Sign-in form. Accounts are stored in this browser only (no server yet). */
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('ایمیل را درست وارد کنید.');
      return;
    }
    const result = login(email, password);
    if (!result.ok) {
      setError(result.error ?? 'ورود انجام نشد.');
      return;
    }
    navigate('/account');
  };

  return (
    <div className="container py-10 sm:py-16">
      <div className="mx-auto w-full max-w-md rounded-panel border border-line bg-white p-6 shadow-soft sm:p-8">
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cream text-black">
          <LogIn className="h-5 w-5" />
        </span>
        <h1 className="text-xl font-black text-ink sm:text-2xl">ورود به حساب</h1>
        <p className="mt-2 text-[13px] leading-6 text-muted">
          برای پیگیری سفارش‌ها و مدیریت اطلاعات حساب وارد شوید.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium text-ink">
              ایمیل
            </label>
            <input
              id="email"
              type="email"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={field}
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-[13px] font-medium text-ink">
              رمز عبور
            </label>
            <input
              id="password"
              type="password"
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={field}
            />
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
            ورود
          </button>
        </form>

        <p className="mt-6 text-center text-[13px] text-muted">
          حساب کاربری ندارید؟{' '}
          <Link to="/register" className="font-medium text-black hover:underline">
            ثبت‌نام کنید
          </Link>
        </p>
      </div>
    </div>
  );
}
