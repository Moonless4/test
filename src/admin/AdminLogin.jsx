import { useState } from 'react';
import Icon from '../components/Icons.jsx';
import { signInAdmin } from './auth.js';

export default function AdminLogin({ settings, siteName, onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (event) => {
    event.preventDefault();
    if (signInAdmin(settings, username, password)) {
      setError('');
      onSuccess();
      return;
    }
    setError('نام کاربری یا رمز عبور درست نیست.');
  };

  return (
    <div className="admin-login" dir="rtl">
      <form className="admin-login__card" onSubmit={submit}>
        <span className="admin-login__badge">
          <Icon name="shield" size={26} />
        </span>
        <h1>ورود به پنل مدیریت</h1>
        <p>مدیریت محتوای {siteName}</p>

        <label className="adm-field">
          <span className="adm-field__label">نام کاربری</span>
          <input
            className="adm-input adm-input--ltr"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            dir="ltr"
          />
        </label>

        <label className="adm-field">
          <span className="adm-field__label">رمز عبور</span>
          <input
            className="adm-input adm-input--ltr"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            dir="ltr"
          />
        </label>

        {error ? <p className="adm-hint adm-hint--error">{error}</p> : null}

        <button type="submit" className="adm-btn adm-btn--gold adm-btn--block">
          ورود به پنل
          <Icon name="chevronLeft" size={17} />
        </button>

        <a className="admin-login__back" href="/">
          بازگشت به سایت
        </a>
      </form>
    </div>
  );
}
