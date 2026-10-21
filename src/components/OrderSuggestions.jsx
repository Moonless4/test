import { products } from '../data/content.js';
import { formatPrice } from './ProductCard.jsx';
import Icon from './Icons.jsx';

const suggestionCategories = ['drink', 'hot', 'starter'];

// پیشنهاد نوشیدنی و پیش‌غذا کنار غذای انتخاب‌شده.
export default function OrderSuggestions({ exclude = [], title = 'کنار غذای خود این‌ها را امتحان کنید', onAdd }) {
  const available = products
    .filter((product) => suggestionCategories.includes(product.category))
    .filter((product) => !exclude.includes(product.id));

  const drinks = available.filter((product) => product.category === 'drink' || product.category === 'hot').slice(0, 2);
  const starters = available.filter((product) => product.category === 'starter').slice(0, 1);
  const items = [...drinks, ...starters].slice(0, 3);

  if (items.length === 0) return null;

  return (
    <section className="order-suggest" aria-label="پیشنهاد نوشیدنی و پیش غذا">
      <header className="order-suggest__head">
        <h3>{title}</h3>
        <span>پیشنهاد سرآشپز</span>
      </header>
      <ul className="order-suggest__list">
        {items.map((item) => (
          <li className="order-suggest__item" key={item.id}>
            <img src={item.image} alt={item.name} loading="lazy" />
            <div className="order-suggest__copy">
              <b>{item.name}</b>
              <small>
                {item.categoryLabel} · {formatPrice(item.price)} تومان
              </small>
            </div>
            <button
              type="button"
              className="order-suggest__add"
              onClick={() => onAdd(item)}
              aria-label={`افزودن ${item.name} به سبد خرید`}
            >
              <Icon name="plus" size={15} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
