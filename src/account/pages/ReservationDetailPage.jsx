import { useState } from 'react';
import Icon from '../../components/Icons.jsx';
import { Link, useRouter } from '../../router.jsx';
import { useAccount } from '../AccountContext.jsx';
import { EmptyState, Panel, StatusPill, ConfirmDialog } from '../ui.jsx';
import {
  fa,
  formatDate,
  formatDayNumber,
  formatMonth,
  formatWeekday,
  RESERVATION_STATUS,
} from '../../data/account.js';
import ReservationForm from '../ReservationForm.jsx';

export default function ReservationDetailPage({ id, onToast, onReserve }) {
  const { reservations, cancelReservation, rescheduleReservation } = useAccount();
  const { navigate } = useRouter();
  const [editing, setEditing] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const reservation = reservations.find((item) => item.id === id);

  if (!reservation) {
    return (
      <div className="acct-page">
        <EmptyState
          icon="calendar"
          title="این رزرو پیدا نشد."
          text="شاید رزرو لغو شده یا شماره آن تغییر کرده باشد."
          actionLabel="بازگشت به رزروها"
          to="/account/reservations"
        />
      </div>
    );
  }

  const active = ['confirmed', 'pending'].includes(reservation.status);

  return (
    <div className="acct-page">
      <Link className="acct-back" to="/account/reservations">
        <Icon name="chevronRight" size={15} />
        بازگشت به رزروها
      </Link>

      <section className="reserve-hero">
        <div className="reserve-hero__date">
          <b>{formatDayNumber(reservation.date)}</b>
          <small>{formatMonth(reservation.date)}</small>
          <em>{formatWeekday(reservation.date)}</em>
        </div>
        <div className="reserve-hero__copy">
          <span className="reserve-hero__eyebrow">رزرو {reservation.id}</span>
          <h1>
            میز {fa(reservation.guests)} نفره · ساعت {reservation.time}
          </h1>
          <p>{reservation.restaurant}</p>
          <StatusPill tone={RESERVATION_STATUS[reservation.status].tone}>
            {RESERVATION_STATUS[reservation.status].label}
          </StatusPill>
        </div>
        <div className="reserve-hero__actions">
          {active ? (
            <>
              <button type="button" className="btn btn--outline" onClick={() => setEditing(true)}>
                <Icon name="clock" size={17} />
                تغییر زمان
              </button>
              <button type="button" className="btn btn--primary" onClick={() => setCancelling(true)}>
                لغو رزرو
              </button>
            </>
          ) : (
            <button type="button" className="btn btn--primary" onClick={onReserve}>
              <Icon name="calendar" size={17} />
              رزرو میز جدید
            </button>
          )}
        </div>
      </section>

      <div className="acct-columns">
        <Panel title="جزئیات رزرو">
          <dl className="acct-rows">
            <div>
              <dt>تاریخ</dt>
              <dd>
                {formatWeekday(reservation.date)}، {formatDate(reservation.date)}
              </dd>
            </div>
            <div>
              <dt>ساعت</dt>
              <dd>{reservation.time}</dd>
            </div>
            <div>
              <dt>تعداد نفرات</dt>
              <dd>{fa(reservation.guests)} نفر</dd>
            </div>
            <div>
              <dt>میز / فضا</dt>
              <dd>{reservation.area}</dd>
            </div>
            <div>
              <dt>شعبه</dt>
              <dd>{reservation.restaurant}</dd>
            </div>
            <div>
              <dt>کد رزرو</dt>
              <dd>{reservation.id}</dd>
            </div>
          </dl>
        </Panel>

        <Panel title="یادداشت و شرایط">
          {reservation.note ? (
            <p className="acct-quote">
              <Icon name="quote" size={18} />
              {reservation.note}
            </p>
          ) : (
            <p className="acct-muted">یادداشتی برای این رزرو ثبت نشده است.</p>
          )}
          <ul className="acct-bullets">
            <li>میز تا ۱۵ دقیقه پس از ساعت رزرو نگه داشته می‌شود.</li>
            <li>برای تغییر تعداد نفرات با رستوران تماس بگیرید.</li>
            <li>لغو رزرو تا ۳ ساعت قبل بدون هزینه است.</li>
          </ul>
        </Panel>
      </div>

      <ReservationForm
        open={editing}
        reservation={reservation}
        onClose={() => setEditing(false)}
        onSave={(date, time) => {
          rescheduleReservation(reservation.id, date, time);
          onToast('زمان رزرو شما به‌روزرسانی شد و در انتظار تایید است.');
          setEditing(false);
        }}
      />

      <ConfirmDialog
        open={cancelling}
        onClose={() => setCancelling(false)}
        onConfirm={() => {
          cancelReservation(reservation.id);
          onToast('رزرو شما لغو شد.');
          navigate('/account/reservations');
        }}
        title="رزرو لغو شود؟"
        text={`رزرو ${fa(reservation.guests)} نفره شما در تاریخ ${formatDate(reservation.date)} لغو می‌شود.`}
        confirmLabel="لغو رزرو"
        cancelLabel="بازگشت"
        tone="danger"
      />
    </div>
  );
}
