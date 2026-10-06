import { Minus, Plus } from 'lucide-react';
import { toFa } from '../../lib/format';

type Props = {
  value: number;
  onChange: (next: number) => void;
  max?: number;
  min?: number;
  size?: 'sm' | 'md';
};

export default function QuantitySelector({
  value,
  onChange,
  max = 99,
  min = 1,
  size = 'md',
}: Props) {
  const btn =
    'flex items-center justify-center text-teal-800 transition-colors hover:bg-teal-50 disabled:opacity-40 disabled:hover:bg-transparent';
  const box = size === 'sm' ? 'h-9 w-9' : 'h-11 w-11';

  return (
    <div className="inline-flex items-center overflow-hidden rounded-xl border border-line bg-white">
      <button
        type="button"
        aria-label="افزایش تعداد"
        className={`${btn} ${box}`}
        onClick={() => onChange(Math.min(value + 1, max))}
        disabled={value >= max}
      >
        <Plus className="h-4 w-4" />
      </button>
      <span
        className={`flex ${box} items-center justify-center border-x border-line text-sm font-bold text-ink`}
        aria-live="polite"
      >
        {toFa(value)}
      </span>
      <button
        type="button"
        aria-label="کاهش تعداد"
        className={`${btn} ${box}`}
        onClick={() => onChange(Math.max(value - 1, min))}
        disabled={value <= min}
      >
        <Minus className="h-4 w-4" />
      </button>
    </div>
  );
}
