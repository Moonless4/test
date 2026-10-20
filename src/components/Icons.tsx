import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export function HomeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 10.6 12 4l8 6.6" />
      <path d="M6.2 9.8V19h11.6V9.8" />
      <path d="M10 19v-4.6h4V19" />
    </svg>
  );
}

export function FolderIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 7.4A1.9 1.9 0 0 1 5.4 5.5h3.2l1.7 2h8.3a1.9 1.9 0 0 1 1.9 1.9v6.7a1.9 1.9 0 0 1-1.9 1.9H5.4a1.9 1.9 0 0 1-1.9-1.9z" />
    </svg>
  );
}

export function ArticleIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6.5 4.5h8.2l3.3 3.3v11.7H6.5z" />
      <path d="M14.5 4.6v3.4h3.4" />
      <path d="M9.2 12.4h5.6M9.2 15.6h5.6" />
    </svg>
  );
}

export function PagesIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 5.6h9.2v9.2H4.5z" />
      <path d="M8.6 18.4h10.9V7.5" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m6.5 9.5 5.5 5.4 5.5-5.4" />
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6.4 4.6h2.7l1.4 3.4-1.9 1.4a10.6 10.6 0 0 0 5 5l1.4-1.9 3.4 1.4v2.7a1.7 1.7 0 0 1-1.9 1.7c-6-.6-10.3-4.9-10.9-10.9A1.7 1.7 0 0 1 6.4 4.6z" />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8.6" r="3.4" />
      <path d="M5.4 19.4c.7-3.1 3.4-4.9 6.6-4.9s5.9 1.8 6.6 4.9" />
    </svg>
  );
}

export function CartIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4.2 5.4h2l1.9 9.1h9.4l1.7-6.6H6.9" />
      <circle cx="9.4" cy="18.4" r="1.4" />
      <circle cx="16.4" cy="18.4" r="1.4" />
    </svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M19 12H5.5" />
      <path d="m11.2 5.6-5.7 6.4 5.7 6.4" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 7.5h15M4.5 12h15M4.5 16.5h15" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5" />
    </svg>
  );
}

/** نشان برند لوکسینا — قوس‌های معماری در قاب طلایی */
export function LuxinaMark(props: IconProps) {
  return (
    <svg viewBox="0 0 44 44" fill="none" aria-hidden {...props}>
      <defs>
        <linearGradient id="luxina-gold" x1="6" y1="4" x2="38" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFD066" />
          <stop offset="0.55" stopColor="#FDB813" />
          <stop offset="1" stopColor="#E0A300" />
        </linearGradient>
      </defs>
      <path
        d="M22 3.5 38.5 12v20L22 40.5 5.5 32V12z"
        stroke="url(#luxina-gold)"
        strokeWidth="1.6"
      />
      <path
        d="M14.6 30.5V20.9c0-4.1 3.3-7.4 7.4-7.4s7.4 3.3 7.4 7.4v9.6"
        stroke="url(#luxina-gold)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M22 13.5v17" stroke="url(#luxina-gold)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/** نقش هندسی/گیاهی محو پشت تصویر معماری */
export function ArchOrnament(props: IconProps) {
  return (
    <svg viewBox="0 0 520 520" fill="none" aria-hidden {...props}>
      <g stroke="currentColor" strokeWidth="1" strokeLinecap="round">
        <circle cx="260" cy="260" r="252" opacity="0.5" />
        <circle cx="260" cy="260" r="196" opacity="0.4" />
        <circle cx="260" cy="260" r="140" opacity="0.3" />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * Math.PI) / 6;
          const x = 260 + Math.cos(a) * 252;
          const y = 260 + Math.sin(a) * 252;
          return <path key={i} d={`M260 260 L${x.toFixed(1)} ${y.toFixed(1)}`} opacity="0.12" />;
        })}
        <path
          d="M260 60c62 46 96 104 96 156 0 60-43 104-96 104s-96-44-96-104c0-52 34-110 96-156z"
          opacity="0.55"
        />
        <path
          d="M260 96c46 40 72 88 72 130 0 48-32 82-72 82s-72-34-72-82c0-42 26-90 72-130z"
          opacity="0.4"
        />
        <path d="M260 96v212" opacity="0.5" />
        <path d="M188 226c30-16 114-16 144 0" opacity="0.35" />
      </g>
    </svg>
  );
}
