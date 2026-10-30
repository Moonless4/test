import { useEffect, useState } from 'react';
import { useRouter } from '../router.jsx';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import Icon from '../components/Icons.jsx';
import { formatPrice } from '../components/ProductCard.jsx';
import OrderSuggestions from '../components/OrderSuggestions.jsx';
import { addOrder } from '../data/records.js';
import { useAccount } from '../account/AccountContext.jsx';
import { fa } from '../data/account.js';
import { isValidPhone, normalizePhone } from '../lib/phone.js';

const deliveryFee = 35000;
const freeDeliveryFrom = 500000;
/* Club points: each point is 100 تومان off, and every 10,000 تومان of food earns 10 points */
const POINT_VALUE = 100;
const ORDER_STEP = 10000;
const POINTS_PER_ORDER = 10;

const STEPS = [
  { key: 1, title: 'سبد خرید', hint: 'انتخاب غذاها' },
  { key: 2, title: 'اطلاعات تحویل', hint: 'آدرس و زمان' },
  { key: 3, title: 'پرداخت', hint: 'روش پرداخت' },
  { key: 4, title: 'تأیید سفارش', hint: 'ثبت نهایی' },
];

export default function CartPage({ items, onQty, onRemove, onAdd, onComplete }) {
  const { navigate } = useRouter();
  const { isAuthenticated, user, loyalty, login, register, spendPoints, earnPoints } = useAccount();
  const [step, setStep] = useState(1);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    time: 'asap',
    payment: 'online',
  });
  const [account, setAccount] = useState({ name: '', phone: '', password: '' });
  const [accountMode, setAccountMode] = useState('register');
  const [accountError, setAccountError] = useState('');
  const [usePoints, setUsePoints] = useState(false);
  const [pointsInput, setPointsInput] = useState(0);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const delivery = subtotal === 0 || subtotal >= freeDeliveryFrom ? 0 : deliveryFee;
  const maxUsablePoints = isAuthenticated
    ? Math.min(loyalty.points, Math.floor(subtotal / POINT_VALUE))
    : 0;
  const pointsUsed = usePoints ? Math.min(Math.max(0, pointsInput), maxUsablePoints) : 0;
  const pointsDiscount = pointsUsed * POINT_VALUE;
  const total = subtotal + delivery - pointsDiscount;
  const count = items.reduce((sum, item) => sum + item.qty, 0);

  useEffect(() => {
    if (!order && items.length === 0) setStep(1);
  }, [items.length, order]);

  /* A signed-in customer doesn't retype what the account already knows */
  useEffect(() => {
    if (!isAuthenticated) return;
    setForm((prev) => ({
      ...prev,
      name: prev.name || [user.firstName, user.lastName].filter(Boolean).join(' '),
      /* The account key may be an email, which must never land in the phone field */
      phone: prev.phone || (isValidPhone(user.phone) ? user.phone : ''),
    }));
  }, [isAuthenticated, user.firstName, user.lastName, user.phone]);

  const update = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
    setError('');
  };

  const updatePhone = (event) => {
    setForm((prev) => ({ ...prev, phone: normalizePhone(event.target.value) }));
    setError('');
  };

  const updateAccount = (key) => (event) => {
    const value = key === 'phone' ? normalizePhone(event.target.value) : event.target.value;
    setAccount((prev) => ({ ...prev, [key]: value }));
    setAccountError('');
  };

  const validateDelivery = () => {
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      setError('لطفاً نام، شماره تماس و آدرس را کامل کنید.');
      return false;
    }
    if (!isValidPhone(form.phone)) {
      setError('شماره موبایل را در قالب ۰۹۱۲۳۴۵۶۷۸۹ وارد کنید.');
      return false;
    }
    setError('');
    return true;
  };

  /* Before the payment steps a signed-out customer gets an account or signs in */
  const createAccountAndContinue = () => {
    const name = account.name.trim();
    const phone = account.phone.trim();
    if (!name) {
      setAccountError('نام و نام خانوادگی را وارد کنید.');
      return;
    }
    if (!isValidPhone(phone)) {
      setAccountError('شماره موبایل را در قالب ۰۹۱۲۳۴۵۶۷۸۹ وارد کنید.');
      return;
    }
    if (account.password.length < 6) {
      setAccountError('رمز عبور باید حداقل ۶ کاراکتر باشد.');
      return;
    }
    const result = register({ name, identifier: phone });
    if (!result.ok) {
      setAccountMode('login');
      setAccountError('این شماره قبلاً ثبت‌نام کرده است؛ رمز عبور خود را وارد کنید تا وارد شوید.');
      return;
    }
    setAccountError('');
    setForm((prev) => ({ ...prev, name, phone }));
    setStep(2);
  };

  const signInAndContinue = () => {
    const phone = account.phone.trim();
    if (!isValidPhone(phone)) {
      setAccountError('شماره موبایل را در قالب ۰۹۱۲۳۴۵۶۷۸۹ وارد کنید.');
      return;
    }
    if (account.password.length < 6) {
      setAccountError('رمز عبور باید حداقل ۶ کاراکتر باشد.');
      return;
    }
    login({ identifier: phone });
    setAccountError('');
    setForm((prev) => ({ ...prev, phone }));
    setStep(2);
  };

  const handleAccountContinue = () =>
    accountMode === 'login' ? signInAndContinue() : createAccountAndContinue();

  const nameField = (
    <label>
      <span>نام و نام خانوادگی</span>
      <input value={account.name} onChange={updateAccount('name')} placeholder="نام شما" />
    </label>
  );

  const phoneField = (
    <label>
      <span>شماره موبایل</span>
      <input
        value={account.phone}
        onChange={updateAccount('phone')}
        placeholder="۰۹۱۲۳۴۵۶۷۸۹"
        inputMode="tel"
        dir="ltr"
      />
    </label>
  );

  const passwordField = (
    <label>
      <span>رمز عبور</span>
      <input
        type="password"
        value={account.password}
        onChange={updateAccount('password')}
        placeholder="حداقل ۶ کاراکتر"
      />
    </label>
  );

  const goStep = (key) => {
    if (key >= step) return;
    setError('');
    setStep(key);
  };

  const submit = () => {
    if (!isAuthenticated) {
      setAccountError('برای ثبت سفارش ابتدا حساب کاربری خود را بسازید یا وارد شوید.');
      setError('');
      setStep(1);
      return;
    }
    if (!validateDelivery()) {
      setStep(2);
      return;
    }
    const code = `NW-${Math.floor(100000 + Math.random() * 900000)}`;
    const payment = form.payment === 'online' ? 'پرداخت آنلاین' : 'پرداخت در محل';
    const time = form.time === 'asap' ? 'در اولین فرصت' : form.time;

    addOrder({
      code,
      total,
      subtotal,
      delivery,
      discount: pointsDiscount,
      pointsUsed,
      count,
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      payment,
      time,
      items: items.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        qty: item.qty,
      })),
    });

    if (pointsUsed > 0) spendPoints(pointsUsed, `استفاده از امتیاز در سفارش ${code}`);
    const pointsEarned = Math.floor(subtotal / ORDER_STEP) * POINTS_PER_ORDER;
    if (pointsEarned > 0) earnPoints(pointsEarned, `امتیاز سفارش ${code}`);

    setOrder({ code, total, count, name: form.name.trim(), payment, time, pointsEarned });
    setError('');
    setStep(4);
    onComplete();
  };

  const done = (key) => Boolean(order) || step > key;

  return (
    <section className="page-section cart-page">
      <div className="container">
        <Breadcrumbs items={[{ label: 'سبد خرید' }]} />

        <div className="cart-page__head">
          <div>
            <h1>تکمیل سفارش</h1>
            <p>سبد خرید، اطلاعات تحویل و پرداخت را در همین صفحه و مرحله‌به‌مرحله کامل کنید.</p>
          </div>
          <span className="cart-page__badge">
            <Icon name="shield" size={16} />
            پرداخت امن
          </span>
        </div>

        <ol className="cart-steps">
          {STEPS.map((entry) => (
            <li key={entry.key}>
              <button
                type="button"
                className={`cart-step ${step === entry.key && !order ? 'is-active' : ''} ${
                  done(entry.key) ? 'is-done' : ''
                }`}
                onClick={() => goStep(entry.key)}
                disabled={entry.key >= step || Boolean(order)}
                aria-current={step === entry.key && !order ? 'step' : undefined}
              >
                <span className="cart-step__num">
                  {done(entry.key) ? (
                    <Icon name="check" size={15} />
                  ) : (
                    entry.key.toLocaleString('fa-IR')
                  )}
                </span>
                <span className="cart-step__copy">
                  <b>{entry.title}</b>
                  <small>{entry.hint}</small>
                </span>
              </button>
            </li>
          ))}
        </ol>

        {order ? (
          <div className="cart-page__card order-success cart-success">
            <span className="order-success__icon">
              <Icon name="check" size={38} />
            </span>
            <h2>سفارش شما ثبت شد!</h2>
            <p>
              {order.name} عزیز، سفارش شما با کد <b dir="ltr">{order.code}</b> ثبت شد و به‌زودی برای
              هماهنگی با شما تماس می‌گیریم.
            </p>
            <div className="order-success__summary">
              <span>
                <small>تعداد اقلام</small>
                <b>{order.count.toLocaleString('fa-IR')} عدد</b>
              </span>
              <span>
                <small>روش پرداخت</small>
                <b>{order.payment}</b>
              </span>
              <span>
                <small>زمان تحویل</small>
                <b>{order.time}</b>
              </span>
              <span>
                <small>مبلغ کل</small>
                <b>{formatPrice(order.total)} تومان</b>
              </span>
              {order.pointsEarned > 0 && (
                <span>
                  <small>امتیاز باشگاه</small>
                  <b>+{fa(order.pointsEarned)} امتیاز</b>
                </span>
              )}
            </div>
            <div className="cart-actions cart-actions--center">
              <button type="button" className="btn btn--outline" onClick={() => navigate('/menu')}>
                بازگشت به منو
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => navigate('/account/orders')}
              >
                پیگیری سفارش‌ها
                <Icon name="chevronLeft" size={18} />
              </button>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="cart-page__card cart-empty">
            <span className="cart-empty__icon">
              <Icon name="cart" size={38} />
            </span>
            <h3>سبد خرید شما خالی است</h3>
            <p>از منوی متنوع آترین، غذای دلخواهتان را انتخاب کنید.</p>
            <button type="button" className="btn btn--primary" onClick={() => navigate('/menu')}>
              مشاهده منو
              <Icon name="chevronLeft" size={18} />
            </button>
          </div>
        ) : (
          <div className="cart-page__layout">
            <div className="cart-page__main">
              {step === 1 && (
                <div className="cart-page__card">
                  <header className="cart-block__head">
                    <h2>سبد خرید شما</h2>
                    <span>{items.length.toLocaleString('fa-IR')} نوع غذا در سبد</span>
                  </header>

                  <div className="cart-lines">
                    {items.map(({ product, qty }) => (
                      <article className="cart-item" key={product.id}>
                        <span className="cart-item__media">
                          <img src={product.image} alt={product.name} loading="lazy" />
                        </span>
                        <div className="cart-item__copy">
                          <h3>{product.name}</h3>
                          <span className="cart-item__price">{formatPrice(product.price)} تومان</span>
                          <div className="qty">
                            <button
                              type="button"
                              onClick={() => onQty(product.id, qty + 1)}
                              aria-label={`افزایش تعداد ${product.name}`}
                            >
                              <Icon name="plus" size={14} />
                            </button>
                            <span>{qty.toLocaleString('fa-IR')}</span>
                            <button
                              type="button"
                              onClick={() => onQty(product.id, qty - 1)}
                              aria-label={`کاهش تعداد ${product.name}`}
                            >
                              <Icon name="minus" size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="cart-line__end">
                          <b>{formatPrice(product.price * qty)} تومان</b>
                          <button
                            type="button"
                            className="cart-item__remove"
                            onClick={() => onRemove(product.id)}
                            aria-label={`حذف ${product.name} از سبد`}
                          >
                            <Icon name="trash" size={18} />
                          </button>
                        </div>
                      </article>
                    ))}
                    <OrderSuggestions exclude={items.map((item) => item.product.id)} onAdd={onAdd} />
                  </div>

                  {!isAuthenticated && (
                    <div className="cart-account">
                      <header className="cart-account__head">
                        <span className="cart-account__icon">
                          <Icon name="user" size={17} />
                        </span>
                        <div>
                          <b>{accountMode === 'login' ? 'ورود به حساب کاربری' : 'ساخت حساب کاربری'}</b>
                          <small>
                            {accountMode === 'login'
                              ? 'برای ادامه سفارش با شماره موبایل و رمز عبور خود وارد شوید.'
                              : 'برای ادامه سفارش و ثبت اطلاعات تحویل، ابتدا حساب خود را بسازید.'}
                          </small>
                        </div>
                      </header>

                      <div className="checkout__form">
                        <div className="checkout__row">
                          {accountMode === 'register' && nameField}
                          {phoneField}
                          {accountMode === 'login' && passwordField}
                        </div>
                        {accountMode === 'register' && passwordField}
                        {accountError && (
                          <span className="form-hint form-hint--error">{accountError}</span>
                        )}
                        <button
                          type="button"
                          className="cart-account__switch"
                          onClick={() => {
                            setAccountMode(accountMode === 'login' ? 'register' : 'login');
                            setAccountError('');
                          }}
                        >
                          {accountMode === 'login'
                            ? 'حساب کاربری ندارم؛ ثبت‌نام می‌کنم'
                            : 'قبلاً حساب ساخته‌ام؛ وارد می‌شوم'}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="cart-actions">
                    <button type="button" className="btn btn--outline" onClick={() => navigate('/menu')}>
                      افزودن غذای بیشتر
                    </button>
                    <button
                      type="button"
                      className="btn btn--primary"
                      onClick={isAuthenticated ? () => setStep(2) : handleAccountContinue}
                    >
                      {isAuthenticated
                        ? 'ادامه: اطلاعات تحویل'
                        : accountMode === 'login'
                          ? 'ورود و ادامه'
                          : 'ساخت حساب و ادامه'}
                      <Icon name="chevronLeft" size={18} />
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="cart-page__card">
                  <header className="cart-block__head">
                    <h2>اطلاعات تحویل</h2>
                    <span>آدرس و زمان تحویل سفارش</span>
                  </header>

                  <div className="checkout__form">
                    <div className="checkout__row">
                      <label>
                        <span>نام و نام خانوادگی</span>
                        <input
                          value={form.name}
                          onChange={update('name')}
                          placeholder="نام گیرنده سفارش"
                        />
                      </label>
                      <label>
                        <span>شماره تماس</span>
                        <input
                          value={form.phone}
                          onChange={updatePhone}
                          placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                          inputMode="tel"
                          dir="ltr"
                        />
                      </label>
                    </div>

                    <label>
                      <span>آدرس تحویل</span>
                      <textarea
                        rows="3"
                        value={form.address}
                        onChange={update('address')}
                        placeholder="خیابان، کوچه، پلاک و واحد"
                      />
                    </label>

                    <div className="checkout__row">
                      <label>
                        <span>زمان تحویل</span>
                        <select value={form.time} onChange={update('time')}>
                          <option value="asap">در اولین فرصت</option>
                          <option value="۱۲:۳۰ تا ۱۳:۳۰">۱۲:۳۰ تا ۱۳:۳۰</option>
                          <option value="۱۹:۰۰ تا ۲۰:۰۰">۱۹:۰۰ تا ۲۰:۰۰</option>
                          <option value="۲۰:۰۰ تا ۲۱:۰۰">۲۰:۰۰ تا ۲۱:۰۰</option>
                        </select>
                      </label>
                    </div>

                    {error && <span className="form-hint form-hint--error">{error}</span>}

                    <div className="cart-actions">
                      <button
                        type="button"
                        className="btn btn--outline"
                        onClick={() => {
                          setError('');
                          setStep(1);
                        }}
                      >
                        بازگشت به سبد
                      </button>
                      <button
                        type="button"
                        className="btn btn--primary"
                        onClick={() => {
                          if (!isAuthenticated) {
                            setAccountError('برای ادامه پرداخت ابتدا حساب کاربری خود را بسازید یا وارد شوید.');
                            setError('');
                            setStep(1);
                            return;
                          }
                          if (validateDelivery()) setStep(3);
                        }}
                      >
                        ادامه: پرداخت
                        <Icon name="chevronLeft" size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="cart-page__card">
                  <header className="cart-block__head">
                    <h2>روش پرداخت</h2>
                    <span>یک روش پرداخت را انتخاب کنید</span>
                  </header>

                  <div className="cart-pay">
                    <label className={`cart-pay__option ${form.payment === 'online' ? 'is-active' : ''}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="online"
                        checked={form.payment === 'online'}
                        onChange={update('payment')}
                      />
                      <span className="cart-pay__icon">
                        <Icon name="shield" size={20} />
                      </span>
                      <span className="cart-pay__copy">
                        <b>پرداخت آنلاین</b>
                        <small>انتقال به درگاه امن بانکی</small>
                      </span>
                      <span className="cart-pay__tick">
                        <Icon name="check" size={14} />
                      </span>
                    </label>

                    <label className={`cart-pay__option ${form.payment === 'door' ? 'is-active' : ''}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="door"
                        checked={form.payment === 'door'}
                        onChange={update('payment')}
                      />
                      <span className="cart-pay__icon">
                        <Icon name="wallet" size={20} />
                      </span>
                      <span className="cart-pay__copy">
                        <b>پرداخت در محل</b>
                        <small>پرداخت نقدی یا کارتی هنگام تحویل</small>
                      </span>
                      <span className="cart-pay__tick">
                        <Icon name="check" size={14} />
                      </span>
                    </label>
                  </div>

                  <div className="cart-review">
                    <div className="cart-review__row">
                      <span>نام گیرنده</span>
                      <b>{form.name}</b>
                    </div>
                    <div className="cart-review__row">
                      <span>شماره تماس</span>
                      <b dir="ltr">{form.phone}</b>
                    </div>
                    <div className="cart-review__row">
                      <span>آدرس</span>
                      <b>{form.address}</b>
                    </div>
                    <div className="cart-review__row">
                      <span>زمان تحویل</span>
                      <b>{form.time === 'asap' ? 'در اولین فرصت' : form.time}</b>
                    </div>
                    <button type="button" className="text-link" onClick={() => setStep(2)}>
                      <Icon name="edit" size={15} />
                      ویرایش اطلاعات تحویل
                    </button>
                  </div>

                  {error && <span className="form-hint form-hint--error">{error}</span>}

                  <div className="cart-actions">
                    <button type="button" className="btn btn--outline" onClick={() => setStep(2)}>
                      بازگشت
                    </button>
                    <button type="button" className="btn btn--primary" onClick={submit}>
                      ثبت نهایی سفارش
                      <Icon name="chevronLeft" size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <aside className="cart-page__aside">
              <div className="cart-page__card cart-summary cart-summary--page">
                <h3>خلاصه سفارش</h3>
                <div>
                  <span>جمع غذاها ({count.toLocaleString('fa-IR')} عدد)</span>
                  <b>{formatPrice(subtotal)} تومان</b>
                </div>
                <div>
                  <span>هزینه ارسال</span>
                  <b>{delivery === 0 ? 'رایگان' : `${formatPrice(delivery)} تومان`}</b>
                </div>
                {pointsDiscount > 0 && (
                  <div>
                    <span>تخفیف امتیازها</span>
                    <b>−{formatPrice(pointsDiscount)} تومان</b>
                  </div>
                )}
                {subtotal < freeDeliveryFrom && (
                  <p className="cart-summary__hint">
                    <Icon name="truck" size={15} />
                    با {formatPrice(freeDeliveryFrom - subtotal)} تومان خرید بیشتر، ارسال رایگان می‌شود.
                  </p>
                )}
                {isAuthenticated && (
                  <div className="cart-points">
                    <div className="cart-points__head">
                      <span>
                        <Icon name="star" size={14} filled />
                        امتیاز باشگاه
                      </span>
                      <b>{fa(loyalty.points)} امتیاز</b>
                    </div>

                    {maxUsablePoints > 0 ? (
                      <>
                        <label className="checkline cart-points__toggle">
                          <input
                            type="checkbox"
                            checked={usePoints}
                            onChange={(event) => {
                              setUsePoints(event.target.checked);
                              setPointsInput(event.target.checked ? maxUsablePoints : 0);
                            }}
                          />
                          استفاده از امتیازها
                        </label>
                        {usePoints && (
                          <div className="cart-points__row">
                            <input
                              type="number"
                              min="0"
                              max={maxUsablePoints}
                              value={pointsUsed}
                              onChange={(event) =>
                                setPointsInput(
                                  Math.min(
                                    maxUsablePoints,
                                    Math.max(0, Number(event.target.value) || 0)
                                  )
                                )
                              }
                              aria-label="تعداد امتیاز مصرفی"
                            />
                            <button
                              type="button"
                              className="text-link"
                              onClick={() => setPointsInput(maxUsablePoints)}
                            >
                              بیشترین ({fa(maxUsablePoints)})
                            </button>
                          </div>
                        )}
                        <small className="cart-points__hint">
                          هر امتیاز {formatPrice(POINT_VALUE)} تومان تخفیف است.
                        </small>
                      </>
                    ) : (
                      <small className="cart-points__hint">
                        با هر ۱۰٬۰۰۰ تومان سفارش، ۱۰ امتیاز باشگاه بگیرید.
                      </small>
                    )}
                  </div>
                )}
                <div className="cart-summary__total">
                  <span>مبلغ قابل پرداخت</span>
                  <b>{formatPrice(total)} تومان</b>
                </div>
                <span className="cart-summary__secure">
                  <Icon name="shield" size={16} />
                  پرداخت امن و تضمین کیفیت
                </span>
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
