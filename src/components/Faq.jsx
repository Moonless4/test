import PageSection from './PageSection.jsx';
import PageHeading from './PageHeading.jsx';
import FaqList from './FaqList.jsx';
import { site } from '../content/site.js';

// The reference page's FAQ block, shared with the homepage.
export default function Faq() {
  return (
    <PageSection className="rb-faq-section">
      <div className="rb-faq">
        <img
          className="rb-faq-image"
          src={site.faqBlock?.image || '/img/faq-img.png'}
          alt=""
          width="295"
          height="381"
          loading="lazy"
        />
        <div className="rb-faq-body">
          <PageHeading
            title={site.homeHeadings?.faqTitle || 'پرسش‌های متداول'}
            subtitle={site.homeHeadings?.faqSubtitle || 'Questions & answers'}
            icon="luxina-iconquestionnaire-fill"
          />
          <FaqList />
        </div>
      </div>
    </PageSection>
  );
}
