import { useId } from 'react';

/* Graphic avatar palettes — the fancy defaults a new account starts with */
export const AVATAR_STYLES = [
  { id: 'gold', label: 'طلایی', bg: ['#5e1122', '#280610'], ring: ['#f8d15c', '#b8860b'], ink: '#fdf3e2' },
  { id: 'rose', label: 'گل‌بهی', bg: ['#7f2040', '#32091a'], ring: ['#f6b3c6', '#c05a80'], ink: '#fff1f5' },
  { id: 'pistachio', label: 'پسته‌ای', bg: ['#204f3b', '#0b2119'], ring: ['#b6e0a5', '#5f9c6a'], ink: '#f2faf0' },
  { id: 'plum', label: 'ارغوانی', bg: ['#3f2366', '#180a2e'], ring: ['#cfadf7', '#8a5cd0'], ink: '#f7f0ff' },
];

export const DEFAULT_AVATAR = 'graphic:gold';

export const isGraphicAvatar = (value) =>
  typeof value === 'string' && value.startsWith('graphic:');

const styleOf = (value) => {
  const id = isGraphicAvatar(value) ? value.slice('graphic:'.length) : '';
  return AVATAR_STYLES.find((item) => item.id === id) || AVATAR_STYLES[0];
};

function GraphicAvatar({ value, className = '' }) {
  const style = styleOf(value);
  const uid = useId().replace(/:/g, '');

  return (
    <svg
      className={`avatar avatar--graphic ${className}`}
      viewBox="0 0 96 96"
      role="img"
      aria-label={`تصویر پروفایل ${style.label}`}
    >
      <defs>
        <radialGradient id={`av-bg-${uid}`} cx="50%" cy="30%" r="80%">
          <stop offset="0%" stopColor={style.bg[0]} />
          <stop offset="100%" stopColor={style.bg[1]} />
        </radialGradient>
        <linearGradient id={`av-ring-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={style.ring[0]} />
          <stop offset="55%" stopColor={style.ring[0]} stopOpacity=".75" />
          <stop offset="100%" stopColor={style.ring[1]} />
        </linearGradient>
        <radialGradient id={`av-glow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity=".26" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="48" cy="48" r="48" fill={`url(#av-bg-${uid})`} />
      <circle cx="34" cy="26" r="30" fill={`url(#av-glow-${uid})`} />

      {/* dotted halo */}
      <circle
        cx="48"
        cy="48"
        r="42.5"
        fill="none"
        stroke={style.ring[0]}
        strokeOpacity=".42"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="1 7"
      />
      <circle cx="48" cy="48" r="35" fill="none" stroke={style.ring[0]} strokeOpacity=".14" strokeWidth="1" />

      {/* sparkles */}
      <g fill={style.ring[0]}>
        <path d="M29 20.5l1.7 4.5 4.5 1.7-4.5 1.7-1.7 4.5-1.7-4.5-4.5-1.7 4.5-1.7z" opacity=".9" />
        <path d="M69 60l1.1 3 3 1.1-3 1.1-1.1 3-1.1-3-3-1.1 3-1.1z" opacity=".6" />
      </g>

      {/* chef hat emblem */}
      <g fill={style.ink}>
        <rect x="34" y="46" width="28" height="13" rx="5.5" />
        <circle cx="39.5" cy="42" r="7.6" />
        <circle cx="48" cy="37" r="9.2" />
        <circle cx="56.5" cy="42" r="7.6" />
      </g>
      <rect x="34" y="52.5" width="28" height="6" rx="3" fill={style.ring[0]} opacity=".92" />
      <path
        d="M33 70h30"
        stroke={style.ring[0]}
        strokeOpacity=".45"
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      <circle
        cx="48"
        cy="48"
        r="46.5"
        fill="none"
        stroke={`url(#av-ring-${uid})`}
        strokeWidth="3"
      />
    </svg>
  );
}

/**
 * Renders either a graphic avatar (`graphic:gold`, …) or an image
 * (a vendored asset path or an uploaded data URL).
 */
export default function Avatar({ value, name = '', className = '' }) {
  const src = value || DEFAULT_AVATAR;
  if (isGraphicAvatar(src)) return <GraphicAvatar value={src} className={className} />;
  return <img className={`avatar ${className}`} src={src} alt={name} />;
}
