import { Coins } from 'lucide-react';
import { COIN_MIN_REDEEM, COIN_PER_AMOUNT, COIN_TITLE, COIN_VALUE } from '../../lib/data';
import { useStore } from '../../context/StoreContext';
import { toFa } from '../../lib/format';
import Price from '../ui/Price';

/**
 * «مدورا کوین» balance and the rules behind it, shown in the account dashboard so a
 * shopper can see how many coins they hold and what they can spend them on.
 */
export default function CoinPanel() {
  const { coins } = useStore();
  const toGo = Math.max(0, COIN_MIN_REDEEM - coins);

  const rules = [
    <>
      با هر خرید، به ازای هر <Price value={COIN_PER_AMOUNT} /> پرداخت یک کوین می‌گیرید.
    </>,
    <>
      هر کوین معادل <Price value={COIN_VALUE} /> تخفیف روی خرید بعدی شماست.
    </>,
    <>
      برای خرج کردن، حداقل {toFa(COIN_MIN_REDEEM)} کوین لازم است؛ کلید استفاده در سبد خرید و
      تسویه حساب فعال می‌شود.
    </>,
  ];

  return (
    <div className="rounded-panel border border-line bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-bold text-ink">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-black">
            <Coins className="h-4.5 w-4.5" />
          </span>
          {COIN_TITLE}
        </h2>
        <span className="rounded-full bg-cream px-3 py-1 text-[12px] font-medium text-black">
          {toFa(coins)} کوین
        </span>
      </div>

      <p className="mt-4 text-2xl font-black text-ink">
        {toFa(coins)} <span className="text-[13px] font-medium text-muted">کوین</span>
      </p>
      <p className="mt-1.5 text-[12.5px] leading-6 text-muted">
        معادل <Price value={coins * COIN_VALUE} /> تخفیف در خرید بعدی شما.
      </p>

      <p className="mt-4 text-[12px] text-muted">
        {toGo > 0
          ? `${toFa(toGo)} کوین دیگر تا فعال شدن امکان خرج کردن کوین‌ها.`
          : 'کوین‌های شما آماده استفاده در سبد خرید است.'}
      </p>

      <ul className="mt-4 space-y-2.5 border-t border-line pt-4 text-[12.5px] leading-6 text-ink/85">
        {rules.map((rule, index) => (
          <li key={index} className="flex gap-2.5">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-800" />
            <span className="min-w-0">{rule}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
