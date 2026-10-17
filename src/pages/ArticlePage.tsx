import { Link, useParams } from 'react-router-dom';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ArticleCard } from '@/components/cards/ArticleCard';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { StateBlock } from '@/components/ui/StateBlocks';
import { ARTICLES } from '@/data/articles';
import { faDigits } from '@/lib/jalali';

export default function ArticlePage() {
  const { slug } = useParams();
  const article = ARTICLES.find((item) => item.slug === slug);

  if (!article) {
    return (
      <div className="container-page py-10">
        <StateBlock
          icon="info"
          title="این مطلب پیدا نشد"
          description="نشانی وارد شده معتبر نیست یا مطلب حذف شده است. فهرست مطالب مجله را ببینید."
          action={
            <Link to="/magazine">
              <Button>بازگشت به مجله</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const related = ARTICLES.filter((item) => item.id !== article.id && item.category === article.category).slice(0, 3);
  const fallbackRelated = ARTICLES.filter((item) => item.id !== article.id).slice(0, 3);
  const suggestions = related.length ? related : fallbackRelated;

  return (
    <div className="container-page space-y-5 py-5 sm:py-7">
      <Breadcrumbs items={[{ label: 'مجله گردشگری', href: '/magazine' }, { label: article.title }]} />

      <article className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div>
          <header>
            <span className="rounded-md bg-brand-50 px-2 py-1 text-2xs font-medium text-brand-700">
              {article.category}
            </span>
            <h1 className="mt-3 text-lg font-bold leading-9 text-ink-900 sm:text-2xl sm:leading-10">
              {article.title}
            </h1>
            <p className="mt-3 text-xs leading-7 text-ink-500 sm:text-sm">{article.excerpt}</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-ink-200 py-3 text-2xs text-ink-500">
              <span className="flex items-center gap-1.5">
                <Icon name="user" className="h-4 w-4 text-ink-400" />
                {article.author}
              </span>
              <span className="num flex items-center gap-1.5">
                <Icon name="clock" className="h-4 w-4 text-ink-400" />
                {faDigits(article.readMinutes)} دقیقه مطالعه
              </span>
              <span className="num flex items-center gap-1.5">
                <Icon name="calendar" className="h-4 w-4 text-ink-400" />
                {article.publishedAt}
              </span>
            </div>
          </header>

          <img
            src={article.image}
            alt={article.title}
            className="mt-5 aspect-[16/9] w-full rounded-xl object-cover"
          />

          <div className="mt-5 space-y-4">
            {article.body.map((paragraph, index) => (
              <p key={index} className="text-xs leading-8 text-ink-600 sm:text-sm sm:leading-9">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3 rounded-xl border border-ink-200 bg-white p-4">
            <p className="text-2xs leading-6 text-ink-600">
              برای سفر به این مقصد، پرواز و اقامتگاه خود را با بهترین قیمت رزرو کنید.
            </p>
            <div className="flex gap-2">
              <Link to="/flights">
                <Button size="sm" icon={<Icon name="plane" className="h-4 w-4" />}>
                  جستجوی پرواز
                </Button>
              </Link>
              <Link to="/hotels">
                <Button size="sm" variant="secondary">
                  رزرو هتل
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <aside className="space-y-3">
          <div className="rounded-xl border border-ink-200 bg-white p-4">
            <p className="text-xs font-bold text-ink-900">مطالب مرتبط</p>
            <div className="mt-3 space-y-3">
              {suggestions.map((item) => (
                <ArticleCard key={item.id} article={item} variant="row" />
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-brand-200 bg-brand-50 p-4">
            <p className="text-xs font-bold text-brand-900">پیشنهاد تخفیف برای این مقصد</p>
            <p className="mt-2 text-2xs leading-6 text-brand-800/80">
              نرخ‌های ویژه‌ی این مقصد را در صفحه‌ی پیشنهادها ببینید و با کد تخفیف رزرو کنید.
            </p>
            <Link
              to="/offers"
              className="mt-3 flex items-center gap-1 text-2xs font-medium text-brand-700"
            >
              مشاهده‌ی پیشنهادها
              <Icon name="chevron-left" className="h-3.5 w-3.5" />
            </Link>
          </div>
        </aside>
      </article>
    </div>
  );
}
