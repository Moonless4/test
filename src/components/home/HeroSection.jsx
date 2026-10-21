import Button from '../Button.jsx';

// Homepage hero: a dark, full-bleed band with the featured project on the right
// and the building render standing on its lower edge. The second image is the
// mobile-only variant the reference page also rendered.
export default function HeroSection() {
  return (
    <section className="hp-hero">
      <div className="hp-hero-inner">
        <div className="hp-hero-copy">
          <div className="hp-hero-badges">
            <p className="hp-hero-badge">ساخت و ساز</p>
            <p className="hp-hero-badge">انبوه سازی</p>
          </div>

          <h2 className="hp-hero-title">برج پارس جردن</h2>

          <div className="hp-hero-author">
            <img src="/img/image.png" width="47" height="48" decoding="async" alt="" />
            <p className="hp-hero-author-name">صمد سلیمان زاده</p>
            <p className="hp-hero-author-role">معمار و مجری</p>
          </div>

          <p className="hp-hero-text">۲۵ طبقه اداری و تجاری در جردن؛ ۱۷٬۰۰۰ متر زیربنا، از فونداسیون تا تحویل کلید.</p>

          <Button href="/project/pars-jordan">مشاهدهٔ پروژه</Button>
        </div>
      </div>

      <div className="hp-hero-visual hp-hero-visual--desktop">
        <img
          src="/img/Group-4-1-1.png"
          width="588"
          height="461"
          loading="lazy"
          decoding="async"
          alt=""
        />
      </div>

      <div className="hp-hero-visual hp-hero-visual--mobile">
        <img
          src="/img/Group-4-1-1.png"
          width="588"
          height="461"
          loading="lazy"
          decoding="async"
          alt=""
        />
      </div>
    </section>
  );
}
