import PageSection from '../components/PageSection.jsx';
import PageHeading from '../components/PageHeading.jsx';
import PostsGrid from '../components/PostsGrid.jsx';
import { articles } from '../content/articles.js';

export default function BlogPage() {
  return (
    <PageSection>
      <PageHeading title="وبلاگ" subtitle="Weblog" icon="luxina-iconbook-fill" />
      <PostsGrid articles={articles} />
    </PageSection>
  );
}
