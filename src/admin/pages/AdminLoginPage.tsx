import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, LockKeyhole } from 'lucide-react';
import { ApiError } from '../../lib/api/client';
import { useAdminAuth } from '../AdminAuthContext';

/**
 * Sign-in for the panel.
 *
 * This is the Laravel API's `/auth/login`, not the storefront's browser-only demo account: the
 * answer is a Sanctum token with the roles and permissions the panel is drawn from. A shopper who
 * signs in here is refused by `can:admin.access` on the first admin request, which is why the
 * message says what it says instead of pretending the credentials were wrong.
 */
export default function AdminLoginPage() {
  const { user, signIn } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  if (user) {
    return <Navigate to="/admin" replace />;
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(undefined);
    setFieldErrors({});

    try {
      await signIn(email.trim(), password);

      const from = (location.state as { from?: string } | null)?.from;
      navigate(from && from.startsWith('/admin') ? from : '/admin', { replace: true });
    } catch (failure) {
      if (failure instanceof ApiError) {
        setFieldErrors(
          Object.fromEntries(
            Object.entries(failure.errors).map(([field, messages]) => [field, messages[0]]),
          ),
        );
        setError(failure.message);
      } else {
        setError('ورود انجام نشد؛ دوباره تلاش کنید.');
      }
    } finally {
      setBusy(false);
    }
  };

  const input =
    'h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[13px] text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-teal-400';

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream/50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <img src="/medora-logo.png" alt="مدورا" className="mx-auto h-9 w-auto" />
          <h1 className="mt-4 text-lg font-bold text-ink">ورود به پنل مدیریت</h1>
          <p className="mt-1.5 text-[12.5px] leading-6 text-muted">
            با حساب مدیر یا کارمند فروشگاه وارد شوید.
          </p>
        </div>

        <form
          onSubmit={(event) => void submit(event)}
          className="rounded-panel bg-white p-6 shadow-lift"
        >
          <div className="mb-4">
            <label htmlFor="admin-email" className="mb-1.5 block text-[12.5px] font-medium text-cocoa">
              ایمیل
            </label>
            <input
              id="admin-email"
              type="email"
              dir="ltr"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={input}
            />
            {fieldErrors.email ? (
              <p className="mt-1.5 text-[12px] text-wine">{fieldErrors.email}</p>
            ) : null}
          </div>

          <div className="mb-4">
            <label
              htmlFor="admin-password"
              className="mb-1.5 block text-[12.5px] font-medium text-cocoa"
            >
              گذرواژه
            </label>
            <input
              id="admin-password"
              type="password"
              dir="ltr"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={input}
            />
            {fieldErrors.password ? (
              <p className="mt-1.5 text-[12px] text-wine">{fieldErrors.password}</p>
            ) : null}
          </div>

          {error ? (
            <p
              role="alert"
              className="mb-4 rounded-xl border border-wine/25 bg-wine/5 px-4 py-2.5 text-[12.5px] leading-6 text-wine"
            >
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-800 text-[14px] font-medium text-white shadow-soft transition-colors hover:bg-teal-700 disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
            {busy ? 'در حال ورود…' : 'ورود'}
          </button>
        </form>

        <p className="mt-5 text-center text-[12px] leading-6 text-muted">
          این بخش فقط برای کارکنان فروشگاه است. اگر حساب مدیریتی ندارید، از دکمهٔ «مشاهدهٔ فروشگاه»
          در پنل یا آدرس اصلی سایت استفاده کنید.
        </p>
      </div>
    </div>
  );
}
