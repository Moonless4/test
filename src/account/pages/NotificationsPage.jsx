import { useState } from 'react';
import Icon from '../../components/Icons.jsx';
import { useAccount } from '../AccountContext.jsx';
import { EmptyState, PageHead } from '../ui.jsx';
import { fa, NOTIFICATION_TYPE, relativeTime } from '../../data/account.js';

export default function NotificationsPage({ onToast }) {
  const { notifications, unreadCount, markNotification, markAllRead, deleteNotification, loading } =
    useAccount();
  const [tab, setTab] = useState('all');

  const visible = tab === 'unread' ? notifications.filter((item) => !item.read) : notifications;

  return (
    <div className="acct-page">
      <PageHead
        title="اعلان‌ها"
        text={unreadCount ? `${fa(unreadCount)} اعلان خوانده‌نشده دارید.` : 'همه اعلان‌ها خوانده شده‌اند.'}
        action={
          <button
            type="button"
            className="btn btn--outline"
            onClick={() => {
              markAllRead();
              onToast('همه اعلان‌ها به عنوان خوانده‌شده علامت زده شدند.');
            }}
            disabled={!unreadCount}
          >
            <Icon name="check" size={16} />
            خواندن همه
          </button>
        }
      />

      <div className="acct-tabs" role="tablist" aria-label="فیلتر اعلان‌ها">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'all'}
          className={`acct-tab ${tab === 'all' ? 'is-active' : ''}`}
          onClick={() => setTab('all')}
        >
          همه اعلان‌ها
          <i>{fa(notifications.length)}</i>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'unread'}
          className={`acct-tab ${tab === 'unread' ? 'is-active' : ''}`}
          onClick={() => setTab('unread')}
        >
          خوانده‌نشده
          <i>{fa(unreadCount)}</i>
        </button>
      </div>

      {loading ? (
        <div className="acct-skeleton" aria-hidden="true">
          <div className="acct-skeleton__block" />
          <div className="acct-skeleton__block" />
        </div>
      ) : visible.length ? (
        <ul className="notif-list">
          {visible.map((item) => {
            const meta = NOTIFICATION_TYPE[item.type] || NOTIFICATION_TYPE.system;
            return (
              <li key={item.id} className={`notif-item ${item.read ? '' : 'is-unread'}`}>
                <span className={`notif-item__icon notif-item__icon--${meta.tone}`}>
                  <Icon name={meta.icon} size={18} />
                </span>

                <div className="notif-item__body">
                  <div className="notif-item__top">
                    <b>{item.title}</b>
                    <small>{relativeTime(item.createdAt)}</small>
                  </div>
                  <p>{item.body}</p>
                  <div className="notif-item__actions">
                    <button
                      type="button"
                      className="notif-item__action"
                      onClick={() => markNotification(item.id, !item.read)}
                    >
                      {item.read ? 'علامت خوانده‌نشده' : 'علامت خوانده‌شده'}
                    </button>
                    <button
                      type="button"
                      className="notif-item__action notif-item__action--danger"
                      onClick={() => {
                        deleteNotification(item.id);
                        onToast('اعلان حذف شد.');
                      }}
                    >
                      حذف
                    </button>
                  </div>
                </div>

                {!item.read && <span className="notif-item__dot" aria-label="خوانده‌نشده" />}
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          icon="bell"
          title={tab === 'unread' ? 'اعلان خوانده‌نشده‌ای ندارید.' : 'اعلانی ندارید.'}
          text="وضعیت سفارش‌ها، تایید رزرو و پیشنهادهای ویژه در این بخش نمایش داده می‌شود."
          actionLabel="بازگشت به داشبورد"
          to="/account"
        />
      )}
    </div>
  );
}
