import SectionHead from '../services/SectionHead.jsx';
import { articles } from '../../content/articles.js';

// Journal band: the lead article as an editorial feature, the next two as a
// compact row list.
export default function HomeBlog() {
  const [featured, ...rest] = articles;

  return (
    <section className="hp-band hp-band--paper">
      <div className="hp-inner">
        <div className="hp-band-head">
          <SectionHead
            kicker="وبلاگ"
            title="یادداشت‌های طراحی"
            text="آنچه در پروژه‌ها یاد می‌گیریم، دربارهٔ سبک‌ها و انتخاب متریال می‌نویسیم."
          />
          <a className="ed-more-link hp-band-more" href="/blog">
            همهٔ مقالات
            <i className="luxinaicon luxina-icon-arrow-left-line" aria-hidden="true" />
          </a>
        </div>

        <div className="ed-journal">
          <a className="ed-feature-post" href={`/blog/${featured.slug}`} data-reveal>
            <figure className="ed-feature-media">
              <img src={featured.image} alt={featured.title} loading="lazy" width="1000" height="800" />
              <span className="ed-feature-badge">مقالهٔ منتخب</span>
            </figure>
            <div className="ed-post-meta">
              <span>
                <i className="luxinaicon luxina-icon-book-fill" aria-hidden="true" />
                {featured.category}
              </span>
              <span>۵ دقیقه مطالعه</span>
            </div>
            <h3 className="ed-feature-title">{featured.title}</h3>
            <p className="ed-feature-excerpt">{featured.excerpt}</p>
            <span className="ed-more-link">
              مطالعهٔ مقاله
              <i className="luxinaicon luxina-icon-arrow-left-line" aria-hidden="true" />
            </span>
          </a>

          <div className="ed-post-list">
            {rest.slice(0, 3).map((article, index) => (
              <a
                className="ed-post-row"
                href={`/blog/${article.slug}`}
                key={article.slug}
                data-reveal
                style={{ '--reveal-delay': `${index * 70}ms` }}
              >
                <figure className="ed-post-thumb">
                  <img src={article.image} alt="" loading="lazy" width="400" height="300" />
                </figure>
                <div className="ed-post-row-body">
                  <span className="ed-post-row-cat">{article.category}</span>
                  <h4 className="ed-post-row-title">{article.title}</h4>
                  <span className="ed-post-row-date">۵ دقیقه مطالعه</span>
                </div>
                <i className="luxinaicon luxina-icon-arrow-left-line ed-post-row-arrow" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
