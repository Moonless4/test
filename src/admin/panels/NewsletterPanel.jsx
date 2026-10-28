import { useState } from 'react';
import Icon from '../../components/Icons.jsx';
import { AdminPanel, EmptyNote } from '../ui.jsx';
import { fa, formatDate } from '../../data/account.js';
import { deleteSubscriber, listSubscribers } from '../../data/records.js';

export default function NewsletterPanel() {
  const [subscribers, setSubscribers] = useState(listSubscribers);
  const [copied, setCopied] = useState(false);

  const remove = (item) => {
    if (!window.confirm(`ایمیل ${item.email} از خبرنامه حذف شود؟`)) return;
    setSubscribers(deleteSubscriber(item.id));
  };

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(subscribers.map((item) => item.email).join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard can be blocked */
    }
  };

  const exportCsv = () => {
    const rows = [['email', 'subscribed_at'], ...subscribers.map((item) => [item.email, item.createdAt])];
    const csv = rows.map((row) => row.join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `atrin-newsletter-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminPanel
      title="خبرنامه"
      description="ایمیل‌هایی که در فرم خبرنامه فوتر ثبت شده‌اند؛ همه در یک جا جمع می‌شوند."
      actions={
        <>
          <button type="button" className="adm-btn adm-btn--ghost" onClick={() => setSubscribers(listSubscribers())}>
            <Icon name="repeat" size={16} />
            به‌روزرسانی
          </button>
          <button type="button" className="adm-btn adm-btn--gold" onClick={exportCsv} disabled={!subscribers.length}>
            <Icon name="box" size={16} />
            خروجی CSV
          </button>
        </>
      }
    >
      <div className="adm-stats">
        <div className="adm-stat">
          <span className="adm-stat__icon">
            <Icon name="mail" size={20} />
          </span>
          <strong>{fa(subscribers.length)}</strong>
          <small>عضو خبرنامه</small>
        </div>
      </div>

      {subscribers.length === 0 ? (
        <EmptyNote>هنوز کسی در خبرنامه ثبت‌نام نکرده است.</EmptyNote>
      ) : (
        <>
          <div className="adm-inline">
            <button type="button" className="adm-btn adm-btn--ghost" onClick={copyAll}>
              <Icon name={copied ? 'check' : 'quote'} size={16} />
              {copied ? 'کپی شد' : 'کپی همه ایمیل‌ها'}
            </button>
          </div>
          <div className="adm-rows">
            {subscribers.map((item, index) => (
              <div className="adm-row" key={item.id}>
                <span className="adm-row__index">{fa(index + 1)}</span>
                <div className="adm-row__copy">
                  <b dir="ltr">{item.email}</b>
                  <small>{item.createdAt ? formatDate(item.createdAt) : '—'}</small>
                </div>
                <div className="adm-row__tools">
                  <button
                    type="button"
                    className="adm-icon-btn"
                    onClick={() => remove(item)}
                    aria-label={`حذف ${item.email}`}
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </AdminPanel>
  );
}
