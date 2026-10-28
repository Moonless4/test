import Button from '../Button.jsx';
import { findFeaturedProject, projectUrl } from '../../content/projects.js';
import { site } from '../../content/site.js';

// Homepage hero: a dark, full-bleed band with the featured project on the right
// and the building render standing on its lower edge. The copy comes from the
// admin panel and falls back to the featured project while it is still empty.
export default function HeroSection() {
  const { hero } = site;
  const featured = findFeaturedProject();
  const image = hero.image || '/img/Group-4-1-1.png';

  return (
    <section className="hp-hero">
      <div className="hp-hero-inner">
        <div className="hp-hero-copy">
          <div className="hp-hero-badges">
            <p className="hp-hero-badge">{hero.badge1}</p>
            <p className="hp-hero-badge">{hero.badge2}</p>
          </div>

          <h2 className="hp-hero-title">{hero.title || featured?.title}</h2>

          <div className="hp-hero-author">
            <img src={hero.authorImage} width="48" height="48" decoding="async" alt="" />
            <p className="hp-hero-author-name">{hero.authorName}</p>
            <p className="hp-hero-author-role">{hero.authorRole}</p>
          </div>

          <p className="hp-hero-text">{hero.text || featured?.heroText}</p>

          <Button href={hero.ctaHref || (featured ? projectUrl(featured) : '/projects')}>{hero.ctaLabel}</Button>
        </div>
      </div>

      <div className="hp-hero-visual hp-hero-visual--desktop">
        <img src={image} width="588" height="461" loading="lazy" decoding="async" alt="" />
      </div>

      <div className="hp-hero-visual hp-hero-visual--mobile">
        <img src={image} width="588" height="461" loading="lazy" decoding="async" alt="" />
      </div>
    </section>
  );
}
