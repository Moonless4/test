import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { FaqItem } from '../../lib/faq';

type Props = {
  /** Namespaces the aria ids, so several accordions can sit on one page. */
  idPrefix: string;
  items: FaqItem[];
};

/** One topic's questions, with a single answer open at a time. */
export default function FaqAccordion({ idPrefix, items }: Props) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="divide-y divide-line overflow-hidden rounded-panel border border-line bg-white">
      {items.map((item, index) => {
        const open = openIndex === index;
        const buttonId = `${idPrefix}-question-${index}`;
        const panelId = `${idPrefix}-answer-${index}`;

        return (
          <div key={item.q}>
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? -1 : index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start transition-colors hover:bg-cream/70"
              >
                <span
                  className={`text-sm font-bold leading-6 transition-colors ${
                    open ? 'text-teal-800' : 'text-ink'
                  }`}
                >
                  {item.q}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition-transform duration-300 ${
                    open ? 'rotate-180 text-teal-800' : 'text-muted'
                  }`}
                />
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={`grid transition-all duration-300 ease-out ${
                open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-[13px] leading-7 text-muted">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
