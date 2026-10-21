import { useSearchParams } from 'react-router-dom';
import Band from '../components/editorial/Band.jsx';

// Sign in / sign up. Accounts are local to this browser (see lib/account.js);
// the layout is the editorial split with the studio photograph.
export default function LoginPage() {
  const [params] = useSearchParams();
  const signup = params.get('section') === 'signup';

  return (
    <div className="ed-page">
      <Band tone="soft">
        <div className="ed-auth">
          <figure className="ed-auth-media">
            <img src="/img/services/interior-hero.jpg" alt="" width="1200" height="1600" />
            <span className="ed-auth-media-veil" aria-hidden="true" />
            <figcaption className="ed-auth-media-copy">
              <strong>حساب کاربری لوکسینا</strong>
              <span>پیگیری درخواست‌ها، ذخیرهٔ پروژه‌های موردعلاقه و دسترسی سریع به مشاوره.</span>
            </figcaption>
          </figure>

          <div className="ed-auth-body">
            <h1 className="ed-auth-title">{signup ? 'عضویت در سایت' : 'ورود به حساب'}</h1>
            <p className="ed-auth-subtitle">
              {signup ? 'Create account' : 'Login'} — {signup ? 'برای ساخت حساب، اطلاعات زیر را کامل کنید.' : 'برای ادامه، اطلاعات حساب خود را وارد کنید.'}
            </p>

            <div className="luxina_contact_form-wrap">
              <form className="wpcf7-form rb-form" data-rb-form={signup ? 'signup' : 'login'} noValidate>
                <div className="luxina-cf7-first-row">
                  <p>
                    {signup ? (
                      <input
                        className="form-control"
                        type="text"
                        name="name"
                        placeholder="نام و نام خانوادگی"
                        required
                      />
                    ) : null}
                    <input
                      className="form-control"
                      type="text"
                      name="email"
                      placeholder="ایمیل یا شماره موبایل"
                      required
                    />
                    <input className="form-control" type="password" name="password" placeholder="رمز عبور" required />
                  </p>
                </div>
                <button type="submit" className="button button-start rounded button-primary rb-form-submit">
                  <span className="button-text">{signup ? 'ساخت حساب' : 'ورود'}</span>
                </button>
                <p className="rb-form-note" hidden>
                  {signup ? 'حساب شما ساخته شد؛ خوش آمدید.' : 'خوش آمدید! وارد حساب خود شدید.'}
                </p>
                <p className="rb-form-switch">
                  {signup ? (
                    <>
                      حساب کاربری دارید؟ <a href="/login">وارد شوید</a>
                    </>
                  ) : (
                    <>
                      حساب کاربری ندارید؟ <a href="/login?section=signup">ثبت‌نام کنید</a>
                    </>
                  )}
                </p>
              </form>
            </div>
          </div>
        </div>
      </Band>
    </div>
  );
}
