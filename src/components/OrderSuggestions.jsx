import { products } from '../data/content.js';
import { formatPrice } from './ProductCard.jsx';
import Icon from './Icons.jsx';

const FOOD_CATEGORIES = ['pizza', 'sandwich', 'chicken', 'steak', 'pasta', 'dessert'];
const DRINK_CATEGORIES = ['drink', 'hot'];

// پیشنهاد متناسب با هر آیتم سبد: کنار غذا نوشیدنی و پیش‌غذای هم‌خوان، کنار نوشیدنی غذا.
const PAIRINGS = {
  pizza: ['mint-lemonade', 'iced-peach-tea', 'caesar-salad'],
  sandwich: ['mint-lemonade', 'onion-rings', 'fresh-orange-juice'],
  chicken: ['fresh-orange-juice', 'mint-lemonade', 'season-salad'],
  steak: ['mint-lemonade', 'mushroom-soup', 'fresh-orange-juice'],
  pasta: ['bruschetta', 'mint-lemonade', 'caesar-salad'],
  dessert: ['naval-latte', 'iced-peach-tea', 'fresh-orange-juice'],
  starter: ['mint-lemonade', 'iced-peach-tea', 'naval-latte'],
  drink: ['royal-pizza', 'naval-burger', 'charcoal-chicken'],
  hot: ['chef-pizza', 'naval-burger', 'grilled-chicken-breast'],
};

const pairFor = (items) => items.flatMap((item) => PAIRINGS[item.category] || []);

export default function OrderSuggestions({ exclude = [], title, onAdd }) {
  const inCart = new Set(exclude);
  const cart = products.filter((product) => inCart.has(product.id));
  const categories = new Set(cart.map((product) => product.category));

  const hasFood = FOOD_CATEGORIES.some((category) => categories.has(category));
  const hasStarter = categories.has('starter');
  const hasDrink = DRINK_CATEGORIES.some((category) => categories.has(category));

  const wanted = [];
  if (hasFood || hasStarter) {
    wanted.push(...pairFor(cart.filter((product) => hasFood && FOOD_CATEGORIES.includes(product.category))));
    if (hasStarter) wanted.push(...pairFor(cart.filter((product) => product.category === 'starter')));
  }
  // سبدی که فقط نوشیدنی دارد، غذای هم‌خوان پیشنهاد می‌گیرد
  if (!hasFood && !hasStarter && hasDrink) {
    wanted.push(...pairFor(cart.filter((product) => DRINK_CATEGORIES.includes(product.category))));
  }

  const items = [];
  wanted.forEach((id) => {
    const product = products.find((item) => item.id === id);
    if (!product || inCart.has(product.id)) return;
    // پیش‌غذا در سبد هست؟ پیش‌غذای دیگری پیشنهاد نشود
    if (hasStarter && product.category === 'starter') return;
    if (items.some((item) => item.id === product.id)) return;
    items.push(product);
  });

  if (items.length === 0) return null;

  const heading =
    title ||
    (hasDrink && !hasFood && !hasStarter
      ? 'کنار نوشیدنی‌تان این‌ها را امتحان کنید'
      : 'کنار غذای خود این‌ها را امتحان کنید');

  return (
    <section className="order-suggest" aria-label="پیشنهادهای متناسب با سبد خرید">
      <header className="order-suggest__head">
        <h3>{heading}</h3>
        <span>پیشنهاد سرآشپز</span>
      </header>
      <ul className="order-suggest__list">
        {items.slice(0, 3).map((item) => (
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
