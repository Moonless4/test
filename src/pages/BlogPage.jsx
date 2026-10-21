import { useMemo, useState } from 'react';
import PageHero from '../components/editorial/PageHero.jsx';
import Band from '../components/editorial/Band.jsx';
import SectionHead from '../components/services/SectionHead.jsx';
import ServiceCta from '../components/services/ServiceCta.jsx';
import { articles } from '../content/articles.js';

const ALL = 'همه';

// Journal index: a lead article followed by the rest of the archive, filterable
// by category.
export default function BlogPage() {
  const [filter, setFilter] = useState(ALL);
  const [featured, ...archive] = articles;

  const categories = useMemo(() => {
    const counts = new Map();
    articles.forEach((article) => counts.set(article.category, (counts.get(article.category) || 0) + 1));
    return [{ label: ALL, count: articles.length }, ...[...counts].map(([label, count]) => ({ label, count }))];
  }, []);

  const visible = filter === ALL ? archive : archive.filter((article) => article.category === filter);

  return (
    <div className="ed-page">
      <PageHero
        image="/img/2-31.webp"
        eyebrow="وبلاگ لوکسینا"
        icon="luxina-icon-book-line"
        title="مقالات معماری و طراحی داخلی"
        lead="یادداشت‌هایی دربارهٔ سبک‌ها، متریال و تصمیم‌های طراحی که در پروژه‌های واقعی به آن‌ها رسیده‌ایم."
        breadcrumbs={[{ href: '/', label: 'خانه' }, { label: 'مقالات' }]}
        facts={[
          { label: 'موضوع', value: 'طراحی داخلی' },
          { label: 'نویسنده', value: 'تیم طراحی لوکسینا' },
          { label: 'زمان مطالعه', value: '۵ دقیقه' },
        ]}
      />

      <Band tone="soft">
        <SectionHead kicker="مقالهٔ منتخب" title="پیشنهاد این هفته" />
        <a className="ed-feature-post ed-feature-post--wide" href={`/blog/${featured.slug}`} data-reveal>
          <figure className="ed-feature-media">
            <img src={featured.image} alt={featured.title} loading="lazy" width="1200" height="900" />
            <span className="ed-feature-badge">مقالهٔ منتخب</span>
          </figure>
          <div className="ed-feature-body">
            <div className="ed-post-meta">
              <span>
                <i className="luxinaicon luxina-icon-book-fill" aria-hidden="true" />
                {featured.category}
              </span>
              <span>۵ دقیقه مطالعه</span>
            </div>
            <h2 className="ed-feature-title">{featured.title}</h2>
            <p className="ed-feature-excerpt">{featured.excerpt}</p>
            <span className="ed-more-link">
              مطالعهٔ مقاله
              <i className="luxinaicon luxina-icon-arrow-left-line" aria-hidden="true" />
            </span>
          </div>
        </a>
      </Band>

      <Band>
        <div className="ed-related-head">
          <SectionHead kicker="آرشیو" title="همهٔ مقالات" />
        </div>

        <div className="ed-filters" role="group" aria-label="فیلتر مقالات">
          {categories.map((category) => (
            <button
              type="button"
              key={category.label}
              className={category.label === filter ? 'ed-filter is-active' : 'ed-filter'}
              aria-pressed={category.label === filter}
              onClick={() => setFilter(category.label)}
            >
              {category.label}
              <span className="ed-filter-count">{category.count}</span>
            </button>
          ))}
        </div>

        <div className="ed-journal-grid">
          {visible.map((article, index) => (
            <a
              className="ed-post-card"
              href={`/blog/${article.slug}`}
              key={article.slug}
              data-reveal
              style={{ '--reveal-delay': `${index * 70}ms` }}
            >
              <figure className="ed-post-card-media">
                <img src={article.image} alt="" loading="lazy" width="800" height="600" />
              </figure>
              <div className="ed-post-meta">
                <span>
                  <i className="luxinaicon luxina-icon-book-fill" aria-hidden="true" />
                  {article.category}
                </span>
                <span>۵ دقیقه مطالعه</span>
              </div>
              <h3 className="ed-post-card-title">{article.title}</h3>
              <p className="ed-post-card-excerpt">{article.excerpt}</p>
              <span className="ed-more-link">
                مطالعه
                <i className="luxinaicon luxina-icon-arrow-left-line" aria-hidden="true" />
              </span>
            </a>
          ))}
          {!visible.length ? <p className="ed-portfolio-empty">مقاله‌ای در این دسته منتشر نشده است.</p> : null}
        </div>
      </Band>

      <Band>
        <ServiceCta
          image="/img/2-23-1.webp"
          title="دربارهٔ سبک فضای خود مشورت بگیرید"
          text="اگر بین چند سبک مردد هستید، در یک جلسهٔ کوتاه نمونه‌های اجرایی، پالت رنگ و متریال مناسب فضای شما را مرور می‌کنیم."
        />
      </Band>
    </div>
  );
}
