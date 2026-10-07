import { ShoppingBag } from 'lucide-react';
import Price from '../ui/Price';

type Props = {
  price: number;
  /** The page's own add-to-cart handler, so the chosen size, colour and quantity carry over. */
  onAdd: () => void;
};

/**
 * Phone and tablet sticky bar for a product page: the price and the add-to-cart action, in
 * place of the usual bottom tab bar. Hides at the same `2xl` cutoff as the tab bar.
 */
export default function ProductActionBar({ price, onAdd }: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-[max(10px,env(safe-area-inset-bottom))] 2xl:hidden">
      <div className="mx-auto flex h-[62px] w-full max-w-[430px] items-center justify-between gap-3 rounded-[26px] bg-white px-2.5 shadow-lift ring-1 ring-line">
        {/* First child renders on the right in RTL: the action, then the price. */}
        <button
          type="button"
          onClick={onAdd}
          className="flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-teal-800 px-5 text-[13px] font-bold text-white transition-colors hover:bg-teal-700"
        >
          <ShoppingBag className="h-4 w-4" />
          افزودن به سبد خرید
        </button>

        <Price value={price} className="shrink-0 text-sm font-bold text-ink" />
      </div>
    </div>
  );
}
