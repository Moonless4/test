import { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icons.jsx';
import { Link } from '../../router.jsx';
import { useAccount } from '../AccountContext.jsx';
import Avatar, { AVATAR_STYLES, DEFAULT_AVATAR } from '../Avatar.jsx';
import { readAvatarFile } from '../avatarUpload.js';
import { Field, PageHead, Panel } from '../ui.jsx';
import { fa, formatDate } from '../../data/account.js';

export default function ProfilePage({ onToast }) {
  const { user, saveProfile, loyalty, orders } = useAccount();
  const [form, setForm] = useState(user);
  const [errors, setErrors] = useState({});
  const [uploadError, setUploadError] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    setForm(user);
  }, [user]);

  const update = (key) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const pickFile = () => fileRef.current?.click();

  const onUpload = async (event) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = '';
    if (!file) return;
    try {
      setUploadError('');
      const dataUrl = await readAvatarFile(file);
      setForm((prev) => ({ ...prev, avatar: dataUrl }));
    } catch (error) {
      setUploadError(error.message);
    }
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

  const isCustomPhoto = typeof form.avatar === 'string' && form.avatar.startsWith('data:');
  const avatarChanged = form.avatar !== user.avatar;

  return (
    <div className="acct-page">
      <PageHead title="اطلاعات شخصی" text="اطلاعات حساب خود را برای هماهنگی سفارش‌ها و رزروها به‌روز نگه دارید." />

      <div className="profile-grid">
        <Panel title="تصویر و شناسه حساب" className="profile-side">
          <div className="profile-avatar">
            <Avatar value={form.avatar} name={`${form.firstName} ${form.lastName}`} />
            <button
              type="button"
              className="profile-avatar__camera"
              onClick={pickFile}
              aria-label="آپلود عکس پروفایل"
              title="آپلود عکس پروفایل"
            >
              <Icon name="camera" size={14} />
            </button>
            <span className="profile-avatar__tier">
              <Icon name="star" size={13} filled />
              {loyalty.tier}
            </span>
          </div>

          <input
            ref={fileRef}
            type="file"
            className="sr-only"
            accept="image/png,image/jpeg,image/webp"
            onChange={onUpload}
            tabIndex={-1}
          />

          <div className="avatar-actions">
            <button type="button" className="btn btn--outline btn--sm" onClick={pickFile}>
              <Icon name="camera" size={15} />
              آپلود عکس من
            </button>
            {isCustomPhoto && (
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => {
                  setUploadError('');
                  setForm((prev) => ({ ...prev, avatar: DEFAULT_AVATAR }));
                }}
              >
                <Icon name="trash" size={14} />
                حذف عکس
              </button>
            )}
          </div>

          <p className="avatar-note">
            یکی از تصویرهای گرافیکی را انتخاب کنید یا عکس خودتان را آپلود کنید.
          </p>
          {uploadError && <p className="avatar-note avatar-note--error">{uploadError}</p>}
          {avatarChanged && !uploadError && (
            <p className="avatar-note avatar-note--pending">برای ثبت تصویر، «ذخیره تغییرات» را بزنید.</p>
          )}

          <div className="avatar-picker" role="group" aria-label="انتخاب تصویر پروفایل">
            {AVATAR_STYLES.map((style) => {
              const value = `graphic:${style.id}`;
              return (
                <button
                  key={style.id}
                  type="button"
                  className={`avatar-picker__item ${form.avatar === value ? 'is-active' : ''}`}
                  onClick={() => setForm((prev) => ({ ...prev, avatar: value }))}
                  aria-label={`تصویر ${style.label}`}
                  title={style.label}
                  aria-pressed={form.avatar === value}
                >
                  <Avatar value={value} />
                </button>
              );
            })}
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
                  setUploadError('');
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
