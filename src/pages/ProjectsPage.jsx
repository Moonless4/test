import PageSection from '../components/PageSection.jsx';
import PageHeading from '../components/PageHeading.jsx';
import ProjectsGrid from '../components/ProjectsGrid.jsx';
import { projects } from '../content/projects.js';

export default function ProjectsPage() {
  return (
    <PageSection>
      <PageHeading title="پـروژه هـــــا" subtitle="Projects" icon="luxina-iconpencil-ruler-2-fill" />
      <ProjectsGrid projects={projects} />
    </PageSection>
  );
}
