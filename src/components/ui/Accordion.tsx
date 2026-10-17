import { useState, type ReactNode } from 'react';
import { Icon } from './Icon';
import { cn } from '@/lib/utils';
import type { FaqItem } from '@/types';

interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
}

export function Accordion({
  items,
  defaultOpenId,
  className,
}: {
  items: AccordionItem[];
  defaultOpenId?: string;
  className?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? null);

  return (
    <div className={cn('divide-y divide-ink-200 overflow-hidden rounded-xl border border-ink-200 bg-white', className)}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-4 py-4 text-start transition hover:bg-ink-50/70 sm:px-5"
            >
              <span className={cn('text-sm font-medium sm:text-[0.95rem]', isOpen ? 'text-brand-700' : 'text-ink-800')}>
                {item.title}
              </span>
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition',
                  isOpen ? 'border-brand-200 bg-brand-50 text-brand-700' : 'border-ink-200 text-ink-500',
                )}
              >
                <Icon name={isOpen ? 'minus' : 'plus'} className="h-3.5 w-3.5" />
              </span>
            </button>
            {isOpen && (
              <div className="animate-fade-in px-4 pb-5 text-sm leading-7 text-ink-600 sm:px-5 sm:pe-16">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** نسخه‌ی آماده برای پیوست‌های پرسش‌های متداول */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <Accordion
      defaultOpenId={items[0]?.id}
      items={items.map((item) => ({ id: item.id, title: item.question, content: item.answer }))}
    />
  );
}
