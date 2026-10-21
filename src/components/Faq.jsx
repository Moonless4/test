import PageSection from './PageSection.jsx';
import PageHeading from './PageHeading.jsx';
import FaqList from './FaqList.jsx';

// The reference page's FAQ block, shared with the homepage.
export default function Faq() {
  return (
    <PageSection className="rb-faq-section">
      <div className="rb-faq">
        <img
          className="rb-faq-image"
          src="/img/faq-img.png"
          alt=""
          width="295"
          height="381"
          loading="lazy"
        />
        <div className="rb-faq-body">
          <PageHeading title="سوالات متداول" subtitle="Most asked question" icon="luxina-iconquestionnaire-fill" />
          <FaqList />
        </div>
      </div>
    </PageSection>
  );
}
