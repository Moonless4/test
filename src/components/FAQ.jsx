import { useState } from 'react';
import { faqs } from '../data/content.js';
import Icon from './Icons.jsx';

export default function FAQ() {
  const [openId, setOpenId] = useState(faqs[0].id);

  return (
    <section className="faq section" id="faq" aria-labelledby="faq-title">
      <div className="container">
        <div className="faq__head">
          <span className="section-heading__eyebrow">
            <img src="/assets/title-symbol.webp" alt="" aria-hidden="true" />
            سوالات متداول
          </span>
          <h2 id="faq-title">
            پاسخ <span className="title-highlight">سوال‌های شما</span>
          </h2>
          <p>
            اگر پاسخ سوال خود را پیدا نکردید، تیم پشتیبانی آترین هر روز از ۱۲:۰۰ تا ۲۳:۳۰ آماده
            راهنمایی شماست.
          </p>
          <a className="faq__support" href="tel:+982188776655">
            <span className="faq__support-icon">
              <Icon name="phone" size={22} />
            </span>
            <span>
              <small>تماس با پشتیبانی</small>
              <b dir="ltr">۰۲۱-۸۸۷۷۶۶۵۵</b>
            </span>
            <Icon name="chevronLeft" size={19} />
          </a>
        </div>

        <div className="faq__list">
          {faqs.map((item) => {
            const open = openId === item.id;
            return (
              <article className={`faq-item ${open ? 'is-open' : ''}`} key={item.id}>
                <button
                  type="button"
                  className="faq-item__question"
                  onClick={() => setOpenId(open ? null : item.id)}
                  aria-expanded={open}
                  aria-controls={`faq-answer-${item.id}`}
                >
                  <span>{item.question}</span>
                  <span className="faq-item__toggle" aria-hidden="true">
                    <Icon name={open ? 'minus' : 'chevronLeft'} size={18} />
                  </span>
                </button>
                <div className="faq-item__answer" id={`faq-answer-${item.id}`} role="region">
                  <div>
                    <p>{item.answer}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
