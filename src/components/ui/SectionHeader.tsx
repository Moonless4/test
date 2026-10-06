import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Reveal from './Reveal';

type Props = {
  title: string;
  eyebrow?: string;
  linkLabel?: string;
  linkTo?: string;
  className?: string;
};

export default function SectionHeader({
  title,
  eyebrow,
  linkLabel = 'مشاهده همه',
  linkTo,
  className = '',
}: Props) {
  return (
    <Reveal className={`mb-6 flex items-end justify-between gap-4 sm:mb-8 ${className}`}>
      <div className="min-w-0">
        {eyebrow ? (
          <span className="mb-2 block text-xs font-medium tracking-wide text-teal-500 sm:text-[13px]">
            {eyebrow}
          </span>
        ) : null}
        <h2 className="text-xl font-bold text-ink sm:text-2xl lg:text-[28px]">{title}</h2>
        <span className="mt-3 block h-1 w-12 rounded-full bg-teal-800" />
      </div>

      {linkTo ? (
        <Link
          to={linkTo}
          className="group flex shrink-0 items-center gap-1 pb-1 text-[13px] font-medium text-teal-700 transition-colors hover:text-teal-900 sm:text-sm"
        >
          {linkLabel}
          <ChevronLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
        </Link>
      ) : null}
    </Reveal>
  );
}
