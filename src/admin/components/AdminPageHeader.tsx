import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

type Props = {
  title: string;
  description?: string;
  actions?: ReactNode;
  /** The list a detail page came from, so leaving is one click rather than the browser's back. */
  backTo?: { to: string; label: string };
};

/** The heading strip every admin surface opens with. */
export default function AdminPageHeader({ title, description, actions, backTo }: Props) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        {backTo ? (
          <Link
            to={backTo.to}
            className="mb-2 inline-flex items-center gap-1.5 text-[12.5px] text-muted transition-colors hover:text-teal-700"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            {backTo.label}
          </Link>
        ) : null}
        <h1 className="text-xl font-bold text-ink sm:text-2xl">{title}</h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-[13px] leading-6 text-muted">{description}</p>
        ) : null}
      </div>

      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
