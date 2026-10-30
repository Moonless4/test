import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';
import Icon from './Icons.jsx';
import { useAccount } from '../account/AccountContext.jsx';
import { isValidPhone, normalizePhone } from '../lib/phone.js';

export default function AuthModal({
  open,
  initialMode = 'login',
  onClose,
  onToast,
  onSuccess,
  mandatory = false,
}) {
  const { login, register } = useAccount();
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ name: '', phone: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setForm({ name: '', phone: '', password: '' });
      setError('');
    }
  }, [open, initialMode]);

  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  /* Keep the phone in one standard shape while typing; emails pass through untouched */
  const updateIdentifier = (event) => {
    const raw = event.target.value;
    setForm((prev) => ({ ...prev, phone: raw.includes('@') ? raw : normalizePhone(raw) }));
    setError('');
  };

  const submit = (event) => {
    event.preventDefault();
    const identifier = form.phone.trim();
    if ((mode === 'register' && !form.name.trim()) || !identifier || !form.password) {
      setError('لطفاً همه فیلدها را تکمیل کنید.');
      return;
    }
    if (!identifier.includes('@') && !isValidPhone(identifier)) {
      setError('شماره موبایل را در قالب ۰۹۱۲۳۴۵۶۷۸۹ وارد کنید.');
      return;
    }
    if (form.password.length < 6) {
      setError('رمز عبور باید حداقل ۶ کاراکتر باشد.');
      return;
    }
    setError('');

    if (mode === 'register') {
      const result = register({ name: form.name, identifier });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onToast('حساب شما با موفقیت ایجاد شد.');
    } else {
      const result = login({ identifier });
      onToast(result.created ? 'حساب جدیدی با این شماره ساخته شد.' : 'ورود شما با موفقیت انجام شد.');
    }

    onClose();
    onSuccess?.();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="modal--auth"
      label="ورود یا ثبت‌نام"
      closable={!mandatory}
    >
      <div className="auth">
        <span className="auth__logo">
          <Icon name="user" size={30} />
        </span>
        <h2>{mode === 'login' ? 'خوش برگشتید' : 'به آترین خوش آمدید'}</h2>
        <p>
          {mandatory
            ? 'برای تسویه حساب ابتدا حساب کاربری بسازید یا وارد شوید.'
            : 'برای پیگیری سفارش‌ها و رزروهای خود وارد شوید.'}
        </p>

        <div className="auth__tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={mode === 'login' ? 'is-active' : ''}
            onClick={() => {
              setMode('login');
              setError('');
            }}
          >
            ورود
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
            className={mode === 'register' ? 'is-active' : ''}
            onClick={() => {
              setMode('register');
              setError('');
            }}
          >
            ثبت‌نام
          </button>
        </div>

        <form className="auth__form" onSubmit={submit} noValidate>
          {mode === 'register' && (
            <label>
              <span>نام و نام خانوادگی</span>
              <input value={form.name} onChange={update('name')} placeholder="نام شما" />
            </label>
          )}
          <label>
            <span>شماره موبایل یا ایمیل</span>
            <input
              value={form.phone}
              onChange={updateIdentifier}
              placeholder="۰۹۱۲۳۴۵۶۷۸۹"
              dir="ltr"
              inputMode="tel"
              maxLength={64}
            />
          </label>
          <label>
            <span>رمز عبور</span>
            <input
              type="password"
              value={form.password}
              onChange={update('password')}
              placeholder="حداقل ۶ کاراکتر"
            />
          </label>

          {mode === 'login' && (
            <div className="auth__row">
              <label className="checkline">
                <input type="checkbox" defaultChecked />
                مرا به خاطر بسپار
              </label>
              <button type="button" className="auth__forgot" onClick={() => setError('لینک بازیابی رمز عبور به شما ارسال می‌شود.')}>
                فراموشی رمز عبور؟
              </button>
            </div>
          )}

          {error && <span className="form-hint form-hint--error">{error}</span>}

          <button type="submit" className="btn btn--primary btn--block">
            {mode === 'login' ? 'ورود به حساب' : 'ایجاد حساب کاربری'}
            <Icon name="chevronLeft" size={18} />
          </button>
        </form>

        <p className="auth__terms">
          با ادامه، <a href="#footer">شرایط و ضوابط</a> و <a href="#footer">حریم خصوصی</a> آترین را
          می‌پذیرید.
        </p>
      </div>
    </Modal>
  );
}
