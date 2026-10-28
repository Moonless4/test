import { useEffect, useState } from 'react';
import { getContent, getSession, login, logout, saveContent } from './api.js';
import { SECTIONS } from './schema.js';
import { Fields, ItemsEditor, JsonField, getIn, setIn } from './fields.jsx';
import '../styles/admin.css';

function LoginScreen({ onSignedIn }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(username, password);
      onSignedIn();
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="adm-login">
      <form className="adm-login-card" onSubmit={submit}>
        <span className="adm-kicker">پنل مدیریت آراتان</span>
        <h1>ورود مدیر</h1>
        <label className="adm-field">
          <span className="adm-label">نام کاربری</span>
          <input
            className="adm-input"
            value={username}
            autoComplete="username"
            onChange={(event) => setUsername(event.target.value)}
          />
        </label>
        <label className="adm-field">
          <span className="adm-label">رمز عبور</span>
          <input
            className="adm-input"
            type="password"
            value={password}
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error ? <p className="adm-error">{error}</p> : null}
        <button type="submit" className="adm-primary" disabled={busy}>
          {busy ? 'در حال ورود…' : 'ورود به پنل'}
        </button>
        <a className="adm-link" href="/">
          بازگشت به سایت
        </a>
      </form>
    </div>
  );
}

export default function AdminApp() {
  const [status, setStatus] = useState('checking');
  const [doc, setDoc] = useState(null);
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setDoc(await getContent());
      setStatus('in');
    } catch {
      setStatus('out');
    }
  };

  useEffect(() => {
    getSession()
      .then((session) => (session.authenticated ? load() : setStatus('out')))
      .catch(() => setStatus('out'));
  }, []);

  useEffect(() => {
    setMessage('');
    setError('');
  }, [activeId]);

  if (status === 'checking') {
    return (
      <div className="adm-login">
        <p className="adm-kicker">در حال بررسی نشست…</p>
      </div>
    );
  }

  if (status === 'out') {
    return <LoginScreen onSignedIn={load} />;
  }

  const section = SECTIONS.find((item) => item.id === activeId) || SECTIONS[0];
  const value = getIn(doc, section.path);
  const update = (next) => setDoc(setIn(doc, section.path, next));

  const save = async () => {
    const root = section.path.split('.')[0];
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await saveContent({ [root]: doc[root] });
      setMessage('تغییرات ذخیره شد.');
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const signOut = async () => {
    await logout().catch(() => {});
    setStatus('out');
  };

  return (
    <div className="adm-shell">
      <aside className="adm-side">
        <div className="adm-brand">
          <strong>آراتان</strong>
          <span>مدیریت محتوا</span>
        </div>
        <nav className="adm-nav">
          {SECTIONS.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`adm-nav-item${item.id === activeId ? ' is-active' : ''}`}
              onClick={() => setActiveId(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="adm-side-foot">
          <a className="adm-link" href="/">
            مشاهدهٔ سایت
          </a>
          <button type="button" className="adm-ghost" onClick={signOut}>
            خروج
          </button>
        </div>
      </aside>

      <main className="adm-main">
        <header className="adm-head">
          <div>
            <h2>{section.label}</h2>
            {section.hint ? <p className="adm-hint">{section.hint}</p> : null}
          </div>
          <div className="adm-head-actions">
            {message ? <span className="adm-ok">{message}</span> : null}
            {error ? <span className="adm-error">{error}</span> : null}
            <button type="button" className="adm-primary" onClick={save} disabled={saving}>
              {saving ? 'در حال ذخیره…' : 'ذخیرهٔ تغییرات'}
            </button>
          </div>
        </header>

        <section className="adm-panel">
          {section.kind === 'object' ? (
            <Fields fields={section.fields} value={value || {}} onChange={update} />
          ) : null}

          {section.kind === 'collection' || section.kind === 'list' ? (
            <ItemsEditor
              fields={section.itemFields}
              items={value}
              itemLabel={section.itemLabel}
              onChange={update}
              addLabel={`افزودن به ${section.label}`}
            />
          ) : null}

          {section.kind === 'json' ? <JsonField key={section.id} value={value} onChange={update} /> : null}
        </section>
      </main>
    </div>
  );
}
