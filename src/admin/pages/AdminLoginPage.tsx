import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, LockKeyhole, ShieldCheck } from 'lucide-react';
import { ApiError } from '../../lib/api/client';
import { useAdminAuth } from '../AdminAuthContext';
import TwoFactorEnrollment from '../components/TwoFactorEnrollment';
import { adminHref, isAdminPath } from '../lib/basePath';

/**
 * Sign-in for the panel, in up to three steps.
 *
 * This is the Laravel API's `/auth/login`, not the storefront's browser-only demo account, and the
 * shop requires a second factor of its staff — so the password is often only the first step:
 *
 *  - an account with a confirmed second factor gets a **challenge**: the six-digit code (or a
 *    recovery code) is asked for here, and only then is a session token stored;
 *  - a staff account that has not enrolled gets a **setup** token, and must enroll before anything
 *    else. The codes it receives are shown once, and the panel stays closed until they are
 *    acknowledged — which is why `holding` guards the redirect below.
 *
 * A shopper who signs in here is refused by `can:admin.access` on the first admin request, which is
 * why the message says what it says instead of pretending the credentials were wrong.
 */
export default function AdminLoginPage() {
  const {
    user,
    signIn,
    pending,
    submitChallenge,
    enrollPending,
    confirmPending,
    cancelPending,
  } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  /**
   * Enrollment is finished but its recovery codes are on screen. The session exists by now, so the
   * panel is a redirect away — this holds that redirect until the operator says they stored them.
   */
  const [holding, setHolding] = useState(false);

  const from = (location.state as { from?: string } | null)?.from;
  const enter = () => navigate(from && isAdminPath(from) ? from : adminHref(), { replace: true });

  const step = holding
    ? 'setup'
    : pending?.kind === 'challenge'
      ? 'challenge'
      : pending?.kind === 'setup'
        ? 'setup'
        : 'credentials';

  if (user && !holding) {
    return <Navigate to={adminHref()} replace />;
  }

  const submitCredentials = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(undefined);
    setFieldErrors({});

    try {
      await signIn(email.trim(), password);
      setCode('');
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

  const submitCode = async (event: FormEvent) => {
    event.preventDefault();

    const answer = useRecoveryCode ? recoveryCode.trim() : code.trim();

    if (answer === '') {
      setError(useRecoveryCode ? 'کد بازیابی را وارد کنید.' : 'کد شش رقمی را وارد کنید.');
      return;
    }

    setBusy(true);
    setError(undefined);

    try {
      if (useRecoveryCode) await submitChallenge('', answer);
      else await submitChallenge(answer);

      enter();
    } catch (failure) {
      setError(failure instanceof ApiError ? failure.message : 'کد تأیید نشد؛ دوباره تلاش کنید.');
    } finally {
      setBusy(false);
    }
  };

  const backToCredentials = () => {
    cancelPending();
    setCode('');
    setRecoveryCode('');
    setUseRecoveryCode(false);
    setError(undefined);
  };

  const input =
    'h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[13px] text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-teal-400';

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream/50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <img src="/medora-logo.png" alt="مدورا" className="mx-auto h-9 w-auto" />
          <h1 className="mt-4 text-lg font-bold text-ink">
            {step === 'credentials'
              ? 'ورود به پنل مدیریت'
              : step === 'challenge'
                ? 'کد ورود دو مرحله‌ای'
                : 'فعال‌سازی ورود دو مرحله‌ای'}
          </h1>
          <p className="mt-1.5 text-[12.5px] leading-6 text-muted">
            {step === 'credentials'
              ? 'با حساب مدیر یا کارمند فروشگاه وارد شوید.'
              : step === 'challenge'
                ? 'کد شش رقمی برنامهٔ احراز هویت را وارد کنید.'
                : 'برای حساب‌های کارکنان، ورود دو مرحله‌ای الزامی است. یک‌بار آن را فعال کنید.'}
          </p>
        </div>

        {step === 'credentials' ? (
          <form
            onSubmit={(event) => void submitCredentials(event)}
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
        ) : step === 'challenge' ? (
          <form
            onSubmit={(event) => void submitCode(event)}
            className="rounded-panel bg-white p-6 shadow-lift"
          >
            {useRecoveryCode ? (
              <div className="mb-4">
                <label
                  htmlFor="admin-recovery-code"
                  className="mb-1.5 block text-[12.5px] font-medium text-cocoa"
                >
                  کد بازیابی
                </label>
                <input
                  id="admin-recovery-code"
                  dir="ltr"
                  autoComplete="off"
                  placeholder="XXXXX-XXXXX"
                  value={recoveryCode}
                  onChange={(event) => setRecoveryCode(event.target.value.toUpperCase())}
                  className={`${input} text-center tracking-wider`}
                />
              </div>
            ) : (
              <div className="mb-4">
                <label htmlFor="admin-code" className="mb-1.5 block text-[12.5px] font-medium text-cocoa">
                  کد شش رقمی
                </label>
                <input
                  id="admin-code"
                  dir="ltr"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  className={`${input} text-center tracking-[0.4em]`}
                />
              </div>
            )}

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
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              {busy ? 'در حال بررسی…' : 'تأیید و ورود'}
            </button>

            <button
              type="button"
              onClick={() => {
                setUseRecoveryCode((current) => !current);
                setError(undefined);
              }}
              className="mt-3 w-full text-center text-[12px] text-teal-700 transition-colors hover:underline"
            >
              {useRecoveryCode
                ? 'کد شش رقمی برنامه را وارد می‌کنم'
                : 'به برنامهٔ احراز هویت دسترسی ندارم'}
            </button>
          </form>
        ) : (
          <div className="rounded-panel bg-white p-6 shadow-lift">
            <TwoFactorEnrollment
              start={enrollPending}
              confirm={async (value) => {
                const codes = await confirmPending(value);
                setHolding(true);
                return codes;
              }}
              onDone={enter}
              doneLabel="ورود به پنل"
            />
          </div>
        )}

        {step === 'credentials' ? (
          <p className="mt-5 text-center text-[12px] leading-6 text-muted">
            این بخش فقط برای کارکنان فروشگاه است. اگر حساب مدیریتی ندارید، از دکمهٔ «مشاهدهٔ فروشگاه»
            در پنل یا آدرس اصلی سایت استفاده کنید.
          </p>
        ) : holding ? null : (
          <button
            type="button"
            onClick={backToCredentials}
            className="mt-5 block w-full text-center text-[12px] text-muted transition-colors hover:text-teal-700"
          >
            بازگشت به ورود
          </button>
        )}
      </div>
    </div>
  );
}
