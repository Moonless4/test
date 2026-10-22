import { useId } from 'react';

/* Graphic food avatars — the fancy defaults a new account starts with */
export const AVATAR_STYLES = [
  { id: 'gold', label: 'برگر', bg: ['#5e1122', '#280610'], ring: ['#f8d15c', '#b8860b'] },
  { id: 'rose', label: 'پیتزا', bg: ['#7d1c22', '#330a0c'], ring: ['#ffc98a', '#d9743f'] },
  { id: 'pistachio', label: 'نوشیدنی', bg: ['#1d4a3b', '#0a1f18'], ring: ['#a9e0c2', '#4f9c74'] },
  { id: 'plum', label: 'دسر', bg: ['#4a1f52', '#1c0a24'], ring: ['#f0b6dd', '#c065a4'] },
];

export const DEFAULT_AVATAR = 'graphic:gold';

export const isGraphicAvatar = (value) =>
  typeof value === 'string' && value.startsWith('graphic:');

const styleOf = (value) => {
  const id = isGraphicAvatar(value) ? value.slice('graphic:'.length) : '';
  return AVATAR_STYLES.find((item) => item.id === id) || AVATAR_STYLES[0];
};

const BurgerArt = () => (
  <g>
    <ellipse cx="48" cy="71" rx="22" ry="4" fill="#000" opacity=".22" />
    <rect x="28" y="62" width="40" height="8.5" rx="4.2" fill="#eab069" />
    <rect x="25.5" y="55" width="45" height="9" rx="4.5" fill="#6b3a22" />
    <path d="M26 52h44l-5.5 8-7-5-8 6.5-7-5-6.5 3.5z" fill="#f8cf4a" />
    <path d="M25.5 51c4.5-3.5 8 2 12.5-1s8.5 3.5 13 0 8.5 3 12.5-.5 7 1.5 7 1.5v3h-45z" fill="#82c48c" />
    <path d="M25 47.5a23 16.5 0 0 1 46 0z" fill="#f6c67c" />
    <path d="M32.5 41.5a16 11 0 0 1 12-6.5" stroke="#fffaf0" strokeOpacity=".55" strokeWidth="2.4" strokeLinecap="round" fill="none" />
    <g fill="#fff8e8">
      <ellipse cx="38" cy="38" rx="2.2" ry="1.4" transform="rotate(-18 38 38)" />
      <ellipse cx="49" cy="34.5" rx="2.2" ry="1.4" transform="rotate(8 49 34.5)" />
      <ellipse cx="59" cy="39.5" rx="2.2" ry="1.4" transform="rotate(22 59 39.5)" />
    </g>
  </g>
);

const PizzaArt = () => (
  <g>
    <ellipse cx="48" cy="73" rx="17" ry="3.6" fill="#000" opacity=".22" />
    <path d="M48 72 31.5 39h33z" fill="#f7ce6f" />
    <path d="M48 66 39 45h18z" fill="#ffdf96" opacity=".75" />
    <rect x="27" y="30" width="42" height="10" rx="5" fill="#e0a459" />
    <path d="M30 36.5c4-2.5 8 1.5 12-.5s8 1.5 12-.5 8 1.5 12-.5" stroke="#c07f3a" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity=".55" />
    <g fill="#cf3b3b">
      <circle cx="41" cy="49" r="3" />
      <circle cx="55" cy="49" r="3" />
      <circle cx="48" cy="59" r="2.7" />
    </g>
    <g fill="#ffd7a1" opacity=".8">
      <circle cx="41" cy="49" r=".9" />
      <circle cx="55" cy="49" r=".9" />
      <circle cx="48" cy="59" r=".8" />
    </g>
    <path d="M45 42h12" stroke="#c07f3a" strokeOpacity=".35" strokeWidth="1.4" strokeLinecap="round" />
  </g>
);

const DrinkArt = () => (
  <g>
    <ellipse cx="48" cy="72" rx="20" ry="3.8" fill="#000" opacity=".22" />
    <g stroke="#a9e0c2" strokeOpacity=".7" strokeWidth="2.2" strokeLinecap="round" fill="none">
      <path d="M42 35c3-3.2.5-6 3-9" />
      <path d="M52.5 35c3-3.2.5-6 3-9" />
    </g>
    <path d="M64 47.5h3.5a6.5 6.5 0 0 1 0 13H63" fill="none" stroke="#f6e9d8" strokeWidth="3.4" strokeLinecap="round" />
    <path d="M32 43h32l-3 21a6 6 0 0 1-6 5.3H41a6 6 0 0 1-6-5.3z" fill="#f6e9d8" />
    <ellipse cx="48" cy="43" rx="16" ry="4.6" fill="#e6d2bd" />
    <ellipse cx="48" cy="43" rx="12.6" ry="3.3" fill="#6b3a22" />
    <path d="M48 43c-3-1.6-6-.4-6 1.4 0 1.9 3.4 2.4 6 1.2 2.6 1.2 6 .7 6-1.2 0-1.8-3-3-6-1.4z" fill="#e6c9a8" opacity=".85" />
    <path d="M36.5 49v14" stroke="#fff" strokeOpacity=".5" strokeWidth="2.2" strokeLinecap="round" />
  </g>
);

const DessertArt = () => (
  <g>
    <ellipse cx="48" cy="73" rx="17" ry="3.4" fill="#000" opacity=".22" />
    <path d="M35 52h26l-4.5 18H39.5z" fill="#e79ab3" />
    <g stroke="#fff8fb" strokeOpacity=".55" strokeWidth="1.6" strokeLinecap="round">
      <path d="M41 55.5 39.9 67" />
      <path d="M48 55v12.5" />
      <path d="M55 55.5 56.1 67" />
    </g>
    <circle cx="38.5" cy="50.5" r="7.5" fill="#f2b7cd" />
    <circle cx="57.5" cy="50.5" r="7.5" fill="#f2b7cd" />
    <circle cx="48" cy="44" r="9" fill="#fbe3ee" />
    <path d="M42 42.5a9.5 9.5 0 0 1 7-6" stroke="#fff" strokeOpacity=".8" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    <path d="M48 30c0-3.4 2.4-4.6 4.6-4.2" stroke="#7fc08a" strokeWidth="1.9" strokeLinecap="round" fill="none" />
    <circle cx="48" cy="33" r="4.3" fill="#cb0236" />
    <circle cx="46.6" cy="31.6" r="1.2" fill="#fff" opacity=".65" />
  </g>
);

const ART = {
  gold: <BurgerArt />,
  rose: <PizzaArt />,
  pistachio: <DrinkArt />,
  plum: <DessertArt />,
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

      {/* sparkles */}
      <g fill={style.ring[0]}>
        <path d="M29 20.5l1.7 4.5 4.5 1.7-4.5 1.7-1.7 4.5-1.7-4.5-4.5-1.7 4.5-1.7z" opacity=".9" />
        <path d="M69 62l1.1 3 3 1.1-3 1.1-1.1 3-1.1-3-3-1.1 3-1.1z" opacity=".6" />
      </g>

      {ART[style.id] || ART.gold}

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
