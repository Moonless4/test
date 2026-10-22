import { useMemo, useState } from 'react';
import { useAccount } from '../AccountContext.jsx';
import { EmptyState, PageHead } from '../ui.jsx';
import OrderCard from '../OrderCard.jsx';
import { fa } from '../../data/account.js';

const FILTERS = [
  { id: 'all', label: 'همه سفارش‌ها' },
  { id: 'review', label: 'در حال بررسی' },
  { id: 'preparing', label: 'در حال آماده‌سازی' },
  { id: 'ready', label: 'آماده تحویل' },
  { id: 'delivered', label: 'تحویل داده شد' },
  { id: 'cancelled', label: 'لغو شده' },
];

export default function OrdersPage({ onReorder, onMenu }) {
  const { orders, loading } = useAccount();
  const [filter, setFilter] = useState('all');

  const counts = useMemo(() => {
    const map = { all: orders.length };
    orders.forEach((order) => {
      map[order.status] = (map[order.status] || 0) + 1;
    });
    return map;
  }, [orders]);

  const visible = filter === 'all' ? orders : orders.filter((order) => order.status === filter);

  return (
    <div className="acct-page">
      <PageHead
        title="سفارش‌های من"
        text="سفارش‌های جاری و گذشته شما در آترین؛ هر سفارش را می‌توانید با یک کلیک دوباره ثبت کنید."
      />

      <div className="acct-tabs" role="tablist" aria-label="فیلتر وضعیت سفارش‌ها">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={filter === item.id}
            className={`acct-tab ${filter === item.id ? 'is-active' : ''}`}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
            {counts[item.id] ? <i>{fa(counts[item.id])}</i> : null}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="acct-skeleton" aria-hidden="true">
          <div className="acct-skeleton__block" />
          <div className="acct-skeleton__block" />
        </div>
      ) : visible.length ? (
        <div className="acct-stack">
          {visible.map((order) => (
            <OrderCard key={order.id} order={order} onReorder={onReorder} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="box"
          title={filter === 'all' ? 'هنوز سفارشی ثبت نکرده‌اید.' : 'سفارشی با این وضعیت ندارید.'}
          text={
            filter === 'all'
              ? 'منوی آترین هر روز با غذاهای تازه به‌روز می‌شود؛ اولین سفارش خود را ثبت کنید.'
              : 'فیلتر دیگری را انتخاب کنید یا منوی کامل را ببینید.'
          }
          actionLabel="مشاهده منو"
          onAction={() => onMenu('all')}
        />
      )}
    </div>
  );
}
