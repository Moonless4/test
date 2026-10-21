import SectionHead from '../services/SectionHead.jsx';
import Button from '../Button.jsx';
import FaqList from '../FaqList.jsx';

// FAQ band: photograph on one side, the accordion and the contact route on the
// other.
export default function HomeFaq() {
  return (
    <section className="hp-band hp-band--sand" id="faq">
      <div className="hp-inner">
        <div className="ed-split hp-faq-split">
          <div className="ed-split-body">
            <SectionHead
              kicker="سوالات متداول"
              title="پیش از شروع، این‌ها را بدانید"
              text="اگر پاسخ سوال‌تان اینجا نبود، در یک تماس کوتاه روشن‌ترش می‌کنیم."
            />
            <div className="hp-faq-accordion">
              <FaqList />
            </div>
            <Button href="/contact" variant="gray">
              پرسش دیگری دارید؟
            </Button>
          </div>

          <div className="ed-split-media">
            <figure className="ed-split-figure hp-faq-figure">
              <img src="/img/faq-img.png" alt="" width="295" height="381" loading="lazy" />
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
