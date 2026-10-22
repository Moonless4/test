import PageHero from '../components/PageHero.jsx';
import BlogSection from '../components/BlogSection.jsx';
import { posts } from '../data/content.js';

export default function BlogPage({ onOpenPost }) {
  return (
    <>
      <PageHero
        eyebrow="وبلاگ آترین"
        title="همه"
        highlight="مقالات"
        script="From our kitchen"
        text="دستورهای آشپزی، نکات تغذیه و داستان‌های پشت صحنه رستوران آترین."
        crumbs={[{ label: 'وبلاگ' }]}
      />
      <BlogSection items={posts} onOpenPost={onOpenPost} />
    </>
  );
}
