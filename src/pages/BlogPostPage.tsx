import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays } from 'lucide-react';
import { usePost, usePosts } from '../hooks/useContent';
import { SectionError, SectionLoading } from '../components/ui/SectionState';
import EmptyState from '../components/ui/EmptyState';
import Reveal from '../components/ui/Reveal';

/** Single blog article with its remaining posts below. */
export default function BlogPostPage() {
  const { id } = useParams<{ id: string }>();
  // The API resolves the post by slug; a draft and a missing slug are the same 404.
  const { data: post, error, reload } = usePost(id ?? '');
  const { data: more } = usePosts({ perPage: 4 });

  if (error) {
    return (
      <div className="container py-10 sm:py-16">
        {error.status === 404 ? (
          <EmptyState
            icon={<ArrowRight className="h-7 w-7" />}
            title="این مقاله پیدا نشد"
            text="ممکن است نشانی تغییر کرده باشد."
            action={
              <Link
                to="/blog"
                className="inline-flex h-11 items-center rounded-xl bg-teal-800 px-5 text-sm font-medium text-white transition-colors hover:bg-teal-700"
              >
                بازگشت به وبلاگ
              </Link>
            }
          />
        ) : (
          <SectionError error={error} onRetry={reload} />
        )}
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container py-10 sm:py-16">
        <SectionLoading label="در حال دریافت مقاله…" />
      </div>
    );
  }

  const others = (more?.posts ?? []).filter((item) => item.id !== post.id);

  return (
    <article className="container py-8 sm:py-10">
      <nav aria-label="مسیر صفحه" className="mb-5 flex items-center gap-1.5 text-[12px] text-muted">
        <Link to="/" className="transition-colors hover:text-black">
          خانه
        </Link>
        <span>/</span>
        <Link to="/blog" className="transition-colors hover:text-black">
          وبلاگ
        </Link>
        <span>/</span>
        <span className="line-clamp-1 font-medium text-ink">{post.title}</span>
      </nav>

      <header className="mx-auto max-w-3xl">
        <h1 className="text-xl font-black leading-9 text-ink sm:text-[28px] sm:leading-[2.6rem]">
          {post.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-muted">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {post.date}
          </span>
          {/* Nothing is invented for these: the API publishes neither an author nor a reading
              time, so a line with no value behind it is simply not shown. */}
          {post.readTime ? (
            <span className="flex items-center gap-1.5">{post.readTime}</span>
          ) : null}
          {post.author ? (
            <span className="flex items-center gap-1.5">{post.author}</span>
          ) : null}
        </div>
      </header>

      <div className="mx-auto mt-7 max-w-3xl overflow-hidden rounded-panel bg-cream">
        <img
          src={post.image}
          alt=""
          className="aspect-[16/9] w-full object-cover"
          loading="eager"
        />
      </div>

      <div className="mx-auto mt-8 max-w-3xl space-y-5">
        <p className="text-[14px] font-medium leading-8 text-ink">{post.excerpt}</p>
        {post.body.map((paragraph) => (
          <p key={paragraph} className="text-[13.5px] leading-8 text-muted">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="mx-auto mt-10 max-w-3xl rounded-panel border border-line bg-cream p-6 text-center">
        <p className="text-[13px] text-muted">دنبال کردن تازه‌های فصل؟</p>
        <Link
          to="/shop?sort=newest"
          className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-teal-800 px-5 text-sm font-medium text-white transition-colors hover:bg-teal-700"
        >
          مشاهده جدیدترین‌ها
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>

      <section className="mt-12 sm:mt-16">
        <h2 className="mb-6 text-lg font-bold text-ink sm:text-xl">مقالات دیگر</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {others.map((item, i) => (
            <Reveal key={item.id} delay={i * 90}>
              <Link
                to={`/blog/${item.id}`}
                className="group flex h-full flex-col overflow-hidden rounded-panel border border-line bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
              >
                <div className="aspect-[16/10] overflow-hidden bg-cream">
                  <img
                    src={item.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <span className="flex items-center gap-1.5 text-[11px] text-muted">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {item.date}
                  </span>
                  <h3 className="text-[15px] font-bold leading-7 text-ink">{item.title}</h3>
                  <span className="mt-auto flex items-center gap-1.5 pt-2 text-[13px] font-medium text-black">
                    ادامه مطلب
                    <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </article>
  );
}
