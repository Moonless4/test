import BlogSection from '../components/BlogSection.jsx';
import { posts } from '../data/content.js';

export default function BlogPage({ onOpenPost }) {
  return (
    <>
      <BlogSection items={posts} onOpenPost={onOpenPost} />
    </>
  );
}
