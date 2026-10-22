import { useEffect, useState } from 'react';
import Icon from '../../components/Icons.jsx';
import { Link } from '../../router.jsx';
import { useAccount } from '../AccountContext.jsx';
import { Field, PageHead, Panel } from '../ui.jsx';
import { fa, formatDate } from '../../data/account.js';

const AVATARS = [
  '/assets/avatar1.png',
  '/assets/avatar2.png',
  '/assets/avatar3.png',
  '/assets/avatar4.png',
  '/assets/avatar5.png',
  '/assets/avatar6.png',
];

export default function ProfilePage({ onToast }) {
  const { user, saveProfile, loyalty, orders } = useAccount();
  const [form, setForm] = useState(user);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(user);
  }, [user]);

  const update = (key) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const submit = (event) => {
    event.preventDefault();
    const next = {};
    if (!form.firstName.trim()) next.firstName = 'نام را وارد کنید.';
    if (!form.lastName.trim()) next.lastName = 'نام خانوادگی را وارد کنید.';
    if (!/^09\d{9}$/.test(form.phone)) next.phone = 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'ایمیل معتبر وارد کنید.';

    setErrors(next);
    if (Object.keys(next).length) return;

    saveProfile(form);
    onToast('اطلاعات شخصی شما ذخیره شد.');
  };

  return (
    <div className="acct-page">
      <PageHead title="اطلاعات شخصی" text="اطلاعات حساب خود را برای هماهنگی سفارش‌ها و رزروها به‌روز نگه دارید." />

      <div className="profile-grid">
        <Panel title="تصویر و شناسه حساب" className="profile-side">
          <div className="profile-avatar">
            <img src={form.avatar} alt={`${form.firstName} ${form.lastName}`} />
            <span className="profile-avatar__tier">
              <Icon name="star" size={13} filled />
              {loyalty.tier}
            </span>
          </div>

          <div className="avatar-picker" role="group" aria-label="انتخاب تصویر پروفایل">
            {AVATARS.map((src) => (
              <button
                key={src}
                type="button"
                className={`avatar-picker__item ${form.avatar === src ? 'is-active' : ''}`}
                onClick={() => setForm((prev) => ({ ...prev, avatar: src }))}
                aria-label="انتخاب این تصویر"
                aria-pressed={form.avatar === src}
              >
                <img src={src} alt="" />
              </button>
            ))}
          </div>

          <dl className="acct-rows acct-rows--compact">
            <div>
              <dt>عضویت از</dt>
              <dd>{formatDate(user.memberSince)}</dd>
            </div>
            <div>
              <dt>سفارش‌های ثبت‌شده</dt>
              <dd>{fa(orders.length)} سفارش</dd>
            </div>
            <div>
              <dt>امتیاز باشگاه</dt>
              <dd>{fa(loyalty.points)} امتیاز</dd>
            </div>
          </dl>

          <Link className="acct-link acct-link--standalone" to="/account/settings">
            تغییر رمز عبور و امنیت
            <Icon name="chevronLeft" size={14} />
          </Link>
        </Panel>

        <Panel title="ویرایش اطلاعات">
          <form className="acct-form" onSubmit={submit} noValidate>
            <div className="acct-form__grid">
              <Field label="نام" error={errors.firstName}>
                <input value={form.firstName} onChange={update('firstName')} placeholder="نام" />
              </Field>
              <Field label="نام خانوادگی" error={errors.lastName}>
                <input value={form.lastName} onChange={update('lastName')} placeholder="نام خانوادگی" />
              </Field>
            </div>

            <div className="acct-form__grid">
              <Field label="شماره موبایل" error={errors.phone}>
                <input value={form.phone} onChange={update('phone')} inputMode="tel" dir="ltr" />
              </Field>
              <Field label="ایمیل" error={errors.email}>
                <input value={form.email} onChange={update('email')} dir="ltr" inputMode="email" />
              </Field>
            </div>

            <Field label="تاریخ تولد" hint="برای هدیه تولد و پیشنهادهای ویژه استفاده می‌شود.">
              <input type="date" value={form.birthday || ''} onChange={update('birthday')} />
            </Field>

            <div className="acct-form__actions">
              <button
                type="button"
                className="btn btn--outline"
                onClick={() => {
                  setForm(user);
                  setErrors({});
                }}
              >
                بازگردانی
              </button>
              <button type="submit" className="btn btn--primary">
                <Icon name="check" size={16} />
                ذخیره تغییرات
              </button>
            </div>
          </form>
        </Panel>
      </div>
    </div>
  );
}
