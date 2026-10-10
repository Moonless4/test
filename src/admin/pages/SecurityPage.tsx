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
 * Two of the actions here (new recovery codes, turning the factor off) are sensitive enough that they
 * need the password again **and** a current code from the authenticator: the API answers **423**
 * with `recent_auth_required` until the password is re-entered, and refuses the action with **422**
 * without a code that verifies. The panel asks for both up front — a password on its own is never
 * treated as enough to reissue the codes that stand in for the second factor, or to remove it.
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

  /** The action waiting on its proof (password + a current code from the app). */
  const [proof, setProof] = useState<((code: string) => Promise<void>) | undefined>(undefined);
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [proofError, setProofError] = useState<string | undefined>(undefined);
  const [confirming, setConfirming] = useState(false);

  const enabled = state.data?.enabled === true;

  const run = async (action: () => Promise<void>) => {
    setError(undefined);
    setNotice(undefined);
    setBusy(true);

    try {
      await action();
    } catch (failure) {
      setError(failure instanceof ApiError ? failure.message : 'انجام نشد؛ دوباره تلاش کنید.');
    } finally {
      setBusy(false);
    }
  };

  /** `setProof(() => action)` stores the function itself, not its result. */
  const askForProof = (action: (code: string) => Promise<void>) => {
    setError(undefined);
    setNotice(undefined);
    setPassword('');
    setCode('');
    setProofError(undefined);
    setProof(() => action);
  };

  const submitProof = async (event: FormEvent) => {
    event.preventDefault();
    setConfirming(true);
    setProofError(undefined);

    try {
      // The re-authentication comes first: without it the API answers 423 and the action is refused
      // before the code is ever looked at.
      await adminConfirmPassword(password);

      const action = proof;
      setProof(undefined);

      if (action) await action(code);
    } catch (failure) {
      setProofError(failure instanceof ApiError ? failure.message : 'تأیید نشد.');
    } finally {
      setConfirming(false);
    }
  };

  const regenerate = (value: string) =>
    run(async () => {
      const result = await adminTwoFactorRecoveryCodes(value);

      setCodes(result.data?.recovery_codes ?? []);
      setNotice('کدهای بازیابی جدید ساخته شد؛ کدهای قبلی دیگر کار نمی‌کنند.');
    });

  const disable = (value: string) =>
    run(async () => {
      await adminTwoFactorDisable(value);

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
                    onClick={() => askForProof(regenerate)}
                    disabled={busy}
                    className={SECONDARY}
                  >
                    کدهای بازیابی جدید
                  </button>

                  {state.data?.required ? null : (
                    <button
                      type="button"
                      onClick={() => askForProof(disable)}
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
        open={proof !== undefined}
        title="تأیید تغییر حساس"
        description="برای این تغییر، گذرواژهٔ خود را دوباره وارد کنید و کد شش‌رقمی برنامهٔ احراز هویت را بنویسید."
        onClose={() => setProof(undefined)}
        footer={
          <>
            <button type="button" onClick={() => setProof(undefined)} className={SECONDARY}>
              انصراف
            </button>
            <button
              type="submit"
              form="admin-security-proof"
              disabled={confirming || password === '' || code.length !== 6}
              className={PRIMARY}
            >
              {confirming ? 'در حال تأیید…' : 'تأیید'}
            </button>
          </>
        }
      >
        <form id="admin-security-proof" onSubmit={(event) => void submitProof(event)}>
          <label
            htmlFor="admin-security-password"
            className="mb-1.5 block text-[12.5px] font-medium text-cocoa"
          >
            گذرواژه
          </label>
          <input
            id="admin-security-password"
            type="password"
            dir="ltr"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={INPUT}
          />

          <label
            htmlFor="admin-security-code"
            className="mt-4 mb-1.5 block text-[12.5px] font-medium text-cocoa"
          >
            کد برنامهٔ احراز هویت
          </label>
          <input
            id="admin-security-code"
            type="text"
            dir="ltr"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="۱۲۳۴۵۶"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className={INPUT}
          />

          {proofError ? <p className="mt-1.5 text-[12px] text-wine">{proofError}</p> : null}
        </form>
      </Modal>
    </>
  );
}
