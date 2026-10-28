import { useState } from 'react';
import Icon from '../components/Icons.jsx';
import { Field, TextInput } from './ui.jsx';
import { reauthenticate } from './api.js';

// Full re-authentication (username + password + TOTP + one-time backup code)
// required before any sensitive admin action. The token is single-use.
export default function ReauthForm({ title, description, actionLabel, onToken }) {
  const [form, setForm] = useState({ username: '', password: '', totp: '', backupCode: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    const result = await reauthenticate(form);
    setBusy(false);
    if (!result.ok) {
      setError(result.error || 'احراز هویت مجدد انجام نشد.');
      return;
    }
    setForm({ username: '', password: '', totp: '', backupCode: '' });
    onToken(result.reauthToken, result.expiresIn);
  };

  return (
    <form className="adm-reauth" onSubmit={submit}>
      {title ? <h4 className="adm-reauth__title">{title}</h4> : null}
      {description ? <p className="adm-text">{description}</p> : null}
      <div className="adm-grid">
        <TextInput label="نام کاربری" value={form.username} onChange={set('username')} dir="ltr" />
        <TextInput
          label="رمز عبور"
          value={form.password}
          onChange={set('password')}
          type="password"
          dir="ltr"
        />
        <TextInput label="کد Google Authenticator" value={form.totp} onChange={set('totp')} dir="ltr" />
        <TextInput label="کد پشتیبان" value={form.backupCode} onChange={set('backupCode')} dir="ltr" />
      </div>
      {error ? <p className="adm-hint adm-hint--error">{error}</p> : null}
      <button type="submit" className="adm-btn adm-btn--gold" disabled={busy}>
        <Icon name="shield" size={16} />
        {busy ? 'در حال بررسی…' : actionLabel || 'احراز هویت مجدد'}
      </button>
    </form>
  );
}
