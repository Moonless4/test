import PageSection from '../components/PageSection.jsx';
import PageHeading from '../components/PageHeading.jsx';
import ProjectsGrid from '../components/ProjectsGrid.jsx';
import PageMeta from '../components/PageMeta.jsx';
import { projects } from '../content/projects.js';
import { site } from '../content/site.js';

export default function ProjectsPage() {
  const page = site.pages?.projects || {};

  return (
    <>
      <PageMeta title={page.seoTitle} description={page.seoDescription} path="/projects" />
      <PageSection>
        <PageHeading
          title={page.title || 'پـروژه هـــــا'}
          subtitle={page.subtitle || 'Projects'}
          icon={page.icon || 'luxina-iconpencil-ruler-2-fill'}
        />
        {page.intro ? <p className="rb-service-intro">{page.intro}</p> : null}
        <ProjectsGrid projects={projects} />
      </PageSection>
    </>
  );
}
