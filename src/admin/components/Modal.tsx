import type { ReactNode } from 'react';
import { X } from 'lucide-react';

type Props = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  /** `wide` is for a long form; the default suits a handful of fields. */
  size?: 'md' | 'wide';
};

/**
 * The panel's one dialog: forms and confirmations are the same shape, so a destructive action and
 * an edit never look like two different products.
 */
export default function Modal({
  open,
  title,
  description,
  children,
  footer,
  onClose,
  size = 'md',
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-teal-950/50 p-4 backdrop-blur-sm sm:items-center">
      {/* Clicking the backdrop closes; the panel itself stops the event so a stray click inside
          a form never throws the operator's typing away. */}
      <button
        type="button"
        aria-label="بستن"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative z-10 my-6 w-full animate-fade-up rounded-panel bg-white shadow-lift ${
          size === 'wide' ? 'max-w-3xl' : 'max-w-xl'
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-base font-bold text-ink sm:text-lg">{title}</h2>
            {description ? <p className="mt-1 text-[12.5px] text-muted">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted transition-colors hover:bg-cream hover:text-ink"
            aria-label="بستن"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-5 sm:px-6">{children}</div>

        {footer ? (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-5 py-4 sm:px-6">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
