import { menuFilters, products } from '../data/content.js';
import ProductCard from './ProductCard.jsx';
import SectionHeading from './SectionHeading.jsx';
import Icon from './Icons.jsx';

export default function ProductGrid({ filter, onFilter, onAdd, onOpen, onViewAll }) {
  const visible =
    filter === 'all' ? products : products.filter((product) => product.category === filter);

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

        {visible.length > 0 ? (
          <div className="menu-grid">
            {visible.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={onAdd} onOpen={onOpen} />
            ))}
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
