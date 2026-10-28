import PageSection from '../components/PageSection.jsx';
import PageHeading from '../components/PageHeading.jsx';
import PostsGrid from '../components/PostsGrid.jsx';
import PageMeta from '../components/PageMeta.jsx';
import { articles } from '../content/articles.js';
import { site } from '../content/site.js';

export default function BlogPage() {
  const page = site.pages?.blog || {};

  return (
    <>
      <PageMeta title={page.seoTitle} description={page.seoDescription} path="/blog" />
      <PageSection>
        <PageHeading
          title={page.title || 'وبلاگ'}
          subtitle={page.subtitle || 'Weblog'}
          icon={page.icon || 'luxina-iconbook-fill'}
        />
        {page.intro ? <p className="rb-service-intro">{page.intro}</p> : null}
        <PostsGrid articles={articles} />
      </PageSection>
    </>
  );
}
