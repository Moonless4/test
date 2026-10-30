import { useSite } from '../site/SiteContent.jsx';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import Icon from '../components/Icons.jsx';
import RelatedPosts from '../components/RelatedPosts.jsx';
import Comments from '../components/Comments.jsx';

export default function BlogPostPage({ id, onMenu, onBlog, onOpenPost }) {
  const { content } = useSite();
  const post = content.posts.find((item) => item.id === id);

  if (!post) return null;

  return (
    <section className="page-section">
      <div className="container">
        <Breadcrumbs items={[{ label: 'وبلاگ', to: '/blog' }, { label: post.title }]} />

        <div className="article-layout">
          <article className="article-page">
            <div className="article">
              <div className="article__media">
                <img src={post.image} alt={post.title} />
                <span className="article__chip">{post.category}</span>
              </div>
              <div className="article__body">
                <div className="article__meta">
                  <span>
                    <Icon name="calendar" size={15} />
                    {post.date}
                  </span>
                  <span>
                    <Icon name="clock" size={15} />
                    {post.readTime}
                  </span>
                </div>
                <h1>{post.title}</h1>
                <p className="article__lead">{post.excerpt}</p>
                {post.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
                <div className="article__footer">
                  <button type="button" className="btn btn--primary" onClick={onMenu}>
                    مشاهده منوی غذاها
                    <Icon name="chevronLeft" size={18} />
                  </button>
                  <button type="button" className="text-link text-link--button" onClick={onBlog}>
                    همه مقالات
                    <Icon name="chevronLeft" size={16} />
                  </button>
                  <span className="article__share">
                    <Icon name="instagram" size={18} />
                    <Icon name="telegram" size={18} />
                    <Icon name="whatsapp" size={18} />
                  </span>
                </div>
              </div>
            </div>

            <Comments targetType="post" targetId={post.id} />
          </article>

          <RelatedPosts post={post} posts={content.posts} onOpenPost={onOpenPost} />
        </div>
      </div>
    </section>
  );
}
