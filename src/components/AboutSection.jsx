import Icon from './Icons.jsx';

export default function AboutSection({ onMenu, onReserve }) {
  return (
    <section className="about section" id="about" aria-labelledby="about-title">
      <div className="container about__grid">
        <div className="about__visual">
          <span className="about__blob" aria-hidden="true" />
          <img className="about__bg" src="/assets/intro-section-bg.png" alt="" aria-hidden="true" />
          <img className="about__chef" src="/assets/contact-chef.webp" alt="سرآشپز رستوران نوال" loading="lazy" />
          <span className="about__exp">
            <b>۱۲+</b>
            <small>سال تجربه</small>
          </span>
          <img className="about__dots" src="/assets/yellow-dots.png" alt="" aria-hidden="true" />
        </div>

        <div className="about__copy">
          <span className="section-heading__eyebrow">
            <img src="/assets/title-symbol.webp" alt="" aria-hidden="true" />
            درباره رستوران نوال
          </span>
          <h2 id="about-title">
            طعم اصیل، در فضایی <em>گرم و دلنشین</em>
          </h2>
          <p className="about__lead">
            از سال ۱۳۹۲، در نوال تلاش کرده‌ایم هر وعده غذایی را به یک خاطره تبدیل کنیم؛ با مواد اولیه
            تازه، دستورهای اصیل و تیمی که عاشق پذیرایی است.
          </p>
          <ul className="about__list">
            <li>
              <Icon name="check" size={17} />
              مواد اولیه تازه و روزانه از تأمین‌کنندگان محلی
            </li>
            <li>
              <Icon name="check" size={17} />
              سرآشپزهای حرفه‌ای با تجربه آشپزی ایرانی و بین‌المللی
            </li>
            <li>
              <Icon name="check" size={17} />
              فضایی صمیمی برای دورهمی‌های خانوادگی و دوستانه
            </li>
          </ul>
          <div className="about__footer">
            <div className="about__signature">
              <span className="about__signature-name">نوال</span>
              <span>سرآشپز و بنیان‌گذار</span>
            </div>
            <div className="about__actions">
              <button type="button" className="btn btn--primary" onClick={onMenu}>
                مشاهده منو
                <Icon name="chevronLeft" size={18} />
              </button>
              <button type="button" className="btn btn--outline" onClick={onReserve}>
                رزرو میز
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
