import { projectUrl } from '../../content/projects.js';

// Portfolio card shared by the homepage and the projects index. The `size`
// prop drives the editorial grid span, so a page can compose wide, tall and
// full-width works instead of repeating one uniform card.
export default function WorkCard({ project, details, index, size = 'default', reveal = true }) {
  const classes = ['ed-work', size !== 'default' ? `ed-work--${size}` : ''].filter(Boolean).join(' ');
  const category = details?.category || 'پروژهٔ لوکسینا';
  const location = details?.location;

  return (
    <a
      className={classes}
      href={projectUrl(project)}
      data-reveal={reveal ? '' : undefined}
      style={reveal ? { '--reveal-delay': `${Math.min(index || 0, 5) * 70}ms` } : undefined}
    >
      <figure className="ed-work-media">
        <img src={project.image} alt={project.title} loading="lazy" width="1200" height="800" />
        <span className="ed-work-veil" aria-hidden="true" />
        {typeof index === 'number' ? (
          <span className="ed-work-index">{String(index + 1).padStart(2, '۰')}</span>
        ) : null}
        {project.status ? (
          <span className="ed-work-status" style={{ background: project.statusColor || 'var(--primary-100)' }}>
            {project.status}
          </span>
        ) : null}
        <span className="ed-work-open">
          مشاهدهٔ پروژه
          <i className="luxinaicon luxina-icon-arrow-left-line" aria-hidden="true" />
        </span>
      </figure>

      <div className="ed-work-body">
        <div className="ed-work-copy">
          <span className="ed-work-kicker">
            {category}
            {location ? ` · ${location}` : ''}
          </span>
          <h3 className="ed-work-title">{project.title}</h3>
          <div className="ed-work-meta">
            {project.specs.map(([title, value]) => (
              <span key={title}>
                <i className="luxinaicon luxina-icon-pencil-ruler-2-line" aria-hidden="true" />
                {title}: {value}
              </span>
            ))}
          </div>
        </div>
        <span className="ed-work-arrow" aria-hidden="true">
          <i className="luxinaicon luxina-icon-arrow-left-line" />
        </span>
      </div>
    </a>
  );
}
