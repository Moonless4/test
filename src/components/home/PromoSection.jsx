import Button from '../Button.jsx';

// Closing call-to-action band: the project catalogue on one side, a direct
// consultation route on the other. It replaces the two theme promo cards with a
// single architectural band.
export default function PromoSection() {
  return (
    <section className="hp-promo-band">
      <div className="hp-promo-media" aria-hidden="true">
        <img src="/img/catalog-image.png" alt="" loading="lazy" width="1600" height="900" />
      </div>
      <div className="hp-promo-veil" aria-hidden="true" />

      <div className="hp-inner hp-promo-inner">
        <div className="hp-promo-copy">
          <span className="sp-kicker sp-kicker-light">
            <span className="sp-kicker-rule" aria-hidden="true" />
            کاتالوگ و مشاوره
          </span>
          <h2 className="hp-promo-title">
            کاتـالـــوگ پـــروژه‌ها
            <span>Projects catalogue</span>
          </h2>
          <p className="hp-promo-text">
            منتخبی از پروژه‌های اجراشده، جزئیات طراحی و متریال به‌کاررفته در یک کاتالوگ قابل مرور. اگر ترجیح می‌دهید
            مستقیم صحبت کنیم، جلسهٔ مشاورهٔ اولیه بدون هزینه است.
          </p>
          <div className="hp-promo-actions">
            <Button href="/projects">مشاهدهٔ کاتالوگ</Button>
            <Button href="/consultation" variant="gray">
              درخواست مشاوره
            </Button>
            <a
              className="hp-promo-download"
              href="https://mihanmdf.ir/wp-content/uploads/2023/12/Pooya_catalog_mihanmdf.pdf"
              target="_blank"
              rel="noopener"
            >
              <i className="luxinaicon luxina-icon-download-line" aria-hidden="true" />
              دانلود PDF
            </a>
          </div>
        </div>

        <div className="hp-promo-side">
          <span className="hp-promo-side-label">ارتباط مستقیم</span>
          <a className="hp-promo-phone" href="tel:+98211234567" dir="ltr">
            021-123 4567
          </a>
          <span className="hp-promo-side-note">شنبه تا چهارشنبه، ۹ تا ۱۸</span>
          <a className="hp-promo-ghost" href="/contact">
            تماس با ما
            <i className="luxinaicon luxina-icon-arrow-left-line" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
