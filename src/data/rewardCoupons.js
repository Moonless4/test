/* =========================================================
   Club rewards → single-use coupon codes.

   Claiming a reward spends club points and creates a coupon with
   its own code, so every reward stays in the customer's account
   until it is used:
   - «کد تخفیف» is a lucky draw: a random 10–30% off the order.
   - free drink / dessert / main dish codes only cover one unit
     from that category (the cheapest matching item in the cart).
   - the delivery code removes the delivery fee.

   Every coupon is used at most once: the first order it is
   applied to marks it with `usedAt` and its order code.
   ========================================================= */

export const REWARD_SCOPES = {
  drink: { label: 'نوشیدنی', categories: ['drink', 'hot'] },
  dessert: { label: 'دسر', categories: ['dessert'] },
  main: { label: 'غذای اصلی', exclude: ['drink', 'hot', 'dessert'] },
};

export const REWARD_CATALOG = [
  {
    id: 'rw-drink',
    title: 'نوشیدنی رایگان',
    description: 'یک نوشیدنی سرد یا گرم رایگان؛ کد فقط برای نوشیدنی',
    cost: 600,
    icon: 'cart',
    kind: 'freeItem',
    category: 'drink',
  },
  {
    id: 'rw-off',
    title: 'کد تخفیف شانسی',
    description: 'تخفیف تصادفی ۱۰ تا ۳۰ درصد روی کل سفارش',
    cost: 800,
    icon: 'sparkle',
    kind: 'percent',
  },
  {
    id: 'rw-dessert',
    title: 'دسر رایگان',
    description: 'یک دسر از انتخاب سرآشپز؛ کد فقط برای دسر',
    cost: 1200,
    icon: 'chef',
    kind: 'freeItem',
    category: 'dessert',
  },
  {
    id: 'rw-ship',
    title: 'ارسال رایگان',
    description: 'هزینه ارسال سفارش بعدی را حذف می‌کند',
    cost: 400,
    icon: 'scooter',
    kind: 'delivery',
  },
  {
    id: 'rw-main',
    title: 'غذای اصلی رایگان',
    description: 'یک غذای اصلی رایگان؛ کد فقط برای غذا',
    cost: 2500,
    icon: 'star',
    kind: 'freeItem',
    category: 'main',
  },
];

const TOKENS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_PREFIX = { percent: 'ATR', delivery: 'SHP', drink: 'DRK', dessert: 'DSR', main: 'FOD' };

const token = (size) =>
  Array.from({ length: size }, () => TOKENS[Math.floor(Math.random() * TOKENS.length)]).join('');

/* The discount reward is a lucky draw: 10% to 30% in 5% steps */
export const randomPercent = () => 10 + Math.floor(Math.random() * 5) * 5;

export const createCoupon = (reward, claimedAt = new Date().toISOString()) => {
  const base = {
    id: `cp-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    rewardId: reward.id,
    title: reward.title,
    kind: reward.kind,
    category: reward.category || null,
    claimedAt,
    usedAt: null,
    orderCode: null,
  };

  if (reward.kind === 'percent') {
    const percent = randomPercent();
    return { ...base, percent, code: `${CODE_PREFIX.percent}${percent}-${token(4)}` };
  }

  const key = reward.kind === 'freeItem' ? reward.category : 'delivery';
  return { ...base, percent: 0, code: `${CODE_PREFIX[key]}-${token(4)}` };
};

/* Cart lines look like { product: { id, name, price, category }, qty } */
export const cartSubtotal = (items = []) =>
  items.reduce((sum, item) => sum + item.product.price * item.qty, 0);

export const matchesRewardCategory = (rewardCategory, product) => {
  const scope = REWARD_SCOPES[rewardCategory];
  if (!scope) return true;
  const category = product?.category || '';
  if (scope.categories) return scope.categories.includes(category);
  return !scope.exclude.includes(category);
};

export const couponLabel = (coupon) => {
  if (!coupon) return '';
  if (coupon.kind === 'percent') return `${coupon.percent.toLocaleString('fa-IR')}٪ تخفیف سفارش`;
  if (coupon.kind === 'delivery') return 'ارسال رایگان';
  return `${REWARD_SCOPES[coupon.category]?.label || 'آیتم'} رایگان`;
};

/* One free-item coupon covers exactly one unit: the cheapest matching item */
export const couponDiscount = (coupon, items = [], deliveryFee = 0) => {
  if (!coupon || coupon.usedAt) return 0;

  if (coupon.kind === 'percent') {
    return Math.round((cartSubtotal(items) * coupon.percent) / 100);
  }
  if (coupon.kind === 'delivery') {
    return Math.max(0, deliveryFee || 0);
  }
  if (coupon.kind === 'freeItem') {
    const prices = items
      .filter((item) => item.qty > 0 && matchesRewardCategory(coupon.category, item.product))
      .map((item) => item.product.price);
    return prices.length ? Math.min(...prices) : 0;
  }
  return 0;
};

/* Empty string means the coupon can be applied to this cart */
export const couponProblem = (coupon, items = [], deliveryFee = 0) => {
  if (!coupon) return 'این کد جایزه پیدا نشد.';
  if (coupon.usedAt) return 'این کد قبلاً استفاده شده است.';

  if (coupon.kind === 'percent' && cartSubtotal(items) <= 0) return 'سبد خرید شما خالی است.';
  if (coupon.kind === 'delivery' && !deliveryFee) {
    return 'ارسال این سفارش رایگان است؛ کد ارسال روی آن اعمال نمی‌شود.';
  }
  if (
    coupon.kind === 'freeItem' &&
    !items.some((item) => item.qty > 0 && matchesRewardCategory(coupon.category, item.product))
  ) {
    return `این کد فقط برای ${REWARD_SCOPES[coupon.category]?.label || 'این دسته'} است؛ آیتمی از این دسته در سبد ندارید.`;
  }
  return '';
};

export const markCouponUsed = (coupons = [], code, orderCode = null, usedAt = new Date().toISOString()) =>
  coupons.map((coupon) =>
    coupon.code === code && !coupon.usedAt ? { ...coupon, usedAt, orderCode } : coupon
  );

/* The rewards page hands a chosen code over to the cart page */
const PENDING_KEY = 'atrin-pending-coupon';

export const setPendingCoupon = (code) => {
  try {
    localStorage.setItem(PENDING_KEY, code);
  } catch {
    /* storage can be unavailable in private mode */
  }
};

export const takePendingCoupon = () => {
  try {
    const code = localStorage.getItem(PENDING_KEY);
    if (code) localStorage.removeItem(PENDING_KEY);
    return code || '';
  } catch {
    return '';
  }
};
