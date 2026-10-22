import { useEffect, useMemo, useState } from 'react';
import Modal from '../components/Modal.jsx';
import Icon from '../components/Icons.jsx';
import { Field } from './ui.jsx';
import { formatDate, formatWeekday } from '../data/account.js';

const pad = (value) => String(value).padStart(2, '0');
const toIso = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const TIME_SLOTS = [
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00',
  '21:30', '22:00', '22:30', '23:00',
];

export default function ReservationForm({ open, reservation, onClose, onSave }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [error, setError] = useState('');

  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 14 }, (_, index) => {
      const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() + index + 1);
      const iso = toIso(day);
      return { value: iso, label: `${formatWeekday(iso)} ${formatDate(iso)}` };
    });
  }, []);

  useEffect(() => {
    if (open && reservation) {
      setDate(String(reservation.date).slice(0, 10));
      setTime(reservation.time || '20:00');
      setError('');
    }
  }, [open, reservation]);

  const submit = (event) => {
    event.preventDefault();
    if (!date || !time) {
      setError('تاریخ و ساعت جدید را انتخاب کنید.');
      return;
    }
    setError('');
    onSave(date, time);
  };

  return (
    <Modal open={open} onClose={onClose} className="modal--account" label="تغییر زمان رزرو">
      <div className="acct-modal">
        <header className="acct-modal__head">
          <span className="acct-modal__icon">
            <Icon name="calendar" size={20} />
          </span>
          <div>
            <h2>تغییر زمان رزرو</h2>
            <p>زمان جدید پس از تایید رستوران برای شما ثبت می‌شود.</p>
          </div>
        </header>

        <form className="acct-form" onSubmit={submit} noValidate>
          <div className="acct-form__grid">
            <Field label="تاریخ جدید">
              <select value={date} onChange={(event) => setDate(event.target.value)}>
                {!days.some((day) => day.value === date) && reservation && (
                  <option value={String(reservation.date).slice(0, 10)}>
                    {formatWeekday(reservation.date)} {formatDate(reservation.date)}
                  </option>
                )}
                {days.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="ساعت جدید">
              <select value={time} onChange={(event) => setTime(event.target.value)}>
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    ساعت {slot}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <p className="acct-form__preview">
            <Icon name="clock" size={15} />
            {formatWeekday(date)}، {formatDate(date)} · ساعت {time || '—'}
          </p>

          {error && <span className="form-hint form-hint--error">{error}</span>}

          <div className="acct-form__actions">
            <button type="button" className="btn btn--outline" onClick={onClose}>
              انصراف
            </button>
            <button type="submit" className="btn btn--primary">
              ثبت زمان جدید
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
