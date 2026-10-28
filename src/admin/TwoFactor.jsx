// The second factor screens: first-login setup (QR + one-time backup codes),
// the 6-digit / backup-code prompt on later logins, and the read-only status
// block in the dashboard. Nothing here ever receives the TOTP secret once setup
// is finished, and the backup codes exist only in this component's state.
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  cancelTwoFactor,
  completeTwoFactorSetup,
  getTwoFactorStatus,
  regenerateBackupCodes,
  startTwoFactorSetup,
  verifyTwoFactor,
  verifyTwoFactorSetup,
} from './api.js';

const digits = (value) => String(value || '').replace(/\D/g, '').slice(0, 6);

function downloadCodes(codes) {
  const blob = new Blob([`کدهای پشتیبان پنل مدیریت آراتان\n\n${codes.join('\n')}\n`], {
    type: 'text/plain;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'aratan-backup-codes.txt';
  link.click();
  URL.revokeObjectURL(url);
}

async function copyCodes(codes) {
  try {
    await navigator.clipboard.writeText(codes.join('\n'));
  } catch {
    /* clipboard can be blocked; the codes stay visible for manual copying */
  }
}

function QrCode({ value }) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    let alive = true;
    if (!value) return undefined;
    QRCode.toDataURL(value, { margin: 1, width: 512, color: { dark: '#1b1f24', light: '#ffffff' } })
      .then((dataUrl) => {
        if (alive) setSrc(dataUrl);
      })
      .catch(() => {
        if (alive) setSrc('');
      });
    return () => {
      alive = false;
    };
  }, [value]);

  if (!src) return <div className="adm-qr-placeholder">در حال ساخت کد QR…</div>;
  return <img className="adm-qr" src={src} alt="کد QR برنامهٔ Google Authenticator" width="240" height="240" />;
}

function codeInputProps(maxLength) {
  return {
    className: 'adm-input adm-code-input',
    inputMode: maxLength === 6 ? 'numeric' : 'text',
    autoComplete: 'one-time-code',
    maxLength,
    dir: 'ltr',
  };
}

// Shown once, right after setup. `onConfirm` is what records that the codes
// were saved; without it (the regenerate flow) the block is informational.
export function BackupCodes({ codes, onConfirm, onDismiss }) {
  const [saved, setSaved] = useState(false);
  const [revealed, setRevealed] = useState(true);

  return (
    <div className="adm-codes-block">
      <p className="adm-warn">
        این کدها فقط همین یک بار نمایش داده می‌شوند. آن‌ها را در جای امن نگه دارید؛ هر کد تنها یک بار قابل
        استفاده است.
      </p>

      {revealed ? (
        <ul className="adm-codes" dir="ltr">
          {codes.map((code) => (
            <li key={code}>{code}</li>
          ))}
        </ul>
      ) : (
        <p className="adm-note">کدها پنهان شدند.</p>
      )}

      <div className="adm-actions">
        <button type="button" className="adm-ghost" onClick={() => copyCodes(codes)}>
          کپی کدها
        </button>
        <button type="button" className="adm-ghost" onClick={() => downloadCodes(codes)}>
          ذخیرهٔ فایل کدها
        </button>
        <button type="button" className="adm-ghost" onClick={() => setRevealed((current) => !current)}>
          {revealed ? 'پنهان کردن' : 'نمایش کدها'}
        </button>
      </div>

      {onConfirm ? (
        <>
          <label className="adm-check">
            <input type="checkbox" checked={saved} onChange={(event) => setSaved(event.target.checked)} />
            <span>کدهای پشتیبان را در جای امنی ذخیره کرده‌ام.</span>
          </label>
          <button type="button" className="adm-primary" disabled={!saved} onClick={onConfirm}>
            پایان راه‌اندازی و ورود به پنل
          </button>
        </>
      ) : null}

      {onDismiss ? (
        <button type="button" className="adm-ghost" onClick={onDismiss}>
          متوجه شدم
        </button>
      ) : null}
    </div>
  );
}

export function TwoFactorSetupScreen({ onDone, onCancel }) {
  const [info, setInfo] = useState(null);
  const [codes, setCodes] = useState(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    startTwoFactorSetup()
      .then(setInfo)
      .catch((setupError) => setError(setupError.message));
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const result = await verifyTwoFactorSetup(code);
      setCodes(result.backupCodes);
      setCode('');
    } catch (verifyError) {
      setError(verifyError.message);
    } finally {
      setBusy(false);
    }
  };

  const finish = async () => {
    setBusy(true);
    setError('');
    try {
      await completeTwoFactorSetup();
      onDone();
    } catch (completeError) {
      setError(completeError.message);
      setBusy(false);
    }
  };

  const back = async () => {
    await cancelTwoFactor().catch(() => {});
    onCancel();
  };

  return (
    <div className="adm-login">
      <div className="adm-login-card adm-wide">
        <span className="adm-kicker">پنل مدیریت آراتان</span>
        <h1>راه‌اندازی ورود دومرحله‌ای</h1>

        {codes ? (
          <>
            <p className="adm-note">
              ورود دومرحله‌ای فعال شد. این کدهای پشتیبان جایگزین برنامهٔ احراز هویت هستند؛ هر کدام فقط یک بار
              کار می‌کند.
            </p>
            <BackupCodes codes={codes} onConfirm={finish} />
            {error ? <p className="adm-error">{error}</p> : null}
          </>
        ) : (
          <>
            <p className="adm-note">
              برنامهٔ Google Authenticator را باز کنید، کد QR زیر را اسکن کنید و سپس کد ۶ رقمی را وارد کنید. اگر
              اسکن ممکن نیست، کلید دستی را در برنامه وارد کنید.
            </p>
            <div className="adm-qr-row">
              <QrCode value={info?.otpauth || ''} />
              <div className="adm-manual">
                <span className="adm-label">کلید راه‌اندازی دستی</span>
                <code className="adm-manual-key" dir="ltr">
                  {info?.formatted || '…'}
                </code>
                <span className="adm-note">حساب: {info?.account || '—'}</span>
                <span className="adm-note">نوع: TOTP، ۶ رقم، هر ۳۰ ثانیه</span>
              </div>
            </div>

            <form className="adm-2fa-form" onSubmit={submit}>
              <label className="adm-field">
                <span className="adm-label">کد ۶ رقمی برنامهٔ Google Authenticator</span>
                <input
                  {...codeInputProps(6)}
                  value={code}
                  onChange={(event) => setCode(digits(event.target.value))}
                  placeholder="۱۲۳۴۵۶"
                />
              </label>
              {error ? <p className="adm-error">{error}</p> : null}
              <button type="submit" className="adm-primary" disabled={busy || code.length !== 6}>
                {busy ? 'در حال بررسی…' : 'تأیید و فعال‌سازی'}
              </button>
            </form>
            <button type="button" className="adm-link adm-link-button" onClick={back}>
              بازگشت به ورود
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function TwoFactorVerifyScreen({ onDone, onCancel }) {
  const [mode, setMode] = useState('totp');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await verifyTwoFactor(code);
      onDone();
    } catch (verifyError) {
      setError(verifyError.message);
      setBusy(false);
    }
  };

  const back = async () => {
    await cancelTwoFactor().catch(() => {});
    onCancel();
  };

  const ready = mode === 'totp' ? code.length === 6 : code.length >= 6;

  return (
    <div className="adm-login">
      <div className="adm-login-card">
        <span className="adm-kicker">پنل مدیریت آراتان</span>
        <h1>کد تأیید دومرحله‌ای</h1>
        <p className="adm-note">
          {mode === 'totp'
            ? 'کد ۶ رقمی برنامهٔ Google Authenticator را وارد کنید.'
            : 'یکی از کدهای پشتیبان ذخیره‌شده را وارد کنید. هر کد فقط یک بار معتبر است.'}
        </p>

        <form className="adm-2fa-form" onSubmit={submit}>
          <label className="adm-field">
            <span className="adm-label">{mode === 'totp' ? 'کد ۶ رقمی' : 'کد پشتیبان'}</span>
            <input
              {...codeInputProps(mode === 'totp' ? 6 : 11)}
              value={code}
              onChange={(event) => setCode(mode === 'totp' ? digits(event.target.value) : event.target.value)}
              placeholder={mode === 'totp' ? '۱۲۳۴۵۶' : 'xxxxx-xxxxx'}
              autoFocus
            />
          </label>
          {error ? <p className="adm-error">{error}</p> : null}
          <button type="submit" className="adm-primary" disabled={busy || !ready}>
            {busy ? 'در حال بررسی…' : 'ورود به پنل'}
          </button>
        </form>

        <button
          type="button"
          className="adm-link adm-link-button"
          onClick={() => {
            setMode(mode === 'totp' ? 'backup' : 'totp');
            setCode('');
            setError('');
          }}
        >
          {mode === 'totp' ? 'دسترسی به برنامه ندارم — استفاده از کد پشتیبان' : 'استفاده از کد برنامهٔ احراز هویت'}
        </button>
        <button type="button" className="adm-link adm-link-button" onClick={back}>
          بازگشت به ورود
        </button>
      </div>
    </div>
  );
}

export function SecurityPanel() {
  const [status, setStatus] = useState(null);
  const [mode, setMode] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [codes, setCodes] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () =>
    getTwoFactorStatus()
      .then(setStatus)
      .catch((statusError) => setError(statusError.message));

  useEffect(() => {
    load();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const result = await regenerateBackupCodes(password, code);
      setCodes(result.backupCodes);
      setMode('');
      setPassword('');
      setCode('');
      await load();
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="adm-security-grid">
      <section className="adm-card adm-card-pad">
        <span className="adm-eyebrow">لایهٔ دوم ورود</span>
        <h2>Google Authenticator</h2>
        <div className="adm-security-row">
          <span>وضعیت ورود دومرحله‌ای</span>
          <strong className={status?.enabled ? 'adm-state-on' : 'adm-state-off'}>
            {status ? (status.enabled ? 'فعال — الزامی' : 'در انتظار راه‌اندازی') : 'در حال بررسی…'}
          </strong>
        </div>
        {status?.enabled ? (
          <p className="adm-muted">
            کدهای پشتیبان باقی‌مانده: {status.backupCodesLeft}. ورود دومرحله‌ای پس از راه‌اندازی به‌طور دائمی
            فعال می‌ماند و از این پنل قابل غیرفعال‌سازی نیست.
          </p>
        ) : (
          <p className="adm-muted">در ورود بعدی، راه‌اندازی Google Authenticator از شما خواسته می‌شود.</p>
        )}
        <p className="adm-note">
          کلید راه‌اندازی و کدهای پشتیبان هرگز در این صفحه نمایش داده نمی‌شوند؛ کدهای پشتیبان فقط یک بار، هنگام
          راه‌اندازی یا ساخت مجدد، قابل مشاهده‌اند.
        </p>
        {status?.enabled ? (
          <div className="adm-actions">
            <button type="button" className="adm-btn adm-btn-quiet" onClick={() => setMode('codes')}>
              ساخت مجدد کدهای پشتیبان
            </button>
          </div>
        ) : null}
      </section>

      <section className="adm-card adm-card-pad">
        <span className="adm-eyebrow">کدهای اضطراری</span>
        <h2>کدهای پشتیبان</h2>
        {codes ? (
          <div className="adm-codes-block">
            <p className="adm-note">کدهای جدید ساخته شد؛ کدهای قبلی دیگر معتبر نیستند.</p>
            <BackupCodes codes={codes} onDismiss={() => setCodes(null)} />
          </div>
        ) : (
          <p className="adm-muted">
            برای دریافت مجموعهٔ تازه، رمز عبور و یک کد فعلی برنامهٔ احراز هویت را وارد کنید. هر کد فقط یک بار
            استفاده می‌شود.
          </p>
        )}

        {mode ? (
          <form className="adm-2fa-form adm-reauth" onSubmit={submit}>
            <label className="adm-field">
              <span className="adm-label">رمز عبور</span>
              <input
                className="adm-input"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            <label className="adm-field">
              <span className="adm-label">کد برنامهٔ احراز هویت یا کد پشتیبان</span>
              <input
                className="adm-input"
                dir="ltr"
                autoComplete="one-time-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
              />
            </label>
            {error ? <p className="adm-error">{error}</p> : null}
            <div className="adm-actions">
              <button type="submit" className="adm-btn" disabled={busy || !password || !code}>
                {busy ? 'در حال بررسی…' : 'ساخت کدهای جدید'}
              </button>
              <button
                type="button"
                className="adm-btn adm-btn-quiet"
                onClick={() => {
                  setMode('');
                  setPassword('');
                  setCode('');
                  setError('');
                }}
              >
                انصراف
              </button>
            </div>
          </form>
        ) : null}

        {!mode && error ? <p className="adm-error">{error}</p> : null}
      </section>
    </div>
  );
}
