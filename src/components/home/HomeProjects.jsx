import SectionHead from '../services/SectionHead.jsx';
import WorkCard from '../editorial/WorkCard.jsx';
import { projects } from '../../content/projects.js';
import { findProjectDetails } from '../../content/project-details.js';

// Selected work: one full-width flagship project, then the rest of the
// portfolio as a compact editorial grid.
export default function HomeProjects() {
  const [featured, ...rest] = projects;

  return (
    <section className="hp-band hp-band--paper">
      <div className="hp-inner">
        <div className="hp-band-head">
          <SectionHead
            kicker="پروژه‌های منتخب"
            title="کارهایی که ایستاده‌اند"
            text="هر پروژه یک مسئلهٔ متفاوت داشت؛ از زمین محدود جردن تا نمای شهری سعادت‌آباد."
          />
          <a className="ed-more-link hp-band-more" href="/projects">
            همهٔ پروژه‌ها
            <i className="luxinaicon luxina-icon-arrow-left-line" aria-hidden="true" />
          </a>
        </div>

        <div className="ed-portfolio hp-portfolio">
          <WorkCard
            project={featured}
            details={findProjectDetails(featured.slug)}
            index={0}
            size="full"
          />
          {rest.slice(0, 3).map((project, index) => (
            <WorkCard
              key={project.slug}
              project={project}
              details={findProjectDetails(project.slug)}
              index={index + 1}
              size="third"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
