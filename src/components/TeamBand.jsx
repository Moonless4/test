import PageSection from './PageSection.jsx';
import PageHeading from './PageHeading.jsx';
import Button from './Button.jsx';
import { site } from '../content/site.js';

// "Our team" band from the reference page, rebuilt as a component.
export default function TeamBand() {
  const { team } = site;

  return (
    <PageSection className="rb-team-section">
      <div className="rb-team">
        <div className="rb-team-body">
          <PageHeading
            title={site.homeHeadings?.teamTitle || 'تیــــــــــم مــــــــــا'}
            subtitle={site.homeHeadings?.teamSubtitle || 'Our Team'}
            icon="luxina-iconteam-fill"
          />
          <p className="rb-team-text">{team.intro}</p>
          <Button href="/cooperation" variant="primary">
            {site.homeHeadings?.teamCta || 'فرصت‌های همکاری'}
          </Button>
        </div>
        <img className="rb-team-image" src={team.image} alt="" width="474" height="552" loading="lazy" />
      </div>
    </PageSection>
  );
}
