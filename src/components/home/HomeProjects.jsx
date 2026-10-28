import PageHeading from '../PageHeading.jsx';
import Button from '../Button.jsx';
import ProjectsGrid from '../ProjectsGrid.jsx';
import { findFeaturedProject, projects } from '../../content/projects.js';
import { site } from '../../content/site.js';

// Homepage projects band: a heading row with the "all projects" button above a
// three-card slider. The featured project is the one the hero already shows.
export default function HomeProjects() {
  const featured = findFeaturedProject();
  const heading = site.homeHeadings || {};

  return (
    <section className="hp-section hp-projects">
      <div className="hp-inner">
        <div className="hp-section-head">
          <PageHeading
            title={heading.projectsTitle || 'پـروژه هـــــا'}
            subtitle={heading.projectsSubtitle || 'Projects'}
            icon="luxina-iconpencil-ruler-2-fill"
          />
          <Button href="/projects" variant="gray">
            {heading.projectsCta || 'مشاهدهٔ همهٔ پروژه‌ها'}
          </Button>
        </div>
        <ProjectsGrid projects={projects.filter((project) => project.slug !== featured?.slug)} carousel />
      </div>
    </section>
  );
}
