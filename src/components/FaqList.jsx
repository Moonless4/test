import { useState } from 'react';

// The theme's FAQ accordion, driven by React state instead of the imperative
// script the reference page used. The theme's classes still do the styling.
export const FAQ_ITEMS = [
  {
    question: 'آراتان چه پروژه‌هایی را می‌پذیرد؟',
    answer:
      'از طراحی داخلی یک آپارتمان تا ساخت ویلای لوکس، بازسازی خانهٔ قدیمی و تدوین نقشه‌های اجرایی. مقیاس پروژه تعیین‌کننده نیست؛ سطح دقت در اجرا تعیین‌کننده است.',
  },
  {
    question: 'پیش از شروع، مشاوره و برآورد هزینه انجام می‌شود؟',
    answer:
      'بله. در جلسهٔ اول نیاز، متراژ و بازهٔ بودجه را مرور می‌کنیم و پیش از قرارداد، برآورد شفاف زمان و هزینه را دریافت می‌کنید؛ بنابراین تصمیم بعدی روی اطلاعات روشن گرفته می‌شود.',
  },
  {
    question: 'طرح بر اساس سلیقهٔ من شکل می‌گیرد؟',
    answer:
      'طرح از سبک زندگی شما شروع می‌شود، نه از یک قالب آماده. معمار ما مسیر حرکت روزانه، نور و اولویت‌های شما را می‌بیند و طرح تا تأیید نهایی در اختیار شماست.',
  },
];

export default function FaqList() {
  const [open, setOpen] = useState(0);

  return (
    <dl className="luxina_faq_container">
      {FAQ_ITEMS.map((item, index) => {
        const expanded = index === open;
        return (
          <div key={item.question} className={`luxina_faq_item${expanded ? ' first_expanded expanded' : ''}`}>
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
