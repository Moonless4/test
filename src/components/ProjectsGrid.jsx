import ProjectCard from './ProjectCard.jsx';

// Responsive projects grid. The column counts live in data attributes so the
// shared slider/layout helpers can turn the row into a track on narrow screens,
// exactly like the reference page's widget settings.
const SETTINGS = {
  desktop: { slider: { enabled: false }, columns: 3 },
  tablet: { slider: { enabled: false }, columns: 2 },
  mobile: { slider: { enabled: false }, columns: 1 },
};

const TRACK_STYLE = {
  '--desktop-cols': 3,
  '--desktop-gap': '16px',
  '--tablet-cols': 2,
  '--tablet-gap': '16px',
  '--mobile-cols': 1,
  '--mobile-gap': '16px',
};

export default function ProjectsGrid({ projects }) {
  return (
    <div
      className="luxina-slider-wrap posts-wrap desktop-columns-wrap tablet-columns-wrap mobile-columns-wrap projects-items-wrap"
      data-settings={JSON.stringify(SETTINGS)}
      style={TRACK_STYLE}
    >
      <div className="list-projects projects-items wrapper desktop-columns desktop-columns-3 tablet-columns tablet-columns-2 mobile-columns mobile-columns-1">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </div>
  );
}
