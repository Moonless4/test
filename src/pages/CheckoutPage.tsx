import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, CreditCard, MapPin, PackageCheck, ShoppingBag, Truck } from 'lucide-react';
import { FREE_SHIPPING_THRESHOLD, useStore } from '../context/StoreContext';
import { formatPrice, toFa } from '../lib/format';
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

const PAYMENT_METHODS = [
  { id: 'online', title: 'پرداخت آنلاین', text: 'درگاه امن بانکی، همه کارت‌های عضو شتاب' },
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
  const { lines, subtotal, discountTotal, total, clearCart } = useStore();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [shipMethod, setShipMethod] = useState('post');
  const [payMethod, setPayMethod] = useState('online');
  const [placed, setPlaced] = useState<string | null>(null);

  const shippingCost = useMemo(() => {
    const method = SHIPPING_METHODS.find((m) => m.id === shipMethod);
    if (!method) return 0;
    return total >= FREE_SHIPPING_THRESHOLD ? 0 : method.price;
  }, [shipMethod, total]);

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

  const placeOrder = () => {
    const orderNumber = `ST-${Math.floor(100000 + Math.random() * 899999)}`;
    setPlaced(orderNumber);
    clearCart();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (placed) {
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
              {placed}
            </span>{' '}
            است. همکاران ما تا ساعتی دیگر برای هماهنگی ارسال با شما تماس می‌گیرند.
          </p>
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
              <div className="grid gap-5 sm:grid-cols-2">
                {input('firstName', 'نام', { placeholder: 'مثلاً سارا' })}
                {input('lastName', 'نام خانوادگی', { placeholder: 'مثلاً محمدی' })}
                {input('mobile', 'شماره موبایل', { dir: 'ltr', placeholder: '09123456789' })}
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
                      : formatPrice(method.price)}
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
                      {formatPrice(line.lineTotal)}
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
                className="h-12 rounded-xl bg-teal-800 px-7 text-sm font-bold text-white transition-colors hover:bg-teal-700"
              >
                ثبت سفارش و پرداخت
              </button>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-panel border border-line bg-cream p-5 sm:p-6">
            <h2 className="mb-5 text-base font-bold text-ink">خلاصه سفارش</h2>

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
                    {formatPrice(line.lineTotal)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="space-y-3 border-t border-line pt-4 text-[13px]">
              <div className="flex items-center justify-between text-muted">
                <dt>جمع کالاها</dt>
                <dd className="text-ink">{formatPrice(subtotal)}</dd>
              </div>
              {discountTotal > 0 ? (
                <div className="flex items-center justify-between text-sale">
                  <dt>تخفیف</dt>
                  <dd>{formatPrice(discountTotal)}−</dd>
                </div>
              ) : null}
              <div className="flex items-center justify-between text-muted">
                <dt>هزینه ارسال</dt>
                <dd className="text-ink">
                  {shippingCost === 0 ? 'رایگان' : formatPrice(shippingCost)}
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-line pt-3.5 text-[15px] font-bold text-ink">
                <dt>مبلغ قابل پرداخت</dt>
                <dd>{formatPrice(total + shippingCost)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
