import PageHeading from '../PageHeading.jsx';
import Button from '../Button.jsx';
import ProjectsGrid from '../ProjectsGrid.jsx';
import { featuredProject, projects } from '../../content/projects.js';

// Homepage projects band: a heading row with the "all projects" button above a
// three-card slider.
export default function HomeProjects() {
  return (
    <section className="hp-section hp-projects">
      <div className="hp-inner">
        <div className="hp-section-head">
          <PageHeading title="پـروژه هـــــا" subtitle="Projects" icon="luxina-iconpencil-ruler-2-fill" />
          <Button href="/projects" variant="gray">
            مشاهدهٔ همهٔ پروژه‌ها
          </Button>
        </div>
        <ProjectsGrid
          projects={projects.filter((project) => project.slug !== featuredProject.slug)}
          arrows
        />
      </div>
    </section>
  );
}
