import type { ReactNode } from 'react';

/**
 * مجموعه‌ی آیکون‌های خطی پلتفرم (بدون وابستگی بیرونی).
 * همه‌ی آیکون‌ها در قالب ۲۴×۲۴ و با رنگ جاری رندر می‌شوند.
 */
const ICONS: Record<string, ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6" />
    </>
  ),
  close: (
    <>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </>
  ),
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  'chevron-up': <path d="m6 15 6-6 6 6" />,
  'chevron-left': <path d="m15 6-6 6 6 6" />,
  'chevron-right': <path d="m9 6 6 6-6 6" />,
  'arrow-left': (
    <>
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </>
  ),
  'arrow-right': (
    <>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  minus: <path d="M5 12h14" />,
  check: <path d="m5 13 4 4L19 7" />,
  menu: (
    <>
      <path d="M3 6h18" />
      <path d="M3 12h18" />
      <path d="M3 18h18" />
    </>
  ),
  filter: (
    <>
      <path d="M3 5h18" />
      <path d="M6 12h12" />
      <path d="M10 19h4" />
    </>
  ),
  sort: (
    <>
      <path d="M7 4v16" />
      <path d="m3 8 4-4 4 4" />
      <path d="M17 20V4" />
      <path d="m21 16-4 4-4-4" />
    </>
  ),
  sliders: (
    <>
      <path d="M4 6h10" />
      <path d="M18 6h2" />
      <circle cx="16" cy="6" r="2" />
      <path d="M4 12h4" />
      <path d="M12 12h8" />
      <circle cx="10" cy="12" r="2" />
      <path d="M4 18h10" />
      <path d="M18 18h2" />
      <circle cx="16" cy="18" r="2" />
    </>
  ),
  refresh: (
    <>
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <path d="M21 4v5h-5" />
    </>
  ),
  swap: (
    <>
      <path d="M6 8h13" />
      <path d="m16 5 3 3-3 3" />
      <path d="M18 16H5" />
      <path d="m8 13-3 3 3 3" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M3.5 10h17" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 19a6.5 6.5 0 0 1 13 0" />
      <path d="M16 5.2a3.5 3.5 0 0 1 0 6.6" />
      <path d="M17.5 19h4a6 6 0 0 0-4-5.7" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.8" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5" />
      <path d="M12 7.8h.01" />
    </>
  ),
  alert: (
    <>
      <path d="M10.3 4.3 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9.5V14" />
      <path d="M12 17.2h.01" />
    </>
  ),
  star: <path d="m12 4 2.4 5 5.6.8-4 3.8 1 5.4-5-2.7-5 2.7 1-5.4-4-3.8 5.6-.8Z" />,
  heart: <path d="M12 19s-7-4.3-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 4.7-7 9-7 9Z" />,
  eye: (
    <>
      <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </>
  ),
  'credit-card': (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2.5" />
      <path d="M2.5 10h19" />
      <path d="M6.5 14.5h3" />
    </>
  ),
  tag: (
    <>
      <path d="M20.5 12.5 12 21l-8.5-8.5V4.5h8z" />
      <circle cx="8.5" cy="8.5" r="1.4" />
    </>
  ),
  percent: (
    <>
      <path d="M19 5 5 19" />
      <circle cx="7.5" cy="7.5" r="2.5" />
      <circle cx="16.5" cy="16.5" r="2.5" />
    </>
  ),
  bolt: <path d="M13.5 3 5 13h5l-1 8 9-10.5h-5.2Z" />,
  plane: (
    <>
      <path d="M21 3 10.8 13.2" />
      <path d="M21 3l-6.3 18-3.9-7.8L3 9.3 21 3Z" />
    </>
  ),
  hotel: (
    <>
      <path d="M3.5 20V6.5A1.5 1.5 0 0 1 5 5h9a1.5 1.5 0 0 1 1.5 1.5V20" />
      <path d="M15.5 10h3.5A1.5 1.5 0 0 1 20.5 11.5V20" />
      <path d="M2.5 20h19" />
      <path d="M7 8.5h2M7 12h2M11 8.5h2M11 12h2" />
    </>
  ),
  bed: (
    <>
      <path d="M3 18v-8" />
      <path d="M3 13h18v5" />
      <path d="M21 13v-2.5A2.5 2.5 0 0 0 18.5 8H11v5" />
      <circle cx="7" cy="10.5" r="1.6" />
    </>
  ),
  train: (
    <>
      <rect x="5" y="3.5" width="14" height="13" rx="3" />
      <path d="M5 11h14" />
      <path d="M9 20l1.5-3.5M15 20l-1.5-3.5" />
      <path d="M3.5 20h17" />
      <path d="M9.5 7.5h5" />
    </>
  ),
  bus: (
    <>
      <rect x="3.5" y="4" width="17" height="13" rx="2.5" />
      <path d="M3.5 11h17" />
      <path d="M7 8h3M14 8h3" />
      <path d="M7 20v-3M17 20v-3" />
      <path d="M2.5 20h19" />
    </>
  ),
  villa: (
    <>
      <path d="M3.5 11 12 4.5 20.5 11" />
      <path d="M5.5 9.8V20h13V9.8" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m15.5 8.5-2 5-5 2 2-5Z" />
    </>
  ),
  passport: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2.5" />
      <circle cx="12" cy="11" r="3" />
      <path d="M8.5 17.5h7" />
    </>
  ),
  shield: <path d="M12 3.5 19 6v5.5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6Z" />,
  'shield-check': (
    <>
      <path d="M12 3.5 19 6v5.5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  sim: (
    <>
      <path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 7 20V4a.5.5 0 0 1 .5-.5Z" />
      <rect x="9.5" y="11" width="5" height="6" rx="1" />
    </>
  ),
  vip: (
    <>
      <path d="M3.5 8.5 7 14l5-8 5 8 3.5-5.5-1.5 11H5Z" />
      <path d="M5 20.5h14" />
    </>
  ),
  map: (
    <>
      <path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6Z" />
      <path d="M9 4v14M15 6v14" />
    </>
  ),
  'map-pin': (
    <>
      <path d="M12 21s6.5-6 6.5-11a6.5 6.5 0 0 0-13 0C5.5 15 12 21 12 21Z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  grid: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </>
  ),
  car: (
    <>
      <path d="M4 16v-3.2L6 8h12l2 4.8V16" />
      <path d="M3 16h18" />
      <circle cx="7.5" cy="17.5" r="1.7" />
      <circle cx="16.5" cy="17.5" r="1.7" />
      <path d="M7 12h10" />
    </>
  ),
  wallet: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="2.5" />
      <path d="M3 10h18" />
      <circle cx="16.5" cy="14.5" r="1.2" />
    </>
  ),
  suitcase: (
    <>
      <rect x="3.5" y="7" width="17" height="12.5" rx="2" />
      <path d="M9 7V4.5h6V7" />
      <path d="M3.5 12h17" />
    </>
  ),
  ticket: (
    <>
      <path d="M3.5 8.5A2.5 2.5 0 0 1 6 6h12a2.5 2.5 0 0 1 2.5 2.5v1a2.5 2.5 0 0 0 0 5v1A2.5 2.5 0 0 1 18 18H6a2.5 2.5 0 0 1-2.5-2.5v-1a2.5 2.5 0 0 0 0-5Z" />
      <path d="M12 8.5v7" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.4 2.4 3.6 5.4 3.6 8.5S14.4 18.1 12 20.5c-2.4-2.4-3.6-5.4-3.6-8.5S9.6 5.9 12 3.5Z" />
    </>
  ),
  support: (
    <>
      <path d="M4 13a8 8 0 0 1 16 0" />
      <rect x="2.5" y="13" width="4" height="6" rx="1.5" />
      <rect x="17.5" y="13" width="4" height="6" rx="1.5" />
      <path d="M19.5 19v.5a2.5 2.5 0 0 1-2.5 2.5h-3" />
    </>
  ),
  compare: (
    <>
      <path d="M4 6h6v5H4zM14 6h6v5h-6z" />
      <path d="M7 11v3h10v-3" />
      <path d="M12 14v6" />
    </>
  ),
  refund: (
    <>
      <path d="M4 10h11a4.5 4.5 0 0 1 0 9H9" />
      <path d="m7.5 6.5-3.5 3.5 3.5 3.5" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v11" />
      <path d="m7.5 11 4.5 4.5L16.5 11" />
      <path d="M4.5 19.5h15" />
    </>
  ),
  logout: (
    <>
      <path d="M14 5.5H6.5A1.5 1.5 0 0 0 5 7v10a1.5 1.5 0 0 0 1.5 1.5H14" />
      <path d="M17 9l3 3-3 3" />
      <path d="M20 12H10" />
    </>
  ),
  phone: <path d="M6.5 3.5H9l1.5 4-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4 1.5v2.5a2 2 0 0 1-2.2 2A16 16 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5Z" />,
  mail: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="m4 8 8 5 8-5" />
    </>
  ),
  home: (
    <>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6 9.5V20h12V9.5" />
      <path d="M10.5 20v-5h3v5" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7.5" width="18" height="12" rx="2.5" />
      <path d="M9 7.5V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5v2" />
      <path d="M3 12.5h18" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2m0 13v2m8.5-8.5h-2m-13 0h-2m14-6-1.4 1.4M6 18l-1.4 1.4M18 18l1.4 1.4M6 6 4.6 4.6" transform="translate(1.4 1.4)" />
    </>
  ),
  gift: (
    <>
      <rect x="3.5" y="8.5" width="17" height="11.5" rx="2" />
      <path d="M3.5 13h17M12 8.5V20" />
      <path d="M12 8.5S10.5 4 8.5 4a2.2 2.2 0 0 0 0 4.5ZM12 8.5S13.5 4 15.5 4a2.2 2.2 0 0 1 0 4.5Z" />
    </>
  ),
  wifi: (
    <>
      <path d="M4 9.5a13 13 0 0 1 16 0" />
      <path d="M7 13a9 9 0 0 1 10 0" />
      <path d="M10 16.3a5 5 0 0 1 4 0" />
      <path d="M12 20h.01" />
    </>
  ),
  pool: (
    <>
      <path d="M7 4v12" />
      <path d="M7 8h9" />
      <path d="M16 4v12" />
      <path d="M3 19c1.5-1.2 3-1.2 4.5 0S10.5 20.2 12 19s3-1.2 4.5 0S19.5 20.2 21 19" />
    </>
  ),
  coffee: (
    <>
      <path d="M4 8h12v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Z" />
      <path d="M16 9.5h1.8a2.7 2.7 0 0 1 0 5.4H16" />
      <path d="M6 4v2M9.5 4v2M13 4v2" />
    </>
  ),
  gym: (
    <>
      <path d="M4 9v6M7 7v10M17 7v10M20 9v6" />
      <path d="M7 12h10" />
    </>
  ),
  spa: (
    <>
      <path d="M12 20c0-5 3.5-9 8-9 0 5-3.5 9-8 9Z" />
      <path d="M12 20C12 15 8.5 11 4 11c0 5 3.5 9 8 9Z" />
      <path d="M12 20c0-3 0-6-2-8" />
    </>
  ),
  utensils: (
    <>
      <path d="M7 3v7a2 2 0 0 0 4 0V3" />
      <path d="M9 12v9" />
      <path d="M16 3c-1.4 1-2 2.6-2 4.5S14.6 11 16 12v9" />
    </>
  ),
  umbrella: (
    <>
      <path d="M3.5 12a8.5 8.5 0 0 1 17 0Z" />
      <path d="M12 12v6a2.5 2.5 0 0 0 5 0" />
    </>
  ),
  presentation: (
    <>
      <rect x="3" y="5" width="18" height="11" rx="2" />
      <path d="M12 16v4M8.5 20h7" />
      <path d="M7.5 12.5 11 9l2.5 2.5L16.5 8" />
    </>
  ),
  smile: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.5 14a4 4 0 0 0 7 0" />
      <path d="M9.5 9.5h.01M14.5 9.5h.01" />
    </>
  ),
  paw: (
    <>
      <circle cx="7.5" cy="9" r="1.8" />
      <circle cx="11" cy="6.5" r="1.8" />
      <circle cx="15.5" cy="7.5" r="1.8" />
      <path d="M8 15.5c0-2 1.8-3.5 4-3.5s4 1.5 4 3.5-1.8 4-4 4-4-2-4-4Z" />
    </>
  ),
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M16.8 7.3h.01" />
    </>
  ),
  telegram: <path d="M21 4.5 2.8 11.2l5 1.6L19 6.5l-8.4 8.7.3 4.6 2.6-3.4 4.4 3.2Z" />,
  linkedin: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
      <path d="M8 10.5V16M8 7.8h.01M12 16v-3.2a2 2 0 0 1 4 0V16" />
    </>
  ),
  youtube: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="4" />
      <path d="m11 9.5 4 2.5-4 2.5Z" />
    </>
  ),
  apple: (
    <>
      <path d="M16 12.8c0-2.2 1.8-3.2 1.9-3.3-1-1.5-2.6-1.7-3.2-1.7-1.4-.1-2.7.8-3.3.8s-1.7-.8-2.9-.8c-1.5 0-2.9.9-3.7 2.2-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.7 2.3 2.9 2.2 1.2 0 1.6-.7 3-.7s1.8.7 3 .7 2-1.1 2.8-2.2c.6-.9.9-1.4 1.3-2.4-2.4-.9-2.9-3.9-2.9-3.8Z" />
      <path d="M13.7 5.6c.6-.7 1-1.7.9-2.6-.9.1-1.9.6-2.5 1.3-.6.6-1 1.6-.9 2.5 1 .1 2-.5 2.5-1.2Z" />
    </>
  ),
  playstore: (
    <>
      <path d="M4 3.5 15.5 12 4 20.5Z" />
      <path d="m4 3.5 10.5 6.2M4 20.5l10.5-6.2" />
      <path d="m14.5 9.7 4.3 2.3-4.3 2.3" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 4l1.8 4.7L18.5 10l-4.7 1.8L12 16.5l-1.8-4.7L5.5 10l4.7-1.3Z" />
      <path d="M18 16.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8Z" />
    </>
  ),
};

export type IconName = keyof typeof ICONS;

interface IconProps {
  name: IconName | string;
  className?: string;
  size?: number;
  strokeWidth?: number;
  filled?: boolean;
}

export function Icon({ name, className = 'h-5 w-5', size, strokeWidth = 1.6, filled }: IconProps) {
  const content = ICONS[name] ?? ICONS.info;
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      width={size}
      height={size}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {content}
    </svg>
  );
}

/** آیکون متناظر با هر یک از امکانات اقامتگاه */
export const FACILITY_ICONS: Record<string, IconName> = {
  wifi: 'wifi',
  pool: 'pool',
  breakfast: 'coffee',
  parking: 'car',
  gym: 'gym',
  spa: 'spa',
  restaurant: 'utensils',
  transfer: 'car',
  laundry: 'refresh',
  pet: 'paw',
  beach: 'umbrella',
  lounge: 'coffee',
  conference: 'presentation',
  kids: 'smile',
};
