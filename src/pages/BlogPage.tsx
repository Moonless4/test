import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, CalendarDays } from 'lucide-react';
import { usePosts } from '../hooks/useContent';
import Reveal from '../components/ui/Reveal';
import SectionHeader from '../components/ui/SectionHeader';
import EmptyState from '../components/ui/EmptyState';
import { SectionError, SectionLoading } from '../components/ui/SectionState';

/** The blog, read from the API: the posts live in the admin panel, not in this file. */
export default function BlogPage() {
  const { data, loading, error, reload } = usePosts({ perPage: 9 });
  const posts = data?.posts ?? [];

  return (
    <div className="container py-8 sm:py-10">
      <nav aria-label="مسیر صفحه" className="mb-5 flex items-center gap-1.5 text-[12px] text-muted">
        <Link to="/" className="transition-colors hover:text-black">
          خانه
        </Link>
        <span>/</span>
        <span className="font-medium text-ink">وبلاگ</span>
      </nav>

      <SectionHeader
        eyebrow="مجله مدورا"
        title="وبلاگ"
        linkLabel="بازگشت به فروشگاه"
        linkTo="/shop"
      />

      {error ? <SectionError error={error} onRetry={reload} /> : null}

      {!error && loading ? <SectionLoading label="در حال دریافت مقالات…" /> : null}

      {!error && !loading && posts.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-7 w-7" />}
          title="هنوز مقاله‌ای منتشر نشده است"
          text="به‌زودی راهنماها و مقاله‌های مجله مدورا از همین صفحه منتشر می‌شود."
        />
      ) : null}

      {!error && !loading && posts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <Reveal key={post.id} delay={i * 90}>
              <Link
                to={`/blog/${post.id}`}
                className="group flex h-full flex-col overflow-hidden rounded-panel border border-line bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
              >
                <div className="aspect-[16/10] overflow-hidden bg-cream">
                  <img
                    src={post.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <span className="flex items-center gap-1.5 text-[11px] text-muted">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {post.date}
                  </span>
                  <h2 className="text-[15px] font-bold leading-7 text-ink">{post.title}</h2>
                  <p className="text-[13px] leading-7 text-muted">{post.excerpt}</p>
                  <span className="mt-auto flex items-center justify-between gap-1.5 pt-2 text-[13px] font-medium text-black">
                    <span className="flex items-center gap-1.5">
                      ادامه مطلب
                      <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                    </span>
                    <span className="text-[11.5px] font-normal text-muted">{post.readTime}</span>
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      ) : null}
    </div>
  );
}
