import { formatNumber } from '../../lib/format';
import TomanIcon from './TomanIcon';

type Props = {
  value: number;
  className?: string;
};

/**
 * A Toman amount: Persian digits followed by the currency glyph, so no price in the
 * UI falls back to the plain "تومان" text.
 */
export default function Price({ value, className = '' }: Props) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span>{formatNumber(value)}</span>
      <TomanIcon />
    </span>
  );
}
