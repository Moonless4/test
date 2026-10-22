// Blog card using the theme's post-card markup (`posts-style-3`).
export default function PostCard({ article }) {
  const title = article.cardTitle || article.title;
  return (
    <article className="post luxina_post_wrap">
      <a href={`/blog/${article.slug}`} title={title} className="luxina_post_inner post-style-3">
        <div className="luxina_post_thumbnail-wrap">
          <figure className="post-thumbnail">
            <img
              loading="lazy"
              decoding="async"
              width="800"
              height="600"
              src={article.image}
              className="attachment-post-thumbnail size-post-thumbnail wp-post-image"
              alt={article.imageAlt || title}
            />
          </figure>
          <span className="luxina_post_category">{article.category}</span>
        </div>

        <div className="luxina_post_content">
          <span className="luxina_post_content-bg post-card-shape" aria-hidden="true" />
          <span className="luxina_post_category">{article.category}</span>
          <h2 className="luxina_post_title post-title line-clamp line-clamp-1">{title}</h2>
          <span className="luxina_post_subtitle rb-post-excerpt">{article.excerpt}</span>
          <span className="rb-post-meta">
            <span>{article.category}</span>
            <span aria-hidden="true" className="rb-post-meta-dot" />
            <time dateTime={article.isoDate}>{article.dateLabel}</time>
            <span aria-hidden="true" className="rb-post-meta-dot" />
            <span>{article.readingTime}</span>
          </span>
          <i className="luxina-icon-arrow-left-line luxina_post_icon" aria-hidden="true" />
          <div className="luxina_post_read_more-button post-card-button-shape">مطالعه</div>
        </div>
      </a>
    </article>
  );
}
