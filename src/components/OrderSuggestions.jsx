import { products } from '../data/content.js';
import { formatPrice } from './ProductCard.jsx';
import Icon from './Icons.jsx';

const PREFERENCE = 'کنار غذای خود این‌ها را امتحان کنید';

// پیشنهاد بر اساس نوع دسته‌بندی آیتم سبد (به ترتیب اولویت نمایش):
// غذای اصلی → نوشیدنی سرد و سالاد | نوشیدنی سرد → غذا و میان‌وعده سبک
// نوشیدنی گرم → کیک و دسر | دسر → نوشیدنی گرم | پیش‌غذا → غذای اصلی و نوشیدنی سرد
const PAIRINGS = {
  pizza: ['mint-lemonade', 'caesar-salad', 'iced-peach-tea'],
  sandwich: ['mint-lemonade', 'season-salad', 'fresh-orange-juice'],
  chicken: ['fresh-orange-juice', 'season-salad', 'iced-peach-tea'],
  steak: ['mint-lemonade', 'caesar-salad', 'fresh-orange-juice'],
  pasta: ['iced-peach-tea', 'caesar-salad', 'mint-lemonade'],
  drink: ['royal-pizza', 'french-fries', 'naval-burger', 'onion-rings'],
  hot: ['chocolate-cake', 'berry-cheesecake'],
  dessert: ['naval-latte'],
  starter: ['royal-pizza', 'mint-lemonade', 'charcoal-chicken'],
};

export default function OrderSuggestions({ exclude = [], title, onAdd }) {
  const inCart = new Set(exclude);
  const cart = products.filter((product) => inCart.has(product.id));
  const categories = new Set(cart.map((product) => product.category));

  const hasStarter = categories.has('starter');
  const hasDessert = categories.has('dessert');

  const onlyIn = (...ids) => cart.length > 0 && cart.every((product) => ids.includes(product.category));

  const wanted = cart.flatMap((product) => PAIRINGS[product.category] || []);

  const items = [];
  wanted.forEach((id) => {
    const product = products.find((item) => item.id === id);
    if (!product || inCart.has(product.id)) return;
    // برای سبدی که پیش‌غذا یا دسر دارد، آیتم هم‌گروه دوباره پیشنهاد نمی‌شود
    if (hasStarter && product.category === 'starter') return;
    if (hasDessert && product.category === 'dessert') return;
    if (items.some((item) => item.id === product.id)) return;
    items.push(product);
  });

  if (items.length === 0) return null;

  let heading = PREFERENCE;
  if (onlyIn('drink')) heading = 'کنار نوشیدنی سردتان این‌ها را امتحان کنید';
  else if (onlyIn('hot')) heading = 'کنار نوشیدنی گرمتان کیک و دسر امتحان کنید';
  else if (onlyIn('dessert')) heading = 'کنار دسرتان یک نوشیدنی گرم امتحان کنید';
  else if (onlyIn('starter')) heading = 'کنار پیش‌غذایتان این غذاها را امتحان کنید';

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
