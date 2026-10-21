import { useParams } from 'react-router-dom';
import PageSection from '../components/PageSection.jsx';
import PageHeading from '../components/PageHeading.jsx';
import Button from '../components/Button.jsx';
import { articles, findArticle } from '../content/articles.js';
import NotFoundPage from './NotFoundPage.jsx';

function RelatedArticles({ current }) {
  const items = articles.filter((article) => article.slug !== current.slug);
  if (!items.length) return null;
  return (
    <div className="rb-related">
      {items.map((article) => (
        <a className="rb-related-card" href={`/blog/${article.slug}`} key={article.slug}>
          <img src={article.image} alt={article.title} loading="lazy" />
          <span className="rb-related-card-body">
            <span className="rb-related-card-cat">{article.category}</span>
            <span className="rb-related-card-title">{article.title}</span>
          </span>
        </a>
      ))}
    </div>
  );
}

export default function ArticlePage() {
  const { slug } = useParams();
  const article = findArticle(slug);

  if (!article) return <NotFoundPage />;

  return (
    <PageSection>
      <PageHeading title="مقالات" subtitle="Weblog" icon="luxina-icon-book-line" />
      <article className="rb-article">
        <figure className="rb-article-media">
          <img src={article.image} alt={article.title} />
        </figure>
        <div className="rb-article-meta">
          <span className="rb-detail-badge">{article.category}</span>
        </div>
        <h1 className="rb-detail-title">{article.title}</h1>
        <div className="rb-article-text">
          {article.body.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>
        <ul className="rb-article-list">
          {article.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        <div className="rb-detail-actions">
          <Button href="/consultation" variant="primary">
            درخواست مشاوره
          </Button>
          <Button href="/blog" variant="gray">
            همه مقالات
          </Button>
        </div>
      </article>
      <RelatedArticles current={article} />
    </PageSection>
  );
}
