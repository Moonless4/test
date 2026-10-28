import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PageSection from '../components/PageSection.jsx';
import PageHeading from '../components/PageHeading.jsx';
import Button from '../components/Button.jsx';
import { articleUrl, findArticle, relatedArticles } from '../content/articles.js';
import { applySeo } from '../lib/seo.js';
import NotFoundPage from './NotFoundPage.jsx';

function RelatedArticles({ current }) {
  const items = relatedArticles(current);
  if (!items.length) return null;
  return (
    <aside className="rb-related-wrap" aria-labelledby="rb-related-title">
      <h2 className="rb-related-title" id="rb-related-title">
        بیشتر بخوانید
      </h2>
      <div className="rb-related">
        {items.map((article) => (
          <a className="rb-related-card" href={articleUrl(article)} key={article.slug}>
            <img src={article.image} alt={article.imageAlt} loading="lazy" />
            <span className="rb-related-card-body">
              <span className="rb-related-card-cat">{article.category}</span>
              <span className="rb-related-card-title">{article.cardTitle}</span>
              <span className="rb-related-card-time">{article.readingTime} مطالعه</span>
            </span>
          </a>
        ))}
      </div>
    </aside>
  );
}

function Block({ block }) {
  switch (block.type) {
    case 'h2':
      return <h2 className="rb-article-h2">{block.text}</h2>;
    case 'h3':
      return <h3 className="rb-article-h3">{block.text}</h3>;
    case 'p':
      return <p>{block.text}</p>;
    case 'quote':
      return <blockquote className="rb-article-quote">{block.text}</blockquote>;
    case 'list':
      return (
        <ul className="rb-article-list">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case 'checklist':
      return (
        <section className="rb-article-checklist">
          <h2 className="rb-article-checklist-title">{block.title}</h2>
          <ul>
            {block.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      );
    case 'img':
      return (
        <figure className="rb-article-figure">
          <img src={block.src} alt={block.alt} loading="lazy" />
          {block.caption ? <figcaption>{block.caption}</figcaption> : null}
        </figure>
      );
    case 'cta':
      return (
        <div className="rb-article-cta">
          <p>{block.text}</p>
          <Button href={block.href} variant="primary">
            {block.label}
          </Button>
        </div>
      );
    default:
      return null;
  }
}

export default function ArticlePage() {
  const { slug } = useParams();
  const article = findArticle(slug);

  useEffect(() => {
    if (!article) return undefined;
    const seo = article.seo || {};
    const keywords = Array.isArray(seo.keywords) ? seo.keywords : [];
    return applySeo({
      title: seo.title || article.title,
      description: seo.description || article.excerpt,
      keywords,
      image: article.image,
      path: articleUrl(article),
      published: article.isoDate,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: seo.description || article.excerpt,
        image: `${window.location.origin}${article.image}`,
        datePublished: article.isoDate,
        inLanguage: 'fa-IR',
        articleSection: article.category,
        keywords: keywords.join('، '),
        publisher: { '@type': 'Organization', name: 'آراتان' },
      },
    });
  }, [article]);

  if (!article) return <NotFoundPage />;

  return (
    <PageSection>
      <PageHeading title="مقالات" subtitle="Weblog" icon="luxina-icon-book-line" />
      <article className="rb-article">
        <header className="rb-article-header">
          <div className="rb-article-meta">
            <span className="rb-detail-badge">{article.category}</span>
            <time dateTime={article.isoDate}>{article.dateLabel}</time>
            <span className="rb-article-meta-sep" aria-hidden="true" />
            <span>{article.readingTime} مطالعه</span>
          </div>
          <h1 className="rb-detail-title">{article.title}</h1>
        </header>
        <figure className="rb-article-media">
          <img src={article.image} alt={article.imageAlt} />
        </figure>
        <div className="rb-article-text">
          {article.body.map((block, index) => (
            <Block block={block} key={`${block.type}-${index}`} />
          ))}
        </div>
        <div className="rb-detail-actions">
          <Button href="/blog" variant="gray">
            همه مقالات
          </Button>
        </div>
      </article>
      <RelatedArticles current={article} />
    </PageSection>
  );
}
