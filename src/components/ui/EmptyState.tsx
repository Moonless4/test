import type { ReactNode } from 'react';

type Props = {
  icon: ReactNode;
  title: string;
  text?: string;
  action?: ReactNode;
};

export default function EmptyState({ icon, title, text, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-panel border border-dashed border-line bg-cream/50 px-6 py-16 text-center">
      <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-teal-700 shadow-soft">
        {icon}
      </span>
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      {text ? <p className="mt-2 max-w-sm text-sm leading-7 text-muted">{text}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
