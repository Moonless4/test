// Project examples strip shared by the four service pages.
export default function ProjectStrip({ projects }) {
  return (
    <div className="sp-projects">
      {projects.map((project) => (
        <article className="sp-project" key={project.title}>
          <figure className="sp-project-media">
            <img src={project.image} alt={project.title} loading="lazy" width="900" height="640" />
          </figure>
          <div className="sp-project-body">
            <h3 className="sp-project-title">{project.title}</h3>
            <span className="sp-project-meta">{project.meta}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
