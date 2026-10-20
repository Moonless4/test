import { ArrowLeft } from 'lucide-react'

export default function SectionHeading({ title, action, actionHref = '#menu' }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4 md:mb-10">
      <div>
        <span className="mb-2 flex items-center gap-2 text-xs font-medium text-brand md:text-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          رستوران نوال
        </span>
        <h2 className="text-[21px] font-extrabold text-ink md:text-[30px]">{title}</h2>
        <span className="mt-3 block h-1 w-14 rounded-full bg-brand" />
      </div>

      {action && (
        <a
          href={actionHref}
          className="mb-1 inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-ink-soft transition hover:text-brand md:text-sm"
        >
          {action}
          <ArrowLeft size={15} />
        </a>
      )}
    </div>
  )
}
