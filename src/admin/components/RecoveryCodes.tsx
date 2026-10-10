import { useState, type ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';

/**
 * The recovery codes, shown the one time the API is willing to hand them over.
 *
 * They are stored as bcrypt hashes and consumed as they are used, so this is a view of a value the
 * server can never produce again — the operator is told exactly that, because "I'll look them up
 * later" is not an option. `children` is where the caller puts whatever comes next (entering the
 * panel, closing the card).
 */
export default function RecoveryCodes({
  codes,
  children,
}: {
  codes: string[];
  children?: ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(codes.join('\n'));
      setCopied(true);
    } catch {
      /* the codes are on screen and selectable either way */
    }
  };

  return (
    <div className="rounded-xl border border-gold/40 bg-gold/10 p-4">
      <p className="text-[13px] font-medium text-ink">کدهای بازیابی</p>
      <p className="mt-1 text-[12px] leading-6 text-muted">
        اگر دسترسی به برنامهٔ احراز هویت را از دست دادید، با هر یک از این کدها یک‌بار می‌توانید وارد
        شوید. این کدها فقط همین یک‌بار نمایش داده می‌شوند؛ آن‌ها را جای امنی نگه دارید.
      </p>

      <ul dir="ltr" className="mt-3 grid gap-1.5 sm:grid-cols-2">
        {codes.map((code) => (
          <li
            key={code}
            className="rounded-lg bg-white px-3 py-2 text-center font-mono text-[13px] tracking-wider text-ink"
          >
            {code}
          </li>
        ))}
      </ul>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void copy()}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-4 text-[12.5px] font-medium text-ink transition-colors hover:border-teal-300 hover:text-teal-800"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'کپی شد' : 'کپی همه'}
        </button>
        {children}
      </div>
    </div>
  );
}
