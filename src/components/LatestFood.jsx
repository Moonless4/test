import { latestProducts } from '../data/content.js';
import FoodCard from './FoodCard.jsx';
import SectionHeading from './SectionHeading.jsx';
import Icon from './Icons.jsx';

export default function LatestFood({ products, onOpen, onAdd, onViewAll }) {
  const items = latestProducts
    .map((id) => products.find((product) => product.id === id))
    .filter(Boolean);

  return (
    <section className="latest section" aria-labelledby="latest-title">
      <div className="container">
        <div id="latest-title">
          <SectionHeading icon="leaf" title="جدیدترین غذاهای منو ما" script="Latests Food">
            <div className="latest__nav" aria-hidden="true">
              <span className="latest__arrow">
                <Icon name="chevronRight" size={16} />
              </span>
              <span className="latest__arrow">
                <Icon name="chevronLeft" size={16} />
              </span>
            </div>
            {onViewAll && (
              <button type="button" className="text-link text-link--button" onClick={onViewAll}>
                مشاهده همه
              </button>
            )}
          </SectionHeading>
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
