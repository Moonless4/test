import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { SEO_TABS } from '@/data/seoContent';
import { cn } from '@/lib/utils';

/** معرفی کوتاه سرویس‌ها — تب‌های متنی در انتهای صفحه‌ی خانه */
export function SeoContent() {
  const [active, setActive] = useState(SEO_TABS[0].key);
  const tab = SEO_TABS.find((item) => item.key === active) ?? SEO_TABS[0];

  return (
    <section className="border-y border-ink-200 bg-white py-8 sm:py-10">
      <div className="container-page">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-0.5 sm:mx-0 sm:flex-wrap sm:px-0">
          {SEO_TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setActive(item.key)}
              aria-pressed={item.key === active}
              className={cn(
                'shrink-0 rounded-full border px-3.5 py-2 text-2xs font-medium transition',
                item.key === active
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:text-ink-900',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div key={tab.key} className="mt-5 max-w-4xl animate-fade-in">
          <h2 className="text-base font-bold sm:text-lg">{tab.title}</h2>
          <div className="mt-2.5 space-y-2.5">
            {tab.paragraphs.map((paragraph, index) => (
              <p key={index} className="text-xs leading-6 text-ink-500 sm:text-sm sm:leading-7">
                {paragraph}
              </p>
            ))}
          </div>
          <Link
            to={tab.href}
            className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-brand-700 transition hover:text-brand-800"
          >
            {tab.actionLabel}
            <Icon name="chevron-left" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
