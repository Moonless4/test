import { SectionHeader } from '@/components/ui/SectionHeader';
import { ArticleCard } from '@/components/cards/ArticleCard';
import { ARTICLES } from '@/data/articles';

/** مجله‌ی سفر — چهار مطلب جمع‌وجور */
export function TravelInspiration() {
  return (
    <section className="container-page py-8 sm:py-10">
      <SectionHeader
        title="الهام‌بخش سفر"
        subtitle="راهنماها، تجربه‌نامه‌ها و معرفی مقصدها به قلم تیم سفربان"
        actionLabel="مجله‌ی گردشگری"
        actionHref="/magazine"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {ARTICLES.slice(0, 4).map((article) => (
          <ArticleCard key={article.id} article={article} variant="row" />
        ))}
      </div>
    </section>
  );
}
