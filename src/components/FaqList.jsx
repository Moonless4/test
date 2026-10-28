import { useState } from 'react';
import { site } from '../content/site.js';

// The theme's FAQ accordion, driven by React state instead of the imperative
// script the reference page used. The questions come from the admin panel.
export default function FaqList() {
  const [open, setOpen] = useState(0);
  const items = site.faqs || [];

  return (
    <dl className="luxina_faq_container">
      {items.map((item, index) => {
        const expanded = index === open;
        return (
          <div key={`${item.question}-${index}`} className={`luxina_faq_item${expanded ? ' first_expanded expanded' : ''}`}>
            <dt
              className="luxina_faq_item_head"
              role="button"
              tabIndex={0}
              aria-expanded={expanded}
              onClick={() => setOpen(expanded ? -1 : index)}
              onKeyDown={(event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                setOpen(expanded ? -1 : index);
              }}
            >
              <i className="luxina-icon-question-mark luxina_faq_item_head_icon hide-mobile" aria-hidden="true" />
              <span className="luxina_faq_item_question">{item.question}</span>
              <i className="luxina-icon-arrow-down-s-line luxina_faq_item_arrow_icon" aria-hidden="true" />
            </dt>
            <dd className="luxina_faq_item_answer">
              <div>
                <p>{item.answer}</p>
              </div>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
