import Icon from './Icons.jsx';

/* Sidebar of the blog article page: the same-category articles first, then a
   short "suggested" list of whatever else is published. */
const PostItem = ({ post, onOpenPost }) => (
  <li>
    <button
      type="button"
      className="aside-post"
      onClick={() => onOpenPost(post)}
      aria-label={`خواندن مقاله ${post.title}`}
    >
      <img src={post.image} alt="" loading="lazy" />
      <span className="aside-post__text">
        <span className="aside-post__cat">{post.category}</span>
        <strong className="aside-post__title">{post.title}</strong>
        <span className="aside-post__meta">
          <Icon name="clock" size={12} />
          {post.readTime}
        </span>
      </span>
    </button>
  </li>
);

export default function RelatedPosts({ post, posts, onOpenPost }) {
  const others = posts.filter((item) => item.id !== post.id);
  const related = others.filter((item) => item.category === post.category).slice(0, 3);
  const suggested = others.filter((item) => !related.includes(item)).slice(0, 3);

  if (!related.length && !suggested.length) return null;

  return (
    <aside className="article-aside" aria-label="مقالات مرتبط و پیشنهادی">
      {related.length > 0 && (
        <section className="aside-card">
          <h2 className="aside-card__title">مقالات مرتبط</h2>
          <ul className="aside-list">
            {related.map((item) => (
              <PostItem key={item.id} post={item} onOpenPost={onOpenPost} />
            ))}
          </ul>
        </section>
      )}

      {suggested.length > 0 && (
        <section className="aside-card">
          <h2 className="aside-card__title">پیشنهاد آترین</h2>
          <ul className="aside-list">
            {suggested.map((item) => (
              <PostItem key={item.id} post={item} onOpenPost={onOpenPost} />
            ))}
          </ul>
        </section>
      )}
    </aside>
  );
}
