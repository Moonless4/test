import { useState } from 'react';
import { testimonials } from '../data/content.js';
import Icon from './Icons.jsx';

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const current = testimonials[index];

  const go = (dir) => setIndex((prev) => (prev + dir + testimonials.length) % testimonials.length);

  return (
    <section className="testimonials section" aria-labelledby="testimonials-title">
      <div className="container">
        <div className="testimonials__panel">
          <img className="testimonials__pattern" src="/assets/testimonials-bg.png" alt="" aria-hidden="true" />

          <div className="testimonials__side testimonials__side--right">
            <span className="testimonials__blob" aria-hidden="true" />
            <img src="/assets/testimonial-salad.webp" alt="" loading="lazy" />
          </div>
          <div className="testimonials__side testimonials__side--left">
            <span className="testimonials__blob" aria-hidden="true" />
            <img src="/assets/testimonial-img2.webp" alt="" loading="lazy" />
          </div>

          <div className="testimonials__head">
            <span className="section-heading__eyebrow">
              <img src="/assets/title-symbol.webp" alt="" aria-hidden="true" />
              نظرات مشتریان ما
            </span>
            <h2 id="testimonials-title">
              داستان‌هایی از سر میزهای <span className="title-highlight">نوال</span>
            </h2>
          </div>

          <div className="testimonials__card">
            <span className="testimonials__quote" aria-hidden="true">
              <Icon name="quote" size={44} filled />
            </span>
            <div className="testimonials__stars" aria-label={`امتیاز ${current.rating} از ۵`}>
              {Array.from({ length: 5 }).map((_, starIndex) => (
                <Icon key={starIndex} name="star" size={17} filled={starIndex < current.rating} />
              ))}
            </div>
            <blockquote>{current.quote}</blockquote>
            <div className="testimonials__author">
              <img src={current.avatar} alt={current.name} loading="lazy" />
              <span>
                <b>{current.name}</b>
                <small>{current.role}</small>
              </span>
            </div>

            <div className="testimonials__controls">
              <button type="button" className="round-arrow round-arrow--soft" onClick={() => go(1)} aria-label="نظر قبلی">
                <Icon name="chevronRight" size={19} />
              </button>
              <div className="testimonials__avatars" role="tablist" aria-label="انتخاب نظر مشتری">
                {testimonials.map((item, itemIndex) => (
                  <button
                    type="button"
                    key={item.id}
                    role="tab"
                    aria-selected={itemIndex === index}
                    className={itemIndex === index ? 'is-active' : ''}
                    onClick={() => setIndex(itemIndex)}
                    aria-label={item.name}
                  >
                    <img src={item.avatar} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
              <button type="button" className="round-arrow round-arrow--soft" onClick={() => go(-1)} aria-label="نظر بعدی">
                <Icon name="chevronLeft" size={19} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
