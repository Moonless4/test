import { useSite } from '../site/SiteContent.jsx';
import SectionHeading from './SectionHeading.jsx';
import Icon from './Icons.jsx';

export default function BlogSection({ items, onOpenPost, onViewAll }) {
  const { content } = useSite();
  const posts = items || content.posts.slice(0, 4);

  return (
    <section className="blog section" id="blog" aria-labelledby="blog-title">
      <div className="container">
        <div id="blog-title">
          <SectionHeading
            eyebrow="وبلاگ آترین"
            title="جدیدترین"
            highlight="اخبار سایت"
            script="From our kitchen"
            text="دستورهای آشپزی، نکات تغذیه و داستان‌هایی از پشت صحنه رستوران."
          >
            {onViewAll && (
              <button type="button" className="text-link text-link--button" onClick={onViewAll}>
                مشاهده همه مقالات
                <Icon name="chevronLeft" size={16} />
              </button>
            )}
          </SectionHeading>
        </div>

        <div className="blog-grid">
          {posts.map((post) => (
            <article className="blog-card" key={post.id}>
              <button
                type="button"
                className="blog-card__media"
                onClick={() => onOpenPost(post)}
                aria-label={`خواندن مقاله ${post.title}`}
              >
                <img src={post.image} alt={post.title} loading="lazy" />
                <span className="blog-card__chip">{post.category}</span>
              </button>
              <div className="blog-card__body">
                <div className="blog-card__meta">
                  <span>
                    <Icon name="calendar" size={15} />
                    {post.date}
                  </span>
                  <span>
                    <Icon name="clock" size={15} />
                    {post.readTime}
                  </span>
                </div>
                <h3>
                  <button type="button" onClick={() => onOpenPost(post)}>
                    {post.title}
                  </button>
                </h3>
                <p>{post.excerpt}</p>
                <button type="button" className="text-link text-link--button" onClick={() => onOpenPost(post)}>
                  ادامه مطلب
                  <Icon name="chevronLeft" size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
