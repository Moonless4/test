import { useState } from 'react';

// The theme's FAQ accordion, driven by React state instead of the imperative
// script the reference page used. The theme's classes still do the styling.
export const FAQ_ITEMS = [
  {
    question: 'شرکت شما چه نوع پروژه‌هایی را انجام می‌دهد؟',
    answer:
      'ما در شرکت لوکسینا با سال‌ها تجربه در زمینه طراحی، مشاوره و اجرای پروژه‌های ساختمانی، هر نوع پروژه‌ای از ویلا و ساختمان مسکونی تا مجموعه‌های تجاری، اداری و صنعتی را با بالاترین کیفیت اجرا می‌کنیم. از ایده تا کلید، همراه مطمئن شما در مسیر ساخت‌وساز هستیم.',
  },
  {
    question: 'قبل از شروع پروژه، آیا امکان مشاوره و برآورد هزینه وجود دارد؟',
    answer:
      'بله، ما باور داریم تصمیم‌گیری آگاهانه پایه یک پروژه موفق است. به همین دلیل، پیش از هر اقدامی، مشاوره تخصصی رایگان و برآورد دقیق هزینه‌ها را ارائه می‌دهیم تا با اطمینان خاطر وارد مرحله طراحی و اجرا شوید.',
  },
  {
    question: 'آیا طراحی پروژه بر اساس سلیقه و سبک دلخواه من انجام می‌شود؟',
    answer:
      'صددرصد! تیم طراحی ما با ترکیب خلاقیت، دانش فنی و جدیدترین ترندهای معماری، طرحی کاملاً اختصاصی و منحصربه‌فرد برای شما خلق می‌کند؛ طرحی که دقیقاً با نیاز، سلیقه و بودجه شما هماهنگ باشد.',
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
