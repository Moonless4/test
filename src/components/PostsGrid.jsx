import PostCard from './PostCard.jsx';

// Responsive blog grid, same widget settings as the reference page.
const SETTINGS = {
  desktop: { slider: { enabled: false }, columns: 2 },
  tablet: { slider: { enabled: false }, columns: 2 },
  mobile: { slider: { enabled: false }, columns: 1 },
};

const TRACK_STYLE = {
  '--desktop-cols': 2,
  '--desktop-gap': '24px',
  '--tablet-cols': 2,
  '--tablet-gap': '24px',
  '--mobile-cols': 1,
  '--mobile-gap': '24px',
};

export default function PostsGrid({ articles }) {
  return (
    <div
      className="luxina-slider-wrap posts-wrap desktop-columns-wrap tablet-columns-wrap mobile-columns-wrap luxina_post_items-wrap"
      data-settings={JSON.stringify(SETTINGS)}
      style={TRACK_STYLE}
    >
      <div className="list-posts wrapper desktop-columns desktop-columns-2 tablet-columns tablet-columns-2 mobile-columns mobile-columns-1 luxina_post_items posts-style-3">
        {articles.map((article) => (
          <PostCard key={article.slug} article={article} />
        ))}
      </div>
    </div>
  );
}
