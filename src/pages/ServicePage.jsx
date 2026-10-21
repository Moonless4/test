import { useParams } from 'react-router-dom';
import PageSection from '../components/PageSection.jsx';
import PageHeading from '../components/PageHeading.jsx';
import Button from '../components/Button.jsx';
import { findService } from '../content/services.js';
import NotFoundPage from './NotFoundPage.jsx';

export default function ServicePage() {
  const { slug } = useParams();
  const service = findService(slug);

  if (!service) return <NotFoundPage />;

  return (
    <PageSection>
      <PageHeading title={service.title} subtitle={service.subtitle} icon={service.icon} />
      <div className="rb-service">
        <p className="rb-service-intro">{service.intro}</p>
        <ul className="rb-service-list">
          {service.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        {service.body.map((paragraph) => (
          <p className="rb-detail-text" key={paragraph.slice(0, 24)}>
            {paragraph}
          </p>
        ))}
        <div className="rb-detail-actions">
          <Button href="/consultation" variant="primary">
            درخواست مشاوره
          </Button>
          <Button href="/contact" variant="gray">
            تماس با ما
          </Button>
        </div>
      </div>
    </PageSection>
  );
}
