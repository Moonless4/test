import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Coins,
  CreditCard,
  MapPin,
  PackageCheck,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import { FREE_SHIPPING_THRESHOLD, useStore } from '../context/StoreContext';
import { useAuth, type Address } from '../context/AuthContext';
import { COIN_TITLE } from '../lib/data';
import { onlyDigits, toFa } from '../lib/format';
import {
  STATUS_LABEL,
  activeGateway,
  newOrderId,
  readPayment,
  savePayment,
  type PaymentLine,
  type PaymentMethod,
  type PaymentOrder,
} from '../lib/payment';
import { recordFinishedOrder } from '../services/apiCheckout';
import RewardPanel from '../components/cart/RewardPanel';
import Price from '../components/ui/Price';
import EmptyState from '../components/ui/EmptyState';
import Img from '../components/ui/Img';
import Reveal from '../components/ui/Reveal';

const STEPS = [
  { id: 1, title: 'اطلاعات ارسال', icon: MapPin },
  { id: 2, title: 'روش ارسال', icon: Truck },
  { id: 3, title: 'روش پرداخت', icon: CreditCard },
  { id: 4, title: 'تایید سفارش', icon: CheckCircle2 },
];

const PROVINCES = [
  'تهران',
  'اصفهان',
  'فارس',
  'خراسان رضوی',
  'آذربایجان شرقی',
  'البرز',
  'گیلان',
  'مازندران',
  'یزد',
  'کرمان',
];

const SHIPPING_METHODS = [
  { id: 'post', title: 'پست پیشتاز', text: 'تحویل ۲ تا ۴ روز کاری', price: 45000 },
  { id: 'courier', title: 'پیک تهران', text: 'تحویل در همان روز', price: 89000 },
  { id: 'pickup', title: 'تحویل حضوری', text: 'دریافت از فروشگاه', price: 0 },
];

const PAYMENT_METHODS: Array<{ id: PaymentMethod; title: string; text: string }> = [
  { id: 'online', title: 'پرداخت آنلاین', text: 'درگاه امن بانکی، همه کارت‌های عضو شتاب' },
  { id: 'wallet', title: 'کیف پول', text: 'پرداخت از موجودی کیف پول شما' },
  { id: 'installment', title: 'پرداخت اعتباری', text: 'خرید اعتباری تا ۴ قسط بدون بهره' },
  { id: 'cod', title: 'پرداخت در محل', text: 'پرداخت هنگام تحویل کالا' },
];

type Form = {
  firstName: string;
  lastName: string;
  mobile: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
  note: string;
};

const EMPTY_FORM: Form = {
  firstName: '',
  lastName: '',
  mobile: '',
  province: PROVINCES[0],
  city: '',
  address: '',
  postalCode: '',
  note: '',
};

const fieldClass =
  'h-12 w-full rounded-xl border border-line bg-white px-4 text-[13px] text-ink outline-none transition-colors focus:border-teal-400';

export default function CheckoutPage() {
  const {
    lines,
    subtotal,
    discountTotal,
    total,
    due,
    couponDiscount,
    coinDiscount,
    settleOrder,
    clearCart,
  } = useStore();
  const { addOrder, updateOrderStatus, addresses, user } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [shipMethod, setShipMethod] = useState('post');
  const [payMethod, setPayMethod] = useState('online');
  const [placed, setPlaced] = useState<string | null>(null);
  const [placedRef, setPlacedRef] = useState<string | undefined>(undefined);
  const [earned, setEarned] = useState(0);
  const [payError, setPayError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [pickedAddress, setPickedAddress] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentOutcome = searchParams.get('payment');
  const returnedOrderId = searchParams.get('order');
  // A gateway returns the shopper through the query string, so read what it recorded.
  const returned = useMemo(
    () => (returnedOrderId ? readPayment(returnedOrderId) : null),
    [returnedOrderId],
  );

  // A gateway that verifies on its server (Zarinpal) sends the shopper back with the
  // outcome in the query string, and this is where the ledger, the coins and the basket
  // are settled. The stand-in gateway has already written its record by then, so the guard
  // on `pending` keeps this to exactly one settlement.
  useEffect(() => {
    if (!returned || returned.status !== 'pending') return;
    if (paymentOutcome !== 'paid' && paymentOutcome !== 'failed' && paymentOutcome !== 'canceled') {
      return;
    }
    const coinsEarned = paymentOutcome === 'paid' ? settleOrder(returned.amount) : 0;
    savePayment({
      ...returned,
      status: paymentOutcome,
      refId: searchParams.get('ref') ?? returned.refId,
      paidAt: paymentOutcome === 'paid' ? new Date().toISOString() : undefined,
      coinsEarned,
    });
    updateOrderStatus(returned.id, STATUS_LABEL[paymentOutcome]);
    if (paymentOutcome === 'paid') {
      clearCart();
      setPlacedRef(searchParams.get('ref') ?? undefined);
      setEarned(coinsEarned);
      setPlaced(returned.id);
      // A gateway that verifies on its own server sends the shopper back here, so this is where the
      // paid order reaches the shop's backend — once, on the same guard that settles the ledger.
      recordFinishedOrder(
        {
          ...returned,
          status: 'paid',
          refId: searchParams.get('ref') ?? returned.refId,
          paidAt: new Date().toISOString(),
        },
        'paid',
        user?.email,
      );
    }
  }, [returned, paymentOutcome, searchParams, settleOrder, clearCart, updateOrderStatus, user]);

  const shippingCost = useMemo(() => {
    const method = SHIPPING_METHODS.find((m) => m.id === shipMethod);
    if (!method) return 0;
    return total >= FREE_SHIPPING_THRESHOLD ? 0 : method.price;
  }, [shipMethod, total]);

  // Fills the shipping form from an address saved in the account panel, so a returning
  // shopper only has to tap once. Addresses carry no province, so that field is left alone.
  const applyAddress = (address: Address) => {
    const [first, ...rest] = address.receiver.trim().split(/\s+/);
    setForm((prev) => ({
      ...prev,
      firstName: first ?? '',
      lastName: rest.join(' '),
      mobile: address.mobile,
      city: address.city,
      address: address.line,
      postalCode: address.postalCode,
    }));
    setErrors({});
    setPickedAddress(address.id);
  };

  const validate = () => {
    const next: Partial<Record<keyof Form, string>> = {};
    if (!form.firstName.trim()) next.firstName = 'نام را وارد کنید';
    if (!form.lastName.trim()) next.lastName = 'نام خانوادگی را وارد کنید';
    if (!/^09\d{9}$/.test(form.mobile.trim())) next.mobile = 'شماره موبایل را به شکل ۰۹xxxxxxxxx وارد کنید';
    if (!form.city.trim()) next.city = 'شهر را وارد کنید';
    if (form.address.trim().length < 10) next.address = 'نشانی کامل را وارد کنید';
    if (!/^\d{10}$/.test(form.postalCode.trim())) next.postalCode = 'کد پستی باید ۱۰ رقم باشد';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goNext = () => {
    if (step === 1 && !validate()) return;
    setStep((s) => Math.min(s + 1, 4));
  };

  const placeOrder = async () => {
    const orderNumber = newOrderId();
    const amount = due + shippingCost;
    const method = PAYMENT_METHODS.find((m) => m.id === payMethod);
    const shippingMethod = SHIPPING_METHODS.find((m) => m.id === shipMethod);
    if (!method || !shippingMethod) return;

    const orderLines: PaymentLine[] = lines.map((line) => ({
      name: line.product.name,
      // The catalogue's own id and what was picked: the shop's backend re-prices the line from its
      // own catalogue, and `slug` is what lets it find the product at all.
      slug: line.productId,
      size: line.size,
      color: line.color,
      qty: line.qty,
      price: line.product.price,
    }));

    // One record whichever way the order is paid: the gateway path stores it now and settles it on
    // the way back, the offline path settles it here.
    const record: PaymentOrder = {
      id: orderNumber,
      amount,
      method: method.id,
      methodTitle: method.title,
      status: 'pending',
      createdAt: new Date().toISOString(),
      customer: {
        name: `${form.firstName} ${form.lastName}`.trim(),
        mobile: form.mobile,
        province: form.province,
        city: form.city,
        address: form.address,
        postalCode: form.postalCode,
        note: form.note || undefined,
      },
      shipping: { id: shippingMethod.id, title: shippingMethod.title, cost: shippingCost },
      lines: orderLines,
    };

    if (payMethod === 'online') {
      // Online payment leaves the site for the gateway: the order is registered here as
      // awaiting payment, and the basket only empties once the money is confirmed.
      savePayment(record);
      addOrder({ id: orderNumber, total: amount, status: STATUS_LABEL.pending, lines: orderLines });
      setPayError(null);
      setRedirecting(true);
      try {
        // Zarinpal answers with a URL of its own; the stand-in gateway stays in the app.
        navigate(await activeGateway.handoff(record));
      } catch (error) {
        // The order stays registered as awaiting payment, so a retry loses nothing.
        setRedirecting(false);
        setPayError(error instanceof Error ? error.message : 'اتصال به درگاه پرداخت ممکن نشد.');
      }
      return;
    }

    // Coins are settled while the basket still holds this order's numbers.
    const coinsEarned = settleOrder(amount);
    // Signed-in shoppers keep the order in their account panel...
    addOrder({ id: orderNumber, total: amount, status: STATUS_LABEL.paid, lines: orderLines });
    // ...and the shop's own panel lists orders from the backend, so it is recorded there as well.
    // Paying at the door leaves the money uncollected, which is what the panel should show.
    recordFinishedOrder(
      { ...record, status: 'paid', paidAt: new Date().toISOString() },
      payMethod === 'cod' ? 'pending' : 'paid',
      user?.email,
    );
    setEarned(coinsEarned);
    setPlaced(orderNumber);
    clearCart();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const done = placed
    ? { id: placed, refId: placedRef, earned }
    : returned?.status === 'paid'
      ? { id: returned.id, refId: returned.refId, earned: returned.coinsEarned ?? 0 }
      : null;

  if (done) {
    return (
      <div className="container py-12 sm:py-20">
        <Reveal className="mx-auto max-w-xl rounded-panel border border-line bg-cream p-8 text-center sm:p-12">
          <span className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white text-black shadow-soft">
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <h1 className="text-xl font-black text-ink sm:text-2xl">سفارش شما ثبت شد</h1>
          <p className="mt-4 text-[13px] leading-7 text-muted sm:text-sm">
            شماره پیگیری سفارش شما{' '}
            <span dir="ltr" className="font-bold text-black">
              {done.id}
            </span>{' '}
            است. همکاران ما تا ساعتی دیگر برای هماهنگی ارسال با شما تماس می‌گیرند.
          </p>
          {done.refId ? (
            <p className="mt-3 text-[12px] text-muted">
              کد پیگیری پرداخت:{' '}
              <span dir="ltr" className="font-bold text-black">
                {toFa(done.refId)}
              </span>
            </p>
          ) : null}
          {done.earned > 0 ? (
            <p className="mx-auto mt-5 flex max-w-sm items-center justify-center gap-2 rounded-xl bg-teal-50 px-4 py-3 text-[12px] font-medium leading-6 text-black">
              <Coins className="h-4 w-4 shrink-0" />
              {toFa(done.earned)} {COIN_TITLE} بابت این خرید به موجودی شما اضافه شد.
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/shop"
              className="inline-flex h-12 items-center rounded-xl bg-teal-800 px-6 text-sm font-bold text-white transition-colors hover:bg-teal-700"
            >
              ادامه خرید
            </Link>
            <Link
              to="/"
              className="inline-flex h-12 items-center rounded-xl border border-teal-800/20 px-6 text-sm font-medium text-black transition-colors hover:bg-white"
            >
              بازگشت به صفحه اصلی
            </Link>
          </div>
        </Reveal>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="container py-10 sm:py-16">
        <h1 className="mb-6 text-xl font-bold text-ink sm:text-2xl">تکمیل خرید</h1>
        <EmptyState
          icon={<ShoppingBag className="h-7 w-7" />}
          title="برای تکمیل خرید، ابتدا کالایی انتخاب کنید"
          text="سبد خرید شما خالی است. از فروشگاه، محصول مورد نظرتان را اضافه کنید."
          action={
            <Link
              to="/shop"
              className="inline-flex h-11 items-center rounded-xl bg-teal-800 px-5 text-sm font-medium text-white transition-colors hover:bg-teal-700"
            >
              مشاهده محصولات
            </Link>
          }
        />
      </div>
    );
  }

  const input = (name: keyof Form, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={name} className="mb-2 block text-[13px] font-medium text-ink">
        {label}
      </label>
      <input
        id={name}
        value={form[name]}
        onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
        className={`${fieldClass} ${errors[name] ? 'border-sale' : ''}`}
        {...props}
      />
      {errors[name] ? <p className="mt-1.5 text-[11px] text-sale">{errors[name]}</p> : null}
    </div>
  );

  return (
    <div className="container py-8 sm:py-10">
      <nav aria-label="مسیر صفحه" className="mb-5 flex items-center gap-1.5 text-[12px] text-muted">
        <Link to="/" className="transition-colors hover:text-black">
          خانه
        </Link>
        <span>/</span>
        <Link to="/cart" className="transition-colors hover:text-black">
          سبد خرید
        </Link>
        <span>/</span>
        <span className="font-medium text-ink">تکمیل خرید</span>
      </nav>

      <h1 className="mb-7 text-xl font-bold text-ink sm:text-2xl">تکمیل خرید</h1>

      {paymentOutcome === 'failed' || paymentOutcome === 'canceled' ? (
        <div className="mb-6 flex items-start gap-3 rounded-panel border border-line bg-cream p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-sale" />
          <p className="text-[13px] leading-6 text-ink">
            {paymentOutcome === 'canceled' ? 'پرداخت لغو شد' : 'پرداخت ناموفق بود'} و مبلغی از
            حساب شما کسر نشد. سبد خریدتان دست‌نخورده باقی مانده است؛ می‌توانید دوباره تلاش کنید.
          </p>
        </div>
      ) : null}

      {payError ? (
        <div className="mb-6 flex items-start gap-3 rounded-panel border border-line bg-cream p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-sale" />
          <p className="text-[13px] leading-6 text-ink">{payError}</p>
        </div>
      ) : null}

      {/* Stepper */}
      <ol className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STEPS.map((item) => {
          const Icon = item.icon;
          const state = item.id < step ? 'done' : item.id === step ? 'active' : 'idle';
          return (
            <li
              key={item.id}
              className={`flex items-center gap-2.5 rounded-panel border p-3.5 transition-colors ${
                state === 'active'
                  ? 'border-teal-800 bg-teal-50'
                  : state === 'done'
                    ? 'border-teal-200 bg-white'
                    : 'border-line bg-white'
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[13px] font-bold ${
                  state === 'idle' ? 'bg-cream text-muted' : 'bg-teal-800 text-white'
                }`}
              >
                {state === 'done' ? <CheckCircle2 className="h-4 w-4" /> : toFa(item.id)}
              </span>
              <span className="min-w-0">
                <span
                  className={`block truncate text-[12px] font-bold ${
                    state === 'idle' ? 'text-muted' : 'text-ink'
                  }`}
                >
                  {item.title}
                </span>
                <Icon className="mt-1 h-3.5 w-3.5 text-black" />
              </span>
            </li>
          );
        })}
      </ol>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:gap-8">
        <div className="rounded-panel border border-line bg-white p-5 shadow-soft sm:p-7">
          {step === 1 ? (
            <div className="space-y-5">
              <h2 className="text-base font-bold text-ink">اطلاعات ارسال</h2>

              {addresses.length > 0 ? (
                <div>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-[13px] font-bold text-ink">نشانی‌های ذخیره‌شده‌ی شما</h3>
                    <span className="text-[11.5px] text-muted">
                      روی نشانی بزنید تا فرم خودکار پر شود
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {addresses.map((address) => {
                      const active = pickedAddress === address.id;
                      return (
                        <button
                          key={address.id}
                          type="button"
                          aria-pressed={active}
                          onClick={() => applyAddress(address)}
                          className={`flex items-start gap-3 rounded-panel border p-4 text-start transition-colors ${
                            active
                              ? 'border-teal-800 bg-cream'
                              : 'border-line bg-white hover:border-teal-800/40 hover:bg-cream/60'
                          }`}
                        >
                          {active ? (
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-800" />
                          ) : (
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                          )}
                          <span className="min-w-0">
                            <span className="block text-[13px] font-bold text-ink">
                              {address.title}
                            </span>
                            <span className="mt-1 block text-[12px] text-muted">
                              {address.receiver} — <span dir="ltr">{toFa(address.mobile)}</span>
                            </span>
                            <span className="mt-1 block text-[12px] leading-6 text-muted">
                              {address.city}، {address.line} — کد پستی {toFa(address.postalCode)}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div className="grid gap-5 sm:grid-cols-2">
                {input('firstName', 'نام', { placeholder: 'مثلاً سارا' })}
                {input('lastName', 'نام خانوادگی', { placeholder: 'مثلاً محمدی' })}
                {input('mobile', 'شماره موبایل', {
                  dir: 'ltr',
                  placeholder: '09xxxxxxxxx',
                  inputMode: 'numeric',
                  maxLength: 11,
                  onChange: (e) => setForm((f) => ({ ...f, mobile: onlyDigits(e.target.value) })),
                })}
                <div>
                  <label htmlFor="province" className="mb-2 block text-[13px] font-medium text-ink">
                    استان
                  </label>
                  <select
                    id="province"
                    value={form.province}
                    onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))}
                    className={fieldClass}
                  >
                    {PROVINCES.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>
                {input('city', 'شهر', { placeholder: 'مثلاً تهران' })}
                {input('postalCode', 'کد پستی', { dir: 'ltr', placeholder: '1234567890' })}
              </div>
              <div>
                <label htmlFor="address" className="mb-2 block text-[13px] font-medium text-ink">
                  نشانی کامل
                </label>
                <textarea
                  id="address"
                  rows={4}
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="خیابان، کوچه، پلاک، واحد"
                  className={`w-full rounded-xl border bg-white p-4 text-[13px] text-ink outline-none transition-colors focus:border-teal-400 ${
                    errors.address ? 'border-sale' : 'border-line'
                  }`}
                />
                {errors.address ? (
                  <p className="mt-1.5 text-[11px] text-sale">{errors.address}</p>
                ) : null}
              </div>
              <div>
                <label htmlFor="note" className="mb-2 block text-[13px] font-medium text-ink">
                  توضیحات سفارش (اختیاری)
                </label>
                <textarea
                  id="note"
                  rows={3}
                  value={form.note}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                  placeholder="زمان مناسب تحویل، توضیح درباره بسته‌بندی و…"
                  className="w-full rounded-xl border border-line bg-white p-4 text-[13px] text-ink outline-none transition-colors focus:border-teal-400"
                />
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-ink">روش ارسال</h2>
              {SHIPPING_METHODS.map((method) => (
                <label
                  key={method.id}
                  className={`flex cursor-pointer items-center justify-between gap-4 rounded-panel border p-4 transition-colors ${
                    shipMethod === method.id ? 'border-teal-800 bg-teal-50' : 'border-line hover:border-teal-300'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shipMethod === method.id}
                      onChange={() => setShipMethod(method.id)}
                      className="h-4 w-4 accent-teal-800"
                    />
                    <span>
                      <span className="block text-[14px] font-bold text-ink">{method.title}</span>
                      <span className="mt-1 block text-[12px] text-muted">{method.text}</span>
                    </span>
                  </span>
                  <span className="shrink-0 text-[13px] font-medium text-black">
                    {total >= FREE_SHIPPING_THRESHOLD || method.price === 0
                      ? 'رایگان'
                      : <Price value={method.price} />}
                  </span>
                </label>
              ))}
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-ink">روش پرداخت</h2>
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.id}
                  className={`flex cursor-pointer items-center gap-4 rounded-panel border p-4 transition-colors ${
                    payMethod === method.id ? 'border-teal-800 bg-teal-50' : 'border-line hover:border-teal-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={payMethod === method.id}
                    onChange={() => setPayMethod(method.id)}
                    className="h-4 w-4 accent-teal-800"
                  />
                  <span>
                    <span className="block text-[14px] font-bold text-ink">{method.title}</span>
                    <span className="mt-1 block text-[12px] text-muted">{method.text}</span>
                  </span>
                </label>
              ))}
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-ink">تایید سفارش</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-panel border border-line p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-[13px] font-bold text-ink">
                    <MapPin className="h-4 w-4 text-black" />
                    گیرنده
                  </h3>
                  <p className="text-[13px] leading-7 text-muted">
                    {form.firstName} {form.lastName}
                    <br />
                    {form.province}، {form.city}
                    <br />
                    {form.address}
                    <br />
                    کد پستی: {toFa(form.postalCode)}
                    <br />
                    <span dir="ltr">{toFa(form.mobile)}</span>
                  </p>
                </div>
                <div className="rounded-panel border border-line p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-[13px] font-bold text-ink">
                    <PackageCheck className="h-4 w-4 text-black" />
                    ارسال و پرداخت
                  </h3>
                  <p className="text-[13px] leading-7 text-muted">
                    {SHIPPING_METHODS.find((m) => m.id === shipMethod)?.title}
                    <br />
                    {PAYMENT_METHODS.find((m) => m.id === payMethod)?.title}
                  </p>
                </div>
              </div>

              <ul className="space-y-3">
                {lines.map((line) => (
                  <li
                    key={`${line.productId}-${line.size}-${line.color}`}
                    className="flex items-center gap-3 rounded-panel border border-line p-3"
                  >
                    <Img
                      src={line.product.images[0]}
                      alt=""
                      loading="lazy"
                      className="h-16 w-14 rounded-xl object-cover"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-ink">
                        {line.product.name}
                      </span>
                      <span className="mt-1 block text-[11px] text-muted">
                        سایز {toFa(line.size)} · {line.color} · {toFa(line.qty)} عدد
                      </span>
                    </span>
                    <span className="shrink-0 text-[13px] font-bold text-black">
                      <Price value={line.lineTotal} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(s - 1, 1))}
                className="h-12 rounded-xl border border-line px-5 text-sm font-medium text-ink transition-colors hover:border-teal-300"
              >
                مرحله قبل
              </button>
            ) : null}

            {step < 4 ? (
              <button
                type="button"
                onClick={goNext}
                className="h-12 rounded-xl bg-teal-800 px-7 text-sm font-bold text-white transition-colors hover:bg-teal-700"
              >
                مرحله بعد
              </button>
            ) : (
              <button
                type="button"
                onClick={placeOrder}
                disabled={redirecting}
                className="h-12 rounded-xl bg-teal-800 px-7 text-sm font-bold text-white transition-colors hover:bg-teal-700 disabled:opacity-60"
              >
                {redirecting ? 'در حال انتقال به درگاه…' : 'ثبت سفارش و پرداخت'}
              </button>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-panel border border-line bg-cream p-5 sm:p-6">
            <h2 className="mb-5 text-base font-bold text-ink">خلاصه سفارش</h2>

            <div className="mb-5">
              <RewardPanel />
            </div>

            <ul className="mb-5 max-h-[280px] space-y-3 overflow-y-auto pe-1">
              {lines.map((line) => (
                <li key={`${line.productId}-${line.size}-${line.color}`} className="flex items-center gap-3">
                  <Img
                    src={line.product.images[0]}
                    alt=""
                    loading="lazy"
                    className="h-14 w-12 shrink-0 rounded-xl object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-medium text-ink">
                      {line.product.name}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-muted">
                      {toFa(line.qty)} × سایز {toFa(line.size)}
                    </span>
                  </span>
                  <span className="shrink-0 text-[12px] font-bold text-black">
                    <Price value={line.lineTotal} />
                  </span>
                </li>
              ))}
            </ul>

            <dl className="space-y-3 border-t border-line pt-4 text-[13px]">
              <div className="flex items-center justify-between text-muted">
                <dt>جمع کالاها</dt>
                <dd className="text-ink"><Price value={subtotal} /></dd>
              </div>
              {discountTotal > 0 ? (
                <div className="flex items-center justify-between text-sale">
                  <dt>تخفیف</dt>
                  <dd><Price value={discountTotal} />−</dd>
                </div>
              ) : null}
              {couponDiscount > 0 ? (
                <div className="flex items-center justify-between text-sale">
                  <dt>کد تخفیف</dt>
                  <dd><Price value={couponDiscount} />−</dd>
                </div>
              ) : null}
              {coinDiscount > 0 ? (
                <div className="flex items-center justify-between text-sale">
                  <dt>{COIN_TITLE}</dt>
                  <dd><Price value={coinDiscount} />−</dd>
                </div>
              ) : null}
              <div className="flex items-center justify-between text-muted">
                <dt>هزینه ارسال</dt>
                <dd className="text-ink">
                  {shippingCost === 0 ? 'رایگان' : <Price value={shippingCost} />}
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-line pt-3.5 text-[15px] font-bold text-ink">
                <dt>مبلغ قابل پرداخت</dt>
                <dd><Price value={due + shippingCost} /></dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
