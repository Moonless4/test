import PageHeading from '../PageHeading.jsx';
import FaqList from '../FaqList.jsx';
import { site } from '../../content/site.js';

// Homepage FAQ band: photo beside the accordion, with the reference page's
// faint glass panel behind the questions.
export default function HomeFaq() {
  return (
    <section className="hp-section hp-faq">
      <div className="hp-inner">
        <div className="hp-faq-grid">
          <div className="hp-faq-media">
            <img src={site.faqBlock?.image || '/img/faq-img.png'} width="295" height="381" loading="lazy" decoding="async" alt="" />
          </div>

          <div className="hp-faq-body">
            <span className="luxina-faq-bg" aria-hidden="true" />
            <PageHeading
              title={site.homeHeadings?.faqTitle || 'پرسش‌های متداول'}
              subtitle={site.homeHeadings?.faqSubtitle || 'Questions & answers'}
              icon="luxina-iconquestionnaire-fill"
            />
            <FaqList />
          </div>
        </div>
      </div>
    </section>
  );
}
