import PageHeading from '../PageHeading.jsx';
import Button from '../Button.jsx';
import PostsGrid from '../PostsGrid.jsx';
import { articles } from '../../content/articles.js';

// Blog band: the heading sits in a narrow column beside the two-column cards.
export default function HomeBlog() {
  return (
    <section className="hp-section hp-blog">
      <div className="hp-inner">
        <div className="hp-blog-aside">
          <PageHeading title="وبلاگ" subtitle="Weblog" icon="luxina-iconbook-fill" />
          <Button href="/blog">همه مقالات</Button>
        </div>
        <div className="hp-blog-posts">
          <PostsGrid articles={articles.slice(0, 3)} />
        </div>
      </div>
    </section>
  );
}
