import { useMemo, useState } from 'react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ArticleCard } from '@/components/cards/ArticleCard';
import { StateBlock } from '@/components/ui/StateBlocks';
import { ARTICLES, MAGAZINE_CATEGORY_LIST } from '@/data/articles';
import { cn } from '@/lib/utils';
import { faDigits } from '@/lib/jalali';

export default function Magazine() {
  const [category, setCategory] = useState('همه');

  const list = useMemo(
    () => (category === 'همه' ? ARTICLES : ARTICLES.filter((article) => article.category === category)),
    [category],
  );

  const [lead, ...rest] = list;

  return (
    <div className="container-page space-y-5 py-5 sm:py-7">
      <Breadcrumbs items={[{ label: 'مجله گردشگری' }]} />

      <header className="rounded-2xl border border-ink-200 bg-white p-5 sm:p-7">
        <h1 className="text-lg font-bold text-ink-900 sm:text-2xl">مجله گردشگری سفربان</h1>
        <p className="mt-3 max-w-3xl text-xs leading-7 text-ink-500 sm:text-sm">
          راهنمای سفر، معرفی مقصدها و تجربه‌نامه‌های مسافران؛ نوشته‌شده توسط تیم محتوای سفربان و
          مسافران همکار.
        </p>
      </header>

      <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
        {MAGAZINE_CATEGORY_LIST.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={cn(
              'shrink-0 rounded-lg border px-3 py-1.5 text-2xs font-medium transition',
              category === item ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-ink-200 text-ink-600 hover:border-ink-300',
            )}
          >
            {item}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <StateBlock
          icon="info"
          title="مطلبی در این دسته منتشر نشده است"
          description="به‌زودی مطالب تازه‌ای در این دسته‌بندی منتشر می‌شود. دسته‌ی دیگری را انتخاب کنید."
        />
      ) : (
        <>
          {lead && (
            <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
              <ArticleCard article={lead} variant="tall" className="lg:h-full" />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {rest.slice(0, 2).map((article) => (
                  <ArticleCard key={article.id} article={article} variant="row" />
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.slice(3).map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          <p className="num rounded-xl border border-ink-200 bg-white px-4 py-3 text-2xs text-ink-500">
            {faDigits(list.length)} مطلب در دسته‌ی «{category}» — به‌روزرسانی هفتگی
          </p>
        </>
      )}
    </div>
  );
}
