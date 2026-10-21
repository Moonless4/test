import Button from '../Button.jsx';

// Homepage hero: the featured project (Pars Jordan) as a full-bleed
// architectural photograph under the transparent header, with the studio's
// claim, the project's author and its headline figures.
export default function HeroSection() {
  return (
    <section className="hp-hero">
      <div className="hp-hero-media" aria-hidden="true">
        <img src="/img/hero-bg-1.png" alt="" width="1920" height="1080" />
      </div>
      <div className="hp-hero-veil" aria-hidden="true" />

      <div className="hp-hero-inner">
        <div className="hp-hero-copy">
          <div className="hp-hero-badges">
            <span className="hp-hero-badge">ساخت و ساز</span>
            <span className="hp-hero-badge">انبوه سازی</span>
          </div>

          <h1 className="hp-hero-title">
            پروژه بـــرج پـــارس
            <br />
            جــــــــردن
          </h1>

          <p className="hp-hero-text">
            برج لوکس اداری تجاری پارس با مساحت ۹۰۵ متر، زیربنای ۱۷۰۰۰ متر، ۲۵ طبقه؛ ۲۰ طبقه روی زمین و ۵ طبقه زیر
            زمین.
          </p>

          <div className="hp-hero-actions">
            <Button href="/project/pars-jordan">درباره این پروژه</Button>
            <a className="sp-hero-ghost" href="#services">
              <span>خدمات لوکسینا</span>
              <i className="luxinaicon luxina-icon-arrow-down-line" aria-hidden="true" />
            </a>
          </div>

          <div className="hp-hero-author">
            <img src="/img/image.png" width="47" height="48" decoding="async" alt="" />
            <div className="hp-hero-author-copy">
              <span className="hp-hero-author-name">صمد سلیمان زاده</span>
              <span className="hp-hero-author-role">طراح و مجری ساخت</span>
            </div>
          </div>
        </div>

        <aside className="hp-hero-facts" aria-label="مشخصات پروژهٔ شاخص">
          <span className="hp-hero-facts-label">پروژهٔ شاخص</span>
          <div className="hp-hero-fact">
            <span>مساحت زمین</span>
            <strong>۹۰۵ متر</strong>
          </div>
          <div className="hp-hero-fact">
            <span>زیربنا</span>
            <strong>۱۷٬۰۰۰ متر</strong>
          </div>
          <div className="hp-hero-fact">
            <span>تعداد طبقات</span>
            <strong>۲۵ طبقه</strong>
          </div>
          <a className="hp-hero-facts-link" href="/projects">
            همهٔ پروژه‌ها
            <i className="luxinaicon luxina-icon-arrow-left-line" aria-hidden="true" />
          </a>
        </aside>
      </div>

      <div className="hp-hero-scroll" aria-hidden="true">
        <span />
      </div>
    </section>
  );
}
