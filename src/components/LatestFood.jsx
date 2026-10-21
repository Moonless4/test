import { useState } from 'react';
import { categories, latestProducts } from '../data/content.js';
import FoodCard from './FoodCard.jsx';
import SectionHeading from './SectionHeading.jsx';
import Icon from './Icons.jsx';

export default function LatestFood({ products, onOpen, onAdd, onViewAll }) {
  const [active, setActive] = useState('all');

  const newest = latestProducts
    .map((id) => products.find((product) => product.id === id))
    .filter(Boolean);

  const pills = categories.filter((cat) => newest.some((product) => product.category === cat.id));
  const items = active === 'all' ? newest : newest.filter((product) => product.category === active);

  return (
    <section className="latest section" aria-labelledby="latest-title">
      <div className="container">
        <div id="latest-title">
          <SectionHeading
            icon="leaf"
            title={
              <>
                جدیدترین <span className="title-highlight">غذاهای</span> منو ما
              </>
            }
            script="Latests Food"
          >
            {onViewAll && (
              <button type="button" className="text-link text-link--button" onClick={onViewAll}>
                مشاهده همه
              </button>
            )}
            <div className="latest__nav" aria-hidden="true">
              <span className="latest__arrow">
                <Icon name="chevronRight" size={16} />
              </span>
              <span className="latest__arrow">
                <Icon name="chevronLeft" size={16} />
              </span>
            </div>
          </SectionHeading>
        </div>

        <div className="menu-filters latest__filters" role="tablist" aria-label="فیلتر دسته‌بندی غذاها">
          <button
            type="button"
            role="tab"
            aria-selected={active === 'all'}
            className={`filter-chip ${active === 'all' ? 'is-active' : ''}`}
            onClick={() => setActive('all')}
          >
            همه
          </button>
          {pills.map((cat) => (
            <button
              type="button"
              key={cat.id}
              role="tab"
              aria-selected={active === cat.id}
              className={`filter-chip ${active === cat.id ? 'is-active' : ''}`}
              onClick={() => setActive(cat.id)}
            >
              <img className="filter-chip__icon" src={cat.icon} alt="" loading="lazy" />
              {cat.title}
            </button>
          ))}
        </div>

        <div className="food-grid">
          {items.map((product) => (
            <FoodCard key={product.id} product={product} onAdd={onAdd} onOpen={onOpen} />
          ))}
        </div>
      </div>
    </section>
  );
}
