import { useState, type FormEvent } from 'react';
import { BadgePercent, Coins, X } from 'lucide-react';
import { COIN_MIN_REDEEM, COIN_TITLE, COIN_VALUE } from '../../lib/data';
import { useStore } from '../../context/StoreContext';
import { toFa } from '../../lib/format';
import Price from '../ui/Price';

/**
 * Basket perks: the discount-code box and the «مدورا کوین» switch. Used by the cart
 * drawer, the cart page and the checkout summary so the three stay in step.
 */
export default function RewardPanel() {
  const {
    coupon,
    couponDiscount,
    applyCoupon,
    removeCoupon,
    coins,
    canUseCoins,
    useCoins,
    setUseCoins,
    coinCount,
    coinDiscount,
  } = useStore();
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const result = applyCoupon(draft);
    setError(result.ok ? '' : result.error ?? 'کد تخفیف معتبر نیست.');
    if (result.ok) setDraft('');
  };

  const toGo = COIN_MIN_REDEEM - coins;
  const switchOn = useCoins && canUseCoins;

  return (
    <div className="space-y-3">
      {coupon ? (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3.5 py-2.5">
          <span className="flex min-w-0 items-center gap-2 text-[12px] font-medium text-black">
            <BadgePercent className="h-4 w-4 shrink-0" />
            <span className="truncate">
              کد <span dir="ltr">{coupon.code}</span> — {coupon.label}
              {couponDiscount > 0 ? (
                <span className="ms-1">
                  (تخفیف <Price value={couponDiscount} />)
                </span>
              ) : null}
            </span>
          </span>
          <button
            type="button"
            onClick={removeCoupon}
            aria-label="حذف کد تخفیف"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white hover:text-sale"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="rounded-xl border border-line bg-white px-3.5 py-3">
          <label htmlFor="discount-code" className="mb-2 flex items-center gap-2 text-[12px] font-medium text-black">
            <BadgePercent className="h-4 w-4 shrink-0" />
            کد تخفیف
          </label>
          <div className="flex gap-2">
            <input
              id="discount-code"
              dir="ltr"
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                setError('');
              }}
              placeholder="مثلاً MEDORA10"
              className="h-10 min-w-0 flex-1 rounded-lg border border-line bg-cream px-3 text-[13px] tracking-wide text-ink outline-none transition-colors focus:border-teal-400"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              className="h-10 shrink-0 rounded-lg bg-teal-800 px-4 text-[12px] font-bold text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-45"
            >
              اعمال کد
            </button>
          </div>
          {error ? <p className="mt-2 text-[11px] text-sale">{error}</p> : null}
        </form>
      )}

      <div className="rounded-xl border border-line bg-white px-3.5 py-3">
        <div className="flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-2 text-[12px] font-medium text-black">
            <Coins className="h-4 w-4 shrink-0" />
            {COIN_TITLE}
            <span className="rounded-full bg-cream px-2 py-0.5 text-[11px]">
              {toFa(coins)} کوین
            </span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={switchOn}
            aria-label={`استفاده از ${COIN_TITLE}`}
            disabled={!canUseCoins}
            onClick={() => setUseCoins(!useCoins)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
              switchOn ? 'bg-teal-800' : 'bg-line'
            } disabled:cursor-not-allowed disabled:opacity-45`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-all ${
                switchOn ? 'start-[22px]' : 'start-0.5'
              }`}
            />
          </button>
        </div>

        {canUseCoins ? (
          switchOn && coinDiscount > 0 ? (
            <p className="mt-2 text-[11px] leading-6 text-black">
              {toFa(coinCount)} کوین (<Price value={coinDiscount} />) از این سفارش کم شد.
            </p>
          ) : (
            <p className="mt-2 text-[11px] leading-6 text-muted">
              هر کوین <Price value={COIN_VALUE} /> تخفیف است. با روشن کردن کلید، کوین‌هایتان خرج
              این سفارش می‌شود.
            </p>
          )
        ) : (
          <p className="mt-2 text-[11px] leading-6 text-muted">
            {toFa(toGo)} کوین دیگر تا فعال شدن امکان استفاده از کوین‌ها.
          </p>
        )}
      </div>
    </div>
  );
}
