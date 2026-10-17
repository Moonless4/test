import { cn, formatNumber } from '@/lib/utils';
import { faDigits } from '@/lib/jalali';

interface RangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  unit?: string;
  className?: string;
}

/** اسلایدر دو سر برای محدوده‌ی قیمت */
export function RangeSlider({
  min,
  max,
  step = 100000,
  value,
  onChange,
  unit = 'تومان',
  className,
}: RangeSliderProps) {
  const [low, high] = value;
  const lowPercent = ((low - min) / (max - min || 1)) * 100;
  const highPercent = ((high - min) / (max - min || 1)) * 100;

  return (
    <div className={cn('w-full', className)}>
      <div className="relative h-8" dir="ltr">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-ink-200" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-brand-500"
          style={{ left: `${lowPercent}%`, right: `${100 - highPercent}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={low}
          onChange={(event) => onChange([Math.min(Number(event.target.value), high - step), high])}
          aria-label="کمترین قیمت"
          className="pointer-events-none absolute inset-0 h-8 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-brand-600 [&::-webkit-slider-thumb]:shadow"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={high}
          onChange={(event) => onChange([low, Math.max(Number(event.target.value), low + step)])}
          aria-label="بیشترین قیمت"
          className="pointer-events-none absolute inset-0 h-8 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-brand-600 [&::-webkit-slider-thumb]:shadow"
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-2xs text-ink-500">
        <span className="num">
          {formatNumber(high)} {unit}
        </span>
        <span className="num">
          {formatNumber(low)} {unit}
        </span>
      </div>
      <p className="sr-only">
        از {faDigits(low)} تا {faDigits(high)}
      </p>
    </div>
  );
}

interface CheckboxRowProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  hint?: string;
  count?: number;
}

export function CheckboxRow({ checked, onChange, label, hint, count }: CheckboxRowProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-1.5">
      <span className="flex items-center gap-2.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="h-4 w-4 rounded border-ink-300 accent-brand-600"
        />
        <span className="text-sm text-ink-700">{label}</span>
        {hint && <span className="text-2xs text-ink-400">{hint}</span>}
      </span>
      {count !== undefined && <span className="num text-2xs text-ink-400">{faDigits(count)}</span>}
    </label>
  );
}
