import { latestProducts } from '../data/content.js';
import StripFoodCard from './StripFoodCard.jsx';
import SectionHeading from './SectionHeading.jsx';
import Icon from './Icons.jsx';

export default function NewestMenu({ products, onOpen, onAdd, onViewAll }) {
  const items = latestProducts
    .map((id) => products.find((product) => product.id === id))
    .filter(Boolean);

  return (
    <section className="newest-menu section" aria-labelledby="newest-menu-title">
      <div className="container">
        <div id="newest-menu-title">
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

        <div className="strip-grid">
          {items.map((product) => (
            <StripFoodCard key={product.id} product={product} onAdd={onAdd} onOpen={onOpen} />
          ))}
        </div>
      </div>
    </section>
  );
}
