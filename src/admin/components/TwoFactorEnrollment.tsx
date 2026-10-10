import { useState, type FormEvent } from 'react';
import { Check, Copy, Loader2, ShieldCheck } from 'lucide-react';
import { ApiError } from '../../lib/api/client';
import type { AdminTwoFactorEnrollment } from '../../services/admin';
import RecoveryCodes from './RecoveryCodes';

/**
 * Turning the second factor on, in three steps.
 *
 * The secret leaves the server exactly once — in the answer to `start()` — and so do the recovery
 * codes, in the answer to `confirm()`. Those are the only two moments either value exists in the
 * browser, which is why both are shown here and neither can be fetched again: the API keeps an
 * encrypted secret and bcrypt hashes of the codes, so "show me my codes again" is not a question it
 * can answer.
 *
 * Two callers, one flow: the login screen (the shop requires a second factor and the account has
 * not enrolled, so the login's own *setup* token is handed to `start`/`confirm`) and the panel's
 * security screen, which uses the session token.
 */
type Props = {
  start: () => Promise<AdminTwoFactorEnrollment>;
  confirm: (code: string) => Promise<string[]>;
  /** Where "done" goes once the codes have been stored; the login screen uses it to enter the panel. */
  onDone?: () => void;
  doneLabel?: string;
};

const INPUT =
  'h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[13px] text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-teal-400';
const PRIMARY =
  'inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-teal-800 px-5 text-[13px] font-medium text-white transition-colors hover:bg-teal-700 disabled:opacity-50';
const SECONDARY =
  'inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-4 text-[12.5px] font-medium text-ink transition-colors hover:border-teal-300 hover:text-teal-800';

export default function TwoFactorEnrollment({ start, confirm, onDone, doneLabel = 'انجام شد' }: Props) {
  const [step, setStep] = useState<'idle' | 'scan' | 'codes'>('idle');
  const [enrollment, setEnrollment] = useState<AdminTwoFactorEnrollment | undefined>(undefined);
  const [codes, setCodes] = useState<string[]>([]);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const begin = async () => {
    setBusy(true);
    setError(undefined);

    try {
      setEnrollment(await start());
      setStep('scan');
    } catch (failure) {
      setError(failure instanceof ApiError ? failure.message : 'شروع فعال‌سازی انجام نشد.');
    } finally {
      setBusy(false);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(undefined);

    try {
      setCodes(await confirm(code.trim()));
      setStep('codes');
    } catch (failure) {
      setError(failure instanceof ApiError ? failure.message : 'تأیید کد انجام نشد.');
    } finally {
      setBusy(false);
    }
  };

  const copySecret = async () => {
    if (!enrollment) return;

    try {
      await navigator.clipboard.writeText(enrollment.secret);
      setCopied(true);
    } catch {
      /* the secret is on screen and selectable either way */
    }
  };

  if (step === 'codes') {
    return (
      <RecoveryCodes codes={codes}>
        {onDone ? (
          <button type="button" onClick={onDone} className={PRIMARY}>
            {doneLabel}
          </button>
        ) : null}
      </RecoveryCodes>
    );
  }

  if (step === 'idle') {
    return (
      <div className="rounded-xl border border-line bg-cream/40 p-4">
        <p className="text-[13px] leading-7 text-cocoa">
          برای فعال‌سازی، یک برنامهٔ احراز هویت (مثل Google Authenticator یا Microsoft Authenticator)
          روی گوشی خود نصب کنید؛ در مرحلهٔ بعد کلید حساب به شما داده می‌شود.
        </p>
        <button
          type="button"
          onClick={() => void begin()}
          disabled={busy}
          className={`${PRIMARY} mt-3`}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          {busy ? 'در حال آماده‌سازی…' : 'شروع فعال‌سازی'}
        </button>
        {error ? (
          <p role="alert" className="mt-3 rounded-xl border border-wine/25 bg-wine/5 px-4 py-2.5 text-[12.5px] leading-6 text-wine">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="space-y-4">
      <div>
        <p className="text-[12.5px] font-medium text-cocoa">
          ۱. این کلید را در برنامهٔ احراز هویت اضافه کنید
        </p>
        <div className="mt-2 flex flex-wrap items-start gap-2">
          <code
            dir="ltr"
            className="min-w-0 flex-1 break-all rounded-xl border border-line bg-cream/60 px-3.5 py-2.5 font-mono text-[12.5px] tracking-wider text-ink"
          >
            {enrollment?.secret}
          </code>
          <button type="button" onClick={() => void copySecret()} className={SECONDARY}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'کپی شد' : 'کپی'}
          </button>
        </div>
        {enrollment?.otpauth_url ? (
          <a
            href={enrollment.otpauth_url}
            className="mt-2 inline-block text-[12px] text-teal-700 hover:underline"
          >
            افزودن خودکار به برنامهٔ روی همین دستگاه
          </a>
        ) : null}
      </div>

      <div>
        <label htmlFor="admin-2fa-code" className="mb-1.5 block text-[12.5px] font-medium text-cocoa">
          ۲. کد شش رقمی برنامه
        </label>
        <input
          id="admin-2fa-code"
          dir="ltr"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          required
          value={code}
          onChange={(event) => setCode(event.target.value)}
          className={`${INPUT} text-center tracking-[0.4em]`}
        />
      </div>

      {error ? (
        <p role="alert" className="rounded-xl border border-wine/25 bg-wine/5 px-4 py-2.5 text-[12.5px] leading-6 text-wine">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy || code.trim().length !== 6}
        className={`${PRIMARY} w-full`}
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
        {busy ? 'در حال تأیید…' : 'تأیید و فعال‌سازی'}
      </button>
    </form>
  );
}
