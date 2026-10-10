/**
 * The tones every status pill is drawn from. Kept here so two surfaces cannot disagree about what
 * "cancelled" looks like.
 */
export type Tone = 'ok' | 'info' | 'warn' | 'danger' | 'muted';

const TONE_CLASS: Record<Tone, string> = {
  ok: 'bg-teal-50 text-teal-800 ring-teal-200',
  info: 'bg-cream text-cocoa ring-beige',
  warn: 'bg-gold/15 text-cocoa ring-gold/40',
  danger: 'bg-wine/10 text-wine ring-wine/25',
  muted: 'bg-line/60 text-muted ring-line',
};

export default function StatusPill({
  tone = 'muted',
  children,
}: {
  tone?: Tone;
  children: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-medium ring-1 ring-inset ${TONE_CLASS[tone]}`}
    >
      {children}
    </span>
  );
}
