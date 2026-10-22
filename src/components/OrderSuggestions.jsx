import { products } from '../data/content.js';
import { formatPrice } from './ProductCard.jsx';
import Icon from './Icons.jsx';

const FOOD_CATEGORIES = ['pizza', 'sandwich', 'chicken', 'steak', 'pasta'];
const DRINK_CATEGORIES = ['drink', 'hot'];

// پیشنهاد متناسب با هر آیتم سبد، به ترتیب اولویت:
// کنار غذای اصلی → نوشیدنی و پیش‌غذای هم‌خوان، کنار پیش‌غذا → غذای اصلی و نوشیدنی، کنار نوشیدنی → غذا و خوراکی کنارش.
const PAIRINGS = {
  pizza: ['mint-lemonade', 'caesar-salad', 'french-fries'],
  sandwich: ['mint-lemonade', 'onion-rings', 'french-fries'],
  chicken: ['fresh-orange-juice', 'season-salad', 'french-fries'],
  steak: ['mint-lemonade', 'mushroom-soup', 'caesar-salad'],
  pasta: ['bruschetta', 'mint-lemonade', 'caesar-salad'],
  starter: ['royal-pizza', 'naval-burger', 'charcoal-chicken', 'mint-lemonade'],
  drink: ['royal-pizza', 'naval-burger', 'charcoal-chicken', 'french-fries'],
  hot: ['chef-pizza', 'naval-burger', 'grilled-chicken-breast', 'french-fries'],
};

export default function OrderSuggestions({ exclude = [], title, onAdd }) {
  const inCart = new Set(exclude);
  const cart = products.filter((product) => inCart.has(product.id));
  const categories = new Set(cart.map((product) => product.category));

  const hasFood = FOOD_CATEGORIES.some((category) => categories.has(category));
  const hasStarter = categories.has('starter');
  const hasDrink = DRINK_CATEGORIES.some((category) => categories.has(category));

  const wanted = cart.flatMap((product) => PAIRINGS[product.category] || []);

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

  let heading = 'کنار غذای خود این‌ها را امتحان کنید';
  if (!hasFood && hasStarter) heading = 'کنار پیش‌غذایتان این غذاها را امتحان کنید';
  else if (!hasFood && !hasStarter && hasDrink) heading = 'کنار نوشیدنی‌تان این‌ها را امتحان کنید';

  return (
    <section className="order-suggest" aria-label="پیشنهادهای متناسب با سبد خرید">
      <header className="order-suggest__head">
        <h3>{title || heading}</h3>
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
