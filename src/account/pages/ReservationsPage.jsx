import { useState } from 'react';
import Icon from '../../components/Icons.jsx';
import { Link } from '../../router.jsx';
import { useAccount } from '../AccountContext.jsx';
import { EmptyState, PageHead, StatusPill, ConfirmDialog } from '../ui.jsx';
import {
  fa,
  formatDate,
  formatDayNumber,
  formatMonth,
  formatWeekday,
  RESERVATION_STATUS,
} from '../../data/account.js';
import ReservationForm from '../ReservationForm.jsx';

const TABS = [
  { id: 'upcoming', label: 'رزروهای پیش‌رو' },
  { id: 'past', label: 'رزروهای گذشته' },
  { id: 'cancelled', label: 'لغو شده' },
];

const groupOf = (reservation) => {
  if (reservation.status === 'cancelled') return 'cancelled';
  if (reservation.status === 'completed') return 'past';
  return 'upcoming';
};

export default function ReservationsPage({ onToast, onReserve, onCancel, onReschedule }) {
  const { reservations, loading, cancelReservation, rescheduleReservation } = useAccount();
  const [tab, setTab] = useState('upcoming');
  const [editing, setEditing] = useState(null);
  const [cancelling, setCancelling] = useState(null);

  const visible = reservations.filter((item) => groupOf(item) === tab);

  return (
    <div className="acct-page">
      <PageHead
        title="رزروهای من"
        text="میزهای رزروشده، رزروهای گذشته و لغوشده‌ها در یک نگاه."
        action={
          <button type="button" className="btn btn--primary" onClick={onReserve}>
            <Icon name="calendar" size={17} />
            رزرو میز جدید
          </button>
        }
      />

      <div className="acct-tabs" role="tablist" aria-label="فیلتر رزروها">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`acct-tab ${tab === item.id ? 'is-active' : ''}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
            <i>{fa(reservations.filter((res) => groupOf(res) === item.id).length)}</i>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="acct-skeleton" aria-hidden="true">
          <div className="acct-skeleton__block" />
          <div className="acct-skeleton__block" />
        </div>
      ) : visible.length ? (
        <div className="reserve-list">
          {visible.map((reservation) => (
            <article
              key={reservation.id}
              className={`reserve-card ${reservation.status === 'cancelled' ? 'is-cancelled' : ''}`}
            >
              <div className="reserve-card__date">
                <b>{formatDayNumber(reservation.date)}</b>
                <small>{formatMonth(reservation.date)}</small>
                <em>{formatWeekday(reservation.date)}</em>
              </div>

              <div className="reserve-card__body">
                <div className="reserve-card__top">
                  <div>
                    <b>رزرو {reservation.id}</b>
                    <small>
                      ساعت {reservation.time} · {reservation.area}
                    </small>
                  </div>
                  <StatusPill tone={RESERVATION_STATUS[reservation.status].tone}>
                    {RESERVATION_STATUS[reservation.status].label}
                  </StatusPill>
                </div>

                <div className="reserve-card__meta">
                  <span>
                    <Icon name="users" size={15} />
                    {fa(reservation.guests)} نفر
                  </span>
                  <span>
                    <Icon name="pin" size={15} />
                    {reservation.restaurant}
                  </span>
                </div>

                {reservation.note && <p className="reserve-card__note">{reservation.note}</p>}

                <div className="reserve-card__actions">
                  <Link className="btn btn--outline btn--sm" to={`/account/reservations/${reservation.id}`}>
                    مشاهده جزئیات
                  </Link>
                  {['confirmed', 'pending'].includes(reservation.status) && (
                    <>
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => setEditing(reservation)}
                      >
                        تغییر زمان
                      </button>
                      <button
                        type="button"
                        className="btn btn--ghost-light btn--sm reserve-card__cancel"
                        onClick={() => setCancelling(reservation)}
                      >
                        لغو رزرو
                      </button>
                    </>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="calendar"
          title={
            tab === 'upcoming'
              ? 'رزرو فعالی ندارید.'
              : tab === 'past'
                ? 'رزرو گذشته‌ای ندارید.'
                : 'رزرو لغوشده‌ای ندارید.'
          }
          text={
            tab === 'upcoming'
              ? 'یک شب دل‌نشین در نوال رزرو کنید؛ میز کنار پنجره یا تراس روباز.'
              : 'با اولین رزرو، سابقه شما در این بخش ثبت می‌شود.'
          }
          actionLabel="رزرو میز"
          onAction={onReserve}
        />
      )}

      <ReservationForm
        open={Boolean(editing)}
        reservation={editing}
        onClose={() => setEditing(null)}
        onSave={(date, time) => {
          rescheduleReservation(editing.id, date, time);
          onReschedule?.();
          onToast('زمان رزرو شما به‌روزرسانی شد و در انتظار تایید است.');
          setEditing(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(cancelling)}
        onClose={() => setCancelling(null)}
        onConfirm={() => {
          cancelReservation(cancelling.id);
          onCancel?.();
          onToast('رزرو شما لغو شد.');
        }}
        title="رزرو لغو شود؟"
        text={
          cancelling
            ? `رزرو ${fa(cancelling.guests)} نفره شما در تاریخ ${formatDate(cancelling.date)} لغو می‌شود.`
            : ''
        }
        confirmLabel="لغو رزرو"
        cancelLabel="بازگشت"
        tone="danger"
      />
    </div>
  );
}
