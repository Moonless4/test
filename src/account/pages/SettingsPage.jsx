import { useState } from 'react';
import Icon from '../../components/Icons.jsx';
import { useRouter } from '../../router.jsx';
import { useAccount } from '../AccountContext.jsx';
import { ConfirmDialog, Field, PageHead, Panel, Toggle } from '../ui.jsx';

export default function SettingsPage({ onToast }) {
  const { settings, updateSettings, signOut } = useAccount();
  const { navigate } = useRouter();

  const [password, setPassword] = useState({ current: '', next: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);

  const submitPassword = (event) => {
    event.preventDefault();
    if (!password.current) {
      setPasswordError('رمز عبور فعلی را وارد کنید.');
      return;
    }
    if (password.next.length < 6) {
      setPasswordError('رمز عبور جدید باید حداقل ۶ کاراکتر باشد.');
      return;
    }
    if (password.next !== password.confirm) {
      setPasswordError('تکرار رمز عبور با رمز جدید یکسان نیست.');
      return;
    }
    setPasswordError('');
    setPassword({ current: '', next: '', confirm: '' });
    onToast('رمز عبور شما با موفقیت تغییر کرد.');
  };

  return (
    <div className="acct-page">
      <PageHead title="تنظیمات" text="اعلان‌ها، امنیت و حریم خصوصی حساب خود را مدیریت کنید." />

      <div className="settings-stack">
        <Panel title="اعلان‌ها" subtitle="انتخاب کنید درباره چه موضوعی به شما اطلاع بدهیم.">
          <div className="toggle-list">
            <Toggle
              label="وضعیت سفارش‌ها"
              description="آماده‌سازی، ارسال و تحویل سفارش"
              checked={settings.notifications.orders}
              onChange={(value) => updateSettings('notifications', { orders: value })}
            />
            <Toggle
              label="رزروها"
              description="تایید، تغییر و یادآوری رزرو میز"
              checked={settings.notifications.reservations}
              onChange={(value) => updateSettings('notifications', { reservations: value })}
            />
            <Toggle
              label="پیشنهادهای ویژه"
              description="تخفیف‌ها و منوهای فصلی آترین"
              checked={settings.notifications.offers}
              onChange={(value) => updateSettings('notifications', { offers: value })}
            />
            <Toggle
              label="خبرنامه آترین"
              description="داستان‌های آشپزخانه و دستورهای سرآشپز"
              checked={settings.notifications.newsletter}
              onChange={(value) => updateSettings('notifications', { newsletter: value })}
            />
          </div>
        </Panel>

        <Panel title="امنیت و رمز عبور" subtitle="برای امنیت بیشتر، رمز عبور خود را دوره‌ای تغییر دهید.">
          <form className="acct-form" onSubmit={submitPassword} noValidate>
            <Field label="رمز عبور فعلی">
              <input
                type="password"
                value={password.current}
                onChange={(event) => {
                  setPassword((prev) => ({ ...prev, current: event.target.value }));
                  setPasswordError('');
                }}
                placeholder="••••••"
              />
            </Field>

            <div className="acct-form__grid">
              <Field label="رمز عبور جدید">
                <input
                  type="password"
                  value={password.next}
                  onChange={(event) => {
                    setPassword((prev) => ({ ...prev, next: event.target.value }));
                    setPasswordError('');
                  }}
                  placeholder="حداقل ۶ کاراکتر"
                />
              </Field>
              <Field label="تکرار رمز عبور جدید">
                <input
                  type="password"
                  value={password.confirm}
                  onChange={(event) => {
                    setPassword((prev) => ({ ...prev, confirm: event.target.value }));
                    setPasswordError('');
                  }}
                  placeholder="تکرار رمز عبور"
                />
              </Field>
            </div>

            {passwordError && <span className="form-hint form-hint--error">{passwordError}</span>}

            <div className="acct-form__actions acct-form__actions--start">
              <button type="submit" className="btn btn--primary">
                ذخیره رمز جدید
              </button>
            </div>
          </form>

          <div className="toggle-list toggle-list--tight">
            <Toggle
              label="تایید دو مرحله‌ای"
              description="کد یک‌بارمصرف هنگام ورود به حساب"
              checked={settings.security.twoFactor}
              onChange={(value) => {
                updateSettings('security', { twoFactor: value });
                onToast(value ? 'تایید دو مرحله‌ای فعال شد.' : 'تایید دو مرحله‌ای غیرفعال شد.');
              }}
            />
          </div>
        </Panel>

        <Panel title="حریم خصوصی" subtitle="کنترل کنید داده‌های شما چگونه استفاده می‌شود.">
          <div className="toggle-list">
            <Toggle
              label="پیشنهادهای شخصی‌سازی‌شده"
              description="استفاده از سابقه سفارش برای پیشنهاد غذا"
              checked={settings.privacy.personalized}
              onChange={(value) => updateSettings('privacy', { personalized: value })}
            />
          </div>

          <div className="settings-danger">
            <div>
              <b>حذف حساب کاربری</b>
              <p>همه سفارش‌ها، رزروها و امتیازهای شما حذف خواهد شد.</p>
            </div>
            <button type="button" className="btn btn--outline" onClick={() => setDeleteOpen(true)}>
              درخواست حذف حساب
            </button>
          </div>

          <div className="settings-signout">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                signOut();
                onToast('از حساب کاربری خود خارج شدید.');
                navigate('/');
              }}
            >
              <Icon name="logout" size={16} />
              خروج از حساب
            </button>
          </div>
        </Panel>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => onToast('درخواست حذف حساب ثبت شد؛ واحد پشتیبانی با شما تماس می‌گیرد.')}
        title="درخواست حذف حساب"
        text="پس از تایید، تمام سابقه سفارش‌ها و امتیازهای شما حذف می‌شود. این کار قابل بازگشت نیست."
        confirmLabel="ثبت درخواست"
        cancelLabel="بازگشت"
        tone="danger"
      />
    </div>
  );
}
