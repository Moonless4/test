import PageHeading from '../PageHeading.jsx';
import FaqList from '../FaqList.jsx';

// Homepage FAQ band: photo beside the accordion, with the reference page's
// faint glass panel behind the questions.
export default function HomeFaq() {
  return (
    <section className="hp-section hp-faq">
      <div className="hp-inner">
        <div className="hp-faq-grid">
          <div className="hp-faq-media">
            <img src="/img/faq-img.png" width="295" height="381" loading="lazy" decoding="async" alt="" />
          </div>

          <div className="hp-faq-body">
            <span className="luxina-faq-bg" aria-hidden="true" />
            <PageHeading title="سوالات متداول" subtitle="Most asked question" icon="luxina-iconquestionnaire-fill" />
            <FaqList />
          </div>
        </div>
      </div>
    </section>
  );
}
