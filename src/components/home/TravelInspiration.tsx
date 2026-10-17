import { SectionHeader } from '@/components/ui/SectionHeader';
import { ArticleCard } from '@/components/cards/ArticleCard';
import { ARTICLES } from '@/data/articles';

/** مجله‌ی سفر — محتوای الهام‌بخش و راهنمای مقاصد */
export function TravelInspiration() {
  const [lead, ...rest] = ARTICLES;

  return (
    <section className="container-page py-8 sm:py-10">
      <SectionHeader
        title="الهام‌بخش سفر"
        subtitle="راهنماها، تجربه‌نامه‌ها و معرفی مقصدها به قلم تیم سفربان"
        actionLabel="مجله‌ی گردشگری"
        actionHref="/magazine"
      />

      <div className="grid gap-3 lg:grid-cols-3">
        <ArticleCard article={lead} variant="tall" className="lg:col-span-1" />
        <div className="grid gap-3 sm:grid-cols-2 lg:col-span-2">
          {rest.slice(0, 4).map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rest.slice(4, 7).map((article) => (
          <ArticleCard key={article.id} article={article} variant="row" />
        ))}
      </div>
    </section>
  );
}
