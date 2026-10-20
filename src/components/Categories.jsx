import { useRef } from 'react';
import { categories } from '../data/content.js';
import Icon from './Icons.jsx';

export default function Categories({ onCategory }) {
  const trackRef = useRef(null);

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * -260, behavior: 'smooth' });
  };

  return (
    <section className="categories" aria-label="دسته‌بندی غذاها">
      <div className="container categories__inner">
        <button type="button" className="round-arrow round-arrow--soft categories__arrow" onClick={() => scroll(-1)} aria-label="دسته بعدی">
          <Icon name="chevronLeft" size={19} />
        </button>

        <div className="category-track" ref={trackRef}>
          {categories.map((cat) => (
            <button
              type="button"
              key={cat.id}
              className="category-card"
              onClick={() => onCategory(cat.id)}
            >
              <span className="category-card__icon">
                <img src={cat.icon} alt="" loading="lazy" />
              </span>
              <span className="category-card__title">{cat.title}</span>
              <span className="category-card__hint">مشاهده غذاها</span>
            </button>
          ))}
        </div>

        <button type="button" className="round-arrow round-arrow--soft categories__arrow" onClick={() => scroll(1)} aria-label="دسته قبلی">
          <Icon name="chevronRight" size={19} />
        </button>
      </div>
    </section>
  );
}
