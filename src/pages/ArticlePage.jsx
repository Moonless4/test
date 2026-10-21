import { useParams } from 'react-router-dom';
import Band from '../components/editorial/Band.jsx';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import Button from '../components/Button.jsx';
import SectionHead from '../components/services/SectionHead.jsx';
import ServiceCta from '../components/services/ServiceCta.jsx';
import { articles, findArticle } from '../content/articles.js';
import NotFoundPage from './NotFoundPage.jsx';

// Article detail: photographic hero, a readable editorial column with a sticky
// fact sheet, then related reading.
export default function ArticlePage() {
  const { slug } = useParams();
  const article = findArticle(slug);

  if (!article) return <NotFoundPage />;

  const related = articles.filter((item) => item.slug !== article.slug);

  return (
    <div className="ed-page">
      <section className="ed-article-hero">
        <div className="ed-article-hero-media" aria-hidden="true">
          <img src={article.image} alt="" width="1920" height="1080" />
        </div>
        <div className="ed-article-hero-veil" aria-hidden="true" />

        <div className="ed-article-hero-inner">
          <Breadcrumbs
            items={[
              { href: '/', label: 'خانه' },
              { href: '/blog', label: 'مقالات' },
              { label: article.category },
            ]}
          />
          <div className="ed-post-meta">
            <span>
              <i className="luxinaicon luxina-icon-book-fill" aria-hidden="true" />
              {article.category}
            </span>
            <span>۵ دقیقه مطالعه</span>
            <span>تیم طراحی لوکسینا</span>
          </div>
          <h1 className="ed-article-title">{article.title}</h1>
        </div>
      </section>

      <Band tone="soft">
        <div className="ed-article-layout">
          <div className="ed-prose">
            <p className="ed-prose-lead">{article.excerpt}</p>
            {article.body.map((paragraph, index) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}

            {article.points?.length ? (
              <figure className="ed-prose-figure">
                <img src={article.image} alt={article.title} loading="lazy" width="1200" height="675" />
                <figcaption>{article.title}</figcaption>
              </figure>
            ) : null}

            {article.points?.length ? (
              <>
                <h2 className="ed-case-subtitle">نکته‌های کلیدی</h2>
                <ul className="ed-prose-list">
                  {article.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>

          <aside className="ed-article-aside">
            <span className="ed-article-aside-title">دربارهٔ این مقاله</span>
            <div className="ed-facts">
              <div className="ed-facts-row">
                <span className="ed-facts-label">دسته</span>
                <span className="ed-facts-value">{article.category}</span>
              </div>
              <div className="ed-facts-row">
                <span className="ed-facts-label">زمان مطالعه</span>
                <span className="ed-facts-value">۵ دقیقه</span>
              </div>
              <div className="ed-facts-row">
                <span className="ed-facts-label">نویسنده</span>
                <span className="ed-facts-value">تیم لوکسینا</span>
              </div>
            </div>
            <Button href="/consultation" variant="primary" className="rb-project-facts-button">
              درخواست مشاوره
            </Button>
          </aside>
        </div>
      </Band>

      <Band>
        <SectionHead kicker="ادامهٔ مطالعه" title="مقالات مرتبط" />
        <div className="ed-journal-grid">
          {related.map((item, index) => (
            <a
              className="ed-post-card"
              href={`/blog/${item.slug}`}
              key={item.slug}
              data-reveal
              style={{ '--reveal-delay': `${index * 70}ms` }}
            >
              <figure className="ed-post-card-media">
                <img src={item.image} alt="" loading="lazy" width="800" height="600" />
              </figure>
              <div className="ed-post-meta">
                <span>
                  <i className="luxinaicon luxina-icon-book-fill" aria-hidden="true" />
                  {item.category}
                </span>
              </div>
              <h3 className="ed-post-card-title">{item.title}</h3>
            </a>
          ))}
        </div>
      </Band>

      <Band>
        <ServiceCta
          image="/img/1-6.webp"
          title="سبک موردعلاقه‌تان را اجرا کنیم"
          text="در مشاورهٔ اولیه، سبک، متریال و بازهٔ بودجه را بررسی می‌کنیم و مسیر پیشنهادی طراحی را توضیح می‌دهیم."
        />
      </Band>
    </div>
  );
}
