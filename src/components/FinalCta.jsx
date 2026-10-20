import Icon from './Icons.jsx';

export default function FinalCta({ onReserve, onMenu }) {
  return (
    <section className="final-cta section" aria-labelledby="final-cta-title">
      <div className="container">
        <div className="final-cta__panel">
          <img className="final-cta__frame" src="/assets/hero-bg.png" alt="" aria-hidden="true" />
          <span className="final-cta__wash" aria-hidden="true" />
          <img className="final-cta__dish final-cta__dish--right" src="/assets/slide1.webp" alt="" loading="lazy" />
          <img className="final-cta__dish final-cta__dish--left" src="/assets/slide3.webp" alt="" loading="lazy" />
          <img className="final-cta__dots" src="/assets/yellow-dots.png" alt="" aria-hidden="true" />

          <div className="final-cta__copy">
            <span className="section-heading__eyebrow section-heading__eyebrow--light">
              <img src="/assets/title-symbol.webp" alt="" aria-hidden="true" />
              یک تجربه به‌یادماندنی
            </span>
            <h2 id="final-cta-title">
              امشب را در نوال <em>به یاد بسپارید</em>
            </h2>
            <p>
              میز خود را رزرو کنید یا سفارش را به ما بسپارید؛ ما بقیه‌اش را برایتان آماده می‌کنیم.
            </p>
            <div className="final-cta__actions">
              <button type="button" className="btn btn--gold" onClick={onReserve}>
                <Icon name="calendar" size={18} />
                رزرو میز
              </button>
              <button type="button" className="btn btn--ghost-light" onClick={onMenu}>
                سفارش آنلاین
                <Icon name="chevronLeft" size={18} />
              </button>
            </div>
            <a className="final-cta__phone" href="tel:+982188776655">
              <Icon name="phone" size={18} />
              <span>سفارش تلفنی:</span>
              <b dir="ltr">۰۲۱-۸۸۷۷۶۶۵۵</b>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
