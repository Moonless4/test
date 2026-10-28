import { useEffect, useMemo, useState } from 'react';
import { getContent, getMessages, getSession, login, logout, saveContent } from './api.js';
import { COLLECTIONS, ENTRY_MAP, NAV, PAGES } from './schema.js';
import { CollectionEditor } from './CollectionEditor.jsx';
import Dashboard from './Dashboard.jsx';
import MediaLibrary from './MediaLibrary.jsx';
import MessagesPanel from './MessagesPanel.jsx';
import PagesList from './PagesList.jsx';
import { PageEditor, SectionEditor } from './PageEditors.jsx';
import { SecurityPanel, TwoFactorSetupScreen, TwoFactorVerifyScreen } from './TwoFactor.jsx';
import '../styles/admin.css';

const VIEW_LABELS = {
  dashboard: 'داشبورد',
  pages: 'صفحات',
  media: 'کتابخانهٔ رسانه',
  messages: 'پیام‌های تماس',
  security: 'امنیت',
};

function LoginScreen({ onTwoFactor }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const result = await login(username, password);
      onTwoFactor(result?.twoFactor);
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="adm-auth">
      <aside className="adm-auth-brand">
        <span className="adm-auth-mark">ARATAN</span>
        <div className="adm-auth-lines" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div>
          <h2>استودیوی معماری آراتان</h2>
          <p>سیستم مدیریت محتوا</p>
        </div>
      </aside>

      <main className="adm-auth-form">
        <form className="adm-auth-card" onSubmit={submit}>
          <span className="adm-eyebrow">ورود مدیر</span>
          <h1>به پنل مدیریت خوش آمدید</h1>
          <p className="adm-muted">برای ویرایش محتوای سایت، نام کاربری و رمز عبور خود را وارد کنید.</p>

          <label className="adm-field">
            <span className="adm-label">نام کاربری</span>
            <input className="adm-input" value={username} autoComplete="username" onChange={(event) => setUsername(event.target.value)} />
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
          <button type="submit" className="adm-btn" disabled={busy}>
            {busy ? 'در حال ورود…' : 'ورود به پنل'}
          </button>
          <a className="adm-text-btn" href="/">
            بازگشت به سایت
          </a>
        </form>
      </main>
    </div>
  );
}

function SecurityView() {
  return (
    <div className="adm-view">
      <header className="adm-head">
        <div className="adm-head-copy">
          <span className="adm-eyebrow">تنظیمات</span>
          <h1>امنیت</h1>
          <p className="adm-muted">ورود دومرحله‌ای پس از راه‌اندازی، همیشه فعال و الزامی است.</p>
        </div>
      </header>
      <SecurityPanel />
    </div>
  );
}

export default function AdminApp() {
  const [status, setStatus] = useState('checking');
  const [doc, setDoc] = useState(null);
  const [active, setActive] = useState('dashboard');
  const [initialSlug, setInitialSlug] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  const [unread, setUnread] = useState(0);
  const [inbox, setInbox] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const load = async () => {
    try {
      const [content, mail] = await Promise.all([getContent(), getMessages().catch(() => ({ unread: 0, messages: [] }))]);
      setDoc(content);
      setUnread(mail.unread || 0);
      setInbox(mail.messages || []);
      setDirty(false);
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
    const warn = (event) => {
      if (!dirty) return undefined;
      event.preventDefault();
      event.returnValue = '';
      return '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const entry = ENTRY_MAP[active];
  const isPage = entry?.view === 'page';
  const isCollection = entry?.view === 'collection';

  const roots = useMemo(() => {
    if (!entry) return [];
    const root = String(entry.path || 'settings').split('.')[0];
    return [root];
  }, [entry]);

  const confirmLeave = () => {
    if (!dirty) return true;
    return window.confirm('تغییرات ذخیره‌نشده دارید. بدون ذخیره ادامه می‌دهید؟');
  };

  const go = (id, slug = null) => {
    if (!confirmLeave()) return;
    setDirty(false);
    setError('');
    setActive(id);
    setInitialSlug(slug);
    setMenuOpen(false);
  };

  const updateDoc = (next) => {
    setDoc(next);
    setDirty(true);
  };

  const save = async (continueEditing = false) => {
    if (!doc || !roots.length) return;
    setSaving(true);
    setError('');
    try {
      const patch = roots.reduce((acc, root) => {
        acc[root] = doc[root];
        return acc;
      }, {});
      await saveContent(patch);
      setDirty(false);
      setToast(continueEditing ? 'ذخیره شد؛ می‌توانید ادامه دهید.' : 'تغییرات با موفقیت ذخیره شد.');
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    if (!confirmLeave()) return;
    setDirty(false);
    load();
  };

  const signOut = async () => {
    if (!confirmLeave()) return;
    await logout().catch(() => {});
    setStatus('out');
    setDoc(null);
  };

  if (status === 'checking') {
    return (
      <div className="adm-auth adm-auth-loading">
        <p className="adm-eyebrow">در حال بررسی نشست…</p>
      </div>
    );
  }

  if (status === 'out') {
    return <LoginScreen onTwoFactor={(stage) => setStatus(stage === 'setup' ? 'setup' : 'verify')} />;
  }

  if (status === 'setup') {
    return (
      <TwoFactorSetupScreen
        onDone={() => {
          setStatus('in');
          load();
        }}
        onCancel={() => setStatus('out')}
      />
    );
  }

  if (status === 'verify') {
    return (
      <TwoFactorVerifyScreen
        onDone={() => {
          setStatus('in');
          load();
        }}
        onCancel={() => setStatus('out')}
      />
    );
  }

  const title = VIEW_LABELS[active] || entry?.label || '';

  const body = (() => {
    if (active === 'dashboard') {
      return (
        <Dashboard
          doc={doc}
          messages={inbox}
          onNavigate={go}
          onOpenPage={(id) => go(id)}
          onOpenItem={(collection, slug) => go(collection, slug)}
        />
      );
    }
    if (active === 'pages') return <PagesList doc={doc} onOpenPage={(id) => go(id)} />;
    if (active === 'media') return <MediaLibrary onToast={setToast} />;
    if (active === 'messages') return <MessagesPanel onCountChange={setUnread} />;
    if (active === 'security') return <SecurityView />;

    if (isPage) {
      return (
        <PageEditor
          entry={entry}
          doc={doc}
          setDoc={updateDoc}
          onSave={(mode) => save(mode === 'continue')}
          onCancel={cancel}
          saving={saving}
          dirty={dirty}
          message=""
        />
      );
    }

    if (isCollection) {
      return (
        <CollectionEditor
          entry={entry}
          doc={doc}
          setDoc={updateDoc}
          onSave={(mode) => save(mode === 'continue')}
          onCancel={cancel}
          saving={saving}
          dirty={dirty}
          message=""
          initialSlug={initialSlug}
        />
      );
    }

    if (entry) {
      return (
        <SectionEditor
          entry={entry}
          doc={doc}
          setDoc={updateDoc}
          onSave={(mode) => save(mode === 'continue')}
          onCancel={cancel}
          saving={saving}
          dirty={dirty}
          message=""
        />
      );
    }

    return <PagesList doc={doc} onOpenPage={(id) => go(id)} />;
  })();

  return (
    <div className="adm-shell">
      <aside className={`adm-side${menuOpen ? ' is-open' : ''}`}>
        <div className="adm-brand">
          <strong>ARATAN</strong>
          <span>مدیریت محتوا</span>
        </div>

        <nav className="adm-nav">
          {NAV.map((group) => (
            <div className="adm-nav-group" key={group.title}>
              <span className="adm-nav-title">{group.title}</span>
              {group.items.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={`adm-nav-item${item.id === active || (item.id === 'pages' && isPage) ? ' is-active' : ''}`}
                  onClick={() => go(item.id)}
                >
                  <span>{item.label}</span>
                  {item.badge === 'unread' && unread ? <em className="adm-badge">{unread}</em> : null}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="adm-side-foot">
          <a className="adm-btn adm-btn-quiet" href="/" target="_blank" rel="noreferrer">
            مشاهدهٔ سایت ↗
          </a>
          <button type="button" className="adm-text-btn" onClick={signOut}>
            خروج از حساب
          </button>
        </div>
      </aside>

      <main className="adm-main">
        <div className="adm-topbar">
          <button type="button" className="adm-menu-btn" onClick={() => setMenuOpen((open) => !open)} aria-label="منو">
            ☰
          </button>
          <span className="adm-topbar-title">{title}</span>
          <span className={`adm-save-state${dirty ? ' is-dirty' : ''}`}>{dirty ? 'ذخیره‌نشده' : 'ذخیره‌شده'}</span>
        </div>
        {body}
        {error && active !== 'dashboard' ? <p className="adm-error adm-error-float">{error}</p> : null}
      </main>

      {toast ? <div className="adm-toast">{toast}</div> : null}
      {menuOpen ? <button type="button" className="adm-scrim" onClick={() => setMenuOpen(false)} aria-label="بستن منو" /> : null}
    </div>
  );
}
