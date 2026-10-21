import { useSearchParams } from 'react-router-dom';
import PageSection from '../components/PageSection.jsx';

export default function LoginPage() {
  const [params] = useSearchParams();
  const signup = params.get('section') === 'signup';

  return (
    <PageSection>
      <div className="rb-auth">
        <div className="luxina_contact_form_title">{signup ? 'عضویت در سایت' : 'ورود به حساب'}</div>
        <div className="luxina_contact_form_subtitle">{signup ? 'Create account' : 'Login'}</div>
        <div className="luxina_contact_form-wrap">
          <form className="wpcf7-form rb-form" data-rb-form={signup ? 'signup' : 'login'} noValidate>
            <div className="luxina-cf7-first-row">
              <p>
                {signup ? (
                  <input className="form-control" type="text" name="name" placeholder="نام و نام خانوادگی" required />
                ) : null}
                <input className="form-control" type="text" name="email" placeholder="ایمیل یا شماره موبایل" required />
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
    </PageSection>
  );
}
