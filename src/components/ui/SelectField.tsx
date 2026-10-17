import { Icon } from './Icon';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  icon?: string;
  className?: string;
  error?: boolean;
}

/** فیلد انتخابی ساده با ظاهر یکسان با بقیه‌ی فیلدهای جستجو */
export function SelectField({ label, value, options, onChange, icon, className, error }: SelectFieldProps) {
  return (
    <label className={cn('field-shell relative cursor-pointer', error && 'field-shell-error', className)}>
      {icon && <Icon name={icon} className="h-5 w-5 shrink-0 text-ink-400" />}
      <span className="min-w-0 flex-1">
        <span className="block text-2xs text-ink-500">{label}</span>
        <span className="block truncate text-sm font-medium text-ink-900">
          {options.find((option) => option.value === value)?.label ?? '—'}
        </span>
      </span>
      <Icon name="chevron-down" className="pointer-events-none h-4 w-4 shrink-0 text-ink-400" />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent text-transparent opacity-0"
        aria-label={label}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
