import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { ApiError, setAuthToken } from '../../lib/api/client';
import {
  adminConfirmPassword,
  adminTwoFactorConfirm,
  adminTwoFactorDisable,
  adminTwoFactorEnroll,
  adminTwoFactorRecoveryCodes,
  adminTwoFactorState,
} from '../../services/admin';
import { useAsync } from '../../hooks/useAsync';
import { toFa } from '../../lib/format';
import { useAdminAuth } from '../AdminAuthContext';
import AdminPageHeader from '../components/AdminPageHeader';
import Modal from '../components/Modal';
import RecoveryCodes from '../components/RecoveryCodes';
import StatusPill from '../components/StatusPill';
import TwoFactorEnrollment from '../components/TwoFactorEnrollment';
import { faDate } from '../lib/labels';

/**
 * The operator's own second factor.
 *
 * The state it reads is a *status* — armed or not, how many recovery codes are left — and there is
 * no endpoint that would give the secret or the codes back a second time: the secret is encrypted
 * at rest and the codes are bcrypt hashes, so both are shown once, in the answer that creates them.
 *
 * Two of the actions here (new recovery codes, turning the factor off) are sensitive enough that the
 * API asks for the password again — it answers **423** with `recent_auth_required`. Rather than
 * pretending the session expired, the password is asked for and the same action is retried once the
 * API is satisfied.
 */

const PRIMARY =
  'inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-teal-800 px-5 text-[13px] font-medium text-white transition-colors hover:bg-teal-700 disabled:opacity-50';
const SECONDARY =
  'inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-white px-5 text-[13px] font-medium text-ink transition-colors hover:border-teal-300 hover:text-teal-800 disabled:opacity-50';
const DANGER =
  'inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-wine/30 bg-white px-5 text-[13px] font-medium text-wine transition-colors hover:bg-wine/5 disabled:opacity-50';
const INPUT =
  'h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[13px] text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-teal-400';

export default function SecurityPage() {
  const { reload } = useAdminAuth();
  const state = useAsync(() => adminTwoFactorState(), []);

  const [codes, setCodes] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);

  /** The refused action, kept so it can be retried once the password has been given again. */
  const [retry, setRetry] = useState<(() => Promise<void>) | undefined>(undefined);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | undefined>(undefined);
  const [confirming, setConfirming] = useState(false);

  const enabled = state.data?.enabled === true;

  const run = async (action: () => Promise<void>) => {
    setError(undefined);
    setNotice(undefined);
    setBusy(true);

    try {
      await action();
    } catch (failure) {
      if (failure instanceof ApiError && failure.status === 423) {
        // `setRetry(() => action)` stores the function itself, not its result.
        setRetry(() => action);
        setPassword('');
        setPasswordError(undefined);
        return;
      }

      setError(failure instanceof ApiError ? failure.message : 'انجام نشد؛ دوباره تلاش کنید.');
    } finally {
      setBusy(false);
    }
  };

  const confirmPassword = async (event: FormEvent) => {
    event.preventDefault();
    setConfirming(true);
    setPasswordError(undefined);

    try {
      await adminConfirmPassword(password);

      const action = retry;
      setRetry(undefined);
      setPassword('');

      if (action) await run(action);
    } catch (failure) {
      setPasswordError(failure instanceof ApiError ? failure.message : 'تأیید نشد.');
    } finally {
      setConfirming(false);
    }
  };

  const regenerate = () =>
    run(async () => {
      const result = await adminTwoFactorRecoveryCodes();

      setCodes(result.data?.recovery_codes ?? []);
      setNotice('کدهای بازیابی جدید ساخته شد؛ کدهای قبلی دیگر کار نمی‌کنند.');
    });

  const disable = () =>
    run(async () => {
      await adminTwoFactorDisable();

      setCodes([]);
      setNotice('ورود دو مرحله‌ای غیرفعال شد و سایر نشست‌ها بسته شدند.');
      reload();
      state.reload();
    });

  return (
    <>
      <AdminPageHeader
        title="امنیت حساب"
        description="ورود دو مرحله‌ای با برنامهٔ احراز هویت (TOTP) از حساب کارکنان محافظت می‌کند: پس از گذرواژه، یک کد شش رقمی هم لازم است."
      />

      <div className="mb-5 space-y-3">
        {notice ? (
          <p className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-[12.5px] leading-6 text-teal-800">
            {notice}
          </p>
        ) : null}
        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-wine/25 bg-wine/5 px-4 py-3 text-[12.5px] leading-6 text-wine"
          >
            {error}
          </p>
        ) : null}
      </div>

      <div className="rounded-panel bg-white p-5 shadow-soft">
        {state.loading ? (
          <p role="status" className="flex items-center gap-2.5 text-[13px] text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            در حال دریافت وضعیت…
          </p>
        ) : state.error ? (
          <p role="alert" className="text-[13px] leading-6 text-wine">
            {state.error.message}
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[13.5px] font-medium text-ink">ورود دو مرحله‌ای</p>
                <p className="mt-1 text-[12.5px] leading-6 text-muted">
                  {enabled
                    ? `فعال است${state.data?.confirmed_at ? ` — از ${faDate(state.data.confirmed_at)}` : ''}`
                    : 'فعال نیست؛ فقط گذرواژه لازم است.'}
                </p>
              </div>
              <StatusPill tone={enabled ? 'ok' : state.data?.required ? 'warn' : 'muted'}>
                {enabled ? 'فعال' : state.data?.required ? 'الزامی — فعال نشده' : 'غیرفعال'}
              </StatusPill>
            </div>

            {enabled ? (
              <>
                <p className="mt-4 text-[12.5px] text-muted">
                  کدهای بازیابی باقی‌مانده:{' '}
                  <span className="font-medium text-ink">
                    {toFa(state.data?.recovery_codes_remaining ?? 0)}
                  </span>
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void regenerate()}
                    disabled={busy}
                    className={SECONDARY}
                  >
                    کدهای بازیابی جدید
                  </button>

                  {state.data?.required ? null : (
                    <button
                      type="button"
                      onClick={() => void disable()}
                      disabled={busy}
                      className={DANGER}
                    >
                      غیرفعال‌سازی
                    </button>
                  )}
                </div>

                {state.data?.required ? (
                  <p className="mt-3 text-[12px] leading-6 text-muted">
                    این فروشگاه ورود دو مرحله‌ای را برای حساب‌های کارکنان الزامی کرده است، پس
                    غیرفعال‌سازی ممکن نیست.
                  </p>
                ) : null}

                {codes.length > 0 ? (
                  <div className="mt-4">
                    <RecoveryCodes codes={codes}>
                      <button
                        type="button"
                        onClick={() => setCodes([])}
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-4 text-[12.5px] font-medium text-ink transition-colors hover:border-teal-300 hover:text-teal-800"
                      >
                        ذخیره کردم
                      </button>
                    </RecoveryCodes>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="mt-4">
                <TwoFactorEnrollment
                  start={() => adminTwoFactorEnroll()}
                  confirm={async (value) => {
                    const confirmation = await adminTwoFactorConfirm(value);

                    // Enrollment rotates the token: the one that started the flow is already dead.
                    setAuthToken(confirmation.token);

                    return confirmation.recovery_codes ?? [];
                  }}
                  onDone={() => {
                    reload();
                    state.reload();
                    setNotice('ورود دو مرحله‌ای فعال شد. کدهای بازیابی را جای امنی نگه دارید.');
                  }}
                  doneLabel="ذخیره کردم"
                />
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        open={retry !== undefined}
        title="تأیید گذرواژه"
        description="این تغییر حساس است؛ برای ادامه، گذرواژهٔ خود را دوباره وارد کنید."
        onClose={() => setRetry(undefined)}
        footer={
          <>
            <button type="button" onClick={() => setRetry(undefined)} className={SECONDARY}>
              انصراف
            </button>
            <button
              type="submit"
              form="admin-confirm-password"
              disabled={confirming || password === ''}
              className={PRIMARY}
            >
              {confirming ? 'در حال تأیید…' : 'تأیید'}
            </button>
          </>
        }
      >
        <form id="admin-confirm-password" onSubmit={(event) => void confirmPassword(event)}>
          <label
            htmlFor="admin-confirm-password-input"
            className="mb-1.5 block text-[12.5px] font-medium text-cocoa"
          >
            گذرواژه
          </label>
          <input
            id="admin-confirm-password-input"
            type="password"
            dir="ltr"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={INPUT}
          />
          {passwordError ? <p className="mt-1.5 text-[12px] text-wine">{passwordError}</p> : null}
        </form>
      </Modal>
    </>
  );
}
