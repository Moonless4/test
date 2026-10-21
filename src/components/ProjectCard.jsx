import { projectUrl } from '../content/projects.js';

// Project card using the theme's project-card markup.
export default function ProjectCard({ project }) {
  return (
    <article className="slider-slide luxina_project project">
      <a href={projectUrl(project)} title={project.title} className="luxina_project_inner">
        <div className="luxina_project_thumbnail-wrap">
          <figure className="post-thumbnail">
            <img
              loading="lazy"
              decoding="async"
              width="780"
              height="520"
              src={project.image}
              className="attachment-post-thumbnail size-post-thumbnail wp-post-image"
              alt={project.title}
            />
          </figure>
        </div>

        <div className="luxina_project_content">
          <span className="luxina_project_content-bg project-card-shape" aria-hidden="true" />
          {project.status ? (
            <span className="luxina_project_status" style={{ background: project.statusColor }}>
              {project.status}
            </span>
          ) : null}
          <h2 className="luxina_project_name line-clamp line-clamp-1">{project.title}</h2>
          <div className="luxina_project_details">
            {project.specs.map(([title, value]) => (
              <div className="luxina_project_detail-wrap" key={title}>
                <span className="luxina_project_detail-title">{title}</span>
                <span className="luxina_project_detail-description">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="luxina_project_view-button project-card-button-shape">مشاهده پروژه</div>
      </a>
    </article>
  );
}
