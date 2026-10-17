import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { faDigits } from '@/lib/jalali';
import { cn } from '@/lib/utils';
import type { Article } from '@/types';

interface ArticleCardProps {
  article: Article;
  variant?: 'row' | 'grid' | 'tall';
  className?: string;
}

/** کارت محتوای مجله — راهنمای سفر و معرفی مقصد */
export function ArticleCard({ article, variant = 'grid', className }: ArticleCardProps) {
  if (variant === 'row') {
    return (
      <Link
        to={`/magazine/${article.slug}`}
        className={cn('group flex gap-3 rounded-xl border border-ink-200 bg-white p-3 transition hover:border-ink-300 hover:shadow-card', className)}
      >
        <img
          src={article.image}
          alt={article.title}
          loading="lazy"
          className="h-20 w-24 shrink-0 rounded-lg object-cover"
        />
        <div className="min-w-0">
          <span className="text-2xs font-medium text-brand-700">{article.category}</span>
          <h3 className="mt-1 line-clamp-2 text-xs font-bold leading-6 text-ink-900 group-hover:text-brand-700">
            {article.title}
          </h3>
          <p className="num mt-1.5 text-2xs text-ink-400">
            {article.publishedAt} · {faDigits(article.readMinutes)} دقیقه مطالعه
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/magazine/${article.slug}`}
      className={cn('group flex flex-col overflow-hidden rounded-xl border border-ink-200 bg-white transition hover:border-ink-300 hover:shadow-card', className)}
    >
      <div className={cn('overflow-hidden', variant === 'tall' ? 'h-52' : 'h-40')}>
        <img
          src={article.image}
          alt={article.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-brand-50 px-2 py-0.5 text-2xs font-medium text-brand-700">
            {article.category}
          </span>
          <span className="num text-2xs text-ink-400">{faDigits(article.readMinutes)} دقیقه مطالعه</span>
        </div>
        <h3 className="mt-2.5 line-clamp-2 text-sm font-bold leading-7 text-ink-900 group-hover:text-brand-700">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-xs leading-6 text-ink-500">{article.excerpt}</p>
        <div className="mt-auto flex items-center justify-between pt-3 text-2xs text-ink-400">
          <span>{article.author}</span>
          <span className="num">{article.publishedAt}</span>
        </div>
      </div>
    </Link>
  );
}

export function BenefitCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-ink-200 bg-white p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <div>
        <p className="text-[0.8rem] font-bold text-ink-900">{title}</p>
        <p className="mt-1 text-2xs leading-5 text-ink-500">{description}</p>
      </div>
    </div>
  );
}
