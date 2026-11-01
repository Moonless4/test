import { useState } from 'react';
import { useSite } from '../site/SiteContent.jsx';
import ProductCard from './ProductCard.jsx';
import SectionHeading from './SectionHeading.jsx';
import Icon from './Icons.jsx';
import { commentRatingsByTarget } from '../data/comments.js';
import { productRating, productReviewCount } from '../data/productRatings.js';

const RATING_FILTERS = [
  { value: 0, title: 'همه امتیازها' },
  { value: 4.5, title: '۴٫۵ و بالاتر' },
  { value: 4, title: '۴ و بالاتر' },
  { value: 3.5, title: '۳٫۵ و بالاتر' },
];

export default function ProductGrid({ filter, onFilter, onAdd, onOpen, onViewAll }) {
  const { content } = useSite();
  const { menuFilters, products } = content;
  const [minRating, setMinRating] = useState(0);
  const [reviews] = useState(() => commentRatingsByTarget('product'));

  // A dish shows the average of the star ratings customers left on its page;
  // until someone rates it, it keeps the shipped house rating.
  const ratingOf = (product) => {
    const live = reviews[product.id];
    return live && live.rated > 0
      ? { average: live.average, reviews: live.count }
      : { average: productRating(product.id), reviews: productReviewCount(product.id) };
  };

  const visible = products
    .filter((product) => filter === 'all' || product.category === filter)
    .filter((product) => minRating === 0 || ratingOf(product).average >= minRating);

  return (
    <section className="menu-section section" id="menu" aria-labelledby="menu-title">
      <div className="container">
        <div id="menu-title">
          <SectionHeading
            eyebrow="منوی رستوران"
            title="غذاها بر اساس"
            highlight="دسته‌بندی"
            script="Our Menu"
            text="از پیش‌غذاهای سبک تا استیک‌های گریل؛ هر سلیقه‌ای که داشته باشید، جای مناسبی در منوی آترین پیدا می‌کنید."
          >
            <span className="menu-count">
              {visible.length.toLocaleString('fa-IR')} <small>غذا</small>
            </span>
          </SectionHeading>
        </div>

        <div className="menu-filters" role="tablist" aria-label="فیلتر دسته‌بندی غذاها">
          {menuFilters.map((item) => (
            <button
              type="button"
              key={item.id}
              role="tab"
              aria-selected={filter === item.id}
              className={`filter-chip ${filter === item.id ? 'is-active' : ''}`}
              onClick={() => onFilter(item.id)}
            >
              {item.title}
            </button>
          ))}
        </div>

        <div className="menu-rating-filters" role="group" aria-label="فیلتر بر اساس امتیاز کاربران">
          <span className="menu-rating-filters__label">
            <Icon name="star" size={14} filled />
            امتیاز کاربران
          </span>
          {RATING_FILTERS.map((item) => (
            <button
              type="button"
              key={item.value}
              aria-pressed={minRating === item.value}
              className={`filter-chip ${minRating === item.value ? 'is-active' : ''}`}
              onClick={() => setMinRating(item.value)}
            >
              {item.title}
            </button>
          ))}
        </div>

        {visible.length > 0 ? (
          <div className="menu-grid">
            {visible.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                rating={ratingOf(product)}
                onAdd={onAdd}
                onOpen={onOpen}
              />
            ))}
          </div>
        ) : minRating > 0 ? (
          <div className="menu-empty">
            <span className="menu-empty__icon">
              <Icon name="star" size={30} />
            </span>
            <h3>غذایی با این امتیاز پیدا نشد</h3>
            <p>با حذف فیلتر امتیاز، همه غذاهای این دسته را دوباره می‌بینید.</p>
            <button type="button" className="btn btn--primary" onClick={() => setMinRating(0)}>
              حذف فیلتر امتیاز
            </button>
          </div>
        ) : (
          <div className="menu-empty">
            <span className="menu-empty__icon">
              <Icon name="fork" size={30} />
            </span>
            <h3>این دسته به‌زودی به منو اضافه می‌شود</h3>
            <p>در حال آماده‌سازی طعم‌های تازه برای این بخش هستیم. تا آن موقع، منوی کامل ما را ببینید.</p>
            <button type="button" className="btn btn--primary" onClick={onViewAll}>
              مشاهده همه غذاها
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
