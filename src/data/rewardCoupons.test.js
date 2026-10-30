import test from 'node:test';
import assert from 'node:assert/strict';
import {
  couponDiscount,
  couponLabel,
  couponProblem,
  createCoupon,
  markCouponUsed,
  randomPercent,
  REWARD_CATALOG,
} from './rewardCoupons.js';

const reward = (id) => REWARD_CATALOG.find((item) => item.id === id);

const line = (id, price, category, qty = 1) => ({ product: { id, price, category }, qty });

const cart = [
  line('royal-pizza', 320000, 'pizza'),
  line('mint-lemonade', 68000, 'drink'),
  line('hot-tea', 45000, 'hot'),
  line('cheese-cake', 95000, 'dessert'),
];

test('the discount reward draws a random 10–30% code', () => {
  for (let i = 0; i < 50; i += 1) {
    const percent = randomPercent();
    assert.ok(percent >= 10 && percent <= 30);
    assert.equal(percent % 5, 0);
  }

  const coupon = createCoupon(reward('rw-off'));
  assert.match(coupon.code, /^ATR(10|15|20|25|30)-[A-Z0-9]{4}$/);
  assert.equal(cartSubtotalOf(cart), 528000);
  assert.equal(couponDiscount(coupon, cart, 35000), Math.round((528000 * coupon.percent) / 100));
});

test('a free drink code only ever covers one drink, never other items', () => {
  const coupon = createCoupon(reward('rw-drink'));
  assert.match(coupon.code, /^DRK-[A-Z0-9]{4}$/);
  assert.equal(couponLabel(coupon), 'نوشیدنی رایگان');
  /* cheapest matching drink (tea 45,000) is the one that becomes free */
  assert.equal(couponDiscount(coupon, cart, 35000), 45000);
  assert.equal(couponProblem(coupon, cart, 35000), '');

  const foodOnly = [line('royal-pizza', 320000, 'pizza')];
  assert.equal(couponDiscount(coupon, foodOnly, 35000), 0);
  assert.match(couponProblem(coupon, foodOnly, 35000), /نوشیدنی/);
});

test('a free dessert code is limited to desserts', () => {
  const coupon = createCoupon(reward('rw-dessert'));
  assert.equal(couponDiscount(coupon, cart, 35000), 95000);
  assert.equal(couponProblem(coupon, [line('mint-lemonade', 68000, 'drink')], 35000) !== '', true);
});

test('a free main dish code ignores drinks and desserts', () => {
  const coupon = createCoupon(reward('rw-main'));
  assert.match(coupon.code, /^FOD-[A-Z0-9]{4}$/);
  assert.equal(couponDiscount(coupon, cart, 35000), 320000);
  const sweets = [line('cheese-cake', 95000, 'dessert'), line('hot-tea', 45000, 'hot')];
  assert.equal(couponDiscount(coupon, sweets, 35000), 0);
  assert.match(couponProblem(coupon, sweets, 35000), /غذای اصلی/);
});

test('the delivery code covers the delivery fee only', () => {
  const coupon = createCoupon(reward('rw-ship'));
  assert.equal(couponDiscount(coupon, cart, 35000), 35000);
  assert.equal(couponProblem(coupon, cart, 0), 'ارسال این سفارش رایگان است؛ کد ارسال روی آن اعمال نمی‌شود.');
});

test('a used coupon is retired and cannot be applied twice', () => {
  const coupon = createCoupon(reward('rw-off'));
  const coupons = markCouponUsed([coupon], coupon.code, 'NW-123456');
  const [used] = coupons;

  assert.equal(used.orderCode, 'NW-123456');
  assert.ok(used.usedAt);
  assert.equal(couponDiscount(used, cart, 35000), 0);
  assert.equal(couponProblem(used, cart, 35000), 'این کد قبلاً استفاده شده است.');
});

function cartSubtotalOf(items) {
  return items.reduce((sum, item) => sum + item.product.price * item.qty, 0);
}
