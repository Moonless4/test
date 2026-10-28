import { useEffect, useState } from 'react';
import { deleteMessage, getMessages, markMessageRead } from './api.js';

const TYPE_LABEL = { contact: 'تماس', consultation: 'درخواست مشاوره', cooperation: 'فرصت همکاری' };

const dateLabel = (iso) => {
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return '';
  }
};

export default function MessagesPanel({ onCountChange }) {
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await getMessages();
      setMessages(data.messages || []);
      onCountChange?.(data.unread || 0);
      setSelected((current) => {
        const next = current || data.messages?.[0]?.id;
        return data.messages?.some((message) => message.id === next) ? next : data.messages?.[0]?.id ?? null;
      });
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const visible = messages.filter((message) => {
    if (filter === 'unread' && message.read) return false;
    if (!query.trim()) return true;
    const haystack = `${message.name} ${message.phone} ${message.message}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  const current = messages.find((message) => message.id === selected) || visible[0];

  const toggleRead = async (message) => {
    const next = !message.read;
    setMessages((list) => list.map((item) => (item.id === message.id ? { ...item, read: next } : item)));
    onCountChange?.(messages.filter((item) => (item.id === message.id ? !next : !item.read)).length);
    try {
      await markMessageRead(message.id, next);
    } catch {
      load();
    }
  };

  const remove = async (message) => {
    if (!window.confirm('این پیام حذف شود؟')) return;
    await deleteMessage(message.id).catch((removeError) => setError(removeError.message));
    setMessages((list) => list.filter((item) => item.id !== message.id));
    onCountChange?.(messages.filter((item) => item.id !== message.id && !item.read).length);
  };

  return (
    <div className="adm-view">
      <header className="adm-head">
        <div className="adm-head-copy">
          <span className="adm-eyebrow">صندوق ورودی</span>
          <h1>پیام‌های تماس</h1>
          <p className="adm-muted">درخواست‌هایی که از فرم‌های سایت ثبت شده‌اند.</p>
        </div>
        <div className="adm-head-actions">
          <button type="button" className="adm-btn adm-btn-quiet" onClick={load}>
            به‌روزرسانی
          </button>
        </div>
      </header>

      <div className="adm-messages">
        <aside className="adm-list-pane">
          <div className="adm-msg-tools">
            <div className="adm-segment">
              <button type="button" className={filter === 'all' ? 'is-active' : ''} onClick={() => setFilter('all')}>
                همه
              </button>
              <button type="button" className={filter === 'unread' ? 'is-active' : ''} onClick={() => setFilter('unread')}>
                خوانده‌نشده
              </button>
            </div>
            <input
              className="adm-input adm-search"
              placeholder="جستجو…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="adm-list">
            {loading ? <p className="adm-muted adm-empty">در حال بارگذاری…</p> : null}
            {!loading && !visible.length ? <p className="adm-muted adm-empty">پیامی نیست.</p> : null}
            {visible.map((message) => (
              <button
                type="button"
                key={message.id}
                className={`adm-list-item adm-msg-item${current?.id === message.id ? ' is-active' : ''}${message.read ? '' : ' is-unread'}`}
                onClick={() => setSelected(message.id)}
              >
                <span className="adm-list-copy">
                  <strong>
                    {!message.read ? <span className="adm-unread-dot" /> : null}
                    {message.name}
                  </strong>
                  <em>{message.message?.slice(0, 48) || TYPE_LABEL[message.type]}</em>
                </span>
                <span className="adm-msg-time">{dateLabel(message.createdAt).split('،').slice(-1)}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="adm-editor-pane">
          {current ? (
            <article className="adm-message">
              <header className="adm-message-head">
                <div>
                  <span className="adm-eyebrow">{TYPE_LABEL[current.type] || 'تماس'}</span>
                  <h2>{current.name}</h2>
                  <p className="adm-muted">{dateLabel(current.createdAt)}</p>
                </div>
                <div className="adm-head-actions">
                  <button type="button" className="adm-btn adm-btn-quiet" onClick={() => toggleRead(current)}>
                    {current.read ? 'علامت خوانده‌نشده' : 'علامت خوانده‌شده'}
                  </button>
                  <button type="button" className="adm-btn adm-btn-danger" onClick={() => remove(current)}>
                    حذف
                  </button>
                </div>
              </header>

              <dl className="adm-message-meta">
                <div>
                  <dt>تلفن</dt>
                  <dd dir="ltr">
                    <a href={`tel:${current.phone}`}>{current.phone}</a>
                  </dd>
                </div>
                <div>
                  <dt>نوع درخواست</dt>
                  <dd>{TYPE_LABEL[current.type] || 'تماس'}</dd>
                </div>
              </dl>

              <p className="adm-message-body">{current.message || 'بدون متن پیام.'}</p>
            </article>
          ) : (
            <div className="adm-empty-state">
              <p>پیامی برای نمایش انتخاب نشده است.</p>
            </div>
          )}
        </section>
      </div>
      {error ? <p className="adm-error">{error}</p> : null}
    </div>
  );
}
