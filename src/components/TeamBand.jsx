import PageSection from './PageSection.jsx';
import PageHeading from './PageHeading.jsx';
import Button from './Button.jsx';

// "Our team" band from the reference page, rebuilt as a component.
export default function TeamBand() {
  return (
    <PageSection className="rb-team-section">
      <div className="rb-team">
        <div className="rb-team-body">
          <PageHeading title="تیــــــــــم مــــــــــا" subtitle="Our Team" icon="luxina-iconteam-fill" />
          <p className="rb-team-text">معماران، مهندسان و مدیران اجرایی؛ یک تیم با یک زبان مشترک.</p>
          <Button href="/cooperation" variant="primary">
            فرصت‌های همکاری
          </Button>
        </div>
        <img className="rb-team-image" src="/img/team.png" alt="" width="474" height="552" loading="lazy" />
      </div>
    </PageSection>
  );
}
