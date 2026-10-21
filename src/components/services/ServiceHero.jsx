import PageSection from '../PageSection.jsx';
import PageHeading from '../PageHeading.jsx';
import { findServiceLink } from '../../content/service-pages.js';

// Service header: the same plain heading band the projects page opens with
// (icon, Persian title, English subtitle, green rule) instead of a photo hero.
export default function ServiceHero({ service }) {
  const meta = findServiceLink(service.slug);

  return (
    <PageSection className="sp-page-head">
      <PageHeading
        title={service.title}
        subtitle={meta?.subtitle}
        icon={meta?.icon ?? 'luxina-iconpencil-ruler-2-fill'}
      />
    </PageSection>
  );
}
