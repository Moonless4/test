import BlogSection from '../components/BlogSection.jsx';
import { useSite } from '../site/SiteContent.jsx';

export default function BlogPage({ onOpenPost }) {
  const { content } = useSite();

  return (
    <>
      <BlogSection items={content.posts} onOpenPost={onOpenPost} />
    </>
  );
}
